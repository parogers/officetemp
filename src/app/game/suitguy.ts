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
import { BossSetup } from './level';

import * as PIXI from 'pixi.js';

const STATES = {
    ADVANCING: 0,
    SIGNING: 1,
    SLIDING_BACK: 2,
    PAUSING: 3,
    ANGRY: 4,
    SIGNING_PAUSED: 5,
};

class SuitGuyAppearance
{
    sign1 : Texture;
    sign2 : Texture;
    sign3 : Texture;
    fist : Texture;
    throw : Texture;
    idle : Texture;
    signingPaused : Texture;
    signingAnim : Anim;
    angryAnim : Anim;

    constructor(spriteName : string)
    {
        this.sign1 = getSprite(spriteName + '_sign1');
        this.signingAnim = new Anim([spriteName + '_sign2', spriteName + '_sign3'], 10);
        this.angryAnim = new Anim([spriteName + '_angry1', spriteName + '_angry2'], 6);
        this.fist = getSprite(spriteName + '_fist');
        this.throw = getSprite(spriteName + '_throw');
        this.idle = getSprite(spriteName + '_idle');
        this.signingPaused = getSprite(spriteName + '_signp');
    }
}

export class SuitGuy extends Thing
{
    state : number;
    lastState: number;
    speed : number;
    frame : number;
    timer : number
    fistCount : number;
    fistDelay : number;
    counter : number;
    signingTimer : number;
    gameScreen : any;
    speechContainer : PIXI.Container;
    appearance : SuitGuyAppearance;
    aislePos : number;

    constructor(
        bossSetup : BossSetup,
        private aisle : any,
    )
    {
        super();
        this.appearance = new SuitGuyAppearance(bossSetup.sprite);
        this.sprite = new PIXI.Sprite(this.appearance.idle);
        this.sprite.anchor.set(0.5, 1);
        this.speechContainer = new PIXI.Container();
        this.speechContainer.position.set(15, -34);
        this.sprite.addChild(this.speechContainer);

        this.state = SuitGuy.STATES.PAUSING;
        this.lastState = -1;
        this.speed = 25;
        this.frame = 0;
        this.timer = 0;
        this.aislePos = bossSetup.pos;
        // How many fist pumps to do before advancing
        this.fistCount = bossSetup.fistPumps !== undefined ? bossSetup.fistPumps : 5;
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
        // Find our position within the counter
        this.sprite.position.x = (
            this.aisle.counterLeftPos +
            (this.aisle.counterRightPos - this.aisle.counterLeftPos) * this.aislePos/100
        );
    }

    update(dt)
    {
        const previousState = this.lastState;
        const stateChanged = (this.state !== this.lastState);
        this.lastState = this.state;

        // Check for any papers to sign
        for (let paper of this.aisle.papers)
        {
            if (paper.sprite.x > this.sprite.x ||
                paper.sprite.x + paper.sprite.width < this.sprite.x)
            {
                continue;
            }
            if (this.state === SuitGuy.STATES.SIGNING)
            {
                this.state = SuitGuy.STATES.SIGNING_PAUSED;
                break;
            }
            if (paper.isSigned) {
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
                this.sprite.y = 15;
                this.aisle.onCounter.addChild(this.sprite);
            }
            // else
            // {
            //     // Bounce the paper to the floor
            //     paper.velx *= -1;
            //     paper.falling = true;
            // }
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
                this.frame = 0;
                // Suit guy talks money while signing
                let img = getImage(Resource.SPRITES, 'speech_dollars');
                let balloon = new PIXI.Sprite(img);
                balloon.anchor.set(0.5, 1);
                this.speechContainer.addChild(balloon);
                // Keep the signing progress going if we were just paused
                if (previousState !== SuitGuy.STATES.SIGNING_PAUSED) {
                    this.signingTimer = 8;
                }
            }
            this.sprite.texture = this.appearance.signingAnim.getFrame(dt);

            this.signingTimer -= dt;
            if (this.signingTimer <= 0)
            {
                // Done signing the paper. Throw it back and continue
                // advancing.
                this.state = SuitGuy.STATES.ADVANCING;
                this.aisle.behindCounter.addChild(this.sprite);
                this.speechContainer.removeChildren();
                this.sprite.y = 0;

                let speed = 50;
                let paper = new Sprites.PaperStack(this.aisle, {
                    size: 'small',
                    velx: speed,
                });
                paper.sprite.position.set(this.sprite.position.x+1, 0);
                this.gameScreen.addThing(paper);
            }
        }
        else if (this.state === SuitGuy.STATES.SIGNING_PAUSED)
        {
            if (stateChanged)
            {
                this.counter = 0.5;
                this.speechContainer.removeChildren();
            }
            this.sprite.texture = this.appearance.signingPaused;
            this.counter -= dt;
            if (this.counter < 0)
            {
                this.state = SuitGuy.STATES.SIGNING;
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
            this.gameScreen.gameOver = true;
        }
    }
}
