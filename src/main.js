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

/* Imports */

/* Note: once imported the PIXI module is available everywhere */
require("pixi.js");
/* This patches the standard PIXI module with a loader that understands 
 * sound files. It also adds an API under PIXI.sound.* */
require("pixi-sound");

var LoadingScreen = require("./loading");
var TitleScreen = require("./title");
var Render = require("./render");

/* Globals */

const ASPECT_RATIO = 1.5;
var game = null;

class Game
{
    constructor(container) {
	if (typeof(container) == 'string') {
	    container = document.getElementById(container);
	}
	this.container = container;
	this.pixiApp = null;
	this.screens = {};
	this.currentScreen = null;
    }

    start() {
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
	// TODO - enable the ticker?
	PIXI.ticker.shared.autoStart = false;
	PIXI.ticker.shared.stop();

	let rect = getLargestRect(this.container, ASPECT_RATIO);
	this.pixiApp = new PIXI.Application({
	    width: rect.width,
	    height: rect.height,
	    antialias: false,
	});
	this.pixiApp.renderer.plugins.interaction.destroy();
	this.container.appendChild(this.pixiApp.view);

	this.screens = {
	    loading: new LoadingScreen(),
	    title: new TitleScreen()
	}
	this.currentScreen = this.screens.loading;
	this.currentScreen.start();
    }

    update() {
	let dt = 0;
	if (this.currentScreen) {
	    this.currentScreen.update(dt);
	}

	// If the screen is done, figure out where to go next
	if (this.currentScreen.isDone())
	{
	    if (this.currentScreen === this.screens.loading) {
		// Title screen
		this.currentScreen = this.screens.title;
	    }
	    else if (this.currentScreen === this.screens.title) {
		// Game play
		// ...
	    }
	}
    }

    resize() {
	let rect = get_largest_rect(this.container, ASPECT_RATIO);
	this.pixiApp.renderer.resize(rect.width, rect.height);
    }
}

/* Returns the largest rectangle that will fit into the given container 
 * element. */
function getLargestRect(container, aspect)
{
    let rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        throw Error("invalid container size");
    }

    // Maintain the aspect ratio when sizing the render view
    let width = Math.round(rect.height*aspect);
    let height = rect.height;

    if (width > rect.width) {
        width = rect.width;
        height = Math.round(rect.height/aspect);
    }
    return {
	width: width,
	height: height
    }
}

module.exports = {}

/* Call to start the game */
module.exports.start = function(container)
{
    game = new Game(container);
    game.start();
}

/* Call to have the canvas automatically resize to fill it's container */
module.exports.resize = function()
{
    game.resize();
}
