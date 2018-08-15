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

const fs = require('fs');
const gulp = require('gulp');
const concat = require('gulp-concat');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');
const buffer = require('vinyl-buffer');
const { spawn } = require('child_process');

const genblockfont_path = './tools/genblockfont.py';
const xcf2atlas_path = '../xcf2atlas/xcf2atlas.py';
const inkscape_path = 'inkscape';

const src_media_path = './rawdata';
const dest_media_path = './www/media';

gulp.task('default', ['js', 'watch'])

gulp.task('js', function() {
    let opts = {
	'standalone' : 'officetemp',
    };
    return browserify('src/main.js', opts)
	.bundle()
	.on('error', function (err) { console.error(err); })
	.pipe(source('www/officetemp.js'))
	.pipe(buffer())
	.pipe(babel())
	.pipe(gulp.dest('.'));
});

gulp.task('build-fonts', function(cb) {
    function run_genblockfont(src, dest, spacing) {
	let args = ['--char-spacing=' + (spacing||0), src, dest];
	let cmd = spawn(genblockfont_path, args, {stdio: 'inherit'});
	return new Promise((resolve, reject) => {
	    cmd.on('close', code => {
		resolve(code);
	    });
	});
    }

    return Promise.all([
	run_genblockfont(
	    src_media_path + '/boxy_bold_font_rev.xcf',
	    dest_media_path + '/boxybold'),
	
	run_genblockfont(
	    src_media_path + '/led_font.xcf',
	    dest_media_path + '/ledfont', 1),
    ]);
});

gulp.task('build-media', function(cb) {

    function run_inkscape(dest, src) {
	let args = [
	    '--export-png=' + dest,
	    '--export-area-page',
	    '-z', src];
	let cmd = spawn(inkscape_path, args, {stdio: 'inherit'});

	return new Promise((resolve, reject) => {
	    cmd.on('close', code => {
		resolve(code);
	    });
	});
    }

    function run_xcf2atlas(dest_image, dest_json, src_files) {
	let args = [
	    '--image=' + dest_image,
	    '--json=' + dest_json]

	args = args.concat(src_files)

	let cmd = spawn(xcf2atlas_path, args, {stdio: 'inherit'});
	return new Promise(
	    (resolve, reject) => {
		cmd.on('close', code => {
		    resolve(code);
		});
	    }
	);
    }
    let sprite_path = src_media_path + '/sprites/';
    let sprites = fs.readdirSync(sprite_path);

    sprites = sprites.map(path => sprite_path + path);

    return Promise.all([
	run_xcf2atlas(
	    dest_media_path + '/office.png',
	    dest_media_path + '/office.json',
	    [src_media_path + '/office.xcf']),

	run_xcf2atlas(
	    dest_media_path + '/sprites.png',
	    dest_media_path + '/sprites.json',
	    sprites),

	run_inkscape(
	    dest_media_path + '/title-text.png',
	    src_media_path + '/title-text.svg'),
    ]);

});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['js']);
    gulp.watch(
	['rawdata/office.xcf', 'rawdata/sprites/*.xcf', 'rawdata/*.svg'],
	['build-media']);
    gulp.watch(
	'rawdata/fonts/*.xcf',
	['build-fonts']);
});
