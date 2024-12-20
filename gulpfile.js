/**
 * Task to building styles
 */

const gulp = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const mqpacker = require('css-mqpacker');
const path = require('path');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sass = require('gulp-sass')(require('sass'));
const del = require('del');

const postCSSOptions = [
    autoprefixer(),
    mqpacker(),
    cssnano(),
];

const sassOptions = {
    includePaths: [path.resolve(__dirname, './src/')],
};

module.exports = {
    postCSSOptions,
    sassOptions,
};

gulp.task('editor', function () {
    return gulp
        .src([path.resolve(__dirname, './src/assets/editor.scss')])
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(sass({ includePaths: ['node_modules'] }))
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(concat('editor.css'))
        .pipe(postcss(postCSSOptions))
        .pipe(gulp.dest('wp-editor-json-import/assets/css/'));
});

gulp.task('build-process', gulp.parallel('editor'));

gulp.task('build', gulp.series('build-process'));

gulp.task(
    'watch',
    gulp.series('build-process', function watch(done) {
        watchProcess();
        done();
    })
);

const watchProcess = (basePath = '.') => {
    gulp.watch([`${basePath}/src/**/*.scss`], gulp.parallel(['editor']));
};

gulp.task('clean', function () {
    return del([
        './build/**',
        './release/**',
        './wp-editor-json-import/assets/js/**',
        './wp-editor-json-import/assets/css/**',
    ], { force: true });
});


module.exports.watchProcess = watchProcess;