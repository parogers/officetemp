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
    constructor(size, args) {
	super();
	this.sprite = new PIXI.Sprite(
	    getImage(Resource.SPRITES, 'paperstack_' + size));
	this.speed = (args && args.speed) || 100;
    }

    spawn(gameScreen) {
	this.gameScreen = gameScreen;
    }

    update(dt)
    {
	this.sprite.position.x += dt*this.speed;

	if (this.sprite.position.x + this.sprite.width < 0 ||
	    this.sprite.position.x > this.gameScreen.width)
	{
	    this.gameScreen.removeThing(this);
	}
    }
}

module.exports = {
    PaperStack: PaperStack,
    Cabinet: Cabinet,
};
