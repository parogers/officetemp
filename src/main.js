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
var Controls = require("./controls");
var GameScreen = require("./game");

/* Globals */

const GAME_WIDTH = 250;
const GAME_HEIGHT = 150;
const ASPECT_RATIO = GAME_WIDTH/GAME_HEIGHT;

var app = null;

class Application
{
    constructor(container)
    {
	if (typeof(container) == 'string') {
	    container = document.getElementById(container);
	}
	this.container = container;
	this.pixiApp = null;
	this.screens = {};
	this.screen = null;
	this.controls = new Controls.KeyboardControls();
	this.controls.attachKeyboardEvents();
    }

    start() {
	// TODO - enable the ticker?
	//PIXI.ticker.shared.autoStart = false;
	//PIXI.ticker.shared.stop();

	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
	//PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

	//let rect = getLargestRect(this.container, ASPECT_RATIO);

	let rect = this.container.getBoundingClientRect();
	let scale = Math.min(
	    rect.width / GAME_WIDTH,
	    rect.height / GAME_HEIGHT);

	//scale = Math.floor(scale);
	//if (scale <= 0) scale = 1;
	
	this.pixiApp = new PIXI.Application({
	    width: GAME_WIDTH*scale,
	    height: GAME_HEIGHT*scale,
	    backgroundColor: 0xe0e0a0,
	    //resolution: 1,
	    //preserveDrawingBuffer: true,
	    //antialias: false,
	    forceCanvas: true,
	    roundPixels: true,
	});
	this.pixiApp.renderer.plugins.interaction.destroy();
	this.container.appendChild(this.pixiApp.view);

	this.pixiApp.stage.scale.set(scale);

	this.screens = {
	    loading: new LoadingScreen(),
	    title: new TitleScreen(this.controls),
	    game: new GameScreen(this.controls),
	}
	this.screen = this.screens.loading;
	this.screen.start();

	// Start the ticker, which will drive the render loop
	PIXI.ticker.shared.add(() => {
	    this.update(PIXI.ticker.shared.elapsedMS/1000.0);
	});

	// Have the ticker start/stop when the window receives/loses
	// focus. (eg player clicks to another tab/returns)
	window.addEventListener('focus', () => {
	    PIXI.ticker.shared.start();
	});
	window.addEventListener('blur', () => {
	    PIXI.ticker.shared.stop();
	});
    }

    /*
    redraw() {
	this.update(1/60.0);
	requestAnimationFrame(() => {
	    this.redraw();
	});
    }*/

    update(dt) {
	if (this.screen) {
	    this.screen.update(dt);
	    this.pixiApp.render();
	}
	this.controls.update(dt);

	// If the screen is done, figure out where to go next
	if (this.screen.isDone())
	{
	    let screen = null;
	    if (this.screen === this.screens.loading) {
		screen = this.screens.title;
		//screen = this.screens.game;
	    }
	    else if (this.screen === this.screens.title) {
		screen = this.screens.game;
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
    app = new Application(container);
    app.start();
}

/* Call to have the canvas automatically resize to fill it's container */
module.exports.resize = function()
{
    app.resize();
}
