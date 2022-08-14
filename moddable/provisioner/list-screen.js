import ScrollerBehavior from "scroller-behavior";

const itemSkin = new Skin({ fill:[ "#192eab", "black" ] });
const itemStyle = new Style({ font:"20px Open Sans", color:"white", horizontal:"left" });

class ListBehavior extends Behavior {
	countItems(port) {
		return this.LOCATIONS.length;
	}
	drawItem(port, index, x, y, width, height) {
		let item = this.LOCATIONS[index];

		port.skin = null;
		port.style = itemStyle;
		port.drawLabel(item.locationName, x + height, y, width - height, height, true);
	}
	invalidateItem(port, index) {
		let delta = this.delta;
		port.invalidate(port.x, delta * index, port.width, delta);
	}
	measureItem(port) {
		return 40;
	}
	onCreate(port, LOCATIONS) {
		this.LOCATIONS = LOCATIONS;
		this.delta = this.measureItem(port);
		this.hit = -1;
		this.state = 0;
		port.duration = 500;
	}
	onMeasureVertically(port, height) {
		return this.countItems(port) * this.delta;
	}
	onDraw(port, x, y, width, height) {
		port.state = 0;
		port.skin = itemSkin;
		port.drawContent(x, y, width, height);

		let delta = this.delta;
		let hit = this.hit;
		let index = Math.floor(y / delta);
		let limit = y + height;
		x = 0;
		y = index * delta;
		width = port.width;
		while (y < limit) {
			if (hit == index) {
				port.state = this.state;
				port.skin = itemSkin;
				port.drawContent(x, y, width, delta);
				port.state = 0;
			}

			this.drawItem(port, index, x, y, width, delta);
			index++;
			y += delta;
		}
	}
	onFinished(port) {
		this.hit = -1;
		port.stop();
	}
	onTimeChanged(port) {
		this.state = 1 - port.fraction;
		this.invalidateItem(port, this.hit);
	}
	onTouchBegan(port, id, x, y) {
		port.stop();
		let delta = this.delta;
		let index = Math.floor((y - port.y) / delta);
		this.hit = index;
		this.state = 1;
		this.invalidateItem(port, index);
	}
	onTouchCancelled(port, id, x, y) {
		port.time = 0;
		port.start();
	}
	onTouchEnded(port, id, x, y) {
		this.tapItem(port, this.hit);
		port.time = 0;
		port.start();
	}
	tapItem(port, index) {
		application.delegate("doNext", "SCAN", this.LOCATIONS[index] );
	}

};

export const ListScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, Skin:Skin.template({ fill: "#000000" }),
	contents: [
		new Scroller($, { 
			left:0, right:0, top:0, bottom:0, active:true, backgroundTouch:true, Behavior: ScrollerBehavior,
			contents: [
				Port($, {left:0, right:0, top:0, active:true, Behavior: ListBehavior }),
			]
		}),
	]
}));