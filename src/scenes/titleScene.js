import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("titleScene");
  }

  init() {
    this.cameras.main.setBackgroundColor("#4E68E0");
  }

  preload() {
    this.load.image("title-img", "./POVMAN-title.jpg");
  }

  create() {
    this.background = this.add.sprite(0, 0, "title-img");
    this.background.x = 400;
    this.background.y = 300;
  }

  update(time, delta) {
    if (time > 3000) {
      this.scene.switch("menuScene");
    }
  }
}
