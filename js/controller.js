var Game = (function() {

    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d');

    return {
        width: 960,
        height: 640,
        delta: 0,
        cell: { count: 64 * 16, width: 64},
        canvas: canvas,
        towers: [],
        creeps: [],
        bullets: [],
        bombs: [],
        explosions: [],
        ctx: ctx
    }

}());