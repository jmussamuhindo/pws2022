var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');

var $ = require('gulp-load-plugins')({lazy:true});

gulp.task('vet', function () {
    log('Analyzing source with JSHint and JSCS');

    return gulp
    .src(['./src/**/*.js', './test/**/*.js'])
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('test', ['vet'], function (done) {
    startTests(true, done);
});

gulp.task('autotest', ['vet'], function (done) {
    startTests(false, done);
});

gulp.task('styles', ['clean-styles'], function () {
    log('minifying CSS');
});

gulp.task('clean', function (done) {
    var delconfig = [].concat(config.report, config.build);
    log('Cleaning: ' + $.util.colors.red(delconfig));
    del(delconfig, done);
});

gulp.task('clean-build', function (done) {
    var files = [].concat(
        config.build + '**/*.css',
        config.build + '**/*.js'
    );
    clean(files, done);
});

gulp.task('build', ['build-js', 'build-css', 'clean-build'], function () {
    log('Building dist files');

});

gulp.task('build-js', function () {
    log('Build JS files');

    return gulp
    .src('./src/**/*.js')
    .pipe(gulp.dest(config.build))
    .pipe($.ngAnnotate({add:true}))
    .pipe($.uglify())
    .pipe($.concat('angular-cog-alert.min.js'))
    .pipe(gulp.dest(config.build));
});

gulp.task('default', ['test']);

gulp.task('build-css', function () {
    log('Build CSS files');

    return gulp
    .src('./src/**/*.css')
    .pipe(gulp.dest(config.build))
    .pipe($.csso())
    .pipe($.concat('angular-cog-alert.min.css'))
    .pipe(gulp.dest(config.build));
});

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.green(path));
    del(path, done);
}

function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                if (typeof (msg[item]) === 'object') {
                    $.util.log($.util.colors.blue(item));
                    log(msg[item]);
                } else {
                    $.util.log($.util.colors.blue(item + ': ') + $.util.colors.yellow(msg[item]));
                }
            }
        }
    } else {
        $.util.log($.util.colors.yellow(msg));
    }
}

function startTests(singleRun, done) {
    var karma = require('karma').server;

    karma.start({
        configFile: __dirname + '/karma.conf.js',
        exclude: [],
        singleRun: !!singleRun
    }, karmaCompleted);

    function karmaCompleted(karmaResult) {
        log('Karma completed');
        if (karmaResult === 1) {
            done('karma: tests failed with code ' + karmaResult);
        } else {
            done();
        }
    }
}
