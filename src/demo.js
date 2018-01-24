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

var spaceKey;
var velx = 0;
var vely = 0;
var accelx = 0;
var accely = 0;
var timer = 1;

class TimerList
{
    constructor() {
	this.timers = [];
    }

    create(callback, delay, arg) {
	let tm = new Timer(callback, delay, arg);
	this.timers.push(tm)
    }

    update(dt) {
	let n = 0;
	while (n < this.timers.length)
	{
	    let timer = this.timers[n];
	    if (!timer.update(dt)) {
		let last = this.timers.pop();
		if (timer !== last) this.timers[n] = last;
	    } else {
		n++;
	    }
	}
    }

    wait(delay) {
	return new Promise((resolve, reject) => {
	    this.create(resolve, delay, "HELLO WORLD");
	});
    }
}

class Timer
{
    constructor(callback, delay, arg) {
	this.callback = callback;
	this.delay = delay;
	this.arg = arg
    }

    update(dt) {
	this.delay -= dt;
	if (this.delay <= 0) {
	    this.callback(this.arg);
	    return false;
	}
	return true;
    }
}

class Demo
{
    preload() 
    {
	//this.game.load.image('test', 'test.png');
	//this.game.load.image('frame', 'frame.png');
	this.game.load.atlas(
	    'sprites', 'media/sprites.png', 'media/sprites.json');
	this.game.load.audio('hit', 'hit.wav');
    }

    create() 
    {
	this.game.physics.startSystem(Phaser.Physics.ARCADE);

	this.timers = new TimerList();
	/*this.timers.create(() => {
	    console.log("DONE");
	}, 5);*/

	this.timers.wait(5).then(result => {
	    console.log("DONE " + result);
	    return this.timers.wait(3);
	}).then(result => {
	    console.log("REALLY DONE " + result);
	    return "DATA";
	}).then(result => {
	    console.log("I GOT " + result);
	});

	/*sprite = this.game.add.sprite(
	    this.game.world.centerX, 
	    this.game.world.centerY, 'theatlas', 'something');*/
	/*sprite = this.game.add.sprite(
	    this.game.world.centerX, 
	    this.game.world.centerY, 'frame');
	sprite.anchor.set(0.5);
	sprite.scale.set(10);
	sprite.loadTexture("test");
	console.log(sprite.frameName);*/

	this.terranceX = 300;
	this.terranceY = 220;
	this.timeCount = 0;

	this.terrance = this.game.add.sprite(
	    0, 0, 'sprites', 'terrance_frazzled');
	this.terrance.scale.set(3);
	this.terrance.anchor.set(0.5, 1);
	this.terrance.position.set(this.terranceX, this.terranceY);

	//let anim = this.terrance.animations.add(
	//    'idle', ['terrance_idle', 'terrance_frazzled'], 2);
	//anim.loop = true;
	//anim.play();

	this.sweaterGuy = this.game.add.sprite(0, 0, 'sprites');
	this.sweaterGuy.anchor.set(0.5, 1);
	this.sweaterGuy.scale.set(3);
	this.sweaterGuy.position.set(100, 220);

	let anim = this.sweaterGuy.animations.add(
	    "drink", ["sweater_drink1", "sweater_drink1", "sweater_drink2"], 1);
	anim.loop = true;
	anim.play();

	this.controls = this.game.input.keyboard.createCursorKeys();
	spaceKey = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
	this.game.input.keyboard.addKeyCapture([spaceKey.keyCode]);

	//this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	//this.game.scale.pageAlignHorizontally = true;
	//this.game.scale.pageAlignVertically = true;

	//this.game.physics.arcade.enable(sprite);
    }

    update() 
    {
	var dt = this.game.time.elapsedMS/1000.0;

	this.timeCount += dt;

	let x = this.terranceX + 1.5*Math.sin(50*this.timeCount);
	let y = this.terranceY + 0.75*Math.cos(40*this.timeCount);
	this.terrance.position.set(x, y);

	this.timers.update(dt);

	return;

	if (spaceKey.isDown) {
	}

	var dirx = this.controls.right.isDown - this.controls.left.isDown;
	var diry = this.controls.down.isDown - this.controls.up.isDown;

	accelx = dirx*1000;
	accely = diry*1000;

	velx += accelx*dt;
	vely += accely*dt;

	//sprite.x += velx*dt;
	//sprite.y += vely*dt;
    }

    render()
    {
	//this.game.debug.inputInfo(32, 32);
    }
}

module.exports = Demo;
