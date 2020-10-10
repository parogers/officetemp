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

import { getSprite, GAME_WIDTH, GAME_HEIGHT, makeSolidColourSprite } from './resource';

import { Thing } from './thing';

import { Tween, LinearInterp, EaseInOut } from './tween';

import * as PIXI from 'pixi.js';


const STATES = {
    IDLE: 0,
    PRE_FADE_DELAY: 1,
    FADE_IN: 2,
    POST_FADE_DELAY: 3,
    SLIDE_TRY_AGAIN: 4,
    PRE_TAP_MSG_DELAY: 5,
    SLIDE_TAP_CONTINUE: 6,
};


function createTryAgainBox() : PIXI.Container
{
    const box = new PIXI.Container();

    const bg = makeSolidColourSprite('lime', GAME_WIDTH, 24);
    bg.anchor.set(0, 0.5);
    box.addChild(bg);

    const text = new PIXI.BitmapText(
        'TRY AGAIN?',
        {
            fontName: 'boxybold',
            fontSize: 6,
        }
    );
    text.scale.set(2);
    text.x = GAME_WIDTH/2;
    (text.anchor as PIXI.Point).set(0.5, 0.5);
    box.addChild(text);

    return box;
}

function createTapContinueBox() : PIXI.Container
{
    const box = new PIXI.Container();

    const bg = makeSolidColourSprite('lime', GAME_WIDTH, 12);
    bg.anchor.set(0, 0.5);
    box.addChild(bg);

    const text = new PIXI.BitmapText(
        'TAP TO CONTINUE',
        {
            fontName: 'boxybold',
            fontSize: 4,
        }
    );
    text.scale.set(2);
    text.x = GAME_WIDTH/2;
    (text.anchor as PIXI.Point).set(0.5, 0.5);
    box.addChild(text);

    return box;
}


export class GameOverMessage extends Thing
{
    background : PIXI.Sprite;
    state : number = STATES.IDLE;
    lastState : number = -1;
    counter : number = 0;
    gameScreen : any;
    tween : Tween;
    tryAgainBox : PIXI.Container;
    tapContinueBox : PIXI.Container;
    pauseDuringGameOver = false;

    constructor()
    {
        super();
        this.sprite = new PIXI.Container();

        this.background = makeSolidColourSprite('black', GAME_WIDTH, GAME_HEIGHT);
        this.background.alpha = 0;
        this.sprite.addChild(this.background);

        this.tryAgainBox = createTryAgainBox();
        this.tryAgainBox.x = -GAME_WIDTH;
        this.tryAgainBox.y = GAME_HEIGHT/2;
        this.sprite.addChild(this.tryAgainBox);

        this.tapContinueBox = createTapContinueBox();
        this.tapContinueBox.x = -GAME_WIDTH;
        this.tapContinueBox.y = GAME_HEIGHT/2 + 20;
        this.sprite.addChild(this.tapContinueBox);
    }

    static get states() : any {
        return STATES;
    }

    get pauseGamePlay() : boolean
    {
        return this.state >= STATES.FADE_IN;
    }

    update(dt : number)
    {
        if (this.state !== this.lastState) {
            this.counter = 0;
        }
        this.lastState = this.state;
        if (this.state === STATES.IDLE)
        {
            if (this.gameScreen.gameOver) {
                this.state = STATES.PRE_FADE_DELAY;
            }
        }
        else if (this.state === STATES.PRE_FADE_DELAY)
        {
            this.counter += dt;
            if (this.counter > 1) {
                this.state = STATES.FADE_IN;
            }
        }
        else if (this.state === STATES.FADE_IN)
        {
            const delay = 0.25;
            this.counter += dt;
            this.background.alpha = 0.5*(this.counter/delay);
            if (this.counter > delay) {
                this.state = STATES.POST_FADE_DELAY;
            }
        }
        else if (this.state === STATES.POST_FADE_DELAY)
        {
            this.counter += dt;
            if (this.counter > 0.5)
            {
                this.state = STATES.SLIDE_TRY_AGAIN;
                this.tween = new Tween(this.tryAgainBox, {
                    duration: 1,
                    src: [
                        this.tryAgainBox.x,
                        this.tryAgainBox.y,
                    ],
                    dest: [
                        0,
                        this.tryAgainBox.y
                    ],
                    interpolate: EaseInOut,
                });
                this.tween.pauseDuringGameOver = false;
                this.gameScreen.addThing(this.tween);
            }
        }
        else if (this.state === STATES.SLIDE_TRY_AGAIN)
        {
            if (this.tween.done)
            {
                this.state = STATES.PRE_TAP_MSG_DELAY;
            }
        }
        else if (this.state === STATES.PRE_TAP_MSG_DELAY)
        {
            this.counter += dt;
            if (this.counter > 0.5)
            {
                this.state = STATES.SLIDE_TAP_CONTINUE;
                this.tween = new Tween(this.tapContinueBox, {
                    duration: 1,
                    src: [
                        this.tapContinueBox.x,
                        this.tapContinueBox.y,
                    ],
                    dest: [
                        0,
                        this.tapContinueBox.y
                    ],
                    interpolate: EaseInOut,
                });
                this.tween.pauseDuringGameOver = false;
                this.gameScreen.addThing(this.tween);
            }
        }
        else if (this.state === STATES.SLIDE_TAP_CONTINUE)
        {
        }
    }

    spawn(gameScreen)
    {
        this.gameScreen = gameScreen;
        this.gameScreen.stage.addChild(this.sprite);
    }
}
