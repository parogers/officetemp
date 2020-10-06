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

import * as Resource from './resource';

import * as PIXI from 'pixi.js';


export class LoadingScreen
{
    mediaPath : string = "assets/media";
    doneLoading : boolean = false;
    stage : any;

    constructor()
    {
        this.stage = new PIXI.Container();
    }

    start()
    {
        const loader = PIXI.Loader.shared;

        loader.defaultQueryString = "nocache=" + (new Date()).getTime();

        for (let key in Resource.ALL) {
            /* Store the resources by path (minus the base path) */
            let path = this.mediaPath + "/" + Resource.ALL[key];
            loader.add(Resource.ALL[key], path);
            console.log(Resource.ALL[key] + " => " + path);
        }
        loader.onError.add(arg => {
            console.log("ERROR: " + arg);
        });

        loader.onLoad.add(arg => {
            console.log("PROGRESS: " + (arg.progress|0));
        });
        loader.load(() => {
            console.log("Done loading assets");
            /*let snd = PIXI.loader.resources[Resource.SND_TEST];
            PIXI.sound.play(Resource.SND_TEST);*/
            this.doneLoading = true;
        });

    }

    update() {
        // Show loading progress
        // ...
    }

    getStage() {
        return this.stage;
    }

    isDone() {
        return this.doneLoading;
    }
};
