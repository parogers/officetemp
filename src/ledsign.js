/* officetemper - A game about temp work
 * Copyright (C) 2017  Peter Rogers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var Thing = require("./thing");
var Resource = require("./resource");

class LEDSign extends Thing
{
    constructor()
    {
	super();
	this.scrollSpeed = 10;
	this.sprite = new PIXI.Container();
	
	let img = Resource.getImage(Resource.OFFICE, 'office_sign');
	this.bg = new PIXI.Sprite(img);
	this.bg.anchor.set(0, 0);
	this.sprite.addChild(this.bg);

	this.textSprites = [];

	this.textContainer = new PIXI.Container();
	this.textContainer.position.set(6, 4.25);
	this.sprite.addChild(this.textContainer);
    }

    spawn(screen) {
	screen.stage.addChild(this.sprite);
	this.sprite.position.set(8, 0);
    }

    update(dt) {
	// Note that the graphics clipping mask is given in global/screen
	// coordinates. (ie after scaling)
	// TODO - optimize this so that the clipping mask is only updated
	// when the bounds actually change
	let rect = this.bg.getBounds();
	let scale = rect.width / this.bg.width;
	
	this.textContainer.mask = new PIXI.Graphics().drawRect(
	    rect.x + scale*4, rect.y,
	    rect.width - scale*9, rect.height);

	// Messages constantly scroll to the left
	for (let text of this.textContainer.children) {
	    text.position.x -= this.scrollSpeed*dt;
	}
	// Remove elements as they scroll off the display
	let first = this.textContainer.children[0];
	if (first && first.position.x + first.width < 0) {
	    this.textContainer.removeChild(first);
	}
    }

    addMessage(msg, opts) {
	let separator = (opts && opts.separator) || ' ';

	if (this.textContainer.children.length > 0) {
	    msg = separator + msg;
	}
	console.log(">" + msg);
	
	let text = new PIXI.extras.BitmapText(
	    msg, {
		font : {
		    'name' : 'ledfont',
		    'size' : 6,
		}
	    }
	);
	// Append the message to the end of the list
	for (let other of this.textContainer.children) {
	    text.position.x += other.width;
	}
	this.textContainer.addChild(text);
    }
}

module.exports = LEDSign;

