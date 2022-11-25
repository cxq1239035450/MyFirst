const music = document.getElementById('music');
const musicImg = document.getElementById('musicImg')
const bar = document.getElementById('bar')
const musictext = document.getElementById('musictext');
const musicSwitch = document.getElementById('musicSwitch')
const musicBox = document.getElementById('musicBox')
const contentBox = document.getElementById('contentBox')
var text = [
    '每个人都很孤独，在人的一生中，遇到爱、遇到性都不稀罕，稀罕得到是遇到了解。',
    '不要做一边渴望，又一边拒绝的人，打开自己有些困难，但是没关系，我们可以慢慢来。',
    '时间或许像灯光，日照褪尽了才能看见，彼此靠近但是没有关联，一盏熄灭了，另一盏刚好亮了。',
    '当你下定决定做一件事，那就去尽力做，给自己一个期限，不用告诉所有人，也不要犹豫，直到你真的尽力为止。'
]
// 是否展开
let MUSIC_OPEN = false
// 播放状态
let MUSIC_STATIC = false
// 音乐长度
let MUSIC_DURATION = 0
// 随机文案
const randomNum = Math.floor(Math.random()*text.length)

musicImg.onclick = playMusic

music.load()
music.oncanplay = ()=>{
    setTimeout(() => {
        MUSIC_DURATION = music.duration
        
        //设置文本
        musictext.innerText = text[randomNum]
    }, 0);
}
let closeMusic = null
const close = ()=>{
    closeMusic = setTimeout(() => {
       contentBox.style.display="none"
       musicSwitch.style.display = 'block'
       musicBox.style.width = ''
       musicBox.style.right = '0'
    }, 5000);
}
musicSwitch.onclick = ()=>{
    contentBox.style.display="block"
    musicSwitch.style.display = 'none'
    musicBox.style.width = '160px'
    musicBox.style.right = '10px'
        close()
}

let num = 0
//
function rollText(item){

    const p = item /10 -num
    const textWidth = (musictext.offsetWidth + 180) *p + num*100
    const time = Math.abs(textWidth / 60)
    const textLeft = Math.abs(musictext.style.left.slice(0,musictext.style.left.length-2))
    if(p>1){
        num += p
        musictext.style.transition = ''
        musictext.style.left =  `200px`
    } else{
        musictext.style.transition = `all ${time}s linear`
        // musictext.style.transform = `translateX(-${textWidth + 10}px)`
        musictext.style.left =  `-${textWidth}px`
    }

}
// function changeTime(time){
//     const M = Math.trunc((time % (0 * 60)) / 60)
//     const s = Math.trunc(time % 60)
//     return M + ':' + s
// }

function playMusic(){
    if(closeMusic){
        clearTimeout(closeMusic)
        close()
    }
    if(MUSIC_STATIC){
        musicImg.src = './icon/play.png'
        music.pause()
    } else {
        musicImg.src = './icon/stop.png'
        music.play()
    }
    MUSIC_STATIC = !MUSIC_STATIC
}


function changeProgress(){
    let newProgress =  this.currentTime
    const acounted = newProgress / MUSIC_DURATION *100
    bar.style.width = acounted +'%'

    
    if(newProgress){
        rollText(acounted)
    }
}
music.addEventListener('timeupdate',changeProgress)