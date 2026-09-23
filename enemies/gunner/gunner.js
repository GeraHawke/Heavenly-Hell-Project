class Gunner extends Soldier {

    constructor(worldElement, x, y) {
        super(worldElement, x, y);

        this.sword.style.display = "none";

        this.preferredDistance = 420;
        this.minimumDistance = 270;
        this.maximumDistance = 560;

        this.shootCooldown = 0;
        this.shootCooldownDuration = 0.55;

        this.projectiles = [];

        this.aiTimer = 0;
        this.aiUpdateInterval = 0.05;

        this.lineOfSightCache = false;
        this.lineOfSightTimer = 0;
        this.lineOfSightInterval = 0.08;

        this.shootingPosition = null;
        this.shootingPositionTimer = 0;
        this.shootingPositionInterval = 0.25;

        this.lastPlayerX = null;
        this.lastPlayerY = null;
    }

    gameLoop(currentTime) {
        if (this.isDead) {
            return;
        }

        const deltaTime = Math.min(
            (currentTime - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = currentTime;

        if (window.gameOver) {
            this.updatePosition();

            requestAnimationFrame(
                (time) => this.gameLoop(time)
            );

            return;
        }

        this.updateCooldowns(deltaTime);

        this.shootCooldown = Math.max(
            0,
            this.shootCooldown - deltaTime
        );

        this.aiTimer = Math.max(
            0,
            this.aiTimer - deltaTime
        );

        this.lineOfSightTimer = Math.max(
            0,
            this.lineOfSightTimer - deltaTime
        );

        this.shootingPositionTimer = Math.max(
            0,
            this.shootingPositionTimer - deltaTime
        );

        this.updateKnockback(deltaTime);

        if (this.knockbackTimer <= 0) {
            if (this.dashTimer > 0) {
                this.updateDash(deltaTime);
            } else if (this.dodgeTimer > 0) {
                this.updateDodge(deltaTime);
            } else if (this.aiTimer <= 0) {
                this.aiTimer = this.aiUpdateInterval;
                this.updateAI(deltaTime);
            }
        }

        this.updateGunnerProjectiles(deltaTime);
        this.updatePosition();

        requestAnimationFrame(
            (time) => this.gameLoop(time)
        );
    }

    updateAI(deltaTime) {
        const player = window.rojisima;

        if (!player || player.isDead) {
            return;
        }

        const dx =
            player.x - this.x;

        const dy =
            player.y - this.y;

        const distance =
            Math.hypot(dx, dy);

        const heavenlyHell =
            window.heavenlyHell;

        if (heavenlyHell) {
            const dodge =
                heavenlyHell.getProjectileDodge(
                    this,
                    player
                );

            if (dodge) {
                if (dodge.dash) {
                    this.startDash(
                        dodge.x,
                        dodge.y
                    );
                } else {
                    this.startDodge(
                        dodge.x,
                        dodge.y
                    );
                }

                return;
            }
        }

        const hasLineOfSight =
            this.getCachedLineOfSight(
                player
            );

        if (hasLineOfSight) {
            this.shootingPosition = null;
            this.shootingPositionTimer = 0;

            if (
                this.shootCooldown <= 0
            ) {
                this.fire();
            }

            if (
                distance <
                this.minimumDistance
            ) {
                const target =
                    this.getRetreatTarget(
                        player
                    );

                this.moveToTarget(
                    target,
                    deltaTime
                );

                return;
            }

            if (
                distance >
                this.maximumDistance
            ) {
                const target =
                    this.getApproachTarget(
                        player
                    );

                this.moveToTarget(
                    target,
                    deltaTime
                );

                return;
            }

            return;
        }

        if (
            this.shootingPositionTimer <= 0 ||
            !this.shootingPosition
        ) {
            this.shootingPosition =
                this.findShootingPosition(
                    player
                );

            this.shootingPositionTimer =
                this.shootingPositionInterval;
        }

        if (this.shootingPosition) {
            this.moveToTarget(
                this.shootingPosition,
                deltaTime
            );

            return;
        }

        const direction =
            this.getBasicMovement(
                player
            );

        if (direction) {
            this.moveDirection(
                direction.x,
                direction.y,
                deltaTime
            );
        }
    }

    getCachedLineOfSight(player) {
        const playerMoved =
            this.lastPlayerX === null ||
            Math.abs(
                player.x -
                this.lastPlayerX
            ) > 20 ||
            Math.abs(
                player.y -
                this.lastPlayerY
            ) > 20;

        if (
            this.lineOfSightTimer <= 0 ||
            playerMoved
        ) {
            this.lineOfSightCache =
                this.hasLineOfSight(
                    player
                );

            this.lineOfSightTimer =
                this.lineOfSightInterval;

            this.lastPlayerX =
                player.x;

            this.lastPlayerY =
                player.y;
        }

        return this.lineOfSightCache;
    }

    moveToTarget(target, deltaTime) {
        if (!target) {
            return;
        }

        const dx =
            target.x - this.x;

        const dy =
            target.y - this.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance < 8) {
            return;
        }

        this.moveDirection(
            dx / distance,
            dy / distance,
            deltaTime
        );
    }

    getRetreatTarget(player) {
        const dx =
            this.x - player.x;

        const dy =
            this.y - player.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance <= 0.001) {
            return {
                x: this.x + 100,
                y: this.y
            };
        }

        return {
            x:
                player.x +
                (dx / distance) *
                this.preferredDistance,

            y:
                player.y +
                (dy / distance) *
                this.preferredDistance
        };
    }

    getApproachTarget(player) {
        const dx =
            this.x - player.x;

        const dy =
            this.y - player.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance <= 0.001) {
            return {
                x:
                    player.x +
                    this.preferredDistance,

                y:
                    player.y
            };
        }

        return {
            x:
                player.x +
                (dx / distance) *
                this.preferredDistance,

            y:
                player.y +
                (dy / distance) *
                this.preferredDistance
        };
    }

    findShootingPosition(player) {
        const radii = [
            this.preferredDistance,
            360,
            480,
            520
        ];

        const angleCount = 16;

        for (
            const radius of radii
        ) {
            for (
                let i = 0;
                i < angleCount;
                i++
            ) {
                const angle =
                    (Math.PI * 2 * i) /
                    angleCount;

                const x =
                    player.x +
                    Math.cos(angle) *
                    radius;

                const y =
                    player.y +
                    Math.sin(angle) *
                    radius;

                if (
                    this.collidesWithCover(
                        x,
                        y
                    )
                ) {
                    continue;
                }

                if (
                    this.hasLineOfSightFrom(
                        x,
                        y,
                        player
                    )
                ) {
                    return {
                        x,
                        y
                    };
                }
            }
        }

        return null;
    }

    hasLineOfSight(player) {
        return this.hasLineOfSightFrom(
            this.x,
            this.y,
            player
        );
    }

    hasLineOfSightFrom(
        startX,
        startY,
        player
    ) {
        const endX =
            player.x;

        const endY =
            player.y;

        const coverBlocks =
            window.coverBlocks;

        if (!coverBlocks) {
            return true;
        }

        const gridSize =
            window.GRID_SIZE || 50;

        for (
            const block of coverBlocks
        ) {
            for (
                const cell of block.cells
            ) {
                const left =
                    block.x +
                    cell[0] *
                    gridSize;

                const top =
                    block.y +
                    cell[1] *
                    gridSize;

                const right =
                    left + gridSize;

                const bottom =
                    top + gridSize;

                if (
                    this.lineIntersectsRect(
                        startX,
                        startY,
                        endX,
                        endY,
                        left,
                        top,
                        right,
                        bottom
                    )
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    lineIntersectsRect(
        x1,
        y1,
        x2,
        y2,
        left,
        top,
        right,
        bottom
    ) {
        const dx =
            x2 - x1;

        const dy =
            y2 - y1;

        let tMin = 0;
        let tMax = 1;

        if (
            Math.abs(dx) <
            0.00001
        ) {
            if (
                x1 < left ||
                x1 > right
            ) {
                return false;
            }
        } else {
            const tx1 =
                (left - x1) / dx;

            const tx2 =
                (right - x1) / dx;

            tMin =
                Math.max(
                    tMin,
                    Math.min(
                        tx1,
                        tx2
                    )
                );

            tMax =
                Math.min(
                    tMax,
                    Math.max(
                        tx1,
                        tx2
                    )
                );

            if (tMin > tMax) {
                return false;
            }
        }

        if (
            Math.abs(dy) <
            0.00001
        ) {
            if (
                y1 < top ||
                y1 > bottom
            ) {
                return false;
            }
        } else {
            const ty1 =
                (top - y1) / dy;

            const ty2 =
                (bottom - y1) / dy;

            tMin =
                Math.max(
                    tMin,
                    Math.min(
                        ty1,
                        ty2
                    )
                );

            tMax =
                Math.min(
                    tMax,
                    Math.max(
                        ty1,
                        ty2
                    )
                );

            if (tMin > tMax) {
                return false;
            }
        }

        return true;
    }

    fire() {
        const player =
            window.rojisima;

        if (
            !player ||
            player.isDead
        ) {
            return;
        }

        const dx =
            player.x - this.x;

        const dy =
            player.y - this.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance <= 0.001) {
            return;
        }

        const directionX =
            dx / distance;

        const directionY =
            dy / distance;

        const projectile = {
            x: this.x,
            y: this.y,

            vx:
                directionX *
                900,

            vy:
                directionY *
                900,

            radius: 5,
            damage: 8,
            life: 1.5,

            element:
                document.createElement("div")
        };

        projectile.element.style.position =
            "absolute";

        projectile.element.style.width =
            `${projectile.radius * 2}px`;

        projectile.element.style.height =
            `${projectile.radius * 2}px`;

        projectile.element.style.borderRadius =
            "50%";

        projectile.element.style.background =
            "#E8E6E3";

        projectile.element.style.border =
            "2px solid #401818";

        projectile.element.style.transform =
            "translate(-50%, -50%)";

        projectile.element.style.zIndex =
            "5";

        this.world.appendChild(
            projectile.element
        );

        this.projectiles.push(
            projectile
        );

        this.shootCooldown =
            this.shootCooldownDuration;
    }

    updateGunnerProjectiles(
        deltaTime
    ) {
        for (
            let i =
                this.projectiles.length - 1;
            i >= 0;
            i--
        ) {
            const projectile =
                this.projectiles[i];

            projectile.life -=
                deltaTime;

            const nextX =
                projectile.x +
                projectile.vx *
                deltaTime;

            const nextY =
                projectile.y +
                projectile.vy *
                deltaTime;

            if (
                projectile.life <= 0 ||
                this.projectileCollidesWithCover(
                    nextX,
                    nextY,
                    projectile.radius
                )
            ) {
                projectile.element.remove();

                this.projectiles.splice(
                    i,
                    1
                );

                continue;
            }

            projectile.x =
                nextX;

            projectile.y =
                nextY;

            const player =
                window.rojisima;

            if (
                player &&
                !player.isDead
            ) {
                const dx =
                    player.x -
                    projectile.x;

                const dy =
                    player.y -
                    projectile.y;

                const distance =
                    Math.hypot(
                        dx,
                        dy
                    );

                if (
                    distance <=
                    projectile.radius +
                    Math.max(
                        player.width,
                        player.height
                    ) / 2
                ) {
                    player.takeDamage(
                        projectile.damage
                    );

                    projectile.element.remove();

                    this.projectiles.splice(
                        i,
                        1
                    );

                    continue;
                }
            }

            projectile.element.style.left =
                `${projectile.x}px`;

            projectile.element.style.top =
                `${projectile.y}px`;
        }
    }

    projectileCollidesWithCover(
        x,
        y,
        radius
    ) {
        const coverBlocks =
            window.coverBlocks;

        if (!coverBlocks) {
            return false;
        }

        const gridSize =
            window.GRID_SIZE || 50;

        for (
            const block of coverBlocks
        ) {
            for (
                const cell of block.cells
            ) {
                const left =
                    block.x +
                    cell[0] *
                    gridSize;

                const top =
                    block.y +
                    cell[1] *
                    gridSize;

                const right =
                    left + gridSize;

                const bottom =
                    top + gridSize;

                const closestX =
                    Math.max(
                        left,
                        Math.min(
                            x,
                            right
                        )
                    );

                const closestY =
                    Math.max(
                        top,
                        Math.min(
                            y,
                            bottom
                        )
                    );

                const dx =
                    x - closestX;

                const dy =
                    y - closestY;

                if (
                    dx * dx +
                    dy * dy <=
                    radius * radius
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    onDeath() {
        for (
            const projectile of
                this.projectiles
        ) {
            projectile.element.remove();
        }

        this.projectiles.length = 0;

        super.onDeath();
    }
}


window.Gunner =
    Gunner;