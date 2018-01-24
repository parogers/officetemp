
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
