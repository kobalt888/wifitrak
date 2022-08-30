module API
  module V1
    class Device < Grape::API
      format :json

      include API::V1::Defaults

      helpers do 
      end

      resource :device do
        desc "Get all Devices."
        get "all", root: :device do
          ::Device.all
        end

        desc "Get info related to a specific Device."
        params do
          requires :id, type: Integer, desc: "ID of the Device"
        end
        get ":id", root: :device do
          ::Device.where(id: permitted_params[:id]).first!
        end

        desc "Create a Device."
        params do
          requires :name, type: String, desc: "Name of the Device"
        end
        post "create" do
          ::Device.create!({
            name: params[:name],
            location: 'Unknown'
          })
        end
      end
    end
  end
end
