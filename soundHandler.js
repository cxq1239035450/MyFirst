/**
 * 音效播放管理
 * 需要达到的效果是
 * 1、可播放单独音效，也可播放拼接音效
 * 2、当需要播放另一段音效时，可立刻停止之前的音效（包括拼接音效）
 */
var event = require('../tqlsdk/event.js');
var defined = require('./defined.js');
class SoundHandler {
  constructor() {
    this.sound_list = []
    this.play_type = 0 // 0: 单独音效 1: 拼接音效
    this.splicing_list = [] // 拼接音效列表
    this.splicing_index = 0
    this.loop_src = null
  }

  playAudio(src, loop = false) {
    this.play_type = 0
    this.splicing_list = null
    if (loop) {
      this.loop_src = src
    }
    this.playAudioBySrc(src)
  }

  stopLoopAudio() {
    this.loop_src = null
  }
  
  getSound(src) {
    for (var i = 0, imax = this.sound_list.length; i < imax; ++i) {
      if (this.sound_list[i].src === src) {
        return { 
          index: i,
          snd: this.sound_list[i].sound
        } 
      }
    }
    var snd = wx.createInnerAudioContext()
    snd.autoplay = false
    snd.src = `/sound/${src}`
    snd.onError(res => {
      console.log('playAudio error', res)
      this.soundError(src)
    })
    snd.onEnded(res => {
      this.handleStop(res, src)
    })
    this.sound_list.push({
      src: src,
      sound: snd
    })
    return {
      index: -1,
      snd: snd
    } 
  }
  soundError(src) {
    for (var i = 0, imax = this.sound_list.length; i < imax; ++i) {
      if (this.sound_list[i].src == src) {
        this.sound_list[i].sound.destroy()
        this.sound_list.splice(i, 1)
        break
      }
    }
  }
  stopExceptSound(src) {
    var index = -1
    var waitlist = []
    if (this.sound_list) {
      this.sound_list.forEach((e, i) => {
        if (e.src === src) {
          index = i
        } else {
          if (e.sound.currentTime > 0 && e.sound.currentTime < e.sound.duration) {
            waitlist.push(e.src)
          }
          e.sound.stop()
        }
      })
    }
    return {index, waitlist}
  }
  playAudioBySrc(src) {
    var rr = this.stopExceptSound(src)
    this.wait_list = rr.waitlist
    var index = rr.index
    var snd = index === -1 ? this.getSound(src).snd : this.sound_list[index].sound
    if (index >= 0) {
      snd.pause()
      snd.seek(0)
    }
    var promise = snd.play()
    if (promise !== undefined) {
      promise.then(() => {
      }).catch(e => {
        console.log(e)
      })
    }
  }
  // 按顺序播放拼接音效
  playSplicingSound(list) {
    if (!list || list.length === 0) {
      return
    }
    this.play_type = 1
    this.splicing_list = list
    this.splicing_index = 0
    var src = list[0]
    this.playAudioBySrc(src)
  }

  handleStop(res, src) {
    if (this.wait_list) {
      var waitidx = this.wait_list.indexOf(src)
      if (waitidx >= 0) {
        this.wait_list.splice(waitidx, 1)
        return
      }
    }
    if (this.play_type === 1 && this.splicing_list) {
      if (this.splicing_index < this.splicing_list.length - 1) {
        var nextSrc = this.splicing_list[this.splicing_index+1]
        var snddata = this.getSound(nextSrc)
        if (snddata.index >= 0) {
          snddata.snd.pause()
          snddata.snd.seek(0) 
        }
        var promise = snddata.snd.play()
        if (promise !== undefined) {
          promise.then(() => {
    
          }).catch(e => {
            console.log(e)
          })
        }
        this.splicing_index++
        return
      } else {
        if (this.need_notify_end) {
          this.need_notify_end = false
          event.emit(defined.SOUND_END)
        }
      }
    }
    if (this.loop_src) {
      this.playAudioBySrc(this.loop_src)
    }
  }
  // 播放0.5
  playDotDecimal(vscore) {
    // console.log('playDotDecimal', vscore)
    var score = vscore * 1
    var vInteger = Math.trunc(score) // 整数部分
    var vDecimal = score - vInteger // 小数部分
    var decimalValue = ((vDecimal * 10).toFixed(0)) * 1
    var list = []
    if (decimalValue > 0) {
      if (decimalValue == 5) {
        list.push('dotfive.mp3')
      } else {
        list.push('dot.mp3')
        list.push(`${decimalValue}.mp3`)
      }
    }
    this.playSplicingSound(list)
  }

  playScore(vscore, notifyEnd = false) {
    // console.log('playScore', vscore)
    var score = vscore * 1
    var vInteger = Math.trunc(score) // 整数部分
    var vDecimal = score - vInteger // 小数部分
    var decimalValue = ((vDecimal * 10).toFixed(0)) * 1
    var list = []
    var hundred = (vInteger / 100) >> 0
    if (hundred > 0) {
      list.push(`${hundred}.mp3`)
      if (vInteger % 100 === 0) {
        list.push('hundred.mp3')
      }
    }
    var ten = ((vInteger - hundred * 100) / 10) >> 0
    var single = vInteger - hundred * 100 - ten * 10
    if (ten === 0) {
      if (hundred > 0 && single > 0) {
        list.push('0.mp3')
      }
    } else if (ten === 1) {
      if (hundred === 0) {
        list.push('10.mp3')
      } else {
        list.push('1.mp3')
      }
    } else {
      if (hundred <= 0 && ten < 6) {
        list.push(`${ten}0.mp3`)
      } else {
        list.push(`${ten}.mp3`)
      }
    }
    if (single === 0) {
      if (vInteger === 0) {
        list.push('0.mp3')
      } else if (hundred > 0) {
        if (ten > 0) {
          list.push('0.mp3')
        }
      } else if (ten > 5) {
        list.push('10.mp3')
      }
    } else {
      list.push(`${single}.mp3`)
    }
    if (decimalValue > 0) {
      if (decimalValue == 5) {
        list.push('dotfive.mp3')
      } else {
        list.push('dot.mp3')
        list.push(`${decimalValue}.mp3`)
      }
    }
    // console.log('playScore', score, list)
    this.need_notify_end = notifyEnd
    this.playSplicingSound(list)
  }

  clearSoundList() {
    this.sound_list.forEach(e => {
      if (e.sound) {
        e.sound.destroy()
      }
      this.sound_list = []
      this.play_type = 0 // 0: 单独音效 1: 拼接音效
      this.splicing_list = [] // 拼接音效列表
      this.splicing_index = 0
      this.loop_src = null
    })
  }
}

export default SoundHandler