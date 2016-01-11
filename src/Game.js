/**
 * This class is used to create the `platypus.game` object and loads the Platypus game as described by the game configuration files.
 * 
 * @namespace platypus
 * @class Game
 * @constructor
 * @param definition {Object} Collection of configuration settings, typically from config.json.
 * @param applicationInstance {springroll.Application} The Spring Roll application that the Platypus game is in.
 * @param [onFinishedLoading] {Function} An optional function to run once the game has begun.
 * @return {platypus.Game} Returns the instantiated game. 
 */
/*global console, createjs, PIXI, platypus, springroll */
/*jslint plusplus:true */
platypus.Game = (function () {
    "use strict";
    
    var Container   = include('PIXI.Container'),
        Scene       = include('platypus.Scene'),
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
        game = function (definition, applicationInstance, onFinishedLoading) {
            var load = function (settings) {
                    var scene  = '',
                        states = this.app.states || {};
                    
                    platypus.game = this; //Make this instance the only Game instance.

                    this.currentScene = null;
                    this.settings = settings;
                    this.stage = this.app.display.stage;
                    
                    // Create Game Scenes.
                    for (scene in settings.scenes) {
                        if (settings.scenes.hasOwnProperty(scene)) {
                            states[settings.scenes[scene].id] = new Scene(new Container(), settings.scenes[scene]);
                        }
                    }
                    
                    if (!this.app.states) {
                        this.app.states = states;
                    }
                    
                    if (onFinishedLoading) {
                        onFinishedLoading(this);
                    }
                    
                    //Add Debug tools
                    window.getEntityById = function (id) {
                        return this.getEntityById(id);
                    }.bind(this);
    
                    window.getEntitiesByType = function (type) {
                        return this.getEntitiesByType(type);
                    }.bind(this);
                    
                    window.getVisibleSprites = function (c, a) {
                        var i = 0;
                        
                        a = a || [];
                        c = c || this.stage;
                        
                        if (!c.texture && c.visible) {
                            for (i = 0; i < c.children.length; i++) {
                                window.getVisibleSprites(c.children[i], a);
                            }
                            return a;
                        } else if (c.visible) {
                            a.push(c);
                            return a;
                        }
                        return a;
                    }.bind(this);
                }.bind(this);
            
            this.app = applicationInstance;
            
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
        
    /**
    * This method causes the game to tick once. It's called by the SpringRoll Application.
    *
    * @method tick
    * @param tickEvent {Object} Key/value pairs passed on to the current scene.
    * @param tickEvent.delta {number} The time elapsed since the last tick.
    **/
    proto.tick = function (tickEvent) {
        if (this.currentScene) {
            this.currentScene.triggerOnChildren('tick', tickEvent);
            //this.stage.update(tickEvent);
        }
    };
    
    /**
    * Loads a scene.
    *
    * @method loadScene
    * @param sceneId {String} The scene to load.
    * @param transition="instant" {String} What type of transition to make. Currently there are: 'fade-to-black', 'crossfade', and 'instant'.
    * @param data {Object} A list of key/value pairs describing options or settings for the loading scene.
    * @param preloading=false {boolean} Whether the scene should appear immediately or just be loaded and not shown.
    **/
    proto.loadScene = function (sceneId, data) {
        this.app.states[sceneId].data = data; //sets data to send to next scene.
        this.app.manager.state = sceneId;
    };
    
    /**
    * This method will return the first entity it finds with a matching id.
    *
    * @method getEntityById
    * @param {string} id The entity id to find.
    * @return {platypus.Entity} Returns the entity that matches the specified entity id.
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
    };
    
    return game;
}());
