var jpeg = require('jpeg-js')
var fs = require('fs')
var synaptic = require('synaptic') // this line is not needed in the browser
var d3 = require('d3')

console.log('dvr starting up')

var Neuron = synaptic.Neuron,
  Layer = synaptic.Layer,
  Network = synaptic.Network,
  Trainer = synaptic.Trainer,
  Architect = synaptic.Architect

var useful_indexes = [ 0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 128, 129, 130, 131, 132, 133, 134, 135, 144, 145, 146, 147, 148, 149, 150, 151, 160, 161, 162, 163, 164, 165, 166, 167, 192, 193, 194, 195, 196, 197, 198, 199, 212 ]

module.exports = function dvr () {
  var current_frame_index = 0
  var input_frames = []
  var isRecording
  var isPlayingRecording
  var isPaused
  var nes_state_string = ''

  // network stuff
  var networkRunning = false
  var framesPlayed = 0
  var mostFramesPlayed = 0
  var bestNet = ''

  var mutation_rate = 0.1
  var mutation_size = 10.0
  var input_threshold = 0.5

  // profiling stuff
  // var detector = require('./array_change_detector.js')(window.nes.ppu.spriteMem)

  // liquid
  // var input = useful_indexes.length
  // var pool = 1
  // var output = 3
  // var connections = 4
  // var gates = 3
  //
  // var instance = new Architect.Liquid(input, pool, output, connections, gates)

  // var HIDDEN_SIZE = 4
  // var instance = new Architect.Perceptron(useful_indexes.length, HIDDEN_SIZE, 3)

  // load from file
  var k = require('../liquid.json')
  var instance = Network.fromJSON(k)

  var k = instance.toJSON()
  console.log(k)
  mutate_net(k, 1, 10)
  bestNet = JSON.stringify(k)

  // neural network stuff
  // if (window.localStorage.getItem('bestNet') !== null) {
  //   console.log('loading from disk')
  //   k = JSON.parse(window.localStorage.getItem('bestNet'))
  // }

  // console.log(k)
  //

  console.log(instance)

  function mutate_net (net, rate, size) {
    console.log('mutating')
    var n_mutations = 0
    net.connections.forEach(function (v, idx) {
      if (Math.random() <= rate) {
        var value_to_add = (Math.random() * (size * 2.0)) - size
        // console.log('adding', value_to_add, 'to', v.weight)
        n_mutations += 1
        v.weight += value_to_add
      }
    })
    net.neurons.forEach(function (v, idx) {
      if (Math.random() <= rate) {
        var value_to_add = (Math.random() * (size * 2.0)) - size
        // console.log('adding', value_to_add, 'to', v.weight)
        n_mutations += 1
        v.bias += value_to_add
      }
    })
    require('./nn_draw.js')({
      data: net
    })
    console.log('n_mutations', n_mutations)
  }

  function init () {
    // reset all the state
    // window.nes.start()
    isRecording = false
    isPlayingRecording = false
  }
  function play () {
    isPaused = false
  }
  function play_recording () {
    isPlayingRecording = true
    current_frame_index = 0
    var m = JSON.parse(window.localStorage.getItem('foo'))
    nes_state_string = m.nes_state_string
    if (nes_state_string === undefined) {
      nes_state_string = m.nes_state
    }
    input_frames = m.input_frames
    window.nes.fromJSON(JSON.parse(nes_state_string))
  }
  function start_recording () {
    // clear the input frames
    // save the state
    isRecording = true
    isPlayingRecording = false
    input_frames = []
    nes_state_string = JSON.stringify(window.nes.toJSON())
    console.log(nes_state_string.length)
  }
  function load_recording () {
    // var k = window.localStorage.getItem('')
  }
  function stop_recording () {
    isRecording = false
    console.log('saving', input_frames.length, 'frames')
    window.localStorage.setItem('foo', JSON.stringify({
      input_frames: input_frames,
      nes_state_string: nes_state_string
    }))
  }

  function save_state () {
    window.localStorage.setItem('foo-nes-state', JSON.stringify(window.nes.toJSON()))
  }
  function load_state () {
    window.nes.fromJSON(JSON.parse(window.localStorage.getItem('foo-nes-state')))
  }

  function tick () {
    // console.log('tick')
    if (!isPaused) {
      if (isRecording) {
        // console.log('here')
        input_frames.push(window.nes.keyboard.state1.join('\t').split('\t'))
      }
      if (isPlayingRecording) {
        // console.log('playing recording', current_frame_index)
        input_frames[current_frame_index].forEach(function (v, idx) {
          window.nes.keyboard.state1[idx] = v
        })
        current_frame_index += 1
        if (current_frame_index >= input_frames.length - 1) {
          console.log('frame index reset')
          setTimeout(play_recording, 1)
        }
      }
      if (networkRunning) {
        framesPlayed += 1
        // activate network on spritemem and
        var input_this_frame = []
        useful_indexes.forEach(function (v) {
          input_this_frame.push(window.nes.ppu.spriteMem[v] / 256)
        })
        var m = instance.activate(input_this_frame)
        // var m2 = instance2.activate(window.nes.ppu.spriteMem.map(function (o) { return o / 256 }))
        m = m.map(function (o) { if (o > input_threshold) { return 65 } else { return 64 } })
        // m2 = m2.map(function (o) { if (o > 0.01) { return 65 } else { return 64 } })
        // console.log(m.join('\t'))

        if (m[0] === 65) {
          d3.select('div#JUMP').style('background-color', 'red')
        } else {
          d3.select('div#JUMP').style('background-color', 'rgb(220,220,220)')
        }
        if (m[1] === 65) {
          d3.select('div#LEFT').style('background-color', 'red')
        } else {
          d3.select('div#LEFT').style('background-color', 'rgb(220,220,220)')
        }
        if (m[2] === 65) {
          d3.select('div#RIGHT').style('background-color', 'red')
        } else {
          d3.select('div#RIGHT').style('background-color', 'rgb(220,220,220)')
        }

        window.nes.keyboard.state1[0] = m[0]
        window.nes.keyboard.state1[6] = m[1]
        window.nes.keyboard.state1[7] = m[2]
        // window.nes.keyboard.state2[0] = m2[0]
        // window.nes.keyboard.state2[6] = m2[1]
        // window.nes.keyboard.state2[7] = m2[2]

        // window.nes.keyboard.state2[0] = m[0]
        // window.nes.keyboard.state2[6] = m[1]
        // window.nes.keyboard.state2[7] = m[2]
        if (window.nes.cpu.mem[0x48] === 1) {
          console.log('mario died')
          console.log('best frames', mostFramesPlayed)
          console.log('this run', framesPlayed)
          // mario has died
          // score the network

          // determine if the score was the best
          // if yes, store it
          if (framesPlayed >= mostFramesPlayed) {
            console.log('new best found')
            mostFramesPlayed = framesPlayed
            bestNet = JSON.stringify(k)
            d3.select('h1#score').html('Best Run: ' + mostFramesPlayed + ' frames played.')
            window.localStorage.setItem('bestNet', bestNet)
          }

          k = JSON.parse(bestNet)
          mutate_net(k, mutation_rate, mutation_size)
          instance = Network.fromJSON(k)
          framesPlayed = 0
          load_state()

          // mutate the best network
          // load_state()

        }
      }
      // console.log('frame')
      window.nes.frame()
      // detector.tick(window.nes.ppu.spriteMem)
      // if (framesPlayed % 100 === 0) {
      //   var a = []
      //   detector.get_changes().forEach(function (v, idx) { if (v > 1) { a.push([idx].join(','))} })
      //   console.log(a.join(','), a.length)
      // }

    }
  }
  return {
    init: init,
    tick: tick,
    start_recording: start_recording,
    stop_recording: stop_recording,
    play_recording: play_recording,
    load_recording: load_recording,
    save_state: save_state,
    load_state: load_state,
    go_network: function () {
      load_state()
      networkRunning = true
    },
    get_input_frames: function () {
      return input_frames
    }
  }
}
