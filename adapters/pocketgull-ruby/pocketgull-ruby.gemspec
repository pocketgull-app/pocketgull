# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "pocketgull-ruby"
  spec.version       = "0.1.0"
  spec.authors       = ["Phil Gear"]
  spec.email         = ["phil@pocketgull.io"]
  spec.summary       = "Blazing fast Ruby bindings for Pocketgull clinical DSP, SIBI calculation, and FHIR R4."
  spec.description   = "Ruby C-Extension gem wrapping pocketgull-core Rust engine using magnus and rb-sys."
  spec.license       = "MIT"

  spec.files         = Dir["lib/**/*.rb", "ext/**/*.{rs,toml,rb}", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]
  spec.extensions    = ["ext/pocketgull_ruby/extconf.rb"]

  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rb_sys", "~> 0.9"
end
