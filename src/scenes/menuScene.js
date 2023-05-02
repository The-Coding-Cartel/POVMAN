import Phaser from "phaser";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menuScene");
  }

  init() {
    this.cameras.main.setBackgroundColor("#4E68E0");
  }

  preload() {
    console.log("Hello");
    this.load.image("title-img", "./POVMAN-title.jpg");
  }

  create() {
    this.background = this.add.sprite(0, 0, "title-img");
    this.background.x = 400;
    this.background.y = 300;
    this.loginButton = this.add.text(500, 550, "Login", {
      font: "64px Arial",
      strokeThickness: 2,
      color: "#000000",
      backgroundColor: "#ffffff",
    });
    this.playButton = this.add.text(400, 450, "PLAY GAME", {
      font: "64px Arial",
      strokeThickness: 2,
      color: "#000000",
      backgroundColor: "#ffffff",
    });
    this.loginButton.setInteractive({ useHandCursor: true });
    this.playButton.setInteractive({ useHandCursor: true });
    this.playButton.on("pointerdown", () => {
      this.buttonClicked();
    });
    this.loginButton.on("pointerdown", () => {
      signInWithPopup(auth, googleProvider).then((res) => {
        console.log(res.user);
      });
    });
  }

  buttonClicked() {
    this.scene.switch("gameScene");
  }
}
