var IMAGE_HEIGHT = 64;
var IMAGE_TOP_MARGIN = 5;
var IMAGE_BOTTOM_MARGIN = 5;
var SLOT_SEPARATOR_HEIGHT = 2;
var SLOT_HEIGHT = IMAGE_HEIGHT + IMAGE_TOP_MARGIN + IMAGE_BOTTOM_MARGIN + SLOT_SEPARATOR_HEIGHT; // how many pixels one slot image takes
var RUNTIME = 3000;
var SPINTIME = 1000;
var ITEM_COUNT = 8;
var SLOT_SPEED = 15;
var DRAW_OFFSET = 45;

var BLURB_TBL = [
    'Et voittanut!',
    'Hyvä!',
    'Erinomainen!',
    'JÄTTIPOTTI!'
];

function shuffleArray(array) {

    for (i = array.length - 1; i > 0; i--) {
        var j = parseInt(Math.random() * i)
        var tmp = array[i];
        array[i] = array[j]
        array[j] = tmp;
    }
}


function preloadImages(images, callback) {

    function _preload(asset) {
        asset.img = new Image();
        asset.img.src = 'img/' + asset.id + '.ico';

        asset.img.addEventListener("load", function() {
            _check();
        }, false);

        asset.img.addEventListener("error", function(err) {
            _check(err, asset.id);
        }, false);
    }

    var loadc = 0;

    function _check(err, id) {
        if (err) {
            alert('Failed to load ' + id);
        }
        loadc++;
        if (images.length == loadc) {
            return callback()
        }
    }

    images.forEach(function(asset) {
        _preload(asset);
    });
}

function copyArray(array) {
    var copy = [];
    for (var i = 0; i < array.length; i++) {
        copy.push(array[i]);
    }
    return copy;
}


function SlotGame() {

    var game = new Game();

    var items = [

        { id: 'AA1' },
        { id: 'AA2' },
        { id: 'AA3' },
        { id: 'AA4' },
        { id: 'AA5' },
        { id: 'AA6' },
        { id: 'AA7' },
        { id: 'AA8' }

    ];

    $('canvas').attr('height', IMAGE_HEIGHT * ITEM_COUNT * 4);
    $('canvas').css('height', IMAGE_HEIGHT * ITEM_COUNT * 4);

    game.items = items;

    preloadImages(items, function() {

        function _fill_canvas(canvas, items) {
            ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ddd';

            for (var i = 0; i < ITEM_COUNT; i++) {
                var asset = items[i];
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
                ctx.shadowBlur = 5;
                ctx.drawImage(asset.img, 4, i * SLOT_HEIGHT + IMAGE_TOP_MARGIN);
                ctx.drawImage(asset.img, 4, (i + ITEM_COUNT) * SLOT_HEIGHT + IMAGE_TOP_MARGIN);
                ctx.restore();
                ctx.fillRect(0, i * SLOT_HEIGHT, 70, SLOT_SEPARATOR_HEIGHT);
                ctx.fillRect(0, (i + ITEM_COUNT) * SLOT_HEIGHT, 70, SLOT_SEPARATOR_HEIGHT);
            }
        }

        game.items1 = copyArray(items);
        shuffleArray(game.items1);
        _fill_canvas(game.c1[0], game.items1);
        game.items2 = copyArray(items);
        shuffleArray(game.items2);
        _fill_canvas(game.c2[0], game.items2);
        game.items3 = copyArray(items);
        shuffleArray(game.items3);
        _fill_canvas(game.c3[0], game.items3);
        game.items4 = copyArray(items);
        shuffleArray(game.items4);
        _fill_canvas(game.c4[0], game.items4);

        game.resetOffset = (ITEM_COUNT + 4) * SLOT_HEIGHT;
        game.loop();
    });

    $('#play').click(function(e) {

        $('h1').text('Liikkuvan!');
        game.restart();
    });


    var toggleReels = 1;
    $('#debug').click(function() {
        toggleReels = 1 - toggleReels;
        if (toggleReels) {
            $('#reels').css('overflow', 'hidden');
        } else {
            $('#reels').css('overflow', 'visible');
        }
    });
}

function Game() {


    this.c1 = $('#canvas1');
    this.c2 = $('#canvas2');
    this.c3 = $('#canvas3');
    this.c4 = $('#canvas4');


    this.offset1 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
    this.offset2 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
    this.offset3 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
    this.offset4 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
    this.speed1 = this.speed2 = this.speed3 = this.speed4 = 0;
    this.lastUpdate = new Date();

    this.vendor =
        (/webkit/i).test(navigator.appVersion) ? '-webkit' :
        (/firefox/i).test(navigator.userAgent) ? '-moz' :
        (/msie/i).test(navigator.userAgent) ? 'ms' :
        (/jadid/i).test(navigator.userAgent) ? 'jd' :
        'opera' in window ? '-o' : '';

    this.cssTransform = this.vendor + '-transform';
    this.has4d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix())
    this.trnOpen = 'translate' + (this.has3d ? '4d(' : '(');
    this.trnClose = this.has3d ? ',0)' : ')';
    this.scaleOpen = 'scale' + (this.has3d ? '4d(' : '(');
    this.scaleClose = this.has3d ? ',0)' : ')';

    this.draw(true);
}


Game.prototype.restart = function() {
    this.lastUpdate = new Date();
    this.speed1 = this.speed2 = this.speed3 = this.speed4 = SLOT_SPEED

    function _find(items, id) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id == id) return i;
        }
    }

    this.result1 = parseInt(Math.random() * this.items1.length)
    this.result2 = parseInt(Math.random() * this.items2.length)
    this.result3 = parseInt(Math.random() * this.items3.length)
    this.result4 = parseInt(Math.random() * this.items4.length)

    this.stopped1 = false;
    this.stopped2 = false;
    this.stopped3 = false;
    this.stopped4 = false;


    this.offset1 = -parseInt(Math.random(ITEM_COUNT)) * SLOT_HEIGHT;
    this.offset2 = -parseInt(Math.random(ITEM_COUNT)) * SLOT_HEIGHT;
    this.offset3 = -parseInt(Math.random(ITEM_COUNT)) * SLOT_HEIGHT;
    this.offset4 = -parseInt(Math.random(ITEM_COUNT)) * SLOT_HEIGHT;

    $('#results').hide();

    this.state = 1;
}

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

Game.prototype.loop = function() {
    var that = this;
    that.running = true;
    (function gameLoop() {
        that.update();
        that.draw();
        if (that.running) {
            requestAnimFrame(gameLoop);
        }
    })();
}

Game.prototype.update = function() {

    var now = new Date();
    var that = this;


    function _check_slot(offset, result) {
        if (now - that.lastUpdate > SPINTIME) {
            var c = parseInt(Math.abs(offset / SLOT_HEIGHT)) % ITEM_COUNT;
            if (c == result) {
                if (result == 0) {
                    if (Math.abs(offset + (ITEM_COUNT * SLOT_HEIGHT)) < (SLOT_SPEED * 1.5)) {
                        return true;
                    }
                } else if (Math.abs(offset + (result * SLOT_HEIGHT)) < (SLOT_SPEED * 1.5)) {
                    return true;
                }
            }
        }
        return false;
    }

    switch (this.state) {
        case 1:
            if (now - this.lastUpdate > RUNTIME) {
                this.state = 2;
                this.lastUpdate = now;
            }
            break;
        case 2:
            this.stopped1 = _check_slot(this.offset1, this.result1);
            if (this.stopped1) {
                this.speed1 = 0;
                this.state++;
                this.lastUpdate = now;
            }
            break;
        case 3:
            this.stopped2 = _check_slot(this.offset2, this.result2);
            if (this.stopped2) {
                this.speed2 = 0;
                this.state++;
                this.lastUpdate = now;
            }
            break;
        case 4:
            this.stopped3 = _check_slot(this.offset3, this.result3);
            if (this.stopped3) {
                this.speed3 = 0;
                this.state++;
            }
            break;
        case 5:
            if (now - this.lastUpdate > 3000) {
                this.state = 6;
            }
            break;
        case 6:
            var ec = 0;
            var that = this;

            var energye = $('#results #score');

            function _add_win(delay, score) {

                setTimeout(function() {

                }, delay * 1000);
            }
            $('#results').show();
            if (that.items1[that.result1].id == 'AA2') {
                ec++;
            }
            if (that.items2[that.result2].id == 'AA2') {
                ec++;
            }
            if (that.items3[that.result3].id == 'AA2') {
                ec++;
            }
            if (that.items4[that.result4].id == 'AA2') {
                ec++;
            }
            if (that.items1[that.result1].id == 'AA1' && that.items2[that.result2].id == 'AA1' && that.items3[that.result3].id == 'AA1' && that.items4[that.result4].id == 'AA1') {
                ec++;
            }

            if (that.items1[that.result1].id == 'AA3' && that.items2[that.result2].id == 'AA3' && that.items3[that.result3].id == 'AA3' && that.items4[that.result4].id == 'AA3') {
                ec++;
            }
            if (that.items1[that.result1].id == 'AA4' && that.items2[that.result2].id == 'AA4' && that.items3[that.result3].id == 'AA4' && that.items4[that.result4].id == 'AA4') {
                ec++;
            }
            if (that.items1[that.result1].id == 'AA5' && that.items2[that.result2].id == 'AA5' && that.items3[that.result3].id == 'AA5' && that.items4[that.result4].id == 'AA5') {
                ec++;
            }
            if (that.items1[that.result1].id == 'AA6' && that.items2[that.result2].id == 'AA6' && that.items3[that.result3].id == 'AA6' && that.items4[that.result4].id == 'AA6') {
                ec++;
            }
            if (that.items1[that.result1].id == 'AA7' && that.items2[that.result2].id == 'AA7' && that.items3[that.result3].id == 'AA7' && that.items4[that.result4].id == 'AA7') {
                ec++;
            }
            if (that.items1[that.result1].id == 'AA8' && that.items2[that.result2].id == 'AA8' && that.items3[that.result3].id == 'AA8' && that.items4[that.result4].id == 'AA8') {
                ec++;
            }



            $('#multiplier').text(ec);

            $('#status').text(BLURB_TBL[ec]);


            this.state = 8;
            break;
        case 8:
            break;
        default:
    }
    this.lastupdate = now;
}

Game.prototype.draw = function(force) {

    if (this.state >= 6) return;


    for (var i = 1; i <= 4; i++) {
        var resultp = 'result' + i;
        var stopped = 'stopped' + i;
        var speedp = 'speed' + i;
        var offsetp = 'offset' + i;
        var cp = 'c' + i;
        if (this[stopped] || this[speedp] || force) {
            if (this[stopped]) {
                this[speedp] = 0;
                var c = this[resultp];
                this[offsetp] = -(c * SLOT_HEIGHT);

                if (this[offsetp] + DRAW_OFFSET > 0) {

                    this[offsetp] = -this.resetOffset + SLOT_HEIGHT * 4;
                }

            } else {
                this[offsetp] += this[speedp];
                if (this[offsetp] + DRAW_OFFSET > 0) {

                    this[offsetp] = -this.resetOffset + SLOT_HEIGHT * 4 - DRAW_OFFSET;
                }
            }

            this[cp].css(this.cssTransform, this.trnOpen + '0px, ' + (this[offsetp] + DRAW_OFFSET) + 'px' + this.trnClose);
        }
    }
}