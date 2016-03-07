'use strict';


// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    sassdoc      = require('sassdoc'),
    concat       = require('gulp-concat');


// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var input               = 'client/styles/*.scss',
    output              = 'client/',
    sassOptions         = { outputStyle: 'expanded' },
    autoprefixerOptions = { browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] },
    sassdocOptions      = { dest: 'dist/sassdoc' },
    bowerPath           = './bower_components/',
    bowerComponents     = [
        bowerPath + 'underscore/underscore.js',
        bowerPath + 'jquery/dist/jquery.js',
        bowerPath + 'angular/angular.js',
        bowerPath + 'angular-ui-router/release/angular-ui-router.js',
        bowerPath + 'moment/moment.js',
        bowerPath + 'bootstrap/dist/js/bootstrap.js',
        bowerPath + 'd3/d3.js',
        bowerPath + 'd3-tip/index.js',
        bowerPath + 'angular-loading-bar/src/loading-bar.js',
        bowerPath + 'zeroclipboard/dist/ZeroClipboard.js',
        bowerPath + 'angular-sanitize/angular-sanitize.js',
        bowerPath + 'showdown/dist/showdown.js',
        bowerPath + 'ng-showdown/dist/ng-showdown.js',
        bowerPath + 'angular-markdown-directive/markdown.js'
    ],
    angularPath         = './client/app/',
    angularComponents   = [
        angularPath + 'content/content.js',
        angularPath + 'details/details.js',
        angularPath + 'nav/nav.js',
        angularPath + 'results/results.js',
        angularPath + 'topModules/topModules.js',
        angularPath + 'services/*.js'
    ];


// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------

gulp.task('sass', function () {
  return gulp
    .src(input)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(output));
});

gulp.task('sassdoc', function () {
  return gulp
    .src(input)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});

gulp.task('concatenate', function() {
    return gulp.src(bowerComponents)
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./client/'));
});

gulp.task('angularConcatenate', function() {
    return gulp.src(angularComponents)
    .pipe(concat('angularComponents.js'))
    .pipe(gulp.dest('./client/'));
});

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

gulp.task('watch', function() {
  return gulp
    // Watch the input folder for change,
    // and run `sass` task when something happens
    .watch(input, ['sass'])
    // When there is a change,
    // log a message in the console
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});


// -----------------------------------------------------------------------------
// Production build
// -----------------------------------------------------------------------------

gulp.task('prod', ['sassdoc', 'concatenate', 'angularConcatenate'], function () {
  return gulp
    .src(input)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(output));
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['sass', 'watch' /*, possible other tasks... */]);