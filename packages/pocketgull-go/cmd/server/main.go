// SPDX-License-Identifier: Apache-2.0
// Package main is the entrypoint for the Pocket-Gull Go high-performance
// Web Edge, Clinical Triage, 3D Glyph Extrusion, Telemetry & FHIR server.
package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/clinical"
	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/fhir"
	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/glyph3d"
	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/security"
	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/telemetry"
)

var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

type contextKey string

const cspNonceKey contextKey = "csp_nonce"

// TelemetryRequest models incoming biophysical samples and baseline parameters.
type TelemetryRequest struct {
	Samples        []float64 `json:"samples"`
	PopulationMean float64   `json:"populationMean"`
	Alpha          float64   `json:"alpha"`
}

// GlyphCompileRequest models a 1000 UPM medical ligature 3D compilation request.
type GlyphCompileRequest struct {
	Symbol        string  `json:"symbol"`
	Depth         float32 `json:"depth,omitempty"`
	CurveSegments int     `json:"curveSegments,omitempty"`
	Scale         float32 `json:"scale,omitempty"`
	PartID        uint32  `json:"partId,omitempty"`
}

// Observatory125Middleware enforces Mozilla HTTP Observatory 125/100 (Grade A+) security headers,
// per-request CSPRNG CSP nonces, OFAC HTTP 451 geo-compliance, and scanner IP blocklisting
// as Middleware #1 prior to any route handling.
func Observatory125Middleware(blocklist *security.Blocklist, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nonceBytes := make([]byte, 16)
		_, _ = rand.Read(nonceBytes)
		nonce := base64.StdEncoding.EncodeToString(nonceBytes)

		h := w.Header()
		h.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		h.Set("Cross-Origin-Opener-Policy", "same-origin")
		h.Set("Cross-Origin-Resource-Policy", "same-origin")
		h.Set("Cross-Origin-Embedder-Policy", "credentialless")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		h.Set("X-Frame-Options", "SAMEORIGIN")
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Digital-Emblem", "Red Crystal (Tallinn Manual Rule 131 Medical Sanctuary)")
		h.Set("Content-Security-Policy", fmt.Sprintf("default-src 'none'; script-src 'nonce-%s' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://font.pocketgull.app; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'", nonce))

		// 1. OFAC Statutory Sanctions Gate (HTTP 451 Unavailable For Legal Reasons)
		if sanctioned, country := security.IsOFACSanctioned(r); sanctioned {
			h.Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnavailableForLegalReasons)
			_ = json.NewEncoder(w).Encode(map[string]any{
				"status":    451,
				"error":     "Unavailable For Legal Reasons (OFAC Comprehensive Sanctions)",
				"territory": country,
			})
			return
		}

		// 2. Zero-Cost Threat Scanner Blocklist & Auto-Ban
		clientIP := security.ExtractClientIP(r)
		if blocklist.IsBlocked(clientIP) {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		if security.IsMaliciousProbe(r.URL.Path) {
			blocklist.Ban(clientIP)
			w.WriteHeader(http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), cspNonceKey, nonce)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// SetupRoutes registers and returns the HTTP mux for the Go server.
func SetupRoutes(appVersion string) http.Handler {
	mux := http.NewServeMux()
	blocklist := security.NewBlocklist(24 * time.Hour)

	// 1. Health check endpoint
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"engine":    "pocketgull-go",
			"version":   appVersion,
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// 2. FHIR R4 Bundle validation & HIPAA Safe Harbor endpoint
	mux.HandleFunc("POST /api/v1/fhir/validate", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 10*1024*1024))
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{"error": "payload too large or unreadable"})
			return
		}

		if err := fhir.CheckHIPAASafeHarbor(body); err != nil {
			w.WriteHeader(http.StatusUnprocessableEntity)
			_ = json.NewEncoder(w).Encode(map[string]any{
				"valid": false,
				"error": err.Error(),
			})
			return
		}

		bundle, err := fhir.ValidateBundle(body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{
				"valid": false,
				"error": err.Error(),
			})
			return
		}

		_ = json.NewEncoder(w).Encode(map[string]any{
			"valid":        true,
			"bundleType":   bundle.Type,
			"entriesCount": len(bundle.Entry),
		})
	})

	// 3. Biophysical telemetry stats & Popperian null-hypothesis test endpoint
	mux.HandleFunc("POST /api/v1/telemetry/evaluate", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var req TelemetryRequest
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 2*1024*1024)).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{"error": "invalid request json"})
			return
		}

		if req.Alpha <= 0 {
			req.Alpha = 0.05
		}

		res, err := telemetry.CalculateMetrics(req.Samples, req.PopulationMean, req.Alpha)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{
				"error": err.Error(),
			})
			return
		}

		_ = json.NewEncoder(w).Encode(res)
	})

	// 4. 1000 UPM Direct-Curves 3D Medical Glyph Extrusion endpoint
	mux.HandleFunc("POST /api/v1/glyph3d/compile", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var req GlyphCompileRequest
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64*1024)).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{"error": "invalid request json"})
			return
		}

		mesh, err := glyph3d.CompileSymbol(req.Symbol, &glyph3d.ExtrusionOptions{
			Depth:         req.Depth,
			CurveSegments: req.CurveSegments,
			Scale:         req.Scale,
			PartID:        req.PartID,
		})
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{"error": err.Error()})
			return
		}

		_ = json.NewEncoder(w).Encode(mesh)
	})

	// 5. Deterministic Clinical Red-Flag & Five Eyes (FVEY) Triage Gate
	mux.HandleFunc("POST /api/v1/clinical/triage", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var req clinical.TriageRequest
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 256*1024)).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{"error": "invalid request json"})
			return
		}

		result := clinical.EvaluateRedFlags(req)
		_ = json.NewEncoder(w).Encode(result)
	})

	// 6. Static Angular SPA & Dynamic CSP Nonce Injection Fallback
	staticDir := os.Getenv("POCKETGULL_STATIC_DIR")
	if staticDir == "" {
		staticDir = filepath.Join("..", "..", "dist", "app", "browser")
	}

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ext := strings.ToLower(filepath.Ext(r.URL.Path))
		if ext == ".js" || ext == ".css" || ext == ".woff2" || ext == ".svg" || ext == ".png" || ext == ".ico" || ext == ".webmanifest" {
			cleanRel := filepath.Clean(strings.TrimPrefix(r.URL.Path, "/"))
			if strings.Contains(cleanRel, "..") {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			target := filepath.Join(staticDir, cleanRel)
			if info, err := os.Stat(target); err == nil && !info.IsDir() {
				http.ServeFile(w, r, target)
				return
			}
			w.WriteHeader(http.StatusNotFound)
			return
		}

		indexPath := filepath.Join(staticDir, "index.html")
		rawHTML, err := os.ReadFile(indexPath)
		if err != nil {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			nonce, _ := r.Context().Value(cspNonceKey).(string)
			fallback := security.InjectCSPNonce(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>PocketGull Go Edge</title></head><body><app-root></app-root><script>window.__PG_EDGE="go";</script></body></html>`, nonce)
			_, _ = w.Write([]byte(fallback))
			return
		}

		nonce, _ := r.Context().Value(cspNonceKey).(string)
		injected := security.InjectCSPNonce(string(rawHTML), nonce)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-cache, must-revalidate")
		_, _ = w.Write([]byte(injected))
	})

	return Observatory125Middleware(blocklist, mux)
}

func main() {
	port := flag.Int("port", 8085, "HTTP server port")
	flag.Parse()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("starting pocketgull-go edge & clinical server",
		"version", version,
		"commit", commit,
		"built", date,
		"port", *port,
	)

	handler := SetupRoutes(version)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", *port),
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	slog.Info("server listening", "addr", srv.Addr)

	<-stop
	slog.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("forced shutdown", "error", err)
		os.Exit(1)
	}

	slog.Info("server exited cleanly")
}
