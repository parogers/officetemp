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

import { getSprite, Texture, Anim } from './resource';

declare const PIXI : any;

const LEFT = 1;
const RIGHT = -1;

const STATES = {
    IDLE: 0,
    MOVING: 1,
    SEARCHING: 2,
    THROWING: 3,
    RUNNING_DOWN: 4,
    RUNNING_BACK: 5,
};

const RUN_SPEED = 75;

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

class PlayerAppearance
{
    idle : Texture;
    search : Texture;
    throw : Texture;
    running : Anim;

    constructor()
    {
        this.idle = getSprite('terrance_idle');
        this.search = getSprite('terrance_search');
        this.throw = getSprite('terrance_throw');
        this.running = new Anim(
            [
                'terrance_run1',
                'terrance_run1',
                'terrance_run2',
                'terrance_run3',
                'terrance_run3',
                'terrance_run2',
            ],
            12
        );
    }
}

export class Player extends Thing
{
    sprite : any;
    state : number;
    lastState : number;
    aisleNumber : number;
    timer : number;
    chargeTime : number;
    nextAisle : number;
    controls : any;
    gameScreen : any;
    movementTween : Tween;
    appearance : PlayerAppearance;

    constructor(controls)
    {
        super();
        this.appearance = new PlayerAppearance();
        this.sprite = new PIXI.Sprite(this.appearance.idle);
        this.sprite.anchor.set(0.5, 1);
        this.state = Player.STATES.IDLE;
        this.lastState = -1;
        this.aisleNumber = 0;
        this.timer = 0;
        this.chargeTime = 0;
        this.nextAisle = -1;
        this.controls = controls;
        this.gameScreen = null;
    }

    set facing(dir : number)
    {
        this.sprite.scale.x = Math.sign(dir);
    }

    get facing()
    {
        return this.sprite.scale.x;
    }

    static get STATES() {
        return STATES;
    }

    spawn(gameScreen)
    {
        this.gameScreen = gameScreen;
        this.aisleNumber = 0;
        this.aisle.inFrontCounter.addChild(this.sprite);
    }

    get aisle() {
        return this.gameScreen.getAisle(this.aisleNumber);
    }

    update(dt)
    {
        let stateChanged = (this.lastState !== this.state);
        this.lastState = this.state;
        if (this.state === Player.STATES.IDLE)
        {
            if (stateChanged) {
                // Done searching
                this.sprite.scale.x = 1;
                this.sprite.x = this.aisle.playerIdlePos;
                this.sprite.texture = this.appearance.idle;
                this.facing = LEFT;
            }

            // Handle running into the aisle
            if (this.controls.left.justPressed)
            {
                this.state = Player.STATES.RUNNING_DOWN;
                // Move the player in front of the counter
                this.aisle.inFrontCounter.addChild(this.sprite);
                return;
            }

            // Handle up/down movement
            this.nextAisle = -1;
            if (this.controls.up.justPressed && this.aisleNumber > 0)
            {
                this.nextAisle = this.aisleNumber - 1;
            }
            if (this.controls.down.justPressed &&
                this.aisleNumber < this.gameScreen.getNumAisles()-1)
            {
                this.nextAisle = this.aisleNumber + 1;
            }
            if (this.nextAisle != -1)
            {
                let dy = (this.gameScreen.getAisle(this.aisleNumber).getY() -
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
                this.aisleNumber = this.nextAisle;
                this.aisle.inFrontCounter.addChild(this.sprite);
                this.state = Player.STATES.IDLE;
                this.sprite.x = this.aisle.playerIdlePos;
                this.sprite.y = 0;
            }
        }
        else if (this.state === Player.STATES.SEARCHING)
        {
            if (stateChanged) {
                // The player is searching the filing cabinet
                this.sprite.texture = this.appearance.search;
                this.sprite.x = this.aisle.playerIdlePos + 14;
                this.sprite.scale.x = -1;
                // Open the cabinet
                this.aisle.cabinet.setOpen(true);
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
                this.aisle.cabinet.setOpen(false);

                // The speed relates to how long the player searched the
                // cabinet.
                let speed = 80; // TODO - fix this
                let paper = new Sprites.PaperStack(this.aisle, {
                    size: 'small',
                    velx: -speed,
                });
                this.gameScreen.addThing(paper);
                paper.sprite.position.set(this.aisle.counterRightPos-8, 0);
                this.state = Player.STATES.THROWING;
            }
        }
        else if (this.state === Player.STATES.THROWING)
        {
            if (stateChanged) {
                // Show the throw pose for a bit before going idle again
                this.timer = 0.1;
                this.sprite.texture = this.appearance.throw;
                this.sprite.x = this.aisle.playerIdlePos;
                this.sprite.scale.x = 1;
            }
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = Player.STATES.IDLE;
            }
        }
        else if (this.state === Player.STATES.RUNNING_DOWN)
        {
            this.facing = LEFT;
            if (this.sprite.position.x > this.aisle.playerAisleBlockPos)
            {
                this.sprite.position.x -= RUN_SPEED*dt;
                this.sprite.texture = this.appearance.running.getFrame(dt);
            }
            else
            {
                this.sprite.position.x = this.aisle.playerAisleBlockPos;
                this.sprite.texture = this.appearance.idle;
            }

            if (!this.controls.left.held)
            {
                this.state = Player.STATES.RUNNING_BACK;
            }
        }
        else if (this.state === Player.STATES.RUNNING_BACK)
        {
            this.facing = RIGHT;
            this.sprite.texture = this.appearance.running.getFrame(dt);
            this.sprite.position.x += RUN_SPEED*dt;

            if (this.controls.left.held)
            {
                this.state = Player.STATES.RUNNING_DOWN;
            }
            else if (this.sprite.position.x > this.aisle.playerIdlePos-1)
            {
                this.aisle.inFrontCounter.addChild(this.sprite);
                this.state = Player.STATES.IDLE;
            }
        }
        if (this.state === Player.STATES.RUNNING_DOWN ||
            this.state === Player.STATES.RUNNING_BACK)
        {
            for (let paper of this.aisle.papers)
            {
                if (paper.isSigned &&
                    this.sprite.x >= paper.sprite.x &&
                    this.sprite.x <= paper.sprite.x + paper.width)
                {
                    paper.collected = true;
                    break;
                }
            }
        }
    }
};
