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

import * as Sprites from './sprites';
import { Thing } from './thing';
import * as Resource from './resource';
import { getSprite, getImage, Texture, Anim } from './resource';

declare const PIXI : any;

const STATES = {
    ADVANCING: 0,
    SIGNING: 1,
    SLIDING_BACK: 2,
    PAUSING: 3,
    ANGRY: 4,
};

class SuitGuyAppearance
{
    sign1 : Texture;
    sign2 : Texture;
    sign3 : Texture;
    fist : Texture;
    throw : Texture;
    idle : Texture;
    signingAnim : Anim;
    angryAnim : Anim;

    constructor()
    {
        this.sign1 = getSprite('bluesuit_sign1');
        this.signingAnim = new Anim(['bluesuit_sign2', 'bluesuit_sign3'], 10);
        this.angryAnim = new Anim(['bluesuit_angry1', 'bluesuit_angry2'], 6);
        this.fist = getSprite('bluesuit_fist');
        this.throw = getSprite('bluesuit_throw');
        this.idle = getSprite('bluesuit_idle');
    }
}

export class SuitGuy extends Thing
{
    state : number;
    lastState: number;
    aisle : any;
    speed : number;
    frame : number;
    timer : number
    fistCount : number;
    fistDelay : number;
    counter : number;
    gameScreen : any;
    speechContainer : any;
    appearance : SuitGuyAppearance;

    constructor(aisle)
    {
        super();
        this.appearance = new SuitGuyAppearance();
        this.sprite = new PIXI.Sprite(this.appearance.idle);
        this.sprite.anchor.set(0.5, 1);
        this.speechContainer = new PIXI.Container();
        this.speechContainer.position.set(15, -34);
        this.sprite.addChild(this.speechContainer);

        this.state = SuitGuy.STATES.PAUSING;
        this.lastState = -1;
        this.aisle = aisle;
        this.speed = 25;
        this.frame = 0;
        this.timer = 0;
        // How many fist pumps to do before advancing
        this.fistCount = 3;
        // Pause time between raising/lowering the fist
        this.fistDelay = 0.25;
    }

    static get STATES()
    {
        return STATES;
    }

    spawn(gameScreen)
    {
        this.aisle.behindCounter.addChild(this.sprite);
        this.gameScreen = gameScreen;
        this.sprite.position.x = this.aisle.counterLeftPos + 12;
        // this.sprite.position.x = this.aisle.counterRightPos-10;
    }

    update(dt)
    {
        let stateChanged = (this.state !== this.lastState);
        this.lastState = this.state;

        // Check for any papers to sign
        for (let paper of this.aisle.papers)
        {
            if (paper.areSigned() ||
                paper.sprite.x > this.sprite.x ||
                paper.sprite.x + paper.sprite.width < this.sprite.x)
            {
                continue;
            }
            if (this.state === SuitGuy.STATES.ADVANCING ||
                this.state === SuitGuy.STATES.PAUSING)
            {
                // Sign the papers
                this.gameScreen.removeThing(paper);
                this.state = SuitGuy.STATES.SLIDING_BACK;
                // Move out in front of the counter (only the top-half
                // of the body is rendered), so we can sign the papers
                // on the desk.
                this.sprite.texture = this.appearance.sign1;
                this.aisle.inFrontCounter.addChild(this.sprite);
            }
            else
            {
                // Bounce the paper to the floor
                paper.velx *= -1;
                paper.falling = true;
            }
            return;
        }

        if (this.state === SuitGuy.STATES.ADVANCING)
        {
            // Move forward a little bit
            if (stateChanged) {
                this.sprite.texture = this.appearance.fist;
                this.timer = 0.5;
            }
            this.sprite.position.x += dt*this.speed;
            // Have the suit guy bounce up and down to emulate walking.
            // These numbers are largely magic and just chosen to look good.
            this.sprite.position.y = -0.75*Math.abs(Math.sin(this.timer*10));
            this.timer -= dt;
            if (this.timer <= 0) {
                this.sprite.position.y = 0;
                this.state = SuitGuy.STATES.PAUSING;
            }
            if (this.sprite.position.x > this.aisle.counterRightPos)
            {
                this.state = SuitGuy.STATES.ANGRY;
            }
        }
        else if (this.state === SuitGuy.STATES.SIGNING)
        {
            if (stateChanged) {
                this.timer = 0.5;
                this.frame = 0;
                // Suit guy talks money while signing
                let img = getImage(Resource.SPRITES, 'speech_dollars');
                let balloon = new PIXI.Sprite(img);
                balloon.anchor.set(0.5, 1);
                this.speechContainer.addChild(balloon);
                this.counter = 8;
            }
            this.sprite.texture = this.appearance.signingAnim.getFrame(dt);

            this.counter -= dt;
            if (this.counter <= 0)
            {
                // Done signing the paper. Throw it back and continue
                // advancing.
                this.state = SuitGuy.STATES.ADVANCING;
                this.aisle.behindCounter.addChild(this.sprite);
                this.speechContainer.removeChildren();

                let speed = 50;
                let paper = new Sprites.PaperStack(this.aisle, {
                    size: 'small',
                    velx: speed,
                });
                paper.sprite.position.set(this.sprite.position.x+1, 0);
                this.gameScreen.addThing(paper);
            }
        }
        else if (this.state === SuitGuy.STATES.SLIDING_BACK)
        {
            if (stateChanged) {
                this.timer = 0.5;
            }
            this.timer -= dt;
            this.sprite.position.x -= 75*dt;
            if (this.timer <= 0) {
                this.state = SuitGuy.STATES.SIGNING;
            }
            if (this.sprite.position.x < 0) {
                // Knocked off the screen
                // ...
            }
        }
        else if (this.state === SuitGuy.STATES.PAUSING)
        {
            if (stateChanged) {
                this.timer = 0;
                this.frame = 0;
                this.counter = this.fistCount;;
            }

            this.timer -= dt;
            if (this.timer <= 0)
            {
                this.timer = this.fistDelay;
                if (this.frame === 0) {
                    this.sprite.texture = this.appearance.throw;
                    this.frame++;
                }
                else if (this.frame === 1) {
                    this.sprite.texture = this.appearance.fist;
                    this.frame++;
                }
                else
                {
                    this.frame = 0;
                    this.counter--;
                    if (this.counter <= 0) {
                        this.state = SuitGuy.STATES.ADVANCING;
                    }
                }
            }
        }
        else if (this.state === SuitGuy.STATES.ANGRY)
        {
            if (stateChanged)
            {
                let img = getImage(Resource.SPRITES, 'speech_angry');
                let balloon = new PIXI.Sprite(img);
                balloon.anchor.set(0.5, 1);
                this.speechContainer.addChild(balloon);
            }
            this.sprite.texture = this.appearance.angryAnim.getFrame(dt);
        }
    }
}
