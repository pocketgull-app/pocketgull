# frozen_string_literal: true

module Pocketgull
  module Fhir
    class SmartController < ActionController::Base
      layout "pocketgull/fhir/application"

      # SMART-on-FHIR EHR Launch Endpoint
      # Expected query params: ?iss=https://fhir.epic.com/...&launch=xyz123
      def launch
        @iss = params[:iss] || "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
        @launch_id = params[:launch]

        session[:smart_iss] = @iss
        session[:smart_launch] = @launch_id

        # OAuth2 authorization URI construction
        authorize_url = "#{@iss}/oauth2/authorize"
        redirect_uri = smart_callback_url

        query = {
          response_type: "code",
          client_id: ENV.fetch("SMART_CLIENT_ID", "pocketgull_default_client"),
          redirect_uri: redirect_uri,
          scope: "launch patient/*.read openid fhirUser",
          state: SecureRandom.hex(16),
          aud: @iss
        }

        query[:launch] = @launch_id if @launch_id.present?
        @authorize_url = "#{authorize_url}?#{query.to_query}"

        respond_to do |format|
          format.html # renders launch.html.erb
          format.json { render json: { authorize_url: @authorize_url, iss: @iss, launch: @launch_id } }
        end
      end

      # SMART-on-FHIR OAuth2 Callback Endpoint
      def callback
        code = params[:code]
        error = params[:error]

        if error.present?
          respond_to do |format|
            format.html { render plain: "EHR Authorization failed: #{error}", status: :unauthorized }
            format.json { render json: { error: "EHR Authorization failed: #{error}" }, status: :unauthorized }
          end
          return
        end

        session[:smart_token] = "bearer_token_#{code}"
        @patient_id = params[:patient] || "demo-patient-001"

        respond_to do |format|
          format.html # renders callback.html.erb
          format.json { render json: { status: "SMART_LAUNCH_SUCCESSFUL", patient_id: @patient_id } }
        end
      end
    end
  end
end
