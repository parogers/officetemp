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

import { Tween, LinearInterp } from './tween';

import * as Sprites from './sprites';

import { Thing } from './thing';

import { getSprite } from './resource';

declare const PIXI : any;

const STATES = {
    IDLE: 0,
    MOVING: 1,
    SEARCHING: 2,
    THROWING: 3,
    RUNNING: 4,
};

// Returns the stack size associated with the given search time
function getStackSize(time)
{
    // The (cabinet) search times associated with each charge level
    let chargeLevels = [
        ['large',  1],
        ['medium', 0.5],
        ['small',  0],
    ];

    for (let arg of chargeLevels)
    {
        let name = arg[0];
        let cutoff = arg[1];
        if (time >= cutoff) return name;
    }
    return chargeLevels[chargeLevels.length-1];
}

export class Player extends Thing
{
    sprite : any;
    state : number;
    lastState : number;
    aisle : number;
    timer : number;
    chargeTime : number;
    nextAisle : number;
    controls : any;
    gameScreen : any;
    movementTween : Tween;

    constructor(controls) {
        super();
        this.sprite = new PIXI.Sprite(getSprite('terrance_idle'));
        this.sprite.anchor.set(0.5, 1);
        this.state = Player.STATES.IDLE;
        this.lastState = -1;
        this.aisle = 0;
        this.timer = 0;
        this.chargeTime = 0;
        this.nextAisle = -1;
        this.controls = controls;
        this.gameScreen = null;
    }

    static get STATES() {
        return STATES;
    }

    spawn(gameScreen) {
        this.gameScreen = gameScreen;
        this.aisle = 0;
        this.getAisle().cabinetArea.addChild(this.sprite);
    }

    getAisle() {
        return this.gameScreen.getAisle(this.aisle);
    }

    setImage(name) {
        this.sprite.texture = getSprite('terrance_' + name);
    }

    update(dt)
    {
        let stateChanged = (this.lastState != this.state);
        this.lastState = this.state;
        if (this.state === Player.STATES.IDLE)
        {
            if (stateChanged) {
                // Done searching
                this.sprite.scale.x = 1;
                this.sprite.position.x = 0;
                this.setImage('idle');
            }

            // Handle running into an aisle
            if (this.controls.left.justPressed) {
                this.state = Player.STATES.RUNNING;
                return;
            }

            // Handle up/down movement
            this.nextAisle = -1;
            if (this.controls.up.justPressed && this.aisle > 0)
            {
                this.nextAisle = this.aisle-1;
            }
            if (this.controls.down.justPressed &&
                this.aisle < this.gameScreen.getNumAisles()-1)
            {
                this.nextAisle = this.aisle+1;
            }
            if (this.nextAisle != -1)
            {
                let dy = (this.gameScreen.getAisle(this.aisle).getY() -
                this.gameScreen.getAisle(this.nextAisle).getY());

                this.movementTween = new Tween(this.sprite, {
                    src: [this.sprite.position.x, this.sprite.position.y],
                    dest: [this.sprite.position.x, this.sprite.position.y-dy],
                    duration: 0.1,
                    interpolate: LinearInterp,
                });

                // Wait in a trap state until the tweening between isles
                // is finished.
                this.state = Player.STATES.MOVING;

                this.gameScreen.addThing(this.movementTween);

                return;
            }
            // Handle searching
            if (this.controls.right.justPressed) {
                this.state = Player.STATES.SEARCHING;
            }
        }
        else if (this.state === Player.STATES.MOVING)
        {
            // The player is moving between aisles
            if (this.movementTween.done)
            {
                this.getAisle().cabinetArea.removeChild(this.sprite);
                this.aisle = this.nextAisle;
                this.getAisle().cabinetArea.addChild(this.sprite);
                this.state = Player.STATES.IDLE;
                this.sprite.position.y = 0;
            }
        }
        else if (this.state === Player.STATES.SEARCHING)
        {
            if (stateChanged) {
                // The player is searching the filing cabinet
                this.setImage('search');
                this.sprite.position.x = 14;
                this.sprite.position.y = 0;
                this.sprite.scale.x = -1;
                // Open the cabinet
                this.getAisle().cabinet.setOpen(true);
                // Have the player searching for a minimum amount of time
                this.timer = 0.15;
                this.chargeTime = 0;
            }

            if (this.timer <= 0) {
                // Start the "speed charge" after an initial delay
                this.chargeTime += dt;
            }

            this.timer -= dt;
            if (!this.controls.right.held && this.timer <= 0)
            {
                // Close the cabinet and throw the paper
                this.getAisle().cabinet.setOpen(false);

                // The speed relates to how long the player searched the
                // cabinet.
                let speed = 100; // TODO - fix this
                let paper = new Sprites.PaperStack(this.getAisle(), {
                    size: 'small',
                    velx: -speed,
                });
                paper.sprite.position.set(this.getAisle().width, 0);
                this.gameScreen.addThing(paper);
                this.state = Player.STATES.THROWING;
            }
        }
        else if (this.state === Player.STATES.THROWING)
        {
            if (stateChanged) {
                // Show the throw pose for a bit before going idle again
                this.timer = 0.1;
                this.setImage('throw');
                this.sprite.position.x = 0;
                this.sprite.scale.x = 1;
            }
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = Player.STATES.IDLE;
            }
        }
        else if (this.state === Player.STATES.RUNNING)
        {
            const fps = 10;
            const frames = ['run1', 'run2'];
            this.timer += dt;
            this.setImage(frames[
                ((this.timer*fps)|0) % 2
            ]);

            if (!this.controls.left.held)
            {
                this.state = Player.STATES.IDLE;
            }
        }
    }
};
