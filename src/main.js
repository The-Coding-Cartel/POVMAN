import Phaser from 'phaser';
import { SplashScene } from './scenes/splashScene';

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
	scene: [SplashScene],
}

export default new Phaser.Game(config)
