# frozen_string_literal: true

module Pocketgull
  module Fhir
    module Rails
      class Engine < ::Rails::Engine
        isolate_namespace Pocketgull::Fhir::Rails
      end
    end
  end
end
