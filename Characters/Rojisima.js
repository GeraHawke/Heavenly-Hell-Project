class Rojisima {

    constructor(worldElement) {

        // --------------------------------------------------
        // REFERENCIA AL MUNDO
        // --------------------------------------------------

        this.world = worldElement;


        // --------------------------------------------------
        // CONFIGURACIÓN DEL PERSONAJE
        // --------------------------------------------------

        this.width = 48;
        this.height = 64;

        this.color = "#D61F3A";
        this.borderColor = "#111C20";

        // Velocidad en píxeles por segundo.
        this.speed = 250;


        // --------------------------------------------------
        // VIDA
        // --------------------------------------------------

        this.maxHealth = 100;
        this.health = this.maxHealth;


        // --------------------------------------------------
        // CREAR ELEMENTO VISUAL
        // --------------------------------------------------

        this.element = document.createElement("div");

        this.element.className = "player";

        this.element.setAttribute(
            "aria-label",
            "Rojísima"
        );


        // --------------------------------------------------
        // ESTILO DEL PERSONAJE
        // --------------------------------------------------

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
            "0 8px 0 rgba(17, 28, 32, 0.15)";

        // left/top representan el centro.
        this.element.style.transform =
            "translate(-50%, -50%)";


        // --------------------------------------------------
        // BARRA DE VIDA
        // --------------------------------------------------

        this.healthBar =
            document.createElement("div");

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


        // --------------------------------------------------
        // RELLENO DE LA BARRA
        // --------------------------------------------------

        this.healthFill =
            document.createElement("div");

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


        // La barra pertenece visualmente
        // a Rojísima.

        this.element.appendChild(
            this.healthBar
        );


        // --------------------------------------------------
        // AÑADIR A #WORLD
        // --------------------------------------------------

        this.world.appendChild(
            this.element
        );


        // --------------------------------------------------
        // POSICIÓN INICIAL
        // --------------------------------------------------

        this.x =
            window.PLAYER_SPAWN_X ??
            window.WORLD_WIDTH / 2;

        this.y =
            window.PLAYER_SPAWN_Y ??
            window.WORLD_HEIGHT / 2;


        // --------------------------------------------------
        // INPUT
        // --------------------------------------------------

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };


        // --------------------------------------------------
        // ANIMACIÓN DE CAMINATA
        // --------------------------------------------------

        this.isMoving = false;

        this.bobTime = 0;

        this.bobHeight = 3;

        this.bobSpeed = 12;


        // --------------------------------------------------
        // TIEMPO
        // --------------------------------------------------

        this.lastTime =
            performance.now();


        // --------------------------------------------------
        // CONFIGURAR CONTROLES
        // --------------------------------------------------

        this.setupInput();


        // --------------------------------------------------
        // POSICIÓN INICIAL
        // --------------------------------------------------

        this.updatePosition();

        this.updateHealthBar();


        // --------------------------------------------------
        // INICIAR GAME LOOP
        // --------------------------------------------------

        requestAnimationFrame(
            (time) => this.gameLoop(time)
        );
    }


    // --------------------------------------------------
    // CONFIGURAR TECLADO
    // --------------------------------------------------

    setupInput() {

        window.addEventListener(
            "keydown",
            (event) => {

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


    // --------------------------------------------------
    // GAME LOOP
    // --------------------------------------------------

    gameLoop(currentTime) {

        const deltaTime =
            (currentTime - this.lastTime) / 1000;

        this.lastTime = currentTime;


        // Evita saltos enormes si la pestaña
        // estuvo congelada.

        const delta =
            Math.min(deltaTime, 0.05);


        this.updateMovement(delta);

        this.updateAnimation(delta);

        this.updatePosition();


        requestAnimationFrame(
            (time) => this.gameLoop(time)
        );
    }


    // --------------------------------------------------
    // MOVIMIENTO
    // --------------------------------------------------

    updateMovement(deltaTime) {

        let directionX = 0;
        let directionY = 0;


        // --------------------------------------------------
        // HORIZONTAL
        // --------------------------------------------------

        if (this.keys.left) {
            directionX -= 1;
        }

        if (this.keys.right) {
            directionX += 1;
        }


        // --------------------------------------------------
        // VERTICAL
        // --------------------------------------------------

        if (this.keys.up) {
            directionY -= 1;
        }

        if (this.keys.down) {
            directionY += 1;
        }


        // --------------------------------------------------
        // ¿ESTÁ MOVIÉNDOSE?
        // --------------------------------------------------

        this.isMoving =
            directionX !== 0 ||
            directionY !== 0;


        if (!this.isMoving) {
            return;
        }


        // --------------------------------------------------
        // NORMALIZAR DIAGONAL
        // --------------------------------------------------

        const length =
            Math.sqrt(
                directionX * directionX +
                directionY * directionY
            );

        directionX /= length;
        directionY /= length;


        // --------------------------------------------------
        // CALCULAR MOVIMIENTO
        // --------------------------------------------------

        const movementX =
            directionX *
            this.speed *
            deltaTime;

        const movementY =
            directionY *
            this.speed *
            deltaTime;


        // --------------------------------------------------
        // MOVIMIENTO HORIZONTAL
        // --------------------------------------------------

        const nextX =
            this.x + movementX;

        if (
            !this.collidesWithCover(
                nextX,
                this.y
            )
        ) {

            this.x = nextX;
        }


        // --------------------------------------------------
        // MOVIMIENTO VERTICAL
        // --------------------------------------------------

        const nextY =
            this.y + movementY;

        if (
            !this.collidesWithCover(
                this.x,
                nextY
            )
        ) {

            this.y = nextY;
        }


        // --------------------------------------------------
        // LIMITAR AL MUNDO
        // --------------------------------------------------

        const worldWidth =
            window.WORLD_WIDTH ??
            this.world.clientWidth;

        const worldHeight =
            window.WORLD_HEIGHT ??
            this.world.clientHeight;


        const halfWidth =
            this.width / 2;

        const halfHeight =
            this.height / 2;


        this.x = Math.max(
            halfWidth,
            Math.min(
                worldWidth - halfWidth,
                this.x
            )
        );


        this.y = Math.max(
            halfHeight,
            Math.min(
                worldHeight - halfHeight,
                this.y
            )
        );
    }


    // --------------------------------------------------
    // COLISIÓN CON COBERTURA
    // --------------------------------------------------

    collidesWithCover(
        centerX,
        centerY
    ) {

        /*
         * Game.html expone coverBlocks mediante:
         *
         * window.coverBlocks
         *
         * Cada formación tiene:
         *
         * x
         * y
         * width
         * height
         * cells
         *
         * Usamos las coordenadas del mundo directamente.
         */

        const coverBlocks =
            window.coverBlocks;


        if (
            !coverBlocks ||
            coverBlocks.length === 0
        ) {

            return false;
        }


        // --------------------------------------------------
        // HITBOX DE ROJÍSIMA
        // --------------------------------------------------

        const playerLeft =
            centerX - this.width / 2;

        const playerRight =
            centerX + this.width / 2;

        const playerTop =
            centerY - this.height / 2;

        const playerBottom =
            centerY + this.height / 2;


        // --------------------------------------------------
        // REVISAR CADA FORMACIÓN
        // --------------------------------------------------

        for (
            const block of coverBlocks
        ) {

            /*
             * La formación puede tener espacios vacíos.
             *
             * Por eso no usamos solamente block.width
             * y block.height.
             *
             * Revisamos cada celda real.
             */

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


                // --------------------------------------------------
                // AABB
                // --------------------------------------------------

                const collision =
                    playerRight > cellLeft &&
                    playerLeft < cellRight &&
                    playerBottom > cellTop &&
                    playerTop < cellBottom;


                if (collision) {

                    return true;
                }
            }
        }


        return false;
    }


    // --------------------------------------------------
    // ANIMACIÓN DE CAMINATA
    // --------------------------------------------------

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
                Math.sin(this.bobTime) *
                this.bobHeight;
        }


        this.element.style.transform =
            `translate(
                -50%,
                calc(-50% + ${bobOffset}px)
            )`;
    }


    // --------------------------------------------------
    // ACTUALIZAR POSICIÓN
    // --------------------------------------------------

    updatePosition() {

        this.element.style.left =
            `${this.x}px`;

        this.element.style.top =
            `${this.y}px`;
    }


    // --------------------------------------------------
    // ACTUALIZAR BARRA DE VIDA
    // --------------------------------------------------

    updateHealthBar() {

        const percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (this.health / this.maxHealth) *
                    100
                )
            );


        this.healthFill.style.width =
            `${percentage}%`;
    }


    // --------------------------------------------------
    // RECIBIR DAÑO
    // --------------------------------------------------

    takeDamage(amount) {

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


    // --------------------------------------------------
    // MUERTE
    // --------------------------------------------------

    onDeath() {

        console.log(
            "Rojísima ha muerto."
        );

        // El sistema de combate llegará después.
    }
}


// --------------------------------------------------
// INICIALIZACIÓN
// --------------------------------------------------

// IMPORTANTE:
//
// Game.html ya tiene una variable global llamada "world".
//
// NO volvemos a declarar:
// const world = ...
//
// Usamos directamente window.world.
//
// Así evitamos el:
// "Identifier 'world' has already been declared"
// que estaba impidiendo que TODO este archivo arrancara.

const rojisima =
    new Rojisima(window.world);