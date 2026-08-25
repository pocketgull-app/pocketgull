# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "pocketgull-loinc"
  spec.version       = "0.1.0"
  spec.authors       = ["Phil Gear"]
  spec.email         = ["dpo@pocketgull.app"]
  spec.summary       = "Standardized LOINC clinical scoring gem for PHQ-9, GAD-7, Y-BOCS, C-SSRS, and ISI."
  spec.description   = "Evaluates clinical assessment questionnaires, calculates total scores, assigns risk tiers, and generates LOINC-coded FHIR observations."
  spec.license       = "MIT"

  spec.files         = Dir["lib/**/*.rb", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]

  spec.add_development_dependency "minitest", "~> 5.0"
end
