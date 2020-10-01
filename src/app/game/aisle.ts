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

import { Thing } from './thing';

import * as Sprites from './sprites';

import * as Resource from './resource';

declare const PIXI : any;

const getImage = Resource.getImage;

export class Aisle extends Thing
{
    container : any;
    behindCounter : any;
    inFrontCounter : any;
    cabinetArea : any;
    onCounter : any;
    counter : any;
    cabinet : any;
    papers : any[];

    constructor()
    {
        super();
        // The container holds everything in this aisle
        this.container = new PIXI.Container();

        this.sprite = this.container; // TODO fix this

        // Things that are behind the counter
        this.behindCounter = new PIXI.Container();
        this.behindCounter.position.set(0, -4);
        this.container.addChild(this.behindCounter);

        this.counter = new PIXI.Sprite(
            getImage(Resource.OFFICE, 'office_desk1')
        );
        this.counter.anchor.set(0, 1);
        //this.counter.position.set(0, ypos);
        this.container.addChild(this.counter);

        this.inFrontCounter = new PIXI.Container();
        this.inFrontCounter.position.set(0, this.behindCounter.position.y);
        this.container.addChild(this.inFrontCounter);

        this.cabinetArea = new PIXI.Container();
        this.cabinetArea.position.set(205, -3);
        this.container.addChild(this.cabinetArea);

        // The counter (top) is referenced to its bottom edge
        this.onCounter = new PIXI.Container();
        this.onCounter.position.set(0, -20);
        this.container.addChild(this.onCounter);

        this.cabinet = new Sprites.Cabinet();
        this.cabinet.sprite.position.set(220, -1);
        this.container.addChild(this.cabinet.sprite);
        this.papers = [];
    }

    getY() {
        return this.container.position.y;
    }

    spawn() {
    }

    get width() {
        return this.counter.width;
    }

    addPaper(paper) {
        this.papers.push(paper);
        this.onCounter.addChild(paper.sprite);
    }

    removePaper(paper) {
        let i = this.papers.indexOf(paper);
        if (i !== -1) {
            this.papers[i] = this.papers[this.papers.length-1];
            this.papers.pop();
            this.onCounter.removeChild(paper.sprite);
        }
    }
}
