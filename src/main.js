import Phaser from "phaser";
import "./style.css";
import Scene from "./scenes/Scene"

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  backgroundColor: "#000000",
  parent: "app",
  pixelArt: true,
   physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, 
      debug: false         
    }
  },
  scene: [Scene],
};

const game = new Phaser.Game(config);


