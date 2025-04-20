const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

// Task: compile TypeScript
function compileTypescript() {
  return tsProject.src().pipe(tsProject()).pipe(gulp.dest('dist'));
}

// Task: copy assets
function copyAssets() {
  return gulp
    .src('src/email/templates/**', { base: 'src' })
    .pipe(gulp.dest('dist'));
}

// Task: full build
const build = gulp.series(compileTypescript, copyAssets);

exports.build = build;
exports.default = build;
