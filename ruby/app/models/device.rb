class Device < ApplicationRecord
  after_create_commit { broadcast_append_to "devices" }
  after_update_commit { broadcast_update_to "devices" }
end
