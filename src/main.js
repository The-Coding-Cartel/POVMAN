import Phaser from 'phaser';
import { SplashScene } from './scenes/splashScene';
import { TitleScene } from './scenes/titleScene';

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
		},
	},
	scene: [SplashScene, TitleScene],
}

export default new Phaser.Game(config)
