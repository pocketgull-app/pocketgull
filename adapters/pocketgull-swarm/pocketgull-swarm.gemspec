# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "pocketgull-swarm"
  spec.version       = "0.1.0"
  spec.authors       = ["Phil Gear"]
  spec.email         = ["dpo@pocketgull.app"]
  spec.summary       = "Tri-Paradigm Autonomous Clinical Swarm Consensus engine for Ruby."
  spec.description   = "Orchestrates multi-perspective clinical debates across Western Allopathic, Eastern TCM Zang-Fu, and Functional Medicine paradigms."
  spec.license       = "MIT"

  spec.files         = Dir["lib/**/*.rb", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]

  spec.add_development_dependency "minitest", "~> 5.0"
end
