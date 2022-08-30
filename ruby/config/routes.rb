Rails.application.routes.draw do
  resources :device
  get 'devices/index'
  mount API::Base, at: "/"
  mount GrapeSwaggerRails::Engine, at: "/documentation"
end