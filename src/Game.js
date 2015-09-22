/**
 * This class is used to create the `platypus.game` object. The `game` object handles loading {Scene}s and transitions between scenes. It also accepts external events and passes them on to the current scene.
 * 
 * @namespace platypus
 * @class Game
 * @constructor
 * @param [definition] {Object} Collection of configuration settings, typically from config.json.
 * @param [definition.global] {Object} Key/value pairs describing global game settings.
 * @param [definition.global.tickerOn=true] {boolean} Whether the game should automatically tick or only tick on `game.tick()` calls.
 * @param onFinishedLoading {Function} An optional function to run once the game has begun.
 * @return {Game} Returns the instantiated game. 
 */
/*global console, createjs, PIXI, platypus, springroll */
/*jslint plusplus:true */
platypus.Game = (function () {
    "use strict";
    
    var ticker = null,
        Stage = null,
        transitions = {},
        setupTransitions = function (tween, transitions) { //TODO: fix transitions
            transitions['fade-to-black'] = function (game, load, complete) {
                var stage  = game.stage,
                    canvas = springroll.Application.instance.display.canvas,
                    black  = new PIXI.Graphics();

                black.beginFill('#000').drawRect(0, 0, canvas.width, canvas.height);
                black.alpha = 0;
                stage.addChild(black);
                
                tween.get(black).to({alpha: 1}, 500).wait(250).call(function (t) {
                    load();
                    complete();

                    // Make sure shape is on top:
                    stage.removeChild(black);
                    stage.addChild(black);
                    
                    // Commence tween here to accommodate any delay from loading above.
                    /*window.springroll.*/setTimeout(function () {
                        tween.get(black).to({alpha: 0}, 500).call(function (t) {
                            stage.removeChild(black);
                        });
                    }, 250);
                });
            };

            /* TODO: Convert from DOM to Canvas - DDD 8-19-2015
            transitions.crossfade = function (game, load, complete) {
                var i = 0,
                    element = null,
                    instant = true,
                    root    = null;
                
                load();
                root = game.loadedScene.layers;
                for (i = 0; i < root.length; i++) {
                    if (root[i].element) {
                        element = root[i].element.style;
                        element.opacity = '0';
                        if (instant) {                       // v-- This extra "to" is to bypass a createJS bug - DDD 1-6-2015
                            tween.get(element).to({opacity: 0}, 5).to({opacity: 1}, 1000).call(complete);
                            instant = false;
                        } else {                           // v-- This extra "to" is to bypass a createJS bug - DDD 1-6-2015
                            tween.get(element).to({opacity: 0}, 5).to({opacity: 1}, 1000);
                        }
                    }
                }
                if (instant) { // nothing to crossfade so we just finish loading the scene.
                    complete();
                }
            };*/
        },
        getJSON = function (path, callback) {
            var xhr = new XMLHttpRequest();
            
            xhr.open('GET', path, true);
            xhr.responseType = 'text';
            xhr.onload = function () {
                var obj = null;
                
                if (xhr.status === 200) {
                    try {
                        obj = JSON.parse(xhr.responseText);
                    } catch (e) {
                        console.warn('Error parsing "' + path + '": ' + e.message);
                    }
                } else {
                    console.warn('Error opening "' + path + '": ' + xhr.description);
                }
                
                callback(obj);
            };
            xhr.send();
        },
        loadJSONLinks = function (obj, callback) {
            var i = 0,
                key = '',
                callbacks = 0,
                resolve = function (result) {
                    callbacks -= 1;
                    if (!callbacks) {
                        callback(obj);
                    }
                },
                assign = function (obj, i, callback) {
                    loadJSONLinks(obj[i], function (result) {
                        obj[i] = result;
                        callback(result);
                    });
                };
            
            if (obj) {
                if (Array.isArray(obj)) {
                    callbacks = obj.length;
                    if (callbacks) {
                        for (i = 0; i < obj.length; i++) {
                            assign(obj, i, resolve);
                        }
                    } else {
                        callback(obj);
                    }
                    return;
                } else if (typeof obj === 'object') {
                    if (obj.src && (obj.src.length > 5) && (obj.src.substring(obj.src.length - 5).toLowerCase() === '.json')) {
                        loadJSONLinks(obj.src, function (result) {
                            if (obj.src !== result) {
                                obj = result;
                            }
                            callback(obj);
                        });
                    } else {
                        for (key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                callbacks += 1;
                            }
                        }
                        if (callbacks) {
                            for (key in obj) {
                                if (obj.hasOwnProperty(key)) {
                                    assign(obj, key, resolve);
                                }
                            }
                        } else {
                            callback(obj);
                        }
                    }
                    return;
                } else if ((typeof obj === 'string') && (obj.length > 5) && (obj.substring(obj.length - 5).toLowerCase() === '.json')) {
                    getJSON(obj, function (result) {
                        if (typeof result === 'object') {
                            loadJSONLinks(result, callback);
                        } else {
                            callback(result);
                        }
                    });
                    return;
                }
            }
            
            callback(obj);
        },
        game = function (definition, stage, onFinishedLoading) {
            var self = this,
                load = function (result) {
                    var canvas = null;
                    
                    definition = result;
                    console.log("Game config loaded.", definition);
                    
                    platypus.game = self; //Make this instance the only Game instance.
                    self.currentScene = null;
                    self.loaded    = null;
                    self.settings = definition;
                    
                    if (stage) {
                        self.stage = stage;
                    } else if (Stage) {
                        try {
                            canvas = document.getElementById(definition.global.canvas);
                        } catch (e) {
                            console.warn('Stage not provided and canvas ID "' + definition.global.canvas + '" not found in HTML wrapper.');
                        }
                        self.stage = new Stage(canvas);
                    } else {
                        console.warn('Platypus requires a CreateJS Stage for rendering.');
                    }
        
                    self.loadScene(definition.global.initialScene);
        
                    if (onFinishedLoading) {
                        onFinishedLoading(self);
                    }
                    
                    if (ticker && (definition.global.tickerOn !== false)) {
                        self.tickHandler = function (e) {
                            self.tick(e);
                        };
                        ticker.timingMode = 'raf';
                        ticker.setFPS(definition.global.fps || 60);
                        ticker.addEventListener("tick", self.tickHandler);
                    }
        
                    //Add entity-finder for debugging
                    if (window) {
                        window.getEntityById = function (id) {
                            return self.getEntityById(id);
                        };
        
                        window.getEntitiesByType = function (type) {
                            return self.getEntitiesByType(type);
                        };
                    }
                };

            if (!definition) {
                console.warn('No game definition is supplied. Game not created.');
                return null;
            }
            
            if (typeof definition === 'string') {
                loadJSONLinks(definition, load);
            } else {
                load(definition);
            }
        },
        proto = game.prototype;
        
    if (window.createjs) {
        // Determine whether auto-ticking is a possibility
        if (window.createjs.Ticker) {
            ticker = window.createjs.Ticker;
        }
        
        // Determine whether CreateJS tweening is loaded
        if (window.createjs.Tween) {
            setupTransitions(window.createjs.Tween, transitions);
        }
        
        if (window.createjs.Stage) {
            Stage = window.createjs.Stage;
        }
    }
    
    /**
    * This method causes the game to tick once. It's called automatically if the global setting `tickerOn` is `true` (default value). If this setting is `false`, `game.tick()` must be called to enact each tick.
    *
    * @method tick
    * @param tickEvent {Object} Key/value pairs passed on to the current scene.
    * @param tickEvent.delta {number} The time elapsed since the last tick.
    **/
    proto.tick = function (tickEvent) {
        if (this.loadedScene) {
            this.loadedScene.trigger('tick', tickEvent);
        }
        if (this.currentScene) {
            this.currentScene.trigger('tick', tickEvent);
            //this.stage.update(tickEvent);
        }
    };
    
    /**
    * Loads a scene. If there is a transition, performs the transition from the current scene to the new scene. Note that the CreateJS Tween library must be included for transitions to work; otherwise scene transitions are always instant.
    *
    * @method loadScene
    * @param sceneId {String} The scene to load.
    * @param transition="instant" {String} What type of transition to make. Currently there are: 'fade-to-black', 'crossfade', and 'instant'.
    * @param data {Object} A list of key/value pairs describing options or settings for the loading scene.
    * @param preloading=false {boolean} Whether the scene should appear immediately or just be loaded and not shown.
    **/
    proto.loadScene = function (sceneId, transition, data, preloading) {
        var self    = this,
            loaded  = this.loaded,
            loadHandler = function () {
                if (!self.loaded) {
                    self.loadNextScene(sceneId, data);
                }
            },
            completionHandler = function () {
                if (!loaded || (loaded === self.loaded)) {
                    self.completeSceneTransition(data);
                }
            };

        if (this.leavingScene) {
            this.leavingScene.destroy();
        }
        
        this.inTransition = true;
        this.leavingScene = this.currentScene;
        
        if (preloading) {
            this.loadNextScene(sceneId);
            return;
        } else if (this.loadedScene) {
            this.loadedScene.destroy();
            this.loadedScene = null;
        }
        
        if (transitions[transition]) {
            transitions[transition](this, loadHandler, completionHandler);
        } else {
            loadHandler();
            completionHandler();
        }
    };
    
    /**
    * Sets the currentScene to the specified scene. Called by loadScene: shouldn't be called on its own.
    *
    * @method loadNextScene
    * @param sceneId {String} The scene to load.
    * @param [data] {Object} Data sent into the new scene from the calling scene.
    **/
    proto.loadNextScene = function (sceneId, data) {
        var scene = null;
        
        if (typeof sceneId === 'string') {
            scene = this.settings.scenes[sceneId];
        } else {
            scene = sceneId;
        }
        
        this.loaded = sceneId;
        this.loadedScene = new platypus.Scene(scene, this.stage);

        console.log('Scene loaded: ' + sceneId); //putting a console log here, because Android seems to hang if I do not. Need to test more Android devices.
        this.loadedScene.trigger('scene-loaded', data);
    };
    
    /**
    * Ends the transition and destroys the old scene. Called when the scene transition is finished.
    *
    * @method completeSceneTransition
    * @param [data] {Object} Data sent into the new scene from the calling scene.
    **/
    proto.completeSceneTransition = function (data) {
        var sceneId = this.loaded;
        
        if (this.loadedScene) {
            this.currentScene = this.loadedScene;
            this.loadedScene  = null;
            
            this.loaded = false;
            this.inTransition = false;
            if (this.leavingScene) {
                this.leavingScene.destroy();
                this.leavingScene = false;
            }

            console.log('Scene live: ' + sceneId); //putting a console log here, because Android seems to hang if I do not. Need to test more Android devices.
            this.currentScene.trigger('scene-live', data);
        }
    };

    /**
    * This method will return the first entity it finds with a matching id.
    *
    * @method getEntityById
    * @param {string} id The entity id to find.
    * @return {Entity} Returns the entity that matches the specified entity id.
    **/
    proto.getEntityById = function (id) {
        if (this.currentScene) {
            return this.currentScene.getEntityById(id);
        } else {
            return null;
        }
    };

    /**
    * This method will return all game entities that match the provided type.
    *
    * @method getEntitiesByType
    * @param {String} type The entity type to find.
    * @return entities {Array} Returns the entities that match the specified entity type.
    **/
    proto.getEntitiesByType = function (type) {
        if (this.currentScene) {
            return this.currentScene.getEntitiesByType(type);
        } else {
            return [];
        }
    };
    
    /**
    * This method destroys the game.
    *
    * @method destroy
    **/
    proto.destroy = function () {
        if (this.tickHandler) {
            ticker.removeEventListener("tick", this.tickHandler);
        }
    };
    
    return game;
}());
