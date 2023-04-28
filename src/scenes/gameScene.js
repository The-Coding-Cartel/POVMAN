import Phaser from "phaser";
import { map } from "../assets/mapsarray";
import ScoreLabel from "../ui/scoreLabel";

export const mapX = 28,
  mapY = 31,
  mapS = 30;

console.log(map);

export class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
    this.direction = "up";
    this.scoreLabel = undefined;
  }
  init() {
    this.cameras.main.setBackgroundColor("#000000");
  }

  preload() {
    this.canvas = this.sys.game.canvas;
    console.log("loading image...");
    this.load.image("wall", "./wall.png");
    this.load.image("povman", "./povman.png");
    this.load.image("coin", "./coin.png");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.walls = this.drawMap(this, map, mapX, mapY, mapS);
    this.player = this.drawPlayer(430, 425);
    this.scoreLabel = this.createScoreLabel(16, 16, 0);
    this.physics.add.collider(
      this.player,
      this.walls,
      this.changeDir,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );
  }

  update() {
    this.playerMovement(this.cursors);
    this.physics.world.wrap(this.player, 5);
  }

  drawMap(scene, map, mapX, mapY, mapS) {
    const graphics = scene.add.graphics();
    const walls = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();

    graphics.fillStyle(0xffffff, 1); // Fill color and alpha
    graphics.lineStyle(1, 0x000000, 1); // Line width, color, and alpha
    for (let i = 0; i < map.length; i++) {
      const x = (i % mapX) * mapS;
      const y = Math.floor(i / mapX) * mapS;
      graphics.strokeRect(x, y, mapS, mapS);
      if (map[i] === 1) {
        walls.create(x + mapS / 2, y + mapS / 2, "wall");
      } else if (map[i] === 0) {
        this.coins.create(x + mapS / 2, y + mapS / 2, "coin");
        graphics.fillRect(x, y, mapS, mapS);
      }
    }
    scene.add.existing(graphics);
    return walls;
  }

  drawPlayer(xPos, yPos) {
    const player = this.physics.add.sprite(xPos, yPos, "povman").setScale(0.96);

    return player;
  }

  playerMovement(cursors) {
    const speed = 75;
    this.player.setVelocity(0);

    switch (this.direction) {
      case "up":
        this.player.setVelocityY(-speed);
        break;
      case "down":
        this.player.setVelocityY(speed);
        break;
      case "left":
        this.player.setVelocityX(-speed);
        break;
      case "right":
        this.player.setVelocityX(speed);
        break;
    }

    if (cursors.up.isDown) {
      this.player.setVelocityY(-speed);

      this.direction = "up";
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(speed);

      this.direction = "down";
    }

    if (cursors.left.isDown) {
      this.player.setVelocityX(-speed);

      this.direction = "left";
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(speed);

      this.direction = "right";
    }
  }
  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.scoreLabel.add(1);
  }
  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    const label = new ScoreLabel(this, x, y, score, style);
    this.add.existing(label);
    return label;
  }

  changeDir(player, wall) {
    // if the direction your trying to go is blocked set direction to previous direction
    // const dirs = ["up", "left", "down", "right"];
    // const index = Phaser.Math.Between(0, 3);
    // this.direction = dirs[index];
    // console.log(this.direction);
    // if (!player.body.touching.up) {
    //   this.direction = "up";
    // } else if (!player.body.touching.left) {
    //   this.direction = "left";
    // } else if (!player.body.touching.down) {
    //   this.direction = "down";
    // } else if (!player.body.touching.right) {
    //   this.direction = "right";
    // }
  }
}
