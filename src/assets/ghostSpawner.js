import Phaser from "phaser";

export default class GhostSpawner {
  constructor(scene, ghostKey = "ghost") {
    this.scene = scene;
    this.key = ghostKey;

    this._group = this.scene.physics.add.group();
  }

  get group() {
    return this._group;
  }

  spawn(xPos, yPos) {
    const ghost = this.group.create(xPos, yPos, this.key).setScale(1);
    // ghost.setCircle(15);
    ghost.setCollideWorldBounds(true);
    ghost.direction = "up";

    return ghost;
  }
}
