import Phaser from "phaser";
import { SplashScene } from "./scenes/splashScene";
import { TitleScene } from "./scenes/titleScene";
import { MenuScene } from "./scenes/menuScene";
import { GameScene } from "./scenes/gameScene";

import PhaserRaycaster from "phaser-raycaster";

const config = {
  type: Phaser.AUTO,
  parent: "app",
  width: 1350,
  height: 750,
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
