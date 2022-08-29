require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Wifitrak
  class Application < Rails::Application
      config.middleware.use Rack::Cors do
        allow do
          origins "*"
          resource "*", headers: :any, methods: [:get, 
              :post, :put, :delete, :options]
        end
      end
  end
end

