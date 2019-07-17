/* global afterEach, beforeEach, describe, expect, it, platypus, */

describe("CollisionShape", function () {
    
    var collisionShape = null,
        owner = {
            x: 1,
            y: 2
        },
        definition = {
            offsetX: 0,
            offsetY: 0,
            x: 0,
            y: 0
        };

    describe("during construction", function () {
        it("x position defaults to owner x position", function () {
            collisionShape = platypus.CollisionShape.setUp(owner, {});

            expect(collisionShape.x).toBe(owner.x);

            collisionShape.recycle();
        });

        it("y position defaults to owner y position", function () {
            collisionShape = platypus.CollisionShape.setUp(owner, {});

            expect(collisionShape.y).toBe(owner.y);

            collisionShape.recycle();
        });
    });

    describe("once constructed", function () {
        beforeEach(function () {
            collisionShape = platypus.CollisionShape.setUp(owner, definition);
        });

        afterEach(function () {
            collisionShape.recycle();
        });

        it("can move", function () {
            collisionShape.moveXY(10, 20);

            expect(collisionShape.x).toBe(10);
            expect(collisionShape.y).toBe(20);
            expect(collisionShape.aABB.x).toBe(10);
            expect(collisionShape.aABB.y).toBe(20);
        });
    });
});