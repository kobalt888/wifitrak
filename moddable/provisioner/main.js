import {} from "piu/MC";
import config from "mc/config";
import LOCATIONS from "locations";
import {ListScreen} from "list-screen";
import {ConfirmScreen} from "confirm-screen";
import {WiFiStatusSpinner} from "utils"
import {Request} from "http"


if (config.ssid === "REPLACE")
	throw new Error("Wi-Fi SSID required");

import WiFi from "wifi";

WiFi.mode = 1;

let locationData = LOCATIONS.split(".").map((item, index) => ({ locationName:item.trim(), variant:(index % 10) - 5 }));	

class ProvisionerAppBehavior extends Behavior {
	onCreate(application) {
		global.application = application;
		this.networks = []
		this.doNext(application, "DISPLAY_LIST", locationData);
		application.interval = 500;
		application.start();
	}
	doNext(application, nextScreenName, nextScreenData = {}) {
		application.defer("onSwitchScreen", nextScreenName, nextScreenData);
	}
	onSwitchScreen(application, nextScreenName, nextScreenData = {}) {
		if (application.length) application.remove(application.first);
		application.purge();
		switch (nextScreenName) {
			case "DISPLAY_LIST":
				application.add(new ListScreen(locationData));
				break;
			case "SCAN":
				application.add(new WiFiStatusSpinner({ status: "Finding networks..." }));
				this.scan(application, nextScreenData);
				break;
			case "CONFIRM_ADD":
				application.add(new ConfirmScreen(nextScreenData));
				break;
			case "PUSH_DATA":
				let sanitizedNetworks = {}
				this.networks.map(network => {
					sanitizedNetworks[network.ssid] = network.rssi
				})

				sanitizedNetworks = {
					"name": nextScreenData,
					"networks": {
						"payload": sanitizedNetworks
					}
				}

				let request = new Request({	
					host: "wifitrak.ngrok.io",
					path: "/api/v1/location/add",
					method: "POST",
					body: JSON.stringify(sanitizedNetworks),
					response: String
				});

				request.callback = function(message, value)
				{
					trace(value)
					trace(message)
					if (Request.responseComplete === message) {
						trace(`name: ${value}\n`);
						trace(`message: ${message}\n`);
					}
				}

				application.add(new ListScreen(locationData));
				break;
		}
	}
	scan(application, locationIndex) {
		this.networks = [];
		WiFi.scan({hidden: true}, item => {
			if (item) {
				this.networks.push({ ssid: item.ssid, rssi: item.rssi });
			} else {
				this.networks.sort(compareStrengths)
				application.delegate("doNext", "CONFIRM_ADD", { locationIndex, networks: this.networks.slice(0,7) });
			}
		});
	}
}

Object.freeze(ProvisionerAppBehavior.prototype);

function compareStrengths( a, b ) {
	if ( a.rssi > b.rssi ){
	  return -1;
	}
	if ( a.rssi < b.rssi ){
	  return 1;
	}
	return 0;
}

export default function() {
	return new Application(null, {
		displayListLength: 8092, commandListLength: 2048, touchCount: 1, Behavior: ProvisionerAppBehavior
	});
}



