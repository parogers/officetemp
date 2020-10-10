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

var PRIMARY = 90;
var PRIMARY_ALT = 65;
var SWAP = 88;
var SPACE = 32;
var ARROW_UP = 38;
var ARROW_LEFT = 37;
var ARROW_RIGHT = 39;
var ARROW_DOWN = 40;
var TEST_KEY = 75;

var DOUBLE_PRESS_TIME = 0.3;

var DEFAULTS = {
    up: ARROW_UP,
    down: ARROW_DOWN,
    left: ARROW_LEFT,
    right: ARROW_RIGHT,
    primary: [PRIMARY, PRIMARY_ALT],
    swap: SWAP,
    space: SPACE,
};

/* A single input (eg attack) */
export class Input
{
    name : string;
    held : boolean;
    justPressed : boolean;
    justReleased : boolean;
    doublePressed : boolean;

    constructor(name)
    {
        this.name = name;
        this.held = false;
        this.justPressed = false;
        this.justReleased = false;
        this.doublePressed = false;
    }

    clearMomentary()
    {
        this.justPressed = false;
        this.justReleased = false;
        this.doublePressed = false;
    }

    press() {
        this.justPressed = !this.held;
        this.held = true;
    }

    release() {
        this.justReleased = !!this.held;
        this.held = false;
    }
}

export class KeyboardControls
{
    inputByKey : any;
    inputs : any;
    time : number;
    lastInputPressed : Input;
    lastInputPressedTime : number;
    up : Input;
    down : Input;
    left : Input;
    right : Input;
    primary : Input;
    swap : Input;
    space : Input;
    anyKey : Input;
    numKeysDown : number = 0;

    constructor()
    {
    	// Map of Input instances stored by key code
    	this.inputByKey = {};
    	this.inputs = [];
    	this.time = 0;
    	// Keep track of the last input pressed, so we can detect double-clicks
    	this.lastInputPressed = null;
    	this.lastInputPressedTime = 0;
    	for (let name of Object.keys(DEFAULTS))
    	{
            let keys = DEFAULTS[name];

            if (typeof(keys.push) !== "function") {
                keys = [keys];
            }

            this[name] = new Input(name);
            this.inputs.push(this[name]);
            for (let key of keys) {
                this.inputByKey[key] = this[name];
            }
        }
        this.anyKey = new Input('*');
    }

    getX()
    {
        return ((+this.right.held) - (+this.left.held));
    }

    getY()
    {
        return ((+this.down.held) - (+this.up.held));
    }

    /* This should be called after the game state is updated */
    update(dt)
    {
        this.time += dt;
        for (let input of this.inputs)
        {
            input.clearMomentary();
        }
        this.anyKey.clearMomentary();
    }

    attachKeyboardEvents()
    {
        window.addEventListener("keydown", (event) => {
            event.stopPropagation();
            event.preventDefault();

            // Ignore auto-repeated characters when the user holds down a key
            if (event.repeat)
            {
                return;
            }

            var input = this.inputByKey[event.keyCode];
            if (input && !input.held)
            {
                // Handle double-pressing the input
                if (this.lastInputPressed === input &&
                    this.time - this.lastInputPressedTime < DOUBLE_PRESS_TIME)
                {
                    input.doublePressed = true;
                }
                this.lastInputPressedTime = this.time;
                this.lastInputPressed = input;

                input.press();
            }
            if (this.numKeysDown === 0) {
                this.anyKey.press();
            }
            this.numKeysDown++;
        });

        window.addEventListener("keyup", (event) => {
            event.stopPropagation();
            event.preventDefault();

            var input = this.inputByKey[event.keyCode];
            if (input)
            {
                input.release();
            }
            this.numKeysDown--;
            if (this.numKeysDown === 0) {
                this.anyKey.release();
            }
        });
    }
}

/******************/
/* ManualControls */
/******************/

export class ManualControls
{
    dirx : number;
    diry : number;
    up : Input;
    down : Input;
    left : Input;
    right : Input;
    primary : Input;
    swap : Input;
    space : Input;

    constructor()
    {
        this.dirx = 0;
        this.diry = 0;

        for (let name of Object.keys(DEFAULTS))
        {
            this[name] = new Input(name);
        }
    }

    getX() {
        return this.dirx;
    }

    getY() {
        return this.diry;
    }
}
