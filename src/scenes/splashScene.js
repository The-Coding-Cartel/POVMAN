import Phaser from "phaser";

export class SplashScene extends Phaser.Scene {
  constructor() {
    super("splashScene");
  }

  init() {
    this.cameras.main.setBackgroundColor("#ffffff");
  }

  preload() {
    console.log("splash screen");
    this.load.image("codingCartel", "./coding cartel.png");
  }

  create() {
    this.background = this.add.sprite(0, 0, "codingCartel");
    this.background.x = 400;
    this.background.y = 300;
  }

  update(time, delta) {
    if (time > 3000) {
      this.scene.switch("titleScene");
      //,}
    }
  }
}
