
module.exports = {}

module.exports.ALL = {
    SPRITES: 'sprites.json',
    TITLE: 'title-text.png',
    SND_TEST: 'powerup1.wav',
};

for (let key in module.exports.ALL) {
    module.exports[key] = module.exports.ALL[key];
}

module.exports.getImage = function(sheet, name) {
    let img = null;
    if (name === undefined) {
	img = PIXI.loader.resources[sheet].texture;
    } else {
	img = PIXI.loader.resources[sheet].textures[name];
    }
    if (!img) {
	console.log("WARNING: can't find texture: " + sheet + "/" + name);
    }
    return img;
}
