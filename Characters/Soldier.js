class Soldier {

    constructor(
        worldElement,
        x,
        y
    ) {

        this.world =
            worldElement;

        this.x = x;
        this.y = y;

        this.width = 44;
        this.height = 58;

        this.color =
            "#111C20";

        this.borderColor =
            "#E8E6E3";

        this.speed = 105;

        this.maxHealth = 40;
        this.health =
            this.maxHealth;

        this.isDead = false;

        this.state =
            "chase";

        this.comboStep = 0;

        this.attackTimer = 0;

        this.attackHit = false;

        this.attackCooldown = 0;

        this.element =
            document.createElement("div");

        this.element.className =
            "soldier";

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
            "0 8px 0 rgba(17, 28, 32, 0.18)";

        this.element.style.transform =
            "translate(-50%, -50%)";

        this.element.style.zIndex =
            "3";

        this.createHealthBar();

        this.createSword();

        this.world.appendChild(
            this.element
        );

        this.lastTime =
            performance.now();

        this.updatePosition();

        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );
    }


    createHealthBar() {

        this.healthBar =
            document.createElement("div");

        this.healthBar.style.position =
            "absolute";

        this.healthBar.style.width =
            "50px";

        this.healthBar.style.height =
            "6px";

        this.healthBar.style.left =
            "50%";

        this.healthBar.style.top =
            "-13px";

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
            document.createElement("div");

        this.healthFill.style.width =
            "100%";

        this.healthFill.style.height =
            "100%";

        this.healthFill.style.background =
            "#4FA9C6";

        this.healthBar.appendChild(
            this.healthFill
        );

        this.element.appendChild(
            this.healthBar
        );
    }


    createSword() {

        this.sword =
            document.createElement("div");

        this.sword.style.position =
            "absolute";

        this.sword.style.width =
            "72px";

        this.sword.style.height =
            "6px";

        this.sword.style.left =
            "50%";

        this.sword.style.top =
            "50%";

        this.sword.style.background =
            "#E8E6E3";

        this.sword.style.border =
            "2px solid #111C20";

        this.sword.style.borderRadius =
            "999px";

        this.sword.style.transformOrigin =
            "0 50%";

        this.sword.style.transform =
            "translateY(-50%)";

        this.sword.style.display =
            "none";

        this.sword.style.zIndex =
            "4";

        this.element.appendChild(
            this.sword
        );
    }


    gameLoop(currentTime) {

        if (this.isDead) {
            return;
        }

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

        this.updateAttackCooldown(
            delta
        );

        this.updateAI(
            delta
        );

        this.updatePosition();

        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );
    }


    updateAttackCooldown(
        deltaTime
    ) {

        if (
            this.attackCooldown >
            0
        ) {

            this.attackCooldown -=
                deltaTime;
        }
    }


    updateAI(deltaTime) {

        const player =
            window.rojisima;

        if (!player) {
            return;
        }

        if (
            player.health <= 0
        ) {
            return;
        }


        if (
            this.state === "attack"
        ) {

            this.updateAttack(
                deltaTime
            );

            return;
        }


        const dx =
            player.x -
            this.x;

        const dy =
            player.y -
            this.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            this.attackCooldown <= 0 &&
            distance <= 75
        ) {

            this.startAttack();

            return;
        }


        if (
            distance > 58
        ) {

            this.state =
                "chase";

            const length =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            const directionX =
                dx / length;

            const directionY =
                dy / length;

            this.x +=
                directionX *
                this.speed *
                deltaTime;

            this.y +=
                directionY *
                this.speed *
                deltaTime;
        }
    }


    startAttack() {

        this.state =
            "attack";

        this.comboStep = 0;

        this.attackHit =
            false;

        this.attackTimer =
            0.25;

        this.sword.style.display =
            "block";
    }


    updateAttack(deltaTime) {

        this.attackTimer -=
            deltaTime;

        const player =
            window.rojisima;

        if (!player) {
            return;
        }


        const dx =
            player.x -
            this.x;

        const dy =
            player.y -
            this.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        const angle =
            Math.atan2(
                dy,
                dx
            ) *
            180 /
            Math.PI;


        if (
            this.comboStep === 0
        ) {

            const progress =
                1 -
                this.attackTimer /
                0.25;

            this.sword.style.width =
                "68px";

            this.sword.style.transform =
                `translateY(-50%) rotate(${
                    angle -
                    75 +
                    progress * 150
                }deg)`;


            if (
                !this.attackHit &&
                progress >= 0.45
            ) {

                this.attackHit =
                    true;

                if (
                    distance <= 70
                ) {

                    player.takeDamage(
                        8
                    );
                }
            }


            if (
                this.attackTimer <= 0
            ) {

                this.nextComboAttack();
            }

            return;
        }


        if (
            this.comboStep === 1
        ) {

            const progress =
                1 -
                this.attackTimer /
                0.25;

            this.sword.style.width =
                "68px";

            this.sword.style.transform =
                `translateY(-50%) rotate(${
                    angle +
                    75 -
                    progress * 150
                }deg)`;


            if (
                !this.attackHit &&
                progress >= 0.45
            ) {

                this.attackHit =
                    true;

                if (
                    distance <= 70
                ) {

                    player.takeDamage(
                        8
                    );
                }
            }


            if (
                this.attackTimer <= 0
            ) {

                this.nextComboAttack();
            }

            return;
        }


        if (
            this.comboStep === 2
        ) {

            const progress =
                1 -
                this.attackTimer /
                0.38;

            this.sword.style.width =
                progress < 0.45
                    ? "68px"
                    : "105px";

            this.sword.style.transform =
                `translateY(-50%) rotate(${angle}deg)`;


            if (
                !this.attackHit &&
                progress >= 0.55
            ) {

                this.attackHit =
                    true;

                if (
                    distance <= 105
                ) {

                    player.takeDamage(
                        15
                    );
                }
            }


            if (
                this.attackTimer <= 0
            ) {

                this.finishAttack();
            }
        }
    }


    nextComboAttack() {

        this.comboStep++;

        this.attackHit =
            false;

        if (
            this.comboStep === 1
        ) {

            this.attackTimer =
                0.25;

            return;
        }

        if (
            this.comboStep === 2
        ) {

            this.attackTimer =
                0.38;

            return;
        }

        this.finishAttack();
    }


    finishAttack() {

        this.state =
            "chase";

        this.comboStep =
            0;

        this.attackHit =
            false;

        this.attackCooldown =
            0.8;

        this.sword.style.display =
            "none";
    }


    takeDamage(amount) {

        if (this.isDead) {
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


    onDeath() {

        this.isDead =
            true;

        this.sword.style.display =
            "none";

        this.element.style.transition =
            "opacity 0.25s ease, transform 0.25s ease";

        this.element.style.opacity =
            "0";

        this.element.style.transform =
            "translate(-50%, -50%) scale(0.7)";

        setTimeout(
            () => {

                this.element.remove();

                if (
                    window.soldiers
                ) {

                    const index =
                        window.soldiers.indexOf(
                            this
                        );

                    if (
                        index !== -1
                    ) {

                        window.soldiers.splice(
                            index,
                            1
                        );
                    }
                }

            },
            250
        );
    }


    updatePosition() {

        this.element.style.left =
            `${this.x}px`;

        this.element.style.top =
            `${this.y}px`;
    }
}


window.Soldier =
    Soldier;