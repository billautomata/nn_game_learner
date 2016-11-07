var JSNES = window.JSNES
var $ = window.$
var d3 = require('d3')

window.N_TICKS = 1

window.nes = new JSNES({
  'ui': $('#emulator').JSNESUI({
    'Homebrew': []
  })
})

window.dvr = require('./dvr.js')()
window.rom_url = '/local-roms/Mario Bros. (JU) [!].nes'

if (window.localStorage.getItem('foo') === null) {
  //  window.localStorage.setItem('foo', JSON.stringify(require('../../runs/example_run.json')))
}

// window.rom_url = '/local-roms/Donkey Kong (JU) [p1].nes'
window.nes.ui.loadROM(function (romdata) {
  // window.dvr.play_recording()
  window.dvr.go_network()
  global_tick()
})

function global_tick () {
  if (window.N_TICKS > 10) {
    window.draw_frame = 'blegh'
    div_warning.style('display', null)
  } else {
    window.draw_frame = null
    div_warning.style('display', 'none')
  }

  for (var i = 0; i < window.N_TICKS; i++) {
    window.dvr.tick()
  }
  window.requestAnimationFrame(global_tick)
}

var div_parent = d3.select('body').append('div')
var input = div_parent.append('input')
  .attr('type', 'range')
  .attr('min', '1')
  .attr('max', '100')
  .attr('step', '1')
  .property('value', window.N_TICKS)
  .style('width', '98%')

var div_value = div_parent.append('h1').html(window.N_TICKS + 'x')
var div_warning = div_parent.append('h4').html('not displaying screen because the speedup is too fast').style('display', 'none')

input.on('input', function () {
  value = d3.select(this).property('value')
  console.log('value')
  window.N_TICKS = value
  div_value.html(value + 'x')
})

console.log(window.nes)

window.r = window.dvr.start_recording
window.s = window.dvr.stop_recording
