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
    //this.drawMap(this, map, mapX, mapY, mapS);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.walls = this.drawMap(this, map, mapX, mapY, mapS);
    this.player = this.drawPlayer(this, 430, 425, 16);
    this.physics.add.collider(this.player, this.walls, () => {
      this.player.x = this.player.x - this.player.body.deltaX();
      this.player.y = this.player.y - this.player.body.deltaY();
    });
    console.log(this.walls);
  }

  update() {
    this.playerMovement(this.cursors);
  }

  drawMap(scene, map, mapX, mapY, mapS) {
    const graphics = scene.add.graphics();
    const walls = this.physics.add.group();

    graphics.fillStyle(0xffffff, 1); // Fill color and alpha
    graphics.lineStyle(1, 0x000000, 1); // Line width, color, and alpha
    for (let i = 0; i < map.length; i++) {
      const x = (i % mapX) * mapS;
      const y = Math.floor(i / mapX) * mapS;
      graphics.strokeRect(x, y, mapS, mapS);
      if (map[i] === 1) {
        console.log(i);
        //graphics.fillRect(x, y, mapS, mapS);
        walls.physics.add.sprite(x + mapS / 2, y + mapS / 2, "wall");
      } else {
        graphics.fillRect(x, y, mapS, mapS);
      }
    }
    scene.add.existing(graphics);
    return walls;
  }

  drawPlayer(scene, xPos, yPos, size) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffff00, 1); // Fill color and alpha
    //this.player = graphics.fillRect(xPos, yPos, size, size); // x, y, width, height

    const player = this.physics.add.sprite(xPos, yPos, "povman");
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    return player;
    // Draw a line extending out of the rectangle
    // graphics.lineStyle(2, 0xffff00, 1); // Line width, color, and alpha
    // graphics.beginPath();
    // graphics.moveTo(xPos + size / 2, yPos + size / 2); // Start position of the line
    // graphics.lineTo(xPos + size * 2, yPos + size / 2); // End position of the line
    // graphics.closePath();
    // graphics.strokePath();
  }

  playerMovement(cursors) {
    if (cursors.up.isDown) {
      this.player.y -= 5; // move up
    } else if (cursors.left.isDown) {
      this.player.x -= 5; // move left
    } else if (cursors.down.isDown) {
      this.player.y += 5; // move down
    } else if (cursors.right.isDown) {
      this.player.x += 5; // move right
    }
  }
}
