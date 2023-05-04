import Phaser from "phaser";
import ScoreLabel from "../ui/scoreLabel";
import GhostSpawner from "../assets/ghostSpawner";
import {
  addDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from "@firebase/firestore";
import { firestore } from "../firebase";
export const mapX = 28,
  mapY = 31,
  mapS = 32;

export class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
    this.direction = "up";
    this.enemyDirection = "up";
    this.scoreLabel = null;
    this.ghostSpawner = null;
    this.ghostGroup = null;
    this.hasHit = false;
    this.poweredUp = false;
    this.username = null;
    this.wallsLayer = null;
    this.coins = null;
    this.music = null;
    this.cursors = null;
    this.player = null;
    this.scoreLabel = null;
    this.powerPills = null;
    this.raycaster = null;
    this.ray = null;
    this.collectCaster = null;
    this.collectRay = null;
    this.fov = -30;
    this.playerAngle = 0;
    this.keyPress = false;
  }
  init(data) {
    this.cameras.main.setBackgroundColor("#FFFFFF");
    this.username = data.username;
  }

  preload() {
    this.canvas = this.sys.game.canvas;
  }

  create() {
    this.add.rectangle(0, 0, this.canvas.width, 760, 0x00ff00);
    this.add.rectangle(0, 760, this.canvas.width, 700, 0x000000);
    this.graphics = this.add.graphics();
    this.collectGraphics = this.add.graphics();

    const newMap = this.make.tilemap({
      key: "tilemap",
    });
    const tileSet = newMap.addTilesetImage("maze", "tiles");
    newMap.createLayer("floor", tileSet).setVisible(false);
    this.wallsLayer = newMap.createLayer("walls", tileSet);
    this.wallsLayer
      .setCollisionByProperty({ collides: true })
      .setVisible(false);

    this.coins = this.physics.add.staticGroup();
    this.powerPills = this.physics.add.staticGroup().setVisible(false);

    this.ghostSpawner = new GhostSpawner(this, "ghost");
    this.ghostGroup = this.ghostSpawner.group.setVisible(false);

    newMap.filterTiles((tile) => {
      switch (tile.index) {
        case 3:
          this.coins.create(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.width / 2,
            "coin"
          );
          break;
        case 4:
          this.player = this.createPlayer(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.width / 2
          );
          break;
        case 5:
          this.ghostSpawner.spawn(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.width / 2
          );
          break;
        case 6:
          this.powerPills.create(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.width / 2,
            "powerPill"
          );
          break;
        default:
          break;
      }
      // if (tile.index === 3) {
      //   this.coins.create(
      //     tile.pixelX + tile.width / 2,
      //     tile.pixelY + tile.width / 2,
      //     "coin"
      //   );
      // } else if (tile.index === 4) {
      //   this.player = this.createPlayer(
      //     tile.pixelX + tile.width / 2,
      //     tile.pixelY + tile.width / 2
      //   );
      // }
    });
    this.coins.setVisible(false);
    this.ghostGroup.setVisible(false);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.player.setBounce(0);
    this.player.setDrag(0);
    this.scoreLabel = this.createScoreLabel(16, 16, 0);
    this.music = this.sound.add("background-music", { loop: true });
    // this.music.play();

    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.powerPills,
      this.collectPowerPill,
      null,
      this
    );

    this.physics.add.collider(
      this.ghostGroup,
      this.wallsLayer,
      this.changeDir,
      null,
      this
    );
    this.physics.add.collider(this.player, this.wallsLayer);

    this.physics.add.collider(
      this.player,
      this.ghostGroup,
      this.hitGhost,
      null,
      this
    );

    this.createRaycaster();

    // this.createCollectCaster();
    // this.cameras.main.setAngle(180)
  }

  update() {
    const ghostsArray = this.ghostGroup.getChildren();
    if (this.cursors) {
      this.playerMovement(this.cursors);
      this.updateRaycaster();
    }
    ghostsArray.forEach((ghost) => {
      this.enemyMovement(ghost);
    });

    this.physics.world.wrap(this.player, 0);
    // this.updateCollectCaster();
  }

  createPlayer(xPos, yPos) {
    this.direction = "right";
    const player = this.physics.add.sprite(xPos, yPos, "povman").setScale(0.6);
    player.setCircle(16);
    return player;
  }

  playerMovement(cursors) {
    const speed = 125 / 2;
    this.player.setVelocity(0);

    if (cursors.up.isDown) {
      switch (this.playerAngle) {
        case 270:
          this.player.setVelocityY(-speed);
          break;
        case 90:
          this.player.setVelocityY(speed);
          break;
        case 180:
          this.player.setVelocityX(-speed);
          break;
        case 0:
          this.player.setVelocityX(speed);
          break;
      }
    } else if (cursors.down.isDown) {
      switch (this.playerAngle) {
        case 270:
          this.player.setVelocityY(speed);
          break;
        case 90:
          this.player.setVelocityY(-speed);
          break;
        case 180:
          this.player.setVelocityX(speed);
          break;
        case 0:
          this.player.setVelocityX(-speed);
          break;
      }
    }
    // this.cursors.left.once("down", () => {
    //   if (this.playerAngle === 0) {
    //     this.playerAngle = 270
    //   } else {
    //     this.playerAngle += -90;
    //   }
    //   console.log(this.playerAngle);
    // });

    if (cursors.left.isDown) {
      if (this.keyPress === false) {
        if (this.playerAngle === 0) {
          this.playerAngle = 270;
        } else {
          this.playerAngle += -90;
        }
        this.keyPress = true;
        console.log(this.playerAngle);
      }
    } else if (cursors.right.isDown) {
      if (this.keyPress === false) {
        if (this.playerAngle === 270) {
          this.playerAngle = 0;
        } else {
          this.playerAngle += 90;
        }
        this.keyPress = true;
        console.log(this.playerAngle);
      }
    }

    if (cursors.left.isUp && cursors.right.isUp) {
      this.keyPress = false;
    }
  }

  enemyMovement(ghost) {
    const speed = 125 / 2;
    ghost.setVelocity(0);

    switch (ghost.direction) {
      case "up":
        ghost.setVelocityY(-speed);
        break;
      case "down":
        ghost.setVelocityY(speed);
        break;
      case "left":
        ghost.setVelocityX(-speed);
        break;
      case "right":
        ghost.setVelocityX(speed);
        break;
    }
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.scoreLabel.add(1);
  }

  collectPowerPill(player, powerPill) {
    powerPill.disableBody(true, true);
    this.poweredUp = true;
    this.player.setTint(0xff4444);
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        this.poweredUp = false;
        this.player.clearTint();
      },
      callbackScope: this,
      loop: false,
    });
  }

  hitGhost(player, ghost) {
    this.raycaster.removeMappedObjects(this.wallsLayer);
    if (!this.hasHit && !this.poweredUp) {
      this.player.disableBody();
      this.cursors = null;
      player.setTint(0xff4444);
      this.submitScore(this.scoreLabel.score);
      this.gameOverText = this.add
        .text(this.canvas.width / 2, this.canvas.height / 2, "Game Over", {
          font: "100px Arial",
          strokeThickness: 2,
          color: "#000000",
          backgroundColor: "#ffffff",
        })
        .setOrigin(0.5);
      this.hasHit = true;
    } else if (this.poweredUp && !this.hasHit) {
      ghost.destroy();
      this.scoreLabel.add(10);
      this.time.addEvent({
        delay: 3000,
        callback: () => {
          this.ghostSpawner.spawn();
        },
        callbackScope: this,
        loop: false,
      });
    }
  }

  changeDir(ghost, wall) {
    const dirs = ["up", "left", "down", "right"];
    const index = Phaser.Math.Between(0, 3);
    ghost.direction = dirs[index];
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    const label = new ScoreLabel(this, x, y, score, style);
    this.add.existing(label);
    return label;
  }
  createHighScores(scores) {
    const style = { fontSize: "32px", fill: "#000" };

    scores.forEach(({ score }, index) => {
      const label = new ScoreLabel(this, 100, 50 + 20 * index, score, style);
      this.add.existing(label);
    });
  }
  submitScore(score) {
    const scoreRef = collection(firestore, "scores");
    const highScores = [];
    const q = query(scoreRef, orderBy("score", "desc"), limit(10));
    let data = {
      posted_at: serverTimestamp(),
      score: score,
      username: this.username,
    };

    addDoc(scoreRef, data)
      .then(() => {
        return getDocs(q);
      })
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          highScores.push(doc.data());
        });
        console.log(highScores);
        this.createHighScores(highScores);
      })
      .catch((err) => console.log(err));
  }

  createSquare(intersection) {
    // console.log(intersection[0]);
    this.graphics.clear();

    for (let i = 0; i < intersection.length; i++) {
      // console.log(i);
      let distance = Phaser.Math.Distance.Between(
        this.ray.origin.x,
        this.ray.origin.y,
        intersection[i].x || 0,
        intersection[i].y || 0
      );

      let ca = this.playerAngle - this.fov;
      ca = ca * 0.0174533;

      if (ca < 0) {
        ca += 2 * Math.PI;
      }

      if (ca > 2 * Math.PI) {
        ca -= 2 * Math.PI;
      }

      let adjustedDistance = distance * Math.cos(ca);

      let inverse = (32 * 320) / distance;
      if (inverse > 20 && intersection[i].object.type === "TilemapLayer") {
        //this.graphics.rotateCanvas(3.14);
        this.graphics.lineStyle(5, 0xff00ff, 1.0);
        this.graphics.fillStyle(16777216 / 4 - inverse * 10);
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, inverse);
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, -inverse);
      } else if (
        inverse > 20 &&
        intersection[i].object.type !== "TilemapLayer"
      ) {
        this.graphics.lineStyle(5, 0xff00ff, 1.0);
        this.graphics.fillStyle(0x00ff00, (inverse - 20) / 400);
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, inverse);
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, -inverse);
      }
    }

    // if (this.square) {
    //   this.square.clear();
    // }
    // this.square = this.add.graphics();
    // this.square.lineStyle(5, 0xff00ff, 1.0);
    // this.square.fillStyle(0xffffff, 1.0);
    // this.square.fillRect(950, 50, 20, inverse);
  }

  createRaycaster() {
    this.raycaster = this.raycasterPlugin.createRaycaster();
    this.ray = this.raycaster.createRay();
    this.raycaster.mapGameObjects(this.wallsLayer, false, {
      collisionTiles: [2],
    });
    this.raycaster.mapGameObjects(this.ghostGroup.getChildren(), true);
    this.ray.setOrigin(this.player.x, this.player.y);
    this.ray.setAngleDeg(0);
  }

  updateRaycaster() {
    const intersections = [];
    for (let i = 0; i < 480; i++) {
      this.ray.setAngleDeg(this.fov);
      const intersect = this.ray.cast();
      intersections.push(intersect);
      this.fov += 0.125;
    }
    this.fov = this.playerAngle - 30;
    this.ray.setOrigin(this.player.x, this.player.y);

    // const distance = Phaser.Math.Distance.Between(
    //   this.ray.origin.x,
    //   this.ray.origin.y,
    //   intersection.x,
    //   intersection.y
    // );

    this.createSquare(intersections);
    // console.log("🚀 ~ file: gameScene.js:298 ~ intersection:", intersection);
    // console.log("ORIGIN", this.ray.origin);
  }

  createCollectCaster() {
    this.collectCaster = this.raycasterPlugin.createRaycaster({ debug: true });
    this.collectRay = this.collectCaster.createRay();
    this.collectCaster.mapGameObjects(this.wallsLayer, false, {
      collisionTiles: [1],
    });
    this.collectCaster.mapGameObjects(this.coins.getChildren(), true);
    this.collectRay.setOrigin(this.player.x, this.player.y);
    this.collectRay.setAngleDeg(0);
  }
  updateCollectCaster() {
    this.collectRay.setOrigin(this.player.x, this.player.y);
    this.collectRay.setAngleDeg(this.playerAngle);
    const intersect = this.collectRay.cast();
    this.renderCollectible(intersect);
  }
  renderCollectible(intersect) {
    this.collectGraphics.clear();
    if (intersect?.object.texture?.key === "coin") {
      // console.log("sprite");
      let distance = Phaser.Math.Distance.Between(
        this.collectRay.origin.x,
        this.collectRay.origin.y,
        intersect.x,
        intersect.y
      );

      let inverse = (32 * 320) / distance;
      this.collectGraphics.lineStyle(5, 0xff00ff, 1.0);
      this.collectGraphics.fillStyle(0xffd700, (inverse - 20) / 400);
      this.collectGraphics.fillRect(1547.5, 450, 25, 25);
    }

    // let ca = this.playerAngle - this.fov;
    // ca = ca * 0.0174533;

    // if (ca < 0) {
    //   ca += 2 * Math.PI;
    // }

    // if (ca > 2 * Math.PI) {
    //   ca -= 2 * Math.PI;
    // }

    // let adjustedDistance = distance * Math.cos(ca);

    // if (inverse > 20 && intersection[i].object.type === "TilemapLayer") {
    //   //this.graphics.rotateCanvas(3.14);
    //   this.graphics.lineStyle(5, 0xff00ff, 1.0);
    //   this.graphics.fillStyle(0xff0000, (inverse - 20) / 400);
    //   this.graphics.fillRect(950 + i * 2.5, 350, 2.5, inverse);
    //   this.graphics.fillRect(950 + i * 2.5, 350, 2.5, -inverse);
    // } else if (
    //   inverse > 20 &&
    //   intersection[i].object.type !== "TilemapLayer"
    // ) {
    //   this.graphics.lineStyle(5, 0xff00ff, 1.0);
    //   this.graphics.fillStyle(0x00ff00, (inverse - 20) / 400);
    //   this.graphics.fillRect(950 + i * 2.5, 350, 2.5, inverse);
    //   this.graphics.fillRect(950 + i * 2.5, 350, 2.5, -inverse);
    // }
  }

  // if (this.square) {
}

// drawMap(scene, map, mapX, mapY, mapS) {
//   const graphics = scene.add.graphics();
//   const walls = this.physics.add.staticGroup();
//   this.powerPills = this.physics.add.staticGroup();
//   this.coins = this.physics.add.staticGroup();

//   graphics.fillStyle(0xffffff, 1); // Fill color and alpha
//   graphics.lineStyle(1, 0x000000, 1); // Line width, color, and alpha
//   for (let i = 0; i < map.length; i++) {
//     const x = (i % mapX) * mapS;
//     const y = Math.floor(i / mapX) * mapS;
//     graphics.strokeRect(x, y, mapS, mapS);

//     switch (map[i]) {
//       case 0:
//         this.coins.create(x + mapS / 2, y + mapS / 2, "coin");
//         graphics.fillRect(x, y, mapS, mapS);
//         break;
//       case 1:
//         walls.create(x + mapS / 2, y + mapS / 2, "wall");
//         break;
//       case 5:
//         graphics.fillRect(x, y, mapS, mapS);
//         this.powerPills.create(x + mapS / 2, y + mapS / 2, "powerPill");
//         break;
//     }
//   }
//   scene.add.existing(graphics);
//   return walls;
// }
