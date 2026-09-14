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


        this.element =
            document.createElement(
                "div"
            );

        this.element.className =
            "player";

        this.element.setAttribute(
            "aria-label",
            "Rojísima"
        );

        this.element.style.position =
            "absolute";

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
            "0 8px 0 rgba(17, 28, 32, 0.15)";

        this.element.style.transform =
            "translate(-50%, -50%)";

        this.element.style.zIndex =
            "3";


        this.healthBar =
            document.createElement(
                "div"
            );

        this.healthBar.className =
            "player-health";

        this.healthBar.style.position =
            "absolute";

        this.healthBar.style.width =
            "58px";

        this.healthBar.style.height =
            "7px";

        this.healthBar.style.left =
            "50%";

        this.healthBar.style.top =
            "-14px";

        this.healthBar.style.transform =
            "translateX(-50%)";

        this.healthBar.style.background =
            "#111C20";

        this.healthBar.style.border =
            "1px solid #E8E6E3";

        this.healthBar.style.borderRadius =
            "4px";

        this.healthBar.style.overflow =
            "hidden";


        this.healthFill =
            document.createElement(
                "div"
            );

        this.healthFill.className =
            "player-health-fill";

        this.healthFill.style.width =
            "100%";

        this.healthFill.style.height =
            "100%";

        this.healthFill.style.background =
            "#D61F3A";

        this.healthFill.style.transition =
            "width 0.15s ease";


        this.healthBar.appendChild(
            this.healthFill
        );

        this.element.appendChild(
            this.healthBar
        );


        this.createSpear();


        this.world.appendChild(
            this.element
        );


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

        this.lastTime =
            performance.now();


        this.setupInput();

        this.updatePosition();

        this.updateHealthBar();


        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );

    }


    createSpear() {

        this.spear =
            document.createElement(
                "div"
            );


        this.spear.style.position =
            "absolute";

        this.spear.style.width =
            "90px";

        this.spear.style.height =
            "5px";

        this.spear.style.left =
            "50%";

        this.spear.style.top =
            "50%";

        this.spear.style.background =
            "#E8E6E3";

        this.spear.style.border =
            "2px solid #111C20";

        this.spear.style.borderRadius =
            "999px";

        this.spear.style.transformOrigin =
            "0 50%";

        this.spear.style.transform =
            "translateY(-50%) rotate(0deg)";

        this.spear.style.display =
            "none";

        this.spear.style.zIndex =
            "4";


        this.element.appendChild(
            this.spear
        );

    }


    setupInput() {

        window.addEventListener(
            "keydown",
            (event) => {

                if (this.isDead) {
                    return;
                }


                switch (
                    event.key.toLowerCase()
                ) {

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

                        this.startAttack(
                            "slash"
                        );

                        break;


                    case "k":

                        this.startAttack(
                            "thrust"
                        );

                        break;

                }

            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                switch (
                    event.key.toLowerCase()
                ) {

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

    }


    startAttack(type) {

        if (
            this.isDead ||
            this.attackState ||
            window.gameOver
        ) {
            return;
        }


        this.attackState = type;

        this.attackHit = false;

        this.attackFacingX =
            this.facingX;

        this.attackFacingY =
            this.facingY;


        if (type === "slash") {

            this.attackTimer =
                0.28 *
                this.attackSpeed;

        }


        if (type === "thrust") {

            this.attackTimer =
                0.38 *
                this.attackSpeed;

        }

    }


    updateAttack(deltaTime) {

        if (!this.attackState) {

            this.spear.style.display =
                "none";

            return;

        }


        this.attackTimer -=
            deltaTime;


        this.spear.style.display =
            "block";


        const angle =
            Math.atan2(
                this.attackFacingY,
                this.attackFacingX
            ) *
            180 /
            Math.PI;


        if (
            this.attackState ===
            "slash"
        ) {

            const duration =
                0.28 *
                this.attackSpeed;


            const progress =
                1 -
                this.attackTimer /
                duration;


            const slashAngle =
                angle -
                75 +
                progress *
                150;


            this.spear.style.width =
                "72px";


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
                    95
                );

            }

        }


        if (
            this.attackState ===
            "thrust"
        ) {

            const duration =
                0.38 *
                this.attackSpeed;


            const progress =
                1 -
                this.attackTimer /
                duration;


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
                    42
                );

            }

        }


        if (
            this.attackTimer <= 0
        ) {

            this.attackState = null;

            this.attackHit = false;

            this.spear.style.display =
                "none";

        }

    }


    performAttack(
        damage,
        range,
        width
    ) {

        const soldiers =
            window.soldiers;


        if (!soldiers) {
            return;
        }


        for (
            const soldier of soldiers
        ) {

            if (soldier.isDead) {
                continue;
            }


            const dx =
                soldier.x -
                this.x;


            const dy =
                soldier.y -
                this.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance > range
            ) {
                continue;
            }


            if (
                distance === 0
            ) {
                continue;
            }


            const normalizedX =
                dx /
                distance;


            const normalizedY =
                dy /
                distance;


            const dot =
                normalizedX *
                    this.attackFacingX +
                normalizedY *
                    this.attackFacingY;


            const requiredDot =
                this.attackState ===
                "slash"
                    ? 0.25
                    : 0.65;


            if (
                dot >= requiredDot
            ) {

                soldier.takeDamage(
                    damage
                );

            }

        }

    }


    gameLoop(currentTime) {

        const deltaTime =
            (
                currentTime -
                this.lastTime
            ) / 1000;


        this.lastTime =
            currentTime;


        const delta =
            Math.min(
                deltaTime,
                0.05
            );


        if (!this.isDead) {

            this.updateMovement(
                delta
            );

            this.updateAttack(
                delta
            );

            this.updateAnimation(
                delta
            );

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

            this.x =
                nextX;

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

            this.y =
                nextY;

        }

    }


    collidesWithCover(
        centerX,
        centerY
    ) {

        const coverBlocks =
            window.coverBlocks;


        if (!coverBlocks) {
            return false;
        }


        const playerLeft =
            centerX -
            this.width / 2;


        const playerRight =
            centerX +
            this.width / 2;


        const playerTop =
            centerY -
            this.height / 2;


        const playerBottom =
            centerY +
            this.height / 2;


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


                const collision =
                    playerRight >
                        cellLeft &&

                    playerLeft <
                        cellRight &&

                    playerBottom >
                        cellTop &&

                    playerTop <
                        cellBottom;


                if (collision) {
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


    updateHealthBar() {

        const percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (
                        this.health /
                        this.maxHealth
                    ) *
                    100
                )
            );


        this.healthFill.style.width =
            `${percentage}%`;

    }


    takeDamage(amount) {

        if (
            this.isDead
        ) {
            return;
        }


        this.health -=
            amount;


        this.health =
            Math.max(
                0,
                this.health
            );


        this.updateHealthBar();


        if (
            this.health <= 0
        ) {

            this.onDeath();

        }

    }


    onDeath() {

        if (this.isDead) {
            return;
        }


        this.isDead = true;

        this.attackState = null;

        this.spear.style.display =
            "none";


        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;


        if (
            window.triggerGameOver
        ) {

            window.triggerGameOver();

        }

    }

}


/*
    IMPORTANTE:

    Primero exponemos la clase.
*/

window.Rojisima =
    Rojisima;


/*
    Y aquí estaba el condenado problema.

    Rojisima necesita existir antes de que
    WaveManager intente crear soldados.
*/

if (
    window.world &&
    !window.rojisima
) {

    window.rojisima =
        new Rojisima(
            window.world
        );

}