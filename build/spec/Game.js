/* global beforeAll, describe, document, expect, it, platypus, springroll */

describe("Game", function () {
    'use strict';

    var app = null,
        canvas = document.createElement('canvas');
      
    canvas.setAttribute('id', 'stage');
    document.body.appendChild(canvas);

    beforeAll(function (done) {
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

    describe("with missing configuration or SpringRoll application", function () {
        var game = new platypus.Game();

        it("will not be the platypus game instance", function () {
            expect(game).not.toBe(platypus.game);
        });
    });

    describe("with configuration and SpringRoll application", function () {
        it("will be the platypus game instance", function () {
            expect(platypus.game).not.toBeUndefined();
            expect(platypus.game).toBe(app.platypus);
        });
          
        it("will be available from both `platypus.game` and SpringRoll's `app.platypusGame`", function () {
            expect(platypus.game).toBe(app.platypusGame);
        });
    });

    it("contains spec with an expectation", function () {
        expect(true).toBe(true);
    });
});