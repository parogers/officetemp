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
var Sprites = require("./sprites");
var Thing = require("./thing");
var getImage = Resource.getImage;

class Cabinet extends Thing
{
    constructor() {
	super();
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

    spawn(gameScreen) {
    }
}

class PaperStack extends Thing
{
    constructor(aisle, args) {
	super();
	this.aisle = aisle;
	this.velx = (args && args.velx) || 100;
	this.size = (args && args.size) || 'small';
	this.falling = false;
	this.vely = 0;

	this.sprite = new PIXI.Sprite(
	    getImage(Resource.SPRITES, 'paperstack_' + this.size));
    }

    spawn(gameScreen) {
	this.gameScreen = gameScreen;
	this.aisle.onCounter.addChild(this.sprite);
	this.sprite.position.set(this.aisle.width, -this.height);
    }

    update(dt)
    {
	if (this.falling) {
	    // Falling off the screen
	    this.vely += 200*dt;
	    this.sprite.position.x += this.velx*dt/2;
	    this.sprite.position.y += this.vely*dt;

	    if (this.sprite.position.y > this.aisle.counter.height/2) {
		// Hit the floor
		this.gameScreen.removeThing(this);
		// ...
	    }
	    
	} else {
	    // Sliding across the counter top
	    let rightEdge = this.sprite.position.x + this.sprite.width;
	    this.sprite.position.x += dt*this.velx;
	    if (this.velx > 0 && rightEdge > this.gameScreen.getAisleEnd())
	    {
		// Fell off the counter top (being returned to the player)
		this.falling = true;
	    }
	    if (this.velx < 0 && rightEdge < 0)
	    {
		// Fell off the counter (being thrown by the player)
		this.gameScreen.removeThing(this);
	    }
	}
    }
}

class SuitGuy extends Thing
{
    constructor(aisle) {
	super();
	let img = getImage(Resource.SPRITES, 'bluesuit_idle');
	this.sprite = new PIXI.Sprite(img);
	this.sprite.anchor.set(0.5, 1);
	this.state = SuitGuy.STATES.ADVANCING;
	this.lastState = -1;
	this.aisle = aisle;
	this.speed = 30;
	this.frame = 0;
	this.timer = 0;
    }

    spawn(gameScreen) {
	this.aisle.behindCounter.addChild(this.sprite);
	this.sprite.position.y = 2;
    }

    setImage(name) {
	let img = getImage(Resource.SPRITES, 'bluesuit_' + name);
	this.sprite.texture = img;
    }

    update(dt) {
	let stateChanged = (this.state !== this.lastState);
	this.lastState = this.state;
	
	if (this.state === SuitGuy.STATES.ADVANCING) {
	    if (stateChanged) {
		this.setImage('throw');
		this.timer = 0.5;
	    }
	    this.sprite.position.x += dt*this.speed;
	    this.timer -= dt;
	    if (this.timer <= 0) {
		this.state = SuitGuy.STATES.PAUSING;
	    }
	}
	else if (this.state === SuitGuy.STATES.SIGNING) {
	}
	else if (this.state === SuitGuy.STATES.PUSHED) {
	}
	else if (this.state === SuitGuy.STATES.PAUSING) {
	    if (stateChanged) {
		this.timer = 2;
	    }
	    
	    let frames = ['throw', 'fist'];
	    this.frame += 2*dt;

	    let img = frames[(this.frame|0) % frames.length];
	    this.setImage(img);
	    
	    this.timer -= dt;
	    if (this.timer <= 0) {
		this.state = SuitGuy.STATES.ADVANCING;
	    }
	}
    }
}

SuitGuy.STATES = {
    ADVANCING: 0,
    SIGNING: 1,
    PUSHED: 2,
    PAUSING: 3,
};

module.exports = {
    PaperStack: PaperStack,
    Cabinet: Cabinet,
    SuitGuy: SuitGuy,
};
