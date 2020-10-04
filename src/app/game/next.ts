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

import { getSprite, GAME_WIDTH, GAME_HEIGHT } from './resource';

declare const PIXI : any;

export class NextScreen
{
    timer : number;
    stage : any;

    constructor() {
        this.timer = 3;
    }

    start()
    {
        const scale = 1.5;
        // TODO - lots of magic numbers here
        this.stage = new PIXI.Container();
        this.stage.scale.set(scale);

        let bg = new PIXI.Sprite(getSprite('colours_black'));
        bg.scale.set(8, 4);
        this.stage.addChild(bg);

        let portrait = new PIXI.Sprite(getSprite('portraits_terrance'));
        portrait.anchor.set(0.5, 0.5);
        portrait.position.set(
            (GAME_WIDTH/2)/scale,
            (GAME_HEIGHT/2)/scale - 5
        );
        this.stage.addChild(portrait);

        let msg = 'GET READY!';
        let text = new PIXI.BitmapText(
            msg, {
                font : {
                    'name' : 'boxybold',
                    'size' : 6,
                }
            }
        );
        text.anchor.set(0.5, 0.5);
        text.position.set(
            portrait.position.x,
            portrait.position.y + 22
        );
        this.stage.addChild(text);
    }

    update(dt) {
        this.timer -= dt;
    }

    getStage() {
        return this.stage;
    }

    isDone() {
        return this.timer <= 0;
    }
}
