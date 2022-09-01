class Device < ApplicationRecord
  after_create_commit { broadcast_append_to "devices" }
  after_update_commit { broadcast_replace_to "devices", target: self, locals: { device: self} }
  after_destroy_commit { broadcast_destroy_to "devices" }
end
