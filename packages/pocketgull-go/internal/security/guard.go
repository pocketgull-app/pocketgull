// SPDX-License-Identifier: Apache-2.0
// Package security implements OFAC comprehensive sanctions enforcement (HTTP 451),
// zero-cost IP scanner blocklisting, and dynamic CSP nonce HTML injection in pure Go.
package security

import (
	"net/http"
	"strings"
	"sync"
	"time"
)

// SanctionedCountries holds OFAC Comprehensive Sanctioned Jurisdictions (Cuba, Iran, North Korea).
// Syria ('SY') lifted under E.O. 14312 / PAARSSR (Issue #432).
var SanctionedCountries = map[string]bool{
	"CU": true,
	"IR": true,
	"KP": true,
}

var maliciousProbePrefixes = []string{
	"/wp-admin", "/wp-login", "/wp-content", "/wp-includes",
	"/phpmyadmin", "/pma", "/actuator", "/xmlrpc.php",
	"/cgi-bin", "/.aws", "/.ssh", "/.git", "/.env", "/.ds_store",
}

var maliciousProbeSuffixes = []string{
	".bak", ".swp", ".sql", ".tar", ".zip",
}

// Blocklist tracks static and dynamically banned scanner IPs.
type Blocklist struct {
	mu      sync.RWMutex
	banned  map[string]time.Time
	ttl     time.Duration
	permSet map[string]bool
}

// NewBlocklist initializes the in-memory threat blocklist.
func NewBlocklist(ttl time.Duration) *Blocklist {
	return &Blocklist{
		banned: make(map[string]time.Time),
		ttl:    ttl,
		permSet: map[string]bool{
			"93.123.109.152": true,
		},
	}
}

// IsMaliciousProbe checks if a URL path matches known automated exploit sweeps in O(k) linear time.
func IsMaliciousProbe(urlPath string) bool {
	lower := strings.ToLower(urlPath)
	for _, p := range maliciousProbePrefixes {
		if strings.HasPrefix(lower, p) || strings.Contains(lower, p+"/") {
			return true
		}
	}
	for _, s := range maliciousProbeSuffixes {
		if strings.HasSuffix(lower, s) {
			return true
		}
	}
	return false
}

// IsBlocked returns true if the client IP is permanently or temporarily banned.
func (b *Blocklist) IsBlocked(ip string) bool {
	clean := strings.TrimPrefix(strings.TrimSpace(ip), "::ffff:")
	if clean == "" {
		return false
	}
	if b.permSet[clean] {
		return true
	}
	b.mu.RLock()
	exp, exists := b.banned[clean]
	b.mu.RUnlock()
	if !exists {
		return false
	}
	if time.Now().Before(exp) {
		return true
	}
	b.mu.Lock()
	delete(b.banned, clean)
	b.mu.Unlock()
	return false
}

// Ban records a temporary ban for an offending scanner IP.
func (b *Blocklist) Ban(ip string) {
	clean := strings.TrimPrefix(strings.TrimSpace(ip), "::ffff:")
	if clean == "" {
		return
	}
	b.mu.Lock()
	b.banned[clean] = time.Now().Add(b.ttl)
	b.mu.Unlock()
}

// ExtractClientIP extracts the originating client IP from X-Forwarded-For or RemoteAddr.
func ExtractClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimPrefix(strings.TrimSpace(parts[0]), "::ffff:")
	}
	addr := r.RemoteAddr
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		addr = addr[:idx]
	}
	return strings.Trim(strings.TrimPrefix(addr, "::ffff:"), "[]")
}

// IsOFACSanctioned checks X-Country-Code / CF-IPCountry / X-AppEngine-Country headers.
func IsOFACSanctioned(r *http.Request) (bool, string) {
	for _, header := range []string{"X-Country-Code", "CF-IPCountry", "X-AppEngine-Country"} {
		val := strings.ToUpper(strings.TrimSpace(r.Header.Get(header)))
		if SanctionedCountries[val] {
			return true, val
		}
	}
	return false, ""
}

// InjectCSPNonce injects the per-request cryptographic nonce into <script> and <style> tags.
func InjectCSPNonce(html string, nonce string) string {
	if nonce == "" {
		return html
	}
	withScripts := strings.ReplaceAll(html, "<script", `<script nonce="`+nonce+`"`)
	return strings.ReplaceAll(withScripts, "<style", `<style nonce="`+nonce+`"`)
}
