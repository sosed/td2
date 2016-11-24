Game.defs = {};

///////////////////////////////////////////////
// Towers
///////////////////////////////////////////////

var color = {
    selected: "rgba(100,150,185,0.5)",
    red: "rgba(255,0,0,0.3)"
}

var Tower = function(options) {
    var tower = {};

    tower.id = Game.towers.length;

    for (var key in options) {
        tower[key] = options[key];
    }
    tower.x = Game.cell.width * options.gx;
    tower.y = Game.cell.width * options.gy;
    tower.isSelected = false;
    tower.tick = 1;
    tower.activated = true;
    tower.level = 0;
    tower.price = 0;
    tower.sprite = new Sprite(tower.source.url, new Pos(tower.source.pos), [Game.cell.width, Game.cell.width]);

    function setParameters() {
        tower.damage = tower.levels[tower.level].damage;
        tower.rate = tower.levels[tower.level].rate;
        tower.cost = tower.levels[tower.level].cost;
        tower.range = tower.levels[tower.level].range * Game.cell.width;
        tower.price = ~~ (tower.cost / 2);
    }

    setParameters();

    tower.update = function() {
        tower.tick ++;
        tower.sprite.update(Game.delta);
        Game.creeps.forEach(function(creep) {
            if(distance(tower.x, tower.y, creep.x, creep.y) < tower.range){
                if(tower.tick > tower.rate) {
                    tower.angle = getAngle(tower, creep);
                    tower.atack(tower, creep);
                    tower.tick = 1;
                }
            }
        });
    }
    tower.draw = function() {
        if(tower.isSelected) {
            drawCircle(tower.x + Game.cell.width / 2, tower.y + Game.cell.width / 2, tower.range, color.selected);
        }
        //drawCircle(tower.x, tower.y, 10, tower.color);
        Game.renderEntity(tower);
    }
    tower.upgrate = function() {
        if(tower.level - 1 < tower.levels.length) {
            if(tower.cost < Game.cash) {
                tower.level ++;
                setParameters();
                Game.cash -= tower.cost;
            } else {
                Game.ui.alert("Не хватает золота");
            }
        }
    }
    tower.sell = function() {
        tower.activated = false;
        Game.cash += tower.price;
        Game.world.map[options.gx][options.gy] = 0;
        Game.mouse.selection.selected = false;
    }
    return tower;
}

var Bullet = function(tower, creep) {
    var bullet = {};
    bullet.x = tower.x + Game.cell.width/2;
    bullet.y = tower.y + 10;
    bullet.r = tower.bullet.r;
    bullet.activated = true;
    bullet.sprite = new Sprite("img/sprite64.png", [0, 384], [7, 21]);

    bullet.update = function() {
        if(!bullet.activated)
            return;

        if(move(bullet, creep.center, tower.bullet.speed)) {
            bullet.activated = false;
            creep.hp -= tower.damage;
            if(!creep.hp) {
                creep.activated = false;
                Game.cash += creep.cost;
            }
        } else {
            bullet.angle = getAngle(bullet, creep.center);
            Game.renderEntity(bullet, bullet.angle);
        }

        if(bullet.x < 0 || bullet.x > Game.width || bullet.y < 0 || bullet.y > Game.height) {
            bullet.activated = false;
        }


    }
    return bullet;
}

var Bomb = function(tower, creep) {
    var bomb = {};
    bomb.x = tower.x + Game.cell.width / 2;
    bomb.y = tower.y + Game.cell.width/2;
    bomb.cx = creep.x;
    bomb.cy = creep.y;
    bomb.target = {
        x: creep.x,
        y: creep.y
    }

    bomb.r = tower.bullet.r;
    bomb.activated = true;
    bomb.rangeExpl = 0.8 * Game.cell.width;
    bomb.path = getCurvePath(bomb, {x:creep.center.x,y:creep.center.y});
    bomb._index = 0;
    bomb.update = function() {

        bomb._index += tower.bullet.speed*Game.delta * 30;

        var i = Math.floor(bomb._index) % bomb.path.length;

        if(!bomb.activated)
            return;

        if (i < bomb.path.length - 3) {
            bomb.x = bomb.path[i].x, bomb.y = bomb.path[i].y;
        } else {
            bomb.activated = false;
            bomb.path = [];
            Game.explosions.push({
                x: bomb.target.x, y: bomb.target.y,
                sprite: new Sprite('img/sprite64.png',
                    [64, 320],
                    [64, 64],
                    16,
                    [0, 1, 2, 3, 4, 5],
                    null,
                    true)
            });

            Game.creeps.forEach(function(cr) {
                if(ccColliding({x: bomb.target.x, y: bomb.target.y, r: bomb.rangeExpl}, cr)) {

                    cr.hp -= tower.damage;
                    if(!cr.hp) {
                        cr.activated = false;
                        Game.cash += cr.cost;
                    }
                }
            });
        }

        if(bomb.x < 0 || bomb.x > Game.width || bomb.y < 0 || bomb.y > Game.height) {
            bomb.activated = false;
        }
        drawCircle(bomb.x, bomb.y, tower.bullet.r, tower.bullet.color);
    }
    return bomb;
}

Game.defs.towers =  {};

Game.defs.towers.gun = {
    gx: 50, gy: 0,
    color: "#005CFF",
    name: 'Башня',
    source: {
        url: 'img/sprite64.png',
        pos: [0, 320]
    },
    bullet: {
        r: 3,
        color: "#ff7c00",
        speed: 6
    },
    levels: [
        {cost:100, damage:30, range: 2.1, rate:30},
        {cost:101, damage:350, range: 2.3, rate:28},
        {cost:102, damage:400, range: 2.5, rate:22},
        {cost:103, damage:460, range: 2.9, rate:22},
        {cost:104, damage:550, range: 2.9, rate:20},
    ],
    atack: function(tower, creep) {
        Game.bullets.push(new Bullet(tower, creep));
    }
};

Game.defs.towers.mortal = {
    gx: 50, gy: 0,
    color: "#005CFF",
    name: 'Мортира',
    source: {
        url: 'img/sprite64.png',
        pos: [0, 0],
    },
    bullet: {
        r: 5,
        color: "#333",
        speed: 4
    },
    levels: [
        {cost:100, damage:337, range: 3.5, rate:80},
        {cost:101, damage:350, range: 3.7, rate:70},
        {cost:102, damage:400, range: 4, rate:70},
        {cost:103, damage:460, range: 4.2, rate:80},
        {cost:104, damage:550, range: 4.2, rate:60},
    ],
    atack: function(tower, creep) {
        Game.bombs.push(new Bomb(tower, creep));
    }
};

Game.defs.towers.laser = {
    gx: 50, gy: 0,
    color: "rgb(255, 252, 0, .2)",
    name: 'Лазер',
    source: {
        url: 'img/sprite64.png',
        pos: [0, 192]
    },
    levels: [
        {cost:300,damage:1,range: 2.2, rate:1},
        {cost:100,damage:2,range: 2.45, rate:1},
        {cost:101,damage:3,range: 2.6, rate:1},
        {cost:102,damage:4,range: 2.6, rate:1},
        {cost:103,damage:5,range: 2.6, rate:1},
    ],
    atack: function(tower, creep) {
        Game.ctx.beginPath();
        Game.ctx.moveTo(tower.x + Game.cell.width/2, tower.y + 10);
        Game.ctx.lineTo(creep.center.x, creep.center.y);
        Game.ctx.lineWidth = 5; // толщина линии
        Game.ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"; // цвет линии

        Game.ctx.stroke();
        Game.ctx.beginPath();
        Game.ctx.lineWidth = 3; // толщина линии
        Game.ctx.moveTo(tower.x + Game.cell.width/2, tower.y + 10);
        Game.ctx.lineTo(creep.center.x, creep.center.y);
        Game.ctx.strokeStyle = "rgba(255, 58, 0, 0.6)"; // цвет линии

        Game.ctx.lineCap = "round";
        Game.ctx.stroke();
        creep.hp -= tower.damage;
        if(!creep.hp) {
            creep.activated = false;
            Game.cash += creep.cost;
        }
    }
};
/*
[
    {cost:200,damage:15,range:75,rate:30},
    {cost:250,damage:21,range:85,rate:28},
    {cost:313,damage:30,range:95,rate:26}
]
    [
    {cost:300,damage:15,range:65,rate:25},
    {cost:375,damage:21,range:69,rate:22},
    {cost:469,damage:30,range:72,rate:19}
    ]
    [
    {cost:250,damage:10,range:85,rate:30},
    {cost:313,damage:12,range:102,rate:28},
    {cost:391,damage:14,range:121,rate:26}]

    [
    {cost:250,damage:20,range:75,rate:35},
    {cost:313,damage:33,range:85,rate:33},
    {cost:391,damage:55,range:95,rate:32}
    ]
*/