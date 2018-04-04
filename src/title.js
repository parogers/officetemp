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

var TimerList = require("./timer");
var Resource = require("./resource");
var getImage = Resource.getImage;

const SCALE = 1.35;

class TitleScreen
{
    constructor() {
	this.stage = new PIXI.Container();
	this.timers = new TimerList();
    }

    createPaperStack() {
	let img = getImage(Resource.SPRITES, "paperstack_1");
	let papers = new PIXI.Sprite(img);
	papers.scale.set(SCALE);
	return papers;
	//.stage.addChild(this.papers);
    }

    start() {

	console.log("TITLE");
	this.timer = 0;
	this.terranceX = 220;
	this.terranceY = 110;
	this.terrance = new PIXI.Sprite(
	    getImage(Resource.SPRITES, "terrance_idle"));
	this.terrance.anchor.set(0.5, 1);
	this.terrance.scale.set(SCALE);
	this.terrance.position.set(this.terranceX, this.terranceY);
	this.stage.addChild(this.terrance);

	this.sweaterGuy = new PIXI.Sprite(
	    getImage(Resource.SPRITES, "sweater_drink1"));
	this.sweaterGuy.anchor.set(0.5, 1);
	this.sweaterGuy.scale.set(SCALE);
	this.sweaterGuy.position.set(30, 110);
	this.stage.addChild(this.sweaterGuy);

	this.title = new PIXI.Sprite(getImage(Resource.TITLE));
	this.title.scale.set(0.5);
	this.title.anchor.set(0.5, 0.5);
	this.title.position.set(125, 80);
	this.stage.addChild(this.title);

	this.timers.wait(1000).then(() => {
	    console.log("DONE!");
	});
    }

    update(dt) {
	this.timers.update(dt);
	
	this.timer += dt;
	/*
	this.terrance.position.set(
	    this.terranceX + 0.75*Math.cos(this.timer/20),
	    this.terranceY + 0.5*Math.sin(this.timer/15));*/
    }

    getStage() {
	return this.stage;
    }

    isDone() {
	return false;
    }
}

module.exports = TitleScreen;

