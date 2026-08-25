require_relative "pocketgull/python_client"
require_relative "pocketgull/rack/fhir_context"
require_relative "pocketgull/rails/view_helper"

module Pocketgull
  class Error < StandardError; end

  # Systemic Inflammatory Burden Index (SIBI) Ruby Interface
  class Sibi
    def self.calculate(hs_crp:, hba1c:, esr:, ppd:, twi: 0)
      crp_norm = (hs_crp / 10.0).clamp(0.0, 1.0)
      hba1c_norm = ((hba1c - 5.0) / 7.0).clamp(0.0, 1.0)
      esr_norm = (esr / 50.0).clamp(0.0, 1.0)
      ppd_norm = ((ppd - 2.0) / 8.0).clamp(0.0, 1.0)
      twi_norm = (twi.to_f / 4.0).clamp(0.0, 1.0)

      systemic = (crp_norm * 0.45) + (hba1c_norm * 0.35) + (esr_norm * 0.20)
      oral = (ppd_norm * 0.70) + (twi_norm * 0.30)
      total = ((systemic * 0.65) + (oral * 0.35)) * 100.0

      risk_tier = if total < 25.0
                    "LOW_INFLAMMATORY_RISK"
                  elsif total < 60.0
                    "MODERATE_INFLAMMATORY_RISK"
                  else
                    "HIGH_SYSTEMIC_BURDEN"
                  end

      {
        score: total.round(2),
        risk_tier: risk_tier,
        systemic_burden_index: systemic.round(2),
        oral_burden_index: oral.round(2)
      }
    end
  end

  # FHIR R4 Bundle Exporter
  class Fhir
    def self.export_patient_bundle(patient_id:, gender:, birth_date:, sibi_score:, sibi_risk_tier:)
      {
        resourceType: "Bundle",
        type: "document",
        timestamp: Time.now.utc.iso8601,
        entry: [
          {
            resource: {
              resourceType: "Patient",
              id: patient_id,
              gender: gender,
              birthDate: birth_date
            }
          },
          {
            resource: {
              resourceType: "Observation",
              id: "sibi-obs-#{patient_id}",
              status: "final",
              code: {
                coding: [{
                  system: "http://loinc.org",
                  code: "85354-9",
                  display: "Systemic Inflammatory Burden Index"
                }]
              },
              subject: { reference: "Patient/#{patient_id}" },
              valueQuantity: { value: sibi_score, unit: "points" },
              interpretation: [{ text: sibi_risk_tier }]
            }
          }
        ]
      }
    end
  end
end
