

function toggle(items, item) {
  var idx = items.indexOf(item);
  if (idx == -1) {
    items.push(item);
  } else {
    items.splice(idx, 1);
  }
}

function contains(items, item) {
  return items.indexOf(item) != -1;
}

module.exports = {
  toggle: toggle,
  contains: contains
};
