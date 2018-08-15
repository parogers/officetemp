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

const Process = require("./process");
const Resource = require("./resource");
const Player = require("./player");
const Sprites = require("./sprites");
const SuitGuy = require('./suitguy');
const Aisle = require("./aisle");
const getImage = Resource.getImage;
const LEDSign = require("./ledsign");

const AISLE_YPOS_LIST = [72, 111, 150];

class GameScreen
{
    constructor(controls) {
	this.stage = new PIXI.Container();
	//this.process = new Process();
	this.controls = controls;
	this.timer = 0;
	this.aisle = 0;
	this.player = null;
	this.things = [];
    }

    getAisle(n) {
	return this.aisleList[n];
    }

    getAisleEnd() {
	return this.aisleList[0].width;
    }

    getNumAisles() {
	return this.aisleList.length;
    }

    start() {
	this.background = getImage(Resource.OFFICE, 'office_carpet');
	this.stage.addChild(new PIXI.Sprite(this.background));

	let img = getImage(Resource.OFFICE, 'office_shadows');
	this.stage.addChild(new PIXI.Sprite(img));

	img = getImage(Resource.OFFICE, 'office_wall');
	this.stage.addChild(new PIXI.Sprite(img));

	this.aisleList = [];
	for (let ypos of AISLE_YPOS_LIST) {
	    let aisle = new Aisle();
	    aisle.position.set(0, ypos);
	    this.stage.addChild(aisle.sprite);
	    this.aisleList.push(aisle);
	}
	this.player = new Player(this.controls);
	this.addThing(this.player);

	let guy = new SuitGuy(this.aisleList[1]);
	this.addThing(guy);

	this.ledSign = new LEDSign();
	this.ledSign.position.set(8, 0);
	this.addThing(this.ledSign);

	this.ledSign.addMessage("HELLO WORLD");
	this.ledSign.addMessage("THIS IS ANOTHER THING", {
	    separator: " *** "
	});
    }

    addThing(thing) {
	this.things.push(thing);
	thing.spawn(this);
    }

    removeThing(thing) {
	let i = this.things.indexOf(thing);
	if (i != -1) {
	    this.things[i] = this.things[this.things.length-1];
	    this.things.pop();
	    thing.despawn();
	}
    }

    getStage() {
	return this.stage;
    }

    get width() {
	return this.background.width;
    }

    get height() {
	return this.background.height;
    }

    update(dt) {
	this.timer += dt;
	for (let thing of this.things) {
	    if (thing.update) thing.update(dt);
	}
    }

    isDone() {
	return false;
    }
}

module.exports = GameScreen;
