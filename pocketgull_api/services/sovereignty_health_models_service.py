"""
Pocket Gull — Triad Health ML Models Sidecar Service
Implements:
1. PCOS Phenotypic Classifier & Insulin Sensitivity Model (HOMA-IR, FAI, Phenotype A-D).
2. Endometriosis Pelvic Pain Index (EPI) Model (Deep Pelvic Infiltration Probability).
3. Princeton III Microvascular CAD & Endothelial Model.
4. PSA Density & mpMRI Biopsy Avoidance Triage Model.
5. GAHT Pharmacokinetic (PK/PD) In Silico Simulator.
6. Secondary Erythrocytosis Trajectory Forecaster (Masculinizing GAHT).
"""

from typing import Dict, Any, List, Optional
import math
import numpy as np
from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# 1. PCOS Phenotype & HOMA-IR Models
# -------------------------------------------------------------
class PcosModelInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    fasting_glucose_mg_dl: float = Field(default=95.0, ge=40.0, le=400.0, description="Fasting Glucose (mg/dL)")
    fasting_insulin_uu_ml: float = Field(default=14.0, ge=1.0, le=250.0, description="Fasting Insulin (uU/mL)")
    total_testosterone_ng_dl: float = Field(default=55.0, ge=5.0, le=400.0, description="Total Testosterone (ng/dL)")
    shbg_nmol_l: float = Field(default=30.0, ge=5.0, le=200.0, description="Sex Hormone-Binding Globulin (nmol/L)")
    oligo_anovulation: bool = Field(default=True, description="Cycle irregularities or amenorrhea")
    polycystic_ovary_morphology: bool = Field(default=True, description="Ultrasound follicle count >= 20 or volume >= 10 mL")
    clinical_hyperandrogenism: bool = Field(default=True, description="Hirsutism (Ferriman-Gallwey) or cystic acne")


class PcosModelOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    rotterdam_phenotype: str = Field(..., description="Phenotype A, B, C, D, or Non-PCOS")
    homa_ir_score: float = Field(..., description="Homeostatic Model Assessment of Insulin Resistance")
    insulin_resistance_present: bool = Field(..., description="HOMA-IR >= 2.0 cutoff")
    free_androgen_index: float = Field(..., description="FAI %")
    recommended_therapeutics: List[str] = Field(..., description="Nutraceutical and pharmacotherapy recommendations")
    phenotypic_summary: str = Field(..., description="Clinical synthesis")


def evaluate_pcos_model(data: PcosModelInput) -> PcosModelOutput:
    homa = round((data.fasting_glucose_mg_dl * data.fasting_insulin_uu_ml) / 405.0, 2)
    has_ir = homa >= 2.0

    # Total T nmol/L conversion: 1 ng/dL = 0.0347 nmol/L
    tt_nmol = data.total_testosterone_ng_dl * 0.0347
    fai = round((tt_nmol / max(1.0, data.shbg_nmol_l)) * 100.0, 1)
    has_ha = data.clinical_hyperandrogenism or fai > 5.0 or data.total_testosterone_ng_dl > 50.0

    oligo = data.oligo_anovulation
    pco = data.polycystic_ovary_morphology

    phenotype = "No PCOS Indicated"
    summary = "Does not satisfy Rotterdam consensus criteria for PCOS."
    therapeutics: List[str] = []

    if has_ha and oligo and pco:
        phenotype = "Phenotype A (Classic / Full Rotterdam)"
        summary = "Classic PCOS with hyperandrogenism, ovulatory dysfunction, and polycystic ovarian morphology."
    elif has_ha and oligo and not pco:
        phenotype = "Phenotype B (Non-PCO Morphology)"
        summary = "Hyperandrogenism and anovulation with normal ovarian ultrasound appearance."
    elif has_ha and not oligo and pco:
        phenotype = "Phenotype C (Ovulatory)"
        summary = "Hyperandrogenism with polycystic ovaries but preserved regular ovulatory menstrual cycles."
    elif not has_ha and oligo and pco:
        phenotype = "Phenotype D (Non-Hyperandrogenic)"
        summary = "Ovulatory dysfunction and polycystic morphology with normal circulating androgens."

    if has_ir:
        therapeutics.append("Myo-Inositol & D-Chiro-Inositol in physiological 40:1 ratio (2,000 mg BID)")
        therapeutics.append("Berberine HCl (500 mg TID) or Metformin for AMPK pathway insulin sensitization")
        therapeutics.append("Low-glycemic whole foods dietary framework with high polyphenol intake")
    else:
        therapeutics.append("Targeted micronutrients: Zinc bisglycinate (30 mg/day) and Vitamin D3/K2")
        therapeutics.append("Circadian rhythm entrainment and adrenal HPA axis modulation")

    return PcosModelOutput(
        rotterdam_phenotype=phenotype,
        homa_ir_score=homa,
        insulin_resistance_present=has_ir,
        free_androgen_index=fai,
        recommended_therapeutics=therapeutics,
        phenotypic_summary=summary,
    )


# -------------------------------------------------------------
# 2. Endometriosis Pelvic Pain Index (EPI) Model
# -------------------------------------------------------------
class EndometriosisModelInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    dysmenorrhea_scale_0_10: int = Field(default=8, ge=0, le=10, description="Menstrual pain severity (0-10)")
    deep_dyspareunia: bool = Field(default=True, description="Deep pain during intercourse")
    catamenial_dyschezia: bool = Field(default=True, description="Painful bowel movements during menses")
    cyclic_bloating_or_nausea: bool = Field(default=True, description="Gastrointestinal cyclic symptoms")
    nsaid_refractory: bool = Field(default=True, description="Pain persists despite max-dose NSAIDs")
    family_history_endometriosis: bool = Field(default=False, description="First-degree relative with confirmed endometriosis")


class EndometriosisModelOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    probability_percentage: float = Field(..., ge=0.0, le=100.0, description="Endometriosis Probability Index %")
    clinical_risk_tier: str = Field(..., description="Low, Moderate, High Suspicion")
    catamenial_indicators: List[str] = Field(..., description="Detected symptom red flags")
    diagnostic_recommendation: str = Field(..., description="Actionable imaging / surgery recommendation")


def evaluate_endometriosis_model(data: EndometriosisModelInput) -> EndometriosisModelOutput:
    # Bayesian heuristic scoring
    score = data.dysmenorrhea_scale_0_10 * 5.0
    indicators: List[str] = []

    if data.deep_dyspareunia:
        score += 15.0
        indicators.append("Deep Dyspareunia (Uterosacral ligament involvement)")
    if data.catamenial_dyschezia:
        score += 15.0
        indicators.append("Catamenial Dyschezia (Rectovaginal septum involvement)")
    if data.cyclic_bloating_or_nausea:
        score += 10.0
        indicators.append("Catamenial GI Syndrome ('Endo-Belly')")
    if data.nsaid_refractory:
        score += 10.0
        indicators.append("Refractory to First-Line NSAIDs")
    if data.family_history_endometriosis:
        score += 10.0
        indicators.append("First-Degree Relative Genetic Risk (7-10x familial risk)")

    prob = min(99.0, max(5.0, score))
    tier = "Low Likelihood"
    rec = "Conservative management with NSAIDs and cycle tracking."

    if prob >= 70.0:
        tier = "High Suspicion (Laparoscopy / Specialist Imaging Indicated)"
        rec = "High suspicion for Deep Infiltrating Endometriosis (DIE). Refer to minimally invasive gynecologic surgery (MIGS) and order pelvic MRI with endometriosis protocol."
    elif prob >= 40.0:
        tier = "Moderate Concern"
        rec = "Consider 3-6 month trial of progestin-only suppression (e.g. Dienogest 2mg or Levonorgestrel IUD) with longitudinal pain tracking."

    return EndometriosisModelOutput(
        probability_percentage=prob,
        clinical_risk_tier=tier,
        catamenial_indicators=indicators,
        diagnostic_recommendation=rec,
    )


# -------------------------------------------------------------
# 3. Princeton III Endothelial-Cardiovascular CAD Model
# -------------------------------------------------------------
class PrincetonCadInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    age: float = Field(default=55.0, ge=20.0, le=100.0, description="Patient age")
    iief5_erectile_score: int = Field(default=12, ge=1, le=25, description="IIEF-5 score (<=16 = significant ED)")
    apob_mg_dl: float = Field(default=115.0, ge=20.0, le=300.0, description="Apolipoprotein B (mg/dL)")
    hs_crp_mg_l: float = Field(default=2.8, ge=0.1, le=30.0, description="High-sensitivity CRP (mg/L)")
    systolic_bp: float = Field(default=138.0, ge=70.0, le=250.0, description="Resting Systolic BP (mmHg)")
    takes_nitroglycerin: bool = Field(default=False, description="Co-administration of organic nitrates")


class PrincetonCadOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    estimated_10y_cad_risk_percent: float = Field(..., description="Predicted 10-year CAD risk %")
    endothelial_dysfunction_tier: str = Field(..., description="Normal, Mild, Severe Microvascular Disease")
    pde5_inhibitor_cleared: bool = Field(..., description="Safety clearance for PDE5 inhibitors")
    hard_stop_contraindication: Optional[str] = Field(None, description="ISMP safety warning")
    recommended_diagnostics: List[str] = Field(..., description="Recommended cardiovascular imaging")


def evaluate_princeton_cad_model(data: PrincetonCadInput) -> PrincetonCadOutput:
    # Microvascular CAD weighting
    base_risk = (data.age - 35.0) * 0.4
    if data.systolic_bp >= 140.0:
        base_risk += 5.0
    if data.apob_mg_dl >= 100.0:
        base_risk += 4.0
    if data.hs_crp_mg_l >= 2.0:
        base_risk += 3.0

    if data.iief5_erectile_score <= 11:
        base_risk += 10.0  # Severe ED
    elif data.iief5_erectile_score <= 16:
        base_risk += 5.0   # Moderate ED

    cad_risk = round(min(50.0, max(2.0, base_risk)), 1)
    tier = "Normal Microvasculature"
    if data.iief5_erectile_score <= 11 or data.apob_mg_dl >= 120.0:
        tier = "Severe Microvascular Disease"
    elif data.iief5_erectile_score <= 16 or data.apob_mg_dl >= 90.0:
        tier = "Mild Endothelial Dysfunction"

    pde5_safe = not data.takes_nitroglycerin and cad_risk < 25.0
    contra: Optional[str] = None
    if data.takes_nitroglycerin:
        contra = "FATAL ISMP CONTRAINDICATION: Organic nitrates co-administered with PDE5 inhibitors cause refractory fatal hypotension."

    return PrincetonCadOutput(
        estimated_10y_cad_risk_percent=cad_risk,
        endothelial_dysfunction_tier=tier,
        pde5_inhibitor_cleared=pde5_safe,
        hard_stop_contraindication=contra,
        recommended_diagnostics=[
            "Coronary Artery Calcium (CAC) CT scan",
            "Apolipoprotein B & Lipoprotein(a) confirmation",
            "Cardiovascular exercise stress ECG",
            "Endothelial reactive hyperemia index",
        ],
    )


# -------------------------------------------------------------
# 4. PSA Density & mpMRI Biopsy Avoidance Triage
# -------------------------------------------------------------
class PsaTriageInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    total_psa_ng_ml: float = Field(default=5.8, ge=0.1, le=100.0, description="Total PSA (ng/mL)")
    free_psa_percent: float = Field(default=16.0, ge=1.0, le=100.0, description="Free-to-Total PSA %")
    prostate_volume_cc: float = Field(default=48.0, ge=10.0, le=250.0, description="Prostate volume in cm3")


class PsaTriageOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    psa_density_ng_ml_cm3: float = Field(..., description="PSA Density")
    biopsy_safely_avoidable: bool = Field(..., description="Can avoid invasive blind transrectal biopsy")
    mpmri_pirads_indicated: bool = Field(..., description="Multiparametric MRI indicated")
    clinical_guidance: str = Field(..., description="Evidence recommendation")


def evaluate_psa_density_model(data: PsaTriageInput) -> PsaTriageOutput:
    density = round(data.total_psa_ng_ml / max(10.0, data.prostate_volume_cc), 3)
    avoidable = density < 0.15 and data.free_psa_percent >= 15.0
    mpmri = density >= 0.15 or data.free_psa_percent < 15.0

    if avoidable:
        guidance = "Low suspicion for clinically significant prostate cancer. PSA elevation is driven by benign prostatic hyperplasia (BPH) volume. Avoid blind biopsy; continue active surveillance."
    else:
        guidance = "Elevated PSA density (>= 0.15) or low Free PSA (<15%). Perform multiparametric prostate MRI (mpMRI) with PI-RADS scoring prior to considering targeted biopsy."

    return PsaTriageOutput(
        psa_density_ng_ml_cm3=density,
        biopsy_safely_avoidable=avoidable,
        mpmri_pirads_indicated=mpmri,
        clinical_guidance=guidance,
    )


# -------------------------------------------------------------
# 5. In Silico GAHT Pharmacokinetics Simulator
# -------------------------------------------------------------
class GahtPkInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    compound: str = Field(default="Estradiol Valerate (IM/SubQ)", description="Hormone ester")
    dose_mg: float = Field(default=4.0, ge=0.5, le=50.0, description="Dose in mg")
    interval_days: int = Field(default=7, ge=3, le=28, description="Injection interval in days")


class PkCurveStep(BaseModel):
    day: float
    concentration: float


class GahtPkOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    peak_concentration: float = Field(..., description="Peak concentration (pg/mL for E2, ng/dL for T)")
    trough_concentration: float = Field(..., description="Trough concentration at end of interval")
    peak_trough_fluctuation_percent: float = Field(..., description="Peak-to-trough swing %")
    simulated_curve: List[PkCurveStep] = Field(..., description="Daily concentration curve points")
    clinical_advice: str = Field(..., description="Dosing interval optimization guidance")


def simulate_gaht_pk_model(data: GahtPkInput) -> GahtPkOutput:
    ka = 0.8
    ke = 0.14
    multiplier = 55.0

    if "Cypionate" in data.compound and "Estradiol" in data.compound:
        ka = 0.45
        ke = 0.09
        multiplier = 50.0
    elif "Testosterone" in data.compound:
        ka = 0.5 if "Cypionate" in data.compound else 0.7
        ke = 0.09 if "Cypionate" in data.compound else 0.12
        multiplier = 140.0

    curve: List[PkCurveStep] = []
    max_c = 0.0
    step = 0.5
    current_day = 0.0

    while current_day <= float(data.interval_days):
        val = (data.dose_mg * ka / (ka - ke)) * (math.exp(-ke * current_day) - math.exp(-ka * current_day))
        c = max(0.0, round(val * multiplier, 1))
        curve.append(PkCurveStep(day=current_day, concentration=c))
        if c > max_c:
            max_c = c
        current_day += step

    trough = curve[-1].concentration if curve else 0.0
    fluct = round(((max_c - trough) / trough * 100.0), 0) if trough > 0 else 100.0

    advice = "Smooth pharmacokinetic curve with stable steady state."
    if fluct > 180.0 and data.interval_days >= 10:
        advice = "High peak-to-trough fluctuation (>180%). Patients frequently report end-of-cycle mood dips. Recommend shortening interval to 5-7 days with a proportionally smaller dose."

    return GahtPkOutput(
        peak_concentration=max_c,
        trough_concentration=trough,
        peak_trough_fluctuation_percent=fluct,
        simulated_curve=curve,
        clinical_advice=advice,
    )


# -------------------------------------------------------------
# 6. Secondary Erythrocytosis Forecaster
# -------------------------------------------------------------
class ErythrocytosisInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    baseline_hematocrit: float = Field(default=42.0, ge=30.0, le=60.0, description="Baseline hematocrit %")
    current_hematocrit: float = Field(default=49.0, ge=30.0, le=65.0, description="Current hematocrit %")
    months_on_testosterone: int = Field(default=9, ge=1, le=120, description="Months on GAHT")
    weekly_dose_mg: float = Field(default=100.0, ge=10.0, le=300.0, description="Weekly testosterone dose")
    nocturnal_snoring_or_apnea: bool = Field(default=True, description="Known snoring or untreated apnea")


class ErythrocytosisOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    projected_hematocrit_6m: float = Field(..., description="Projected hematocrit at 6 months %")
    urgent_phlebotomy_indicated: bool = Field(..., description="Hematocrit >= 54%")
    sleep_apnea_screening_indicated: bool = Field(..., description="Evaluate for nocturnal hypoxemia")
    clinical_recommendation: str = Field(..., description="Actionable posology guidance")


def forecast_erythrocytosis_model(data: ErythrocytosisInput) -> ErythrocytosisOutput:
    monthly_rise = (data.current_hematocrit - data.baseline_hematocrit) / max(1, data.months_on_testosterone)
    projected = data.current_hematocrit + (monthly_rise * 6.0)
    if data.nocturnal_snoring_or_apnea:
        projected += 1.5

    projected = round(projected, 1)
    urgent = data.current_hematocrit >= 54.0 or projected >= 54.0
    apnea_screen = data.nocturnal_snoring_or_apnea and data.current_hematocrit >= 50.0

    rec = "Hematocrit trajectory is within safe limits (<50%). Maintain annual monitoring."
    if data.current_hematocrit >= 54.0:
        rec = "CRITICAL: Current Hematocrit >= 54%. High thromboembolic/stroke risk. Hold testosterone dose, hydrate, and consider therapeutic phlebotomy."
    elif projected >= 52.0:
        rec = "Upward hematocrit trajectory. If patient snorts or gasps during sleep, order home sleep apnea test (HSAT) to correct hypoxemia before decreasing testosterone."

    return ErythrocytosisOutput(
        projected_hematocrit_6m=projected,
        urgent_phlebotomy_indicated=urgent,
        sleep_apnea_screening_indicated=apnea_screen,
        clinical_recommendation=rec,
    )
