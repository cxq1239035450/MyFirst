var music = document.getElementById('music');
var musictext = document.getElementById('musictext');
var text = ['还要再失去什么', '才能让心得到宽恕?', '才能让心得到宽恕?', '才能与你再次相见', 'One more time']
function play() {
    if (music.paused) {
        music.play();

    }
}
play();
