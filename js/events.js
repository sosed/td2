Game.mouse = {
    x: 0,
    y: 0,
    angle: 0,
    down: false,
    clicked: false,
    drag: { active: false, tower: {} },
    isStart: false,
    selection: {
        selected: false,
        tower: {}
    }
};

Game.canvas.addEventListener('mousedown', function(e) {

    Game.mouse.isStart = true;
    Game.mouse.clicked = true;
    Game.mouse.down = true;
});

Game.canvas.addEventListener('mouseup',function(e)
{
    Game.mouse.down = false;
    Game.mouse.clicked = false;
    var cell = getCellCoord(Game.mouse.x, Game.mouse.y);
    removeFocus();
    if(Game.world.map[cell.gx][cell.gy] > 1000) {
        Game.mouse.selection.selected = true;
        Game.mouse.selection.tower = Game.towers[Game.world.map[cell.gx][cell.gy] - 1001];
        Game.mouse.selection.tower.isSelected = true;
    }

    if(Game.mouse.drag.active) {

        if(Game.world.map[cell.gx][cell.gy] == Game.world.terrain.common) {
            Game.mouse.drag.tower.gx = cell.gx;
            Game.mouse.drag.tower.gy = cell.gy;

            Game.towers.push(new Tower(Game.mouse.drag.tower));
            Game.world.map[cell.gx][cell.gy] = 1000 + Game.towers.length;
            Game.cash -= Game.towers[Game.towers.length - 1].cost;
            Game.mouse.drag.tower = {};
            Game.mouse.drag.active = false;
        }
    }

});

Game.canvas.addEventListener('mousemove',function(e) //Событие наведения мыши на canvas
{
    var rect = Game.canvas.getBoundingClientRect();
    Game.mouse.x = e.clientX - rect.left;
    Game.mouse.y = e.clientY - rect.top;

   // Game.mouse.clicked = (e.which == 1 && Game.mouse.down);
    //Game.mouse.down = (e.which == 1);
    if(Game.mouse.drag.active) {
        var cell = getCellCoord(Game.mouse.x, Game.mouse.y);
        Game.mouse.drag.tower.gx = cell.gx;
        Game.mouse.drag.tower.gy = cell.gy;
    }
});


function removeFocus() {
    if(Game.mouse.selection.selected) {
        if(!intersects(Game.ui.towerInfo, Game.mouse)) {
            Game.mouse.selection.selected = false;
            Game.mouse.selection.tower.isSelected = false;
            delete Game.mouse.selection.tower;
        }
    }
};

