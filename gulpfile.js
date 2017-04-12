var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    poststylus = require('poststylus'),
    cssnano = require('gulp-cssnano')
    autoprefixer = require('autoprefixer'),
    browserSync = require('browser-sync').create(),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    rigger = require('gulp-rigger'),
    header = require('gulp-header'),

    pkg = require('./package.json');

var config = {
  dist: {
    css: {
      path: 'dist/css',
      endpoint: 'app.css'
    },
    html: 'dist/html',
    js: 'dist/js'
  },
  src: {
    stylus: {
      path: 'src/stylus',
      watch: 'src/stylus/**/*.styl',
      endpoint: 'app.styl'
    },
    html: 'src/html/*.html',
    js: 'src/js/*.js'
  }
};

// Set the banner content
var banner = ['/*!\n',
    ' * <%= pkg.title %> v<%= pkg.version %>\n',
    ' * Copyright ' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' */\n',
    ''
].join('');

gulp.task('stylus', function () {
  gulp.src( config.src.stylus.path + '/' + config.src.stylus.endpoint )
    .pipe(stylus({
      use: [
        poststylus([
    		require('postcss-font-magician')({ /* options */ }),
        	autoprefixer('last 5 version', '> 1%', 'ie 9'),
        	'rucksack-css',
        	'css-mqpacker'
        ])
      ]
    }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest( config.dist.css.path ))
});

gulp.task('css:minify', ['stylus'], function () {
    gulp.src( config.dist.css.path + '/' + config.dist.css.endpoint )
      .pipe(cssnano({
        discardComments: {
          removeAll: true
        }
      }))
      .pipe(header(banner, { pkg: pkg }))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest( config.dist.css.path ))
});

// Copy JS to dist
gulp.task('js', function() {
    return gulp.src(config.src.js)
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(config.dist.js))
})

// Minify JS
gulp.task('js:minify', ['js'], function() {
    return gulp.src([config.dist.js+'/**/*.js', '!'+config.dist.js+'/**/*.min.js'])
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.dist.js))
});

gulp.task('html:build', function () {
    gulp.src( config.src.html )
      .pipe(rigger())
      .pipe(gulp.dest( config.dist.html ))
});

// Configure the browserSync task
gulp.task('browserSync', function() {
  open: false,
  browserSync.init({
      server: {
          baseDir: '.',
          directory: true
      },
  })
})

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(config.src.stylus.watch, ['css:minify'], browserSync.reload({
    stream: true
  }));

  gulp.watch(config.src.js, ['js:minify'], browserSync.reload);
  gulp.watch(config.src.html, ['html:build'], browserSync.reload);
});

// only compile
gulp.task('dist', ['css:minify', 'js:minify', 'html:build']);

gulp.task('default', ['browserSync', 'dist', 'watch']);
