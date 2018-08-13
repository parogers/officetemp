
var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babel = require('gulp-babel');
var buffer = require('vinyl-buffer');
var { spawn } = require('child_process');

var genblockfont_path = './tools/genblockfont.py';
var xcf2atlas_path = '../xcf2atlas/xcf2atlas.py';
var inkscape_path = 'inkscape';

var src_media_path = './rawdata';
var dest_media_path = './www/media';

gulp.task('default', ['js', 'watch'])

gulp.task('js', function() {
    var opts = {
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
