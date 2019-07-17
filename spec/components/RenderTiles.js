/* global afterEach, beforeEach, describe, expect, it, platypus, */

describe("Component: RenderTiles", function () {
    

    var Entity = platypus.Entity,
        entity = null;

    describe("once constructed", function () {
        beforeEach(function () {
            entity = new Entity({
                components: [{
                    type: 'RenderTiles',
                    imageMap: [
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0]
                    ]
                }]
            });
        });

        afterEach(function () {
            entity = null;
        });

        it("will create a cache with dimensions of multiples of 2", function () {
            expect(entity.components[0].cacheWidth).toBe(64);
            expect(entity.components[0].cacheHeight).toBe(32);
        });

        it("will fit tiles into cache and include a bleed region", function () {
            entity.components[0].updateRegion(0);
            expect(entity.components[0].cacheTilesWidth).toBe(4);
            expect(entity.components[0].cacheTilesHeight).toBe(3);
            expect(entity.components[0].cacheClipWidth).toBe(40);
            expect(entity.components[0].cacheClipHeight).toBe(30);
        });
    });
});