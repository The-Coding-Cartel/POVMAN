import Phaser from "phaser";
import { SplashScene } from "./scenes/splashScene";
import { TitleScene } from "./scenes/titleScene";
import { MenuScene } from "./scenes/menuScene";
import { GameScene } from "./scenes/gameScene";
import { mapX, mapS, mapY } from "./scenes/gameScene";
import PhaserRaycaster from "phaser-raycaster";

const config = {
  type: Phaser.AUTO,
  parent: "app",
  width: 896 * 4,
  height: 992,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [MenuScene, GameScene, SplashScene, TitleScene],
  plugins: {
    scene: [
      {
        key: "PhaserRaycaster",
        plugin: PhaserRaycaster,
        mapping: "raycasterPlugin",
      },
    ],
  },
};

export default new Phaser.Game(config);
