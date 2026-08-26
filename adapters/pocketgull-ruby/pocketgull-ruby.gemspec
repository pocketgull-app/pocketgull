# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "pocketgull-ruby"
  spec.version       = "0.1.0"
  spec.authors       = ["Phil Gear"]
  spec.email         = ["dpo@pocketgull.app"]
  spec.summary       = "Blazing fast Ruby bindings for Pocketgull clinical DSP, SIBI calculation, and FHIR R4."
  spec.description   = "Ruby C-Extension gem wrapping pocketgull-core Rust engine using magnus and rb-sys."
  spec.license       = "MIT"
  spec.required_ruby_version = ">= 3.3.0"

  spec.metadata["homepage_uri"] = "https://pocketgull.app"
  spec.metadata["source_code_uri"] = "https://github.com/pocketgull-app/pocketgull"
  spec.metadata["documentation_uri"] = "https://pocketgull.app/docs"
  spec.metadata["rubygems_mfa_required"] = "true"

  spec.files         = Dir["lib/**/*.rb", "ext/**/*.{rs,toml,rb}", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]
  spec.extensions    = ["ext/pocketgull_ruby/extconf.rb"]

  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rb_sys", "~> 0.9"
end
