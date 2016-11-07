module.exports = function change_detector (options) {
  // options.data

  var data = [] // previous frame
  var changes = [] // index scores

  options.forEach(function (v) {
    data.push(v)
    changes.push(0)
  })
  console.log(data.join('\t'))

  function tick (d) {
    d.forEach(function (v, idx) {
      if (v !== data[idx]) {
        changes[idx] += 1
      }
      data[idx] = v
    })
  }

  return {
    tick: tick,
    get_changes: function () {
      return changes
    }
  }
}
