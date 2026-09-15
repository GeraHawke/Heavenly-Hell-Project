class HeavenlyHell {

    constructor() {
        this.enabled = true;

        this.pathUpdateInterval =
            0.25;

        this.pathRange =
            600;

        this.gridSize =
            25;

        this.maxPathIterations =
            1200;

        this.dodgeLookahead =
            0.65;

        this.dodgeSideDistance =
            80;

        this.dodgeDuration =
            0.16;

        this.dodgeCooldown =
            0.32;

        this.nextPathOffset =
            0;
    }

    getMovementDecision(
        soldier,
        player
    ) {
        if (
            !soldier ||
            soldier.isDead ||
            !player ||
            player.isDead
        ) {
            return null;
        }

        const dodge =
            this.getProjectileDodge(
                soldier,
                player
            );

        if (dodge) {
            return {
                x: dodge.x,
                y: dodge.y,
                dodge: !dodge.dash,
                dash: !!dodge.dash
            };
        }

        const distance =
            Math.hypot(
                player.x - soldier.x,
                player.y - soldier.y
            );

        if (
            distance <=
            soldier.attackRange
        ) {
            return null;
        }

        if (
            soldier.pathRecoveryTimer > 0
        ) {
            return null;
        }

        if (
            soldier.pathTimer <= 0 ||
            soldier.repathRequested ||
            soldier.path.length === 0
        ) {
            const newPath =
                this.findPath(
                    soldier,
                    player
                );

            if (newPath.length > 0) {
                soldier.path =
                    newPath;

                soldier.pathIndex = 0;
            }

            soldier.pathTimer =
                this.pathUpdateInterval;

            soldier.repathRequested =
                false;
        }

        if (
            soldier.path.length === 0
        ) {
            return this.getFallbackDirection(
                soldier,
                player
            );
        }

        while (
            soldier.pathIndex <
            soldier.path.length
        ) {
            const node =
                soldier.path[
                    soldier.pathIndex
                ];

            const distanceToNode =
                Math.hypot(
                    node.x - soldier.x,
                    node.y - soldier.y
                );

            if (
                distanceToNode >= 18
            ) {
                break;
            }

            soldier.pathIndex++;
        }

        if (
            soldier.pathIndex >=
            soldier.path.length
        ) {
            soldier.repathRequested =
                true;

            return this.getFallbackDirection(
                soldier,
                player
            );
        }

        const node =
            soldier.path[
                soldier.pathIndex
            ];

        const dx =
            node.x - soldier.x;

        const dy =
            node.y - soldier.y;

        const length =
            Math.hypot(dx, dy);

        if (length <= 0.001) {
            return null;
        }

        return {
            x: dx / length,
            y: dy / length
        };
    }

    findPath(
        soldier,
        player
    ) {
        const grid =
            this.gridSize;

        const startX =
            Math.round(
                soldier.x / grid
            ) * grid;

        const startY =
            Math.round(
                soldier.y / grid
            ) * grid;

        const goalX =
            Math.round(
                player.x / grid
            ) * grid;

        const goalY =
            Math.round(
                player.y / grid
            ) * grid;

        if (
            Math.hypot(
                goalX - startX,
                goalY - startY
            ) > this.pathRange
        ) {
            return [];
        }

        const startKey =
            `${startX},${startY}`;

        const goalKey =
            `${goalX},${goalY}`;

        const open = [];

        const nodes =
            new Map();

        const closed =
            new Set();

        const startNode = {
            x: startX,
            y: startY,
            g: 0,
            h: Math.hypot(
                goalX - startX,
                goalY - startY
            ),
            f: 0,
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
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1]
        ];

        let iterations = 0;

        while (
            open.length > 0 &&
            iterations <
                this.maxPathIterations
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
                `${current.x},${current.y}`;

            if (
                closed.has(currentKey)
            ) {
                continue;
            }

            closed.add(currentKey);

            if (
                currentKey === goalKey
            ) {
                return this.reconstructPath(
                    current
                );
            }

            for (
                const direction of directions
            ) {
                const nx =
                    current.x +
                    direction[0] *
                    grid;

                const ny =
                    current.y +
                    direction[1] *
                    grid;

                if (
                    Math.hypot(
                        nx - startX,
                        ny - startY
                    ) >
                    this.pathRange
                ) {
                    continue;
                }

                const key =
                    `${nx},${ny}`;

                if (
                    closed.has(key)
                ) {
                    continue;
                }

                if (
                    !this.isWalkable(
                        soldier,
                        nx,
                        ny
                    )
                ) {
                    continue;
                }

                if (
                    direction[0] !== 0 &&
                    direction[1] !== 0
                ) {
                    const sideA =
                        this.isWalkable(
                            soldier,
                            current.x +
                                direction[0] *
                                grid,
                            current.y
                        );

                    const sideB =
                        this.isWalkable(
                            soldier,
                            current.x,
                            current.y +
                                direction[1] *
                                grid
                        );

                    if (
                        !sideA ||
                        !sideB
                    ) {
                        continue;
                    }
                }

                const movementCost =
                    direction[0] !== 0 &&
                    direction[1] !== 0
                        ? 1.414
                        : 1;

                const tentativeG =
                    current.g +
                    movementCost *
                    grid;

                const existing =
                    nodes.get(key);

                if (
                    existing &&
                    tentativeG >=
                        existing.g
                ) {
                    continue;
                }

                const node = {
                    x: nx,
                    y: ny,
                    g: tentativeG,
                    h: Math.hypot(
                        goalX - nx,
                        goalY - ny
                    ),
                    f: 0,
                    parent: current
                };

                node.f =
                    node.g +
                    node.h;

                nodes.set(
                    key,
                    node
                );

                open.push(node);
            }
        }

        return [];
    }

    reconstructPath(node) {
        const path = [];

        let current =
            node;

        while (
            current &&
            current.parent
        ) {
            path.push({
                x: current.x,
                y: current.y
            });

            current =
                current.parent;
        }

        path.reverse();

        return path;
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

    getFallbackDirection(
        soldier,
        player
    ) {
        const dx =
            player.x - soldier.x;

        const dy =
            player.y - soldier.y;

        const distance =
            Math.hypot(dx, dy);

        if (
            distance <= 0.001
        ) {
            return null;
        }

        const directX =
            dx / distance;

        const directY =
            dy / distance;

        const step =
            12;

        if (
            !soldier.collidesWithCover(
                soldier.x +
                    directX *
                    step,
                soldier.y +
                    directY *
                    step
            )
        ) {
            return {
                x: directX,
                y: directY
            };
        }

        const alternatives = [
            {
                x: -directY,
                y: directX
            },
            {
                x: directY,
                y: -directX
            }
        ];

        for (
            const direction of alternatives
        ) {
            if (
                !soldier.collidesWithCover(
                    soldier.x +
                        direction.x *
                        step,
                    soldier.y +
                        direction.y *
                        step
                )
            ) {
                return direction;
            }
        }

        return null;
    }

    getProjectileDodge(
        soldier,
        player
    ) {
        if (
            !player ||
            !player.projectiles ||
            player.projectiles.length === 0
        ) {
            return null;
        }

        if (
            soldier.dodgeCooldown > 0
        ) {
            return null;
        }

        let bestThreat = null;

        for (
            const projectile of
            player.projectiles
        ) {
            if (!projectile) {
                continue;
            }

            const dx =
                soldier.x -
                projectile.x;

            const dy =
                soldier.y -
                projectile.y;

            const distance =
                Math.hypot(
                    dx,
                    dy
                );

            const velocityLength =
                Math.hypot(
                    projectile.vx,
                    projectile.vy
                );

            if (
                velocityLength <=
                0.001
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
                dx *
                velocityX +
                dy *
                velocityY;

            if (
                toward <= 0
            ) {
                continue;
            }

            const perpendicular =
                Math.abs(
                    dx *
                        velocityY -
                    dy *
                        velocityX
                );

            const dangerRadius =
                Math.max(
                    soldier.width,
                    soldier.height
                ) /
                    2 +
                (projectile.radius || 0) +
                18;

            if (
                perpendicular >
                dangerRadius
            ) {
                continue;
            }

            const timeToImpact =
                toward /
                velocityLength;

            if (
                timeToImpact < 0 ||
                timeToImpact >
                    this.dodgeLookahead
            ) {
                continue;
            }

            if (
                !bestThreat ||
                timeToImpact <
                    bestThreat.time
            ) {
                bestThreat = {
                    projectile,
                    time: timeToImpact,
                    velocityX,
                    velocityY
                };
            }
        }

        if (!bestThreat) {
            return null;
        }

        const direction =
            this.chooseDodgeDirection(
                soldier,
                player,
                bestThreat
            );

        if (!direction) {
            return null;
        }

        if (
            soldier.isBlasterCounter &&
            Math.hypot(
                player.x - soldier.x,
                player.y - soldier.y
            ) < 180 &&
            bestThreat.time < 0.30 &&
            soldier.dashCooldown <= 0
        ) {
            return {
                x: direction.x,
                y: direction.y,
                dash: true
            };
        }

        return {
            x: direction.x,
            y: direction.y,
            dash: false
        };
    }

    chooseDodgeDirection(
        soldier,
        player,
        threat
    ) {
        const left = {
            x: -threat.velocityY,
            y: threat.velocityX
        };

        const right = {
            x: threat.velocityY,
            y: -threat.velocityX
        };

        const candidates = [
            left,
            right
        ];

        let best =
            null;

        for (
            const direction of
                candidates
        ) {
            const targetX =
                soldier.x +
                direction.x *
                this.dodgeSideDistance;

            const targetY =
                soldier.y +
                direction.y *
                this.dodgeSideDistance;

            if (
                soldier.collidesWithCover(
                    targetX,
                    targetY
                )
            ) {
                continue;
            }

            const playerDistance =
                Math.hypot(
                    targetX - player.x,
                    targetY - player.y
                );

            if (
                !best ||
                playerDistance >
                    best.playerDistance
            ) {
                best = {
                    x: direction.x,
                    y: direction.y,
                    playerDistance
                };
            }
        }

        if (!best) {
            return null;
        }

        return {
            x: best.x,
            y: best.y
        };
    }
}


window.HeavenlyHell =
    HeavenlyHell;

if (
    !window.heavenlyHell
) {
    window.heavenlyHell =
        new HeavenlyHell();
}