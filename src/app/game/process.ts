/*
 * Office Temper - A game about temp work.
 * Copyright (C) 2020  Peter Rogers (peter.rogers@gmail.com)
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
 *
 */

export class Process
{
    callbacks : any[];

    constructor() {
        this.callbacks = [];
    }

    // Adds a callback function or object (which defines an update method)
    // This returns a promise that resolves when the callback is finished.
    // (ie returns false on some future call)
    add(func) {
        return new Promise(resolve => {
            this.callbacks.push(dt => {
                // The callback will run on every call to update (below),
                // until it returns false - where we remove it from the
                // callback list.
                let result = null;

                if (func.update)
                result = func.update(dt);
                else
                result = func(dt);

                if (!result) {
                    resolve();
                    return false;
                }
                return true;
            });
        });
    }

    // Returns a promise that resolves after the given amount of (game) time
    // has elapsed.
    wait(delay)
    {
        let timer = delay;
        return this.add(
            function(dt) {
                timer -= dt;
                return timer > 0;
            }
        );
    }

    update(dt) {
        let n = 0;
        while (n < this.callbacks.length)
        {
            let func = this.callbacks[n];
            if (!func(dt)) {
                let last = this.callbacks.pop();
                if (func !== last) this.callbacks[n] = last;
            } else {
                n++;
            }
        }
    }
}
