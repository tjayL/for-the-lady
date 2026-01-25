import Phaser from "phaser";
import "./style.css";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1d1d1d",
  parent: "app",
  scene: {
    preload,
    create,
    update
  }
};

function preload() {
  // load assets here
}

function create() {
  this.add.text(400, 300, "Phaser + Vite 🚀", {
    fontSize: "32px",
    color: "#ffffff"
  }).setOrigin(0.5);
}

function update() {}

new Phaser.Game(config);
