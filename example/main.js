/**
 * 
 */
/*global platypus */
(function (window) {
    "use strict";
    
    var config = {
            "global": {
                "autoLoad": true,
                "initialScene": "load",
                "fps": 60,
                "rootElement": "root",
                "aspectRatio": 1.333,
                "nativeAssetResolution": 960,
                "resizeFont": true
            },
            "source": { 
                "assets": [
                    // Audio
                    {"id": "audio-sprite", "src": "audio/combined.m4a", "data": { "audioSprite": [
                        {"id": "walk", "startTime": 3200,  "duration": 330},
                        {"id": "jump", "startTime": 1600,  "duration": 250}
                    ]}},
        
                    // Images
                    {"id": "buttons",        "src": "images/buttons.png"},
                    {"id": "mookie",         "src": "images/mookie.png",       "data": {"spritesheet": "images/mookie.json", "rows": 4, "columns": 4}},
                    {"id": "game-sprites",   "src": "images/game-sprites.png", "data": {"rows": 4, "columns": 4}},
                    {"id": "title-screen",   "src": "images/title-screen.png", "compression": 64}
                ],
                "entities": [ // JSON files describing entities
                    "entities/action-layer.json",
                    "entities/desktop-interface-layer.json",
                    "entities/multitouch-interface-layer.json",
                    "entities/touch-interface-layer.json",
                    "entities/tile-layer.json",
                    "entities/render-layer.json",
                    "entities/collision-layer.json",
                    "entities/button-fullscreen.json",
                    "entities/button-jump.json",
                    "entities/button-jump-left.json",
                    "entities/button-jump-right.json",
                    "entities/button-left.json",
                    "entities/button-play-game.json",
                    "entities/button-right.json",
                    "entities/button-mute.json",
                    "entities/hero.json",
                    "entities/level-portal.json",
                    "entities/title-screen.json",
                    "entities/fps-counter.json"
                ],
                "scenes": [ // JSON files describing scenes
                    "scenes/load.json",
                    "scenes/menu.json",
                    "scenes/scene-level-1.json"
                ],
                "levels": [ // JSON files describing levels
                    {"id": "level-1", "src": "levels/level-1.json"} // If "src" key is included, this will be replaced by the JSON structure in the linked file.
                ]
            }
        };

    // Example of a custom component being created prior to its use by an entity (referenced by its provided id). "createComponentClass" adds the new component to the list of available components.
    (function () {
        return platypus.createComponentClass({
            id: "logic-hero",
            constructor: function (definition) {
                var state = this.state = this.owner.state;
                state.swing = false;
                state.swingHit = false;
                
                this.teleportDestination = undefined;
                this.justTeleported = false;
            },
            events:{
                "handle-logic": function () {            
                },
                "portal-waiting": function (portal) {
                    portal.trigger('activate-portal');
                }
            }
        });
    }())
    
    if (window) {
        window.addEventListener('load', function () {
            window.game = new platypus.Game(config);
        }, false);
    }
}(window));
