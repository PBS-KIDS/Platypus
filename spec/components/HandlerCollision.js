/* global afterEach, beforeEach, describe, expect, it, platypus, */

describe("Component: HandlerCollision", function () {
    'use strict';

    var Entity = platypus.Entity,
        entity = null;

    describe("once constructed", function () {
        beforeEach(function () {
            entity = new Entity({
                components: [{
                    type: 'HandlerCollision'
                }, {
                    type: 'EntityContainer'
                }]
            });
        });

        afterEach(function () {
            entity = null;
        });

        it("may test shape against map entities for collisions", function (done) {
            var collider = platypus.CollisionShape.setUp(null, {x: 0, y: 0, width: 5, height: 5}),
                noncollider = platypus.CollisionShape.setUp(null, {x: 50, y: 0, width: 5, height: 5}),
                collisions = null;

            entity.addEntity({
                id: 'test-against-entity',
                components: [{
                    type: 'CollisionBasic',
                    collisionType: 'test'
                }],
                properties: {
                    x: 0,
                    y: 0,
                    width: 20,
                    height: 20
                }
            }, function () {
                expect(entity.entities.length).toBe(1);

                collisions = entity.getShapeCollisions(collider, ['test']);
                expect(collisions.length).toBe(1);

                collisions = entity.getShapeCollisions(noncollider, ['test']);
                expect(collisions.length).toBe(0);

                collider.recycle();
                noncollider.recycle();
                done();
            });
        });
    });
});