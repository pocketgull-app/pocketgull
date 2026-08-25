# frozen_string_literal: true

module Pocketgull
  module Rails
    # Rails View Helper for embedding the compiled Pocketgull Angular SPA (`app.component.ts`)
    # and Web Component (`<pocketgull-app-element>`) inside ERB templates.
    module ViewHelper
      # Pattern 2: Embeds the full Pocketgull Angular SPA container into any Rails ERB view template.
      # Usage in ERB: <%= pocketgull_app(patient_id: "P-101", theme: "dark") %>
      def pocketgull_app(patient_id: nil, theme: "dark", api_url: nil)
        api_endpoint = api_url || ENV.fetch("POCKETGULL_API_URL", "http://localhost:4000")

        html = <<~HTML
          <div id="pocketgull-app-root" 
               data-patient-id="#{patient_id}" 
               data-theme="#{theme}" 
               data-api-url="#{api_endpoint}"
               class="pocketgull-spa-container w-full h-full min-h-[800px] border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-2xl">
            <app-root></app-root>
          </div>
          <script type="module" src="#{api_endpoint}/main.js"></script>
        HTML

        html.html_safe
      end

      # Pattern 3: Web Component Custom Element (`<pocketgull-app-element>`)
      # Usage in ERB: <%= pocketgull_element(patient_id: "P-101", theme: "dark") %>
      def pocketgull_element(patient_id: nil, theme: "dark", api_url: nil)
        api_endpoint = api_url || ENV.fetch("POCKETGULL_API_URL", "http://localhost:4000")

        html = <<~HTML
          <script type="module" src="#{api_endpoint}/pocketgull-element.js"></script>
          <pocketgull-app-element patient-id="#{patient_id}" theme="#{theme}"></pocketgull-app-element>
        HTML

        html.html_safe
      end
    end
  end
end
