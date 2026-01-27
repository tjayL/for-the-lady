import Phaser from "phaser";

export default class Scene extends Phaser.Scene {
    constructor() {
        super("Scene");
    }

   preload() {
    this.load.image("background", "/assets/background/Hills.png");
    this.load.image("player", "/assets/player/spritesheet.png");
   }

   create() {
    console.log(this.textures.get("background"));
   }

   update() {

   }


}