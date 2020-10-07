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

import { getSprite, GAME_WIDTH, GAME_HEIGHT } from './resource';

import { Thing } from './thing';

import { Tween, LinearSlowdownInterp } from './tween';

import * as PIXI from 'pixi.js';


const STATES = {
    IDLE: 0,
    PRE_FADE_DELAY: 1,
    FADE_IN: 2,
    POST_FADE_DELAY: 3,
    SLIDE_TEXT: 4,
};


export class GameOverMessage extends Thing
{
    background : PIXI.Sprite;
    state : number = STATES.IDLE;
    lastState : number = -1;
    counter : number = 0;
    gameScreen : any;
    tween : Tween;
    textBox : PIXI.Container;

    constructor()
    {
        super();
        this.sprite = new PIXI.Container();

        this.background = new PIXI.Sprite(getSprite('colours_black'));
        this.background.alpha = 0;
        this.background.scale.set(10, 5);
        this.sprite.addChild(this.background);

        this.textBox = new PIXI.Container();
        this.textBox.x = -GAME_WIDTH;
        this.sprite.addChild(this.textBox);

        const bg = new PIXI.Sprite(getSprite('colours_lime'));
        bg.anchor.set(0, 0.5);
        bg.scale.set(GAME_WIDTH/bg.width, 24/bg.height);
        bg.y = GAME_HEIGHT/2;
        this.textBox.addChild(bg);

        const text = new PIXI.BitmapText(
            'TRY AGAIN?',
            {
                fontName: 'boxybold',
                fontSize: 6,
            }
        );
        text.scale.set(2);
        text.x = GAME_WIDTH/2;
        text.y = GAME_HEIGHT/2;
        (text.anchor as PIXI.Point).set(0.5, 0.5);
        this.textBox.addChild(text);
    }

    static get states() : any {
        return STATES;
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
                this.state = STATES.SLIDE_TEXT;
                this.tween = new Tween(this.textBox, {
                    duration: 0.5,
                    src: [
                        this.textBox.x,
                        this.textBox.y,
                    ],
                    dest: [
                        0,
                        0
                    ],
                    interpolate: LinearSlowdownInterp,
                });
                this.gameScreen.addThing(this.tween);
            }
        }
        else if (this.state === STATES.SLIDE_TEXT)
        {

        }
    }

    spawn(gameScreen)
    {
        this.gameScreen = gameScreen;
        this.gameScreen.stage.addChild(this.sprite);
    }
}
