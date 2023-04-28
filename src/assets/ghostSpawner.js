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

  spawn() {
    const ghost = this.group.create(430, 425, this.key);
    ghost.setCollideWorldBounds(true);

    return ghost;
  }
}
