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

import { EventEmitter } from '@angular/core';

import { Thing } from './thing';

export class Tween extends Thing
{
    target : any;
    src : any;
    dest : any;
    interpolate : any;
    duration: number;
    elapsed : number;
    done : boolean = false;

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

    update(dt)
    {
        this.elapsed += dt;
        let param = this.elapsed / this.duration;
        if (param > 1) param = 1;

        let pos = this.interpolate(param, this.src, this.dest);
        this.target.position.set(pos[0], pos[1]);

        if (param >= 1) {
            this.done = true;
            return false;
        }
        return true;
    }
}

export const LinearInterp = function(param, src, dest) {
    //param = Math.pow(param, 0.25);
    let dx = param*(dest[0] - src[0]);
    let dy = param*(dest[1] - src[1]);
    return [src[0] + dx, src[1] + dy];
};

export const LinearSlowdownInterp = function(param, src, dest) {
    param = Math.pow(param, 0.25);
    let dx = param*(dest[0] - src[0]);
    let dy = param*(dest[1] - src[1]);
    return [src[0] + dx, src[1] + dy];
};

export const EaseInOut = function(t, src, dest)
{
    // This equation gives us a nice S-curve shape. It was found by messing
    // around in gnuplot until the graph looked good enough.
    let t0 = (1-(1-t)**3)**4;
    let dx = t0*(dest[0] - src[0]);
    let dy = t0*(dest[1] - src[1]);
    return [src[0] + dx, src[1] + dy];
}
