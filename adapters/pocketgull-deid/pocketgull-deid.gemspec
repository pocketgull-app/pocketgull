# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "pocketgull-deid"
  spec.version       = "0.1.0"
  spec.authors       = ["Phil Gear"]
  spec.email         = ["dpo@pocketgull.app"]
  spec.summary       = "HIPAA §164.514 Safe Harbor de-identification engine for Ruby."
  spec.description   = "Redacts 18 Protected Health Information (PHI) identifiers from Ruby strings, hashes, and FHIR payloads."
  spec.license       = "MIT"

  spec.files         = Dir["lib/**/*.rb", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]

  spec.add_development_dependency "minitest", "~> 5.0"
end
