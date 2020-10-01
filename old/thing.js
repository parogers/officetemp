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

const EventEmitter = require('events');

class Thing
{
    constructor() {
	this.events = new EventEmitter();
    }

    get on() {
	return this.events.on.bind(this.events);
    }

    update(dt) {
    }

    spawn(screen) {
    }

    despawn() {
	if (this.sprite && this.sprite.parent) {
	    this.sprite.parent.removeChild(this.sprite);
	}
    }

    get width() {
	if (this.sprite) return this.sprite.width;
	return 0;
    }

    get height() {
	if (this.sprite) return this.sprite.height;
	return 0;
    }

    get position() {
	return this.sprite.position;
    }
}

module.exports = Thing;
