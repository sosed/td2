import { ImageLoader } from "./utils/image-loader";

export class Screen {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = this.createCanvas(width, height);
        this.context = this.canvas.getContext('2d');
        this.images = {};
        this.isImagesLoaded = false;
        this.errorList = [];
    }

    loadImages(imageFiles) {
        const loader = new ImageLoader(imageFiles);
        loader.load().then((names) => {
            this.images = Object.assign(this.images, loader.images);
            this.isImagesLoaded = true;
        });
    }

    createCanvas(width, height) {
        let elements = document.getElementsByTagName('canvas');
        let canvas = elements[0] || document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;        
        return canvas;
    }

    fill(color) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    print(x, y, text) {
        this.context.fillStyle = "#000000";
        this.context.font = "22px Georgia";
        this.context.fillText(text, x, y);
    }

    alert(text) {
        this.errorList.push(text);
        const y = this.errorList.length * 22 + 5;
        this.context.fillStyle = "#F00";
        this.context.font = "22px Georgia";
        this.context.fillText(text, 0, y);
    }

    drawImage(x, y, imageName) {
        this.context.drawImage(this.images[imageName], x, y);
    }

    /**
     * TODO Use old sprite
     * @param {Sprite} sprite
     */
    drawSprite(sprite) {

        let spriteX = sprite.x;
        let spriteY = sprite.y;

        if(
            (spriteX >= this.width) ||
            (spriteY >= this.height) ||
            ((spriteX + sprite.width) <= 0) ||
            ((spriteY + sprite.height) <= 0)
        ) {
            return;
        }

        let sourceX = sprite.sourceX + Math.abs(Math.min(0, spriteX));
        let sourceY = sprite.sourceY + Math.abs(Math.min(0, spriteY));
        let width = Math.min(this.width, spriteX + sprite.width) - Math.max(0, spriteX);
        let height = Math.min(this.height, spriteY + sprite.height) - Math.max(0, spriteY);

        this.context.drawImage(this.images[sprite.imageName],
            sourceX,
            sourceY,
            width,
            height,
            Math.max(0, spriteX),
            Math.max(0, spriteY),
            width,
            height
        );
    }
}
