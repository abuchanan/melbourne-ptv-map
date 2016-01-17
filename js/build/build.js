var path          = require('path');
var stream        = require('stream');
var browserify    = require('browserify-incremental');
var del           = require('del');
var source        = require('vinyl-source-stream');
var notifier      = require('node-notifier');
var vfs           = require('vinyl-fs');

var DEBUG = true;
var ROOT = path.join(__dirname, '..', '..');

function build_path() {
  var BUILD_DIR = path.join(ROOT, 'build');
  var args = Array.prototype.slice.call(arguments);
  var parts = [BUILD_DIR].concat(args);
  return path.join.apply(null, parts);
}

function build_dest() {
  return vfs.dest(build_path.apply(null, arguments));
}


var toCopy = [
  'css/**/*.css',
  'templates/index.html',
];


var BuildResult = {
  number: 0,
  errors: [],
  clear_errors() {
    this.errors = [];
  },
  notify() {

    if (this.errors.length > 0) {
      var notification = {
        title: "Build Failed",
        message: this.errors[0].message,
        icon: path.join(__dirname, 'images', 'build', 'Error-128.png'),
      };
    } else {
      var notification = {
        title: "Build Complete",
        message: "Build Complete #" + BuildResult.number,
      };
    }

    notifier.notify(notification);
  }
};

function before_build() {
  BuildResult.number += 1;
  BuildResult.clear_errors();
}


function after_build() {
  BuildResult.notify();
}



function log_error(err) {
  // Remove __dirname from the error message to make it more easily readable.
  err.message = err.message.split(__dirname).join('');
  console.log(err);
  BuildResult.errors.push(err);
  this.end();
}

function clean() {
  return del(build_path());
}


function copy_css() {
  return vfs.src('css/**/*.css', {base: ROOT}).pipe(build_dest());
}

function copy_index_html() {
  return vfs.src('templates/index.html').pipe(build_dest());
}

function copy_files() {
  return sequence(copy_css, copy_index_html);
}


function bundle_app() {
  return browserify({
      entries: ['js/app.js'],
      cacheFile: 'build-cache/app-browserify-incremental-cache.json',
      debug: DEBUG,
      baseDir: __dirname,
    })
    .bundle()
    .on('error', log_error)
    .pipe(source('bundle.js'))
    .pipe(build_dest());
}

function sequence() {
  var tasks = Array.prototype.slice.call(arguments);

  return new Promise(function(resolve, reject) {
    var i = -1;
    var last_task;
    start_next();

    function start_next() {
      i++;

      if (last_task) {
        console.log("Done:", last_task.name);
      }

      if (i == tasks.length) {
        resolve();
        return;
      }

      var task = tasks[i];
      last_task = task;
      console.log('Starting:', task.name);
      var st = task();

      if (st instanceof Promise) {
        st.then(start_next);
      } else if (st instanceof stream.Stream) {
        st.on('end', start_next);
      } else if (st === undefined) {
        start_next();
      } else {
        throw new Error("Unknown task return type: " + (typeof stream));
      }
    }
  });
}

function build_all() {
  return sequence(clean, copy_files, bundle_app);
}

module.exports = {
  build_all: build_all,
};
