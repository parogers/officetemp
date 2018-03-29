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

var spaceKey;
var velx = 0;
var vely = 0;
var accelx = 0;
var accely = 0;
var timer = 1;

class DemoScreen
{
    preload() 
    {
	this.game.load.atlas(
	    'sprites', 'media/sprites.png', 'media/sprites.json?time=' + (new Date()).getTime());
	this.game.load.audio('hit', 'hit.wav');
    }

    create() 
    {
    }

    update() 
    {
	var dt = this.game.time.elapsedMS/1000.0;
    }

    render()
    {
    }
}

module.exports = DemoScreen;
