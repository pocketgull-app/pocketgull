# frozen_string_literal: true

module Pocketgull
  module Fhir
    class TelemetryChannel < ActionCable::Channel::Base
      # Subscribes to live patient telemetry streams
      # Client params: { patient_id: "demo-patient-001" }
      def subscribed
        patient_id = params[:patient_id] || "demo-patient-001"
        stream_from "pocketgull_telemetry_#{patient_id}"
        
        logger.info "[Pocketgull TelemetryChannel] Connected live stream for patient: #{patient_id}"
        
        # Transmit initial connection handshake payload
        transmit({
          event: "HANDSHAKE_ESTABLISHED",
          patient_id: patient_id,
          status: "CONNECTED",
          timestamp: Time.now.utc.iso8601
        })
      end

      def unsubscribed
        logger.info "[Pocketgull TelemetryChannel] Disconnected live telemetry stream"
      end

      # Receives live biometrics from client or telemetry sidecar and broadcasts to room
      def receive(data)
        patient_id = params[:patient_id] || "demo-patient-001"
        
        # Broadcast biometric update across ActionCable channel
        ActionCable.server.broadcast("pocketgull_telemetry_#{patient_id}", {
          event: "BIOMETRIC_UPDATE",
          data: data,
          timestamp: Time.now.utc.iso8601
        })
      end
    end
  end
end
