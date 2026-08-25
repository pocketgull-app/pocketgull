# frozen_string_literal: true

require "net/http"
require "json"
require "uri"

module Pocketgull
  # Ruby Client for Pocketgull Python FastAPI ML Scoring Sidecar (`pocketgull_api`)
  class PythonClient
    DEFAULT_BASE_URL = "http://localhost:8000"

    def initialize(base_url: ENV.fetch("POCKETGULL_PYTHON_API_URL", DEFAULT_BASE_URL))
      @base_url = base_url
    end

    # Request readmission risk prediction from Python ML model
    def predict_readmission_risk(patient_features)
      post("/predict/readmission", patient_features)
    end

    # Request conformal quantile calibrated risk from Python engine
    def predict_conformal_risk(patient_payload)
      post("/predict/conformal_risk", patient_payload)
    end

    # Perform health check against Python FastAPI sidecar
    def health_check
      get("/health")
    end

    private

    def post(path, payload)
      uri = URI.parse("#{@base_url}#{path}")
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })
      request.body = payload.to_json

      response = http.request(request)
      JSON.parse(response.body, symbolize_names: true)
    rescue StandardError => e
      { error: "Python sidecar unreachable: #{e.message}" }
    end

    def get(path)
      uri = URI.parse("#{@base_url}#{path}")
      response = Net::HTTP.get_response(uri)
      JSON.parse(response.body, symbolize_names: true)
    rescue StandardError => e
      { error: "Python sidecar unreachable: #{e.message}" }
    end
  end
end
