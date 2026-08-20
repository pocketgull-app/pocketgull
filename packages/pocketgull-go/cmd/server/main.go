// Package main is the entrypoint for the Pocket-Gull Go high-performance telemetry & FHIR microservice.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/fhir"
	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/telemetry"
)

var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

// TelemetryRequest models incoming biophysical samples and baseline parameters.
type TelemetryRequest struct {
	Samples        []float64 `json:"samples"`
	PopulationMean float64   `json:"populationMean"`
	Alpha          float64   `json:"alpha"`
}

// SetupRoutes registers and returns the HTTP mux for the microservice.
func SetupRoutes(appVersion string) http.Handler {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"version":   appVersion,
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// FHIR R4 Bundle validation endpoint
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

	// Biophysical telemetry stats & Popperian null-hypothesis test endpoint
	mux.HandleFunc("POST /api/v1/telemetry/evaluate", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var req TelemetryRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
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

	return mux
}

func main() {
	port := flag.Int("port", 8085, "HTTP server port")
	flag.Parse()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("starting pocketgull-go sidecar",
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

	// Graceful shutdown channel
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
