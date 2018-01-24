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

var Demo = require("./demo.js");

function start()
{
    var game = new Phaser.Game(
        400, 300,       // canvas size
	//"100", "100",   // percentage of container size
        Phaser.AUTO,    // renderer
        'canvas_area',  // DOM object
        new Demo(),     // default state
        false,          // transparent
	false           // anti-aliasing
    );

    //game.state.add("loading", new Loading());
}

module.exports = {
    start: start
};
