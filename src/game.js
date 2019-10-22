import { Screen } from './screen';
import { Scene } from './scene';
import { Menu } from "./scenes/menu";
import { GameLevel } from "./scenes/game-level";
import { Loading } from './scenes/loading';

export class Game {

    constructor({width = 800, height = 640} = {}) {
        this.screen = new Screen(width,height);
        this.screen.loadImages({
			baseSprite: './img/sprite64.png'
        });
        this.scenes = {
            loading: new Loading(this),
            menu: new Menu(this),
            gameLevel: new GameLevel(this)
        };
        this.currentScene = this.scenes.loading;
        this.currentScene.init();
    }

    changeScene(status) {
        switch (status) {
            case Scene.LOADED:
                return this.scenes.menu;
            case Scene.START_GAME:
                return this.scenes.gameLevel;
            default:
                return this.scenes.menu;
        }
    }

    frame(time) {
        if(this.currentScene.status !== Scene.WORKING) {
            this.currentScene = this.changeScene(this.currentScene.status);
            this.currentScene.init();
        }
        this.currentScene.render(time);
        requestAnimationFrame(time => this.frame(time));
    }

    run() {
        requestAnimationFrame(time => this.frame(time));
    }
}
