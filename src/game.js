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
var Player = require("./player");
var getImage = Resource.getImage;

var AISLE_YPOS_LIST = [72, 111, 150];

class Aisle
{
    constructor() {
	// The container holds everything in this aisle
	this.container = new PIXI.Container();
	// Things that are behind the counter
	this.behindCounter = new PIXI.Container();
	this.behindCounter.position.set(0, -5);
	this.container.addChild(this.behindCounter);

	this.counter = new PIXI.Sprite(
	    getImage(Resource.OFFICE, 'office_desk1'));
	this.counter.anchor.set(0, 1);
	//this.counter.position.set(0, ypos);
	this.container.addChild(this.counter);

	this.cabinet = new Cabinet();
	this.cabinet.sprite.position.set(220, -4);
	this.container.addChild(this.cabinet.sprite);

	this.cabinetArea = new PIXI.Container();
	this.cabinetArea.position.set(205, -5);
	this.container.addChild(this.cabinetArea);

	this.player = null;
    }

    get sprite() {
	return this.container;
    }

    getY() {
	return this.container.position.y;
    }

    addPlayerSprite(player) {
	this.cabinetArea.addChild(player);
	this.player = player;
    }

    removePlayerSprite() {
	if (this.player) {
	    this.cabinetArea.removeChild(this.player);
	    this.player = null;
	}
    }
}

class Cabinet
{
    constructor() {
	this.sprite = new PIXI.Sprite();
	this.sprite.anchor.set(0, 1);
	this.setOpen(false);
    }

    setOpen(b) {
	let img = null;
	if (b) img = 'cabinet_open';
	else img = 'cabinet_closed';
	this.sprite.texture = getImage(Resource.SPRITES, img);
    }
}

class Document
{
    constructor() {
	this.sprite = new PIXI.Sprite(
	    getImage(Resource.SPRITES, 'paperstack_1'));
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
	this.player = null;
    }

    start() {
	let img = getImage(Resource.OFFICE, 'office_carpet');
	this.stage.addChild(new PIXI.Sprite(img));

	img = getImage(Resource.OFFICE, 'office_shadows');
	this.stage.addChild(new PIXI.Sprite(img));

	img = getImage(Resource.OFFICE, 'office_wall');
	this.stage.addChild(new PIXI.Sprite(img));

	this.aisleList = [];
	for (let ypos of AISLE_YPOS_LIST) {
	    let aisle = new Aisle();
	    aisle.sprite.position.set(0, ypos);
	    this.stage.addChild(aisle.sprite);
	    this.aisleList.push(aisle);
	}
	this.player = new Player(this.controls, this.aisleList);
	this.aisleList[this.aisle].addPlayerSprite(this.player.sprite);
    }

    getStage() {
	return this.stage;
    }

    update(dt) {
	this.timer += dt;
	this.player.update(dt);
    }

    isDone() {
	return false;
    }
}

module.exports = GameScreen;
