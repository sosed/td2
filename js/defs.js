Game.defs = {};

///////////////////////////////////////////////
// Towers
///////////////////////////////////////////////

var color = {
    selected: "rgba(100,150,185,0.5)",
    red: "rgba(255,0,0,0.3)",
    freez: "rgba(0,255,252,0.5)"
};

var Tower = function(options) {
    var tower = {};

    tower.id = Game.towers.length;

    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            tower[key] = options[key];
        }
    }
    tower.x = Game.cell.width * options.gx;
    tower.y = Game.cell.width * options.gy;
    tower.isSelected = false;
    tower.tick = 1;
    tower.activated = true;
    tower.level = 0;
    tower.price = 0;
    tower.sprite = new Sprite(tower.source.url, new Pos(tower.source.pos), [Game.cell.width, Game.cell.width]);
    tower.levelText = new UIText(tower.level + 1, tower.x + Game.cell.width - 12, tower.y + 12, 12);

    function setParameters() {
        tower.damage = tower.levels[tower.level].damage;
        tower.rate = tower.levels[tower.level].rate;
        tower.cost = tower.levels[tower.level].cost;
        tower.range = tower.levels[tower.level].range * Game.cell.width;
        tower.price = ~~ (tower.cost / 2);
    }

    setParameters();

    tower.update = function() {
        tower.tick += Game.delta;
        tower.sprite.update(Game.delta);
        if (tower.tick < tower.rate) {
            return;
        }
        tower.tick = 0;
        var targetCreep = Game.creeps.find(function(creep) {
            return creep && distance(tower.x, tower.y, creep.x, creep.y) < tower.range;
        });
        if (!!targetCreep) {
            tower.angle = getAngle(tower, targetCreep);
            tower.atack(tower, targetCreep);
        }
    };
    tower.draw = function() {
        if(tower.isSelected) {
            drawCircle(tower.x + Game.cell.width / 2, tower.y + Game.cell.width / 2, tower.range, color.selected);
        }
        //drawCircle(tower.x, tower.y, 10, tower.color);
        Game.renderEntity(tower);
        tower.levelText.draw();
    };
    tower.upgrate = function() {
        if(tower.level - 1 < tower.levels.length) {
            if(Game.cash - tower.levels[tower.level + 1].cost >= 0) {
                tower.level ++;
                setParameters();
                Game.cash -= tower.cost;
                tower.levelText.text = tower.level + 1;
            } else {
                Game.ui.alert("Не хватает золота");
            }
            if(tower.level >= tower.levels.length - 1) {
                tower.levelText.color = '#f3da03';
                tower.levelText.size += 2;
            }
        }
    };
    tower.sell = function() {
        tower.activated = false;
        Game.cash += tower.price;
        Game.world.map[options.gx][options.gy] = 0;
        Game.mouse.selection.selected = false;
    };
    return tower;
};

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


    };
    return bullet;
};

var Bomb = function(tower, creep) {
    var bomb = {};
    bomb.x = tower.x + Game.cell.width / 2;
    bomb.y = tower.y + Game.cell.width/2;
    bomb.cx = creep.x;
    bomb.cy = creep.y;
    bomb.target = {
        x: creep.x,
        y: creep.y
    };

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
            bomb.x = bomb.path[i].x;
            bomb.y = bomb.path[i].y;
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
    };
    return bomb;
};


Game.defs =  {};

Game.defs.gun = {
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
        {cost:100, damage:135, range: 2.1, rate:1},
        {cost:155, damage:379, range: 2.1, rate:1},
        {cost:240, damage:809, range: 2.3, rate:1},
        {cost:370, damage:1159, range: 2.5, rate:1},
        {cost:570, damage:2856, range: 2.9, rate:1},
        {cost:900, damage:5090, range: 2.9, rate:1},
        {cost:1390, damage:8912, range: 2.9, rate:1},
        {cost:2150, damage:15450, range: 2.9, rate:1},
        {cost:3340, damage:26650, range: 2.9, rate:1},
        {cost:5170, damage:45750, range: 2.9, rate:1},
        {cost:8000, damage:78350, range: 2.9, rate:1},
        {cost:12406, damage:133970, range: 2.9, rate:1}
    ],
    atack: function(tower, creep) {
        Game.bullets.push(new Bullet(tower, creep));
    }
};

Game.defs.mortal = {
    gx: 50, gy: 0,
    color: "#005CFF",
    name: 'Мортира',
    source: {
        url: 'img/sprite64.png',
        pos: [0, 0]
    },
    bullet: {
        r: 5,
        color: "#333",
        speed: 4
    },
    levels: [
        {cost:600, damage:1134, range: 3.5, rate:3},
        {cost:1440, damage:3181, range: 3.7, rate:3},
        {cost:2240, damage:6790, range: 4, rate:3},
        {cost:3460, damage:13090, range: 4.2, rate:3},
        {cost:5367, damage:23988, range: 4.2, rate:3},
        {cost:8320, damage:42727, range: 4.2, rate:3},
        {cost:12890, damage:74858, range: 4.1, rate:3}
    ],
    atack: function(tower, creep) {
        Game.bombs.push(new Bomb(tower, creep));
    }
};


Game.defs.freez = {
    gx: 50, gy: 0,
    color: "#005CFF",
    name: 'Заморзка',
    source: {
        url: 'img/sprite64.png',
        pos: [0, 0]
    },
    bullet: {
        r: 5,
        color: "#333",
        speed: 0.5
    },
    levels: [
        {cost: 100, damage: 0, range: 2.5, rate: 0.1},
        {cost: 220, damage: 0, range: 2.7, rate: 0.1},
        {cost: 350, damage: 0, range: 3, rate: 0.1}
    ],
    atack: function(tower, creep) {
        drawCircle(tower.x + Game.cell.width / 2, tower.y + Game.cell.width / 2, tower.range, color.freez);

        Game.creeps.forEach(function(cr) {
            cr.isFrozen = ccColliding({x: tower.x, y: tower.y, r: tower.range}, cr);
        });
    }
};

Game.defs.laser = {
    gx: 50, gy: 0,
    color: "rgb(255, 252, 0, .2)",
    name: 'Лазер',
    source: {
        url: 'img/sprite64.png',
        pos: [0, 192]
    },
    levels: [
        {cost:600,damage:6,range: 2.2, rate: .01},
        {cost:340,damage:17,range: 2.45, rate:.01},
        {cost:530,damage:36,range: 2.6, rate:.01},
        {cost:820,damage:69,range: 2.6, rate:.01},
        {cost:1270,damage:127,range: 2.6, rate:.01},
        {cost:1970,damage:226,range: 2.6, rate:.01},
        {cost:3050,damage:396,range: 2.6, rate:.01},
        {cost:4730,damage:687,range: 2.6, rate:.01},
        {cost:7330,damage:1184,range: 2.6, rate:.01},
        {cost:11360,damage:2033,range: 2.6, rate:.01}
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