class WaveManager {

    constructor(worldElement) {

        this.world =
            worldElement;


        this.waves = [

            {
                number: 1,
                enemies: 5
            },

            {
                number: 2,
                enemies: 7
            }

            // Wave 3 después:
            // {
            //     number: 3,
            //     enemies: 9
            // }

        ];


        this.currentWaveIndex =
            0;


        this.state =
            "idle";


        this.nextWaveTimer =
            0;


        this.spawnRadius =
            450;


        this.lastTime =
            0;


        this.running =
            false;


        this.updateUI();

    }


    start() {

        if (this.running) {
            return;
        }


        this.currentWaveIndex =
            0;


        this.state =
            "idle";


        this.nextWaveTimer =
            0;


        this.running =
            true;


        this.startCurrentWave();


        requestAnimationFrame(
            (time) =>
                this.gameLoop(time)
        );

    }


    startCurrentWave() {

        if (
            this.currentWaveIndex >=
            this.waves.length
        ) {

            this.state =
                "complete";

            this.updateUI();

            return;

        }


        const wave =
            this.waves[
                this.currentWaveIndex
            ];


        const spawned =
            this.spawnWave(
                wave.enemies
            );


        /*
            Si por alguna razón no se pudo
            crear ningún enemigo, NO debemos
            interpretar eso como una wave
            completada.

            Eso fue precisamente lo que
            estaba provocando el salto
            automático.
        */

        if (
            spawned === 0
        ) {

            this.state =
                "error";

            console.error(
                "WaveManager: no se pudieron crear enemigos."
            );

            return;

        }


        this.state =
            "active";


        this.updateUI();


        console.log(
            `Wave ${wave.number} iniciada con ${spawned} enemigos.`
        );

    }


    spawnWave(count) {

        const player =
            window.rojisima;


        if (!player) {

            console.error(
                "WaveManager: Rojísima no existe."
            );

            return 0;

        }


        if (
            !window.soldiers
        ) {

            window.soldiers =
                [];

        }


        let spawned =
            0;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const position =
                this.findSpawnPosition(
                    i,
                    count
                );


            if (!position) {

                console.warn(
                    "WaveManager: no se encontró una posición segura para un enemigo."
                );

                continue;

            }


            const soldier =
                new Soldier(
                    this.world,
                    position.x,
                    position.y
                );


            window.soldiers.push(
                soldier
            );


            spawned++;

        }


        return spawned;

    }


    findSpawnPosition(
        index,
        total
    ) {

        const player =
            window.rojisima;


        if (!player) {
            return null;
        }


        /*
            Probamos varias posiciones
            alrededor del jugador.

            Esto evita que el spawn caiga
            directamente dentro de una
            formación de cobertura.
        */

        const baseAngle =
            (
                Math.PI * 2 * index
            ) / total;


        const angleStep =
            Math.PI / 8;


        const distances = [

            this.spawnRadius,

            this.spawnRadius + 75,

            this.spawnRadius + 150

        ];


        for (
            const distance of distances
        ) {

            for (
                let attempt = 0;
                attempt < 16;
                attempt++
            ) {

                const angle =
                    baseAngle +
                    attempt *
                    angleStep;


                const x =
                    player.x +
                    Math.cos(angle) *
                    distance;


                const y =
                    player.y +
                    Math.sin(angle) *
                    distance;


                if (
                    !this.positionBlocked(
                        x,
                        y
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


    positionBlocked(
        centerX,
        centerY
    ) {

        const coverBlocks =
            window.coverBlocks;


        if (!coverBlocks) {
            return false;
        }


        /*
            Dimensiones aproximadas del
            Soldier actual.

            Se usan aquí únicamente para
            impedir que aparezca dentro
            de una cobertura.
        */

        const width =
            44;

        const height =
            58;


        const left =
            centerX -
            width / 2;


        const right =
            centerX +
            width / 2;


        const top =
            centerY -
            height / 2;


        const bottom =
            centerY +
            height / 2;


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
                    right >
                        cellLeft &&

                    left <
                        cellRight &&

                    bottom >
                        cellTop &&

                    top <
                        cellBottom;


                if (collision) {
                    return true;
                }

            }

        }


        return false;

    }


    update(deltaTime) {

        if (
            window.gameOver
        ) {

            return;

        }


        if (
            this.state ===
            "waiting"
        ) {

            this.nextWaveTimer -=
                deltaTime;


            if (
                this.nextWaveTimer <= 0
            ) {

                this.startCurrentWave();

            }


            return;

        }


        if (
            this.state !==
            "active"
        ) {

            return;

        }


        /*
            Filtramos enemigos que ya
            terminaron su muerte.

            Soldier.js debe encargarse
            de quitarlos del array.
        */

        if (
            window.soldiers.length === 0
        ) {

            this.currentWaveIndex++;


            if (
                this.currentWaveIndex >=
                this.waves.length
            ) {

                this.state =
                    "complete";

                this.updateUI();


                console.log(
                    "Todas las waves completadas."
                );


                return;

            }


            this.state =
                "waiting";


            this.nextWaveTimer =
                2;


            this.updateUI();


            console.log(
                "Wave completada. Siguiente wave en 2 segundos."
            );

        }

    }


    updateUI() {

        const wave =
            this.waves[
                this.currentWaveIndex
            ];


        if (!wave) {
            return;
        }


        const waveLabel =
            document.getElementById(
                "waveLabel"
            );


        if (!waveLabel) {
            return;
        }


        waveLabel.textContent =
            `WAVE ${wave.number}`;

    }


    gameLoop(currentTime) {

        if (!this.lastTime) {

            this.lastTime =
                currentTime;

        }


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


        this.update(
            delta
        );


        if (
            this.running
        ) {

            requestAnimationFrame(
                (time) =>
                    this.gameLoop(time)
            );

        }

    }

}


window.WaveManager =
    WaveManager;