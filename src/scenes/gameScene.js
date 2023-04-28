import Phaser from "phaser";
import { map } from "../assets/mapsarray";

export const mapX = 28,
  mapY = 31,
  mapS = 30;

console.log(map);

export class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }
  init() {
    this.cameras.main.setBackgroundColor("#000000");
  }

  preload() {
    this.canvas = this.sys.game.canvas;
    console.log("loading image...");
    this.load.image("wall", "./wall.png");
    this.load.image("povman", "./povman.png");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.walls = this.drawMap(this, map, mapX, mapY, mapS);
    this.player = this.drawPlayer(430, 425);
    this.physics.add.collider(this.player, this.walls);
  }

  update() {
    this.playerMovement(this.cursors);
  }

  drawMap(scene, map, mapX, mapY, mapS) {
    const graphics = scene.add.graphics();
    const walls = this.physics.add.staticGroup();

    graphics.fillStyle(0xffffff, 1); // Fill color and alpha
    graphics.lineStyle(1, 0x000000, 1); // Line width, color, and alpha
    for (let i = 0; i < map.length; i++) {
      const x = (i % mapX) * mapS;
      const y = Math.floor(i / mapX) * mapS;
      graphics.strokeRect(x, y, mapS, mapS);
      if (map[i] === 1) {
        walls.create(x + mapS / 2, y + mapS / 2, "wall");
      } else {
        graphics.fillRect(x, y, mapS, mapS);
      }
    }
    scene.add.existing(graphics);
    return walls;
  }

  drawPlayer(xPos, yPos) {
    const player = this.physics.add.sprite(xPos, yPos, "povman");
    return player;
  }

  playerMovement(cursors) {
    const speed = 200;
    this.player.setVelocity(0);

    if (cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    if (cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }
    this.physics.world.wrap(this.player, 0);
  }
}
