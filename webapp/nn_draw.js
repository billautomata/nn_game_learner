var d3 = require('d3')
module.exports = function draw_nn (options) {
  // options.data

  console.log('drawing')

  d3.select('div#network').selectAll('*').remove()

  var controller_parent = d3.select('div#network').append('div')
  controller_parent.append('div').attr('class', 'button').attr('id', 'LEFT').style('width', '50px').style('height', '50px').style('display', 'inline-block').html('LEFT')
  controller_parent.append('div').attr('class', 'button').attr('id', 'RIGHT').style('width', '50px').style('height', '50px').style('display', 'inline-block').html('RIGHT')
  controller_parent.append('div').attr('class', 'button').attr('id', 'JUMP').style('width', '50px').style('height', '50px').style('display', 'inline-block').html('JUMP')

  var w = 100
  var h = 100
  var svg = d3.select('div#network').append('svg')
    .attr('viewBox', [0, 0, w, h].join(' '))
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('width', '100%')

  var neurons = options.data.neurons
  var connections = options.data.connections

  var scale_angle = d3.scaleLinear().domain([0, neurons.length]).range([0, Math.PI * (neurons.length * 0.11)])
  var scale_stroke_width = d3.scaleLinear().domain([0, 20]).range([0.5, 1])

  var g_parent = svg.append('g').attr('transform', ['translate(', w * 0.5, h * 0.5, ')'].join(' '))

  var r = w * 0.35

  connections.forEach(function (c, idx) {
    // console.log(c)
    var x1 = r * Math.cos(scale_angle(Number(c.from)))
    var y1 = r * Math.sin(scale_angle(Number(c.from)))
    var x2 = r * Math.cos(scale_angle(Number(c.to)))
    var y2 = r * Math.sin(scale_angle(Number(c.to)))
    g_parent.append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('stroke', function () {
        if (c.weight < 0) {
          return 'red'
        } else {
          return 'green'
        }
      })
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', scale_stroke_width(c.weight))
  })

  neurons.forEach(function (n, idx) {
    var x = r * Math.cos(scale_angle(idx))
    var y = r * Math.sin(scale_angle(idx))
    g_parent.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', Math.abs(n.bias * 0.1))
      .attr('fill', function () {
        if (n.bias < 0) {
          return 'red'
        } else {
          return 'blue'
        }
      })
      .attr('fill-opacity', 0.5)
      .attr('stroke', 'none')
  })
}
