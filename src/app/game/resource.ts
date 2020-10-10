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

export type Texture = any;

import * as PIXI from 'pixi.js';


export const GAME_WIDTH = 300;
export const GAME_HEIGHT = 150;
export const ASPECT_RATIO = GAME_WIDTH/GAME_HEIGHT;

export const ALL = {
    SPRITES: 'sprites.json',
    TITLE: 'title-text.png',
    OFFICE: 'office.json',
    GAME_FONT: 'boxybold.fnt',
    LED_FONT: 'ledfont.fnt',
    SND_TEST: 'powerup1.wav',
};

export const SPRITES = ALL.SPRITES;
export const TITLE = ALL.TITLE;
export const OFFICE = ALL.OFFICE;
export const GAME_FONT = ALL.GAME_FONT;
export const LED_FONT = ALL.LED_FONT;
export const SND_TEST = ALL.SND_TEST;

export function getSprite(name) : Texture {
    return getImage(SPRITES, name);
}

export function getImage(sheet, name=undefined) : Texture {
    let img = null;
    let res = PIXI.Loader.shared.resources[sheet];
    if (!res) {
        console.log("WARNING: cannot find sheet " + sheet);
        return null;
    }

    if (name === undefined) {
        img = res.texture;
    } else {
        img = res.textures[name];
    }
    if (!img) {
        console.log("WARNING: can't find texture: " + sheet + "/" + name);
    }
    return img;
}

export class Anim
{
    frames : Texture[];
    fps : number;
    timer : number;

    constructor(names : string[], fps : number)
    {
        this.frames = names.map(name => getSprite(name));
        this.fps = fps;
        this.timer = 0;
    }

    getFrame(dt : number) : Texture
    {
        this.timer += dt;

        const frame = ((this.timer*this.fps)|0) % this.frames.length;
        return this.frames[frame];
    }
}

export function makeSolidColourSprite(
    name : string,
    width : number,
    height : number
) : PIXI.Sprite
{
    const sprite = new PIXI.Sprite(getSprite('colours_' + name));
    sprite.scale.set(
        width / sprite.width,
        height / sprite.height
    );
    return sprite;
}
