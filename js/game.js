Game.init = function() {

    Game.currentState = 'play';

    Game.ui = new UI();
    Game.world = new World();
    Game.default();
    Game.ui.init();

    Game.loop();

};

Game.default = function() {
    Game.wave = 0;
    Game.cash = 1000;
    Game.live = 100;
}

Game.nextWave = function () {
    Game.wave ++;
    Game.monsters.creep.y = Game.world.route[0].y;
    Game.monsters.creep.x = Game.world.route[0].x;

    var option = generateLelev(Game.wave);
    Game.monsters.creep.hp = option.hp;
    Game.monsters.creep.cost = option.cost;
    Game.monsters.creep.speed = option.speed;

    for(var i = 0; i < option.amound; i++) {
        Game.monsters.creep.x -= randomInt(Game.cell.width / 3, Game.cell.width);
        Game.creeps.push(new Creep(Game.monsters.creep));
    }
}

Game.state = [];

Game.state['play'] = {
    update: function() {

        Game.ui.update();

        this.updateActor(Game.towers);
        this.updateActor(Game.creeps);

        for(var i=0; i<Game.explosions.length; i++) {
            Game.explosions[i].sprite.update(Game.delta);

            // Remove if animation is done
            if(Game.explosions[i].sprite.done) {
                Game.explosions.splice(i, 1);
                i--;
            }
        }

        this.updateActor(Game.bullets);
        this.updateActor(Game.bombs);

        renderEntities(Game.explosions);

    },

    draw: function() {
        //Game.room.map.draw(Game.camera.x, Game.camera.y);
        //this.spriteRender(Game.player);
        //Game.player.draw(0, 0);
        Game.world.draw();
        this.drawActor(Game.towers);
        this.drawActor(Game.creeps);
        Game.world.drawTMP();
        Game.ui.draw();
    },

    updateActor: function(actor) {
        actor.forEach(function(item, i, a) {
            if(!item.activated) {
                delete a[i];
            } else {
                item.update();
            }
        });
    },

    drawActor: function(actor) {
        actor.forEach(function(item, i, a) {
            item.draw();
        });
    },

};

Game.renderEntity = function (entity, angle, scale) {
    Game.ctx.save();
    Game.ctx.translate(entity.x, entity.y);
    if(angle) {
        Game.ctx.rotate(angle);
    }
    if(scale) {
        Game.ctx.scale(scale[0], scale[1]);
    }

    entity.sprite.render(Game.ctx);
    Game.ctx.restore();
}

function renderEntities(list) {
    for(var i=0; i<list.length; i++) {
        Game.renderEntity(list[i]);
    }
}

Game.loop = function(timestamp) {
    Game.ctx.clearRect(0, 0, Game.width, Game.height);
    Game.ctx.fillStyle = '#b7cd48';
    Game.ctx.fillRect(0, 0, Game.width, Game.height);

    Game.state[Game.currentState].draw();

    Game.state[Game.currentState].update();

    var now = Date.now();
    Game.delta = (now - Game.last) / 1000.0;

    Game.last = now;

    requestAnimationFrame(Game.loop);

};

window.addEventListener('load', function() {

    resources.load([
        'img/sprite40.png',
        'img/sprite64.png',
        'img/bg.png',
    ]);
    resources.onReady(Game.init);

});