// SPDX-License-Identifier: Apache-2.0
package security_test

import (
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/security"
)

func TestSecurityGuard(t *testing.T) {
	t.Parallel()

	t.Run("detects malicious scanner probes and bans IP", func(t *testing.T) {
		t.Parallel()
		bl := security.NewBlocklist(10 * time.Minute)
		if !security.IsMaliciousProbe("/.git/config") {
			t.Errorf("expected /.git/config to be flagged as malicious probe")
		}
		if !security.IsMaliciousProbe("/wp-login.php") {
			t.Errorf("expected /wp-login.php to be flagged as malicious probe")
		}
		if security.IsMaliciousProbe("/api/v1/fhir/validate") {
			t.Errorf("expected legitimate FHIR route to pass")
		}

		bl.Ban("198.51.100.42")
		if !bl.IsBlocked("198.51.100.42") {
			t.Errorf("expected banned IP to be blocked")
		}
	})

	t.Run("enforces OFAC E.O. 14312 sanctions (CU, IR, KP blocked; SY permitted)", func(t *testing.T) {
		t.Parallel()
		reqKP := httptest.NewRequest("GET", "/healthz", nil)
		reqKP.Header.Set("X-Country-Code", "KP")
		if blocked, code := security.IsOFACSanctioned(reqKP); !blocked || code != "KP" {
			t.Errorf("expected KP to be blocked under OFAC sanctions")
		}

		reqSY := httptest.NewRequest("GET", "/healthz", nil)
		reqSY.Header.Set("X-Country-Code", "SY")
		if blocked, _ := security.IsOFACSanctioned(reqSY); blocked {
			t.Errorf("expected SY (Syria) to be permitted per E.O. 14312 (#432)")
		}
	})

	t.Run("injects CSP nonce into script and style elements", func(t *testing.T) {
		t.Parallel()
		raw := `<html><head><style>body{}</style></head><body><script src="main.js"></script></body></html>`
		out := security.InjectCSPNonce(raw, "nonce123")
		if !strings.Contains(out, `<script nonce="nonce123"`) || !strings.Contains(out, `<style nonce="nonce123"`) {
			t.Errorf("expected nonce attribute injection, got %s", out)
		}
	})
}
