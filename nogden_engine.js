class NogdenEngine {

    constructor() {

this.gravity = 0.8;
this.maxFallSpeed = 12;

        this.tiles = {};
        this.world = {};

        this.tileSprite = null;
        this.playerSprite = null;

        this.tileSize = 45;

        this.player = {
            x: 0,
            y: 0,
            width: 32,
            height: 64,
            velocityX: 0,
            velocityY: 0,
            grounded: false,
            costume: "idle"
        };

        this.camera = {
            x: 0,
            y: 0
        };

        this.animationFrame = 1;
        this.animationTimer = 0;

        this.renderDistance = 25;

        // Rendering layer
        this.penSkinId = null;
        this.penDrawableId = null;
    }

movePlayerX(args) {

    this.player.x += Number(args.DX);

}

jumpPlayer(args) {

    if (this.player.grounded) {

        this.player.velocityY =
            -Number(args.POWER);

    }

}

isSolidTile(tileX, tileY) {

    const tile = this.world[`${tileX},${tileY}`];

    if (!tile) return false;

    const tileType = this.tiles[tile.block];

    if (!tileType) return false;

    return tileType.platform === 0;
}

isPlayerColliding(x, y) {

    const left =
        Math.floor(
            (x - this.player.width / 2)
            / this.tileSize
        );

    const right =
        Math.floor(
            (x + this.player.width / 2)
            / this.tileSize
        );

    const top =
        Math.floor(
            (y - this.player.height / 2)
            / this.tileSize
        );

    const bottom =
        Math.floor(
            (y + this.player.height / 2)
            / this.tileSize
        );

    for (let tx = left; tx <= right; tx++) {

        for (let ty = top; ty <= bottom; ty++) {

            if (this.isSolidTile(tx, ty)) {

                return true;

            }

        }

    }

    return false;
}

updatePlayer() {

    this.player.grounded = false;

    this.player.velocityY += this.gravity;

    if (
        this.player.velocityY >
        this.maxFallSpeed
    ) {
        this.player.velocityY =
            this.maxFallSpeed;
    }

    let newY =
        this.player.y +
        this.player.velocityY;

    if (
        !this.isPlayerColliding(
            this.player.x,
            newY
        )
    ) {

        this.player.y = newY;

    } else {

        if (this.player.velocityY > 0) {

            this.player.grounded = true;

        }

        this.player.velocityY = 0;

    }

}

    // Creates the drawing layer the first time renderFrame is called
    _initRenderer() {
        if (this.penSkinId !== null) return;
        const renderer = Scratch.renderer;
        this.penSkinId = renderer.createPenSkin();
        this.penDrawableId = renderer.createDrawable("background");
        renderer.updateDrawableProperties(this.penDrawableId, {
            skinId: this.penSkinId
        });
    }

    getInfo() {
        return {
            id: "nogdenengine",
            name: "Nogden Engine",
            blocks: [
                {
                    opcode: "loadTiles",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "load tile types from list [LIST]",
                    arguments: {
                        LIST: { type: Scratch.ArgumentType.STRING }
                    }
                },
                {
                    opcode: "loadWorld",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "load world from list [LIST]",
                    arguments: {
                        LIST: { type: Scratch.ArgumentType.STRING }
                    }
                },
                {
                    opcode: "setTileSprite",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "set tile sprite [SPRITE]",
                    arguments: {
                        SPRITE: { type: Scratch.ArgumentType.STRING }
                    }
                },
                {
                    opcode: "setPlayerSprite",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "set player sprite [SPRITE]",
                    arguments: {
                        SPRITE: { type: Scratch.ArgumentType.STRING }
                    }
                },
                {
                    opcode: "setPlayerPosition",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "set player position x [X] y [Y]",
                    arguments: {
                        X: { type: Scratch.ArgumentType.NUMBER },
                        Y: { type: Scratch.ArgumentType.NUMBER }
                    }
                },
                {
                    opcode: "movePlayerX",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "move player x [DX]",
                    arguments: {
                        DX: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: "jumpPlayer",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "jump player strength [POWER]",
                 arguments: {
                        POWER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 12
                        }
                    }
                },
                {
                    opcode: "cameraFollowPlayer",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "camera follow player"
                },
                {
                    opcode: "renderFrame",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "render frame"
                },
                "---",
                {
                    opcode: "playerX",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "player x"
                },
                {
                    opcode: "playerY",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "player y"
                }
            ]
        };
    }

    loadTiles(args, util) {
        const list = util.target.lookupVariableByNameAndType(args.LIST, "list");
        if (!list) return;

        const data = list.value;
        for (let i = 0; i < data.length; i += 17) {
            const id = data[i];
            if (!id) continue;
            this.tiles[id] = {
                costume:      id,
                numericID:    Number(data[i + 1]),
                name:         data[i + 2],
                liquid:       Number(data[i + 3]),
                animation:    Number(data[i + 4]),
                liquidHeight: Number(data[i + 5]),
                platform:     Number(data[i + 6]),
                connects:     Number(data[i + 7]),
                breakSound:   Number(data[i + 8]),
                breakTime:    Number(data[i + 9]),
                health:       Number(data[i + 10]),
                drop:         data[i + 11],
                damage:       Number(data[i + 12]),
                light:        Number(data[i + 13]),
                gravity:      Number(data[i + 14]),
                tool:         Number(data[i + 15]),
                tier:         Number(data[i + 16])
            };
        }
    }

    loadWorld(args, util) {
        const list = util.target.lookupVariableByNameAndType(args.LIST, "list");
        if (!list) return;

        this.world = {};
        for (const line of list.value) {
            const data = line.split(",");
            const x = Number(data[0]);
            const y = -Number(data[1]);
            this.world[`${x},${y}`] = {
                block: data[2],
                extra: data[3] || ""
            };
        }
    }

    setTileSprite(args) {
        this.tileSprite = args.SPRITE;
    }

    setPlayerSprite(args) {
        this.playerSprite = args.SPRITE;
    }

    setPlayerPosition(args) {
        this.player.x = Number(args.X);
        this.player.y = Number(args.Y);
    }

    cameraFollowPlayer() {
        this.camera.x = this.player.x - 240;
        this.camera.y = this.player.y - 180;
    }

    playerX() {
        return this.player.x;
    }

    playerY() {
        return this.player.y;
    }

    getConnectionMask(x, y, type) {
        const tile = this.tiles[type];
        if (!tile) return 0;
        if (tile.connects === 0) return 0;

        const connects = (other) => {
            if (!other) return false;
            const otherTile = this.tiles[other];
            if (!otherTile) return false;
            if (tile.connects === 1) return other === type;
            if (tile.connects === 2) return true;
            return false;
        };

        let mask = 0;
        if (connects(this.world[`${x},${y - 1}`]?.block)) mask += 1;
        if (connects(this.world[`${x + 1},${y}`]?.block)) mask += 2;
        if (connects(this.world[`${x},${y + 1}`]?.block)) mask += 4;
        if (connects(this.world[`${x - 1},${y}`]?.block)) mask += 8;
        return mask;
    }

   getTileCostume(x, y, type) {
    const tile = this.tiles[type];

    if (!tile) {
        return "error";
    }

    const mask = this.getConnectionMask(x, y, type);

    if (tile.animation > 0) {
        return tile.costume + mask + "_" + this.animationFrame;
    }

    return tile.costume + mask;
}

    updateAnimation() {
        this.animationTimer++;
        if (this.animationTimer >= 10) {
            this.animationTimer = 0;
            this.animationFrame++;
            if (this.animationFrame > 4) this.animationFrame = 1;
        }
    }

    renderFrame() {
this.updatePlayer();
        this._initRenderer();
        this.updateAnimation();

        const renderer = Scratch.renderer;
        const target = Scratch.vm.runtime.getSpriteTargetByName(this.tileSprite);
        if (!target) return;

        // Clear previous frame
        renderer.penClear(this.penSkinId);

        // Temporarily show the tile sprite so it can be stamped
        target.setVisible(true);

        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);

        for (let x = startX; x < startX + this.renderDistance; x++) {
            for (let y = startY; y < startY + this.renderDistance; y++) {
                const tile = this.world[`${x},${y}`];
                if (!tile) continue;

                // Pixel position on screen
                const screenX = x * this.tileSize - this.camera.x;
                const screenY = -y * this.tileSize - this.camera.y;

                // Convert to Scratch stage coordinates (center origin, y flipped)
                const scratchX = screenX - 240 + this.tileSize / 2;
                const scratchY = 180 - screenY - this.tileSize / 2;

                // Switch to correct costume
               let costumeName = this.getTileCostume(
    x,
    y,
    tile.block
);


let costumeIndex = target.sprite.costumes.findIndex(
    c => c.name === costumeName
);


// If costume does not exist, use error texture
if (costumeIndex < 0) {

    costumeIndex = target.sprite.costumes.findIndex(
        c => c.name === "error"
    );

}


// Only change costume if one exists
if (costumeIndex >= 0) {

    target.setCostume(costumeIndex);

}

                // Position and stamp directly onto the render layer
                target.setXY(scratchX, scratchY);
                renderer.penStamp(this.penSkinId, target.drawableID);
            }
        }

        // Hide the source sprite — only the stamped image stays visible
        target.setVisible(false);

const playerScreenX =
    this.player.x -
    this.camera.x;

const playerScreenY =
    this.player.y -
    this.camera.y;

const scratchX =
    playerScreenX - 240;

const scratchY =
    180 - playerScreenY;

renderer.penLine(
    this.penSkinId,
    scratchX - 10,
    scratchY,
    scratchX + 10,
    scratchY
);

        renderer.dirty = true;
    }
}

Scratch.extensions.register(new NogdenEngine());