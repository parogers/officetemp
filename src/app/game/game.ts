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

import * as Resource from './resource';
import * as Sprites from './sprites';
import { Player } from './player';
import { SuitGuy } from './suitguy';
import { Aisle } from './aisle';
import { LEDSign } from './ledsign';

const getImage = Resource.getImage;

declare const PIXI : any;

const AISLE_YPOS_LIST = [65, 104, 143];

export class GameScreen
{
    stage : any;
    controls : any;
    timer : number;
    aisle : number;
    player : any;
    things : any[];
    background : any;
    ledSign : any;
    aisleList : any;

    constructor(controls)
    {
        this.stage = new PIXI.Container();
        this.controls = controls;
        this.timer = 0;
        this.aisle = 0;
        this.player = null;
        this.things = [];
    }

    getAisle(n) {
        return this.aisleList[n];
    }

    getAisleEnd() {
        return this.aisleList[0].width;
    }

    getNumAisles() {
        return this.aisleList.length;
    }

    start() {
        this.background = getImage(Resource.OFFICE, 'office_carpet');
        this.stage.addChild(new PIXI.Sprite(this.background));

        let sprite = null;
        let img = getImage(Resource.OFFICE, 'office_shadows');
        this.stage.addChild(new PIXI.Sprite(img));

        img = getImage(Resource.OFFICE, 'office_wall');
        this.stage.addChild(new PIXI.Sprite(img));

        img = getImage(Resource.OFFICE, 'office_counter');
        sprite = new PIXI.Sprite(img);
        sprite.position.set(80, 10);
        this.stage.addChild(sprite);

        img = getImage(Resource.OFFICE, 'office_microwave');
        sprite = new PIXI.Sprite(img);
        sprite.position.set(88, 4);
        this.stage.addChild(sprite);

        img = getImage(Resource.OFFICE, 'office_counter2');
        sprite = new PIXI.Sprite(img);
        sprite.position.set(24, 10);
        this.stage.addChild(sprite);

        img = getImage(Resource.OFFICE, 'office_counter3');
        sprite = new PIXI.Sprite(img);
        sprite.position.set(182, 10);
        this.stage.addChild(sprite);

        this.aisleList = [];
        for (let ypos of AISLE_YPOS_LIST) {
            let aisle = new Aisle();
            aisle.position.set(0, ypos);
            this.stage.addChild(aisle.sprite);
            this.aisleList.push(aisle);
        }
        this.player = new Player(this.controls);
        this.addThing(this.player);

        let guy = new SuitGuy(this.aisleList[1]);
        this.addThing(guy);

        this.ledSign = new LEDSign();
        this.ledSign.position.set(8, 0);
        this.addThing(this.ledSign);

        this.ledSign.addMessage("HELLO WORLD");
        this.ledSign.addMessage("THIS IS ANOTHER THING", {
            separator: " *** "
        });
    }

    addThing(thing) {
        this.things.push(thing);
        if (thing.spawn) thing.spawn(this);
    }

    removeThing(thing) {
        let i = this.things.indexOf(thing);
        if (i != -1) {
            /*this.things[i] = this.things[this.things.length-1];
            this.things.pop();*/
            this.things.splice(i, 1);
            if (thing.despawn) thing.despawn();
        }
    }

    getStage() {
        return this.stage;
    }

    get width() {
        return this.background.width;
    }

    get height() {
        return this.background.height;
    }

    update(dt)
    {
        this.timer += dt;

        let n = 0;
        while(n < this.things.length) {
            let thing = this.things[n];
            if (thing.update && thing.update(dt) === false) {
                this.removeThing(thing);
            } else {
                n++;
            }
        }
    }

    isDone() {
        return false;
    }
}
