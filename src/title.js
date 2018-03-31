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

var Resource = require("./resource");

class TitleScreen
{
    constructor() {
	this.stage = new PIXI.Container();
    }

    start() {
	console.log("TITLE");
	this.timer = 0;
	this.terranceX = 200;
	this.terranceY = 110;
	this.terrance = new PIXI.Sprite(
	    Resource.getImage(Resource.SPRITES, "terrance_frazzled"));
	this.terrance.anchor.set(0.5, 1);
	this.terrance.scale.set(1.35);
	this.terrance.position.set(this.terranceX, this.terranceY);
	this.stage.addChild(this.terrance);

	this.sweaterGuy = new PIXI.Sprite(
	    Resource.getImage(Resource.SPRITES, "sweater_drink1"));
	this.sweaterGuy.anchor.set(0.5, 1);
	this.sweaterGuy.scale.set(1.35);
	this.sweaterGuy.position.set(50, 110);
	this.stage.addChild(this.sweaterGuy);
    }

    update(dt) {
	this.timer += dt;
	this.terrance.position.set(
	    this.terranceX + 0.75*Math.cos(this.timer/20),
	    this.terranceY + 0.5*Math.sin(this.timer/15));
    }

    getStage() {
	return this.stage;
    }

    isDone() {
	return false;
    }
}

module.exports = TitleScreen;

