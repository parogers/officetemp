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

const { getSprite } = require('./resource');

class NextScreen
{
    constructor() {
	this.timer = 3;
    }

    start() {
	// TODO - lots of magic numbers here
	this.stage = new PIXI.Container();
	this.stage.scale.set(1.5);

	let bg = new PIXI.Sprite(getSprite('colours_black'));
	bg.scale.set(6, 4);
	this.stage.addChild(bg);

	let portrait = new PIXI.Sprite(getSprite('portraits_terrance'));
	portrait.position.set(65, 30);
	this.stage.addChild(portrait);

	let msg = 'GET READY!';
	let text = new PIXI.extras.BitmapText(
	    msg, {
		font : {
		    'name' : 'boxybold',
		    'size' : 6,
		}
	    }
	);
	text.position.set(53, 62);
	this.stage.addChild(text);
    }

    update(dt) {
	this.timer -= dt;
    }

    getStage() {
	return this.stage;
    }

    isDone() {
	return this.timer <= 0;
    }
}

module.exports = NextScreen;
