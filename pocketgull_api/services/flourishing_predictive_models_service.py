"""
Pocket Gull — Human Flourishing & Co-Regulation Predictive ML Models
FastAPI Sidecar Service

Implements:
1. Autonomic Sleep & Glymphatic Clearance Forecaster (SWS convective CSF-ISF flux, screen apnea, circadian lux).
2. Couples Co-Regulation & Gottman Flooding Predictor (Polyvagal coupling, Delta-RMSSD, 20-min refractory circuit-breaker).
3. Microbiome SCFA Butyrate & Gut Barrier Model (Botanical diversity count, resistant starch, Claudin-1 / Zonulin permeability).
4. Caregiver Cumulative Allostatic Load & Sleep Debt Forecaster (McEwen allostatic load, Process-S decay, microsleep risk).
"""

from typing import Dict, Any, List, Optional
import math
import numpy as np
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# 1. Autonomic Sleep & Glymphatic Clearance Forecaster
# -----------------------------------------------------------------------------
class GlymphaticClearanceInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    slow_wave_sleep_minutes: float = Field(default=85.0, ge=0.0, le=300.0, description="Deep Slow-Wave Sleep (minutes)")
    bedtime_lux_exposure: float = Field(default=45.0, ge=0.0, le=2000.0, description="Ambient light exposure 2h before bed (lux)")
    screen_apnea_pauses_per_hr: float = Field(default=12.0, ge=0.0, le=100.0, description="Daytime unconscious breath-holding events per hour")
    mayer_wave_resonance_coherence_pct: float = Field(default=78.0, ge=0.0, le=100.0, description="0.10 Hz cardiac coherence percentage")


class GlymphaticClearanceOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    glymphatic_clearance_efficiency_pct: float = Field(..., description="Estimated CSF-ISF convective exchange efficiency %")
    neuro_metabolite_washout_index: float = Field(..., description="Normalized clearance rate of metabolic byproducts (0-10 scale)")
    projected_morning_cognitive_fog_score: float = Field(..., description="Projected morning cognitive friction (1-10 scale, 1=crystal clear)")
    astrocytic_aquaporin4_polarization_tier: str = Field(..., description="OPTIMAL, PARTIALLY_IMPAIRED, or SUBSTANTIALLY_SUPPRESSED")
    posology_interventions: List[str] = Field(..., description="Actionable chronobiology and vagal recovery interventions")


def forecast_glymphatic_clearance(data: GlymphaticClearanceInput) -> GlymphaticClearanceOutput:
    # Baseline interstitial expansion occurs primarily during SWS (>60 min is baseline clinical threshold)
    sws_factor = min(1.0, data.slow_wave_sleep_minutes / 90.0)
    
    # Lux penalty: Blue light/high lux suppresses pineal melatonin and dampens parasympathetic depth
    lux_penalty = min(0.35, (data.bedtime_lux_exposure / 300.0) * 0.35)
    
    # Screen apnea penalty: Intermittent hypercapnia/sympathetic spikes induce astrocytic swelling
    apnea_penalty = min(0.30, (data.screen_apnea_pauses_per_hr / 40.0) * 0.30)
    
    # Mayer wave coherence bonus: 0.10 Hz baroreflex enhances cerebral venous return pulsatility
    vagal_bonus = (data.mayer_wave_resonance_coherence_pct / 100.0) * 0.25

    raw_efficiency = (sws_factor * 0.85) - lux_penalty - apnea_penalty + vagal_bonus
    efficiency_pct = round(float(np.clip(raw_efficiency * 100.0, 15.0, 98.0)), 1)

    washout_index = round(float(efficiency_pct / 10.0), 2)
    fog_score = round(float(np.clip(10.0 - (efficiency_pct / 11.0), 1.0, 10.0)), 1)

    if efficiency_pct >= 75.0:
        aqp4_tier = "OPTIMAL"
    elif efficiency_pct >= 50.0:
        aqp4_tier = "PARTIALLY_IMPAIRED"
    else:
        aqp4_tier = "SUBSTANTIALLY_SUPPRESSED"

    recs: List[str] = []
    if data.slow_wave_sleep_minutes < 60.0:
        recs.append("Slow-wave sleep duration is below the 60-min restorative threshold. Prioritize consistent sleep window.")
    if data.bedtime_lux_exposure > 50.0:
        recs.append("Enforce 20-lux red-shifted ambient lighting curfew starting 90 minutes before sleep.")
    if data.screen_apnea_pauses_per_hr > 15.0:
        recs.append("Implement diaphragmatic micro-exhale reminders during deep screen focus to prevent daytime autonomic hypercapnia.")
    if data.mayer_wave_resonance_coherence_pct < 65.0:
        recs.append("Conduct 5 minutes of 0.10 Hz Mayer resonance (4.0s Inhale / 6.0s Exhale) immediately prior to bed.")

    if not recs:
        recs.append("Glymphatic fluid convection is operating at peak physiological efficiency. Maintain current sleep cadence.")

    return GlymphaticClearanceOutput(
        glymphatic_clearance_efficiency_pct=efficiency_pct,
        neuro_metabolite_washout_index=washout_index,
        projected_morning_cognitive_fog_score=fog_score,
        astrocytic_aquaporin4_polarization_tier=aqp4_tier,
        posology_interventions=recs,
    )


# -----------------------------------------------------------------------------
# 2. Couples Co-Regulation & Gottman Flooding Predictor
# -----------------------------------------------------------------------------
class CouplesCoRegulationInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    partner_a_heart_rate_bpm: float = Field(default=72.0, ge=40.0, le=190.0, description="Partner A current heart rate (bpm)")
    partner_b_heart_rate_bpm: float = Field(default=74.0, ge=40.0, le=190.0, description="Partner B current heart rate (bpm)")
    partner_a_rmssd_ms: float = Field(default=48.0, ge=5.0, le=250.0, description="Partner A HRV RMSSD (ms)")
    partner_b_rmssd_ms: float = Field(default=42.0, ge=5.0, le=250.0, description="Partner B HRV RMSSD (ms)")
    speech_turn_latency_seconds: float = Field(default=2.5, ge=0.1, le=30.0, description="Average pause between partner conversational turns")
    unresolved_conflict_present: bool = Field(default=False, description="Active acute emotional tension or defensive posture")


class CouplesCoRegulationOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    flooding_probability_pct: float = Field(..., description="Probability of emotional flooding / prefrontal shutdown %")
    autonomic_coupling_index: float = Field(..., description="Coupling score (-1.0 escalation to +1.0 co-regulation)")
    mandatory_timeout_minutes: int = Field(..., description="Required cool-down time before high-stakes deliberation (0 or 20 min)")
    polyvagal_state_partner_a: str = Field(..., description="VENTRAL_VAGAL, SYMPATHETIC_ALARM, or DORSAL_SHUTDOWN")
    polyvagal_state_partner_b: str = Field(..., description="VENTRAL_VAGAL, SYMPATHETIC_ALARM, or DORSAL_SHUTDOWN")
    de_escalation_protocol: str = Field(..., description="Specific relational and somatic intervention")


def predict_couples_co_regulation(data: CouplesCoRegulationInput) -> CouplesCoRegulationOutput:
    # Gottman physiological flooding criterion: Heart rate > 100 bpm or RMSSD < 20 ms
    a_symp = data.partner_a_heart_rate_bpm >= 95.0 or data.partner_a_rmssd_ms < 22.0
    b_symp = data.partner_b_heart_rate_bpm >= 95.0 or data.partner_b_rmssd_ms < 22.0

    state_a = "VENTRAL_VAGAL"
    if data.partner_a_heart_rate_bpm >= 105.0 or (a_symp and data.partner_a_rmssd_ms < 15.0):
        state_a = "SYMPATHETIC_ALARM"
    elif data.partner_a_rmssd_ms < 12.0 and data.partner_a_heart_rate_bpm < 55.0:
        state_a = "DORSAL_SHUTDOWN"

    state_b = "VENTRAL_VAGAL"
    if data.partner_b_heart_rate_bpm >= 105.0 or (b_symp and data.partner_b_rmssd_ms < 15.0):
        state_b = "SYMPATHETIC_ALARM"
    elif data.partner_b_rmssd_ms < 12.0 and data.partner_b_heart_rate_bpm < 55.0:
        state_b = "DORSAL_SHUTDOWN"

    # Rapid turn-taking (< 0.8s) indicates interruption/escalation; > 1.5s indicates deliberate listening
    cadence_friction = 0.0
    if data.speech_turn_latency_seconds < 1.0:
        cadence_friction = 0.25
    elif data.speech_turn_latency_seconds > 2.0:
        cadence_friction = -0.15

    base_flooding = 0.10
    if a_symp or b_symp:
        base_flooding += 0.40
    if a_symp and b_symp:
        base_flooding += 0.30
    if data.unresolved_conflict_present:
        base_flooding += 0.20
    base_flooding += cadence_friction

    flooding_prob = round(float(np.clip(base_flooding * 100.0, 5.0, 98.0)), 1)

    # Coupling index: positive = synchronous ventral safety; negative = reciprocal tachycardia
    hr_delta = abs(data.partner_a_heart_rate_bpm - data.partner_b_heart_rate_bpm)
    avg_rmssd = (data.partner_a_rmssd_ms + data.partner_b_rmssd_ms) / 2.0
    
    raw_coupling = ((avg_rmssd - 25.0) / 40.0) - (hr_delta / 50.0) - (0.3 if data.unresolved_conflict_present else 0.0)
    coupling_idx = round(float(np.clip(raw_coupling, -1.0, 1.0)), 2)

    needs_timeout = flooding_prob >= 55.0 or a_symp or b_symp
    timeout_mins = 20 if needs_timeout else 0

    if needs_timeout:
        protocol = "MANDATORY 20-MINUTE RECOVERY BUFFER: Prefrontal cortex is biologically offline. Disengage from discussion immediately. Do not ruminate. Engage in parallel 0.10 Hz Mayer resonance breathing or gentle walking before resuming."
    elif coupling_idx > 0.4:
        protocol = "OPTIMAL CO-REGULATION: High ventral vagal stability and conversational pacing. Ready for joint values alignment and Type 1/Type 2 deliberation."
    else:
        protocol = "MILD TENSION DETECTED: Slow speech cadence down to allow a 2-second pause before responding. Acknowledge emotional reality before moving to tactical solutions."

    return CouplesCoRegulationOutput(
        flooding_probability_pct=flooding_prob,
        autonomic_coupling_index=coupling_idx,
        mandatory_timeout_minutes=timeout_mins,
        polyvagal_state_partner_a=state_a,
        polyvagal_state_partner_b=state_b,
        de_escalation_protocol=protocol,
    )


# -----------------------------------------------------------------------------
# 3. Microbiome SCFA Butyrate & Gut Barrier Model
# -----------------------------------------------------------------------------
class GutBarrierModelInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    weekly_botanical_species_count: int = Field(default=28, ge=1, le=75, description="Distinct plant species consumed per week")
    ancestral_resistant_starch_grams_day: float = Field(default=18.0, ge=0.0, le=80.0, description="Grams of prebiotic resistant starch per day")
    polyphenol_density_score: float = Field(default=7.5, ge=1.0, le=10.0, description="Polyphenol intake (EVOO, berries, spices, greens) 1-10")
    ultra_processed_food_caloric_share_pct: float = Field(default=15.0, ge=0.0, le=100.0, description="Percentage of calories from UPFs")


class GutBarrierModelOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    projected_fecal_butyrate_umol_g: float = Field(..., description="Projected colonic butyrate concentration (target: > 12.0 umol/g)")
    epithelial_barrier_integrity_score: float = Field(..., description="Tight junction integrity score (0-100 scale)")
    systemic_endotoxin_leakage_risk: str = Field(..., description="LOW, MODERATE, or ELEVATED")
    circulating_zonulin_risk_level: str = Field(..., description="LOW_PERMEABILITY, COMPENSATED, or HIGH_LEAKY_GUT_RISK")
    ancestral_nutrition_guidance: List[str] = Field(..., description="Culturally-grounded culinary and prebiotic swaps")


def evaluate_gut_barrier_model(data: GutBarrierModelInput) -> GutBarrierModelOutput:
    # 30+ plant species/week is the American Gut Project gold standard for microbiome alpha-diversity
    botanical_factor = min(1.2, data.weekly_botanical_species_count / 30.0)
    
    # Resistant starch (RS2/RS3) yields ~0.35 umol/g butyrate per gram ingested
    rs_butyrate = data.ancestral_resistant_starch_grams_day * 0.42
    baseline_butyrate = 4.5 * botanical_factor
    upf_penalty = (data.ultra_processed_food_caloric_share_pct / 100.0) * 4.0

    butyrate = round(float(np.clip(baseline_butyrate + rs_butyrate - upf_penalty, 2.0, 26.0)), 1)

    # Barrier integrity modeled via Claudin-1 & Occludin phosphorylation supported by butyrate & polyphenols
    poly_factor = (data.polyphenol_density_score / 10.0) * 25.0
    barrier_raw = (butyrate / 15.0) * 60.0 + poly_factor - (data.ultra_processed_food_caloric_share_pct * 0.45) + 5.0
    barrier_score = round(float(np.clip(barrier_raw, 20.0, 99.0)), 1)

    if barrier_score >= 80.0:
        endotoxin_risk = "LOW"
        zonulin_risk = "LOW_PERMEABILITY"
    elif barrier_score >= 55.0:
        endotoxin_risk = "MODERATE"
        zonulin_risk = "COMPENSATED"
    else:
        endotoxin_risk = "ELEVATED"
        zonulin_risk = "HIGH_LEAKY_GUT_RISK"

    swaps: List[str] = []
    if data.weekly_botanical_species_count < 30:
        swaps.append(f"Increase plant diversity from {data.weekly_botanical_species_count} to 30+ species/week using seed rotations, mixed herbs, and wild greens.")
    if data.ancestral_resistant_starch_grams_day < 20.0:
        swaps.append("Incorporate cooled parboiled grains (farro, purple forbidden rice) or green banana/plantain flour to boost colonic butyrate.")
    if data.ultra_processed_food_caloric_share_pct > 25.0:
        swaps.append("Substitute emulsified commercial foods with traditional bone broths, potlikker, and fermented kraut/miso to shield mucosal mucus layer.")
    if not swaps:
        swaps.append("Microbiome diversity and epithelial barrier integrity are robust. Maintain high polyphenol botanical variety.")

    return GutBarrierModelOutput(
        projected_fecal_butyrate_umol_g=butyrate,
        epithelial_barrier_integrity_score=barrier_score,
        systemic_endotoxin_leakage_risk=endotoxin_risk,
        circulating_zonulin_risk_level=zonulin_risk,
        ancestral_nutrition_guidance=swaps,
    )


# -----------------------------------------------------------------------------
# 4. Caregiver Cumulative Allostatic Load & Sleep Debt Forecaster
# -----------------------------------------------------------------------------
class CaregiverAllostaticLoadInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    nightly_awakenings_for_care: int = Field(default=3, ge=0, le=15, description="Times awakened per night to assist care recipient")
    total_sleep_hours_actual: float = Field(default=5.2, ge=2.0, le=12.0, description="Actual fragmented sleep duration (hours)")
    daily_transfer_biomechanical_mets: float = Field(default=3.5, ge=1.0, le=10.0, description="Lifting, moving, and physical transfer burden in METs")
    consecutive_caregiving_days_without_respite: int = Field(default=24, ge=0, le=365, description="Days since last complete 24h respite shift")


class CaregiverAllostaticLoadOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    allostatic_overload_tier: str = Field(..., description="STABLE_EQUILIBRIUM, COMPENSATING_STRAIN, or EXHAUSTION_CRITICAL")
    cumulative_sleep_debt_hours_weekly: float = Field(..., description="Weekly sleep deficit (hours)")
    daytime_microsleep_risk_pct: float = Field(..., description="Risk of involuntary daytime microsleep during transfers or driving %")
    respite_urgency: str = Field(..., description="WITHIN_48_HOURS, SCHEDULED_WEEKLY, or MAINTENANCE_PACE")
    prescribed_respite_shift_hours: int = Field(..., description="Minimum continuous relief window required for sleep architecture reset")
    clinical_mitigation_plan: str = Field(..., description="Actionable care partner relief protocol")


def forecast_caregiver_allostatic_load(data: CaregiverAllostaticLoadInput) -> CaregiverAllostaticLoadOutput:
    # 7.5 hours is physiological adult baseline
    daily_debt = max(0.0, 7.5 - data.total_sleep_hours_actual)
    # Nighttime awakenings fragment slow-wave sleep and delta power
    fragmentation_tax = data.nightly_awakenings_for_care * 0.4
    weekly_debt = round((daily_debt + fragmentation_tax) * 7.0, 1)

    # Microsleep risk escalates non-linearly with weekly debt > 10h and days without respite > 14
    debt_factor = min(1.0, weekly_debt / 25.0)
    isolation_factor = min(1.0, data.consecutive_caregiving_days_without_respite / 30.0)
    microsleep_prob = round(float(np.clip((debt_factor * 0.55 + isolation_factor * 0.35 + (data.nightly_awakenings_for_care * 0.05)) * 100.0, 5.0, 95.0)), 1)

    if weekly_debt > 18.0 or data.consecutive_caregiving_days_without_respite > 21 or microsleep_prob > 60.0:
        tier = "EXHAUSTION_CRITICAL"
        urgency = "WITHIN_48_HOURS"
        prescribed_hours = 48
        plan = "STAT CAREGIVER RESPITE MANDATED: Severe cumulative sleep debt with high daytime microsleep hazard. Hand off care immediately to professional home health aide or family relief for a continuous 48-hour restorative sleep reset."
    elif weekly_debt > 9.0 or data.consecutive_caregiving_days_without_respite > 10:
        tier = "COMPENSATING_STRAIN"
        urgency = "SCHEDULED_WEEKLY"
        prescribed_hours = 8
        plan = "SCHEDULED WEEKLY RESPITE: Caregiver is actively compensating. Schedule an 8-hour uninterrupted sleep shift this week and arrange transfer assistance to prevent musculoskeletal strain."
    else:
        tier = "STABLE_EQUILIBRIUM"
        urgency = "MAINTENANCE_PACE"
        prescribed_hours = 4
        plan = "Caregiver physiological reserves are preserved. Maintain consistent sleep hygiene and bi-weekly respite checks."

    return CaregiverAllostaticLoadOutput(
        allostatic_overload_tier=tier,
        cumulative_sleep_debt_hours_weekly=weekly_debt,
        daytime_microsleep_risk_pct=microsleep_prob,
        respite_urgency=urgency,
        prescribed_respite_shift_hours=prescribed_hours,
        clinical_mitigation_plan=plan,
    )
