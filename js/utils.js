function generateLelev(wave) {
    var amound = 40;

    var hp = ~~(30 + (wave - 1) * (20 * Math.pow(1.06, wave - 4)));

    if (wave >= 100) {
        hp = hp * Math.pow(1.05, wave - 100);
    }
    if (wave >= 200) {
        hp = hp * Math.pow(1.1, wave - 200);
    }
    if (wave >= 300) {
        hp = hp * Math.pow(1.2, wave - 300);
    }
    if (wave >= 400) {
        hp = hp * Math.pow(1.5, wave - 400);
    }

    var level = [];
    level[0] = [2, amound/8, 30];
    level[1] = [2, 10, 45];
    level[2] = [2, 40 / 2, 56];
    level[3] = [2, amound,     hp];
    level[4] = [4, amound,     hp / 2];
    level[5] = [2, amound / 2, hp * 3];
    level[6] = [2, amound / 10,hp * 10];
    level[7] = [2, 3,          hp * 10];
    level[8] = [8, amound * 3, hp / 2];
    level[9] = [2, amound,     hp];
    level[10] = [2, 1,          hp * 20];
    level[11] = [12, amound * 3, hp / 3];
    level[12] = [1, amound,    hp * 2];


    var reward = 700 + 100 * (wave - 3);
    var levelId = (wave - 4) % 10;
    if(wave < 4) {
        levelId = wave - 1;
        reward = 500 + 100 * wave - 1;
    }

    return {
        speed: level[levelId][0],
        amound: level[levelId][1],
        hp: level[levelId][2],
        cost: ~~ (reward / level[levelId][1])
    }
}
//x, y - position in grid
function drawCircleGrid(x, y, color, r) {
    r = r || 10;
    drawCircle(Game.cell.width * x + Game.cell.width / 2, Game.cell.width * y + Game.cell.width / 2, r,  color);
}

function drawCircle(x, y, r, color) {
    Game.ctx.beginPath();
    Game.ctx.arc(x, y, r, 0, 2*Math.PI, true);
    Game.ctx.fillStyle = color;
    Game.ctx.fill();
    Game.ctx.closePath();
}

function drawRect(x, y, w, color) {
    Game.ctx.fillStyle = color;
    Game.ctx.strokeStyle = "#ccc";
    Game.ctx.fillRect(x * w, y * w, w, w);
    Game.ctx.strokeRect(x * w, y * w, w, w);

}

function getAngle(pos1, pos2) {
    return Math.atan2(pos2.x - pos1.x, -(pos2.y - pos1.y));
}

function getPositionNumberFromArray(m, n) {
    for(var i = 0; i < m.length; i++)
        for(var k = 0; k < m[0].length; k++)
            if(m[i][k] == n) {
                return {x: i, y: k};
            }
    return -1;
}

function getRoute(map, begin, end) {
    var dx = [1, 0, -1, 0],
        dy = [0, 1, 0, -1],
        cx = begin.x, //current x
        cy = begin.y, //current y
        point = [],
        b = true;
    point.push({x: gridToPixel(begin.x), y: gridToPixel(begin.y)});
    while (b) {
        for(var i = 0; i < dx.length; i ++) {
            if(cx + dx[i] < 0 || cx + dx[i] > map.length || cy + dy[i] < 0 || cy + dy[i] > map[0].length)
                continue;
            if(map[cx + dx[i]][cy + dy[i]] == 3) {
                b = false;
                point.push({x: gridToPixel(end.x + 2), y: gridToPixel(end.y)});
                return point;
            }
            if(map[cx + dx[i]][cy + dy[i]] == 1) {
                cx += dx[i];
                cy += dy[i];
                map[cx][cy] = -1;
                point.push({
                    x: gridToPixel(cx),
                    y: gridToPixel(cy),
                });
                i--;
            }
        }

    }

    return point;
};

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function gridToPixel(n) {
    return n*Game.cell.width;
}

function getCellCoord(x, y) {
    return {
        gx: ~~( x / (Game.cell.width)),
        gy: ~~( y/ (Game.cell.width))
    }
}

function move(begin, end, speed) {
    var distx = end.x - begin.x;
    var disty = end.y - begin.y;
    var angle = Math.atan2(disty, distx);

    begin.x += speed * Math.cos(angle);
    begin.y += speed * Math.sin(angle);

    return (distx < 0 ? -distx : distx) + (disty < 0 ? -disty : disty) < Game.cell.width / randomInt(1,3);
};

function moveTo(begin, end, speed) {
    var distx = end.x - begin.x;
    var disty = end.y - begin.y;
    var angle = Math.atan2(disty, distx);

    return {x: speed * Math.cos(angle), y: speed * Math.sin(angle)}
}

function intersects(obj, mouse) {
    var t = 1; //tolerance

    var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) < obj.x + obj.width,
        yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) < obj.y + obj.height;
    return  xIntersect && yIntersect;
};

function getCurvePath(begin, end) {
    var xd = 0,
        xy = -200;
    var p0 = {x: begin.x, y: begin.y},
        p2 = {x: end.x, y: end.y},
        p1 = {x: xd + (p0.x + p2.x) * 0.5, y: xy + (p0.y + p2.y) * 0.5},
        x, y,
        t = 0,
        path = [];
    for (; t <= 1; t += 0.01) {

        x = (1 - t)*(1 - t)*p0.x + 2*t*(1 - t)*p1.x + t*t*p2.x;
        y = (1 - t)*(1 - t)*p0.y + 2*t*(1 - t)*p1.y + t*t*p2.y;
        path.push({x: x, y: y});

    }

    return path;
}

function angleCalc(sx, sy, tx, ty) {
    return Math.atan2(ty - sy, tx - sx);
};

var Pos = function(p) {
    var pos = [p[0], p[1]];
    return pos;
}
function randomInt( min, max ) {
    return Math.round(min + ( Math.random() * ( max - min ) ));
}

function getArrayFrames(total) {
    var m = [];
    var start = randomInt(0, 8);
    for(var i = start; i < total + start; i++) {
        m.push(i % total);
    }
    return m;
}

function distance(ax, ay, bx, by) {
    return Math.sqrt(Math.pow( ax - bx, 2) + Math.pow( ay - by, 2));
}
function distanceObj(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function collisionRect(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y)
}

function RectsColliding(r1, r2) {
    return !(r1.x > r2.x + r2.w || r1.x + r1.w < r2.x || r1.y > r2.y + r2.h || r1.y + r1.h < r2.y);
}

function ccColliding(c1, c2) {
    return distanceObj(c1, c2) <= c1.r + c2.r;
}
function RectCircleColliding(rect,circle){
    var dx=Math.abs(circle.x-(rect.x+rect.w/2));
    var dy=Math.abs(circle.y-(rect.y+rect.y/2));

    if( dx > circle.r+rect.w2 ){ return(false); }
    if( dy > circle.r+rect.h2 ){ return(false); }

    if( dx <= rect.w ){ return(true); }
    if( dy <= rect.h ){ return(true); }

    var dx=dx-rect.w;
    var dy=dy-rect.h
    return(dx*dx+dy*dy<=circle.r*circle.r);
}