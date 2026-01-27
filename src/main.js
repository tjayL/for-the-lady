import Phaser from "phaser";
import "./style.css";
import Scene from "./scenes/Scene"

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1d1d1d",
  parent: "app",
  scene: [Scene],
};

const game = new Phaser.Game(config);


