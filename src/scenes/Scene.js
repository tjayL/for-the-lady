import Phaser from "phaser";

export default class Scene extends Phaser.Scene {
  constructor() {
    super("Scene");
  }

  

  preload() {
    // load the tilemap JSON
    this.load.tilemapTiledJSON("map","/assets/tilemap/tilemap.json");

    // load tilesheets
    this.load.image("grassTiles", "/assets/tiles/Grass.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("plantTiles", "/assets/tiles/Basic Grass Biom things 1.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("otherPlantTiles", "/assets/tiles/Basic Plants.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("eggTiles", "/assets/tiles/Egg item.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("dirtTiles", "/assets/tiles/Tilled_Dirt_Wide.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("waterTiles", "/assets/tiles/Water.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("bridgeTiles", "/assets/tiles/Wood Bridge.png", { frameWidth: 16, frameHeight: 16 });

    // load spritesheet
    this.load.spritesheet("player", "/assets/player/spritesheet.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    // load font
    this.load.bitmapFont(
      "pixelFont",
      "/assets/font/monogram-bitmap.png",
      "/assets/font/monogram-bitmap.json"
    );

    // load dialogue box
    this.load.image("dialogueBox", "/assets/dialogue/dialogue-box.PNG");

  }

  create() {
    const map = this.make.tilemap({key: "map", tilewidth: 16, tileHeight: 16});
    
    // add tileset images
    const grassTS = map.addTilesetImage("Grass", "grassTiles");
    const plantTS = map.addTilesetImage("Basic Grass Biom things 1", "plantTiles");
    const otherPlantTS = map.addTilesetImage("Basic Plants", "otherPlantTiles");
    const eggTS = map.addTilesetImage("Egg item", "eggTiles");
    const dirtTS = map.addTilesetImage("Tilled_Dirt_Wide", "dirtTiles");
    const waterTS = map.addTilesetImage("Water", "waterTiles");
    const bridgeTS = map.addTilesetImage("Wood Bridge", "bridgeTiles");

    const tilesets = [grassTS, plantTS, otherPlantTS, eggTS, dirtTS, waterTS, bridgeTS];

    // create layers
    const waterLayer = map.createLayer("water", tilesets, 0, 0);
    const grassLayer = map.createLayer("grass", tilesets, 0, 0);
    const pathwayLayer = map.createLayer("pathway", tilesets, 0, 0);
    const objectsLayer = map.createLayer("objects", tilesets, 0, 0);

    

    // camera zoom
    this.cameras.main.setRoundPixels(true); 
    this.cameras.main.setZoom(2); 
    
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    this.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);

    // Get spawn point from object layer
    const objectLayer = map.getObjectLayer("GameObjects");
    const spawnPoint = objectLayer.objects.find(obj => obj.name === "spawn");

    // create player at spawn
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");
    this.player.setOrigin(0, 0); // aligns top-left with tile
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);

    // Make physics world match map size
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    // Make camera follow player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setRoundPixels(true); 
    this.cameras.main.setZoom(3); // zoom in
      

    // walk down
    this.anims.create({
        key: "walk-down",
        frames: this.anims.generateFrameNumbers("player", { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    // walk left
    this.anims.create({
        key: "walk-left",
        frames: this.anims.generateFrameNumbers("player", { start: 10, end: 11 }),
        frameRate: 10,
        repeat: -1
    });

    // walk right
    this.anims.create({
        key: "walk-right",
        frames: this.anims.generateFrameNumbers("player", { start: 14, end: 15 }),
        frameRate: 10,
        repeat: -1
    });

    // walk up
    this.anims.create({
        key: "walk-up",
        frames: this.anims.generateFrameNumbers("player", { start: 6, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    // Idle animations
    this.anims.create({
      key: "idle-down",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: "idle-left",
      frames: this.anims.generateFrameNumbers("player", { start: 8, end: 9 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: "idle-right",
      frames: this.anims.generateFrameNumbers("player", { start: 12, end: 13 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: "idle-up",
      frames: this.anims.generateFrameNumbers("player", { start: 5, end: 6 }),
      frameRate: 4,
      repeat: -1
    });
      
    // create dialogue box image
    this.dialogueBox = this.add.image(600, 450, "dialogueBox")
      .setScrollFactor(0)    
      .setDepth(1000)
      .setScale(0.2)
      .setVisible(false);

    // Dialogue text placeholders
    this.dialogue1Text = this.add.text(500, 460, "The Sunflowers speak: The lady has arrived! \n Omg guys she is so beautiful.", {
      font: "10px Arial",
      fill: "#ffffff",
    })
    .setScrollFactor(0)
    .setDepth(1001)
    .setVisible(false);

    this.dialogue2Text = this.add.text(500, 460, "The Mushrooms speak: The lady is here! \n Everyone be on your best behaviour!!!", {
      font: "10px Arial",
      fill: "#ffffff",
    })
    .setScrollFactor(0)
    .setDepth(1001)
    .setVisible(false);

    this.dialogueZones = [];

    objectLayer.objects.forEach(obj => {
    if (obj.name === "dialogue1" || obj.name === "dialogue2") {
      const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height)
        .setOrigin(0)
        .setRectangleDropZone(obj.width, obj.height);

      this.physics.world.enable(zone);
      zone.body.setAllowGravity(false);
      zone.body.moves = false;

      this.dialogueZones.push(zone); // store the zone

      this.physics.add.overlap(this.player, zone, () => {
        this.dialogueBox.setVisible(true);

        if (obj.name === "dialogue1") {
          this.dialogue1Text.setVisible(true);
          this.dialogue2Text.setVisible(false);
        } else if (obj.name === "dialogue2") {
          this.dialogue2Text.setVisible(true);
          this.dialogue1Text.setVisible(false);
        }
      }, null, this);
    }
  });
  }

  update() {
    
    const speed = 100; 
    const keys = this.input.keyboard.createCursorKeys();

    // Reset velocity
    this.player.body.setVelocity(0);

    let moving = false;

    // Horizontal movement
    if (keys.left.isDown) {
        this.player.body.setVelocityX(-speed);
        this.player.anims.play("walk-left", true);
        moving = true;
    } else if (keys.right.isDown) {
        this.player.body.setVelocityX(speed);
        this.player.anims.play("walk-right", true);
        moving = true;
    }

    // Vertical movement
    if (keys.up.isDown) {
        this.player.body.setVelocityY(-speed);
        this.player.anims.play("walk-up", true);
        moving = true;
    } else if (keys.down.isDown) {
        this.player.body.setVelocityY(speed);
        this.player.anims.play("walk-down", true);
        moving = true;
    }

    // If not moving, play idle based on last animation
    if (!moving) {
        const currentAnim = this.player.anims.currentAnim;
        if (currentAnim) {
            const key = currentAnim.key;
            if (key.includes("down")) this.player.anims.play("idle-down", true);
            else if (key.includes("up")) this.player.anims.play("idle-up", true);
            else if (key.includes("left")) this.player.anims.play("idle-left", true);
            else if (key.includes("right")) this.player.anims.play("idle-right", true);
        } else {
            // Default idle if no previous animation
            this.player.anims.play("idle-down", true);
        }
    }
  
    let inZone = false;
  this.dialogueZones.forEach(zone => {
    if (Phaser.Geom.Rectangle.Overlaps(this.player.getBounds(), zone.getBounds())) {
      inZone = true;
    }
  });

  if (!inZone) {
    this.dialogueBox.setVisible(false);
    this.dialogue1Text.setVisible(false);
    this.dialogue2Text.setVisible(false);
  }

}



  
}
