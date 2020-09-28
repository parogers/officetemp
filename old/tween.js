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

const Thing = require('./thing');

class Tween extends Thing
{
    constructor(target, args)
    {
	super();
	this.target = target;
	this.src = args.src;
	this.dest = args.dest;
	this.interpolate = args.interpolate;
	this.duration = args.duration;
	this.elapsed = 0;
    }

    update(dt) {
	this.elapsed += dt;
	let param = this.elapsed / this.duration;
	if (param > 1) param = 1;

	let pos = this.interpolate(param, this.src, this.dest);
	this.target.position.set(pos[0], pos[1]);
	
	if (param >= 1) {
	    this.events.emit('done');
	    return false;
	}
	return true;
    }
}

Tween.Linear = function(param, src, dest) {
    //param = Math.pow(param, 0.25);
    let dx = param*(dest[0] - src[0]);
    let dy = param*(dest[1] - src[1]);
    return [src[0] + dx, src[1] + dy];
};

Tween.LinearSlowdown = function(param, src, dest) {
    param = Math.pow(param, 0.25);
    let dx = param*(dest[0] - src[0]);
    let dy = param*(dest[1] - src[1]);
    return [src[0] + dx, src[1] + dy];
};

module.exports = Tween;
