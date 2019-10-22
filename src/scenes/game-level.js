import { Scene } from '../scene';

export class GameLevel extends Scene {
    constructor(game) {
        super(game);
    }

    init() {
        super.init();
    }

    update(time) {
        // TODO Update tower and creeps
    }

    render(time) {
        this.update(time);
        this.game.screen.fill('#c0ffad');
        // this.game.screen.drawSprite(this.map);
        // TODO Draw towers and creeps
        super.render(time);
    }
}
