import {} from "piu/MC";

const buttonTexture = new Texture("button.png");
const buttonSkin = new Skin({ texture:buttonTexture, x:0, y:0, width:60, height:40, states:40, tiles:{ left:20, right:20 } });
const buttonStyle = new Style({ font:"20px Open Sans", color:["black", "white"], });
const itemStyle = Style.template({ font: "20px Open Sans", vertical: "middle", horizontal: "center", color: "#FFFFFF" });
const itemStyle2 = Style.template({ font: "semibold 16px Open Sans", vertical: "middle", horizontal: "left", color: "#FFFFFF" });

class ConfirmBehavior extends Behavior {
	onTouchBegan(port, id, x, y) {
		application.delegate("doNext", "DISPLAY_LIST", {});
		port.time = 0;
		port.start();
	}
};

class CancelBehavior extends Behavior {
	onTouchBegan(port, id, x, y) {
		application.delegate("doNext", "DISPLAY_LIST", {});
		port.time = 0;
		port.start();
	}
};

const WifiPane = Column.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, active: true,
	contents:[
		Text($, {
			top: 80, height: 32, left: 0, right: 0, Style: itemStyle,
			string: `WifiPane`
		}),
		Text($, {
			top: 80, height: 20, left: 0, right: 0, Style: itemStyle2,
			string: `${$.networks[0].ssid} [DB]: ${$.networks[0].rssi}`
		}),
		Text($, {
			top: 130, height: 20, left: 0, right: 0, Style: itemStyle2,
			string: `${$.networks[1].ssid} [DB]: ${$.networks[1].rssi}`
		}),
		Text($, {
			top: 150, height: 20, left: 0, right: 0, Style: itemStyle2,
			string: `${$.networks[2].ssid} [DB]: ${$.networks[2].rssi}`
		}),
		Text($, {
			top: 170, height: 20, left: 0, right: 0, Style: itemStyle2,
			string: `${$.networks[3].ssid} [DB]: ${$.networks[3].rssi}`
		}),
		Text($, {
			top: 190, height: 20, left: 0, right: 0, Style: itemStyle2,
			string: `${$.networks[4].ssid} [DB]: ${$.networks[4].rssi}`
		}),
		// getWifiList($.networks)
	]
}));

// function getWifiList(networks){
// 	if(!networks){
// 		return Text($, {
// 			top: 80, height: 32, left: 0, right: 0, Style: itemStyle,
// 			string: `No Wifi Networks Detected`
// 		})
// 	} else {
// 		let output = networks.map(network => {
// 			return Text(network, {
// 				top: 80, height: 32, left: 0, right: 0, Style: itemStyle,
// 				string: `Network: ${network.name} Strength: ${network.rssi}`
// 			})
// 		});

// 		return output;
// 	}
// }

const halfOfPi = (Math.PI/2);
function getX(t, b, c, d) {
  return c * Math.sin(t/d * halfOfPi) + b;
}
function getY(x, r) {
  return Math.sqrt((r*r) - (x*x));
}

class CircleOfSquaresBehavior extends Behavior {
	onDisplaying(port) {
	  this.r = (port.width-8) / 2;
	  this.centerCoord = this.r;
	}
	onDraw(port) {
	  port.fillColor("#FFFFFF", 0,0, port.width, port.height);
	  let r = this.r;
	  let centerCoord = this.centerCoord;
	  let x, y;
	  for (let i = 0; i < 9; i++) {
		x = getX(i, 0, r, 9);
		y = getY(x, r);
		// Top left quadrant
		port.fillColor("#cce6ff", centerCoord+x, centerCoord-y, 8, 8);
		// Bottom left quadrant
		port.fillColor("#cce6ff", centerCoord+y, centerCoord+x, 8, 8);
		// Bottom right quadrant
		port.fillColor("#cce6ff", centerCoord-x, centerCoord+y, 8, 8);
		// Top right quadrant
		port.fillColor("#cce6ff", centerCoord-y, centerCoord-x, 8, 8);
	  }
	}
  }
Object.freeze(CircleOfSquaresBehavior.prototype);

const OpenSans16 = Style.template({ font: "semibold 16px Open Sans", vertical: "middle", horizontal: "center" });
const WhiteSkin = Skin.template({ fill: "#FFFFFF" });

export const WiFiStatusSpinner = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, Skin: WhiteSkin,
	contents: [
	  Port($, {
		top: 30, height: 145, width: 145,
		Behavior: CircleOfSquaresBehavior,
	  }),
	  Port($, {
		loop: true, duration: 2000,
		top: 30, height: 145, width: 145,
		Behavior: AnimatedCircleOfSquaresBehavior,
	  }),
	  Label($, {
		bottom: 30, height: 18, left:0, right: 0, Style: OpenSans16, string: $.status,
	  }),
	],
}));

class AnimatedCircleOfSquaresBehavior extends Behavior {
	onDisplaying(port) {
	  let r = this.r = (port.width-8) / 2;
	  let centerCoord = this.centerCoord = r;
	  let last6coords = this.last6coords = new Int16Array(12).fill(centerCoord - r);
	  let startY = centerCoord;
	  for (let i = 1; i < 12; i += 2) {
		last6coords[i] = startY;
	  }
	  this.index = 0;
	  port.interval = port.duration / 36; // 36 is number of squares
	  port.start();
	}
	onTimeChanged(port) {
	  this.index++;
	  if (this.index == 36) this.index = 0;
	  let index = this.index;
	  let r = this.r;
	  let last6coords = this.last6coords;
	  let centerCoord = this.centerCoord;
	  let step = index % 9;
	  let nextX, nextY;
	  let x = getX(step, 0, r, 9);
	  let y = getY(x, r);
	  if (index < 9) {
		nextX = centerCoord-y;
		nextY = centerCoord-x;
	  }
	  else if (index < 18) {
		nextX = centerCoord+x;
		nextY = centerCoord-y;
	  }
	  else if (index < 27) {
		nextX = centerCoord+y;
		nextY = centerCoord+x;
	  }
	  else {
		nextX = centerCoord-x;
		nextY = centerCoord+y;
	  }
	  last6coords.copyWithin(2, 0);
	  last6coords[0] = nextX;
	  last6coords[1] = nextY;
	  port.invalidate();
	}
	onDraw(port) {
	  let last6coords = this.last6coords;
	  port.fillColor("#005cb3", last6coords[1], last6coords[0], 8, 8);
	  port.fillColor("#0082ff", last6coords[3], last6coords[2], 8, 8);
	  port.fillColor("#339cff", last6coords[5], last6coords[4], 8, 8);
	  port.fillColor("#66b5ff", last6coords[7], last6coords[6], 8, 8);
	  port.fillColor("#99ceff", last6coords[9], last6coords[8], 8, 8);
	  port.fillColor("#cce6ff", last6coords[11], last6coords[10], 8, 8);
	} 
}
Object.freeze(AnimatedCircleOfSquaresBehavior.prototype);

export const ConfirmScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, Skin:Skin.template({ fill: "#000000" }), style:buttonStyle,
	contents: [
		Container($, {
			left:2, right:2, top:2, bottom:2, clip:true,
			contents: [
				Text($, {
					top: 20, height: 32, left: 0, right: 0, Style: itemStyle,
					string: `Add data point for ${$.locationIndex.locationName}?`
				}),
				Text($, {
					top: 110, height: 20, left: 0, right: 0, Style: itemStyle2,
					string: `${$.networks[0].ssid} @ ${$.networks[0].rssi} db`
				}),
				Text($, {
					top: 130, height: 20, left: 0, right: 0, Style: itemStyle2,
					string: `${$.networks[1].ssid} @ ${$.networks[1].rssi} db`
				}),
				Text($, {
					top: 150, height: 20, left: 0, right: 0, Style: itemStyle2,
					string: `${$.networks[2].ssid} @ ${$.networks[2].rssi} db`
				}),
				Text($, {
					top: 170, height: 20, left: 0, right: 0, Style: itemStyle2,
					string: `${$.networks[3].ssid} @ ${$.networks[3].rssi} db`
				}),
				Text($, {
					top: 190, height: 20, left: 0, right: 0, Style: itemStyle2,
					string: `${$.networks[4].ssid} @ ${$.networks[4].rssi} db`
				}),
				Label($, { left:10, top:260, width:100, height:40, skin:buttonSkin, string:"Add", active:true, Behavior:ConfirmBehavior }),
				Label($, { left:120, top:260, width:100, height:40, skin:buttonSkin, string:"Cancel", active:true, Behavior:CancelBehavior })
			]
		})
	]
}));