class Rojisima {

    constructor(worldElement) {
        this.world = worldElement;
        this.width = 48;
        this.height = 64;
        this.color = "#D61F3A";
        this.borderColor = "#111C20";
        this.speed = 250;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.isDead = false;

        this.x = 0;
        this.y = 0;

        this.facingX = 1;
        this.facingY = 0;

        this.attackState = null;
        this.attackTimer = 0;
        this.attackHit = false;
        this.attackFacingX = 1;
        this.attackFacingY = 0;
        this.attackSpeed = 0.75;

        this.weapon = "spear";

        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        this.projectiles = [];
        this.blasterCooldown = 0;
        this.blasterCooldownDuration = 0;

        this.element = document.createElement("div");
        this.element.className = "player";
        this.element.setAttribute("aria-label", "Rojísima");
        this.element.style.position = "absolute";
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.background = this.color;
        this.element.style.border = `3px solid ${this.borderColor}`;
        this.element.style.borderRadius = "50%";
        this.element.style.boxShadow =
            "0 8px 0 rgba(17, 28, 32, 0.15)";
        this.element.style.transform =
            "translate(-50%, -50%)";
        this.element.style.zIndex = "3";

        this.healthBar = document.createElement("div");
        this.healthBar.className = "player-health";
        this.healthBar.style.position = "absolute";
        this.healthBar.style.width = "58px";
        this.healthBar.style.height = "7px";
        this.healthBar.style.left = "50%";
        this.healthBar.style.top = "-14px";
        this.healthBar.style.transform =
            "translateX(-50%)";
        this.healthBar.style.background = "#111C20";
        this.healthBar.style.border = "1px solid #E8E6E3";
        this.healthBar.style.borderRadius = "4px";
        this.healthBar.style.overflow = "hidden";

        this.healthFill = document.createElement("div");
        this.healthFill.className = "player-health-fill";
        this.healthFill.style.width = "100%";
        this.healthFill.style.height = "100%";
        this.healthFill.style.background = "#D61F3A";
        this.healthFill.style.transition =
            "width 0.15s ease";

        this.healthBar.appendChild(this.healthFill);
        this.element.appendChild(this.healthBar);

        this.createSpear();
        this.createReticle();
        this.createWeaponMenu();

        this.world.appendChild(this.element);

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.isMoving = false;
        this.bobTime = 0;
        this.bobHeight = 3;
        this.bobSpeed = 12;

        this.lastTime = performance.now();

        this.setupInput();
        this.updatePosition();
        this.updateHealthBar();

        requestAnimationFrame(
            (time) => this.gameLoop(time)
        );
    }

    createSpear() {
        this.spear = document.createElement("div");
        this.spear.style.position = "absolute";
        this.spear.style.width = "90px";
        this.spear.style.height = "5px";
        this.spear.style.left = "50%";
        this.spear.style.top = "50%";
        this.spear.style.background = "#E8E6E3";
        this.spear.style.border = "2px solid #111C20";
        this.spear.style.borderRadius = "999px";
        this.spear.style.transformOrigin = "0 50%";
        this.spear.style.transform =
            "translateY(-50%) rotate(0deg)";
        this.spear.style.display = "none";
        this.spear.style.zIndex = "4";

        this.element.appendChild(this.spear);
    }

    createReticle() {
        this.reticle = document.createElement("div");
        this.reticle.style.position = "fixed";
        this.reticle.style.width = "14px";
        this.reticle.style.height = "14px";
        this.reticle.style.border = "2px solid #E8E6E3";
        this.reticle.style.borderRadius = "50%";
        this.reticle.style.transform =
            "translate(-50%, -50%)";
        this.reticle.style.pointerEvents = "none";
        this.reticle.style.zIndex = "9999";
        this.reticle.style.boxSizing = "border-box";

        document.body.appendChild(this.reticle);

        this.updateReticle();
    }

    createWeaponMenu() {
        this.weaponMenu = document.createElement("div");
        this.weaponMenu.style.position = "fixed";
        this.weaponMenu.style.left = "50%";
        this.weaponMenu.style.bottom = "24px";
        this.weaponMenu.style.transform =
            "translateX(-50%)";
        this.weaponMenu.style.display = "flex";
        this.weaponMenu.style.gap = "8px";
        this.weaponMenu.style.zIndex = "9998";
        this.weaponMenu.style.pointerEvents = "auto";

        this.spearButton = this.createWeaponButton(
            "1  SPEAR",
            "spear"
        );

        this.blasterButton = this.createWeaponButton(
            "2  BLASTER",
            "blaster"
        );

        this.weaponMenu.appendChild(this.spearButton);
        this.weaponMenu.appendChild(this.blasterButton);

        document.body.appendChild(this.weaponMenu);

        this.updateWeaponMenu();
    }

    createWeaponButton(label, weapon) {
        const button = document.createElement("button");

        button.textContent = label;
        button.style.padding = "8px 14px";
        button.style.background = "#111C20";
        button.style.color = "#E8E6E3";
        button.style.border = "2px solid #E8E6E3";
        button.style.fontFamily = "Arial, sans-serif";
        button.style.fontWeight = "bold";
        button.style.cursor = "pointer";

        button.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                this.setWeapon(weapon);
            }
        );

        return button;
    }

    updateWeaponMenu() {
        this.spearButton.style.opacity =
            this.weapon === "spear" ? "1" : "0.45";

        this.blasterButton.style.opacity =
            this.weapon === "blaster" ? "1" : "0.45";
    }

    setWeapon(weapon) {
        if (
            weapon !== "spear" &&
            weapon !== "blaster"
        ) {
            return;
        }

        this.weapon = weapon;
        this.attackState = null;
        this.attackHit = false;
        this.spear.style.display = "none";

        this.updateWeaponMenu();
    }

    setupInput() {
        window.addEventListener(
            "keydown",
            (event) => {
                if (this.isDead) {
                    return;
                }

                switch (event.key.toLowerCase()) {
                    case "w":
                    case "arrowup":
                        this.keys.up = true;
                        event.preventDefault();
                        break;

                    case "s":
                    case "arrowdown":
                        this.keys.down = true;
                        event.preventDefault();
                        break;

                    case "a":
                    case "arrowleft":
                        this.keys.left = true;
                        event.preventDefault();
                        break;

                    case "d":
                    case "arrowright":
                        this.keys.right = true;
                        event.preventDefault();
                        break;

                    case "j":
                        if (this.weapon === "spear") {
                            this.startAttack("slash");
                        }
                        break;

                    case "k":
                        if (this.weapon === "spear") {
                            this.startAttack("thrust");
                        }
                        break;

                    case "1":
                        this.setWeapon("spear");
                        break;

                    case "2":
                        this.setWeapon("blaster");
                        break;
                }
            }
        );

        window.addEventListener(
            "keyup",
            (event) => {
                switch (event.key.toLowerCase()) {
                    case "w":
                    case "arrowup":
                        this.keys.up = false;
                        break;

                    case "s":
                    case "arrowdown":
                        this.keys.down = false;
                        break;

                    case "a":
                    case "arrowleft":
                        this.keys.left = false;
                        break;

                    case "d":
                    case "arrowright":
                        this.keys.right = false;
                        break;
                }
            }
        );

        window.addEventListener(
            "mousemove",
            (event) => {
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
                this.updateReticle();
            }
        );

        window.addEventListener(
            "mousedown",
            (event) => {
                if (
                    this.isDead ||
                    window.gameOver
                ) {
                    return;
                }

                if (
                    event.target.closest &&
                    event.target.closest("button")
                ) {
                    return;
                }

                if (event.button === 0) {
                    this.primaryAttack();
                }

                if (event.button === 2) {
                    event.preventDefault();
                    this.secondaryAttack();
                }
            }
        );

        window.addEventListener(
            "contextmenu",
            (event) => {
                event.preventDefault();
            }
        );
    }

    primaryAttack() {
        if (this.weapon === "spear") {
            this.startAttack("slash");
            return;
        }

        this.fireBlaster(false);
    }

    secondaryAttack() {
        if (this.weapon === "spear") {
            this.startAttack("thrust");
            return;
        }

        this.fireBlaster(true);
    }

    startAttack(type) {
        if (
            this.isDead ||
            this.attackState ||
            window.gameOver ||
            this.weapon !== "spear"
        ) {
            return;
        }

        this.attackState = type;
        this.attackHit = false;

        this.attackFacingX =
            this.getAimDirection().x;

        this.attackFacingY =
            this.getAimDirection().y;

        if (type === "slash") {
            this.attackTimer =
                0.28 * this.attackSpeed;
        }

        if (type === "thrust") {
            this.attackTimer =
                0.38 * this.attackSpeed;
        }
    }

    getAimDirection() {
        const rect =
            this.element.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        let dx =
            this.mouseX - centerX;

        let dy =
            this.mouseY - centerY;

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (length < 0.001) {
            return {
                x: this.facingX,
                y: this.facingY
            };
        }

        dx /= length;
        dy /= length;

        return {
            x: dx,
            y: dy
        };
    }

    updateAttack(deltaTime) {
        if (!this.attackState) {
            this.spear.style.display = "none";
            return;
        }

        this.attackTimer -= deltaTime;
        this.spear.style.display = "block";

        const angle =
            Math.atan2(
                this.attackFacingY,
                this.attackFacingX
            ) * 180 / Math.PI;

        if (this.attackState === "slash") {
            const duration =
                0.28 * this.attackSpeed;

            const progress =
                1 -
                this.attackTimer / duration;

            const slashAngle =
                angle -
                75 +
                progress * 150;

            this.spear.style.width = "72px";

            this.spear.style.transform =
                `translateY(-50%) rotate(${slashAngle}deg)`;

            if (
                !this.attackHit &&
                progress >= 0.35
            ) {
                this.attackHit = true;

                this.performAttack(
                    10,
                    78,
                    0.25,
                    28
                );
            }
        }

        if (this.attackState === "thrust") {
            const duration =
                0.38 * this.attackSpeed;

            const progress =
                1 -
                this.attackTimer / duration;

            this.spear.style.width =
                progress < 0.45
                    ? "70px"
                    : "125px";

            this.spear.style.transform =
                `translateY(-50%) rotate(${angle}deg)`;

            if (
                !this.attackHit &&
                progress >= 0.45
            ) {
                this.attackHit = true;

                this.performAttack(
                    18,
                    135,
                    0.65,
                    0
                );
            }
        }

        if (this.attackTimer <= 0) {
            this.attackState = null;
            this.attackHit = false;
            this.spear.style.display = "none";
        }
    }

    performAttack(
        damage,
        range,
        requiredDot,
        knockback
    ) {
        const soldiers = window.soldiers;

        if (!soldiers) {
            return;
        }

        for (const soldier of soldiers) {
            if (soldier.isDead) {
                continue;
            }

            const dx =
                soldier.x - this.x;

            const dy =
                soldier.y - this.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance > range ||
                distance === 0
            ) {
                continue;
            }

            const normalizedX =
                dx / distance;

            const normalizedY =
                dy / distance;

            const dot =
                normalizedX *
                    this.attackFacingX +
                normalizedY *
                    this.attackFacingY;

            if (dot < requiredDot) {
                continue;
            }

            soldier.takeDamage(damage);

            if (
                knockback > 0 &&
                !soldier.isDead
            ) {
                soldier.applyKnockback(
                    normalizedX,
                    normalizedY,
                    knockback
                );
            }
        }
    }

    fireBlaster(heavy) {
        if (
            this.isDead ||
            window.gameOver ||
            this.blasterCooldown > 0
        ) {
            return;
        }

        const direction =
            this.getAimDirection();

        this.facingX = direction.x;
        this.facingY = direction.y;

        const projectile = {
            x:
                this.x +
                direction.x * 35,

            y:
                this.y +
                direction.y * 35,

            vx:
                direction.x * 650,

            vy:
                direction.y * 650,

            damage: heavy ? 30 : 10,

            radius: heavy ? 14 : 5,

            life: heavy ? 1.6 : 1,

            heavy: heavy,

            penetrationRemaining:
                heavy ? 1 : 0,

            hitSoldiers: new Set(),

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
            heavy
                ? "#E8E6E3"
                : "#4FA9C6";

        projectile.element.style.border =
            "2px solid #111C20";

        projectile.element.style.transform =
            "translate(-50%, -50%)";

        projectile.element.style.zIndex = "4";

        this.world.appendChild(
            projectile.element
        );

        this.projectiles.push(
            projectile
        );

        this.blasterCooldownDuration =
            heavy ? 1.25 : 0.18;

        this.blasterCooldown =
            this.blasterCooldownDuration;

        if (heavy) {
            this.triggerHeavyReticle();
        }
    }

    updateProjectiles(deltaTime) {
        if (this.blasterCooldown > 0) {
            this.blasterCooldown =
                Math.max(
                    0,
                    this.blasterCooldown -
                        deltaTime
                );
        }

        this.updateReticleCooldown();

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
                this.collidesWithCover(
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

            projectile.x = nextX;
            projectile.y = nextY;

            let hitSoldier = null;

            for (
                const soldier of
                window.soldiers || []
            ) {
                if (
                    soldier.isDead ||
                    projectile.hitSoldiers.has(
                        soldier
                    )
                ) {
                    continue;
                }

                const dx =
                    soldier.x -
                    projectile.x;

                const dy =
                    soldier.y -
                    projectile.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                if (
                    distance <=
                    projectile.radius +
                    Math.max(
                        soldier.width,
                        soldier.height
                    ) / 2
                ) {
                    hitSoldier =
                        soldier;

                    break;
                }
            }

            if (hitSoldier) {
                hitSoldier.takeDamage(
                    projectile.damage
                );

                projectile.hitSoldiers.add(
                    hitSoldier
                );

                if (
                    projectile.heavy &&
                    projectile.penetrationRemaining > 0
                ) {
                    projectile.penetrationRemaining--;

                    projectile.damage = 20;
                    projectile.radius = 8;

                    projectile.element.style.width =
                        `${projectile.radius * 2}px`;

                    projectile.element.style.height =
                        `${projectile.radius * 2}px`;

                    projectile.element.style.background =
                        "#D61F3A";
                } else {
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

    triggerHeavyReticle() {
        if (!this.reticle) {
            return;
        }

        this.reticle.style.width = "24px";
        this.reticle.style.height = "24px";
        this.reticle.style.borderColor =
            "#D61F3A";
    }

    updateReticleCooldown() {
        if (!this.reticle) {
            return;
        }

        if (
            this.blasterCooldown <= 0
        ) {
            this.reticle.style.width =
                "14px";

            this.reticle.style.height =
                "14px";

            this.reticle.style.borderColor =
                "#E8E6E3";

            return;
        }

        if (
            this.blasterCooldownDuration <= 0
        ) {
            return;
        }

        const progress =
            1 -
            this.blasterCooldown /
                this.blasterCooldownDuration;

        const size =
            24 -
            10 * progress;

        this.reticle.style.width =
            `${size}px`;

        this.reticle.style.height =
            `${size}px`;

        this.reticle.style.borderColor =
            "#D61F3A";
    }

    gameLoop(currentTime) {
        const deltaTime =
            (currentTime -
                this.lastTime) /
            1000;

        this.lastTime =
            currentTime;

        const delta =
            Math.min(
                deltaTime,
                0.05
            );

        if (!this.isDead) {
            this.updateMovement(delta);
            this.updateAttack(delta);
            this.updateProjectiles(delta);
            this.updateAnimation(delta);
            this.updatePosition();
        }

        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );
    }

    updateMovement(deltaTime) {
        if (
            this.isDead ||
            window.gameOver
        ) {
            return;
        }

        let directionX = 0;
        let directionY = 0;

        if (this.keys.left) {
            directionX--;
        }

        if (this.keys.right) {
            directionX++;
        }

        if (this.keys.up) {
            directionY--;
        }

        if (this.keys.down) {
            directionY++;
        }

        this.isMoving =
            directionX !== 0 ||
            directionY !== 0;

        if (!this.isMoving) {
            return;
        }

        const length =
            Math.sqrt(
                directionX *
                    directionX +
                directionY *
                    directionY
            );

        directionX /= length;
        directionY /= length;

        this.facingX =
            directionX;

        this.facingY =
            directionY;

        const movementX =
            directionX *
            this.speed *
            deltaTime;

        const movementY =
            directionY *
            this.speed *
            deltaTime;

        const nextX =
            this.x +
            movementX;

        if (
            !this.collidesWithCover(
                nextX,
                this.y
            )
        ) {
            this.x = nextX;
        }

        const nextY =
            this.y +
            movementY;

        if (
            !this.collidesWithCover(
                this.x,
                nextY
            )
        ) {
            this.y = nextY;
        }
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
                        window.GRID_SIZE;

                const cellTop =
                    block.y +
                    cell[1] *
                        window.GRID_SIZE;

                const cellRight =
                    cellLeft +
                    window.GRID_SIZE;

                const cellBottom =
                    cellTop +
                    window.GRID_SIZE;

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

    updateAnimation(deltaTime) {
        if (this.isMoving) {
            this.bobTime +=
                deltaTime *
                this.bobSpeed;
        } else {
            this.bobTime *= 0.8;
        }

        let bobOffset = 0;

        if (this.isMoving) {
            bobOffset =
                Math.sin(
                    this.bobTime
                ) *
                this.bobHeight;
        }

        this.element.style.transform =
            `translate(
                -50%,
                calc(-50% + ${bobOffset}px)
            )`;
    }

    updatePosition() {
        this.element.style.left =
            `${this.x}px`;

        this.element.style.top =
            `${this.y}px`;
    }

    updateReticle() {
        if (!this.reticle) {
            return;
        }

        this.reticle.style.left =
            `${this.mouseX}px`;

        this.reticle.style.top =
            `${this.mouseY}px`;
    }

    updateHealthBar() {
        const percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (this.health /
                        this.maxHealth) *
                        100
                )
            );

        this.healthFill.style.width =
            `${percentage}%`;
    }

    takeDamage(amount) {
        if (
            this.isDead ||
            window.gameOver
        ) {
            return;
        }

        this.health -= amount;

        this.health =
            Math.max(
                0,
                this.health
            );

        this.updateHealthBar();

        if (this.health <= 0) {
            this.onDeath();
        }
    }

    onDeath() {
        if (this.isDead) {
            return;
        }

        this.isDead = true;
        this.attackState = null;
        this.spear.style.display = "none";

        for (
            const projectile of
            this.projectiles
        ) {
            projectile.element.remove();
        }

        this.projectiles.length = 0;

        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;

        if (this.reticle) {
            this.reticle.remove();
        }

        if (this.weaponMenu) {
            this.weaponMenu.remove();
        }

        if (window.triggerGameOver) {
            window.triggerGameOver();
        }
    }
}

window.Rojisima = Rojisima;

if (
    window.world &&
    !window.rojisima
) {
    window.rojisima =
        new Rojisima(
            window.world
        );
}