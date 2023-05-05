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

export class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
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

    this.powerPills = null;
    this.raycaster = null;
    this.ray = null;

    this.fov = -30;
    this.playerAngle = 0;
    this.keyPress = false;
  }
  init(data) {
    this.currentLevel = data.level;
    this.cameras.main.setBackgroundColor("#FFFFFF");
    this.username = data.username;
  }

  preload() {
    this.canvas = this.sys.game.canvas;
    this.load.tilemapTiledJSON(
      `tilemap${this.currentLevel}`,
      `./maze${this.currentLevel}.json`
    );
  }

  create(data) {
    this.add.rectangle(0, 0, this.canvas.width, 720, 0x00cccc);
    this.add.rectangle(0, 720, this.canvas.width, 720, 0xdddddd);
    this.graphics = this.add.graphics();
    this.collectGraphics = this.add.graphics();

    const newMap = this.make.tilemap({
      key: `tilemap${this.currentLevel}`,
    });
    const tileSet = newMap.addTilesetImage("maze", "tiles");
    newMap.createLayer("floor", tileSet).setVisible(false);
    this.wallsLayer = newMap.createLayer("walls", tileSet);
    this.wallsLayer
      .setCollisionByProperty({ collides: true })
      .setVisible(false);

    this.coins = this.physics.add.staticGroup();
    this.powerPills = this.physics.add.staticGroup();
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
    });
    this.powerPills.setVisible(false);

    this.coins.setVisible(false);
    this.ghostGroup.setVisible(false);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftRotate = this.input.keyboard.addKey("Q");
    this.leftRotate.on("up", () => {
      if (this.playerAngle === 0) {
        this.playerAngle = 270;
      } else {
        this.playerAngle += -90;
      }
    });
    this.rightRotate = this.input.keyboard.addKey("E");
    this.rightRotate.on("up", () => {
      if (this.playerAngle === 270) {
        this.playerAngle = 0;
      } else {
        this.playerAngle += 90;
      }
    });

    this.player.setBounce(0);
    this.player.setDrag(0);
    this.player.setVisible(false);
    this.scoreLabel = this.createScoreLabel(16, 16, data.score || 0);
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
  }

  createPlayer(xPos, yPos) {
    const player = this.physics.add.sprite(xPos, yPos, "povman").setScale(0.6);
    player.setCircle(12);
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

    if (cursors.left.isDown) {
      switch (this.playerAngle) {
        case 270:
          this.player.setVelocityX(-speed);
          break;
        case 90:
          this.player.setVelocityX(speed);
          break;
        case 180:
          this.player.setVelocityY(speed);
          break;
        case 0:
          this.player.setVelocityY(-speed);
          break;
      }
    } else if (cursors.right.isDown) {
      switch (this.playerAngle) {
        case 270:
          this.player.setVelocityX(speed);
          break;
        case 90:
          this.player.setVelocityX(-speed);
          break;
        case 180:
          this.player.setVelocityY(-speed);
          break;
        case 0:
          this.player.setVelocityY(speed);
          break;
      }
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
    this.add
      .text(350, 700, `Congrats Moving to Level ${this.currentLevel + 1}`, {
        font: "100px Arial",
        strokeThickness: 2,
        color: "#000000",
        backgroundColor: "#ffffff",
      })
      .setOrigin(0.5);
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        this.scene.restart({
          username: this.username,
          level: this.currentLevel + 1,
          score: this.scoreLabel.score,
        });
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
    const label = new ScoreLabel(this, 350, y, score, style).setOrigin(0.5);
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
    this.graphics.clear();

    for (let i = 0; i < intersection.length; i++) {
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

      // let adjustedDistance = distance * Math.cos(ca);  -- Fish Eye

      let inverse = (32 * 320) / distance;
      if (intersection[i].object.type === "TilemapLayer") {
        const inverseClamp = Math.floor(Phaser.Math.Clamp(inverse, 0, 255));

        const hex = this.RGBtoHex(inverseClamp, 0, 0);
        this.graphics.lineStyle(5, 0xff00ff, 1.0);
        this.graphics.fillStyle(Number(hex));
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, inverse);
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, -inverse);
      } else if (intersection[i].object.type !== "TilemapLayer") {
        const inverseClamp = Math.floor(Phaser.Math.Clamp(inverse, 0, 255));
        const hex = this.RGBtoHex(0, inverseClamp, 0);
        this.graphics.lineStyle(5, 0xff00ff, 1.0);
        this.graphics.fillStyle(Number(hex));
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, inverse);
        this.graphics.fillRect(0 + i * 2.5, 350, 2.5, -inverse);
      }
    }
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

    this.createSquare(intersections);
  }

  colorToHex(color) {
    const hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
  }

  RGBtoHex(red, green, blue) {
    return (
      "0x" +
      this.colorToHex(red) +
      this.colorToHex(green) +
      this.colorToHex(blue)
    );
  }
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
