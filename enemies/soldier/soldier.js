class Soldier {

    constructor(worldElement, x, y) {

        this.world = worldElement;

        this.x = x;
        this.y = y;

        this.width = 44;
        this.height = 58;

        this.speed = 105;

        this.health = 40;
        this.maxHealth = 40;

        this.attackRange = 75;

        this.attackCooldown = 0;
        this.attackCooldownDuration = 0.8;

        this.comboStep = 0;
        this.comboTimer = 0;
        this.comboWindow = 0.45;
        this.comboActive = false;

        this.isDead = false;

        this.color = "#111C20";
        this.borderColor = "#E8E6E3";

        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackTimer = 0;

        this.dashTimer = 0;
        this.dashDuration = 0;
        this.dashX = 0;
        this.dashY = 0;
        this.dashSpeed = 480;
        this.dashCooldown = 0;
        this.dashCooldownDuration = 1.5;

        this.dodgeTimer = 0;
        this.dodgeDuration = 0;
        this.dodgeX = 0;
        this.dodgeY = 0;
        this.dodgeSpeed = 300;
        this.dodgeCooldown = 0;
        this.dodgeCooldownDuration = 0.32;

        this.path = [];
        this.pathIndex = 0;
        this.pathTimer = 0;
        this.pathUpdateInterval = 0.25;
        this.repathRequested = true;
        this.pathRecoveryTimer = 0;

        this.lastTime = performance.now();
        this.lastX = this.x;
        this.lastY = this.y;
        this.stuckTimer = 0;

        this.element =
            document.createElement("div");

        this.element.className = "soldier";
        this.element.style.position = "absolute";
        this.element.style.width =
            `${this.width}px`;
        this.element.style.height =
            `${this.height}px`;
        this.element.style.background =
            this.color;
        this.element.style.border =
            `3px solid ${this.borderColor}`;
        this.element.style.borderRadius =
            "50%";
        this.element.style.boxShadow =
            "0 8px 0 rgba(17, 28, 32, 0.18)";
        this.element.style.transform =
            "translate(-50%, -50%)";
        this.element.style.zIndex = "3";

        this.world.appendChild(
            this.element
        );

        this.sword =
            document.createElement("div");

        this.sword.style.position = "absolute";
        this.sword.style.width = "72px";
        this.sword.style.height = "6px";
        this.sword.style.background = "#E8E6E3";
        this.sword.style.border =
            "2px solid #401818";
        this.sword.style.borderRadius = "999px";
        this.sword.style.left = "50%";
        this.sword.style.top = "50%";
        this.sword.style.transformOrigin = "0 50%";
        this.sword.style.display = "none";
        this.sword.style.zIndex = "4";

        this.element.appendChild(
            this.sword
        );
    }

    start() {

        this.lastTime =
            performance.now();

        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );
    }

    gameLoop(currentTime) {

        if (this.isDead) {
            return;
        }

        const deltaTime =
            Math.min(
                (currentTime - this.lastTime) / 1000,
                0.05
            );

        this.lastTime = currentTime;

        if (window.gameOver) {

            this.updatePosition();

            requestAnimationFrame(
                (time) =>
                    this.gameLoop(time)
            );

            return;
        }

        this.updateCooldowns(deltaTime);
        this.updateKnockback(deltaTime);

        if (this.knockbackTimer <= 0) {

            if (this.dashTimer > 0) {

                this.updateDash(deltaTime);

            } else if (this.dodgeTimer > 0) {

                this.updateDodge(deltaTime);

            } else {

                this.updateAI(deltaTime);
            }
        }

        this.updatePosition();

        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );
    }

    updateCooldowns(deltaTime) {

        this.attackCooldown =
            Math.max(
                0,
                this.attackCooldown - deltaTime
            );

        this.dashCooldown =
            Math.max(
                0,
                this.dashCooldown - deltaTime
            );

        this.dodgeCooldown =
            Math.max(
                0,
                this.dodgeCooldown - deltaTime
            );

        this.pathTimer =
            Math.max(
                0,
                this.pathTimer - deltaTime
            );

        this.pathRecoveryTimer =
            Math.max(
                0,
                this.pathRecoveryTimer - deltaTime
            );

        this.comboTimer =
            Math.max(
                0,
                this.comboTimer - deltaTime
            );

        if (
            this.comboTimer <= 0 &&
            !this.comboActive
        ) {
            this.comboStep = 0;
        }
    }

    updateAI(deltaTime) {

        const player =
            window.rojisima;

        if (!player || player.isDead) {
            return;
        }

        const heavenlyHell =
            window.heavenlyHell;

        if (heavenlyHell) {

            const decision =
                heavenlyHell.getMovementDecision(
                    this,
                    player
                );

            if (decision) {

                if (decision.dash) {

                    this.startDash(
                        decision.x,
                        decision.y
                    );

                    return;
                }

                if (decision.dodge) {

                    this.startDodge(
                        decision.x,
                        decision.y
                    );

                    return;
                }

                if (
                    typeof decision.x === "number" &&
                    typeof decision.y === "number"
                ) {

                    this.moveDirection(
                        decision.x,
                        decision.y,
                        deltaTime
                    );

                    return;
                }
            }
        }

        const dx =
            player.x - this.x;

        const dy =
            player.y - this.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <= this.attackRange
        ) {

            this.attack();

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

    getBasicMovement(player) {

        const dx =
            player.x - this.x;

        const dy =
            player.y - this.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance <= 0.001) {
            return null;
        }

        const directionX =
            dx / distance;

        const directionY =
            dy / distance;

        const nextX =
            this.x +
            directionX *
            this.speed *
            0.05;

        const nextY =
            this.y +
            directionY *
            this.speed *
            0.05;

        if (
            !this.collidesWithCover(
                nextX,
                nextY
            )
        ) {

            return {
                x: directionX,
                y: directionY
            };
        }

        const perpendicularA = {
            x: -directionY,
            y: directionX
        };

        const perpendicularB = {
            x: directionY,
            y: -directionX
        };

        if (
            !this.collidesWithCover(
                this.x +
                perpendicularA.x *
                this.speed *
                0.05,
                this.y +
                perpendicularA.y *
                this.speed *
                0.05
            )
        ) {

            return perpendicularA;
        }

        if (
            !this.collidesWithCover(
                this.x +
                perpendicularB.x *
                this.speed *
                0.05,
                this.y +
                perpendicularB.y *
                this.speed *
                0.05
            )
        ) {

            return perpendicularB;
        }

        return {
            x: -directionX,
            y: -directionY
        };
    }

    moveDirection(
        directionX,
        directionY,
        deltaTime
    ) {

        const length =
            Math.sqrt(
                directionX * directionX +
                directionY * directionY
            );

        if (length <= 0.001) {
            return;
        }

        directionX /= length;
        directionY /= length;

        const distance =
            this.speed *
            deltaTime;

        const nextX =
            this.x +
            directionX *
            distance;

        const nextY =
            this.y +
            directionY *
            distance;

        let moved = false;

        if (
            !this.collidesWithCover(
                nextX,
                this.y
            )
        ) {

            this.x = nextX;
            moved = true;
        }

        if (
            !this.collidesWithCover(
                this.x,
                nextY
            )
        ) {

            this.y = nextY;
            moved = true;
        }

        if (!moved) {
            this.repathRequested = true;
        }
    }

    attack() {

        if (
            this.attackCooldown > 0 ||
            this.isDead
        ) {
            return;
        }

        const player =
            window.rojisima;

        if (!player || player.isDead) {
            return;
        }

        const dx =
            player.x - this.x;

        const dy =
            player.y - this.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance >
            this.attackRange + 10
        ) {
            return;
        }

        if (
            this.comboTimer > 0 &&
            this.comboStep < 3
        ) {
            this.comboStep++;
        } else {
            this.comboStep = 1;
        }

        this.comboTimer =
            this.comboWindow;

        this.attackCooldown =
            this.attackCooldownDuration;

        const angle =
            Math.atan2(dy, dx) *
            180 /
            Math.PI;

        this.sword.style.display =
            "block";

        this.sword.style.transform =
            `rotate(${angle}deg)`;

        if (this.comboStep === 1) {

            player.takeDamage(6);

            this.comboActive = true;

            setTimeout(() => {

                if (!this.isDead) {
                    this.sword.style.display =
                        "none";
                }

            }, 100);

        } else if (this.comboStep === 2) {

            player.takeDamage(6);

            setTimeout(() => {

                if (!this.isDead) {
                    this.sword.style.display =
                        "none";
                }

            }, 100);

        } else {

            player.takeDamage(12);

            this.comboStep = 0;
            this.comboTimer = 0;

            setTimeout(() => {

                if (!this.isDead) {
                    this.sword.style.display =
                        "none";
                    this.comboActive = false;
                }

            }, 140);
        }
    }

    startDash(
        directionX,
        directionY
    ) {

        if (
            this.dashCooldown > 0 ||
            this.isDead
        ) {
            return;
        }

        const length =
            Math.sqrt(
                directionX * directionX +
                directionY * directionY
            );

        if (length <= 0.001) {
            return;
        }

        this.dashX =
            directionX / length;

        this.dashY =
            directionY / length;

        this.dashTimer =
            0.15;

        this.dashDuration =
            0.15;

        this.dashCooldown =
            this.dashCooldownDuration;

        this.pathRecoveryTimer =
            0.12;
    }

    updateDash(deltaTime) {

        const distance =
            this.dashSpeed *
            deltaTime;

        const nextX =
            this.x +
            this.dashX *
            distance;

        const nextY =
            this.y +
            this.dashY *
            distance;

        if (
            !this.collidesWithCover(
                nextX,
                this.y
            )
        ) {

            this.x = nextX;
        }

        if (
            !this.collidesWithCover(
                this.x,
                nextY
            )
        ) {

            this.y = nextY;
        }

        this.dashTimer -=
            deltaTime;

        if (
            this.dashTimer <= 0
        ) {

            this.dashTimer = 0;
            this.repathRequested = true;
        }
    }

    startDodge(
        directionX,
        directionY
    ) {

        if (
            this.dodgeCooldown > 0 ||
            this.isDead
        ) {
            return;
        }

        const length =
            Math.sqrt(
                directionX * directionX +
                directionY * directionY
            );

        if (length <= 0.001) {
            return;
        }

        this.dodgeX =
            directionX / length;

        this.dodgeY =
            directionY / length;

        this.dodgeDuration =
            0.16;

        this.dodgeTimer =
            this.dodgeDuration;

        this.dodgeCooldown =
            this.dodgeCooldownDuration;

        this.pathRecoveryTimer =
            0.18;
    }

    updateDodge(deltaTime) {

        const distance =
            this.dodgeSpeed *
            deltaTime;

        const nextX =
            this.x +
            this.dodgeX *
            distance;

        const nextY =
            this.y +
            this.dodgeY *
            distance;

        if (
            !this.collidesWithCover(
                nextX,
                this.y
            )
        ) {

            this.x = nextX;
        }

        if (
            !this.collidesWithCover(
                this.x,
                nextY
            )
        ) {

            this.y = nextY;
        }

        this.dodgeTimer -=
            deltaTime;

        if (
            this.dodgeTimer <= 0
        ) {

            this.dodgeTimer = 0;
            this.repathRequested = true;
        }
    }

    updateKnockback(deltaTime) {

        if (
            this.knockbackTimer <= 0
        ) {
            return;
        }

        const nextX =
            this.x +
            this.knockbackX *
            deltaTime;

        const nextY =
            this.y +
            this.knockbackY *
            deltaTime;

        if (
            !this.collidesWithCover(
                nextX,
                this.y
            )
        ) {

            this.x = nextX;
        }

        if (
            !this.collidesWithCover(
                this.x,
                nextY
            )
        ) {

            this.y = nextY;
        }

        this.knockbackTimer -=
            deltaTime;

        this.knockbackX *=
            Math.pow(
                0.08,
                deltaTime
            );

        this.knockbackY *=
            Math.pow(
                0.08,
                deltaTime
            );
    }

    applyKnockback(
        directionX,
        directionY,
        strength
    ) {

        const length =
            Math.sqrt(
                directionX * directionX +
                directionY * directionY
            );

        if (length <= 0.001) {
            return;
        }

        this.knockbackX =
            directionX /
            length *
            strength;

        this.knockbackY =
            directionY /
            length *
            strength;

        this.knockbackTimer =
            0.12;
    }

    collidesWithCover(
        centerX,
        centerY,
        radius = 0
    ) {

        const coverBlocks =
            window.coverBlocks;

        if (!coverBlocks) {
            return false;
        }

        const gridSize =
            window.GRID_SIZE || 50;

        const halfWidth =
            this.width / 2 +
            radius;

        const halfHeight =
            this.height / 2 +
            radius;

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

    updatePosition() {

        this.element.style.left =
            `${this.x}px`;

        this.element.style.top =
            `${this.y}px`;
    }

    takeDamage(amount) {

        if (this.isDead) {
            return;
        }

        this.health -= amount;

        if (
            this.health <= 0
        ) {

            this.health = 0;
            this.onDeath();
        }
    }

    onDeath() {

        if (this.isDead) {
            return;
        }

        this.isDead = true;

        this.sword.style.display =
            "none";

        this.element.style.opacity =
            "0";

        const index =
            window.soldiers
                ? window.soldiers.indexOf(this)
                : -1;

        if (index !== -1) {

            window.soldiers.splice(
                index,
                1
            );
        }

        setTimeout(() => {

            this.element.remove();

        }, 250);
    }
}


class SoldierBlaster extends Soldier {

    constructor(
        worldElement,
        x,
        y
    ) {

        super(
            worldElement,
            x,
            y
        );

        this.isBlasterCounter =
            true;

        this.dashSpeed = 500;
        this.dashDuration = 0.15;
        this.dashCooldownDuration = 1.1;
    }
}


window.Soldier =
    Soldier;

window.SoldierBlaster =
    SoldierBlaster;