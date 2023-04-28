import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }
  init() {
    this.cameras.main.setBackgroundColor("#000000");
  }
}
