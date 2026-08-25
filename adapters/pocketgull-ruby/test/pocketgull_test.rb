# frozen_string_literal: true

require_relative "test_helper"

class PocketgullTest < Minitest::Test
  def test_sibi_calculation_low_risk
    res = Pocketgull::Sibi.calculate(
      hs_crp: 1.0,
      hba1c: 5.2,
      esr: 10.0,
      ppd: 2.5,
      twi: 0
    )

    assert_equal "LOW_INFLAMMATORY_RISK", res[:risk_tier]
    assert res[:score] < 25.0
  end

  def test_sibi_calculation_high_risk
    res = Pocketgull::Sibi.calculate(
      hs_crp: 12.0,
      hba1c: 9.5,
      esr: 60.0,
      ppd: 7.0,
      twi: 3
    )

    assert_equal "HIGH_SYSTEMIC_BURDEN", res[:risk_tier]
    assert res[:score] >= 60.0
  end

  def test_fhir_bundle_export
    bundle = Pocketgull::Fhir.export_patient_bundle(
      patient_id: "PATIENT-999",
      gender: "female",
      birth_date: "1988-04-12",
      sibi_score: 42.5,
      sibi_risk_tier: "MODERATE_INFLAMMATORY_RISK"
    )

    assert_equal "Bundle", bundle[:resourceType]
    assert_equal 2, bundle[:entry].size
    assert_equal "Patient", bundle[:entry][0][:resource][:resourceType]
    assert_equal "Observation", bundle[:entry][1][:resource][:resourceType]
  end

  def test_python_client_initialization
    client = Pocketgull::PythonClient.new(base_url: "http://localhost:8000")
    refute_nil client
  end
end
