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

var Resource = require("./resource");

class LoadingScreen
{
    constructor() {
	this.mediaPath = "media";
	this.doneLoading = false;
	this.stage = new PIXI.Container();
    }

    start() {
	PIXI.loader.defaultQueryString = "nocache=" + (new Date()).getTime();
	
	for (let key in Resource.ALL) {
	    /* Store the resources by path (minus the base path) */
	    let path = this.mediaPath + "/" + Resource.ALL[key];
	    PIXI.loader.add(Resource.ALL[key], path);
	    console.log(Resource.ALL[key] + " => " + path);
	}
	PIXI.loader.onError.add(arg => {
	    console.log("ERROR: " + arg);
	});

	PIXI.loader.onLoad.add(arg => {
	    console.log("PROGRESS: " + (arg.progress|0));
	});
	PIXI.loader.load(() => {
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

module.exports = LoadingScreen;
