import Phaser from "phaser";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menuScene");
    this.username = "";
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
    this.loginButton = this.add
      .text(this.background.x, this.background.y, "Login", {
        font: "64px Arial",
        strokeThickness: 2,
        color: "#000000",
        backgroundColor: "#ffffff",
      })
      .setOrigin();
    // this.playButton = this.add.text(400, 450, "PLAY GAME", {
    //   font: "64px Arial",
    //   strokeThickness: 2,
    //   color: "#000000",
    //   backgroundColor: "#ffffff",
    // });
    this.loginButton.setInteractive({ useHandCursor: true });
    // this.playButton.setInteractive({ useHandCursor: true });
    // this.playButton.on("pointerdown", () => {
    //   this.buttonClicked();
    // });
    this.loginButton.on("pointerdown", () => {
      signInWithPopup(auth, googleProvider).then(({ user }) => {
        this.username = user.displayName;
        this.loginButton.destroy();
        this.playButton = this.add
          .text(this.background.x, this.background.y, "PLAY GAME", {
            font: "64px Arial",
            strokeThickness: 2,
            color: "#000000",
            backgroundColor: "#ffffff",
          })
          .setOrigin();
        this.playButton.setInteractive({ useHandCursor: true });
        this.playButton.on("pointerdown", () => {
          this.buttonClicked();
        });
      });
    });
  }

  buttonClicked() {
    this.scene.start("gameScene", { username: this.username });
    this.scene.sleep("menuScene");
  }
}
