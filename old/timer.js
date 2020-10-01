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

class TimerList
{
    constructor() {
	this.timers = [];
    }

    create(callback, delay, arg) {
	let tm = new Timer(callback, delay, arg);
	this.timers.push(tm)
    }

    update(dt) {
	let n = 0;
	while (n < this.timers.length)
	{
	    let timer = this.timers[n];
	    if (!timer.update(dt)) {
		let last = this.timers.pop();
		if (timer !== last) this.timers[n] = last;
	    } else {
		n++;
	    }
	}
    }

    wait(delay) {
	return new Promise((resolve, reject) => {
	    this.create(resolve, delay, "HELLO WORLD");
	});
    }
}

class Timer
{
    constructor(callback, delay, arg) {
	this.callback = callback;
	this.delay = delay;
	this.arg = arg
    }

    update(dt) {
	this.delay -= dt;
	if (this.delay <= 0) {
	    this.callback(this.arg);
	    return false;
	}
	return true;
    }
}

module.exports = TimerList;
