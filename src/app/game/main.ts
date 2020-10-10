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

/* Imports */

/* Note: once imported the PIXI module is available everywhere */
//require("pixi.js");
/* This patches the standard PIXI module with a loader that understands
 * sound files. It also adds an API under PIXI.sound.* */
//require("pixi-sound");

import { KeyboardControls } from './controls';

import { TitleScreen } from './title';

import { LoadingScreen } from './loading';

import { GameScreen } from './game';

import { NextScreen } from './next';

import { GAME_WIDTH, GAME_HEIGHT, ASPECT_RATIO } from './resource';

import * as PIXI from 'pixi.js';


const STATES = {
    START: 0,
    LOADING: 1,
    TITLE: 2,
    NEXT: 3,
    GAME: 4,
};


var app = null;

export class Application
{
    container : HTMLElement;
    pixiApp : any;
    screen : any;
    controls : any;
    state : number = STATES.START;

    constructor()
    {
        this.pixiApp = null;
        this.screen = null;
        this.controls = new KeyboardControls();
        this.controls.attachKeyboardEvents();
    }

    start(container : HTMLElement)
    {
        this.container = container;
        // TODO - enable the ticker?
        //PIXI.ticker.shared.autoStart = false;
        //PIXI.ticker.shared.stop();

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        //PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

        //let rect = getLargestRect(this.container, ASPECT_RATIO);

        let rect = this.container.getBoundingClientRect();
        let scale = Math.min(
            rect.width / GAME_WIDTH,
            rect.height / GAME_HEIGHT
        );

        //scale = Math.floor(scale);
        //if (scale <= 0) scale = 1;

        this.pixiApp = new PIXI.Application({
            width: GAME_WIDTH*scale,
            height: GAME_HEIGHT*scale,
            //resolution: 1,
            //preserveDrawingBuffer: true,
            //antialias: false,
            forceCanvas: true,
        });
        this.pixiApp.renderer.plugins.interaction.destroy();
        this.container.appendChild(this.pixiApp.view);

        this.pixiApp.stage.scale.set(scale);

        // Start the ticker, which will drive the render loop
        PIXI.Ticker.shared.add(() => {
            this.update(PIXI.Ticker.shared.elapsedMS/1000.0);
        });

        // // Have the ticker start/stop when the window receives/loses
        // // focus. (eg player clicks to another tab/returns)
        // window.addEventListener('focus', () => {
        //     PIXI.ticker.shared.start();
        // });
        // window.addEventListener('blur', () => {
        //     PIXI.ticker.shared.stop();
        // });
    }

    // Called from the render loop (which is handled via PIXI ticker)
    update(dt)
    {
        if (this.screen) {
            this.screen.update(dt);
            this.pixiApp.render();
        }
        this.controls.update(dt);

        // If the screen is done, figure out where to go next
        if (!this.screen || this.screen.isDone())
        {
            if (this.state === STATES.START) {
                this.state = STATES.LOADING;
                this.setScreen(new LoadingScreen());
            }

            else if (this.state === STATES.LOADING) {
                this.state = STATES.TITLE;
                this.setScreen(new TitleScreen(this.controls));
            }

            else if (this.state === STATES.TITLE) {
                this.state = STATES.NEXT;
                this.setScreen(new NextScreen());
            }

            else if (this.state === STATES.NEXT) {
                this.state = STATES.GAME;
                this.setScreen(new GameScreen(this.controls));
            }

            else if (this.state === STATES.GAME) {
                this.state = STATES.NEXT;
                this.setScreen(new NextScreen());
            }
        }
    }

    setScreen(screen)
    {
        // TODO - eventually handle screen transitions here
        this.screen = screen;
        if (this.screen) {
            this.screen.start();
            this.pixiApp.stage.removeChildren();
            this.pixiApp.stage.addChild(this.screen.getStage());
        }
    }

    resize() {
        let rect = getLargestRect(this.container, ASPECT_RATIO);
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

// module.exports = {}
//
// /* Call to start the game */
// module.exports.start = function(container)
// {
//     app = new Application(container);
//     app.start();
// }
//
// /* Call to have the canvas automatically resize to fill it's container */
// module.exports.resize = function()
// {
//     app.resize();
// }
