"""
Vectorized H0 Null-Hypothesis Falsification & Cochrane RoB 2 Epistemology Engine.
Provides high-throughput Monte Carlo permutation tests, bootstrap confidence intervals,
and quantitative Cochrane Risk of Bias (RoB 2) evidence discount factoring.
"""
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
from pydantic import BaseModel, Field


class CochraneBiasProfile(BaseModel):
    """Cochrane RoB 2 Risk of Bias Assessment across 5 statutory domains."""
    randomization_bias: float = Field(0.0, ge=0.0, le=1.0, description="Risk of bias arising from the randomization process")
    deviation_bias: float = Field(0.0, ge=0.0, le=1.0, description="Risk of bias due to deviations from intended interventions")
    missing_data_bias: float = Field(0.0, ge=0.0, le=1.0, description="Risk of bias due to missing outcome data (attrition)")
    measurement_bias: float = Field(0.0, ge=0.0, le=1.0, description="Risk of bias in measurement of the outcome")
    selective_reporting_bias: float = Field(0.0, ge=0.0, le=1.0, description="Risk of bias in selection of the reported result")


class FalsificationRequest(BaseModel):
    """Payload for empirical falsification testing of clinical metrics or trial cohorts."""
    claim_id: str = Field(..., description="Unique claim or study identifier")
    treatment_samples: List[float] = Field(..., description="Observed treatment / intervention biomarker samples")
    control_samples: Optional[List[float]] = Field(default=None, description="Baseline / control cohort samples (if 2-sample test)")
    null_mean: float = Field(0.0, description="Hypothesized null-hypothesis effect size H0")
    alpha: float = Field(0.05, ge=0.001, le=0.20, description="Statutory significance threshold alpha (default 0.05)")
    n_permutations: int = Field(10000, ge=1000, le=100000, description="Number of Monte Carlo permutation iterations")
    cochrane_bias: Optional[CochraneBiasProfile] = Field(default=None, description="Optional Cochrane RoB 2 bias profile")


class FalsificationResult(BaseModel):
    """Result of Popperian H0 falsification and empirical p-value analysis."""
    claim_id: str
    observed_mean_diff: float
    discounted_effect_size: float
    empirical_p_value: float
    ci_lower: float
    ci_upper: float
    sample_size_treatment: int
    sample_size_control: int
    is_statistically_significant: bool
    h0_verdict: str  # "REJECT_NULL" | "FAIL_TO_REJECT_NULL (UNDERPOWERED / SKEPTICAL WARNING)"
    cochrane_discount_factor: float
    skeptical_warning: Optional[str] = None
    execution_time_ms: float


class FalsificationEngine:
    """High-throughput Monte Carlo permutation and hypothesis falsification engine."""

    def __init__(self, random_seed: int = 42):
        self.rng = np.random.RandomState(random_seed)

    def calculate_cochrane_discount(self, bias: Optional[CochraneBiasProfile]) -> float:
        """
        Computes the evidence retention factor (1.0 = pristine RCT, 0.2 = highly confounded).
        Discounts observed effect based on weighted Cochrane RoB 2 domain penalties.
        """
        if bias is None:
            return 1.0

        weights = {
            "randomization": 0.25,
            "deviation": 0.20,
            "missing_data": 0.20,
            "measurement": 0.20,
            "selective_reporting": 0.15,
        }

        total_penalty = (
            bias.randomization_bias * weights["randomization"]
            + bias.deviation_bias * weights["deviation"]
            + bias.missing_data_bias * weights["missing_data"]
            + bias.measurement_bias * weights["measurement"]
            + bias.selective_reporting_bias * weights["selective_reporting"]
        )

        retention_factor = float(np.clip(1.0 - (total_penalty * 0.75), 0.15, 1.0))
        return retention_factor

    def compute_empirical_p_value(
        self,
        treatment: np.ndarray,
        control: Optional[np.ndarray],
        null_mean: float = 0.0,
        n_permutations: int = 10000
    ) -> Tuple[float, float, Tuple[float, float]]:
        """
        Vectorized Monte Carlo permutation test and bootstrap confidence interval.
        Returns: (observed_diff, p_value, (ci_lower, ci_upper))
        """
        t_arr = np.asarray(treatment, dtype=np.float64)

        if control is not None and len(control) > 0:
            c_arr = np.asarray(control, dtype=np.float64)
            obs_diff = float(np.mean(t_arr) - np.mean(c_arr))

            # Pooled array for exact permutation testing
            pooled = np.concatenate([t_arr, c_arr])
            n_t = len(t_arr)
            n_total = len(pooled)

            # Vectorized permutation sampling
            indices = np.argsort(self.rng.rand(n_permutations, n_total), axis=-1)
            shuffled_pooled = pooled[indices]
            perm_treat_means = np.mean(shuffled_pooled[:, :n_t], axis=-1)
            perm_ctrl_means = np.mean(shuffled_pooled[:, n_t:], axis=-1)
            perm_diffs = perm_treat_means - perm_ctrl_means

            # Two-tailed empirical p-value
            p_val = float(np.mean(np.abs(perm_diffs - null_mean) >= np.abs(obs_diff - null_mean)))

            # Bootstrap 95% Confidence Interval for difference of means
            boot_t = self.rng.choice(t_arr, size=(1000, len(t_arr)), replace=True).mean(axis=-1)
            boot_c = self.rng.choice(c_arr, size=(1000, len(c_arr)), replace=True).mean(axis=-1)
            boot_diffs = boot_t - boot_c
            ci_lower = float(np.percentile(boot_diffs, 2.5))
            ci_upper = float(np.percentile(boot_diffs, 97.5))

        else:
            obs_diff = float(np.mean(t_arr) - null_mean)
            # Centered 1-sample sign-flip permutation
            centered = t_arr - null_mean
            signs = self.rng.choice([-1.0, 1.0], size=(n_permutations, len(t_arr)))
            perm_means = np.mean(centered * signs, axis=-1)
            p_val = float(np.mean(np.abs(perm_means) >= np.abs(obs_diff)))

            # Bootstrap CI
            boot_means = self.rng.choice(t_arr, size=(1000, len(t_arr)), replace=True).mean(axis=-1) - null_mean
            ci_lower = float(np.percentile(boot_means, 2.5))
            ci_upper = float(np.percentile(boot_means, 97.5))

        # Guarantee non-zero empirical bound
        p_val = max(p_val, 1.0 / n_permutations)
        return obs_diff, p_val, (ci_lower, ci_upper)

    def evaluate_falsification(self, request: FalsificationRequest) -> FalsificationResult:
        """Executes full empirical hypothesis test and Cochrane discount pipeline."""
        import time
        t_start = time.perf_counter()

        t_data = np.array(request.treatment_samples, dtype=np.float64)
        c_data = np.array(request.control_samples, dtype=np.float64) if request.control_samples else None

        obs_diff, p_val, (ci_low, ci_high) = self.compute_empirical_p_value(
            treatment=t_data,
            control=c_data,
            null_mean=request.null_mean,
            n_permutations=request.n_permutations
        )

        discount_factor = self.calculate_cochrane_discount(request.cochrane_bias)
        discounted_effect = obs_diff * discount_factor

        is_sig = p_val < request.alpha
        n_t = len(request.treatment_samples)
        n_c = len(request.control_samples) if request.control_samples else 0

        warning = None
        if not is_sig:
            h0_verdict = "FAIL_TO_REJECT_NULL (UNDERPOWERED / SKEPTICAL WARNING)"
            warning = f"Observed effect (p={p_val:.4f}) does not meet the significance threshold alpha={request.alpha}. Cannot reject H0."
        elif n_t < 30 and (n_c == 0 or n_c < 30):
            h0_verdict = "REJECT_NULL (CAUTION: LOW_SAMPLE_SIZE)"
            warning = f"Significant p-value (p={p_val:.4f}) observed in small cohort (n={n_t}). High risk of Type M/S effect inflation."
        elif discount_factor < 0.70:
            h0_verdict = "REJECT_NULL (HIGH_RISK_OF_BIAS)"
            warning = f"Statistically significant (p={p_val:.4f}), but Cochrane RoB 2 penalty reduced effective effect size by {((1 - discount_factor) * 100):.1f}%."
        else:
            h0_verdict = "REJECT_NULL"

        t_elapsed = (time.perf_counter() - t_start) * 1000.0

        return FalsificationResult(
            claim_id=request.claim_id,
            observed_mean_diff=round(obs_diff, 6),
            discounted_effect_size=round(discounted_effect, 6),
            empirical_p_value=round(p_val, 6),
            ci_lower=round(ci_low, 6),
            ci_upper=round(ci_high, 6),
            sample_size_treatment=n_t,
            sample_size_control=n_c,
            is_statistically_significant=is_sig,
            h0_verdict=h0_verdict,
            cochrane_discount_factor=round(discount_factor, 4),
            skeptical_warning=warning,
            execution_time_ms=round(t_elapsed, 3),
        )


# Global singleton instance
falsification_engine = FalsificationEngine()
