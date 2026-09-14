/*
 * HEAVENLY HELL
 * Adaptive Combat Prototype
 *
 * Este archivo será el núcleo del sistema
 * Heavenly Hell.
 *
 * Por ahora no contiene lógica adaptativa.
 */

class HeavenlyHell {

    constructor() {

        this.enabled = true;

        console.log("Heavenly Hell initialized.");

    }

    enable() {

        this.enabled = true;

    }

    disable() {

        this.enabled = false;

    }

    update() {

        if (!this.enabled) {
            return;
        }

        // La lógica adaptativa llegará aquí.
    }

}


// Instancia global del sistema.
// Todavía no hace prácticamente nada.
// Eso es intencional.

const heavenlyHell = new HeavenlyHell();