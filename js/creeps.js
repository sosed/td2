//////////////////////////////////////////////////
// Creep
//////////////////////////////////////////////////

var Creep = function(options) {
    var creep = {};
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            creep[key] = options[key];
        }
    }

    creep.maxHp = creep.hp;
    creep.isFrozen = false;

    if (creep.skin == null) {
        creep.skin = Game.monsters.skins.skeleton;
    }

    creep.sprite = new Sprite(creep.skin.url, creep.skin.pos, creep.skin.size, creep.speed * 10,
        getArrayFrames(10), null, false);

    creep.dirVer = 1; //direction vertical
    creep.dirHor = 1; //direction horizontal
    creep.width = creep.sprite.size[0];

    creep.center = {
        x: 0, y: 0
    };
    creep.update = function(delta) {
        if(!creep.activated)
            return;
        creep.sprite.update(Game.delta);
        var speed = creep.isFrozen
            ? creep.speed / 2
            : creep.speed;

        if(move(creep, Game.world.route[creep.numPoint], speed)) {
            if(creep.numPoint  + 1 >= Game.world.route.length) {
                creep.activated = false;
                Game.live--;
                if (!Game.live) {
                    Game.end();
                }
                return;
            }
            creep.target = Game.world.route[creep.numPoint];
            creep.numPoint ++;
            creep.dirVer = Game.world.route[creep.numPoint].x < Game.world.route[creep.numPoint - 1].x ? -1 : 1;
            creep.dirHor = Game.world.route[creep.numPoint].y < Game.world.route[creep.numPoint - 1].y ? -1 : 1;

        }


        if(creep.hp < 1){
            creep.activated = false;
            Game.cash += creep.cost;
        }
    };

    creep.draw = function() {
        if(!creep.activated)
            return;
        //drawCircle(creep.x, creep.y, creep.r, creep.color);
        creep.center.y = creep.y + creep.sprite.size[1] / 2;
        creep.center.x = creep.x + creep.sprite.size[0] / 2;
        if(creep.dirVer < 0) {
            Game.renderEntity({x: creep.x + 32, y: creep.y, sprite: creep.sprite}, false, [creep.dirVer, 1]);
            //creep.center.x = creep.x - 32;
        } else {
            Game.renderEntity(creep, false, [creep.dirVer, 1]);
            //creep.center.x = creep.x;
        }

        if(creep.hp < creep.maxHp) {
            creep.drawHp();
        }


    };

    creep.drawHp = function(){
        var tmp_live = creep.width * creep.hp / creep.maxHp;
        if(tmp_live < 0)
            return;
        Game.ctx.fillStyle = "#f00";
        Game.ctx.strokeStyle = "#000";


        Game.ctx.strokeRect(creep.x, creep.y + creep.r, creep.width, 3);
        Game.ctx.fillRect(creep.x, creep.y + creep.r, tmp_live, 3);
    };

    return creep;
};

Game.monsters = {};

Game.monsters.skins = {
    skeleton: {
        url: 'img/sprite64.png',
        pos: [0, 64],
        size: [32, 64]
    },
    boss: {
        url: 'img/sprite64.png',
        pos: [0, 128],
        size: [32, 64]
    }
};

Game.monsters.creep = {
    x: 0, y: 0, vx: 0, vy: 0, gx: -10, gy: -10,
    skin: null,
    numPoint: 0,
    r: 10,
    speed: 1,
    cost: 20,
    hp: 14,
    color: '#f00',
    activated: true
};