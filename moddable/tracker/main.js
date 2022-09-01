import config from "mc/config";
import {Request} from "http"
import Timer from "timer";

if (config.ssid === "REPLACE")
	throw new Error("Wi-Fi SSID required");
if (config.passowrd === "REPLACE")
	throw new Error("Wi-Fi Password required");
if (config.device_id === "REPLACE")
	throw new Error("Device ID required");

import WiFi from "wifi";

WiFi.mode = 1;

let networks = {};
let postBody = {};
let scanCount = 0;
function scan() {
	WiFi.scan({hidden: true}, item => {
		if (item) {
			if(networks[item.ssid]){
				networks[item.ssid] = Math.round((networks[item.ssid]*scanCount + item.rssi) / (scanCount + 1))
			}
			else if (item.ssid != ""){
				networks[item.ssid] = item.rssi;
			}
		} else {
			scanCount += 1;
			if(scanCount > 20){
				scanCount = 0;
				postBody = {
					"deviceid": parseInt(config.device_id),
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
			}
			Timer.set(id => scan(), 500);
		}
	});
}

scan()

