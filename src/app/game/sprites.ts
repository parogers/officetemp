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

import { Thing } from './thing';

import { getSprite } from './resource';

declare const PIXI : any;

export class Anim
{
    constructor(names : string[], fps : number)
    {
        this.frames = names.map(name => getSprite(name));
        this.fps = fps;
        this.timer = 0;
    }

    getFrame(dt : number)
    {
        this.timer += dt;

        const frame = ((this.timer*this.fps)|0) % this.frames.length;
        return this.frames[frame];
    }
}

export class Cabinet extends Thing
{
    constructor()
    {
        super();
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0, 1);
        this.setOpen(false);
    }

    setOpen(b) {
        let img = null;
        if (b) img = 'cabinet_open';
        else img = 'cabinet_closed';
        this.sprite.texture = getSprite(img);
    }

    spawn(gameScreen) {
    }
}

export class Scenery extends Thing
{
    frames : any;
    fps : number;
    frame : number;
    screen : any;

    constructor(frames, fps) {
        super();
        this.frames = frames;
        this.fps = fps;
        this.frame = 0;
        this.sprite = new PIXI.Sprite(this.frames[0]);
        this.sprite.anchor.set(0.5, 0.5);
    }

    spawn(screen) {
        this.screen = screen;
    }

    update(dt) {
        if ((this.frame|0) > this.frames.length-1) {
            this.screen.removeThing(this);
        } else {
            this.sprite.texture = this.frames[this.frame|0];
            this.frame += this.fps * dt;
        }
    }
}

export class PaperStack extends Thing
{
    aisle : any;
    velx : number;
    vely : number;
    size : number;
    falling : boolean;
    exploding : boolean;
    frame : number;
    sprite : any;
    gameScreen : any;

    constructor(aisle, args)
    {
        super();
        this.aisle = aisle;
        this.velx = (args && args.velx) || 100;
        this.size = (args && args.size) || 'small';
        this.falling = false;
        this.exploding = false;
        this.vely = 0;
        this.frame = 0;

        this.sprite = new PIXI.Sprite(getSprite('paperstack_' + this.size));
        this.sprite.anchor.set(0, 1);
    }

    spawn(gameScreen) {
        this.gameScreen = gameScreen;
        this.aisle.addPaper(this);
    }

    despawn() {
        this.aisle.removePaper(this);
    }

    areSigned() {
        return this.velx > 0;
    }

    update(dt)
    {
        if (this.falling)
        {
            // Falling off the screen
            this.vely += 300*dt;
            this.sprite.position.x += this.velx*dt/2;
            this.sprite.position.y += this.vely*dt;

            if (this.sprite.position.y > this.aisle.counter.height)
            {
                let explosion = new Scenery([
                    getSprite('explode_1'),
                    getSprite('explode_2')
                ], 10);
                this.gameScreen.addThing(explosion);
                this.aisle.onCounter.addChild(explosion.sprite);
                explosion.sprite.position.set(
                    this.sprite.position.x+5,
                    this.sprite.position.y-5
                );
                //this.gameScreen.removeThing(this);
                return false;
            }
        }
        else
        {
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
                //this.gameScreen.removeThing(this);
                return false;
            }
        }
    }
}
