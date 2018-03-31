
module.exports = {}

module.exports.ALL = {
    SPRITES: 'sprites.json',
    SND_TEST: 'powerup1.wav',
};

for (let key in module.exports.ALL) {
    module.exports[key] = module.exports.ALL[key];
}

module.exports.getImage = function(sheet, name) {
    if (name === undefined) {
	return PIXI.loader.resources[sheet];
    }
    return PIXI.loader.resources[sheet].textures[name];
}
