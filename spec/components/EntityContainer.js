/* global afterEach, beforeEach, describe, expect, it, platypus, */

describe("Component: EntityContainer", function () {
    'use strict';

    var Entity = platypus.Entity,
        entity = null;

    describe("once constructed", function () {
        beforeEach(function () {
            entity = new Entity({
                components: [{
                    type: 'EntityContainer'
                }]
            });
        });

        afterEach(function () {
            entity = null;
        });

        it("may add a previously built entity", function (done) {
            entity.addEntity(new Entity({
                components: [{
                    type: 'EntityContainer'
                }]
            }), function () {
                expect(entity.entities.length).toBe(1);
                done();
            });
        });

        it("may add entity by a settings definition", function (done) {
            entity.addEntity('predefined-entity', function () {
                entity.addEntity({
                    type: 'predefined-entity'
                }, function () {
                    expect(entity.entities.length).toBe(2);
                    done();
                });
            });
        });

        it("may add entity by defining a definition", function (done) {
            entity.addEntity({
                id: 'defined-entity'
            }, function () {
                expect(entity.entities.length).toBe(1);
                done();
            });
        });
    });
});