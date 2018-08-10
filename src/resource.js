
module.exports = {}

module.exports.ALL = {
    SPRITES: 'sprites.json',
    TITLE: 'title-text.png',
    OFFICE: 'office.json',
    GAME_FONT: 'boxybold.fnt',
    LED_FONT: 'ledfont.fnt',
    SND_TEST: 'powerup1.wav',
};

for (let key in module.exports.ALL) {
    module.exports[key] = module.exports.ALL[key];
}

module.exports.getImage = function(sheet, name) {
    let img = null;
    let res = PIXI.loader.resources[sheet];
    if (!res) {
	console.log("WARNING: cannot find sheet " + sheet);
	return null;
    }
    
    if (name === undefined) {
	img = res.texture;
    } else {
	img = res.textures[name];
    }
    if (!img) {
	console.log("WARNING: can't find texture: " + sheet + "/" + name);
    }
    return img;
}
