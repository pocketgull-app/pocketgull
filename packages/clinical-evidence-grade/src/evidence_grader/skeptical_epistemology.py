"""
Popperian Null Hypothesis ($H_0$) Testing & Skeptical Epistemology Engine.
Ensures mathematical falsifiability and prevents uncritical science-washing.
"""

import math
from scipy import stats
from typing import Optional, Tuple
from evidence_grader.models import NullHypothesisTestResult


def evaluate_null_hypothesis(
    mean_treatment: float,
    mean_control: float,
    std_treatment: float,
    std_control: float,
    n_treatment: int,
    n_control: int,
    alpha: float = 0.05,
    metric_name: str = "Clinical Biomarker",
) -> NullHypothesisTestResult:
    """
    Performs a two-sample Welch's t-test against the Popperian Null Hypothesis:
    H0: mean_treatment == mean_control (No true clinical effect).
    """
    if n_treatment < 2 or n_control < 2:
        return NullHypothesisTestResult(
            test_statistic=0.0,
            p_value=1.0,
            reject_null=False,
            alpha=alpha,
            confidence_interval_95=(0.0, 0.0),
            skeptical_warning=f"Insufficient sample size (n={n_treatment+n_control}) to test {metric_name}."
        )

    # Calculate Welch's t-test
    variance_t = (std_treatment ** 2) / n_treatment
    variance_c = (std_control ** 2) / n_control
    pooled_se = math.sqrt(variance_t + variance_c)

    mean_diff = mean_treatment - mean_control
    t_stat = mean_diff / pooled_se if pooled_se > 0 else 0.0

    # Welch-Satterthwaite degrees of freedom
    if pooled_se > 0:
        df_numerator = (variance_t + variance_c) ** 2
        df_denominator = ((variance_t ** 2) / (n_treatment - 1)) + ((variance_c ** 2) / (n_control - 1))
        df = df_numerator / df_denominator if df_denominator > 0 else 1.0
    else:
        df = 1.0

    p_value = float(2 * (1 - stats.t.cdf(abs(t_stat), df=df)))

    # 95% Confidence Interval of Difference
    t_crit = float(stats.t.ppf(1 - alpha / 2, df=df))
    ci_lower = mean_diff - (t_crit * pooled_se)
    ci_upper = mean_diff + (t_crit * pooled_se)

    reject_null = bool(p_value < alpha)
    skeptical_warning: Optional[str] = None

    if not reject_null:
        skeptical_warning = (
            f"Skeptical Notice: Observed difference in {metric_name} (diff={mean_diff:.2f}, "
            f"p={p_value:.4f}) failed to reject the null hypothesis at alpha={alpha}. "
            f"Findings are statistically indistinguishable from random noise."
        )
    elif ci_lower <= 0 <= ci_upper:
        skeptical_warning = (
            f"Skeptical Notice: 95% Confidence Interval [{ci_lower:.2f}, {ci_upper:.2f}] crosses zero. "
            f"Clinical effect cannot be established with statistical confidence."
        )

    return NullHypothesisTestResult(
        test_statistic=round(t_stat, 4),
        p_value=round(p_value, 6),
        reject_null=reject_null,
        alpha=alpha,
        confidence_interval_95=(round(ci_lower, 3), round(ci_upper, 3)),
        skeptical_warning=skeptical_warning,
    )
