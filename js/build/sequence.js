module.exports = function() {
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
