/**
 * This class is used to create the `platformer.game` object. The `game` object handles loading {Scene}s and transitions between scenes. It also accepts external events and passes them on to the current scene.
 * 
 * 
 * @class Game
 * @constructor
 * @param {Object} [definition] Collection of settings from config.json.
 * @param {Function} onFinishedLoading An optional function to run once the game has begun.
 * @return {Game} Returns the instantiated game. 
 */
 
 // Requires: ["scene.js"]
/*global console, createjs, platformer */
/*jslint plusplus:true */
platformer.Game = (function () {
    "use strict";
    
    var bindEvent = function (eventId, callback) {
            return function (event) {
                callback(eventId, event);
            };
        },
        game      = function (definition, onFinishedLoading) {
            var key = '',
                self = this,
                callback = null,
                innerRootElement = document.createElement('div'),
                outerRootElement = null;

            platformer.game = this; //Make this instance the only Game instance.

            this.currentScene = null;
            this.loaded    = null;
            this.settings = definition;

            // platform-specific settings should apply if not explicitly changed.
            definition.aspects    = definition.aspects    || platformer.settings.aspects;
            definition.supports   = definition.supports   || platformer.settings.supports;
            definition.classes    = definition.classes    || platformer.settings.classes;
            definition.components = definition.components || platformer.settings.components;

            if (document.getElementById(definition.global.rootElement || "root")) {
                outerRootElement = document.getElementById(definition.global.rootElement || "root");
            } else {
                outerRootElement = document.createElement('div');
                outerRootElement.id = definition.global.rootElement || "root";
                document.getElementsByTagName('body')[0].appendChild(outerRootElement);
            }
            for (key in definition.supports) {
                if (definition.supports.hasOwnProperty(key) && definition.supports[key]) {
                    outerRootElement.className += ' supports-' + key;
                }
            }

            innerRootElement.id = 'inner-' + outerRootElement.id;
            outerRootElement.appendChild(innerRootElement);
            this.rootElement = innerRootElement;
            this.containerElement = outerRootElement;

            this.loadScene(definition.global.initialScene);

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

            this.bindings = [];
            this.addEventListener(window, 'keydown', callback);
            this.addEventListener(window, 'keyup',   callback);

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
            this.addEventListener(window, 'orientationchange', callback);
            this.addEventListener(window, 'resize',            callback);

            if (onFinishedLoading) {
                onFinishedLoading(this);
            }

            createjs.Ticker.timingMode = 'raf';
            createjs.Ticker.setFPS(definition.global.fps || 60);
            this.tickWrapper = function (e) {
                self.tick(e);
            };
            createjs.Ticker.addEventListener("tick", this.tickWrapper);

            //Add entity-finder for debugging
            if (window) {
                window.getEntityById = function (id) {
                    return self.getEntityById(id);
                };

                window.getEntitiesByType = function (type) {
                    return self.getEntitiesByType(type);
                };
            }
        },
        proto = game.prototype;
    
/**
 * Called by the CreateJS ticker. This calls tick on the scene.
 * 
 * @method tick
 * @param {Object} tickEvent - CreateJS tick message object.
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
 * Loads a scene. If there is a transition, performs the transition from the current scene to the new scene.
 * 
 * @method loadScene
 * @param sceneId {String} The scene to load.
 * @param transition {String} What type of transition to make. Currently there are: 'fade-to-black' and 'instant'
 **/
    proto.loadScene = function (sceneId, transition, persistantData, preloading) {
        var i = 0,
            self    = this,
            element = null,
            root    = null,
            loaded  = this.loaded,
            callSet = function (t) {
                if (loaded === self.loaded) {
                    self.completeSceneTransition(persistantData);
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
        
        switch (transition) {
        case 'fade-to-black':
            element = document.createElement('div');
            this.rootElement.appendChild(element);
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.position = 'absolute';
            element.style.zIndex = '12';
            element.style.opacity = '0';
            element.style.background = '#000';
            new createjs.Tween(element.style).to({opacity: 0}, 500).to({opacity: 1}, 500).call(function (t) {
                if (!self.loaded) {
                    self.loadNextScene(sceneId, persistantData);
                }
                self.completeSceneTransition(persistantData);
            }).wait(500).to({opacity: 0}, 500).call(function (t) {
                self.rootElement.removeChild(element);
                element = null;
            });
            break;
        case 'crossfade':
            if (!this.loaded) {
                self.loadNextScene(sceneId, persistantData);
                loaded = this.loaded;
            }
            root = this.loadedScene.layers;
            for (i = 0; i < root.length; i++) {
                if (root[i].element) {
                    element = root[i].element.style;
                    element.opacity = '0';
                    if (callSet) {                       // v-- This extra "to" is to bypass a createJS bug - DDD 1-6-2015
                        new createjs.Tween.get(element).to({opacity: 0}, 5).to({opacity: 1}, 1000).call(callSet);
                        callSet = null;
                    } else {                           // v-- This extra "to" is to bypass a createJS bug - DDD 1-6-2015
                        new createjs.Tween.get(element).to({opacity: 0}, 5).to({opacity: 1}, 1000);
                    }
                }
            }
            if (callSet) { // nothing to crossfade so we just finish loading the scene.
                self.completeSceneTransition(persistantData);
            }
            break;
        default:
            if (!this.loaded) {
                self.loadNextScene(sceneId, persistantData);
            }
            this.completeSceneTransition(persistantData);
        }
    };
    
/**
 * Sets the currentScene to the specified scene. Called by loadScene: shouldn't be called on its own.
 * 
 * @method loadNextScene
 * @param {String} sceneId The scene to load.
 * @param {Object} [persistantData] Data sent into the new scene from the calling scene.
 **/
    proto.loadNextScene = function (sceneId, persistantData) {
        var scene = null;
        
        if (typeof sceneId === 'string') {
            scene = this.settings.scenes[sceneId];
        } else {
            scene = sceneId;
        }
        
        this.loaded = sceneId;
        this.loadedScene = new platformer.Scene(scene, this.rootElement);

        console.log('Scene loaded: ' + sceneId); //putting a console log here, because Android seems to hang if I do not. Need to test more Android devices.
        this.loadedScene.trigger('scene-loaded', persistantData);
    };
    
/**
 * Ends the transition and destroys the old scene. Called when the scene effect is finished.
 * 
 * @method completeSceneTransition
 * @param {Object} [persistantData] Data sent into the new scene from the calling scene.
 **/
    proto.completeSceneTransition = function (persistantData) {
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
            this.currentScene.trigger('scene-live', persistantData);
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
        
        createjs.Ticker.removeEventListener("tick", this.tickWrapper);
        for (i = 0; i < this.bindings.length; i++) {
            this.bindings[i].element.removeEventListener(this.bindings[i].event, this.bindings[i].callback);
        }
        this.bindings.length = 0;
    };
    
    return game;
}());
