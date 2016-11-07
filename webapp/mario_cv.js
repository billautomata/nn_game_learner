module.exports = function cv (options) {
  var mario_position = []

  // read the sprite mem to find everything going on
  function tick () {
    console.log('mario x position', window.nes.ppu.spriteMem[23])
    console.log('mario y position', window.nes.ppu.spriteMem[28])
    console.log('luigi x position', window.nes.ppu.spriteMem[43])
    console.log('luigi y position', window.nes.ppu.spriteMem[48])
  }

}

// setInterval(function(){ var a = []; var b = 32; var e = 64; window.nes.ppu.spriteMem.slice(b,e).forEach(function(v,i){a.push([b+i,v].join(','))}); console.log(a.join('\t')) }, 100)
