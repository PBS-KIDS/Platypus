/**
 * This class is used to create the `platypus.game` object. The `game` object handles loading {Scene}s and transitions between scenes. It also accepts external events and passes them on to the current scene.
 * 
 * @namespace platypus
 * @class Game
 * @constructor
 * @param [definition] {Object} Collection of configuration settings, typically from config.json.
 * @param [definition.global] {Object} Key/value pairs describing global game settings.
 * @param [definition.global.tickerOn=true] {boolean} Whether the game should automatically tick or only tick on `game.tick()` calls.
 * @param {Function} onFinishedLoading An optional function to run once the game has begun.
 * @return {Game} Returns the instantiated game. 
 */
/*global console, createjs, platypus */
/*jslint plusplus:true */
platypus.Game = (function () {
    "use strict";
    
    var ticker = null,
        transitions = {},
        setupTransitions = function (tween, transitions) {
            transitions['fade-to-black'] = function (game, load, complete) {
                var element = document.createElement('div'),
                    root    = game.rootElement;
                
                root.appendChild(element);
                element.style.width = '100%';
                element.style.height = '100%';
                element.style.position = 'absolute';
                element.style.zIndex = '12';
                element.style.opacity = '0';
                element.style.background = '#000';

                tween.get(element.style).to({opacity: 0}, 500).to({opacity: 1}, 500).call(function (t) {
                    load();
                    complete();
                }).wait(500).to({opacity: 0}, 500).call(function (t) {
                    root.removeChild(element);
                    element = null;
                });
            };

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
            };
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
        bindEvent = function (eventId, callback) {
            return function (event) {
                callback(eventId, event);
            };
        },
        game = function (definition, onFinishedLoading) {
            var self = this,
                load = function (result) {
                    var key = '',
                        callback = null,
                        innerRootElement = document.createElement('div'),
                        outerRootElement = null;
                        
                    definition = result;
                    console.log("Game config loaded.", definition);
                    
                    platypus.game = self; //Make this instance the only Game instance.
                    self.currentScene = null;
                    self.loaded    = null;
                    self.settings = definition;
        
                    if (document.getElementById(definition.global.rootElement || "root")) {
                        outerRootElement = document.getElementById(definition.global.rootElement || "root");
                    } else {
                        outerRootElement = document.createElement('div');
                        outerRootElement.id = definition.global.rootElement || "root";
                        document.getElementsByTagName('body')[0].appendChild(outerRootElement);
                    }
                    for (key in platypus.supports) {
                        if (platypus.supports.hasOwnProperty(key) && platypus.supports[key]) {
                            outerRootElement.className += ' supports-' + key;
                        }
                    }
        
                    innerRootElement.id = 'inner-' + outerRootElement.id;
                    outerRootElement.appendChild(innerRootElement);
                    self.rootElement = innerRootElement;
                    self.containerElement = outerRootElement;
        
                    self.loadScene(definition.global.initialScene);
        
                    // Send the following events along to the scene to handle as necessary:
                    if (definition.debug) { //If this is a test build, leave in the browser key combinations so debug tools can be opened as expected.
                        callback = function (eventId, event) {
                            self.currentScene.trigger(eventId, event);
                        };
                    } else { // Otherwise remove default browser behavior for key inputs so that they do not interfere with game-play.
                        callback = function (eventId, event) {
                            self.currentScene.trigger(eventId, event);
                            event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
                        };
                    }
        
                    self.bindings = [];
                    self.addEventListener(window, 'keydown', callback);
                    self.addEventListener(window, 'keyup',   callback);
        
                    // If aspect ratio of game area should be maintained on resizing, create new callback to handle it
                    if (definition.global.aspectRatio) {
        
                        callback = function (eventId, event) {
                            var element   = innerRootElement,
                                ratio     = definition.global.aspectRatio,
                                newW      = outerRootElement.offsetWidth,
                                newH      = outerRootElement.offsetHeight,
                                bodyRatio = 1;
                            
                            if (definition.global.maxWidth && (definition.global.maxWidth < newW)) {
                                newW = definition.global.maxWidth;
                            }
                            
                            bodyRatio = newW / newH;
                            if (bodyRatio > ratio) {  //Width is too wide
                                element.style.height = newH + 'px';
                                newW = newH * ratio;
                                element.style.width = newW + 'px';
                            } else {  //Height is too tall
                                element.style.width = newW + 'px';
                                newH = newW / ratio;
                                element.style.height = newH + 'px';
                            }
                            if (definition.global.resizeFont) {
                                outerRootElement.style.fontSize = Math.round(newW / 20) + 'px';
                            }
                            element.style.marginTop = '-' + Math.round(newH / 2) + 'px';
                            element.style.marginLeft = '-' + Math.round(newW / 2) + 'px';
                            element.style.top = '50%';
                            element.style.left = '50%';
                            self.currentScene.trigger(eventId, event);
                        };
                        callback('resize');
                    } else if (definition.global.resizeFont) {
                        callback = function (eventId, event) {
                            outerRootElement.style.fontSize = Math.round(self.rootElement.offsetWidth / 20) + 'px';
                            self.currentScene.trigger(eventId, event);
                        };
                        callback('resize');
                    }
                    self.addEventListener(window, 'orientationchange', callback);
                    self.addEventListener(window, 'resize',            callback);
        
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
        this.loadedScene = new platypus.Scene(scene, this.rootElement);

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
 * Adding event listeners to the specified element and assigning callback functions.
 * 
 * @method addEventListener
 * @param element {DOMElement} The element to add the eventListener to.
 * @param event {DOMEvent} The event to listen for.
 * @param callback {Function} - The function to call when the event occurs.
 **/
    proto.addEventListener = function (element, event, callback) {
        this.bindings[event] = {element: element, event: event, callback: bindEvent(event, callback)};
        element.addEventListener(event, this.bindings[event].callback, true);
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
        var i = 0;
        
        if (this.tickHandler) {
            ticker.removeEventListener("tick", this.tickHandler);
        }
        for (i = 0; i < this.bindings.length; i++) {
            this.bindings[i].element.removeEventListener(this.bindings[i].event, this.bindings[i].callback);
        }
        this.bindings.length = 0;
    };
    
    return game;
}());
