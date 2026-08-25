# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "pocketgull-cgm"
  spec.version       = "0.1.0"
  spec.authors       = ["Phil Gear"]
  spec.email         = ["dpo@pocketgull.app"]
  spec.summary       = "Continuous Glucose Monitor (CGM) Ambulatory Glucose Profile (AGP) analytics gem."
  spec.description   = "Calculates Time-in-Range (TIR 70-180 mg/dL), Glucose Variability CV%, and Glucose Management Indicator (GMI)."
  spec.license       = "MIT"

  spec.files         = Dir["lib/**/*.rb", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]

  spec.add_development_dependency "minitest", "~> 5.0"
end
