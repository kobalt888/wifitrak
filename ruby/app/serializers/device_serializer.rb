class DeviceSerializer < ActiveModel::Serializer
  # I am sure there is a way to validate the location with Active Record and the Location model but... time
  attributes :name, :location, :created_at, :updated_at

end