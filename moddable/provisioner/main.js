import {} from "piu/MC";
import config from "mc/config";
import LOCATIONS from "locations";
import {ListScreen} from "list-screen";
import {ConfirmScreen} from "confirm-screen";
import {WiFiStatusSpinner} from "utils"

if (config.ssid === "REPLACE")
	throw new Error("Wi-Fi SSID required");

import WiFi from "wifi";
WiFi.mode = 1;

let locationData = LOCATIONS.split(".").map((item, index) => ({ locationName:item.trim(), variant:(index % 10) - 5 }));	

class ProvisionerAppBehavior extends Behavior {
	onCreate(application) {
		global.application = application;
		this.doNext(application, "DISPLAY_LIST", locationData);
		application.interval = 2000;
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
		}
	}
	scan(application, locationIndex) {
		let networks = [];
		WiFi.scan({hidden: true}, item => {
			if (item) {
				networks.push({ ssid: item.ssid, rssi: item.rssi });
			} else {
				networks.sort(compareStrengths)
				application.delegate("doNext", "CONFIRM_ADD", { locationIndex, networks: networks.slice(0,5) });
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



