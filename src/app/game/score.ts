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

import { Thing } from './thing';

import * as PIXI from 'pixi.js';


function getNumDigits(n : number)
{
    if (n === 0) return 1;
    return (Math.log10(n) + 1)|0;
}


function repeat(char, n)
{
    let str = '';
    while(n-- > 0) {
        str += char;
    }
    return str;
}


export class ScoreDisplay extends Thing
{
    sprite : PIXI.Container;
    textSprite : PIXI.BitmapText;
    private _score : number;

    constructor()
    {
        super();
        this.sprite = new PIXI.Container();
        this.sprite.scale.set(1.5);

        this.textSprite = new PIXI.BitmapText(
            '', {
                fontName: 'boxybold',
                fontSize: 6,
            },
        );
        (<PIXI.Point>this.textSprite.anchor).set(1, 0);
        this.sprite.addChild(this.textSprite);
        this.score = 0;
    }

    spawn(screen)
    {
        this.sprite.x = 290;
        this.sprite.y = 0;
        screen.statusContainer.addChild(this.sprite);
    }

    set score(value : number)
    {
        if (this._score !== value)
        {
            const digits = getNumDigits(value);
            const zeros = repeat('0', 6 - digits);
            this._score = value;
            this.textSprite.text = 'SCORE: $' + zeros + value;
        }
    }
}
