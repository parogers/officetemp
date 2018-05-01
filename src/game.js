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

var Tween = require("./tween");
var Process = require("./process");
var Resource = require("./resource");
var getImage = Resource.getImage;

var AISLE_YPOS_LIST = [72, 111, 150];

class Aisle
{
    constructor() {
	// The container holds everything in this aisle
	this.container = new PIXI.Container();
	// Things that are behind the counter
	this.behind = new PIXI.Container();
	this.behind.position.set(0, -5);
	this.container.addChild(this.behind);

	this.counter = new PIXI.Sprite(
	    getImage(Resource.OFFICE, 'office_desk1'));
	this.counter.anchor.set(0, 1);
	//this.counter.position.set(0, ypos);
	this.container.addChild(this.counter);

	this.cabinet = new PIXI.Sprite(
	    getImage(Resource.SPRITES, 'cabinet_closed'));
	this.cabinet.anchor.set(0, 1);
	this.cabinet.position.set(220, -4);
	this.container.addChild(this.cabinet);

	this.player = null;
    }

    addPlayer(player) {
	this.behind.addChild(player);
	this.player = player;
    }

    removePlayer() {
	if (this.player) {
	    this.behind.removeChild(this.player);
	    this.player = null;
	}
    }
}

class GameScreen
{
    constructor(controls) {
	this.stage = new PIXI.Container();
	this.process = new Process();
	this.controls = controls;
	this.timer = 0;
	this.aisle = 0;
    }

    start() {
	let img = getImage(Resource.OFFICE, 'office_carpet');
	this.background = new PIXI.Sprite(img);
	this.stage.addChild(this.background);

	this.shadows = new PIXI.Sprite(
	    getImage(Resource.OFFICE, 'office_shadows'));
	this.stage.addChild(this.shadows);

	this.wall = new PIXI.Sprite(
	    getImage(Resource.OFFICE, 'office_wall'));
	this.stage.addChild(this.wall);

	this.aisleList = [];
	for (let ypos of AISLE_YPOS_LIST) {
	    let aisle = new Aisle();
	    aisle.container.position.set(0, ypos);
	    this.stage.addChild(aisle.container);
	    this.aisleList.push(aisle);
	}

	this.terrance = new PIXI.Sprite(
	    getImage(Resource.SPRITES, 'terrance_idle'));
	this.terrance.anchor.set(0.5, 1);
	this.terrance.position.set(210, 0);
	this.aisleList[this.aisle].addPlayer(this.terrance);
    }

    getStage() {
	return this.stage;
    }

    update(dt) {
	this.timer += dt;

	let nextAisle = -1;
	if (this.controls.up.justPressed && this.aisle > 0) {
	    nextAisle = this.aisle-1;
	}
	else if (this.controls.down.justPressed &&
		 this.aisle < this.aisleList.length-1)
	{
	    nextAisle = this.aisle+1;
	}

	if (nextAisle != -1) {
	    this.aisleList[this.aisle].removePlayer();
	    this.aisleList[nextAisle].addPlayer(this.terrance);
	    this.aisle = nextAisle;
	}
    }

    isDone() {
	return false;
    }
}

module.exports = GameScreen;
