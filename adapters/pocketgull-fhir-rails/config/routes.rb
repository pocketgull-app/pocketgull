# frozen_string_literal: true

Pocketgull::Fhir::Rails::Engine.routes.draw do
  get "launch", to: "smart#launch", as: :smart_launch
  get "callback", to: "smart#callback", as: :smart_callback
end
