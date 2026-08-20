package telemetry_test

import (
	"errors"
	"math"
	"testing"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/telemetry"
)

func TestCalculateMetrics(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		samples        []float64
		popMean        float64
		alpha          float64
		wantErr        bool
		targetErr      error
		expectRejectH0 bool
	}{
		{
			name:           "empty samples",
			samples:        []float64{},
			popMean:        70.0,
			alpha:          0.05,
			wantErr:        true,
			targetErr:      telemetry.ErrEmptySample,
			expectRejectH0: false,
		},
		{
			name:           "single sample",
			samples:        []float64{72.0},
			popMean:        70.0,
			alpha:          0.05,
			wantErr:        false,
			expectRejectH0: false,
		},
		{
			name:           "baseline normal heart rate",
			samples:        []float64{70.0, 71.0, 69.5, 70.5, 70.0},
			popMean:        70.0,
			alpha:          0.05,
			wantErr:        false,
			expectRejectH0: false,
		},
		{
			name:           "significant tachycardia deviation",
			samples:        []float64{130.0, 132.0, 129.0, 131.0, 133.0},
			popMean:        70.0,
			alpha:          0.05,
			wantErr:        false,
			expectRejectH0: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			res, err := telemetry.CalculateMetrics(tt.samples, tt.popMean, tt.alpha)
			if (err != nil) != tt.wantErr {
				t.Fatalf("CalculateMetrics() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.targetErr != nil && !errors.Is(err, tt.targetErr) {
				t.Errorf("CalculateMetrics() error = %v, targetErr %v", err, tt.targetErr)
			}
			if !tt.wantErr {
				if res == nil {
					t.Fatal("expected non-nil MetricsResult on success")
				}
				if res.RejectNullHypothesis != tt.expectRejectH0 {
					t.Errorf("RejectNullHypothesis = %v, expected %v (zScore=%.2f, pValue=%.4f)",
						res.RejectNullHypothesis, tt.expectRejectH0, res.ZScore, res.PValueTwoTailed)
				}
				if math.IsNaN(res.Mean) || math.IsNaN(res.Variance) {
					t.Errorf("Unexpected NaN in results: %+v", res)
				}
			}
		})
	}
}
