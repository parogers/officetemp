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
var Resource = require("./resource");
var getImage = Resource.getImage;

var STATE = {
    IDLE: 0,
    MOVING: 1,
    SEARCHING: 2,
};

class Player
{
    constructor(controls, aisleList) {
	this.sprite = new PIXI.Sprite(
	    getImage(Resource.SPRITES, 'terrance_idle'));
	this.sprite.anchor.set(0.5, 1);
	this.state = STATE.IDLE;
	this.lastState = -1;
	this.aisleList = aisleList;
	this.aisle = 0;
	this.timer = 0;
	this.nextAisle = -1;
	this.controls = controls;
    }

    getAisle() {
	return this.aisleList[this.aisle];
    }

    setImage(name) {
	this.sprite.texture = getImage(Resource.SPRITES, name);
    }

    update(dt)
    {
	let stateChanged = (this.lastState != this.state);
	this.lastState = this.state;
	if (this.state == STATE.IDLE)
	{
	    if (stateChanged) {
		// Done searching
		this.sprite.scale.x = 1;
		this.sprite.position.x = 0;
		this.setImage('terrance_idle');
	    }

	    // Handle up/down movement
	    this.nextAisle = -1;
	    if (this.controls.up.justPressed && this.aisle > 0)
	    {
		this.nextAisle = this.aisle-1;
	    }
	    if (this.controls.down.justPressed &&
		this.aisle < this.aisleList.length-1)
	    {
		this.nextAisle = this.aisle+1;
	    }
	    if (this.nextAisle != -1)
	    {
		let dy = (this.aisleList[this.aisle].getY() -
			  this.aisleList[this.nextAisle].getY());
		this.tween = new Tween(this.sprite, {
		    src: [this.sprite.position.x, this.sprite.position.y],
		    dest: [this.sprite.position.x, this.sprite.position.y-dy],
		    duration: 0.1,
		    interpolate: Tween.Linear,
		});
		this.state = STATE.MOVING;
		return;
	    }
	    // Handle searching
	    if (this.controls.right.justPressed) {
		this.state = STATE.SEARCHING;
	    }
	}
	else if (this.state == STATE.MOVING)
	{
	    // The player is moving between aisles
	    if (!this.tween.update(dt))
	    {
		this.aisleList[this.aisle].removePlayerSprite();
		this.aisleList[this.nextAisle].addPlayerSprite(this.sprite);
		this.aisle = this.nextAisle;
		this.tween = null;
		this.state = STATE.IDLE;
		this.sprite.position.y = 0;
	    }
	}
	else if (this.state == STATE.SEARCHING)
	{
	    if (stateChanged) {
		// The player is searching the filing cabinet
		this.setImage('terrance_search');
		this.sprite.position.x = 14;
		this.sprite.position.y = -1;
		this.sprite.scale.x = -1;
		// Open the cabinet
		this.getAisle().cabinet.setOpen(true);
		// Have the player searching for a minimum amount of time
		this.timer = 0.25;
	    }
	    this.timer -= dt;
	    if (!this.controls.right.held && this.timer <= 0)
	    {
		this.state = STATE.IDLE;
		// Close the cabinet
		this.getAisle().cabinet.setOpen(false);
	    }
	}
    }
};

module.exports = Player;
