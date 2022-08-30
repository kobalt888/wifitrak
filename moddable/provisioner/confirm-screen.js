import {} from "piu/MC";

const buttonTexture = new Texture("button.png");
const buttonSkin = new Skin({ texture:buttonTexture, x:0, y:0, width:60, height:40, states:40, tiles:{ left:20, right:20 } });

const buttonStyle = new Style({ font:"20px Open Sans", color:["black", "white"], });
const textStyle = Style.template({ font: "20px Open Sans", vertical: "middle", horizontal: "center", color: "#FFFFFF" });
const accesspointStyle = Style.template({ font: "semibold 16px Open Sans", vertical: "middle", horizontal: "left", color: "#FFFFFF" });

class ConfirmBehavior extends Behavior {
	onCreate(content, data) {
		this.locationName = data.locationIndex.locationName
	}
	onTouchBegan(port, id, x, y) {
		application.delegate("doNext", "PUSH_DATA", this.locationName);
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

export const ConfirmScreen = Container.template(($ => ({
	left:0, right:0, top:0, bottom:0, Skin:Skin.template({ fill: "#000000" }), style:buttonStyle,
	contents: [
		Container($, {
			left:2, right:2, top:2, bottom:2, clip:true,
			contents: [
				Text($, {
					top: 20, height: 32, left: 0, right: 0, Style: textStyle,
					string: `Add data point for ${$.locationIndex.locationName}?`
				}),
				$.networks.map((network, index) => {
					return Text(network, {
						top: 70 + index * 25, height: 32, left: 0, right: 0, Style: accesspointStyle,
						string: `${network.ssid} @ ${network.rssi}db`
					});
				}),
				Label($, { left:10, top:260, width:100, height:40, skin:buttonSkin, string:"Add", active:true, Behavior:ConfirmBehavior }),
				Label($, { left:120, top:260, width:100, height:40, skin:buttonSkin, string:"Cancel", active:true, Behavior:CancelBehavior })
			]
		})
	]
})));