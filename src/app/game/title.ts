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

import { Tween, LinearInterp, LinearSlowdownInterp } from './tween';
import { Process } from './process';
import * as Resource from './resource';
import { getImage, getSprite, makeSolidColourSprite, GAME_WIDTH, GAME_HEIGHT } from './resource';

import * as PIXI from 'pixi.js';

const SCALE = 1.3;

export class TitleScreen
{
    stage : PIXI.Container;
    process : Process = new Process();
    controls : any;
    done : boolean = false;
    timer : number;
    terrance : PIXI.Sprite;
    sweaterGuy : PIXI.Sprite;
    terranceX : number;
    terranceY : number;
    sweaterX : number;
    sweaterY : number;
    title : PIXI.Sprite;
    bg : PIXI.Sprite;

    constructor(controls)
    {
        this.stage = new PIXI.Container();
        this.controls = controls;
    }

    start()
    {
        const bg = makeSolidColourSprite('lime', GAME_WIDTH, GAME_HEIGHT);
        this.stage.addChild(bg);

        let img = getImage(Resource.TITLE);
        img.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        img.baseTexture.dispose();

        const charOffsetX = 75;

        this.timer = 0;
        this.terranceX = 255;
        this.terranceY = 110;
        this.terrance = new PIXI.Sprite(getSprite("terrance_idle"));
        this.terrance.anchor.set(0.5, 1);
        this.terrance.scale.set(SCALE);
        this.terrance.position.set(this.terranceX + charOffsetX, this.terranceY);
        this.stage.addChild(this.terrance);

        this.sweaterX = 45;
        this.sweaterY = 110;
        this.sweaterGuy = new PIXI.Sprite(getSprite("sweater_drink1"));
        this.sweaterGuy.anchor.set(0.5, 1);
        this.sweaterGuy.scale.set(SCALE);
        this.sweaterGuy.position.set(this.sweaterX - charOffsetX, this.sweaterY);
        this.stage.addChild(this.sweaterGuy);

        this.title = new PIXI.Sprite(getImage(Resource.TITLE));
        this.title.scale.set(0.25);
        this.title.anchor.set(0.5, 0.5);
        this.title.position.set(150, 80);

        // Use a promise chain to handle the intro animation
        Promise.resolve().then(() => {
            return this.process.wait(1);

        }).then(() => {
            this.stage.addChild(this.title);

        }).then(() => {
            return this.process.wait(1);

        }).then(() => {
            // Have terrance and sweater guy slide in from the left and right
            let t1 = new Tween(this.terrance, {
                src: [this.terranceX+50, this.terranceY],
                dest: [this.terranceX, this.terranceY],
                interpolate: LinearSlowdownInterp,
                duration: 0.5,
            });
            let t2 = new Tween(this.sweaterGuy, {
                src: [this.sweaterX-50, this.sweaterY],
                dest: [this.sweaterX, this.sweaterY],
                interpolate: LinearSlowdownInterp,
                duration: 0.5,
            });
            return [this.process.add(t1), this.process.add(t2)];

        }).then(() => {
            return this.process.wait(1);

        }).then(() => {
            console.log("DONE");

            // Terrance gets frazzled, sweater guy drinks coffee
            this.process.add(dt => {
                let x = this.terranceX + 0.5*Math.cos(this.timer*75);
                let y = this.terranceY + 0.25*Math.sin(this.timer*50);
                this.terrance.texture = getSprite("terrance_frazzled");
                this.terrance.position.set(x, y);
                return true;
            });

            let frame = 0;
            this.process.add(dt => {
                let frames = [
                    getSprite("sweater_drink2"),
                    getSprite("sweater_drink1"),
                    getSprite("sweater_drink1"),
                ];
                frame += 0.75*dt;
                this.sweaterGuy.texture = frames[(frame|0) % frames.length];
                return true;
            });

        }).then(() => {
            let x1 = -10;
            let x2 = 14;
            let x3 = 0;
            const paperPos = [
                [x1, -15, -3],
                [x2, -15,  6],
                [x3, 0, 5],
                [x2+10, 0, -5],

                [x1-1, -15, -10.5],
                [x2, -15, -1],
                [x3, 0, -2],

                [x1, -15, -17.5],
                [x3+1, 0, -10],
            ];

            let papers = [];

            let lst = [];
            for (let n = 0; n < paperPos.length; n++)
            {
                let img = getSprite("paperstack_medium");
                let paper = new PIXI.Sprite(img);
                paper.scale.set(SCALE);
                paper.anchor.set(0.5, 1);

                this.stage.addChild(paper);

                let dx = paperPos[n][0];
                //let dy = paperPos[n][1];
                let stop = paperPos[n][2];
                let tween = new Tween(paper, {
                    src: [this.terranceX + dx, stop*5],
                    dest: [this.terranceX + dx, this.terranceY + stop],
                    interpolate: LinearInterp,
                    duration: 0.5 - stop*0.008,
                });
                lst.push(this.process.add(tween));
            }
            return lst;
        });
    }

    update(dt)
    {
        this.process.update(dt);
        this.timer += dt;

        if (this.controls.anyKey.justPressed) {
            this.done = true;
        }
    }

    getStage() {
        return this.stage;
    }

    isDone() {
        return this.done;
    }
}
