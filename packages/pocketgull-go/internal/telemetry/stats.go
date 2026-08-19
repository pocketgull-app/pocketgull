// Package telemetry provides biophysical signal metrics and Popperian statistical hypothesis evaluation.
package telemetry

import (
	"errors"
	"math"
)

// ErrEmptySample indicates that an empty slice was provided for statistical calculation.
var ErrEmptySample = errors.New("sample slice cannot be empty")

// MetricsResult contains calculated statistical properties for a telemetry window.
type MetricsResult struct {
	Mean               float64 `json:"mean"`
	Variance           float64 `json:"variance"`
	StdDev             float64 `json:"stdDev"`
	ZScore             float64 `json:"zScore"`
	PValueTwoTailed    float64 `json:"pValueTwoTailed"`
	RejectNullHypothesis bool   `json:"rejectNullHypothesis"`
}

// CalculateMetrics computes sample mean, variance, standard deviation, and tests against a population baseline (H0).
func CalculateMetrics(samples []float64, populationMean float64, alpha float64) (*MetricsResult, error) {
	n := len(samples)
	if n == 0 {
		return nil, ErrEmptySample
	}

	var sum float64
	for _, v := range samples {
		sum += v
	}
	mean := sum / float64(n)

	if n == 1 {
		return &MetricsResult{
			Mean:                 mean,
			Variance:             0,
			StdDev:               0,
			ZScore:               0,
			PValueTwoTailed:      1.0,
			RejectNullHypothesis: false,
		}, nil
	}

	var sumSquaredDiff float64
	for _, v := range samples {
		diff := v - mean
		sumSquaredDiff += diff * diff
	}
	variance := sumSquaredDiff / float64(n-1)
	stdDev := math.Sqrt(variance)

	// Standard error of the mean
	sem := stdDev / math.Sqrt(float64(n))
	var zScore float64
	if sem > 1e-9 {
		zScore = (mean - populationMean) / sem
	}

	// Approximate two-tailed p-value using complementary error function
	pValue := math.Erfc(math.Abs(zScore) / math.Sqrt2)

	// In Popperian epistemology, reject H0 if pValue < alpha (default alpha = 0.05)
	rejectH0 := pValue < alpha

	return &MetricsResult{
		Mean:                 mean,
		Variance:             variance,
		StdDev:               stdDev,
		ZScore:               zScore,
		PValueTwoTailed:      pValue,
		RejectNullHypothesis: rejectH0,
	}, nil
}
