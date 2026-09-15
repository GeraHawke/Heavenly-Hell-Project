class WaveManager {

    constructor(worldElement) {

        this.world =
            worldElement;

        this.currentWave = 0;

        this.waveActive = false;

        this.completed = false;

        this.waveDefinitions = [
            {
                enemies: [
                    "soldier",
                    "soldier",
                    "soldier",
                    "soldier",
                    "soldier"
                ]
            },
            {
                enemies: [
                    "soldier",
                    "soldier",
                    "soldier",
                    "soldier",
                    "soldier",
                    "soldierBlaster",
                    "gunner",
                    "gunner"
                ]
            }
        ];

        this.currentWaveEnemies = [];

        this.lastUpdateTime =
            performance.now();

        this.gameLoopStarted =
            false;

        this.nextWaveTimer = 0;

        this.spawnMinDistance = 400;
        this.spawnEnemyGap = 100;
    }

    start() {

        if (this.gameLoopStarted) {
            return;
        }

        this.gameLoopStarted =
            true;

        this.currentWave = 0;

        this.completed = false;

        this.waveActive = false;

        this.currentWaveEnemies = [];

        this.nextWaveTimer = 0;

        this.startCurrentWave();

        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );
    }

    startCurrentWave() {

        if (
            this.currentWave >=
            this.waveDefinitions.length
        ) {

            this.complete();

            return;
        }

        this.waveActive = true;

        this.nextWaveTimer = 0;

        this.currentWaveEnemies = [];

        const definition =
            this.waveDefinitions[
                this.currentWave
            ];

        for (
            const type of definition.enemies
        ) {

            const position =
                this.findSpawnPosition();

            let enemy = null;

            if (
                type === "soldier"
            ) {

                enemy =
                    new Soldier(
                        this.world,
                        position.x,
                        position.y
                    );
            }

            if (
                type === "soldierBlaster"
            ) {

                enemy =
                    new SoldierBlaster(
                        this.world,
                        position.x,
                        position.y
                    );
            }

            if (
                type === "gunner"
            ) {

                enemy =
                    new Gunner(
                        this.world,
                        position.x,
                        position.y
                    );
            }

            if (!enemy) {
                continue;
            }

            window.soldiers.push(
                enemy
            );

            this.currentWaveEnemies.push(
                enemy
            );

            enemy.start();
        }
    }

    findSpawnPosition() {

        const player =
            window.rojisima;

        if (!player) {

            return {
                x: 0,
                y: 0
            };
        }

        const radii = [
            450,
            525,
            600
        ];

        for (
            let attempt = 0;
            attempt < 60;
            attempt++
        ) {

            const radius =
                radii[
                    attempt %
                    radii.length
                ];

            const angle =
                (
                    attempt *
                    137.5
                ) *
                Math.PI /
                180;

            const x =
                player.x +
                Math.cos(angle) *
                radius;

            const y =
                player.y +
                Math.sin(angle) *
                radius;

            if (
                this.positionBlocked(
                    x,
                    y
                )
            ) {
                continue;
            }

            if (
                this.tooCloseToPlayer(
                    x,
                    y,
                    player
                )
            ) {
                continue;
            }

            if (
                this.tooCloseToWaveEnemy(
                    x,
                    y
                )
            ) {
                continue;
            }

            return {
                x,
                y
            };
        }

        return {
            x:
                player.x + 450,
            y:
                player.y
        };
    }

    tooCloseToPlayer(
        x,
        y,
        player
    ) {

        const dx =
            x - player.x;

        const dy =
            y - player.y;

        return (
            dx * dx +
            dy * dy <
            this.spawnMinDistance *
            this.spawnMinDistance
        );
    }

    tooCloseToWaveEnemy(
        x,
        y
    ) {

        const minimumGap =
            this.spawnEnemyGap;

        const minimumGapSquared =
            minimumGap *
            minimumGap;

        for (
            const enemy of
                this.currentWaveEnemies
        ) {

            if (
                !enemy ||
                enemy.isDead
            ) {
                continue;
            }

            const dx =
                x - enemy.x;

            const dy =
                y - enemy.y;

            if (
                dx * dx +
                dy * dy <
                minimumGapSquared
            ) {
                return true;
            }
        }

        return false;
    }

    positionBlocked(
        centerX,
        centerY
    ) {

        const coverBlocks =
            window.coverBlocks;

        if (!coverBlocks) {
            return false;
        }

        const gridSize =
            window.GRID_SIZE || 50;

        const halfWidth = 22;
        const halfHeight = 29;

        const left =
            centerX -
            halfWidth;

        const right =
            centerX +
            halfWidth;

        const top =
            centerY -
            halfHeight;

        const bottom =
            centerY +
            halfHeight;

        for (
            const block of coverBlocks
        ) {

            for (
                const cell of block.cells
            ) {

                const cellLeft =
                    block.x +
                    cell[0] *
                    gridSize;

                const cellTop =
                    block.y +
                    cell[1] *
                    gridSize;

                const cellRight =
                    cellLeft +
                    gridSize;

                const cellBottom =
                    cellTop +
                    gridSize;

                if (
                    right > cellLeft &&
                    left < cellRight &&
                    bottom > cellTop &&
                    top < cellBottom
                ) {

                    return true;
                }
            }
        }

        return false;
    }

    update(deltaTime) {

        if (
            this.completed ||
            !this.waveActive
        ) {
            return;
        }

        const livingEnemies =
            this.currentWaveEnemies.filter(
                (enemy) =>
                    enemy &&
                    !enemy.isDead
            );

        if (
            livingEnemies.length > 0
        ) {
            return;
        }

        this.waveActive = false;

        this.currentWave++;

        if (
            this.currentWave >=
            this.waveDefinitions.length
        ) {

            this.complete();

            return;
        }

        this.nextWaveTimer = 1;
    }

    complete() {

        this.completed = true;

        this.waveActive = false;

        this.currentWaveEnemies = [];
    }

    gameLoop(currentTime) {

        const deltaTime =
            Math.min(
                (
                    currentTime -
                    this.lastUpdateTime
                ) / 1000,
                0.05
            );

        this.lastUpdateTime =
            currentTime;

        if (window.gameOver) {

            requestAnimationFrame(
                (time) =>
                    this.gameLoop(time)
            );

            return;
        }

        if (
            this.nextWaveTimer > 0
        ) {

            this.nextWaveTimer -=
                deltaTime;

            if (
                this.nextWaveTimer <= 0 &&
                !this.completed
            ) {

                this.startCurrentWave();
            }
        }

        this.update(
            deltaTime
        );

        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );
    }
}


window.WaveManager =
    WaveManager;