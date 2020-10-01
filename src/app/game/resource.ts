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

declare const PIXI : any;

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

export function getSprite(name) {
    return getImage(SPRITES, name);
}

export function getImage(sheet, name=undefined) {
    let img = null;
    let res = PIXI.loader.resources[sheet];
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
