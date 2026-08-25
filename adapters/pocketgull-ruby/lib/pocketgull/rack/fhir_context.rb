# frozen_string_literal: true

module Pocketgull
  module Rack
    # Rack Middleware for automatic SMART-on-FHIR context parsing & session injection.
    class FhirContext
      def initialize(app, options = {})
        @app = app
        @header_key = options.fetch(:header_key, "HTTP_X_FHIR_PATIENT_ID")
      end

      def call(env)
        req = ::Rack::Request.new(env)
        patient_id = req.env[@header_key] || req.params["patient_id"]

        if patient_id.present?
          env["pocketgull.patient_id"] = patient_id
          env["pocketgull.fhir_active"] = true
        else
          env["pocketgull.fhir_active"] = false
        end

        @app.call(env)
      end
    end
  end
end
