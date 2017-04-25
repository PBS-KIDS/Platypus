/* global beforeEach, describe, document, expect, it, platypus, springroll */

describe("Game", function () {
    'use strict';

    describe("with missing configuration or SpringRoll application", function () {
        var game = new platypus.Game();

        it("will not be the platypus game instance", function () {
            expect(game).not.toBe(platypus.game);
        });
    });

    describe("with configuration and SpringRoll application", function () {
        var app = null,
            canvas = document.createElement('canvas');
          
        canvas.setAttribute('id', 'stage');
        document.body.appendChild(canvas);

        beforeEach(function (done) {
            app = new springroll.Application({
                name: "Jasmine Test",
                canvasId: "stage",
                configPath: "spec/config.json",
                display: springroll.pixi.PixiDisplay,
                state: "test-scene"
            });
            app.on('init', function () {
                done();
            });
        });
          
        it("will be the platypus game instance", function () {
            expect(platypus.game).not.toBeUndefined();
        });
    });

    it("contains spec with an expectation", function () {
        expect(true).toBe(true);
    });
});