
var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babel = require('gulp-babel');
var buffer = require('vinyl-buffer');

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

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['js'])
});