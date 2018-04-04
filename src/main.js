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

/* Globals */

const GAME_WIDTH = 250;
const GAME_HEIGHT = 150;
const ASPECT_RATIO = GAME_WIDTH/GAME_HEIGHT;

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
	this.screen = null;
    }

    start() {
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
	// TODO - enable the ticker?
	//PIXI.ticker.shared.autoStart = false;
	//PIXI.ticker.shared.stop();

	let rect = getLargestRect(this.container, ASPECT_RATIO);
	this.pixiApp = new PIXI.Application({
	    width: rect.width,
	    height: rect.height,
	    backgroundColor: 0xffffff,
	    antialias: false,
	});
	this.pixiApp.renderer.plugins.interaction.destroy();
	this.container.appendChild(this.pixiApp.view);

	this.pixiApp.stage.scale.set(rect.width / GAME_WIDTH);

	this.screens = {
	    loading: new LoadingScreen(),
	    title: new TitleScreen()
	}
	this.screen = this.screens.loading;
	this.screen.start();

	// Start the ticker, which will drive the render loop
	PIXI.ticker.shared.add(() => {
	    this.update(PIXI.ticker.shared.elapsedMS);
	});
    }

    update(dt) {
	if (this.screen) {
	    this.screen.update(dt);
	    this.pixiApp.render();
	}

	// If the screen is done, figure out where to go next
	if (this.screen.isDone())
	{
	    let screen = null;
	    if (this.screen === this.screens.loading) {
		// Title screen
		screen = this.screens.title;
	    }
	    else if (this.screen === this.screens.title) {
		// Game play
		// ...
	    }
	    this.screen = null;
	    
	    if (screen) {
		screen.start();
		this.pixiApp.stage.removeChildren();
		this.pixiApp.stage.addChild(screen.getStage());
		this.screen = screen;
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
