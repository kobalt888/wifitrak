module API
  module V1
    class Location < Grape::API
      format :json

      include API::V1::Defaults
      include LocationHelper

      helpers do 
        def query_for_closest_network(a, b, c, tolerance_factor)
          return ::Location
            .where("json_extract(locations.networks, '$.#{a[0]}') BETWEEN #{a[1]-1*tolerance_factor} AND #{a[1]+1*tolerance_factor}")
            .where("json_extract(locations.networks, '$.#{b[0]}') BETWEEN #{b[1]-1*tolerance_factor} AND #{b[1]+1.5*tolerance_factor}")
            .where("json_extract(locations.networks, '$.#{c[0]}') BETWEEN #{c[1]-3*tolerance_factor} AND #{c[1]+3*tolerance_factor}")
            .first
        end
      end

      resource :location do
        desc "Return a location."
        params do
          requires :name, type: String, desc: "Name of the location"
        end
        get ":name", root: :location do
          ::Location.where(name: permitted_params[:name]).first!
        end

        desc "Add a location with network data, or update a location with additional data points if it already exists."
        params do
          requires :name, type: String, desc: "Name of the network area."
          requires :networks, type: JSON, desc: "An array of values pairs with network names and their associated strength levels."
        end
        post "add" do
          # Lets find out if there is an entry for this location before adding it
          existing_entry = ::Location.where(name: permitted_params[:name]).first
          if existing_entry
            weight_factor = existing_entry.entries # When updating the strength values, we want locations with 
            # Are there networks in this request that we currently do not have data on?
            missing_networks = params[:networks][:payload].keys - existing_entry.networks.keys

            # Gosh this intersection operator is cool
            matching_networks = params[:networks][:payload].keys & existing_entry.networks.keys

            # For all the networks that we have both current database data on and data in this request, weight the old data down
            # and then sprinkle in the new data to properly tweak it
            matching_networks.map { |network| existing_entry[:networks][network] = ((existing_entry.networks[network].to_f * weight_factor + params[:networks][:payload][network].to_f).to_f) / (weight_factor+1)}

            # I am a ruby Simpleton and I am also in a rush
            missing_networks.map { |missing_network| existing_entry[:networks][missing_network] = params[:networks][:payload][missing_network] }

            # For ease of querying in location algo, we want the strongest signals first
            existing_entry.update({
              networks: existing_entry[:networks].sort_by(&:last).reverse.to_h,
              entries: weight_factor + 1
            })
          elsif
            ::Location.create!({
              name: params[:name],
              networks: params[:networks][:payload],
              entries: 1
            })
          end
        end

        desc "Takes a list of nearby networks, calculates the location based on curated location data, and stores it."
        params do
          requires :networks, type: JSON, desc: "An array of values pairs with network names and their associated strength level."
          requires :deviceid, type: Integer, desc: "The id of the device reporting the data."
        end
        post "/submitdata" do
          # Gonna be gnarly...

          # The amount of networks will inform our strategy, but for this MVP being used in my apartment, I might assume
          # there to be at least three networks for any query.
          amount_of_networks = params[:networks][:payload].length

          found_location = nil

          if amount_of_networks >= 3
            first_network = params[:networks].to_a[0][1].to_a[0] # nasty...
            second_network = params[:networks].to_a[0][1].to_a[1]
            third_network = params[:networks].to_a[0][1].to_a[2]

            tolerance_factors = [ 0.8, 1.6, 3.2, 6.4 ]

            iterator = 0
            until found_location || iterator >= tolerance_factors.length do
              found_location = query_for_closest_network(
                first_network,
                second_network,
                third_network,
                tolerance_factors[iterator]
              )
              iterator += 1
            end

            puts found_location.name
          end 
        end
      end
    end
  end
end
