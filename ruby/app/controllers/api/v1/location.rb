module API
  module V1
    class Location < Grape::API
      format :json

      include API::V1::Defaults

      helpers do 
        def query_for_closest_network(networks, tolerance_factor)
          # DEPRECATED, but keeping it here because I have enough pride

          query_obj = ::Location.all
          # https://medium.com/@ehrndog/dynamic-activerecord-querying-in-rails-4-by-example-730c5793c74
          # As of Rails 4, this ugliness is the standard. Minus a little SQL injection susceptibility I got goin on if 
          # there was ever a bobby tables WiFi network...
          networks.map { |network| 
            query_obj = query_obj.where("json_extract(locations.networks, '$.#{network[0]}') BETWEEN #{network[1]-1*tolerance_factor} AND #{network[1]+1*tolerance_factor}")
          }

          puts query_obj

          return query_obj.first
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
            weight_factor = existing_entry.entries 
            # Are there networks in this request that we currently do not have data on?
            missing_networks = params[:networks][:payload].keys - existing_entry.networks.keys

            # Gosh this intersection operator is cool
            matching_networks = params[:networks][:payload].keys & existing_entry.networks.keys

            # For all the networks that we have both current database data on and data in this request, weight the old data down
            # and then sprinkle in the new data to properly tweak it
            matching_networks.map { |network| existing_entry[:networks][network] = (((existing_entry.networks[network].to_f * weight_factor + params[:networks][:payload][network].to_f).to_f) / (weight_factor+1)).round(2)}

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

          # DEPRECATED BLOCK, but keeping it here because I have enough pride
          # Gonna be gnarly...

          # # The amount of networks will inform our strategy, but for this MVP being used in my apartment, I might assume
          # # there to be at least fifteen networks for any query. Ideally I spend alot more time on this algorithm, but it will
          # # do for this.
          # amount_of_networks = params[:networks][:payload].length

          # found_location = nil
          # search_networks = []

          # # Tried to make this readable...
          # params[:networks][:payload]
          #   .sort_by(&:last)
          #   .reverse
          #   .slice(0,8)
          #   .map { |network|
          #     if network[0] != "" # Latest firmware code checks for this, but too lazy to pull them off the wall and reprogram.
          #       search_networks.push(network)
          #     end
          # }

          # tolerance_factors = (1..10).step(1).to_a 

          # iterator = 0 # oof

          # until found_location || iterator >= tolerance_factors.length do
          #   found_location = query_for_closest_network(
          #     search_networks,
          #     tolerance_factors[iterator]
          #   )
          #   iterator += 1
          # end




          # Ignoring the terrible first round algorithm, I devised a revision below that I am much happier with, and would even 
          # keep as is going forward. Also less likely to induce vomiting

          scores = {}

          # Lets get the networks that were just sent in by a device, sort them by strongest, and reverse it because it works 😅
          payloadNetworks = params[:networks][:payload].sort_by(&:last).reverse

          # Gather the known locations in the database
          knownLocations = ::Location.all

          # Find out what device we are working with
          targetDevice = ::Device
            .find(params[:deviceid])

          puts "Starting score check for #{targetDevice.name}"

          # Taking the list of locations, lets iterate
          knownLocations.map { |location|
            penaltyCounter = 0
            biggestGap = {'name': '', 'score': 0}
            # We will calculate a score for each location
            score = 0
            # To do this, we will loop over all the networks the device just sent in (Network name, strength)
            payloadNetworks.map { |network| 
              # If this current network that was sent in exists in the database, find out the difference in the strength reads
              # and add the difference to the score
              if location.networks[network[0]]
                roundScore = ((network[1]).abs() - (location.networks[network[0]]).abs()).abs()

                # In order to fine tune the algorithm, I had to take advantage of the exponential change in wifi strength rating
                # that occurs with a linear change in physical distance. So as the strength of the signal gets weaker (lower negative
                # value), the difference in the strength is weighed even more, as these values should not deviate as much as the stronger
                # signals.   ////
                #           ////
                #          ////the more you know

                if network[1] < -60
                  roundScore = roundScore * 1.25
                end
                if network[1] < -75
                  roundScore = roundScore *1.25
                end
                if network[1] < -85
                  roundScore = roundScore *1.25
                end

                if roundScore > biggestGap[1].to_i
                  biggestGap[:score] = roundScore
                  biggestGap[:name] = network[0]
                end
                score += ((network[1]).abs() - (location.networks[network[0]]).abs()).abs()
              # If it doesnt exist, thats a demerit.  
              else
                penaltyCounter += 1
                score += 10
              end
            }
            puts "The largest gap for #{location.name} was #{biggestGap[:name]} @ #{biggestGap[:score]}"
            puts "#{location.name} hit the penalty #{penaltyCounter} times."
            puts "-"
            scores[location.name] = score
          }

          puts scores

          # Do some iteration magic to find the key pair with the lowest score (winner)
          # and return the name of the location
          lowestScoringLocation = [scores.min_by{|k, v| v}][0][0]

          puts "#{lowestScoringLocation} was the lowest scoring location."
            
          # feels bad doing this operation like this...  
          targetDevice
           .touch()

          # ...but couldnt figure out chaining easily.
          targetDevice
            .update({
              location: lowestScoringLocation
            })
        end
      end
    end
  end
end
