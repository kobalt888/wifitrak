import config from "mc/config";
import {Request} from "http"
import Timer from "timer";

if (config.ssid === "REPLACE")
	throw new Error("Wi-Fi SSID required");

import WiFi from "wifi";

WiFi.mode = 1;

let networks = {};
let postBody = {};

function scan() {
	WiFi.scan({hidden: true}, item => {
		if (item) {
			networks[item.ssid] = item.rssi;
		} else {
			postBody = {
				"deviceid": 24,
				"networks": {
					"payload": networks
				}
			}

			networks = {}
			trace(`${JSON.stringify(postBody)}\n`)
		
			let request = new Request({	
				host: "wifitrak.ngrok.io",
				path: "/api/v1/location/submitdata",
				method: "POST",
				body: JSON.stringify(postBody),
				response: String
			});
		
			request.callback = () => {}

			postBody = {}
			Timer.set(id => scan(), 5000);
		}
	});
}

scan()

