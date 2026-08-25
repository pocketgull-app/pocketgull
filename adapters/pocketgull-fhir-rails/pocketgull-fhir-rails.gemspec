# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "pocketgull-fhir-rails"
  spec.version       = "0.1.0"
  spec.authors       = ["Phil Gear"]
  spec.email         = ["phil@pocketgull.io"]
  spec.summary       = "Turnkey Epic & Cerner EHR OAuth2 SMART-on-FHIR launch engine for Rails."
  spec.description   = "Rails Engine providing OAuth2 authorization code flow, FHIR launch context parsing, and session handoff."
  spec.license       = "MIT"

  spec.files         = Dir["app/**/*", "config/**/*", "lib/**/*", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]

  spec.add_dependency "rails", ">= 7.0"
  spec.add_dependency "oauth2", "~> 2.0"
end
