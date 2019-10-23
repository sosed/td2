class BaseTower {

    constructor({id, x, y, balance}) {
        this.tick = 0;
        this.id = id;
        this.x = x;
        this.y = y;
        this.level = 1;
        this.balance = balance;
        this.target = null;
    }

    update(delta) {
        this.tick += delta;
        if (this.tick > this.balance.rate) {
            this.tick = 0;
            this.shoot();
        }
    }

    shoot() {
        if (!this.target) {
            return;
        }
        // TODO create new Bullet
    }

    render(ctx) {

    }

    findTarget(creeps) {
        this.target = creeps.find((creep) => {
            return creep && distance(x, y, creep.x, creep.y) < this.balance.range;
        });
    }

}

// TODO move to utils
function distance(ax, ay, bx, by) {
    return Math.sqrt(Math.pow( ax - bx, 2) + Math.pow( ay - by, 2));
}
