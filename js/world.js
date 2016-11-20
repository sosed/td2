var World = function() {
    var world = {};

    world.map = [   [9,9,9,9,9,9,2,9,9,9],
                    [9,0,0,0,0,0,1,0,0,9],
                    [9,0,0,0,0,0,1,0,0,9],
                    [9,0,0,0,0,0,1,0,0,9],
                    [9,0,0,1,1,1,1,0,0,9],
                    [9,0,0,1,0,0,0,0,0,9],
                    [9,0,0,1,0,0,0,0,0,9],
                    [9,0,0,1,1,1,1,1,0,9],
                    [9,0,0,0,0,0,0,1,0,9],
                    [9,0,0,0,0,0,0,1,0,9],
                    [9,0,1,1,1,1,0,1,0,9],
                    [9,0,1,0,0,1,0,1,0,9],
                    [9,0,1,0,0,1,1,1,0,9],
                    [9,0,1,0,0,0,0,0,0,9],
                    [9,9,3,9,9,9,9,9,9,9] ];



    world.terrain = {
        begin: 2,
        end: 3,
        route: -1,
        common: 0,
        bg: {
            sprite: new Sprite('img/bg.png', [0, 0], [Game.width, Game.height]),
            x: 0, y: 0
        },
        platform: {
            x: 0, y: 0,
            sprite: new Sprite('img/sprite30.png', [0, 0], [30, 30])
        },
        road: {
            sprite: new Sprite('img/sprite64.png', [0, 256], [64, 64]),
            x: 0,
            y: 0
        }
    };

    world.getRoadSpritePos = function(x, y) {
        var dx = [[-1, 1], [0, 0], [-1, 0], [0, 1], [0, 1], [-1, 0]],
            dy = [[0, 0], [-1, 1], [0, 1], [1, 0], [-1, 0], [0, -1]];

        for(var i = 0; i < dx.length; i++) {
            var b = 0;
            for(var k = 0; k < 2; k++) {
                if(world.map[x + dx[i][k]][y + dy[i][k]] == world.terrain.route) {
                    b++;
                }
            }
            if(b > 1)
                return i;
        }

        return 0;
    };

    world.route = getRoute(
        world.map,
        getPositionNumberFromArray(world.map, 2),
        getPositionNumberFromArray(world.map, 3)
    );

    world.draw = function() {

        for(var i = 0; i < this.map.length; i++){
            for(var k = 0; k < this.map[0].length; k++){
                switch(this.map[i][k]){
                    //case world.terrain.common:
                    //
                    //    break;
                    case world.terrain.route:
                        world.terrain.road.sprite.pos[0] = world.getRoadSpritePos(i,k) * Game.cell.width;
                        break;
                    case world.terrain.begin:
                        world.terrain.road.sprite.pos[0] = 0;
                        break;
                    case world.terrain.end:
                        world.terrain.road.sprite.pos[0] = 0;
                        break;
                    default:
                        world.terrain.road.sprite.pos[0] = (6 + (i + k) % 2) * Game.cell.width;

                        break;
                }
                world.terrain.road.x = i * Game.cell.width;
                world.terrain.road.y = k * Game.cell.width;
                Game.renderEntity(world.terrain.road);
                if(this.map[i][k] > 1000) {
                    this.terrain.platform.x = i * Game.cell.width + Game.cell.width / 2;
                    this.terrain.platform.y = k * Game.cell.width + Game.cell.width / 2;
                    //Game.renderEntity(this.terrain.platform);
                }
            }
        }
        Game.renderEntity(world.terrain.bg);
    };

    world.drawTMP = function() {
        if(Game.mouse.drag.active) {
            var t = Game.mouse.drag.tower;
            var cell = getCellCoord(Game.mouse.x, Game.mouse.y);
            if(t.gx < Game.world.map.length && t.gy < Game.world.map[0].length)
            {
                if(Game.world.map[t.gx][t.gy] == Game.world.terrain.common) {
                    drawCircleGrid(cell.gx, cell.gy, color.selected, t.levels[0].range *  Game.cell.width);
                } else {
                    drawCircleGrid(cell.gx, cell.gy, color.red, t.levels[0].range *  Game.cell.width);
                }
            }
            var tmp = {
                sprite: new Sprite(Game.mouse.drag.tower.source.url, new Pos(Game.mouse.drag.tower.source.pos))
            };
            tmp.x = cell.gx * Game.cell.width;
            tmp.y = cell.gy * Game.cell.width;
            Game.renderEntity(tmp);
        }
    };



    return world;
};