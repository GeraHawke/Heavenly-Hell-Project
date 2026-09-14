/*
 * HEAVENLY HELL
 * Adaptive Combat Prototype
 */

class HeavenlyHell {

    constructor() {
        this.enabled = true;

        this.pathUpdateInterval = 0.25;
        this.pathRange = 600;
        this.gridSize = 25;

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
    }

    getMovementDecision(soldier, player) {
        if (!this.enabled) {
            return null;
        }

        const dodge = this.getProjectileDodge(
            soldier,
            player
        );

        if (dodge) {
            return dodge;
        }

        if (
            !soldier.advancedPath ||
            soldier.advancedPath.length === 0 ||
            soldier.pathTimer <= 0
        ) {
            const path = this.findPath(
                soldier,
                player.x,
                player.y
            );

            if (path.length > 0) {
                soldier.advancedPath = path;
                soldier.pathIndex = 0;
            }

            soldier.pathTimer =
                this.pathUpdateInterval;
        }

        soldier.pathTimer = Math.max(
            0,
            soldier.pathTimer -
            soldier.lastDeltaTime
        );

        if (
            !soldier.advancedPath ||
            soldier.advancedPath.length === 0
        ) {
            return null;
        }

        while (
            soldier.pathIndex <
            soldier.advancedPath.length
        ) {
            const node =
                soldier.advancedPath[
                    soldier.pathIndex
                ];

            const dx =
                node.x - soldier.x;

            const dy =
                node.y - soldier.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (distance < 18) {
                soldier.pathIndex++;
                continue;
            }

            const length = Math.sqrt(
                dx * dx +
                dy * dy
            );

            if (length === 0) {
                soldier.pathIndex++;
                continue;
            }

            return {
                type: "path",
                x: dx / length,
                y: dy / length
            };
        }

        return null;
    }

    findPath(soldier, targetX, targetY) {

        const gridSize =
            this.gridSize;

        const startX =
            Math.round(
                soldier.x / gridSize
            ) * gridSize;

        const startY =
            Math.round(
                soldier.y / gridSize
            ) * gridSize;

        const endX =
            Math.round(
                targetX / gridSize
            ) * gridSize;

        const endY =
            Math.round(
                targetY / gridSize
            ) * gridSize;

        const distance =
            Math.sqrt(
                Math.pow(endX - startX, 2) +
                Math.pow(endY - startY, 2)
            );

        if (
            distance >
            this.pathRange
        ) {
            return [];
        }

        const start = {
            x: startX,
            y: startY
        };

        const goal = {
            x: endX,
            y: endY
        };

        if (
            !this.isWalkable(
                soldier,
                start.x,
                start.y
            )
        ) {
            return [];
        }

        const open = [];
        const closed = new Set();
        const nodes = new Map();

        const startKey =
            this.nodeKey(
                start.x,
                start.y
            );

        const startNode = {
            x: start.x,
            y: start.y,
            g: 0,
            h: this.heuristic(
                start.x,
                start.y,
                goal.x,
                goal.y
            ),
            parent: null
        };

        startNode.f =
            startNode.g +
            startNode.h;

        open.push(startNode);
        nodes.set(
            startKey,
            startNode
        );

        const directions = [
            { x: 1, y: 0, cost: 1 },
            { x: -1, y: 0, cost: 1 },
            { x: 0, y: 1, cost: 1 },
            { x: 0, y: -1, cost: 1 },
            { x: 1, y: 1, cost: 1.414 },
            { x: -1, y: 1, cost: 1.414 },
            { x: 1, y: -1, cost: 1.414 },
            { x: -1, y: -1, cost: 1.414 }
        ];

        let iterations = 0;
        const maxIterations = 1800;

        while (
            open.length > 0 &&
            iterations < maxIterations
        ) {
            iterations++;

            let bestIndex = 0;

            for (
                let i = 1;
                i < open.length;
                i++
            ) {
                if (
                    open[i].f <
                    open[bestIndex].f
                ) {
                    bestIndex = i;
                }
            }

            const current =
                open.splice(
                    bestIndex,
                    1
                )[0];

            const currentKey =
                this.nodeKey(
                    current.x,
                    current.y
                );

            if (
                closed.has(currentKey)
            ) {
                continue;
            }

            closed.add(currentKey);

            if (
                Math.abs(
                    current.x - goal.x
                ) <= gridSize &&
                Math.abs(
                    current.y - goal.y
                ) <= gridSize
            ) {
                return this.reconstructPath(
                    current
                );
            }

            for (
                const direction of directions
            ) {
                const nextX =
                    current.x +
                    direction.x *
                    gridSize;

                const nextY =
                    current.y +
                    direction.y *
                    gridSize;

                if (
                    Math.abs(
                        nextX - start.x
                    ) > this.pathRange ||
                    Math.abs(
                        nextY - start.y
                    ) > this.pathRange
                ) {
                    continue;
                }

                if (
                    !this.isWalkable(
                        soldier,
                        nextX,
                        nextY
                    )
                ) {
                    continue;
                }

                if (
                    direction.x !== 0 &&
                    direction.y !== 0
                ) {
                    if (
                        !this.isWalkable(
                            soldier,
                            current.x +
                            direction.x *
                            gridSize,
                            current.y
                        ) ||
                        !this.isWalkable(
                            soldier,
                            current.x,
                            current.y +
                            direction.y *
                            gridSize
                        )
                    ) {
                        continue;
                    }
                }

                const nextKey =
                    this.nodeKey(
                        nextX,
                        nextY
                    );

                if (
                    closed.has(nextKey)
                ) {
                    continue;
                }

                const tentativeG =
                    current.g +
                    direction.cost;

                let nextNode =
                    nodes.get(nextKey);

                if (
                    !nextNode ||
                    tentativeG <
                    nextNode.g
                ) {
                    if (!nextNode) {
                        nextNode = {
                            x: nextX,
                            y: nextY,
                            g: 0,
                            h: 0,
                            f: 0,
                            parent: null
                        };

                        nodes.set(
                            nextKey,
                            nextNode
                        );
                    }

                    nextNode.g =
                        tentativeG;

                    nextNode.h =
                        this.heuristic(
                            nextX,
                            nextY,
                            goal.x,
                            goal.y
                        );

                    nextNode.f =
                        nextNode.g +
                        nextNode.h;

                    nextNode.parent =
                        current;

                    open.push(nextNode);
                }
            }
        }

        return [];
    }

    reconstructPath(node) {

        const path = [];
        let current = node;

        while (current) {
            path.push({
                x: current.x,
                y: current.y
            });

            current =
                current.parent;
        }

        path.reverse();

        if (path.length > 0) {
            path.shift();
        }

        return path;
    }

    heuristic(
        x1,
        y1,
        x2,
        y2
    ) {
        return Math.sqrt(
            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2)
        ) / this.gridSize;
    }

    nodeKey(x, y) {
        return `${x},${y}`;
    }

    isWalkable(
        soldier,
        x,
        y
    ) {
        return !soldier.collidesWithCover(
            x,
            y
        );
    }

    getProjectileDodge(
        soldier,
        player
    ) {
        if (
            !player.projectiles ||
            player.projectiles.length === 0
        ) {
            return null;
        }

        const dangerRadius = 120;

        for (
            const projectile of
            player.projectiles
        ) {
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
                distance >
                dangerRadius
            ) {
                continue;
            }

            const velocityLength =
                Math.sqrt(
                    projectile.vx *
                    projectile.vx +
                    projectile.vy *
                    projectile.vy
                );

            if (
                velocityLength === 0
            ) {
                continue;
            }

            const velocityX =
                projectile.vx /
                velocityLength;

            const velocityY =
                projectile.vy /
                velocityLength;

            const toward =
                dx * velocityX +
                dy * velocityY;

            if (toward <= 0) {
                continue;
            }

            const sideX =
                -velocityY;

            const sideY =
                velocityX;

            const leftX =
                soldier.x +
                sideX * 80;

            const leftY =
                soldier.y +
                sideY * 80;

            const rightX =
                soldier.x -
                sideX * 80;

            const rightY =
                soldier.y -
                sideY * 80;

            const leftBlocked =
                soldier.collidesWithCover(
                    leftX,
                    leftY
                );

            const rightBlocked =
                soldier.collidesWithCover(
                    rightX,
                    rightY
                );

            if (!leftBlocked) {
                return {
                    type: "dodge",
                    x: sideX,
                    y: sideY
                };
            }

            if (!rightBlocked) {
                return {
                    type: "dodge",
                    x: -sideX,
                    y: -sideY
                };
            }
        }

        return null;
    }
}

const heavenlyHell =
    new HeavenlyHell();

window.heavenlyHell =
    heavenlyHell;