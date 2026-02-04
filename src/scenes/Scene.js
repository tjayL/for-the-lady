import Phaser from "phaser";

export default class Scene extends Phaser.Scene {
  constructor() {
    super("Scene");
  }

  preload() {
    // Tilemap
    this.load.tilemapTiledJSON("map", "/assets/tilemap/tilemap.json");

    // Tilesets
    this.load.image("grassTiles", "/assets/tiles/Grass.png");
    this.load.image("plantTiles", "/assets/tiles/Basic Grass Biom things 1.png");
    this.load.image("otherPlantTiles", "/assets/tiles/Basic Plants.png");
    this.load.image("eggTiles", "/assets/tiles/Egg item.png");
    this.load.image("dirtTiles", "/assets/tiles/Tilled_Dirt_Wide.png");
    this.load.image("waterTiles", "/assets/tiles/Water.png");
    this.load.image("bridgeTiles", "/assets/tiles/Wood Bridge.png");

    // Player spritesheet
    this.load.spritesheet("player", "/assets/player/spritesheet.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    // Font
    this.load.bitmapFont(
      "pixelFont",
      "/assets/font/monogram-bitmap.png",
      "/assets/font/monogram-bitmap.json"
    );

    // Dialogue box
    this.load.image("dialogueBox", "/assets/dialogue/dialogue-box.PNG");

    // Dialogue SFX
    this.load.audio("dialogueSound", "/assets/sfx/dialogue.mp3");

    // Background Music
    this.load.audio("bgm", "/assets/audio/bgm.mp3");
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tilewidth: 16,
      tileHeight: 16,
    });

    // Tilesets
    const grassTS = map.addTilesetImage("Grass", "grassTiles");
    const plantTS = map.addTilesetImage(
      "Basic Grass Biom things 1",
      "plantTiles"
    );
    const otherPlantTS = map.addTilesetImage(
      "Basic Plants",
      "otherPlantTiles"
    );
    const eggTS = map.addTilesetImage("Egg item", "eggTiles");
    const dirtTS = map.addTilesetImage("Tilled_Dirt_Wide", "dirtTiles");
    const waterTS = map.addTilesetImage("Water", "waterTiles");
    const bridgeTS = map.addTilesetImage("Wood Bridge", "bridgeTiles");

    const tilesets = [
      grassTS,
      plantTS,
      otherPlantTS,
      eggTS,
      dirtTS,
      waterTS,
      bridgeTS,
    ];

    // Layers
    map.createLayer("water", tilesets, 0, 0);
    map.createLayer("grass", tilesets, 0, 0);
    map.createLayer("pathway", tilesets, 0, 0);
    map.createLayer("objects", tilesets, 0, 0);

    

    // Camera
    this.cameras.main.setRoundPixels(true).setZoom(2);
    this.cameras.main.centerOn(
      map.widthInPixels / 2,
      map.heightInPixels / 2
    );

    this.dialogueTypingSound = this.sound.add("dialogueSound", {
      volume: 0.4,
      loop: true
    })

    // Player spawn
    const objectLayer = map.getObjectLayer("GameObjects");
    const spawnPoint = objectLayer.objects.find((obj) => obj.name === "spawn");

    this.player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "player")
      .setOrigin(0, 0)
      .setScale(1.5)
      .setCollideWorldBounds(true);

    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.cameras.main.startFollow(this.player);
    this.cameras.main
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .setZoom(3);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.bgm = this.sound.add("bgm", {
      loop: true,
      volume: 0.4
    });

    this.bgm.play();


    // Animations
    const animsData = [
      { key: "walk-down", start: 2, end: 3 },
      { key: "walk-up", start: 6, end: 7 },
      { key: "walk-left", start: 10, end: 11 },
      { key: "walk-right", start: 14, end: 15 },
      { key: "idle-down", start: 0, end: 1, frameRate: 4 },
      { key: "idle-up", start: 5, end: 6, frameRate: 4 },
      { key: "idle-left", start: 8, end: 9, frameRate: 4 },
      { key: "idle-right", start: 12, end: 13, frameRate: 4 },
    ];

    animsData.forEach((a) => {
      this.anims.create({
        key: a.key,
        frames: this.anims.generateFrameNumbers("player", {
          start: a.start,
          end: a.end,
        }),
        frameRate: a.frameRate || 10,
        repeat: -1,
      });
    });

    // Typewriter effect
      this.isTyping = false;

      this.typeText = (textObj, fullText) => {
      this.isTyping = true;
      textObj.setText("");

      if (!this.dialogueTypingSound.isPlaying) {
        this.dialogueTypingSound.play();
      }

      let i = 0;

      this.time.addEvent({
        delay: 25,
        repeat: fullText.length - 1,

        callback: () => {
          textObj.text += fullText[i];
          i++;

          if (i === fullText.length) {
            this.isTyping = false;
            this.dialogueTypingSound.stop();
          }
        }
      });
    };


    // --- Dialogue1 & Dialogue2 ---
    this.dialogueBox = this.add
      .image(600, 450, "dialogueBox")
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.2)
      .setVisible(false);

    this.dialogue1Text = this.add
      .text(
        500,
        460,
        "The Sunflowers speak: The lady has arrived!\nOmg guys she is so beautiful.",
        { font: "10px Arial", fill: "#ffffff" }
      )
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);

    this.dialogue2Text = this.add
      .text(
        500,
        460,
        "The Mushrooms speak: The lady is here!\nEveryone be on your best behaviour!!!",
        { font: "10px Arial", fill: "#ffffff" }
      )
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);

    this.dialogueZones = [];
    objectLayer.objects.forEach((obj) => {
      if (obj.name === "dialogue1" || obj.name === "dialogue2") {
        const zone = this.add
          .zone(obj.x, obj.y, obj.width, obj.height)
          .setOrigin(0)
          .setRectangleDropZone(obj.width, obj.height);

        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false).moves = false;
        this.dialogueZones.push(zone);

        this.physics.add.overlap(
          this.player,
          zone,
          () => {
            this.dialogueBox.setVisible(true);
            this.dialogue1Text.setVisible(obj.name === "dialogue1");
            this.dialogue2Text.setVisible(obj.name === "dialogue2");
          },
          null,
          this
        );
      }
    });

    //  Dialogue3 
    this.dialogue3Box = this.add
      .image(600, 450, "dialogueBox")
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.2)
      .setVisible(false);

    this.dialogue3Text = this.add
      .text(500, 460, "", { font: "10px Arial", fill: "#ffffff" })
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);

    this.interactHint = this.add
      .text(540, 460, "Press E to interact", {
        font: "16px Arial",
        fill: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(1002)
      .setVisible(false);

    this.dialogue3Lines = [
      "Ah! Miss Honorable Lady, I've been \nexpecting you!",
      "good googly moogly you really are as \nstunning as they say \n(yes YOU looking at the screen right now)",
      "Ahem, anyway, I have but one important \nquestion for you.",
      "On behalf of my creator, will you do him the \ngreatest honour of being your valentine?",
    ];

    this.dialogue3Index = 0;
    this.dialogue3Active = false;
    this.dialogue3Completed = false;

    const dialogue3Obj = objectLayer.objects.find(
      (obj) => obj.name === "dialogue3"
    );

    if (dialogue3Obj) {
      this.dialogue3Zone = this.add
        .zone(
          dialogue3Obj.x,
          dialogue3Obj.y,
          dialogue3Obj.width,
          dialogue3Obj.height
        )
        .setOrigin(0)
        .setRectangleDropZone(dialogue3Obj.width, dialogue3Obj.height);

      this.physics.world.enable(this.dialogue3Zone);
      this.dialogue3Zone.body.setAllowGravity(false).moves = false;
    }

    // Key E
    this.keyE = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    const centerX = 600,
      centerY = 450;

    this.yesButton = this.add
      .text(centerX - 60, centerY, "Yes", {
        font: "16px Arial",
        fill: "#ffffff",
        backgroundColor: "#ffb6c1",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1003)
      .setInteractive({ useHandCursor: true });

    this.noButton = this.add
      .text(centerX + 60, centerY, "No", {
        font: "16px Arial",
        fill: "#ffffff",
        backgroundColor: "#ffb6c1",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1003)
      .setInteractive({ useHandCursor: true });

    this.errorText = this.add
      .text(centerX, centerY + 40, "Error! Try again! (click yes please)", {
        font: "14px Arial",
        fill: "#ff0000",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1004)
      .setVisible(false);

    this.yesButton.setVisible(false);
    this.noButton.setVisible(false);
    this.errorText.setVisible(false);

    this.dialogue4Box = this.add
      .image(600, 450, "dialogueBox")
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.2)
      .setVisible(false);

    this.dialogue4Text = this.add
      .text(500, 460, "", { font: "10px Arial", fill: "#ffffff" })
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);

    this.dialogue4Lines = [
      "YIPPPEEEEEEEEEEEEEEEEEEEEEEEEE\nEEEEEEEEEEEEEEEEEEEE",
      "On behalf of my creator and this island of \ntalking plants, we are grateful for The Lady's \nanswer!",
    ];

    this.dialogue4Index = 0;
    this.dialogue4Active = false;
    this.dialogue4Completed = false;

    // Hover effects
    this.yesButton.on("pointerover", () => this.yesButton.setScale(1.1));
    this.yesButton.on("pointerout", () => this.yesButton.setScale(1));

    this.noButton.on("pointerover", () => this.noButton.setScale(1.1));
    this.noButton.on("pointerout", () => this.noButton.setScale(1));

    // Yes click
    this.yesButton.on("pointerdown", () => {
      this.dialogue3Box.setVisible(false);
      this.dialogue3Text.setVisible(false);
      this.yesButton.setVisible(false);
      this.noButton.setVisible(false);
      this.errorText.setVisible(false);

      this.dialogue4Active = true;
      this.dialogue4Index = 0;

      this.dialogue4Box.setVisible(true);
      this.dialogue4Text.setVisible(true);

      this.typeText(this.dialogue4Text, this.dialogue4Lines[0]);
    });

    // No click
    this.noButton.on("pointerdown", () => {
      this.errorText.setVisible(true);
    });
  }

  update() {
    const speed = 100;
    let moving = false;
    this.player.body.setVelocity(0);

    // Movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.anims.play("walk-left", true);
      moving = true;
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.anims.play("walk-right", true);
      moving = true;
    }

    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      this.player.anims.play("walk-up", true);
      moving = true;
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      this.player.anims.play("walk-down", true);
      moving = true;
    }

    if (!moving) {
      const key = this.player.anims.currentAnim?.key || "idle-down";
      if (key.includes("down")) this.player.anims.play("idle-down", true);
      else if (key.includes("up")) this.player.anims.play("idle-up", true);
      else if (key.includes("left")) this.player.anims.play("idle-left", true);
      else if (key.includes("right")) this.player.anims.play("idle-right", true);
    }

    // Dialogue1 & 2 zones
    let inZone = false;
    this.dialogueZones.forEach((zone) => {
      if (
        Phaser.Geom.Rectangle.Overlaps(
          this.player.getBounds(),
          zone.getBounds()
        )
      )
        inZone = true;
    });

    if (!inZone) {
      this.dialogueBox.setVisible(false);
      this.dialogue1Text.setVisible(false);
      this.dialogue2Text.setVisible(false);
    }

    // Dialogue3 zone
    if (this.dialogue3Zone && !this.dialogue4Active) {
      const inZone3 = Phaser.Geom.Rectangle.Overlaps(
        this.player.getBounds(),
        this.dialogue3Zone.getBounds()
      );

      if (inZone3 && !this.dialogue3Completed)
        this.interactHint.setVisible(!this.dialogue3Active);
      else this.interactHint.setVisible(false);

      if (inZone3 && Phaser.Input.Keyboard.JustDown(this.keyE)) {
        if (this.isTyping) return;

        if (!this.dialogue3Active && !this.dialogue3Completed) {
          this.dialogue3Active = true;
          this.dialogue3Index = 0;

          this.dialogue3Box.setVisible(true);
          this.dialogue3Text.setVisible(true);

          this.typeText(this.dialogue3Text, this.dialogue3Lines[0]);
        } else if (this.dialogue3Active) {
          this.dialogue3Index++;

          if (this.dialogue3Index < this.dialogue3Lines.length) {
            this.typeText(
              this.dialogue3Text,
              this.dialogue3Lines[this.dialogue3Index]
            );
          } else {
            this.dialogue3Active = false;
            this.dialogue3Completed = true;

            this.dialogue3Box.setVisible(false);
            this.dialogue3Text.setVisible(false);

            this.yesButton.setVisible(true);
            this.noButton.setVisible(true);
          }
        }
      }
    }

    // Dialogue4 zone
    if (this.dialogue4Active && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.isTyping) return;

      this.dialogue4Index++;

      if (this.dialogue4Index < this.dialogue4Lines.length) {
        this.typeText(
          this.dialogue4Text,
          this.dialogue4Lines[this.dialogue4Index]
        );
      } else {
        this.dialogue4Active = false;
        this.dialogue4Completed = true;

        this.dialogue4Box.setVisible(false);
        this.dialogue4Text.setVisible(false);
      }
    }
  }
}
