class RefactorLocations < ActiveRecord::Migration[7.0]
  def change
    remove_column :locations, :created_at
    remove_column :locations, :updated_at
    add_column :locations, :entries, :int
  end
end
