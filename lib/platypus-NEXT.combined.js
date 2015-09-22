/*!
* Platypus
* 
*/


//##############################################################################
// version.js
//##############################################################################

this.platypus = this.platypus || {};

(function() {
	"use strict";

	/**
	 * The version string for this release.
	 * @property version
	 * @type String
	 * @static
	 **/
	platypus.version = /*=version*/"NEXT"; // injected by build process

	/**
	 * The build date for this release in UTC format.
	 * @property buildDate
	 * @type String
	 * @static
	 **/
	platypus.buildDate = /*=date*/"Tue, 22 Sep 2015 12:22:57 GMT"; // injected by build process

})();

//##############################################################################
// Game.js
//##############################################################################

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

//##############################################################################
// Messenger.js
//##############################################################################

/**
 * The Messenger object facilitates communication between components and other game objects. Messenger is currently used by [[Entity]] and [[EntityContainer]].
 * 
 * @namespace platypus
 * @class Messenger
 */
/*global console, platypus */
/*jslint plusplus:true */
platypus.Messenger = (function () {
    "use strict";

    var messenger = function () {
            this.messages    = {};
            this.loopCheck   = [];
            this.unbindLater = [];
        },
        proto = messenger.prototype;
    
    /**
     * Returns a string describing the messenger as "[messenger object]".
     * 
     * @method toString
     * @return String
     */
    proto.toString = function () {
        return "[messenger Object]";
    };
    
    /**
     * Used by components to bind handler functions to triggered events.
     * 
     * @method bind
     * @param event {String} This is the message being listened for.
     * @param func {Function} This is the function that will be run when the message is triggered.
     * @param scope {Object} This is the scope with which the function should be run.
     */
    proto.bind = function (event, callback, scope) {
        if (!this.messages[event]) {
            this.messages[event] = [];
        }
        this.messages[event].push({callback: callback, scope: scope});
    };
    
    /**
     * Used to safely unbind handler functions when in the middle of events occurring by delaying removal until the end of the game tick.
     * 
     * @method unbind
     * @param event {String} This is the message the component is currently listening to.
     * @param callback {Function} This is the function that was attached to the message.
     * @param scope {Function} This is the scope of the function that was attached to the message.
     */
    proto.unbind = function (event, callback, scope) {
        var found = false, j = 0;
        
        if (this.loopCheck.length) {
            for (j = 0; j < this.loopCheck.length; j++) {
                if (this.loopCheck[j] === event) {
                    found = true;
                    break;
                }
            }
        }
            
        if (found) { //We're currently busy triggering messages like this, so we shouldn't remove message handlers until we're finished.
            this.unbindLater.push({event: event, callback: callback, scope: scope});
        } else {
            this.safelyUnbind(event, callback, scope);
        }
    };
    
    /**
     * Unbinds functions once everything is safe.
     * 
     * @method safelyUnbind
     * @param event {String} This is the message the component is currently listening to.
     * @param callback {Function} This is the function that was attached to the message.
     * @param scope {Function} This is the scope of the function that was attached to the message.
     */
    proto.safelyUnbind = function (event, callback, scope) {
        var i = 0;
        
        if (!this.messages[event]) {
            this.messages[event] = [];
        }
        for (i = 0; i < this.messages[event].length; i++) {
            if ((this.messages[event][i].callback === callback) && (this.messages[event][i].scope === scope)) {
                this.messages[event].splice(i, 1);
                break;
            }
        }
    };
    
    /**
     * This method is used by both internal components and external entities to trigger messages. When triggered, messenger checks through bound handlers to run as appropriate. This handles multiple event structures: "", [], and {}
     * 
     * @method trigger
     * @param event {String|Array|Object} This is the message(s) to process. This can be a string, an object containing an "event" property (and optionally a "message" property, overriding the value below), or an array of the same.
     * @param value {*} This is a message object or other value to pass along to event handler.
     * @param debug {boolean} This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
     * @return {number} The number of handlers for the triggered message.
     */
    proto.trigger = function (events, message, debug) {
        var i = 0,
            count = 0;
        
        if (typeof events === 'string') {
            return this.triggerEvent(events, message, debug);
        } else if (Array.isArray(events)) {
            for (i = 0; i < events.length; i++) {
                count += this.trigger(events[i], message, debug);
            }
            return count;
        } else if (events.event) {
            return this.triggerEvent(events.event, events.message || message, events.debug || debug);
        } else {
            console.warn('Event incorrectly formatted: must be string, array, or object containing an "event" property.', events);
            return 0;
        }
    };
    
    /**
     *  This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run as appropriate.
     * 
     * @method triggerEvent
     * @param event {String} This is the message to process.
     * @param value {*} This is a message object or other value to pass along to event handler.
     * @param debug {boolean} This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
     * @return {number} The number of handlers for the triggered message.
     */
    proto.triggerEvent = function (event, value, debug) {
        var i = 0, j = 0, debugCount = 0;
        
        // Debug logging.
        if (this.debug || debug || (value && value.debug)) {
            if (this.messages[event] && this.messages[event].length) {
                console.log('Entity "' + this.type + '": Event "' + event + '" has ' + this.messages[event].length + ' subscriber' + ((this.messages[event].length > 1) ? 's' : '') + '.', value);
            } else {
                console.warn('Entity "' + this.type + '": Event "' + event + '" has no subscribers.', value);
            }
            
            for (i = 0; i < this.loopCheck.length; i++) {
                if (this.loopCheck[i] === event) {
                    debugCount += 1;
                    if (debugCount > 5) {
                        throw "Endless loop detected for '" + event + "'.";
                    } else {
                        console.warn("Event '" + event + "' is nested inside another '" + event + "' event.");
                    }
                }
            }
            i = 0;
        }

        this.loopCheck.push(event);
        if (this.messages[event]) {
            for (i = 0; i < this.messages[event].length; i++) {
                this.messages[event][i].callback.call(this.messages[event][i].scope || this, value, debug);
            }
        }
        this.loopCheck.length = this.loopCheck.length - 1;
        
        if (!this.loopCheck.length && this.unbindLater.length) {
            for (j = 0; j < this.unbindLater.length; j++) {
                this.safelyUnbind(this.unbindLater[j].event, this.unbindLater[j].callback, this.unbindLater[j].scope);
            }
            this.unbindLater.length = 0;
        }
        
        return i;
    };
    
    /**
     * This method returns all the messages that this entity is concerned about.
     * 
     * @method getMessageIds
     * @return {Array} An array of strings listing all the messages for which this messenger has handlers.
     */
    proto.getMessageIds = function () {
        return Object.keys(this.messages);
    };
    
    /**
     * This method returns the entire list of event handlers for a given event.
     * 
     * @method copyEventHandlers
     * @param event {String} The name of the event.
     * @return {Array} The list of handlers for the event.
     */
    proto.copyEventHandlers = function (event) {
        return this.messages[event] || null;
    };
    
    return messenger;
}());

//##############################################################################
// Scene.js
//##############################################################################

/**
 * This class is instantiated by [[Game]] and contains one or more entities as layers. Each layer [[Entity]] handles a unique aspect of the scene. For example, one layer might contain the game world, while another layer contains the game interface. Generally there is only a single scene loaded at any given moment.
 * ## JSON Definition
 *     {
 *         "layers":[
 *         // Required array listing the entities that should be loaded as scene layers. These can be actual entity JSON definitions as shown in [[Entity]] or references to entities by using the following specification.
 * 
 *             {
 *                 "type": "entity-id",
 *                 // This value maps to an entity definition with a matching "id" value as shown in [[Entity]] and will load that definition.
 *                 
 *                 "properties":{"x": 400}
 *                 // Optional. If properties are passed in this reference, they override the entity definition's properties of the same name.
 *             }
 *         ]
 *     }
 * @namespace platypus
 * @class Scene
 * @constructor
 * @param {Object} [definition] Base definition for the scene, including one or more layers with both properties, filters, and components as shown above under "JSON Definition Example".
 * @param {String} [definition.id] This declares the id of the scene.
 * @param {Array} [definition.layers] This lists the layers that comprise the scene.
 * @param Stage {createjs.Stage} Object where the scene displays layers.
 * @return {Scene} Returns the new scene made up of the provided layers. 
 * 
 *     
Requires: ["Entity.js"]
*/
/*global platypus */
/*jslint plusplus:true */
platypus.Scene = (function () {
    "use strict";
    
    var scene = function (definition, stage) {
            var i = 0,
                key = '',
                layers = definition.layers,
                supportedLayer = true,
                layerDefinition = false,
                properties = null,
                messages = null;

            this.id = definition.id;

            this.storedMessages = [];

            this.stage = stage;
            this.layers = [];
            for (i = 0; i < layers.length; i++) {
                layerDefinition = layers[i];
                properties = {stage: this.stage, parent: this};
                if (layerDefinition.properties) {
                    for (key in layerDefinition.properties) {
                        if (layerDefinition.properties.hasOwnProperty(key)) {
                            properties[key] = layerDefinition.properties[key];
                        }
                    }
                }

                if (layerDefinition.type) { // this layer should be loaded from an entity definition rather than this instance
                    layerDefinition = platypus.game.settings.entities[layerDefinition.type];
                }

                supportedLayer = true;
                if (layerDefinition.filter) {
                    if (layerDefinition.filter.includes) {
                        supportedLayer = false;
                        for (key in layerDefinition.filter.includes) {
                            if (layerDefinition.filter.includes.hasOwnProperty(key) && platypus.supports[layerDefinition.filter.includes[key]]) {
                                supportedLayer = true;
                            }
                        }
                    }
                    if (layerDefinition.filter.excludes) {
                        for (key in layerDefinition.filter.excludes) {
                            if (layerDefinition.filter.excludes.hasOwnProperty(key) && platypus.supports[layerDefinition.filter.excludes[key]]) {
                                supportedLayer = false;
                            }
                        }
                    }
                }
                if (supportedLayer) {
                    this.layers.push(new platypus.Entity(layerDefinition, {
                        properties: properties
                    }));
                }
            }
            // This allows the layer to gather messages that are triggered as it is loading and deliver them to all the layers once all the layers are in place.
            messages = this.storedMessages;
            this.storedMessages = false;
            for (i = 0; i < messages.length; i++) {
                this.trigger(messages[i].message, messages[i].value);
            }
            messages.length = 0;

            this.time = new Date().getTime();
            this.timeElapsed = {
                name: '',
                time: 0
            };
        },
        proto = scene.prototype;
    
/**
 * This method is used by external objects to trigger messages on the layers as well as internal entities broadcasting messages across the scope of the scene.
 * 
 * @method trigger
 * @param {String} eventId This is the message to process.
 * @param {*} event This is a message object or other value to pass along to component functions.
 **/
    proto.trigger = function (eventId, event) {
        var i    = 0,
            time = 0;
        
        if (this.storedMessages) {
            this.storedMessages.push({
                message: eventId,
                value: event
            });
        } else {
            if (eventId === 'tick') {
                time = new Date().getTime();
                this.timeElapsed.name = 'Non-Engine';
                this.timeElapsed.time = time - this.time;
                this.trigger('time-elapsed', this.timeElapsed);
                this.time = time;
            }
            for (i = 0; i < this.layers.length; i++) {
                this.layers[i].trigger(eventId, event);
            }
            if (eventId === 'tick') {
                time = new Date().getTime();
                this.timeElapsed.name = 'Engine Total';
                this.timeElapsed.time = time - this.time;
                this.trigger('time-elapsed', this.timeElapsed);
                this.time = time;
            }
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
        var i = 0,
            selection = null;
        
        for (i = 0; i < this.layers.length; i++) {
            if (this.layers[i].id === id) {
                return this.layers[i];
            }
            if (this.layers[i].getEntityById) {
                selection = this.layers[i].getEntityById(id);
                if (selection) {
                    return selection;
                }
            }
        }
        return undefined;
    };

/**
 * This method will return all game entities that match the provided type.
 * 
 * @method getEntitiesByType
 * @param {String} type The entity type to find.
 * @return entities {Array} Returns the entities that match the specified entity type.
 **/
    proto.getEntitiesByType = function (type) {
        var i = 0,
            selection = null,
            entities  = [];
        
        for (i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type === type) {
                entities.push(this.layers[i]);
            }
            if (this.layers[i].getEntitiesByType(type)) {
                selection = this.layers[i].getEntitiesByType(type);
                if (selection) {
                    entities = entities.concat(selection);
                }
            }
        }
        return entities;
    };

/**
 * This method destroys all the layers in the scene.
 * 
 * @method destroy
 **/
    proto.destroy = function () {
        var i = 0;
        
        for (i = 0; i < this.layers.length; i++) {
            this.layers[i].destroy();
        }
        this.layers.length = 0;
    };
    
    return scene;
}());

//##############################################################################
// Vector.js
//##############################################################################

/**
 * This class defines a multi-dimensional vector object and a variety of methods for manipulating the vector.
 * 
 * @namespace platypus
 * @class Vector
 * @constructor
 * @param x {number|Array|Vector} The x coordinate or an array or Vector describing the whole vector.
 * @param [y] {number} The y coordinate.
 * @param [z] {number} The z coordinate.
 */
/*global platypus */
/*jslint plusplus:true */
platypus.Vector = (function () {
    "use strict";
    
    var Vector = function (x, y, z) {
            this.matrix = [0, 0, 0];
            this.set(x, y, z);
        },
        proto = Vector.prototype;
    
    /**
     * The x component of the vector.
     * 
     * @property x
     * @type number
     * @default 0
     */
    Object.defineProperty(proto, 'x', {
        get: function () {
            return this.matrix[0];
        },
        set: function (value) {
            this.matrix[0] = value;
        }
    });
    
    /**
     * The y component of the vector.
     * 
     * @property y
     * @type number
     * @default 0
     */
    Object.defineProperty(proto, 'y', {
        get: function () {
            return this.matrix[1];
        },
        set: function (value) {
            this.matrix[1] = value;
        }
    });
    
    /**
     * The z component of the vector.
     * 
     * @property z
     * @type number
     * @default 0
     */
    Object.defineProperty(proto, 'z', {
        get: function () {
            return this.matrix[2];
        },
        set: function (value) {
            this.matrix[2] = value;
        }
    });
    
    /**
     * Returns a string describing the vector in the format of "[x, y, z]".
     * 
     * @method toString
     * @return {String}
     */
    proto.toString = function () {
        return '[' + this.matrix.join(',') + ']';
    };
    
    /**
     * Performs an operation on each vector coordinate.
     * 
     * @method forEach
     * @param func {Function} A function describing the operation, which accepts the following parameters: coordinate value, index, and coordinate array.
     * @param limit {number} The number of coordinates to limit the operation to. For example, set to `2` for a 2-dimensional operation. If unspecified, the opartion occurs across all coordinates.
     */
    proto.forEach = function (func, limit) {
        var i = 0,
            l = limit || this.matrix.length;
        
        for (i = 0; i < l; i++) {
            func(this.matrix[i], i, this.matrix);
        }
    };
    
    /**
     * Sets the coordinates of the vector.
     * 
     * @method set
     * @param x {number|Array|Vector} The x coordinate or an array or Vector describing the whole vector.
     * @param [y] {number} The y coordinate.
     * @param [z] {number} The z coordinate.
     * @chainable
     */
    proto.set = function (x, y, z) {
        var m = null,
            set = function (coordinate, index, matrix) {
                matrix[index] = m[index];
            };
        
        if (x && Array.isArray(x)) {   // Passing in an array.
            m = x;
        } else if (x && x.matrix) {   // Passing in a vector.
            m = x.matrix;
        } else {                     // Passing in coordinates.
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        
        if (m) {
            this.matrix.length = m.length;
            this.forEach(set, y);
        }
        
        return this;
    };
    
    /**
     * Sets the vector to values of the parameter vector.
     * 
     * @param otherVector {Vector} The other vector.
     * @chainable
     */
    proto.copyValues = function (otherVector) {
        return this.set(otherVector);
    };
    
    /**
     * Returns the magnitude of the vector.
     * 
     * @method magnitude
     * @param [dimensions] {number} The dimensions to include. Defaults to all dimensions.
     * @return {number} The magnitude of the vector.
     */
    proto.magnitude = function (dimensions) {
        var squares = 0,
            square = function (coordinate) {
                squares += Math.pow(coordinate, 2);
            };
        
        this.forEach(square, dimensions);
        
        return Math.sqrt(squares);
    };
    
    /**
     * Returns the direction of the vector from the z-axis
     * 
     * @return {number} The direction of the vector in radians.
     */
    proto.getAngle = function () {
        var mag   = this.magnitude(2),
            angle = 0;

        if (mag !== 0) {
            angle = Math.acos(this.x / mag);
            if (this.y < 0) {
                angle = (Math.PI * 2) - angle;
            }
        }
        return angle;
    };
    
    /**
     * Returns a normalized copy of the vector.
     * 
     * @method getUnit
     * @return {Vector} A normalized vector in the same direction as this vector.
     */
    proto.getUnit = function () {
        return new platypus.Vector(this).normalize();
    };
    
    /**
     * Returns a copy of the Vector inverted.
     * 
     * @method getInverse
     * @return {Vector}
     */
    proto.getInverse = function () {
        return new platypus.Vector(this).multiply(-1);
    };
    
    /**
     * Normalizes the vector.
     * 
     * @method normalize
     * @chainable
     */
    proto.normalize = function () {
        var mag = this.magnitude();
        
        if (mag === 0) {
            return this.multiply(0);
        } else {
            return this.multiply(1 / mag);
        }
    };
    
    /**
     * Crosses this vector with the parameter vector.
     * 
     * @method cross
     * @param vector {Vector} The vector to cross this vector with.
     * @chainable
     */
    proto.cross = (function () {
        var det = function (a, b, c, d) {
            return a * d - b * c;
        };
        
        return function (v) {
            var tempX = det(this.y, this.z, v.y, v.z),
                tempY = -det(this.x, this.z, v.x, v.z),
                tempZ = det(this.x, this.y, v.x, v.y);
            
            this.x = tempX;
            this.y = tempY;
            this.z = tempZ;
            
            return this;
        };
    }());
    
    /**
     * Crosses this vector with the parameter vector and returns the cross product.
     * 
     * @method getCrossProduct
     * @param vector {Vector} The vector to cross this vector with.
     * @return {Vector} The cross product.
     */
    proto.getCrossProduct = function (v) {
        return new platypus.Vector(this).cross(v);
    };
    
    /**
     * Rotates the vector by the given amount.
     * 
     * @method rotate
     * @param angle {number} The amount to rotate the vector in radians.
     * @param [axis="z"] {String|Vector} A vector describing the axis around which the rotation should occur or 'x', 'y', or 'z'.
     * @chainable
     */
    proto.rotate = function (angle, axis) {
        var a    = axis,
            cos  = Math.cos(angle),
            sin  = Math.sin(angle),
            icos = 1 - cos,
            x    = 0,
            y    = 0,
            z    = 0;
        
        if (a) {
            if (a === 'x') {
                a = new Vector(1, 0, 0);
            } else if (a === 'y') {
                a = new Vector(0, 1, 0);
            } else if (a === 'z') {
                a = new Vector(0, 0, 1);
            }
        } else {
            a = new Vector(0, 0, 1);
        }
        
        x     = a.x;
        y     = a.y;
        z     = a.z;
        
        return this.multiply([
            [    cos + x * x * icos, x * y * icos - z * sin, x * z * icos + y * sin],
            [y * x * icos + z * sin,     cos + y * y * icos, y * z * icos - x * sin],
            [z * x * icos - y * sin, z * y * icos + x * sin,     cos + z * z * icos]
        ]);
    };
    
    /**
     * Scales the vector by the given factor or performs a transform if a matrix is provided.
     * 
     * @method multiply
     * @param multiplier {number|Array} The factor to scale by or a 2D array describing a multiplication matrix.
     * @param limit {number} For scaling, determines which coordinates are affected.
     * @chainable
     */
    proto.multiply = function (multiplier, limit) {
        var i = 0,
            j = 0,
            self = null,
            mult = function (coordinate, index, matrix) {
                matrix[index] = coordinate * multiplier;
            },
            l = 0;
        
        if (Array.isArray(multiplier)) {
            self = this.matrix.slice();
            l = limit || multiplier.length;
            for (i = 0; i < l; i++) {
                this.matrix[i] = 0;
                for (j = 0; j < l; j++) {
                    this.matrix[i] += self[j] * multiplier[i][j];
                }
            }
        } else {
            this.forEach(mult, limit);
        }
        
        return this;
    };
    
    /**
     * Adds the given components to this vector.
     * 
     * @method add
     * @param x {number|Array|Vector} The x component to add, or an array or vector describing the whole addition.
     * @param [y] {number} The y component to add or the limit if the first parameter is a vector or array.
     * @param [z] {number} The z component to add.
     * @chainable
     */
    proto.add = function (x, y, z) {
        var addMatrix = x,
            limit = 0,
            add = function (coordinate, index, matrix) {
                matrix[index] += addMatrix[index];
            };

        if (!Array.isArray(addMatrix)) {
            if (addMatrix.matrix) {
                addMatrix = addMatrix.matrix;
                limit = y || 0;
            } else {
                addMatrix = [x || 0, y || 0, z || 0];
            }
        } else {
            limit = y || 0;
        }
        
        this.forEach(add, limit);
        
        return this;
    };
    
    /**
     * Adds the given vector to this vector.
     * 
     * @method addVector
     * @param otherVector {Vector} The vector to add.
     * @chainable
     */
    proto.addVector = function (otherVector, dimensions) {
        return this.add(otherVector, dimensions);
    };
    
    /**
     * Subtracts the given vector from this vector.
     * 
     * @method subtractVector
     * @param otherVector {Vector} The vector to subtract.
     * @chainable
     */
    proto.subtractVector = function (otherVector, dimensions) {
        return this.add(otherVector.getInverse(), dimensions);
    };
    
    /**
     * Scales the vector by the given factor.
     * 
     * @method multiply
     * @param factor {number} The factor to scale by.
     * @param limit {number} Determines which coordinates are affected. Defaults to all coordinates.
     * @chainable
     */
    proto.scale = function (factor, limit) {
        return this.multiply(factor, limit);
    };
    
    /**
     * Finds the dot product of the two vectors.
     * 
     * @method dot
     * @param otherVector {Vector} The other vector.
     * @return {number} The dot product.
     */
    proto.dot = function (otherVector, limit) {
        var sum = 0,
            mult = function (coordinate, index) {
                sum += coordinate * (otherVector.matrix[index] || 0);
            };
        
        this.forEach(mult, limit);
        
        return sum;
    };
    
    /**
     * Finds the shortest angle between the two vectors.
     * 
     * @method angleTo
     * @param otherVector {Vector} The other vector.
     * @return {number} The angle between this vector and the received vector.
     */
    proto.angleTo = function (otherVector) {
        var v1 = this.getUnit(),
            v2 = otherVector.getUnit();
        
        return Math.acos(v1.dot(v2));
    };
    
    /**
     * Finds the shortest signed angle between the two vectors.
     * 
     * @method signedAngleTo
     * @param otherVector {Vector} The other vector.
     * @param normal {Vector} A normal vector determining the resultant sign of the angle between two vectors.
     * @return {number} The angle between this vector and the received vector.
     */
    proto.signedAngleTo = function (otherVector, normal) {
        var v1 = this.getUnit(),
            v2 = otherVector.getUnit();
        
        if (v1.getCrossProduct(v2).dot(normal) < 0) {
            return -Math.acos(v1.dot(v2));
        }
        return Math.acos(v1.dot(v2));
    };
    
    /**
     * Find the scalar value of projecting this vector onto the parameter vector or onto a vector at the specified angle away.
     * 
     * @method scalerProjection
     * @param vectorOrAngle {Vector|number} The other vector or the angle between the vectors.
     * @return {number} The magnitude of the projection. 

     */
    proto.scalarProjection = function (vectorOrAngle) {
        var angle = 0;
        if (typeof vectorOrAngle === "number") {
            angle = vectorOrAngle;
        } else {
            angle = this.angleTo(vectorOrAngle);
        }
        return this.magnitude(2) * Math.cos(angle);
    };
    
    /**
     * Returns a copy of this vector.
     * 
     * @return {Vector} A copy of this vector.
     */
    proto.copy = function () {
        return new platypus.Vector(this);
    };
    
    /**
     * Adds properties to an object that describe the coordinates of a vector.
     * 
     * @method Vector.assign
     * @param object {Object} Object on which the coordinates and vector will be added.
     * @param propertyName {String} A string describing the property name where the vector is accessable.
     * @param [coordinateName*] {String} One or more parameters describing coordinate values on the object.
     */
    Vector.assign = (function () {
        var createProperty = function (property, obj, vector, index) {
            var temp = null,
                propertyInUse = false;
            
            if (typeof property === 'string') {
                if (typeof obj[property] !== 'undefined') {
                    temp = obj[property];
                    delete obj[property];
                    propertyInUse = true;
                }
            }
            
            Object.defineProperty(obj, property, {
                get: function () {
                    return vector.matrix[index];
                },
                set: function (value) {
                    vector.matrix[index] = value;
                },
                enumerable: true
            });
            
            if (propertyInUse) {
                obj[property] = temp;
            }
        };
        
        return function (obj, prop) {
            var i = 0;

            if (obj && prop) {
                if (!obj[prop]) {
                    obj[prop] = new platypus.Vector();
                    
                    for (i = 2; i < arguments.length; i++) {
                        if (arguments[i] !== prop) {
                            createProperty(arguments[i], obj, obj[prop], i - 2);
                        }
                    }
                    
                    return;
                }
                return obj[prop];
            } else {
                return null;
            }
        };
    }());
    
    return Vector;
}());

//##############################################################################
// AABB.js
//##############################################################################

/**
 * This class defines an axis-aligned bounding box (AABB) which is used during the collision process to determine if two objects are colliding. This is used in a few places including [[Collision-Basic]] and [[Collision-Shape]].
 * 
 * @namespace platypus
 * @class AABB
 * @constructor
 * @param x {number} The x position of the AABB. The x is always located in the center of the object.
 * @param y {number} The y position of the AABB. The y is always located in the center of the object.
 * @param width {number} The width of the AABB.
 * @param height {number} The height of the AABB.
 * @return {AABB} Returns the new aabb object.
 */
/*global platypus */
platypus.AABB = (function () {
    "use strict";
    
    var AABB = function (x, y, width, height) {
            this.empty = true;
            this.setAll(x, y, width, height);
        },
        proto = AABB.prototype;
    
    /**
     * Sets all of the properties of the AABB.
     * 
     * @method setAll
     * @param x {number} The x position of the AABB. The x is always located in the center of the object.
     * @param y {number} The y position of the AABB. The y is always located in the center of the object.
     * @param width {number} The width of the AABB.
     * @param height {number} The height of the AABB.
     * @chainable
     */
    proto.setAll = function (x, y, width, height) {
        this.empty = false;
        this.x = x;
        this.y = y;
        this.resize(width, height);
        return this;
    };
    
    /**
     * Sets bounds of the AABB.
     * 
     * @method setBounds
     * @param left {number} The left side of the AABB.
     * @param top {number} The top side of the AABB.
     * @param right {number} The right side of the AABB.
     * @param bottom {number} The bottom side of the AABB.
     * @chainable
     */
    proto.setBounds = function (left, top, right, bottom) {
        this.empty = false;
        this.x = (right + left) / 2;
        this.y = (top + bottom) / 2;
        this.resize(right - left, bottom - top);
        return this;
    };
    
    proto.set = function (aabb) {
        /**
         * Whether the AABB encloses a valid space.
         * 
         * @property empty
         * @type boolean
         */
        this.empty = aabb.empty;
        
        /**
         * The x position of the AABB. The x is always located in the center of the object.
         * 
         * @property x
         * @type number
         */
        this.x = aabb.x;
        
        /**
         * The y position of the AABB. The y is always located in the center of the object.
         * 
         * @property y
         * @type number
         */
        this.y = aabb.y;
        
        /**
         * The width of the AABB.
         * 
         * @property width
         * @type number
         */
        this.width  = aabb.width;
        
        /**
         * The height of the AABB.
         * 
         * @property height
         * @type number
         */
        this.height = aabb.height;
        
        /**
         * Half the width of the AABB.
         * 
         * @property halfWidth
         * @type number
         */
        this.halfWidth = aabb.halfWidth;
        
        /**
         * Half the height of the AABB.
         * 
         * @property halfHeight
         * @type number
         */
        this.halfHeight = aabb.halfHeight;
        
        /**
         * The x-position of the left edge of the AABB.
         * 
         * @property left
         * @type number
         */
        this.left = aabb.left;
        
        /**
         * The x-position of the right edge of the AABB.
         * 
         * @property right
         * @type number
         */
        this.right = aabb.right;
        
        /**
         * The y-position of the top edge of the AABB.
         * 
         * @property top
         * @type number
         */
        this.top = aabb.top;
        
        /**
         * The y-position of the bottom edge of the AABB.
         * 
         * @property bottom
         * @type number
         */
        this.bottom = aabb.bottom;
        
        return this;
    };
    
    /**
     * Resets all the values in the AABB so that the AABB can be reused.
     * 
     * @method reset
     * @chainable
     */
    proto.reset = function () {
        this.empty = true;
        return this;
    };
    
    /**
     * Resizes the AABB.
     * 
     * @method reset
     * @param width {number} The new width of the AABB
     * @param height {number} The new height of the AABB
     * @chainable
     */
    proto.resize = function (width, height) {
        this.width  = width || 0;
        this.height = height || 0;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        if (isNaN(this.x)) {
            this.empty = true;
        } else {
            this.left = -this.halfWidth + this.x;
            this.right = this.halfWidth + this.x;
        }
        if (isNaN(this.y)) {
            this.empty = true;
        } else {
            this.top = -this.halfHeight + this.y;
            this.bottom = this.halfHeight + this.y;
        }
        return this;
    };
    
    /**
     * Changes the size and position of the bounding box so that it contains the current area and the area described in the incoming AABB.
     * 
     * @method include
     * @param aabb {AABB} The AABB whose area will be included in the area of the current AABB.
     * @chainable
     */
    proto.include = function (aabb) {
        if (aabb) {
            if (this.empty) {
                this.set(aabb);
            } else {
                if (this.left > aabb.left) {
                    this.left = aabb.left;
                }
                if (this.right < aabb.right) {
                    this.right = aabb.right;
                }
                if (this.top > aabb.top) {
                    this.top = aabb.top;
                }
                if (this.bottom < aabb.bottom) {
                    this.bottom = aabb.bottom;
                }
                
                this.width      = this.right  - this.left;
                this.height     = this.bottom - this.top;
                this.halfWidth  = this.width / 2;
                this.halfHeight = this.height / 2;
                this.x          = this.left + this.halfWidth;
                this.y          = this.top  + this.halfHeight;
            }
        }
        
        return this;
    };
    
    /**
     * Moves the AABB to the specified location.
     * 
     * @method move
     * @param x {number} The new x position of the AABB.
     * @param y {number} The new y position of the AABB.
     * @chainable
     */
    proto.move = function (x, y) {
        this.moveX(x);
        this.moveY(y);
        return this;
    };

    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveX
     * @param x {number} The new x position of the AABB.
     * @chainable
     */
    proto.moveX = function (x) {
        this.x = x;
        this.left   = -this.halfWidth + this.x;
        this.right  = this.halfWidth + this.x;
        return this;
    };

    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveY
     * @param y {number} The new y position of the AABB.
     * @chainable
     */
    proto.moveY = function (y) {
        this.y = y;
        this.top    = -this.halfHeight + this.y;
        this.bottom = this.halfHeight + this.y;
        return this;
    };
    
    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveXBy
     * @param deltaX {number} The change in x position of the AABB.
     * @chainable
     */
    proto.moveXBy = function (deltaX) {
        this.x += deltaX;
        this.left   = -this.halfWidth + this.x;
        this.right  = this.halfWidth + this.x;
        return this;
    };

    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveYBy
     * @param deltaY {number} The change in y position of the AABB.
     * @chainable
     */
    proto.moveYBy = function (deltaY) {
        this.y += deltaY;
        this.top    = -this.halfHeight + this.y;
        this.bottom = this.halfHeight + this.y;
        return this;
    };
    
    /**
     * Creates a new AABB with the same properties as this AABB.
     * 
     * @method getCopy
     * @return {AABB} Returns the new AABB object.
     */
    proto.getCopy = function () {
        return new AABB(this.x, this.y, this.width, this.height);
    };

    /**
     * Expresses whether this AABB matches parameters describing an AABB.
     * 
     * @method matches
     * @param x {number} X coordinate of a bounding box
     * @param y {number} Y coordinate of a bounding box
     * @param width {number} Width of a bounding box
     * @param height {number} Height of a bounding box
     * @return {boolean} Returns `true` if the parameters match.
     */
    proto.matches = function (x, y, width, height) {
        return !((this.x !== x) || (this.y !== y) || (this.width !== width) || (this.height !== height));
    };

    /**
     * Expresses whether this AABB contains the given AABB.
     * 
     * @method contains
     * @param aabb {AABB} The AABB to check against
     * @return {boolean} Returns `true` if this AABB contains the other AABB.
     */
    proto.contains = function (aabb) {
        return !((aabb.top < this.top) || (aabb.bottom > this.bottom) || (aabb.left < this.left) || (aabb.right > this.right));
    };
    
    /**
     * Expresses whether this AABB contains the given point.
     * 
     * @method containsVector
     * @param vector {Vector} The vector to check.
     * @return {boolean} Returns `true` if this AABB contains the vector.
     */
    proto.containsVector = function (vector) {
        return !((vector.y < this.top) || (vector.y > this.bottom) || (vector.x < this.left) || (vector.x > this.right));
    };
    
    /**
     * Expresses whether this AABB intersects the given AABB.
     * 
     * @method intersects
     * @param aabb {AABB} The AABB to check against
     * @return {boolean} Returns `true` if this AABB intersects the other AABB.
     */
    proto.intersects = function (aabb) {
        return !((aabb.bottom < this.top) || (aabb.top > this.bottom) || (aabb.right < this.left) || (aabb.left > this.right));
    };
    
    return AABB;
}());

//##############################################################################
// browser.js
//##############################################################################

/**
 * This is used to discover what browser is being used and the capabilities of the browser. In addition to browser type, we determine whether it is mobile or desktop, whether it supports multi or single-touch, what type of audio it can play, and whether it supports canvas or not. All of this information is added to `platypus.supports`.
 *
 */

/*global console, platypus */
(function () {
    "use strict";
    
    var uagent   = navigator.userAgent.toLowerCase(),
        supports = {
            touch:       (window.ontouchstart !== 'undefined'),

            // specific browsers as determined above
            iPod:        (uagent.search('ipod')    > -1),
            iPhone:      (uagent.search('iphone')  > -1),
            iPad:        (uagent.search('ipad')    > -1),
            safari:      (uagent.search('safari')  > -1),
            ie:          (uagent.search('msie')    > -1) || (uagent.search('trident') > -1),
            firefox:     (uagent.search('firefox') > -1),
            android:     (uagent.search('android') > -1),
            chrome:      (uagent.search('chrome')  > -1),
            silk:        (uagent.search('silk')    > -1),
            iPhone4:     false, //determined below
            iPad2:       false, //determined below
            iOS:         false, //determined below
            mobile:      false, //determined below
            desktop:     false  //determined below
        };
    
    supports.iPhone4 = supports.iPhone && (window.screen.height === (960 / 2));
    supports.iPad2   = supports.iPad && (!window.devicePixelRatio || (window.devicePixelRatio === 1));
    supports.iOS     = supports.iPod || supports.iPhone  || supports.iPad;
    supports.mobile  = supports.iOS  || supports.android || supports.silk;
    supports.desktop = !supports.mobile;
    
    platypus.supports = supports;
}());

//##############################################################################
// CollisionDataContainer.js
//##############################################################################

/**
 * CollisionData holds collision data passed to entities during collisions with other entities. This class is primarily used by the ["HandlerCollision"]("HandlerCollision"%20Component.html) Component to trigger messages on child entities as collision occur.
 * 
 * @namespace platypus
 * @class CollisionData
 */
/*global platypus */
/*jslint plusplus:true */
platypus.CollisionData = (function () {
    "use strict";
    
    var collisionData = function (occurred, direction, position, deltaMovement, aABB, thisShape, thatShape, vector, stuck) {
            this.occurred = occurred || false;
            this.direction = direction || null;
            this.position = position || null;
            this.deltaMovement = deltaMovement || null;
            this.aABB = aABB || null;
            this.thisShape = thisShape || null;
            this.thatShape = thatShape || null;
            this.vector = vector || null;
            this.stuck  = stuck || 0;
        },
        proto = collisionData.prototype;
    
    proto.copy = function (dataToCopy) {
        this.occurred         = dataToCopy.occurred;
        this.direction         = dataToCopy.direction;
        this.position         = dataToCopy.position;
        this.deltaMovement     = dataToCopy.deltaMovement;
        this.aABB             = dataToCopy.aABB;
        this.thisShape      = dataToCopy.thisShape;
        this.thatShape      = dataToCopy.thatShape;
        this.vector         = dataToCopy.vector;
        this.stuck          = dataToCopy.stuck;
    };
    proto.clear = function () {
        this.occurred            = false;
        this.direction            = null;
        this.position            = null;
        this.deltaMovement        = null;
        this.aABB                = null;
        this.thisShape         = null;
        this.thatShape         = null;
        this.vector            = null;
        this.stuck             = 0;
    };
    return collisionData;
}());

platypus.CollisionDataContainer = (function () {
    "use strict";
    
    var collisionDataContainer = function () {
            this.xData = [new platypus.CollisionData(), new platypus.CollisionData()];
            this.yData = [new platypus.CollisionData(), new platypus.CollisionData()];
            this.xCount = 0;
            this.yCount = 0;
            this.xDeltaMovement = Infinity;
            this.yDeltaMovement = Infinity;
        },
        proto = collisionDataContainer.prototype;
    
    proto.getXEntry = function (index) {
        return this.xData[index];
    };
    
    proto.getYEntry = function (index) {
        return this.yData[index];
    };
    
    proto.tryToAddX = function (dataToCopy) {
        if (dataToCopy.deltaMovement < this.xDeltaMovement) {
            this.xDeltaMovement = dataToCopy.deltaMovement;
            this.xData[0].copy(dataToCopy);
            this.xCount = 1;
            return true;
        } else if (dataToCopy.deltaMovement === this.xDeltaMovement) {
            this.ensureRoomX();
            this.xData[this.xCount].copy(dataToCopy);
            this.xCount += 1;
            return true;
        }
        return false;
    };
    
    proto.tryToAddY = function (dataToCopy) {
        if (dataToCopy.deltaMovement < this.yDeltaMovement) {
            this.yDeltaMovement = dataToCopy.deltaMovement;
            this.yData[0].copy(dataToCopy);
            this.yCount = 1;
            return true;
        } else if (dataToCopy.deltaMovement === this.yDeltaMovement) {
            this.ensureRoomY();
            this.yData[this.yCount].copy(dataToCopy);
            this.yCount += 1;
            return true;
        }
        return false;
    };
    
    proto.ensureRoomX = function () {
        var j = 0,
            goalLength = this.xData.length * 2;
        
        if (this.xData.length <= this.xCount) {
            for (j = this.xData.length; j < goalLength; j++) {
                this.xData[j] = new platypus.CollisionData();
            }
        }
    };
    
    proto.ensureRoomY = function () {
        var j = 0,
            goalLength = this.yData.length * 2;
        
        if (this.yData.length <= this.yCount) {
            for (j = this.yData.length; j < goalLength; j++) {
                this.yData[j] = new platypus.CollisionData();
            }
        }
    };
    
    proto.reset = function () {
        this.xCount = 0;
        this.yCount = 0;
        this.xDeltaMovement = Infinity;
        this.yDeltaMovement = Infinity;
    };
    
    return collisionDataContainer;
}());

//##############################################################################
// CollisionShape.js
//##############################################################################

/**
 * This class defines a collision shape, which defines the 'space' an entity occupies in the collision system. Currently only rectangle and circle shapes can be created. Collision shapes include an axis-aligned bounding box (AABB) that tightly wraps the shape. The AABB is used for initial collision checks.
 * 
 * @namespace platypus
 * @class CollisionShape
 * @constructor
 * @param owner {Entity} The entity that uses this shape.
 * @param definition {Object} This is an object of key/value pairs describing the shape.
 * @param definition.x {number} The x position of the shape. The x is always located in the center of the object.
 * @param definition.y {number} The y position of the shape. The y is always located in the center of the object.
 * @param [definition.type="rectangle"] {String} The type of shape this is. Currently this can be either "rectangle" or "circle".
 * @param [definition.width] {number} The width of the shape if it's a rectangle.
 * @param [definition.height] {number} The height of the shape if it's a rectangle.
 * @param [definition.radius] {number} The radius of the shape if it's a circle.
 * @param [definition.offsetX] {number} The x offset of the collision shape from the owner entity's location.
 * @param [definition.offsetY] {number} The y offset of the collision shape from the owner entity's location.
 * @param [definition.regX] {number} The registration x of the collision shape with the owner entity's location if offsetX is not provided.
 * @param [definition.regY] {number} The registration y of the collision shape with the owner entity's location if offsetX is not provided.
 * @param collisionType {String} A string describing the collision type of this shape.
 */
/*global platypus */
platypus.CollisionShape = (function () {
    "use strict";
    
    var collisionShape = function (owner, definition, collisionType) {
            var regX = definition.regX,
                regY = definition.regY,
                width = 0,
                height = 0;

            this.owner = owner;
            this.collisionType = collisionType;

            this.width  = definition.width  || definition.radius || 0;
            this.height = definition.height || definition.radius || 0;
            this.radius = definition.radius || 0;

            if (typeof regX !== 'number') {
                regX = this.width / 2;
            }
            if (typeof regY !== 'number') {
                regY = this.height / 2;
            }

            platypus.Vector.assign(this, 'offset', 'offsetX', 'offsetY');
            this.offsetX = definition.offsetX || ((this.width  / 2) - regX);
            this.offsetY = definition.offsetY || ((this.height / 2) - regY);

            platypus.Vector.assign(this, 'position', 'x', 'y');
            if (owner) {
                this.x = owner.x + this.offsetX;
                this.y = owner.y + this.offsetY;
            } else {
                this.x = definition.x + this.offsetX;
                this.y = definition.y + this.offsetY;
            }

            this.type = definition.type || 'rectangle';
            this.subType = '';
            this.aABB = undefined;

            switch (this.type) {
            case 'circle': //need TL and BR points
                width = height = this.radius * 2;
                break;
            case 'rectangle': //need TL and BR points
                width = this.width;
                height = this.height;
                break;
            }

            platypus.Vector.assign(this, 'size', 'width', 'height');
            this.width  = width;
            this.height = height;

            this.aABB     = new platypus.AABB(this.x, this.y, width, height);
        },
        proto = collisionShape.prototype;

    /**
     * Updates the location of the shape and AABB. The position you send should be that of the owner, the offset of the shape is added inside the function.
     * 
     * @method update
     * @param ownerX {number} The x position of the owner.
     * @param ownerY {number} The y position of the owner.
     */
    proto.update = function (ownerX, ownerY) {
        this.x = ownerX + this.offsetX;
        this.y = ownerY + this.offsetY;
        this.aABB.move(this.x, this.y);
    };
    
    /**
     * Move the shape's x position.
     * 
     * @method moveX
     * @param x {number} The x position to which the shape should be moved.
     */
    proto.moveX = function (x) {
        this.x = x;
        this.aABB.moveX(this.x);
    };
    
    /**
     * Move the shape's y position.
     * 
     * @method moveY
     * @param y {number} The y position to which the shape should be moved.
     */
    proto.moveY = function (y) {
        this.y = y;
        this.aABB.moveY(this.y);
    };
    
    /**
     * Returns the axis-aligned bounding box of the shape.
     * 
     * @method getAABB
     * @return {AABB} The AABB of the shape.
     */
    proto.getAABB = function () {
        return this.aABB;
    };
    
    /**
     * Set the shape's position as if the entity's x position is in a certain location.
     * 
     * @method setXWithEntityX
     * @param entityX {number} The x position of the entity.
     */
    proto.setXWithEntityX = function (entityX) {
        this.x = entityX + this.offsetX;
        this.aABB.moveX(this.x);
    };
    
    /**
     * Set the shape's position as if the entity's y position is in a certain location.
     * 
     * @method setYWithEntityY
     * @param entityY {number} The y position of the entity.
     */
    proto.setYWithEntityY = function (entityY) {
        this.y = entityY + this.offsetY;
        this.aABB.moveY(this.y);
    };
    
    /**
     * Destroys the shape so that it can be memory collected safely.
     * 
     * @method destroy
     */
    proto.destroy = function () {
        this.aABB = undefined;
    };
    
    /**
     * Transform the shape using a matrix transformation.
     * 
     * @method multiply
     * @param matrix {Array} A matrix used to transform the shape.
     */
    proto.multiply = function (m) {
        this.position.subtractVector(this.owner.position);
        
        this.position.multiply(m);
        this.offset.multiply(m);
        this.size.multiply(m);
        
        this.position.addVector(this.owner.position);
        this.width  = Math.abs(this.width);
        this.height = Math.abs(this.height);
        
        this.aABB.setAll(this.x, this.y, this.width, this.height);
    };
    
    return collisionShape;
}());

//##############################################################################
// Entity.js
//##############################################################################

/**
 * The Entity object acts as a container for components, facilitates communication between components and other game objects, and includes properties set by components to maintain a current state. The entity object serves as the foundation for most of the game objects in the platypus engine.
 * 
 * ## JSON Definition Example
     {
         "id": "entity-id",
         // "entity-id" becomes `entity.type` once the entity is created.
      
         "components": [
         // This array lists one or more component definition objects
      
             {"type": "example-component"}
            // The component objects must include a "type" property corresponding to a component to load, but may also include additional properties to customize the component in a particular way for this entity.
         ],
      
         "properties": [
         // This array lists properties that will be attached directly to this entity.
      
             "x": 240
             // For example, `x` becomes `entity.x` on the new entity.
         ],
      
         "filters": {
         // Filters are only used by top level entities loaded by the scene and are not used by the entity directly. They determine whether an entity should be loaded on a particular browser according to browser settings.
      
             "includes": ["touch"],
             // Optional. This filter specifies that this entity should be loaded on browsers/devices that support a touch interface. More than one setting can be added to the array.

             "excludes": ["mobile"]
             // Optional. This filter specifies that this entity should not be loaded on mobile browsers/devices that. More than one setting can be added to the array.
         }
     }
 * 
 * @namespace platypus
 * @class Entity
 * @constructor
 * @extends Messenger
 * @param {Object} [definition] Base definition for the entity.
 * @param {Object} [definition.id] This declares the type of entity and will be stored on the Entity as `entity.type` after instantiation.
 * @param {Object} [definition.components] This lists the components that should be attached to this entity.
 * @param {Object} [definition.properties] This is a list of key/value pairs that are added directly to the Entity as `entity.key = value`.
 * @param {Object} [instanceDefinition] Specific instance definition including properties that override the base definition properties.
 * @return {Entity} Returns the new entity made up of the provided components. 
**/

/*global console, platypus */
/*jslint plusplus:true */
platypus.Entity = (function () {
    "use strict";
    
    var entityIds = {},
        entity = function (definition, instanceDefinition) {
            var self                 = this,
                i                    = 0,
                componentDefinition  = null,
                def                  = definition || {},
                componentDefinitions = def.components || [],
                defaultProperties    = def.properties || {},
                instance             = instanceDefinition || {},
                instanceProperties   = instance.properties || {};

            // Set properties of messenger on this entity.
            platypus.Messenger.call(self);

            self.components  = [];
            self.type = def.id || 'none';

            self.id = instance.id || instanceProperties.id;
            if (!self.id) {
                if (!entityIds[self.type]) {
                    entityIds[self.type] = 0;
                }
                self.id = self.type + '-' + entityIds[self.type];
                entityIds[self.type] += 1;
            }

            this.setProperty(defaultProperties); // This takes the list of properties in the JSON definition and appends them directly to the object.
            this.setProperty(instanceProperties); // This takes the list of options for this particular instance and appends them directly to the object.
            this.bind('set-property', function (keyValuePairs) {
                self.setProperty(keyValuePairs);
            });

            if (!self.state) {
                self.state = {}; //starts with no state information. This expands with boolean value properties entered by various logic components.
            }
            self.lastState = {}; //This is used to determine if the state of the entity has changed.

            /**
             * Whether this entity is no longer in use. This is useful for cleaning up connections with removed entities.
             *
             * @property destroyed
             * @type Boolean
             * @default false
             */
            this.destroyed = false;

            for (i = 0; i < componentDefinitions.length; i++) {
                componentDefinition = componentDefinitions[i];
                if (platypus.components[componentDefinition.type]) {
                    self.addComponent(new platypus.components[componentDefinition.type](self, componentDefinition));
                } else {
                    console.warn("Component '" + componentDefinition.type + "' is not defined.", componentDefinition);
                }
            }

            /**
             * The entity triggers `load` on itself once all the properties and components have been attached, notifying the components that all their peer components are ready for messages.
             *
             * @event load
             */
            self.triggerEvent('load');
        },
        proto = entity.prototype = new platypus.Messenger();
    
    /**
    * Returns a string describing the entity.
    *
    * @method toString
    * @return {String} Returns the entity type as a string of the form "[entity entity-type]".
    **/
    proto.toString = function () {
        return "[entity " + this.type + "]";
    };
    
    /**
    * Attaches the provided component to the entity.
    *
    * @method addComponent
    * @param {Component} component Must be an object that functions as a [[Component]].
    * @return {Component} Returns the same object that was submitted.
    **/
    proto.addComponent = function (component) {
        this.components.push(component);

        /**
         * The entity triggers `component-added` on itself once a component has been attached, notifying other components of their peer component.
         *
         * @event component-added
         * @param {Component} component The added component.
         * @param {String} component.type The type of component.
         **/
        this.triggerEvent('component-added', component);
        return component;
    };
    
    /**
    * Removes the mentioned component from the entity.
    *
    * @method removeComponent
    * @param {Component} component Must be a [[Component]] attached to the entity.
    * @return {Component} Returns the same object that was submitted if removal was successful; otherwise returns false (the component was not found attached to the entity).
    **/
    proto.removeComponent = function (component) {
        var i = 0;
        
        /**
         * The entity triggers `component-removed` on itself once a component has been removed, notifying other components of their peer component's removal.
         *
         * @event component-removed
         * @param {Component} component The removed component.
         * @param {String} component.type The type of component.
         **/
        if (typeof component === 'string') {
            for (i = 0; i < this.components.length; i++) {
                if (this.components[i].type === component) {
                    component = this.components[i];
                    this.components.splice(i, 1);
                    this.triggerEvent('component-removed', component);
                    component.destroy();
                    return component;
                }
            }
        } else {
            for (i = 0; i < this.components.length; i++) {
                if (this.components[i] === component) {
                    this.components.splice(i, 1);
                    this.triggerEvent('component-removed', component);
                    component.destroy();
                    return component;
                }
            }
        }
        
        return false;
    };
    
    /**
    * This method sets one or more properties on the entity.
    *
    * @param {Object} properties A list of key/value pairs to set as properties on the entity.
    * @method setProperty
    **/
    proto.setProperty = function (properties) {
        var index = '';
        
        for (index in properties) { // This takes a list of properties and appends them directly to the object.
            if (properties.hasOwnProperty(index)) {
                this[index] = properties[index];
            }
        }
    };
    
    /**
    * This method removes all components from the entity.
    *
    * @method destroy
    **/
    proto.destroy = function () {
        var i = 0;
        
        for (i = 0; i < this.components.length; i++) {
            this.components[i].destroy();
        }
        this.components.length = 0;
        this.destroyed = true;
    };
    
    return entity;
}());

//##############################################################################
// factory.js
//##############################################################################

/**
 * The component factory takes in component definitions and creates component classes that can be used to create components by entities.  It adds properties and methods that are common to all components so that component definitions can focus on unique properties and methods.
 * 
 * To create an extended component class, use the following syntax:
 * 
 *      platypus.createComponentClass(componentDefinition, prototype);
 * 
 *  * `componentDefinition` is list of key/value pairs that describe the component's behavior.
 *  * `prototype` is an optional prototype that this component extends.
 * See [component-template.js]("component-template"%20Component.html) for an example componentDefinition that can be sent into this component class factory.
 * 
 * @namespace platypus
 * @class Component
 * @static
 */
/*global console, platypus */
/*jslint nomen:true, plusplus:true */
(function () {
    "use strict";
    
    var setupProperty = function (property, component, owner) {
            Object.defineProperty(component, property, {
                get: function () {
                    return owner[property];
                },
                set: function (value) {
                    owner[property] = value;
                },
                enumerable: true
            });
        };
        
    platypus.components = {};
    
    platypus.createComponentClass = function (componentDefinition, Prototype) {
        var component = function (owner, definition) {
                var prop  = '',
                    func  = '',
                    name  = '',
                    alias = '';


                // if prototype provided, set up its properties here.
                if (Prototype) {
                    Prototype.call(this);
                }

                this.owner = owner;
                this.listener = {
                    events: [],
                    messages: []
                };
                this.publicMethods = {};
                this.type = componentDefinition.id;

                // Set up properties, prioritizing component settings, entity settings, and finally defaults.
                if (componentDefinition.properties) {
                    for (prop in componentDefinition.properties) {
                        if (componentDefinition.properties.hasOwnProperty(prop)) {
                            if (typeof definition[prop] !== 'undefined') {
                                this[prop] = definition[prop];
                            } else if (typeof this.owner[prop] !== 'undefined') {
                                this[prop] = this.owner[prop];
                            } else {
                                this[prop] = componentDefinition.properties[prop];
                            }
                        }
                    }
                }

                // These component properties are equivalent with `entity.property`
                if (componentDefinition.publicProperties) {
                    for (prop in componentDefinition.publicProperties) {
                        if (componentDefinition.publicProperties.hasOwnProperty(prop)) {
                            setupProperty(prop, this, owner);
                            if (typeof definition[prop] !== 'undefined') {
                                this[prop] = definition[prop];
                            } else if (typeof this.owner[prop] !== 'undefined') {
                                this[prop] = this.owner[prop];
                            } else {
                                this[prop] = componentDefinition.publicProperties[prop];
                            }
                        }
                    }
                }

                if (componentDefinition.events) {
                    for (func in componentDefinition.events) {
                        if (componentDefinition.events.hasOwnProperty(func)) {
                            this.addEventListener(func, componentDefinition.events[func]);
                            if (definition.aliases) {
                                for (alias in definition.aliases) {
                                    if (definition.aliases.hasOwnProperty(alias) && (definition.aliases[alias] === func)) {
                                        this.addEventListener(alias, componentDefinition.events[func]);
                                    }
                                }
                            }
                        }
                    }
                }

                if (componentDefinition.publicMethods) {
                    for (func in componentDefinition.publicMethods) {
                        if (componentDefinition.publicMethods.hasOwnProperty(func)) {
                            name = func;
                            if (definition.aliases) {
                                for (alias in definition.aliases) {
                                    if (definition.aliases.hasOwnProperty(alias) && (definition.aliases[alias] === func)) {
                                        name = alias;
                                    }
                                }
                            }
                            this.addMethod(name, componentDefinition.publicMethods[func]);
                        }
                    }
                }

                if (this.constructor) {
                    this.constructor(definition);
                }
            },
            func  = null,
            proto = component.prototype;
        
        if (Prototype) { //absorb template prototype if it exists.
            proto = component.prototype = new Prototype();
        }
        
        // Have to copy rather than replace so definition is not corrupted
        proto.constructor = componentDefinition.constructor;

        if (componentDefinition.methods) {
            for (func in componentDefinition.methods) {
                if (componentDefinition.methods.hasOwnProperty(func)) {
                    if (func === 'destroy') {
                        proto._destroy = componentDefinition.methods[func];
                    } else {
                        proto[func] = componentDefinition.methods[func];
                    }
                }
            }
        }
        if (componentDefinition.publicMethods) {
            for (func in componentDefinition.publicMethods) {
                if (componentDefinition.publicMethods.hasOwnProperty(func)) {
                    proto[func] = componentDefinition.publicMethods[func];
                }
            }
        }
        
        /**
         * Returns a string formatted as `[component componentType]`.
         * 
         * @method toString
         * @return {String}
         * @private
         */
        proto.toString = function () {
            return "[component " + this.type + "]";
        };

        /**
         * This method cleans up listeners and methods that this component added to the entity. It should never be called by the component itself. Call this.owner.removeComponent(this) instead.
         * 
         * @method destroy
         * @private
         */
        proto.destroy = function () {
            var func = '';
            
            // Handle component's destroy method before removing messaging and methods.
            if (this._destroy) {
                this._destroy();
            }
            
            // Now remove event listeners and methods.
            for (func in this.publicMethods) {
                if (this.publicMethods.hasOwnProperty(func)) {
                    this.removeMethod(func);
                }
            }
            this.removeEventListeners();
        };
        
        /**
         * This method removes multiple event listeners from the entity.
         * 
         * @method removeEventListeners
         * @param [listeners] {Array} The list of listeners to remove. If not supplied, all event listeners are removed.
         * @private
         */
        proto.removeEventListeners = function (listeners) {
            var i = 0,
                events   = null,
                messages = null;
            
            if (!listeners) {
                events   = this.listener.events;
                messages = this.listener.messages;
                for (i = 0; i < events.length; i++) {
                    this.removeEventListener(events[i], messages[i]);
                }
            } else {
                events   = listeners;
                for (i = 0; i < events.length; i++) {
                    this.removeEventListener(events[i]);
                }
            }
        };
        
        /**
         * This method adds an event listener to the entity.
         * 
         * @method addEventListener
         * @param event {String} The event that this component should listen for.
         * @param callback {Function} The handler for the event.
         * @private
         */
        proto.addEventListener = function (event, callback) {
            this.listener.events.push(event);
            this.listener.messages.push(callback);
            this.owner.bind(event, callback, this);
        };
        
        /**
         * This method adds a method to the entity.
         * 
         * @method addMethod
         * @param name {String} The name of the method. For example, if name is "turnYellow", the method is accessible on the entity as `entity.turnYellow()`.
         * @param func {Function} The function describing the method.
         * @private
         */
        proto.addMethod = function (name, func) {
            var self = this;
            
            if (this.owner[name]) {
                console.warn(this.owner.type + ': Entity already has a method called "' + name + '". Method not added.');
            } else {
                this.owner[name] = function () {
                    return func.apply(self, arguments);
                };
                this.publicMethods[name] = func;
            }
        };
    
        /**
         * This method removes an event listener from the entity.
         * 
         * @method removeEventListener
         * @param event {String} The event for which to remove a listener.
         * @param callback {Function} The listener to remove. If not supplied, all event listeners for the provided event are removed.
         * @private
         */
        proto.removeEventListener = function (event, callback) {
            var i = 0,
                events   = this.listener.events,
                messages = this.listener.messages;
            
            for (i = 0; i < events.length; i++) {
                if ((events[i] === event) && (!callback || (messages[i] === callback))) {
                    this.owner.unbind(event, messages[i], this);
                }
            }
        };
        
        /**
         * This method removes a method from the entity.
         * 
         * @method removeMethod
         * @param name {String} The name of the method to be removed.
         * @private
         */
        proto.removeMethod = function (name) {
            if (!this.owner[name]) {
                console.warn(this.owner.type + ': Entity does not have a method called "' + name + '".');
            } else {
                delete this.owner[name];
            }
            delete this.publicMethods[name];
        };

        platypus.components[componentDefinition.id] = component;
    };
}());

//##############################################################################
// PIXIAnimation.js
//##############################################################################

/**
 * This class plays animation sequences of frames and mimics the syntax required for creating CreateJS Sprites, allowing CreateJS Sprite Sheet definitions to be used with pixiJS.
 *
 * @class PIXIAnimation
 * @extends PIXI.Sprite
 */
//TODO: Document!
/*global console, PIXI, platypus */
/*jslint plusplus:true, nomen:true */
(function () {
    "use strict";
    
    var cache = PIXI.utils.TextureCache,
        createFramesArray = function (frame, bases) {
            var i = 0,
                fw = frame.width,
                fh = frame.height,
                rx = frame.regX || 0,
                ry = frame.regY || 0,
                w = 0,
                h = 0,
                x = 0,
                y = 0,
                frames = [];
            
            for (i = 0; i < bases.length; i++) {
                
                // Subtract the size of a frame so that margin slivers aren't returned as frames.
                w = bases[i].realWidth - fw;
                h = bases[i].realHeight - fh;
                
                for (y = 0; y <= h; y += fh) {
                    for (x = 0; x <= w; x += fw) {
                        frames.push([x, y, fw, fh, i, rx, ry]);
                    }
                }
            }
            
            return frames;
        },
        getBaseTextures = function (images) {
            var i = 0,
                bts = [],
                assetData;
            
            for (i = 0; i < images.length; i++) {
                assetData = platypus.assets[images[i]];
                if (assetData) {
                    if (!assetData.texture) {
                        assetData.texture = new PIXI.BaseTexture(assetData.asset);
                    }
                    bts.push(assetData.texture);
                } else {
                    console.warn('"' + images[i] + '" is not a loaded asset.');
                }
            }
            
            return bts;
        },
        getCacheId = function (images, frame) {
            return images[frame[4]] + '-x' + frame[0] + 'y' + frame[1] + 'w' + frame[2] + 'h' + frame[3];
        },
        formatAnimation = function (key, animation, textures) {
            var i = 0,
                frames = [];
            
            if (!isNaN(animation)) {
                frames.push(textures[animation] || PIXI.Texture.EMPTY);
                return {
                    id: key,
                    frames: frames,
                    next: key,
                    speed: 1
                };
            } else if (Array.isArray(animation)) {
                for (i = animation[0]; i < animation[1] + 1; i++) {
                    frames.push(textures[i] || PIXI.Texture.EMPTY);
                }
                return {
                    id: key,
                    frames: frames,
                    next: animation[2] || key,
                    speed: animation[3] || 1
                };
            } else {
                for (i = 0; i < animation.frames.length; i++) {
                    frames.push(textures[animation.frames[i]] || PIXI.Texture.EMPTY);
                }
                return {
                    id: key,
                    frames: frames,
                    next: animation.next || key,
                    speed: animation.speed || 1
                };
            }
        },
        standardizeAnimations = function (def, textures) {
            var key = '',
                anims = {};
            
            for (key in def) {
                if (def.hasOwnProperty(key)) {
                    anims[key] = formatAnimation(key, def[key], textures);
                }
            }
            
            return anims;
        },
        PIXIAnimation = function (spriteSheet, animation) {
            var i = 0,
                id = '',
                texture  = null,
                textures = [],
                frame    = null,
                frames   = spriteSheet.frames,
                images   = spriteSheet.images,
                speed    = (spriteSheet.framerate || 60) / 60,
                anims    = null,
                bases    = getBaseTextures(images);
            
            // Set up frames array
            if (!Array.isArray(frames)) {
                frames = createFramesArray(frames, bases);
            }
            
            // Set up texture for each frame
            for (i = 0; i < frames.length; i++) {
                frame = frames[i];
                id = getCacheId(images, frame);
                texture = cache[id];
                if (!texture) {
                    texture = cache[id] = new PIXI.Texture(bases[frame[4]], new PIXI.Rectangle(frame[0], frame[1], frame[2], frame[3]));
                }
                textures.push({
                    texture: texture,
                    anchor: new PIXI.Point((frame[5] || 0) / texture.width, (frame[6] || 0) / texture.height)
                });
            }
            
            // Set up animations
            anims = standardizeAnimations(spriteSheet.animations || {}, textures);

            // Set up a default animation that plays through all frames
            if (!anims['default']) {
                anims['default'] = formatAnimation('default', [0, textures.length - 1], textures);
            }
            
            PIXI.Sprite.call(this, textures[0].texture);
        
            /**
            * @private
            */
            this._animations = anims;
            
            this._animation = null;
        
            /**
            * The speed that the PIXIAnimation will play at. Higher is faster, lower is slower
            *
            * @member {number}
            * @default 1
            */
            this.animationSpeed = speed;
        
            /**
            * Function to call when a PIXIAnimation finishes playing
            *
            * @method
            * @memberof PIXIAnimation#
            */
            this.onComplete = null;
        
            /**
            * Elapsed time since animation has been started, used internally to display current texture
            *
            * @member {number}
            * @private
            */
            this._currentTime = 0;
        
            /**
            * Indicates if the PIXIAnimation is currently playing
            *
            * @member {boolean}
            * @readonly
            */
            this.playing = false;

            // Set up initial playthrough.
            if (textures.length < 2) {
                this.gotoAndStop(animation);
            } else {
                this.gotoAndPlay(animation);
            }
        },
        prototype = PIXIAnimation.prototype = Object.create(PIXI.Sprite.prototype);
    
    PIXIAnimation.prototype.constructor = PIXIAnimation;
    platypus.PIXIAnimation = PIXIAnimation;
    
    Object.defineProperties(prototype, {
        /**
        * The PIXIAnimations current frame index
        *
        * @member {number}
        * @memberof platypus.PIXIAnimation#
        * @readonly
        */
        currentFrame: {
            get: function () {
                var frames = this._animation.frames;
                return frames[Math.floor(this._currentTime) % frames.length];
            }
        }
    
    });
    
    /**
    * Stops the PIXIAnimation
    *
    */
    prototype.stop = function () {
        if (!this.playing) {
            return;
        }
    
        this.playing = false;
        PIXI.ticker.shared.remove(this.update, this);
    };
    
    /**
    * Plays the PIXIAnimation
    *
    */
    prototype.play = function () {
        if (this.playing) {
            return;
        }
    
        this.playing = true;
        PIXI.ticker.shared.add(this.update, this);
    };
    
    /**
    * Stops the PIXIAnimation and goes to a specific frame
    *
    * @param frameNumber {number} frame index to stop at
    */
    prototype.gotoAndStop = function (animation) {
        this.stop();
    
        this._currentTime = 0;
        this._animation = this._animations[animation];
        if (!this._animation) {
            this._animation = this._animations['default'];
        }
        this._texture = this._animation.frames[0].texture;
        this.anchor =  this._animation.frames[0].anchor;
    };
    
    /**
    * Goes to a specific frame and begins playing the PIXIAnimation
    * 
    * @method gotoAndPlay
    * @param animation {string} The animation to begin playing.
    */
    prototype.gotoAndPlay = function (animation) {
        this._currentTime = 0;
        this._animation = this._animations[animation];
        if (!this._animation) {
            this._animation = this._animations['default'];
        }
        this._texture = this._animation.frames[0].texture;
        this.anchor = this._animation.frames[0].anchor;
        
        this.play();
    };
    
    /*
    * Updates the object transform for rendering
    * @private
    */
    prototype.update = function (deltaTime) {
        var data = null,
            name = "",
            floor = 0;
        
        this._currentTime += this.animationSpeed * this._animation.speed * deltaTime;
        
        floor = Math.floor(this._currentTime);
    
        if (floor < 0) {
            floor = 0;
        }
        
        if (floor < this._animation.frames.length) {
            data = this._animation.frames[floor % this._animation.frames.length];
            this._texture = data.texture;
            this.anchor = data.anchor;
        } else if (floor >= this._animation.frames.length) {
            name = this._animation.id;
            this.gotoAndPlay(this._animation.next);
            if (this.onComplete) {
                this.onComplete(name);
            }
        }
    };
    
    /*
    * Stops the PIXIAnimation and destroys it
    *
    */
    prototype.destroy = function () {
        this.stop();
        PIXI.Sprite.prototype.destroy.call(this);
    };
}());

//##############################################################################
// PIXIGraphicsMixins.js
//##############################################################################

/**
 * This adds support for a tiny API to PIXI.Graphics similar to the CreateJS Graphics API. This is used for backwards support for RenderSprite masks.
 */
 
(function () {
	"use strict";
	
	var createDebug = function (param) {
			return function () {
				if (platypus.game.settings.debug) {
					console.log('"' + param + '" is not an available PIXI.Graphics method.');
				}
				return this;
			};
		},
		gfx = PIXI.Graphics.prototype;
	
	gfx.a  = gfx.arc;
	gfx.at = gfx.arcTo;
	gfx.bt = gfx.bezierCurveTo;
	gfx.c  = gfx.clear;
	gfx.dc = gfx.drawCircle;
	gfx.de = gfx.drawEllipse;
	gfx.dr = gfx.drawRect;
	gfx.ef = gfx.endFill;
	gfx.f  = gfx.beginFill;
	gfx.lt = gfx.lineTo;
	gfx.mt = gfx.moveTo;
	gfx.qt = gfx.quadraticCurveTo;
	gfx.r  = gfx.drawRect;
	gfx.rr = gfx.drawRoundedRect;
	
	gfx.cp = createDebug("cp");
	gfx.lf = createDebug("lf");
	gfx.rf = createDebug("rf");
	gfx.bf = createDebug("bf");
	gfx.ss = createDebug("ss");
	gfx.sd = createDebug("sd");
	gfx.s  = createDebug("s");
	gfx.ls = createDebug("ls");
	gfx.rs = createDebug("rs");
	gfx.bs = createDebug("bs");
	gfx.es = createDebug("es");
	gfx.rc = createDebug("rc");
	gfx.dp = createDebug("dp");
	gfx.p  = createDebug("p");
	
} ());

//##############################################################################
// PIXITransformOverride.js
//##############################################################################

(function () {
	"use strict";
	
	var prototype = PIXI.Container.prototype;
	
	prototype.updateTransform = function () {
		if (!this.visible) {
			return;
		}
	
		if (this.transformMatrix) {
			// Just copy the current matrix instead of working with properties.
			this.transformMatrix.copy(this.worldTransform).prepend(this.parent.worldTransform);
			
			// multiply the alphas..
			this.worldAlpha = this.alpha * this.parent.worldAlpha;
		
			// reset the bounds each time this is called!
			this._currentBounds = null;
		} else {
			this.displayObjectUpdateTransform();
		}
	
		for (var i = 0, j = this.children.length; i < j; ++i) {
			this.children[i].updateTransform();
		}
	};
	
	prototype.containerUpdateTransform = prototype.updateTransform;
} ());

//##############################################################################
// PlatypusPlugin.js
//##############################################################################

/**
 * This plugin instantiates a Platypus game using the configuration file.
 * 
 * @namespace platypus
 * @class PlatypusPlugin
 */
/*global include, platypus */
(function(){
    "use strict";
    
    var ApplicationPlugin = include('springroll.ApplicationPlugin'),
	    updateFunction = null,
        plugin = new ApplicationPlugin(),
        resizeFunction = null;

    // Preload is an optional asynchronous call for doing any loading
    // before the application is init. Make sure that done() is called
    // when this is complete. The display and options are available here.
    plugin.preload = function(done) {
        
        if (this.options.debug) { // Set debug property on game configuration.
            this.config.debug = true;
        }
        
        var game = this.game = new platypus.Game(this.config, this.display.stage);
		
		updateFunction = function (elapsed) {
	        game.tick({
	            delta: elapsed
	        });
		};

        resizeFunction = function (event) {
            game.currentScene.trigger('resize', event);
        }
		
		this.on('update', updateFunction);
        this.on('resize', resizeFunction);

        done(); // required!
    };

    // Clean-up when the application is destroyed
    plugin.teardown = function() {
		this.off('update', updateFunction);
        this.off('resize', resizeFunction);
		this.game.destroy();
		delete this.game;
    };
    
}());

//##############################################################################
// AIChaser.js
//##############################################################################

/**
 * This component acts as a simple AI that will chase another entity.
 * 
 * @namespace platypus.components
 * @class AIChaser
 * @uses Component
 */
/*global console, platypus */
(function () {
    "use strict";
    
    var tempVect = new platypus.Vector();

    return platypus.createComponentClass({
        
        id: 'AIChaser',
        
        properties: {
            /**
             * Sets whether the speed property should enact acceleration upon the entity rather than velocity.
             * 
             * @property accelerate
             * @type boolean
             * @default false
             */
            accelerate: false,
            
            /**
             * Whether the entity is in a chasing state.
             * 
             * @property chasing
             * @type boolean
             * @default true
             */
            chasing: true
        },
        
        publicProperties: {
            /**
             * Sets the velocity of the entity. This property is accessible on the entity as `entity.speed`.
             * 
             * @property speed
             * @type number
             * @default 0.3
             */
            speed: 0.3
        },
        
        constructor: function (definition) {
            this.target = this.owner.target || null;
            this.offset = new platypus.Vector(0, 0);
        },

        events: {
            /**
             * This component listens for this event to initialize movement.
             * 
             * @method 'load'
             */
            "load": function () {
                if (!this.owner.addMover) {
                    console.warn('The "AIChaser" component requires a "Mover" component to function correctly.');
                    return;
                }
                
                this.direction = this.owner.addMover({
                    vector: [this.speed, 0, 0],
                    event: "chase",
                    accelerator: this.accelerate
                }).vector;
            },
        
            /**
             * This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
             * 
             * @method 'handle-ai'
             */
            "handle-ai": function () {
                var v = tempVect,
                    m = 0,
                    c = false;

                if (this.target && this.chasing) {
                    v.set(this.offset).add(this.target.position).subtractVector(this.owner.position);
                    m = v.magnitude(2);

                    if (m) {
                        c = true;
                        this.direction.set(v).normalize().multiply(this.speed);
                    }
                }
                
                if (c !== this.owner.state.chasing) {
                    this.owner.state.chasing = c;
                    
                    /**
                     * This event is triggered whenever the entity begins chasing another entity or stops chasing another entity.
                     * 
                     * @event 'chase'
                     * @param chasing {boolean} Whether the entity is chasing another entity.
                     */
                    this.owner.triggerEvent('chase', c);
                }
            },
            
            /**
             * On receiving this message, the component will change its target and begin chasing the new entity.
             * 
             * @method 'set-target'
             * @param entity {Entity} Sets this entity's target to the provided entity.
             */
            "set-target": function (entity) {
                this.target = entity;
                this.offset.x = 0;
                this.offset.y = 0;
            },
            
            /**
             * On receiving this message, the component will change its target offset.
             * 
             * @method 'set-target-offset'
             * @param offset {Object|Vector} Sets the chased entity's offset to the provided offset.
             * @param offset.x {number} The offset along the x-axis.
             * @param offset.y {number} The offset along the y-axis.
             */
            "set-target-offset": function (offset) {
                this.offset.x = offset.x;
                this.offset.y = offset.y;
            },
            
            /**
             * On receiving this message, the component will begin chasing the entity.
             * 
             * @method 'start-chasing'
             * @param [entity] {Entity} Sets the entity if it's provided.
             */
            "start-chasing": function (entity) {
                if (entity) {
                    this.target = entity;
                }
                this.chasing = true;
            },
            
            /**
             * On receiving this message, the component will cease chasing the entity.
             * 
             * @method 'stop-chasing'
             */
            "stop-chasing": function () {
                this.chasing = false;
            }
        },
        
        methods: {// These are methods that are called on the component
            destroy: function () {
                this.target = null;
            }
        }
    });
}());

//##############################################################################
// AIPacer.js
//##############################################################################

/**
 * This component acts as a simple AI that will reverse the movement direction of an object when it collides with something.
 * 
 * @namespace platypus.components
 * @class AIPacer
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: "AIPacer",
        
        properties: {
            /**
             * This determines the direction of movement. Can be "horizontal", "vertical", or "both".
             * 
             * @property movement
             * @type String
             * @default "both"
             */
            movement: 'both',
            
            /**
             * This sets the initial direction of movement. Defaults to "up", or "left" if movement is horizontal.
             * 
             * @property direction
             * @type String
             * @default "up"
             */
            direction: null
        },
        
        constructor: function (definition) {
            this.lastDirection    = '';
            this.currentDirection = this.direction || ((this.movement === 'horizontal') ? 'left' : 'up');
        },
        
        events: {
            /**
             * This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
             * 
             * @method 'handle-ai'
             */
            "handle-ai": function () {
                if (this.currentDirection !== this.lastDirection) {
                    this.lastDirection = this.currentDirection;
                    
                    /**
                     * Triggers this event prior to changing direction.
                     * 
                     * @event 'stop'
                     */
                    this.owner.triggerEvent('stop');
                    
                    /**
                     * Triggers this event when the entity is moving right and collides with something.
                     * 
                     * @event 'go-left'
                     */
                    /**
                     * Triggers this event when the entity is moving left and collides with something.
                     * 
                     * @event 'go-right'
                     */
                    /**
                     * Triggers this event when the entity is moving up and collides with something.
                     * 
                     * @event 'go-down'
                     */
                    /**
                     * Triggers this event when the entity is moving down and collides with something.
                     * 
                     * @event 'go-up'
                     */
                    this.owner.triggerEvent('go-' + this.currentDirection);
                }
            },
            
            /**
             * On receiving this message, the component will check the collision side and re-orient itself accordingly.
             * 
             * @method 'turn-around'
             * @param message {CollisionData} Uses direction of collision to determine whether to turn around.
             */
            "turn-around": function (collisionInfo) {
                if ((this.movement === 'both') || (this.movement === 'horizontal')) {
                    if (collisionInfo.x > 0) {
                        this.currentDirection = 'left';
                    } else if (collisionInfo.x < 0) {
                        this.currentDirection = 'right';
                    }
                }
                if ((this.movement === 'both') || (this.movement === 'vertical')) {
                    if (collisionInfo.y > 0) {
                        this.currentDirection = 'up';
                    } else if (collisionInfo.y < 0) {
                        this.currentDirection = 'down';
                    }
                }
            }
        }
    });
}());

//##############################################################################
// AssetLoader.js
//##############################################################################

/**
 * This component loads a list of assets, wrapping [PreloadJS](http://www.createjs.com/Docs/PreloadJS/modules/PreloadJS.html) or [SpringRoll](http://springroll.github.io/SpringRoll/classes/springroll.Loader.html)loading functionality into a game engine component.
 *
 * @namespace platypus.components
 * @class AssetLoader
 * @uses Component
 */
/*global console, include, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    
    var Application = include('springroll.Application'), // Import SpringRoll classes
        createId = function (src) { // returns just the filename (sans extension) as the Id.
            var arr = src.split('/');
            
            arr = arr[arr.length - 1].split('.');
            
            return arr[0];
        },
        checkPush  = function (asset, list) {
            var i = 0,
                found = false;
            
            if (!asset.id) {
                asset.id = createId(asset.src);
            }
            
            for (i = 0; i < list.length; i++) {
                if (list[i].id === asset.id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                list.push(asset);
            }
        };
    
    return platypus.createComponentClass({
        id: 'AssetLoader',
        
        properties: {
            /**
             * Determines whether to automatically load assets when this component loads.
             * 
             * @property automatic
             * @type boolean
             * @default true
             */
            automatic: true,
            
            /**
             * A list of assets to load. If not provided, the asset list is pulled directly from the game configuration file's asset list.
             * 
             * The list of assets should use PreloadJS syntax such as:
             *       [
             *           {"id": "item-1",         "src": "images/item-1.png"},
             *           {"id": "item-2",         "src": "images/item-2.png"},
             *           {"id": "item-3",         "src": "images/item-3.png"}
             *       ]
             * 
             * @property assets
             * @type Array
             * @default null
             */
            assets: null,
            
            /**
             * Determines whether to store the loaded assets automatically in platypus.assets for later retrieval.
             * 
             * @property cache
             * @type boolean
             * @default true
             */
            cache: true
        },

        constructor: function (definition) {
            if (!this.assets) {
                this.assets = platypus.game.settings.assets;
            }
            
            this.app = Application.instance;
            this.sound = this.app.sound;
            
            this.owner.assets = {};
            this.progress = 0;
            this.total = 0;
            this.assetInterface = null;
        },

        events: {
            /**
             * On receiving this event, the asset loader begins downloading the list of assets if the "automatic" property is not set to `false`.
             * 
             * @method 'load'
             */
            "load": function () {
                if (this.automatic) {
                    /**
                     * This event is triggered as soon as the entity loads if the "automatic" property is not set to `false`.
                     * 
                     * @event 'load-assets'
                     */
                    this.owner.triggerEvent('load-assets');
                }
            },

            /**
             * On receiving this event, the asset loader begins downloading the list of assets.
             * 
             * @method 'load-assets'
             */
            "load-assets": function () {
                var onFileLoad = function (result, data) {
                        var asset = null;
                        
                        if (data && data.id) {
                            asset = this.owner.assets[data.id] = {
                                data:  data,
                                asset: result
                            };
                        
                            if (this.cache) {
                                platypus.assets[data.id] = asset;
                            }
                        } else { // audio files don't return any data from the SpringRoll loader.
                            result = null;
                            data   = null;
                        }
                        
                        this.progress += 1;
                        
                        /**
                        * This message is broadcast when an asset has been loaded.
                        * 
                        * @event 'file-load'
                        * @param load {Object} 
                        * @param load.asset {Object} Loaded asset. (`null` for audio)
                        * @param load.data {Object} Key/value pairs containing asset data. (`null` for audio) 
                        * @param load.complete {boolean} Whether this is the final asset to be loaded.
                        * @param load.total {number} The total number of assets being loaded.
                        * @param load.progress {number} The number of assets finished loading.
                        * @param load.fraction {number} Value of (progress / total) provided for convenience.
                        */
                        this.owner.trigger('file-load', {
                            asset:    result,
                            complete: (this.progress === this.total),
                            data:     data,
                            fraction: this.progress / this.total,
                            progress: this.progress,
                            total:    this.total
                        });
                        
                        if (this.progress === this.total) {
                            /**
                            * This message is triggered when the asset loader is finished loading assets.
                            * 
                            * @event 'complete'
                            */
                            this.owner.triggerEvent('complete');
                        }
                    }.bind(this);
                
                this.load(onFileLoad);
            }
        },
        
        methods: {
            destroy: function () {
                delete this.owner.assets;
            },
            
            load: function (onFileLoad) {
                var i = 0,
                    loadAssets = [],
                    sound = this.sound;

                for (i = 0; i < this.assets.length; i++) {
                    if (typeof this.assets[i] === 'string') {
                        checkPush({src: this.assets[i]}, loadAssets);
                    } else if (typeof this.assets[i].src === 'string') {
                        checkPush(this.assets[i], loadAssets);
                    }
                }

                platypus.assets = platypus.assets || {};
                this.total = loadAssets.length;

                if (sound) {
                    for (i = loadAssets.length - 1; i >= 0; i--) {
                        if (sound.exists(loadAssets[i].id)) {
                            sound.preload(loadAssets[i].id, onFileLoad);
                            loadAssets.splice(i, 1);
                        }
                    }
                }

                if (loadAssets.length) {
                    this.app.load(loadAssets, {
                        taskDone: onFileLoad
                    });
                }
            }
        }
    });
}());

//##############################################################################
// Audio.js
//##############################################################################

/**
 * This component plays audio using [SoundJS](http://www.createjs.com/Docs/SoundJS/module_SoundJS.html). Audio is played in one of two ways, by triggering specific messages defined in the audio component definition or using an audio map which plays sounds when the entity enters specified states (like [[RenderSprite]]).
 * 
 * @namespace platypus.components
 * @class Audio
 * @uses Component
 * @deprecated Use `components.AudioSFX` or `components.AudioVO` instead.
 */
/*global include, createjs, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var Application = include('springroll.Application'), // Import SpringRoll classes
        defaultSettings = {
            interrupt: createjs.Sound.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
            delay:     0,
            offset:    0,
            loop:      0,
            volume:    1,
            pan:       0,
            mute:      false,
            paused:    false,
            next:      false,
            events:    false
        },
        sortByTime = function (a, b) {
            return a.time - b.time;
        },
        VOInterface = function () {
            var player   = Application.instance.voPlayer;
            
            this.play = function (sound, options) {
                var complete = options.complete;
                
                player.play(sound, function () {
                    complete(false);
                }, function () {
                    complete(true);
                });
                return this;
            };
            
            // Instance behaviors
            this.stop = this.pause = function () {
                player.stop();
            };
            
            this.unpause = function () {
                // No equivalent for voPlayer
            };
            
            Object.defineProperty(this, 'position', {
                get: function () {
                    if (player.playing) {
                        return player.getElapsed();
                    } else {
                        return 0;
                    }
                }
            });
        },
        SoundInterface = function () {
            var player = Application.instance.sound;
            
            this.play = function (sound, options) {
                return player.play(sound, options);
            };
        },
        playSound = function (soundDefinition) {
            var i          = 0,
                sound      = '',
                property   = '',
                attributes = null;
            
            if (typeof soundDefinition === 'string') {
                sound      = soundDefinition;
                attributes = {};
            } else if (Array.isArray(soundDefinition)) {
                if (typeof soundDefinition[0] === 'string') {
                    sound      = soundDefinition[0];
                    attributes = {next: []};
                } else {
                    sound      = soundDefinition[0].sound;
                    attributes = {};
                    for (property in soundDefinition[0]) {
                        if (soundDefinition[0].hasOwnProperty(property)) {
                            attributes[property] = soundDefinition[0][property];
                        }
                    }
                    if (attributes.next) {
                        attributes.next = attributes.next.slice();
                    } else {
                        attributes.next = [];
                    }
                }
                for (i = 1; i < soundDefinition.length; i++) {
                    attributes.next.push(soundDefinition[i]);
                }
            } else {
                sound      = soundDefinition.sound;
                attributes = {
                    interrupt: soundDefinition.interrupt,
                    delay:     soundDefinition.delay,
                    offset:    soundDefinition.offset,
                    loop:      soundDefinition.loop,
                    volume:    soundDefinition.volume,
                    pan:       soundDefinition.pan,
                    startTime: soundDefinition.startTime,
                    duration:  soundDefinition.duration,
                    mute:      soundDefinition.mute,
                    paused:    soundDefinition.paused,
                    next:      soundDefinition.next,
                    events:    soundDefinition.events
                };
            }

            return function (value) {
                var i           = 0,
                    self        = this,
                    audio       = null,
                    next        = false,
                    events      = false;

                value = value || attributes;
                if (value.stop) {
                    this.stopAudio(sound, value.playthrough);
                } else {
                    next          = value.next      || attributes.next   || defaultSettings.next;
                    events        = value.events    || attributes.events || defaultSettings.events;
                    
                    audio = this.player.play(sound, {
                        interrupt:  value.interrupt || attributes.interrupt || defaultSettings.interrupt,
                        delay:      value.delay     || attributes.delay  || defaultSettings.delay,
                        loop:       value.loop      || attributes.loop   || defaultSettings.loop,
                        offset:     value.offset    || attributes.offset || defaultSettings.offset,
                        volume:     (typeof value.volume !== 'undefined') ? value.volume : ((typeof attributes.volume !== 'undefined') ? attributes.volume : defaultSettings.volume),
                        pan:        value.pan       || attributes.pan    || defaultSettings.pan,
                        mute:       value.mute      || attributes.mute   || defaultSettings.mute,
                        paused:     value.paused    || attributes.paused || defaultSettings.paused,
                        complete: function (cancelled) {
                            if (audio) {
                                if (cancelled) {
                                    self.onComplete(audio);
                                } else {
                                    self.onComplete(audio, next);
                                }
                            }
                        }
                    });
                    
                    if (audio) {
                        if (events) {
                            audio.sequenceEvents = [];
                            for (i = 0; i < events.length; i++) {
                                audio.sequenceEvents.push({
                                    event: events[i].event,
                                    time: events[i].time || 0,
                                    message: events[i].message
                                });
                            }
                            audio.sequenceEvents.sort(sortByTime);
                        }
    
                        audio.soundId = sound;
                        this.activeAudioClips.push(audio);
                    }
                }
            };
        },
        createTest = function (testStates, audio, play) {
            var states = testStates.replace(/ /g, '').split(',');
            if (testStates === 'default') {
                return function (state) {
                    play.call(this);
                    return testStates;
                };
            } else {
                return function (state) {
                    var i = 0;

                    for (i = 0; i < states.length; i++) {
                        if (!state[states[i]]) {
                            return false;
                        }
                    }
                    play.call(this);
                    return testStates;
                };
            }
        };
    
    return platypus.createComponentClass({
        id: 'Audio',
        
        properties: {
            /**
             * Use the audioMap property object to map messages triggered with audio clips to play. At least one audio mapping should be included for audio to play. Here is an example audioMap object:
             * 
             *       {
             *           "message-triggered": "audio-id",
             *           // This simple form is useful to listen for "message-triggered" and play "audio-id" using default audio properties.
             * 
             *           "another-message": {
             *           // To specify audio properties, instead of mapping the message to an audio id string, map it to an object with one or more of the properties shown below. Many of these properties directly correspond to SoundJS play parameters.
             * 
             *               "sound": "another-audio-id",
             *               // Required. This is the audio clip to play when "another-message" is triggered.
             * 
             *               "interrupt": "none",
             *               // Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
             *           
             *               "delay": 500,
             *               // Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
             * 
             *               "offset": 1500,
             *               // Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
             * 
             *               "length": 2500,
             *               // Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
             * 
             *               "loop": 4,
             *               // Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
             * 
             *               "volume": 0.75,
             *               // Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
             * 
             *               "pan": -0.25,
             *               // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
             * 
             *               "next": ["audio-id"]
             *               // Optional. Used to specify a list of audio clips to play once this one is finished.
             *           }
             *       }
             * 
             * @property audioMap
             * @type Object
             * @default null
             */
            audioMap: null,
            
            /**
             * Determines whether a sound that's started should play through completely regardless of entity state changes.
             * 
             * @property forcePlayThrough
             * @type boolean
             * @default true
             */
            forcePlayThrough: true,
            
            /**
             * Determines whether a playing sound is interruptable VO.
             * 
             * @property voiceOver
             * @type boolean
             * @default false
             */
            voiceOver: false
        },
            
        constructor: function (definition) {
            var key      = '',
                playClip = null;
            
            this.activeAudioClips = [];
    
            this.state = this.owner.state;
            this.stateChange = false;
            this.currentState = false;
            
            if (this.voiceOver) {
                this.player = new VOInterface();
            } else {
                this.player = new SoundInterface();
            }
    
            if (definition.audioMap) {
                this.checkStates = [];
                for (key in definition.audioMap) {
                    if (definition.audioMap.hasOwnProperty(key)) {
                        playClip = playSound(definition.audioMap[key]);
                        
                        /**
                         * Listens for messages specified by the `audioMap` and on receiving them, begins playing corresponding audio clips. Audio play message can optionally include several parameters, many of which correspond with SoundJS play parameters.
                         * 
                         * @method '*'
                         * @param message.interrupt (string) - Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
                         * @param message.delay (integer) - Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
                         * @param message.offset (integer) - Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
                         * @param message.length (integer) - Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
                         * @param message.loop (integer) - Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
                         * @param message.volume (float) - Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
                         * @param message.pan (float) - Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
                         * @param message.next (string) - Optional. Used to specify the next audio clip to play once this one is complete.
                         */
                        this.addEventListener(key, playClip);
                        this.checkStates.push(createTest(key, definition.audioMap[key], playClip));
                    }
                }
            }
            
            this.paused          = false;
        },

        events: {
            /**
             * On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
             * 
             * @method 'handle-render'
             */
            "handle-render": function () {
                var self      = this,
                    i         = 0,
                    audioClip = null;
                
                if (this.paused) {
                    return;
                }
                
                this.getAllClips(function (clip) {
                    self.checkTimeEvents(clip);
                });

                if (this.stateChange) {
                    if (this.checkStates) {
                        if (this.currentState) {
                            this.stopAudio(this.currentState.soundId, this.forcePlaythrough);
                        }
                        this.currentState = false;
                        for (i = 0; i < this.checkStates.length; i++) {
                            audioClip = this.checkStates[i].call(this, this.state);
                            if (audioClip) {
                                this.currentState = audioClip;
                                break;
                            }
                        }
                    }
                    this.stateChange = false;
                }
            },
             
            /**
             * This component listens for changes to the entity state and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
             * 
             * @method 'state-changed'
             */
            "state-changed": function () {
                this.stateChange = true;
            },

            /**
             * On receiving this message, the audio will mute if unmuted, and unmute if muted.
             * 
             * @method 'toggle-mute'
             * @param audioId {String} If an audioId is provided, that particular sound instance is toggled. Otherwise all audio is toggled from mute to unmute or vice versa.
             */
            "toggle-mute": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        if (clip.unmuted) {
                            clip.volume = clip.unmuted;
                            delete clip.unmuted;
                        } else {
                            clip.unmuted = clip.volume;
                            clip.volume = 0;
                        }
                    }
                });
            },

            /**
             * On receiving this message, audio will stop playing.
             * 
             * @method 'stop-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance is stopped. Otherwise all audio is stopped.
             */
            "stop-audio": function (audioId) {
                if (!audioId) {
                    this.stopAudio();
                } else if (typeof audioId === 'string') {
                    this.stopAudio(audioId);
                } else {
                    this.stopAudio(audioId.audioId || false, audioId.playthrough || false);
                }
            },

            /**
             * On receiving this message all audio will mute, or a particular sound instance will mute if an id is specified.
             * 
             * @method 'mute-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will mute. Otherwise all audio is muted.
             */
            "mute-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.unmuted = clip.volume;
                        clip.volume = 0;
                    }
                });
            },

            /**
             * On receiving this message all audio will unmute, or a particular sound instance will unmute if an id is specified.
             * 
             * @method 'unmute-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will unmute. Otherwise all audio is unmuted.
             */
            "unmute-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.volume = clip.unmuted;
                        delete clip.unmuted;
                    }
                });
            },

            /**
             * On receiving this message all audio will pause, or a particular sound instance will pause if an id is specified.
             * 
             * @method 'pause-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will pause. Otherwise all audio is paused.
             */
            "pause-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.pause();
                    }
                });
            },

            /**
             * On receiving this message all audio will unpause, or a particular sound instance will unpause if an id is specified.
             * 
             * @method 'unpause-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will unpause. Otherwise all audio is unpaused.
             */
            "unpause-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.unpause();
                    }
                });
            },
             
            /**
             * This message sets the volume of playing audio.
             * 
             * @method 'set-volume'
             * @param audioId {String} If an audioId is provided, that particular sound instance's volume is set. Otherwise all audio volume is changed.
             */
            "set-volume": function (volume) {
                var vol     = 0,
                    handler = function (clip) {
                        clip.volume = vol;
                    };

                if (typeof volume === 'number') {
                    vol = volume;
                    this.getAllClips(handler);
                } else if (volume.volume) {
                    vol = volume.volume;
                    this.handleClip(volume.soundId, handler);
                }
            }
        },
        
        methods: {
            handleClip: function (audioId, handler) {
                if (typeof audioId === 'string') {
                    this.getClipById(audioId, handler);
                } else {
                    this.getAllClips(handler);
                }
            },
            
            getClipById: function (id, onGet) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                for (i = 0; i < clips.length; i++) {
                    if (clips[i].soundId === id) {
                        if (onGet) {
                            onGet(clips[i]);
                        }
                        return clips[i];
                    }
                }
                
                if (onGet) {
                    onGet(null);
                }

                return null;
            },
            
            getAllClips: function (onGet) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                if (onGet) {
                    for (i = 0; i < clips.length; i++) {
                        onGet(clips[i]);
                    }
                }

                return clips;
            },
            
            stopAudio: function (audioId, playthrough) {
                var i        = 0,
                    clips    = this.activeAudioClips,
                    self     = this,
                    loopFunc = function (instance) {
                        self.stopAudioInstance(instance.currentTarget);
                    };
                
                if (audioId) {
                    for (i = clips.length - 1; i >= 0; i--) {
                        if (clips[i].soundId === audioId) {
                            if (playthrough) {
                                clips[i].addEventListener('loop', loopFunc);
                            } else {
                                clips[i].stop();
                                clips.splice(i, 1);
                            }
                        }
                    }
                } else {
                    if (playthrough) {
                        for (i = 0; i < clips.length; i++) {
                            clips[i].addEventListener('loop', loopFunc);
                        }
                    } else {
                        for (i = 0; i < this.activeAudioClips.length; i++) {
                            clips[i].stop();
                        }
                        clips.length = 0;
                    }
                }
            },
            
            stopAudioInstance: function (instance) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                for (i = clips.length - 1; i >= 0; i--) {
                    if (clips[i] === instance) {
                        clips[i].stop();
                        clips.splice(i, 1);
                    }
                }
            },
            
            checkTimeEvents: function (audioClip, finished) {
                var events      = audioClip.sequenceEvents,
                    currentTime = 0;
                
                if (events && events.length) {
                    currentTime = audioClip.position;

                    while (events.length && (finished || (events[0].time <= currentTime))) {
                        this.owner.trigger(events[0].event, events[0].message);
                        events.splice(0, 1);
                    }
                }
            },
        
            onComplete: function (audioClip, next) {
                //clean up active clips
                this.removeClip(audioClip);
                
                this.checkTimeEvents(audioClip, true);
                
                /**
                 * When a single audio clip is finished playing, this event is triggered.
                 * 
                 * @event clip-complete
                 */
                this.owner.triggerEvent('clip-complete');
                
                if (next && next.length) {
                    if (typeof next === 'string') {
                        (playSound(next)).call(this);
                    } else {
                        var arr = next.slice();
                        arr.splice(0, 1);
                        if (arr.length > 0) {
                            (playSound(next[0])).call(this, {'next': arr});
                        } else {
                            (playSound(next[0])).call(this);
                        }
                    }
                } else {
                    /**
                     * When an audio sequence is finished playing, this event is triggered.
                     * 
                     * @event sequence-complete
                     */
                    this.owner.triggerEvent('sequence-complete');
                }
            },
            
            removeClip: function (audioClip) {
                var i = 0;

                for (i = 0; i < this.activeAudioClips.length; i++) {
                    if (this.activeAudioClips[i] === audioClip) {
                        this.activeAudioClips.splice(i, 1);
                        break;
                    }
                }
            },
            
            destroy: function () {
                this.stopAudio();
            }
        }
    });
}());

//##############################################################################
// AudioMobile.js
//##############################################################################

/**
 * Activates audio on mobile devices. This component should be included on the same entity as the asset loader.
 * 
 * Example "progress-bar" entity that could use this component:

    {
        "id": "progress-bar",
        "components":[{
            "type": "AudioMobile",
            "button": {
                "image": "play-button.png"
            }
        },{
            "type": "AssetLoader"
        },{
            "type": "SceneChanger",
            "scene": "menu",
            "aliases": {"audio-ready": "new-scene"}
        }]
    }

 * 
 * @namespace platypus.components
 * @class AudioMobile
 * @uses Component
 */
/*global console, platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'AudioMobile',
        
        properties: {
            /**
             * Specifies the image or sprite sheet information needed to create the play button for mobile devices.
             * 
             * Set `button.image` to set an image or `button.spriteSheet` to set the sprite sheet.
             * 
             * May also set a position for the button:
             *
             *     {
             *         "spriteSheet": "buttons",
             *         "x": 0,
             *         "y": 200
             *     }
             *
             * @property button
             * @type Object
             * @default {}
             */
            button: {}
        },
        
        constructor: function (definition) {
        },

        events: {
            /**
             * On hearing this event, this component will load the next scene or provide a button for mobile devices to allow audio playback.
             * 
             * @method 'complete'
             */
            "complete": function () {

                /**
                 * Triggers this event once the audio is ready to play.
                 * 
                 * @event 'audio-ready'
                 */
                if (platypus.supports.mobile) {
                    // Remove the progress bar and show a button!
                    this.owner.removeComponent('RenderSprite');
                    this.owner.removeComponent('RenderProgress');
                    this.owner.addComponent(new platypus.components.RenderSprite(this.owner, {
                        image: this.button.image,
                        spriteSheet: this.button.spriteSheet,
                        acceptInput: {click: true, touch: true}
                    }));
                    this.owner.addComponent(new platypus.components.LogicCanvasButton(this.owner, {
                        onRelease: "audio-ready"
                    }));
                    if (!isNaN(this.button.x)) {
                        this.owner.x = this.button.x;
                    }
                    if (!isNaN(this.button.y)) {
                        this.owner.y = this.button.y;
                    }

                    /**
                     * This event notifies the parent entity that this child has been updated.
                     *
                     * @event 'child-entity-updated'
                     * @param entity {platypus.Entity} This component's owner.
                     */
                    this.owner.parent.triggerEvent("child-entity-updated", this.owner);
                } else {
                    this.owner.triggerEvent('audio-ready');
                }
            }
        }
    });
}());

//##############################################################################
// AudioSFX.js
//##############################################################################

/**
 * This component plays audio using the SpringRoll Sound instance. Audio is played in one of two ways, by triggering specific messages defined in the audio component definition or using an audio map which plays sounds when the entity enters specified states.
 * 
 * @namespace platypus.components
 * @class AudioSFX
 * @uses Component
 * @since tbd
 */
/*global include, createjs, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var Application = include('springroll.Application'), // Import SpringRoll classes
        defaultSettings = {
            interrupt: createjs.Sound.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
            delay:     0,
            offset:    0,
            loop:      0,
            volume:    1,
            pan:       0,
            mute:      false,
            paused:    false
        },
        playSound = function (soundDefinition) {
            var sound      = '',
                attributes = null;
            
            if (typeof soundDefinition === 'string') {
                sound      = soundDefinition;
                attributes = {};
            } else {
                sound      = soundDefinition.sound;
                attributes = {
                    interrupt: soundDefinition.interrupt,
                    delay:     soundDefinition.delay,
                    offset:    soundDefinition.offset,
                    loop:      soundDefinition.loop,
                    volume:    soundDefinition.volume,
                    pan:       soundDefinition.pan,
                    startTime: soundDefinition.startTime,
                    duration:  soundDefinition.duration,
                    mute:      soundDefinition.mute,
                    paused:    soundDefinition.paused
                };
            }

            return function (value) {
                var self        = this,
                    audio       = null;

                value = value || attributes;

                audio = this.player.play(sound, {
                    interrupt:  value.interrupt || attributes.interrupt || defaultSettings.interrupt,
                    delay:      value.delay     || attributes.delay  || defaultSettings.delay,
                    loop:       value.loop      || attributes.loop   || defaultSettings.loop,
                    offset:     value.offset    || attributes.offset || defaultSettings.offset,
                    volume:     (typeof value.volume !== 'undefined') ? value.volume : ((typeof attributes.volume !== 'undefined') ? attributes.volume : defaultSettings.volume),
                    pan:        value.pan       || attributes.pan    || defaultSettings.pan,
                    mute:       value.mute      || attributes.mute   || defaultSettings.mute,
                    paused:     value.paused    || attributes.paused || defaultSettings.paused,
                    complete: function (cancelled) {
                        if (audio) {
                            self.onComplete(audio);
                        }
                    }
                });
                
                if (audio) {
                    audio.soundId = sound;
                    this.activeAudioClips.push(audio);
                }
            };
        },
        createTest = function (testStates, audio, play) {
            var states = testStates.replace(/ /g, '').split(',');
            if (testStates === 'default') {
                return function (state) {
                    play.call(this);
                    return testStates;
                };
            } else {
                return function (state) {
                    var i = 0;

                    for (i = 0; i < states.length; i++) {
                        if (!state[states[i]]) {
                            return false;
                        }
                    }
                    play.call(this);
                    return testStates;
                };
            }
        };
    
    return platypus.createComponentClass({
        id: 'AudioSFX',
        
        properties: {
            /**
             * Use the audioMap property object to map messages triggered with audio clips to play. At least one audio mapping should be included for audio to play. Here is an example audioMap object:
             * 
             *       {
             *           "message-triggered": "audio-id",
             *           // This simple form is useful to listen for "message-triggered" and play "audio-id" using default audio properties.
             * 
             *           "another-message": {
             *           // To specify audio properties, instead of mapping the message to an audio id string, map it to an object with one or more of the properties shown below. Many of these properties directly correspond to SoundJS play parameters.
             * 
             *               "sound": "another-audio-id",
             *               // Required. This is the audio clip to play when "another-message" is triggered.
             * 
             *               "interrupt": "none",
             *               // Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
             *           
             *               "delay": 500,
             *               // Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
             * 
             *               "offset": 1500,
             *               // Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
             * 
             *               "length": 2500,
             *               // Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
             * 
             *               "loop": 4,
             *               // Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
             * 
             *               "volume": 0.75,
             *               // Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
             * 
             *               "pan": -0.25
             *               // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
             *           }
             *       }
             * 
             * @property audioMap
             * @type Object
             * @default null
             */
            audioMap: null,
            
            /**
             * Determines whether a sound that's started should play through completely regardless of entity state changes.
             * 
             * @property forcePlayThrough
             * @type boolean
             * @default true
             */
            forcePlayThrough: true
        },
            
        constructor: function (definition) {
            var key      = '',
                playClip = null;
            
            this.activeAudioClips = [];
    
            this.state = this.owner.state;
            this.stateChange = false;
            this.currentState = false;
            
            this.player = Application.instance.sound;
    
            if (definition.audioMap) {
                this.checkStates = [];
                for (key in definition.audioMap) {
                    if (definition.audioMap.hasOwnProperty(key)) {
                        playClip = playSound(definition.audioMap[key]);
                        
                        /**
                         * Listens for messages specified by the `audioMap` and on receiving them, begins playing corresponding audio clips. Audio play message can optionally include several parameters, many of which correspond with SoundJS play parameters.
                         * 
                         * @method '*'
                         * @param message.interrupt (string) - Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
                         * @param message.delay (integer) - Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
                         * @param message.offset (integer) - Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
                         * @param message.length (integer) - Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
                         * @param message.loop (integer) - Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
                         * @param message.volume (float) - Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
                         * @param message.pan (float) - Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
                         * @param message.next (string) - Optional. Used to specify the next audio clip to play once this one is complete.
                         */
                        this.addEventListener(key, playClip);
                        this.checkStates.push(createTest(key, definition.audioMap[key], playClip));
                    }
                }
            }
            
            this.paused          = false;
        },

        events: {
            /**
             * On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
             * 
             * @method 'handle-render'
             */
            "handle-render": function () {
                var i         = 0,
                    audioClip = null;
                
                if (this.paused) {
                    return;
                }
                
                if (this.stateChange) {
                    if (this.checkStates) {
                        if (this.currentState) {
                            this.stopAudio(this.currentState.soundId, this.forcePlaythrough);
                        }
                        this.currentState = false;
                        for (i = 0; i < this.checkStates.length; i++) {
                            audioClip = this.checkStates[i].call(this, this.state);
                            if (audioClip) {
                                this.currentState = audioClip;
                                break;
                            }
                        }
                    }
                    this.stateChange = false;
                }
            },
             
            /**
             * This component listens for changes to the entity state and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
             * 
             * @method 'state-changed'
             */
            "state-changed": function () {
                this.stateChange = true;
            },

            /**
             * On receiving this message, the audio will mute if unmuted, and unmute if muted.
             * 
             * @method 'toggle-mute'
             * @param audioId {String} If an audioId is provided, that particular sound instance is toggled. Otherwise all audio is toggled from mute to unmute or vice versa.
             */
            "toggle-mute": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        if (clip.unmuted) {
                            clip.volume = clip.unmuted;
                            delete clip.unmuted;
                        } else {
                            clip.unmuted = clip.volume;
                            clip.volume = 0;
                        }
                    }
                });
            },

            /**
             * On receiving this message, audio will stop playing.
             * 
             * @method 'stop-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance is stopped. Otherwise all audio is stopped.
             */
            "stop-audio": function (audioId) {
                if (!audioId) {
                    this.stopAudio();
                } else if (typeof audioId === 'string') {
                    this.stopAudio(audioId);
                } else {
                    this.stopAudio(audioId.audioId || false, audioId.playthrough || false);
                }
            },

            /**
             * On receiving this message all audio will mute, or a particular sound instance will mute if an id is specified.
             * 
             * @method 'mute-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will mute. Otherwise all audio is muted.
             */
            "mute-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.unmuted = clip.volume;
                        clip.volume = 0;
                    }
                });
            },

            /**
             * On receiving this message all audio will unmute, or a particular sound instance will unmute if an id is specified.
             * 
             * @method 'unmute-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will unmute. Otherwise all audio is unmuted.
             */
            "unmute-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.volume = clip.unmuted;
                        delete clip.unmuted;
                    }
                });
            },

            /**
             * On receiving this message all audio will pause, or a particular sound instance will pause if an id is specified.
             * 
             * @method 'pause-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will pause. Otherwise all audio is paused.
             */
            "pause-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.pause();
                    }
                });
            },

            /**
             * On receiving this message all audio will unpause, or a particular sound instance will unpause if an id is specified.
             * 
             * @method 'unpause-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will unpause. Otherwise all audio is unpaused.
             */
            "unpause-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.unpause();
                    }
                });
            },
             
            /**
             * This message sets the volume of playing audio.
             * 
             * @method 'set-volume'
             * @param audioId {String} If an audioId is provided, that particular sound instance's volume is set. Otherwise all audio volume is changed.
             */
            "set-volume": function (volume) {
                var vol     = 0,
                    handler = function (clip) {
                        clip.volume = vol;
                    };

                if (typeof volume === 'number') {
                    vol = volume;
                    this.getAllClips(handler);
                } else if (volume.volume) {
                    vol = volume.volume;
                    this.handleClip(volume.soundId, handler);
                }
            }
        },
        
        methods: {
            handleClip: function (audioId, handler) {
                if (typeof audioId === 'string') {
                    this.getClipById(audioId, handler);
                } else {
                    this.getAllClips(handler);
                }
            },
            
            getClipById: function (id, onGet) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                for (i = 0; i < clips.length; i++) {
                    if (clips[i].soundId === id) {
                        if (onGet) {
                            onGet(clips[i]);
                        }
                        return clips[i];
                    }
                }
                
                if (onGet) {
                    onGet(null);
                }

                return null;
            },
            
            getAllClips: function (onGet) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                if (onGet) {
                    for (i = 0; i < clips.length; i++) {
                        onGet(clips[i]);
                    }
                }

                return clips;
            },
            
            stopAudio: function (audioId, playthrough) {
                var i        = 0,
                    clips    = this.activeAudioClips,
                    self     = this,
                    loopFunc = function (instance) {
                        self.stopAudioInstance(instance.currentTarget);
                    };
                
                if (audioId) {
                    for (i = clips.length - 1; i >= 0; i--) {
                        if (clips[i].soundId === audioId) {
                            if (playthrough) {
                                clips[i].addEventListener('loop', loopFunc);
                            } else {
                                clips[i].stop();
                                clips.splice(i, 1);
                            }
                        }
                    }
                } else {
                    if (playthrough) {
                        for (i = 0; i < clips.length; i++) {
                            clips[i].addEventListener('loop', loopFunc);
                        }
                    } else {
                        for (i = 0; i < this.activeAudioClips.length; i++) {
                            clips[i].stop();
                        }
                        clips.length = 0;
                    }
                }
            },
            
            stopAudioInstance: function (instance) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                for (i = clips.length - 1; i >= 0; i--) {
                    if (clips[i] === instance) {
                        clips[i].stop();
                        clips.splice(i, 1);
                    }
                }
            },
            
            onComplete: function (audioClip) {
                //clean up active clips
                this.removeClip(audioClip);
                
                /**
                 * When a sound effect is finished playing, this event is triggered.
                 * 
                 * @event clip-complete
                 */
                this.owner.triggerEvent('clip-complete');
            },
            
            removeClip: function (audioClip) {
                var i = 0;

                for (i = 0; i < this.activeAudioClips.length; i++) {
                    if (this.activeAudioClips[i] === audioClip) {
                        this.activeAudioClips.splice(i, 1);
                        break;
                    }
                }
            },
            
            destroy: function () {
                this.stopAudio();
            }
        }
    });
}());

//##############################################################################
// AudioVO.js
//##############################################################################

/**
 * This component plays audio using the SpringRoll VOPlayer instance. Audio is played by triggering specific messages defined in the audio component definition.
 * 
 * @namespace platypus.components
 * @class AudioVO
 * @uses Component
 * @since tbd
 */
/*global include, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var Application = include('springroll.Application'), // Import SpringRoll classes
        sortByTime = function (a, b) {
            return a.time - b.time;
        },
        offsetEvents = function (fromList, toList, player) {
            return function () {
                var i = 0,
                    offset = player.getElapsed();
                
                for (i = 0; i < fromList.length; i++) {
                    toList.push({
                        event: fromList[i].event,
                        time: (fromList[i].time || 0) + offset,
                        message: fromList[i].message || null
                    });
                }
                
                if (i) {
                    toList.sort(sortByTime);
                }
            };
        },
        addEvents = function (fromList, toList) {
            var i = 0;
            
            for (i = 0; i < fromList.length; i++) {
                toList.push({
                    event: fromList[i].event,
                    time: fromList[i].time || 0,
                    message: fromList[i].message
                });
            }
            
            if (i) {
                toList.sort(sortByTime);
            }
            
            return toList;
        },
        playSound = function (soundDefinition) {
            var sound      = null,
                eventList  = [],
                isArray = false;
                
            if (typeof soundDefinition === 'string') {
                sound = soundDefinition;
            } else if (Array.isArray(soundDefinition)) {
                sound = soundDefinition;
                isArray = true;
            } else {
                sound = soundDefinition.sound;
                if (soundDefinition.events) {
                    eventList = soundDefinition.events.slice();
                    eventList.sort(sortByTime);
                }
                if (Array.isArray(sound)) {
                    sound = sound;
                    isArray = true;
                } else {
                    sound = soundDefinition.sound;
                }
            }
            
            return function (value) {
                var self        = this,
                    soundList   = null;
                    
                this.eventList = eventList.slice();
                if (value && value.events) {
                    addEvents(value.events, this.eventList);
                }

                if (isArray) {
                    soundList = this.setupEventList(sound);
                } else {
                    soundList = sound;
                }

                this.player.play(soundList, function () {
                    self.onComplete(true);
                }, function () {
                    self.onComplete(false);
                });
            };
        };
    
    return platypus.createComponentClass({
        id: 'AudioVO',
        
        properties: {
            /**
             * Use the audioMap property object to map messages triggered with audio clips to play. At least one audio mapping should be included for audio to play. Here is an example audioMap object:
             * 
             *       {
             *           "message-triggered": "audio-id",
             *           // This simple form is useful to listen for "message-triggered" and play "audio-id" using default audio properties.
             * 
             *           "another-message": {
             *           // To specify audio properties, instead of mapping the message to an audio id string, map it to an object with one or more of the properties shown below. Many of these properties directly correspond to SoundJS play parameters.
             * 
             *               "sound": "another-audio-id",
             *               // Required. This is the audio clip to play when "another-message" is triggered.
             * 
             *               "events": [{
             *                   "event": "walk-to-the-left",
             *                   "time": 1500
             *               }]
             *               // Optional. Used to specify a list of events to play once the VO begins.
             *           }
             *       }
             * 
             * @property audioMap
             * @type Object
             * @default null
             */
            audioMap: null
        },
            
        constructor: function (definition) {
            var key = '';
            
            this.eventList = [];
    
            this.player = Application.instance.voPlayer;
    
            if (definition.audioMap) {
                for (key in definition.audioMap) {
                    if (definition.audioMap.hasOwnProperty(key)) {

                        /**
                         * Listens for messages specified by the `audioMap` and on receiving them, begins playing corresponding audio clips.
                         * 
                         * @method '*'
                         * @param [message.events] {Array} Used to specify the list of events to trigger while playing this audio sequence.
                         */
                        this.addEventListener(key, playSound(definition.audioMap[key]));
                    }
                }
            }
            
            this.paused = false;
        },

        events: {
            /**
             * On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
             * 
             * @method 'handle-render'
             */
            "handle-render": function () {
                if (this.paused) {
                    return;
                }
                
                this.checkTimeEvents(false);
            },

            /**
             * On receiving this message, audio will stop playing.
             * 
             * @method 'stop-audio'
             */
            "stop-audio": function () {
                this.player.stop();
            }
        },
        
        methods: {
            checkTimeEvents: function (finished) {
                var events      = this.eventList,
                    currentTime = 0;
                
                if (events && events.length) {
                    currentTime = this.player.getElapsed();

                    while (events.length && (finished || (events[0].time <= currentTime))) {
                        this.owner.trigger(events[0].event, events[0].message);
                        events.splice(0, 1);
                    }
                }
            },
            
            /**
            * This function merges events from individual sounds into a full list queued to sync with the SpringRoll voPlayer.
            */
            setupEventList: function (sounds) {
                var i = 0,
                    soundList = [];
                
                // Create alias-only sound list.
                for (i = 0; i < sounds.length; i++) {
                    if (sounds[i].sound) {
                        if (sounds[i].events) {
                            soundList.push(offsetEvents(sounds[i].events, this.eventList, this.player));
                        }
                        soundList.push(sounds[i].sound);
                    } else {
                        soundList.push(sounds[i]);
                    }
                }
                return soundList;
            },

        
            onComplete: function (successful) {
                this.checkTimeEvents(true);
                
                /**
                 * When an audio sequence is finished playing, this event is triggered.
                 * 
                 * @event sequence-complete
                 */
                this.owner.triggerEvent('sequence-complete');
            },
            
            destroy: function () {
                this.player.stop();
            }
        }
    });
}());

//##############################################################################
// Camera.js
//##############################################################################

/**
 * This component controls the game camera deciding where and how it should move. The camera also broadcasts messages when the window resizes or its orientation changes.
 * 
 * If either worldWidth and worldHeight is set to 0 it is assumed the world is infinite in that dimension.
 * 
 * @namespace platypus.components
 * @class Camera
 * @uses Component
*/
/*global createjs, PIXI, platypus, springroll */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    return platypus.createComponentClass({
        id: 'Camera',
        properties: {
            /**
             * Number specifying width of viewport in world coordinates.
             * 
             * @property width
             * @type number
             * @default 0
             **/
            "width": 0,
             
            /**
             * Number specifying height of viewport in world coordinates.
             * 
             * @property height
             * @type number
             * @default 0
             **/
            "height": 0,
            
            /**
             * Whether camera overflows to cover the whole canvas or remains contained within its aspect ratio's boundary.
             * 
             * @property overflow
             * @type boolean
             * @default false
             */
            "overflow": false,
            
            /**
             * Boolean value that determines whether the camera should stretch the world viewport when window is resized. Defaults to false which maintains the proper aspect ratio.
             * 
             * @property stretch
             * @type boolean
             * @default: false
             */
            "stretch": false,
            
            /**
             * Sets how quickly the camera should pan to a new position in the horizontal direction.
             * 
             * @property transitionX
             * @type number
             * @default 400
             **/
            "transitionX": 400,
            
            /**
             * Sets how quickly the camera should pan to a new position in the vertical direction.
             * 
             * @property transitionY
             * @type number
             * @default 600
             **/
            "transitionY": 600,
             
            /**
             * Sets how quickly the camera should rotate to a new orientation.
             * 
             * @property transitionAngle
             * @type number
             * @default: 600
             **/
            "transitionAngle": 600,
            
            /**
             * Sets how many units the followed entity can move before the camera will re-center. This should be lowered for small-value coordinate systems such as Box2D.
             * 
             * @property threshold
             * @type number
             * @default 1
             **/
            "threshold": 1,
            
            /**
             * Whether, when following an entity, the camera should rotate to match the entity's orientation.
             * 
             * @property rotate
             * @type boolean
             * @default false
             **/
            "rotate": false,

            /**
             * Number specifying the horizontal center of viewport in world coordinates.
             * 
             * @property x
             * @type number
             * @default 0
             **/
            "x": 0,
             
            /**
             * Number specifying the vertical center of viewport in world coordinates.
             * 
             * @property y
             * @type number
             * @default 0
             **/
            "y": 0
        },
        publicProperties: {
            /**
             * The entity's canvas element is used to determine the window size of the camera.
             * 
             * @property canvas
             * @type DOMElement Canvas
             * @default null
             */
            "canvas": null,
            
            /**
             * Number specifying width of the world in units. This property is available on the Entity.
             * 
             * @property worldWidth
             * @type number
             * @default 0
             **/
            "worldWidth": 0,
            
            /**
             * Number specifying height of the world in units. This property is available on the Entity.
             * 
             * @property worldHeight
             * @type number
             * @default 0
             **/
            "worldHeight": 0
        },
        constructor: function (definition) {
            //The dimensions of the camera in the window
            this.viewport = new platypus.AABB(0, 0, 0, 0);
            
            //The dimensions of the camera in the game world
            this.worldCamera = {
                viewport: new platypus.AABB(this.x, this.y, this.width, this.height),
                orientation: definition.orientation || 0
            };
            
            //Message object defined here so it's reusable
            this.message = {
                viewport: new platypus.AABB(),
                scaleX: 0,
                scaleY: 0,
                orientation: 0
            };
    
            //Whether the map has finished loading.
            this.worldIsLoaded = false;
            
            this.following = undefined;
            this.state = 'static';//'roaming';
            
            //FOLLOW MODE VARIABLES
            
            //--Bounding
            this.boundingBox = new platypus.AABB(this.worldCamera.viewport.x, this.worldCamera.viewport.y, this.worldCamera.viewport.width / 2, this.worldCamera.viewport.height / 2);
            
            //Forward Follow
            this.lastX = this.worldCamera.viewport.x;
            this.lastY = this.worldCamera.viewport.y;
            this.lastOrientation = this.worldCamera.orientation;
            this.forwardX = 0;
            this.forwardY = 0;
            this.forwardAngle = 0;
            this.averageOffsetX = 0;
            this.averageOffsetY = 0;
            this.averageOffsetAngle = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetAngle = 0;
            this.forwardFollower = {
                x: this.lastX,
                y: this.lastY,
                orientation: this.lastOrientation
            };
            
            this.lastFollow = {
                entity: null,
                mode: null,
                offsetX: 0,
                offsetY: 0,
                begin: 0
            };
            
            this.xMagnitude = 0;
            this.yMagnitude = 0;
            this.xWaveLength = 0;
            this.yWaveLength = 0;
            this.xShakeTime = 0;
            this.yShakeTime = 0;
            this.shakeTime = 0;
            this.shakeIncrementor = 0;
            
            this.direction = true;
            this.stationary = false;
            
            this.viewportUpdate = false;
            
            if (this.owner.container) {
                this.parentContainer = this.owner.container;
            } else if (this.owner.stage) {
                this.canvas = this.canvas || springroll.Application.instance.display.canvas; //TODO: Probably need to find a better way to handle resizing - DDD 10/4/2015
                this.parentContainer = this.owner.stage;
                this.owner.width  = this.canvas.width;
                this.owner.height = this.canvas.height;
            } else {
                console.warn('Camera: There appears to be no Container on this entity for the camera to display.');
            }
            this.container = new PIXI.Container();
            this.matrix = this.container.transformMatrix = new PIXI.Matrix();
            this.parentContainer.addChild(this.container);
        },
        events: {
            /**
             * Sets up the camera window size on load.
             * 
             * @method 'load'
             */
            "load": function () {
                this.resize();
            },
            
            /**
             * On receiving this message, the camera begins viewing the world.
             * 
             * @method 'render-world'
             * @param data {Object} Information about the world.
             * @param data.world {PIXI.Container} The container containing world entities.
             */
            "render-world": function (data) {
                this.world = data.world;
                this.world.transformMatrix = this.world.transformMatrix || new PIXI.Matrix();
                this.container.addChild(this.world);
            },
            
            /**
             * If children entities are listening for a `camera-update` message, they are added to an internal list.
             * 
             * @method 'child-entity-added'
             * @param entity {Entity} Expects an entity as the message object to determine whether to trigger `camera-update` on it.
              **/
            "child-entity-added": function (entity) {
                this.viewportUpdate = true;
                
                if (this.worldIsLoaded) {
                    /**
                     * On receiving a "world-loaded" message, the camera broadcasts the world size to all children in the world.
                     * 
                     * @event 'camera-loaded'
                     * @param message
                     * @param message.worldWidth {number} The width of the loaded world.
                     * @param message.worldHeight {number} The height of the loaded world.
                     **/
                    entity.triggerEvent('camera-loaded', {
                        worldWidth: this.worldWidth,
                        worldHeight: this.worldHeight,
                        viewport: this.message.viewport
                    });
                }
            },

            /**
             * On receiving this message, the camera updates its world location and size as necessary. An example of this message is triggered by the [[Tiled-Loader]] component.
             * 
             * @method 'world-loaded'
             * @param message {Object}
             * @param [message.width] {number} The width of the loaded world.
             * @param [message.height] {number} The height of the loaded world.
             * @param [message.camera] {Entity} An entity that the camera should follow in the loaded world.
             **/
            "world-loaded": function (values) {
                var msg = this.message;
                
                this.worldIsLoaded = true;
                this.worldWidth    = values.width;
                this.worldHeight   = values.height;
                if (values.camera) {
                    this.follow(values.camera);
                }
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('camera-loaded', {
                        viewport: msg.viewport.set(this.worldCamera.viewport),
                        worldWidth: this.worldWidth,
                        worldHeight: this.worldHeight
                    });
                }
            },
            
            /**
             * On a "tick" step event, the camera updates its location according to its current state.
             * 
             * @method 'tick'
             * @param message {Object}
             * @param message.delta {Number} If necessary, the current camera update function may require the length of the tick to adjust movement rate.
             **/
            "tick": function (resp) {
                var msg       = this.message,
                    viewport  = msg.viewport,
                    transform = null;
                
                if ((this.state === 'following') && this.followingFunction(this.following, resp.delta)) {
                    this.viewportUpdate = true;
                }
                
                // Need to update owner's size information for changes to canvas size
                if (this.canvas) {
                    this.owner.width  = this.canvas.width;
                    this.owner.height = this.canvas.height;
                }
                
                // Check for owner resizing
                if ((this.owner.width !== this.lastWidth) || (this.owner.height !== this.lastHeight)) {
                    this.resize();
                    this.lastWidth = this.owner.width;
                    this.lastHeight = this.owner.height;
                }
                
                if (this.viewportUpdate) {
                    this.viewportUpdate = false;
                    this.stationary = false;
                    
                    viewport.set(this.worldCamera.viewport);

                    if (this.shakeIncrementor < this.shakeTime) {
                        this.viewportUpdate = true;
                        this.shakeIncrementor += resp.delta;
                        this.shakeIncrementor = Math.min(this.shakeIncrementor, this.shakeTime);
                        
                        if (this.shakeIncrementor < this.xShakeTime) {
                            viewport.moveX(viewport.x + Math.sin((this.shakeIncrementor / this.xWaveLength) * (Math.PI * 2)) * this.xMagnitude);
                        }
                        
                        if (this.shakeIncrementor < this.yShakeTime) {
                            viewport.moveY(viewport.y + Math.sin((this.shakeIncrementor / this.yWaveLength) * (Math.PI * 2)) * this.yMagnitude);
                        }
                    }

                    // Set up the rest of the camera message:
                    msg.scaleX         = this.windowPerWorldUnitWidth;
                    msg.scaleY         = this.windowPerWorldUnitHeight;
                    msg.orientation    = this.worldCamera.orientation;
                    
                    // Transform the world to appear within camera
                    //this.world.setTransform(viewport.halfWidth * msg.scaleX, viewport.halfHeight * msg.scaleY, msg.scaleX, msg.scaleY, (msg.orientation || 0) * 180 / Math.PI, 0, 0, viewport.x, viewport.y);
                    transform = this.world.transformMatrix;
                    transform.a = msg.scaleX;
                    transform.b = 0;
                    transform.c = 0;
                    transform.d = msg.scaleY;
                    if (msg.orientation) {
                        transform.rotate(msg.orientation);
                    }
                    transform.tx = (viewport.halfWidth - viewport.x) * msg.scaleX;
                    transform.ty = (viewport.halfHeight - viewport.y) * msg.scaleY;
                    
                    /**
                     * This component fires "camera-update" when the position of the camera in the world has changed. This event is triggered on both the entity (typically a layer) as well as children of the entity.
                     * 
                     * @event 'camera-update'
                     * @param message {Object}
                     * @param message.orientation {number} Number describing the orientation of the camera.
                     * @param message.scaleX {number} Number of window pixels that comprise a single world coordinate on the x-axis.
                     * @param message.scaleY {number} Number of window pixels that comprise a single world coordinate on the y-axis.
                     * @param message.viewport {platypus.AABB} An AABB describing the world viewport area.
                     **/
                    this.owner.trigger('camera-update', msg);

                    if (this.owner.triggerEventOnChildren) {
                        this.owner.triggerEventOnChildren('camera-update', msg);
                    }
                    
                } else if (!this.stationary) {
                    
                    /**
                    * This component triggers "camera-stationary" on the entity when the camera stops moving.
                    *
                    * @event 'camera-stationary'
                    **/
                    this.owner.trigger('camera-stationary', msg);
                    this.stationary = true;
                    
                }
                
                if (this.lastFollow.begin) {
                    if (this.lastFollow.begin < new Date().getTime()) {
                        this.follow(this.lastFollow);
                    }
                }
            },
            
            /**
            * The camera listens for this event to change its world viewport size.
            *
            * @method 'resize-camera'
            * @param dimensions {Object} List of key/value pairs describing new viewport size
            * @param dimensions.width {number} Width of the camera viewport
            * @param dimensions.height {number} Height of the camera viewport
            **/
            "resize-camera": function (dimensions) {
                this.worldCamera.viewport.resize(dimensions.width, dimensions.height);
                this.resize();
            },
            
            /**
             * The camera listens for this event to change its position in the world.
             *
             * @method 'relocate'
             * @param location {Vector|Object} List of key/value pairs describing new location
             * @param location.x {Number} New position along the x-axis.
             * @param location.y {Number} New position along the y-axis.
             * @param [location.time] {Number} The time to transition to the new location.
             * @param [location.ease] {Function} The ease function to use. Defaults to a linear transition.
             */
            "relocate": function (location) {
                var self = this,
                    move = function () {
                        if (self.move(v.x, v.y)) {
                            self.viewportUpdate = true;
                        }
                    },
                    v = null;

                if (location.time && window.createjs && createjs.Tween) {
                    v = new platypus.Vector(this.worldCamera.viewport.x, this.worldCamera.viewport.y);
                    createjs.Tween.get(v).to({x: location.x, y: location.y}, location.time, location.ease).on('change', move);
                } else {
                    if (this.move(location.x, location.y)) {
                        this.viewportUpdate = true;
                    }
                }
            },
            
            /**
            * On receiving this message, the camera begins following the requested object.
            *
            * @method 'follow'
            * @param message {Object}
            * @param message.mode {String} Can be "locked", "forward", "bounding", or "static". "static" suspends following, but the other three settings require that the entity parameter be defined. Also set the bounding area parameters if sending "bounding" as the following method and the movement parameters if sending "forward" as the following method.
            * @param [message.entity] {Entity} The entity that the camera should commence following.
            * @param [message.top] {number} The top of a bounding box following an entity.
            * @param [message.left] {number} The left of a bounding box following an entity.
            * @param [message.width] {number} The width of a bounding box following an entity.
            * @param [message.height] {number} The height of a bounding box following an entity.
            * @param [message.movementX] {number} Movement multiplier for focusing the camera ahead of a moving entity in the horizontal direction.
            * @param [message.movementY] {number} Movement multiplier for focusing the camera ahead of a moving entity in the vertical direction.
            * @param [message.offsetX] {number} How far to offset the camera from the entity horizontally.
            * @param [message.offsetY] {number} How far to offset the camera from the entity vertically.
            * @param [message.time] {number} How many milliseconds to follow the entity.
            **/
            "follow": function (def) {
                this.follow(def);
            },
            
            /**
            * On receiving this message, the camera will shake around its target location.
            *
            * @method 'shake'
            * @param shake {Object}
            * @param [shake.xMagnitude] {number} How much to move along the x axis.
            * @param [shake.yMagnitude] {number} How much to move along the y axis.
            * @param [shake.xFrequency] {number} How quickly to shake along the x axis.
            * @param [shake.yFrequency] {number} How quickly to shake along the y axis.
            * @param [shake.time] {number} How long the camera should shake.
            **/
            "shake": function (shakeDef) {
                var def = shakeDef || {},
                    xMag    = def.xMagnitude || 0,
                    yMag    = def.yMagnitude || 0,
                    xFreq   = def.xFrequency || 0, //Cycles per second
                    yFreq   = def.yFrequency || 0, //Cycles per second
                    time    = def.time || 0;
                
                this.viewportUpdate = true;
                
                this.shakeIncrementor = 0;
                
                this.xMagnitude = xMag;
                this.yMagnitude = yMag;
                
                if (xFreq === 0) {
                    this.xWaveLength = 1;
                    this.xShakeTime = 0;
                } else {
                    this.xWaveLength = (1000 / xFreq);
                    this.xShakeTime = Math.ceil(time / this.xWaveLength) * this.xWaveLength;
                }
                
                if (yFreq === 0) {
                    this.yWaveLength = 1;
                    this.yShakeTime = 0;
                } else {
                    this.yWaveLength = (1000 / yFreq);
                    this.yShakeTime = Math.ceil(time / this.yWaveLength) * this.yWaveLength;
                }
                
                this.shakeTime = Math.max(this.xShakeTime, this.yShakeTime);
            }
        },
        
        methods: {
            follow: function (def) {
                if (def.time) { //save current follow
                    if (!this.lastFollow.begin) {
                        this.lastFollow.entity = this.following;
                        this.lastFollow.mode   = this.mode;
                        this.lastFollow.offsetX = this.offsetX;
                        this.lastFollow.offsetY = this.offsetY;
                    }
                    this.lastFollow.begin  = new Date().getTime() + def.time;
                } else {
                    if (this.lastFollow.begin) {
                        this.lastFollow.begin = 0;
                    }
                }
                
                this.mode = def.mode;
                
                switch (def.mode) {
                case 'locked':
                    this.state = 'following';
                    this.following = def.entity;
                    this.followingFunction = this.lockedFollow;
                    this.offsetX = def.offsetX || 0;
                    this.offsetY = def.offsetY || 0;
                    this.offsetAngle = def.offsetAngle || 0;
                    break;
                case 'forward':
                    this.state = 'following';
                    this.followFocused   = false;
                    this.following       = def.entity;
                    this.lastX           = def.entity.x || 0;
                    this.lastY           = def.entity.y || 0;
                    this.lastOrientation = def.entity.orientation || 0;
                    this.forwardX  = def.movementX || (this.transitionX / 10);
                    this.forwardY  = def.movementY || (this.transitionY / 10);
                    this.averageOffsetX = 0;
                    this.averageOffsetY = 0;
                    this.averageOffsetAngle = 0;
                    this.offsetX = def.offsetX || 0;
                    this.offsetY = def.offsetY || 0;
                    this.offsetAngle = def.offsetAngle || 0;
                    this.followingFunction = this.forwardFollow;
                    break;
                case 'bounding':
                    this.state = 'following';
                    this.following = def.entity;
                    this.offsetX = def.offsetX || 0;
                    this.offsetY = def.offsetY || 0;
                    this.offsetAngle = def.offsetAngle || 0;
                    this.boundingBox.setAll(def.x, def.y, def.width, def.height);
                    this.followingFunction = this.boundingFollow;
                    break;
                default:
                    this.state = 'static';
                    this.following = undefined;
                    this.followingFunction = undefined;
                    if (def && (typeof def.x === 'number') && (typeof def.y === 'number')) {
                        this.move(def.x, def.y, def.orientation || 0);
                        this.viewportUpdate = true;
                    }
                    break;
                }
                
                if (def.begin) { // get rid of last follow
                    def.begin = 0;
                }

            },
            
            move: function (x, y, newOrientation) {
                var moved = this.moveX(x);
                moved = this.moveY(y) || moved;
                if (this.rotate) {
                    moved = this.reorient(newOrientation || 0) || moved;
                }
                return moved;
            },
            
            moveX: function (x) {
                var aabb = this.worldCamera.viewport;
                
                if (Math.abs(aabb.x - x) > this.threshold) {
                    if (this.worldWidth && this.worldWidth !== 0 && this.worldWidth < aabb.width) {
                        aabb.moveX(this.worldWidth / 2);
                    } else if (this.worldWidth && this.worldWidth !== 0 && (x + aabb.halfWidth > this.worldWidth)) {
                        aabb.moveX(this.worldWidth - aabb.halfWidth);
                    } else if (this.worldWidth && this.worldWidth !== 0 && (x < aabb.halfWidth)) {
                        aabb.moveX(aabb.halfWidth);
                    } else {
                        aabb.moveX(x);
                    }
                    return true;
                }
                return false;
            },
            
            moveY: function (y) {
                var aabb = this.worldCamera.viewport;
                
                if (Math.abs(aabb.y - y) > this.threshold) {
                    if (this.worldHeight && this.worldHeight !== 0 && this.worldHeight < aabb.height) {
                        aabb.moveY(this.worldHeight / 2);
                    } else if (this.worldHeight && this.worldHeight !== 0 && (y + aabb.halfHeight > this.worldHeight)) {
                        aabb.moveY(this.worldHeight - aabb.halfHeight);
                    } else if (this.worldHeight && this.worldHeight !== 0 && (y < aabb.halfHeight)) {
                        aabb.moveY(aabb.halfHeight);
                    } else {
                        aabb.moveY(y);
                    }
                    return true;
                }
                return false;
            },
            
            reorient: function (newOrientation) {
                if (Math.abs(this.worldCamera.orientation - newOrientation) > 0.0001) {
                    this.worldCamera.orientation = newOrientation;
                    return true;
                }
                return false;
            },
            
            lockedFollow: (function () {
                var min = Math.min,
                    getTransitionalPoint = function (a, b, ratio) {
                        // Find point between two points according to ratio.
                        return ratio * b + (1 - ratio) * a;
                    },
                    getRatio = function (transition, time) {
                        // Look at the target transition time (in milliseconds) and set up ratio accordingly.
                        if (transition) {
                            return min(time / transition, 1);
                        } else {
                            return 1;
                        }
                    };
                
                return function (entity, time, slowdown) {
                    var x = getTransitionalPoint(this.worldCamera.viewport.x, entity.x, getRatio(this.transitionX, time)),
                        y = getTransitionalPoint(this.worldCamera.viewport.y, entity.y, getRatio(this.transitionY, time));

                    if (this.rotate) { // Only run the orientation calculations if we need them.
                        return this.move(x, y, getTransitionalPoint(this.worldCamera.orientation, -(entity.orientation || 0), getRatio(this.transitionAngle, time)));
                    } else {
                        return this.move(x, y, 0);
                    }
                };
            }()),
            
            forwardFollow: function (entity, time) {
                var ff = this.forwardFollower,
                    standardizeTimeDistance = 15 / time, //This allows the camera to pan appropriately on slower devices or longer ticks
                    moved  = false,
                    x = entity.x + this.offsetX,
                    y = entity.y + this.offsetY,
                    a = (entity.orientation || 0) + this.offsetAngle;
                
                if (this.followFocused && (this.lastX === x) && (this.lastY === y)) {
                    return this.lockedFollow(ff, time);
                } else {
                    // span over last 10 ticks to prevent jerkiness
                    this.averageOffsetX *= 0.9;
                    this.averageOffsetY *= 0.9;
                    this.averageOffsetX += 0.1 * (x - this.lastX) * standardizeTimeDistance;
                    this.averageOffsetY += 0.1 * (y - this.lastY) * standardizeTimeDistance;

                    if (Math.abs(this.averageOffsetX) > (this.worldCamera.viewport.width / (this.forwardX * 2))) {
                        this.averageOffsetX = 0;
                    }
                    if (Math.abs(this.averageOffsetY) > (this.worldCamera.viewport.height / (this.forwardY * 2))) {
                        this.averageOffsetY = 0;
                    }
                    
                    if (this.rotate) {
                        this.averageOffsetAngle *= 0.9;
                        this.averageOffsetAngle += 0.1 * (a - this.lastOrientation) * standardizeTimeDistance;
                        if (Math.abs(this.averageOffsetAngle) > (this.worldCamera.orientation / (this.forwardAngle * 2))) {
                            this.averageOffsetAngle = 0;
                        }
                    }

                    ff.x = this.averageOffsetX * this.forwardX + x;
                    ff.y = this.averageOffsetY * this.forwardY + y;
                    ff.orientation = this.averageOffsetAngle * this.forwardAngle + a;
                    
                    this.lastX = x;
                    this.lastY = y;
                    this.lastOrientation = a;
                    
                    moved = this.lockedFollow(ff, time);

                    if (!this.followFocused && !moved) {
                        this.followFocused = true;
                    }
                    
                    return moved;
                }
                
                
            },
            
            boundingFollow: function (entity, time) {
                var x = 0,
                    y = 0,
                    ratioX  = (this.transitionX ? Math.min(time / this.transitionX, 1) : 1),
                    iratioX = 1 - ratioX,
                    ratioY  = (this.transitionY ? Math.min(time / this.transitionY, 1) : 1),
                    iratioY = 1 - ratioY;
                
                this.boundingBox.move(this.worldCamera.viewport.x, this.worldCamera.viewport.y);
                
                if (entity.x > this.boundingBox.right) {
                    x = entity.x - this.boundingBox.halfWidth;
                } else if (entity.x < this.boundingBox.left) {
                    x = entity.x + this.boundingBox.halfWidth;
                }
                
                if (entity.y > this.boundingBox.bottom) {
                    y = entity.y - this.boundingBox.halfHeight;
                } else if (entity.y < this.boundingBox.top) {
                    y = entity.y + this.boundingBox.halfHeight;
                }
                
                if (x !== 0) {
                    x = this.moveX(ratioX * x + iratioX * this.worldCamera.viewport.x);
                }
                
                if (y !== 0) {
                    y = this.moveY(ratioY * y + iratioY * this.worldCamera.viewport.y);
                }
                
                return x || y;
            },
            
            resize: function () {
                var worldAspectRatio = this.width / this.height,
                    windowAspectRatio = this.owner.width / this.owner.height;
                
                //The dimensions of the camera in the window
                this.viewport.setAll(this.owner.width / 2, this.owner.height / 2, this.owner.width, this.owner.height);
                
                if (!this.stretch) {
                    if (windowAspectRatio > worldAspectRatio) {
                        if (this.overflow) {
                            this.worldCamera.viewport.resize(this.height * windowAspectRatio, this.height);
                        } else {
                            this.viewport.resize(this.viewport.height * worldAspectRatio, this.viewport.height);
                        }
                    } else {
                        if (this.overflow) {
                            this.worldCamera.viewport.resize(this.width, this.width / windowAspectRatio);
                        } else {
                            this.viewport.resize(this.viewport.width, this.viewport.width / worldAspectRatio);
                        }
                    }
                }
                
                this.worldPerWindowUnitWidth  = this.worldCamera.viewport.width  / this.viewport.width;
                this.worldPerWindowUnitHeight = this.worldCamera.viewport.height / this.viewport.height;
                this.windowPerWorldUnitWidth  = this.viewport.width  / this.worldCamera.viewport.width;
                this.windowPerWorldUnitHeight = this.viewport.height / this.worldCamera.viewport.height;
                
                //this.container.cache(0, 0, this.viewport.width, this.viewport.height, 1);
                this.matrix.tx = this.viewport.x - this.viewport.halfWidth;
                this.matrix.ty = this.viewport.y - this.viewport.halfHeight;
                
                this.viewportUpdate = true;
            },
            
            windowToWorld: function (sCoords) {
                var wCoords = [];
                wCoords[0] = Math.round((sCoords[0] - this.viewport.x) * this.worldPerWindowUnitWidth);
                wCoords[1] = Math.round((sCoords[1] - this.viewport.y) * this.worldPerWindowUnitHeight);
                return wCoords;
            },
            
            worldToWindow: function (wCoords) {
                var sCoords = [];
                sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.viewport.x);
                sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.viewport.y);
                return sCoords;
            },
            
            destroy: function () {
                this.parentContainer.removeChild(this.container);
                this.parentContainer = null;
                this.container = null;
            }
        }
    });
}());

//##############################################################################
// CameraFollowMe.js
//##############################################################################

/**
 * This component can request that the camera focus on this entity.
 * 
 * @namespace platypus.components
 * @class CameraFollowMe
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'CameraFollowMe',
        
        properties: {
            /**
             * Sets initial camera settings when the entity is being followed. This can be over-written by the "follow-me" call itself. If any of these attributes are not provided, the following are used by default:
             * 
                  {
                      "time": 500,
                      // Optional. Time in milliseconds that the camera should focus before returning to the original focus.
                      
                      "mode": "forward",
                      // Optional. Camera mode that the camera should use.
                      
                      "top": 100,
                      // Optional number specifying top of viewport in world coordinates
                      
                      "left": 100,
                      // Optional number specifying left of viewport in world coordinates
                      
                      "width": 100,
                      // Optional number specifying width of viewport in world coordinates
                      
                      "height": 100,
                      // Optional number specifying height of viewport in world coordinates
                      
                      "offsetX": 20,
                      // Optional number setting how far to offset the camera from the entity horizontally.
                      
                      "offsetY": 40
                      // Optional number setting how far to offset the camera from the entity vertically.
                  }
             * 
             * @property camera
             * @type Object
             * @default {}
             */
            camera: {},
            
            /**
             * Camera mode that the camera should use.
             * 
             * @property mode
             * @type String
             * @default "forward"
             */
            mode: "forward",

            /**
             * Whether to pause the game while the camera is focused.
             * 
             * @property accelerate
             * @type boolean
             * @default false
             */
            pause: false
        },
        
        constructor: function (definition) {
            this.pauseGame = definition.pause ? {
                time: definition.time
            } : null;
            
            this.camera = {
                entity: this.owner,
                mode: this.camera.mode || this.mode,
                top: this.camera.top,
                left: this.camera.left,
                offsetX: this.camera.offsetX,
                offsetY: this.camera.offsetY,
                width: this.camera.width,
                height: this.camera.height,
                time: this.camera.time
            };
        },
        
        events: {
            /**
             * On receiving this message, the component will trigger a message requesting that the parent camera begin following this entity.
             * 
             * @method 'follow-me'
             * @param [options] {Object} A list of key/value paris describing camera options to set.
             * @param [options.mode] {String} Camera following mode.
             * @param [options.top] {number} The top of a bounding box.
             * @param [options.left] {number} The left of a bounding box.
             * @param [options.width] {number} The width of a bounding box.
             * @param [options.height] {number} The height of a bounding box.
             * @param [options.offsetX] {number} How far to offset the camera from the entity horizontally.
             * @param [options.offsetY] {number} How far to offset the camera from the entity vertically.
             * @param [options.time] {number} How many milliseconds to follow the entity.
             */
            "follow-me": function (options) {
                var msg = this.camera;
                
                if (options) {
                    msg = {
                        entity:  this.owner,
                        mode:    options.mode    || this.camera.mode,
                        top:     options.top     || this.camera.top,
                        left:    options.left    || this.camera.left,
                        offsetX: options.offsetX || this.camera.offsetX,
                        offsetY: options.offsetY || this.camera.offsetY,
                        width:   options.width   || this.camera.width,
                        height:  options.height  || this.camera.height,
                        time:    options.time    || this.camera.time
                    };
                }

                if (this.pauseGame) {

                    /**
                     * This component fires this message on the parent entity to pause logic if required.
                     * 
                     * @event 'pause-logic'
                     * @param options {Object}
                     * @param options.time {number} The amount of time to pause before re-enabling logic.
                     */
                    this.owner.parent.trigger('pause-logic',  this.pauseGame);
                    
                    /**
                     * This component fires this message on the parent entity to pause rendering if required.
                     * 
                     * @event 'pause-render'
                     * @param options {Object}
                     * @param options.time {number} The amount of time to pause before re-enabling render updates.
                     */
                    this.owner.parent.trigger('pause-render', this.pauseGame);
                }
                
                /**
                 * This component fires this message on this entity's parent so the camera will begin following this entity.
                 * 
                 * @event 'follow'
                 * @param options {Object} A list of key/value paris describing camera options to set.
                 * @param options.entity {[[Entity]]} Sends this entity for the camera to follow.
                 * @param options.mode {String} Camera following mode.
                 * @param options.top {number} The top of a bounding box.
                 * @param options.left {number} The left of a bounding box.
                 * @param options.width {number} The width of a bounding box.
                 * @param options.height {number} The height of a bounding box.
                 * @param options.offsetX {number} How far to offset the camera from the entity horizontally.
                 * @param options.offsetY {number} How far to offset the camera from the entity vertically.
                 * @param options.time {number} How many milliseconds to follow the entity.
                 */
                this.owner.parent.trigger('follow', msg);
            }
        }
    });
}());

//##############################################################################
// CollisionBasic.js
//##############################################################################

/**
 * This component causes this entity to collide with other entities. It must be part of a collision group and will receive messages when colliding with other entities in the collision group.
 * 
 * Multiple collision components may be added to a single entity if distinct messages should be triggered for certain collision areas on the entity or if the soft collision area is a different shape from the solid collision area. Be aware that too many additional collision areas may adversely affect performance. 
 * 
 * @namespace platypus.components
 * @class CollisionBasic
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var handleStuck = function (position, data, owner) {
            var m = 0,
                s = data.stuck;

            if (s) {
                m = position.magnitude();
                if (data.thatShape.owner && (Math.abs(s) > 1)) {
                    s *= 0.05;
                }
                if (!m || (m > Math.abs(s))) {
                    if (data.vector.x) {
                        position.x = s;
                        position.y = 0;
                    }
                    if (data.vector.y) {
                        position.x = 0;
                        position.y = s;
                    }
                    owner.stuckWith = new platypus.Vector(data.thatShape.x, data.thatShape.y);
                }
            }
        },

        /**
         * On receiving a 'hit-by' message, custom messages are triggered on the entity corresponding with the component's `solidCollisions` and `softCollisions` key/value mappings.
         * 
         * @event *
         * @param collision {Object} A list of key/value pairs describing the collision.
         */
        entityBroadcast = function (event, solidOrSoft, collisionType) {
            if (typeof event === 'string') {
                return function (value) {
                    if (value.myType === collisionType) {
                        if (value.hitType === solidOrSoft) {
                            this.owner.triggerEvent(event, value);
                        }
                    }
                };
            } else if (Array.isArray(event)) {
                return function (value) {
                    var i = 0;
                    
                    if (value.myType === collisionType) {
                        if (value.hitType === solidOrSoft) {
                            for (i = 0; i < event.length; i++) {
                                this.owner.triggerEvent(event[i], value);
                            }
                        }
                    }
                };
            } else {
                return function (collisionInfo) {
                    var dx = collisionInfo.x,
                        dy = collisionInfo.y;

                    if (collisionInfo.entity && !(dx || dy)) {
                        dx = collisionInfo.entity.x - this.owner.x;
                        dy = collisionInfo.entity.y - this.owner.y;
                    }

                    if (collisionInfo.myType === collisionType) {
                        if (collisionInfo.hitType === solidOrSoft) {
                            if ((dy > 0) && event.bottom) {
                                this.owner.trigger(event.bottom, collisionInfo);
                            }
                            if ((dy < 0) && event.top) {
                                this.owner.trigger(event.top, collisionInfo);
                            }
                            if ((dx > 0) && event.right) {
                                this.owner.trigger(event.right, collisionInfo);
                            }
                            if ((dx < 0) && event.left) {
                                this.owner.trigger(event.left, collisionInfo);
                            }
                            if (event.all) {
                                this.owner.trigger(event.all, collisionInfo);
                            }
                        }
                    }
                };
            }
        },
        setupCollisionFunctions = function (self, entity) {
            // This allows the same component type to be added multiple times.
            if (!entity.collisionFunctions) {
                entity.collisionFunctions = {};
                entity.getAABB = function (collisionType) {
                    var aabb = null,
                        key  = '';

                    if (!collisionType) {
                        aabb = entity.aabb = entity.aabb || new platypus.AABB();
                        aabb.reset();
                        for (key in entity.collisionFunctions) {
                            if (entity.collisionFunctions.hasOwnProperty(key)) {
                                aabb.include(entity.collisionFunctions[key].getAABB());
                            }
                        }
                        return aabb;
                    } else if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getAABB();
                    } else {
                        return null;
                    }
                };

                entity.getPreviousAABB = function (collisionType) {
                    if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getPreviousAABB();
                    } else {
                        return null;
                    }
                };

                entity.getShapes = function (collisionType) {
                    if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getShapes();
                    } else {
                        return null;
                    }
                };

                entity.getPrevShapes = function (collisionType) {
                    if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getPrevShapes();
                    } else {
                        return null;
                    }
                };

                entity.prepareCollision = function (x, y) {
                    var key = '';
                    
                    for (key in entity.collisionFunctions) {
                        if (entity.collisionFunctions.hasOwnProperty(key)) {
                            entity.collisionFunctions[key].prepareCollision(x, y);
                        }
                    }
                };

                entity.relocateEntity = function (vector, collisionData) {
                    var v = null;

                    if (collisionData.xCount) {
                        v = new platypus.Vector(0, 0, 0);
                        handleStuck(v, collisionData.getXEntry(0), entity);
                    }

                    if (collisionData.yCount) {
                        v = v || new platypus.Vector(0, 0, 0);
                        handleStuck(v, collisionData.getYEntry(0), entity);
                    }

                    entity.triggerEvent('relocate-entity', {position: vector, unstick: v});
                };

                entity.movePreviousX = function (x) {
                    var key = '';
                    
                    for (key in entity.collisionFunctions) {
                        if (entity.collisionFunctions.hasOwnProperty(key)) {
                            entity.collisionFunctions[key].movePreviousX(x);
                        }
                    }
                };

                entity.getCollisionTypes = function () {
                    return entity.collisionTypes;
                };

                entity.getSolidCollisions = function () {
                    return entity.solidCollisions;
                };
            }

            entity.collisionFunctions[self.collisionType] = {
                getAABB: function () {
                    return self.getAABB();
                },

                getPreviousAABB: function () {
                    return self.getPreviousAABB();
                },

                getShapes: function () {
                    return self.getShapes();
                },

                getPrevShapes: function () {
                    return self.getPrevShapes();
                },

                prepareCollision: function (x, y) {
                    self.prepareCollision(x, y);
                },

                movePreviousX: function (x) {
                    self.movePreviousX(x);
                }
            };

        };

    return platypus.createComponentClass({
        
        id: 'CollisionBasic',

        properties: {
            /**
             * Defines how this entity should be recognized by other colliding entities.
             * 
             * @property collisionType
             * @type String
             * @default "none"
             */
            collisionType: "none",

            /**
             * Defines the type of colliding shape.
             * 
             * @property shapeType
             * @type String
             * @default "rectangle"
             */
            shapeType: "rectangle",
            
            /**
             * Determines whether the collision area should transform on orientation changes.
             * 
             * @property ignoreOrientation
             * @type boolean
             * @default false
             */
            ignoreOrientation: false,
            
            /**
             * Determines the x-axis center of the collision shape.
             * 
             * @property regX
             * @type number
             * @default width / 2
             */
            regX: null,
            
            /**
             * Determines the y-axis center of the collision shape.
             * 
             * @property regY
             * @type number
             * @default height / 2
             */
            regY: null,
            
            /**
             * Sets the width of the collision area in world coordinates.
             * 
             * @property width
             * @type number
             * @default 0
             */
            width: 0,
            
            /**
             * Sets the height of the collision area in world coordinates.
             * 
             * @property height
             * @type number
             * @default 0
             */
            height: 0,
            
            /**
             * Sets the radius of a circle collision area in world coordinates.
             * 
             * @property radius
             * @type number
             * @default 0
             */
            radius: 0,
            
            /**
             * This is the margin around the entity's width and height. This is an alternative method for specifying the collision shape in terms of the size of the entity. Can also pass in an object specifying the following parameters if the margins vary per side: top, bottom, left, and right.
             * 
             * @property margin
             * @type number|Object
             * @default 0
             */
            margin: 0,
            
            /**
             * Defines one or more shapes to create the collision area. Defaults to a single shape with the width, height, regX, and regY properties of the entity if not specified. See [CollisionShape](CollisionShape.html) for the full list of properties.
             * 
             * @property shapes
             * @type Array
             * @default null
             */
            shapes: null
        },
        
        publicProperties: {
            /**
             * This property should be set to true if entity doesn't move for better optimization. This causes other entities to check against this entity, but this entity performs no checks of its own. Available on the entity as `entity.immobile`.
             * 
             * @property immobile
             * @type boolean
             * @default false
             */
            immobile: false,

            /**
             * Whether this entity should be tested across its entire movement path. This is necessary for fast-moving entities, but shouldn't be used for others due to the processing overhead. Available on the entity as `entity.bullet`.
             * 
             * @property bullet
             * @type boolean
             * @default false
             */
            bullet: false,
            
            /**
             * Whether the entity is only solid when being collided with from the top.
             * 
             * @property jumpThrough
             * @type boolean
             * @default: false
             */
            jumpThrough: false
        },
        
        constructor: function (definition) {
            var x            = 0,
                key          = '',
                shapes       = null,
                regX         = this.regX,
                regY         = this.regY,
                width        = this.width,
                height       = this.height,
                radius       = this.radius,
                marginLeft   = this.margin.left   || this.margin,
                marginRight  = this.margin.right  || this.margin,
                marginTop    = this.margin.top    || this.margin,
                marginBottom = this.margin.bottom || this.margin;
            
            if (regX === null) {
                regX = this.regX = width / 2;
            }
            
            if (regY === null) {
                regY = this.regY = height / 2;
            }
            
            platypus.Vector.assign(this.owner, 'position', 'x', 'y', 'z');
            platypus.Vector.assign(this.owner, 'previousPosition', 'previousX', 'previousY', 'previousZ');
            this.owner.previousX = this.owner.previousX || this.owner.x;
            this.owner.previousY = this.owner.previousY || this.owner.y;
            
            this.aabb     = new platypus.AABB();
            this.prevAABB = new platypus.AABB();
            
            if (this.shapes) {
                shapes = this.shapes;
            } else {
                if (this.shapeType === 'circle') {
                    radius = radius || (((width || 0) + (height || 0)) / 4);
                    shapes = [{
                        regX: (isNaN(regX) ? radius : regX) - (marginRight - marginLeft) / 2,
                        regY: (isNaN(regY) ? radius : regY) - (marginBottom - marginTop) / 2,
                        radius: radius,
                        width:  radius * 2,
                        height: radius * 2,
                        type: this.shapeType
                    }];
                } else {
                    shapes = [{
                        regX: (isNaN(regX) ? (width  || 0) / 2 : regX) - (marginRight  - marginLeft) / 2,
                        regY: (isNaN(regY) ? (height || 0) / 2 : regY) - (marginBottom - marginTop)  / 2,
                        points: definition.points,
                        width:  (width  || 0) + marginLeft + marginRight,
                        height: (height || 0) + marginTop  + marginBottom,
                        type: this.shapeType
                    }];
                }
            }
            
            this.owner.collisionTypes = this.owner.collisionTypes || [];
            this.owner.collisionTypes.push(this.collisionType);
            
            this.shapes = [];
            this.prevShapes = [];
            this.entities = undefined;
            for (x = 0; x < shapes.length; x++) {
                this.shapes.push(new platypus.CollisionShape(this.owner, shapes[x], this.collisionType));
                this.prevShapes.push(new platypus.CollisionShape(this.owner, shapes[x], this.collisionType));
                this.prevAABB.include(this.prevShapes[x].getAABB());
                this.aabb.include(this.shapes[x].getAABB());
            }
            
            setupCollisionFunctions(this, this.owner);
            
            /**
             * Determines which collision types this entity should consider solid, meaning this entity should not pass through them. Example:
             * 
             *     {
             *         "boulder": "",                       // This specifies that this entity should not pass through other "boulder" collision-type entities.
             *         "diamond": "crack-up",               // This specifies that this entity should not pass through "diamond" collision-type entities, but if it touches one, it triggers a "crack-up" message on the entity.
             *         "marble": ["flip", "dance", "crawl"] // This specifies that this entity should not pass through "marble" collision-type entities, but if it touches one, it triggers all three specified messages on the entity.
             *     }
             * 
             * @property solidCollisions
             * @type Object
             * @default null
             */
            this.owner.solidCollisions = this.owner.solidCollisions || {};
            this.owner.solidCollisions[this.collisionType] = [];
            if (definition.solidCollisions) {
                for (key in definition.solidCollisions) {
                    if (definition.solidCollisions.hasOwnProperty(key)) {
                        this.owner.solidCollisions[this.collisionType].push(key);
                        this.owner.collides = true; //informs HandlerCollision that this entity should be processed in the list of solid colliders.
                        if (definition.solidCollisions[key]) { // To make sure it's not an empty string.
                            this.addEventListener('hit-by-' + key, entityBroadcast(definition.solidCollisions[key], 'solid', this.collisionType));
                        }
                    }
                }
            }
    
            /**
             * Determines which collision types this entity should consider soft, meaning this entity may pass through them, but triggers collision messages on doing so. Example:
             * 
             *     {
             *         "water": "soaked",       // This triggers a "soaked" message on the entity when it passes over a "water" collision-type entity.
             *         "lava": ["burn", "ouch"] // This triggers both messages on the entity when it passes over a "lava" collision-type entity.
             *     }
             * 
             * @property softCollisions
             * @type Object
             * @default null
             */
            this.owner.softCollisions = this.owner.softCollisions || {};
            this.owner.softCollisions[this.collisionType] = [];
            if (definition.softCollisions) {
                for (key in definition.softCollisions) {
                    if (definition.softCollisions.hasOwnProperty(key)) {
                        this.owner.softCollisions[this.collisionType].push(key);
                        if (definition.softCollisions[key]) { // To make sure it's not an empty string.
                            this.addEventListener('hit-by-' + key, entityBroadcast(definition.softCollisions[key], 'soft', this.collisionType));
                        }
                    }
                }
            }
            
            this.stuck = false;
        },
        
        events: {
            /**
             * On receiving this message, the component triggers `add-collision-entity` on the parent.
             * 
             * @method 'collide-on'
             */
            "collide-on": function () {
                /**
                 * On receiving 'collide-on', this message is triggered on the parent to turn on collision.
                 * 
                 * @event 'add-collision-entity'
                 * @param entity {Entity} The entity this component is attached to.
                 */
                this.owner.parent.trigger('add-collision-entity', this.owner);
            },
            
            /**
             * On receiving this message, the component triggers `remove-collision-entity` on the parent.
             * 
             * @method 'collide-off'
             */
            "collide-off": function () {
                /**
                 * On receiving 'collide-off', this message is triggered on the parent to turn off collision.
                 * 
                 * @event 'remove-collision-entity'
                 * @param entity {Entity} The entity this component is attached to.
                 */
                this.owner.parent.trigger('remove-collision-entity', this.owner);
            },
            
            /**
             * This message causes the entity's x,y coordinates to update.
             * 
             * @method 'relocate-entity'
             * @param position.x {number} The new x coordinate.
             * @param position.y {number} The new y coordinate.
             * @param [position.relative=false] {boolean} Determines whether the provided x,y coordinates are relative to the entity's current position.
             */
            "relocate-entity": function (resp) {
                var unstick = resp.unstick,
                    um      = 0,
                    i       = 0;
                
                if (unstick) {
                    um = unstick.magnitude();
                }
                
                this.move = null;
                
                if (resp.relative) {
                    this.owner.position.set(this.owner.previousPosition).add(resp.position);
                } else {
                    this.owner.position.set(resp.position);
                }

                if (this.stuck) {
                    if (um > 0) {
                        this.owner.position.add(unstick);
                    } else {
                        this.stuck = false;
                    }
                }
                
                this.aabb.reset();
                for (i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].update(this.owner.x, this.owner.y);
                    this.aabb.include(this.shapes[i].getAABB());
                }

                this.owner.previousPosition.set(this.owner.position);
                
                if (um > 0) { // to force check in all directions for ultimate stuck resolution (esp. for stationary entities)
                    if (!this.stuck) {
                        this.stuck = true;
                    }
                    this.move = this.owner.stuckWith.copy().add(-this.owner.x, -this.owner.y).normalize();
                }
            },
            
            /**
             * If the entity is stuck to another entity, this component tries to unstick the entity on each logic step.
             * 
             * @method 'handle-logic'
             */
            "handle-logic": function () {
                if (this.move) {
                    this.owner.position.add(this.move); // By trying to move into it, we should get pushed back out.
                }
            },
            
            /**
             * Collision shapes are updated to reflect the new orientation when this message occurs.
             * 
             * @method 'orientation-updated'
             * @param matrix {Array} A 2D matrix describing the new orientation.
             */
            "orientation-updated": function (matrix) {
                var i = 0;
                
                if (!this.ignoreOrientation) {
                    for (i = 0; i < this.shapes.length; i++) {
                        this.shapes[i].multiply(matrix);
                    }
                }
            }
        },
        
        methods: {
            getAABB: function () {
                return this.aabb;
            },
            
            getPreviousAABB: function () {
                return this.prevAABB;
            },
            
            getShapes: function () {
                return this.shapes;
            },
            
            getPrevShapes: function () {
                return this.prevShapes;
            },
            
            prepareCollision: function (x, y) {
                var i          = 0,
                    tempShapes = this.prevShapes;
                
                this.owner.x = x;
                this.owner.y = y;
                
                this.prevShapes = this.shapes;
                this.shapes = tempShapes;
                
                this.prevAABB.set(this.aabb);
                this.aabb.reset();
                
                // update shapes
                for (i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].update(this.owner.x, this.owner.y);
                    this.aabb.include(this.shapes[i].getAABB());
                }
            },
            
            movePreviousX: function (x) {
                var i = 0;
                
                this.prevAABB.moveX(x);
                for (i = 0; i < this.prevShapes.length; i++) {
                    this.prevShapes[i].setXWithEntityX(x);
                }
            },
            
            destroy: function () {
                var i   = 0,
                    col = '';
                
                this.owner.parent.trigger('remove-collision-entity', this.owner);

                this.owner.collides = false;

                delete this.aabb;
                delete this.prevAABB;
                
                for (i = 0; i < this.owner.collisionTypes.length; i++) {
                    if (this.owner.collisionTypes[i] === this.collisionType) {
                        this.owner.collisionTypes.splice(i, 1);
                        break;
                    }
                }
                if (this.owner.solidCollisions[this.collisionType]) {
                    this.owner.solidCollisions[this.collisionType].length = 0;
                    delete this.owner.solidCollisions[this.collisionType];
                }
                if (Object.keys(this.owner.solidCollisions).length > 0) {
                    this.owner.collides = true;
                }
                if (this.owner.softCollisions[this.collisionType]) {
                    this.owner.softCollisions[this.collisionType].length = 0;
                    delete this.owner.softCollisions[this.collisionType];
                }
                delete this.owner.collisionFunctions[this.collisionType];
                
                this.shapes.length = 0;
                this.prevShapes.length = 0;
                delete this.entities;

                if (this.owner.collisionTypes.length) {
                    this.owner.parent.trigger('add-collision-entity', this.owner);
                }
            }
        }
    });
}());

//##############################################################################
// CollisionFilter.js
//##############################################################################

/**
 * This component will listen for a particular collision message and, depending on a given entity.state attribute, retrigger the collision as another collision message.
 * 
 * @namespace platypus.components
 * @class CollisionFilter
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    var collidePos = function (entity, state, event) {
            return function (collInfo) {
                if (entity.state[state]) {
                    entity.trigger(event, collInfo);
                }
            };
        },
        collideNeg = function (entity, state, event) {
            return function (collInfo) {
                if (!entity.state[state]) {
                    entity.trigger(event, collInfo);
                }
            };
        };
    
    return platypus.createComponentClass({
        id: 'CollisionFilter',
        
        properties: {
            /**
             * One or more collision events for which to listen. For example, if the state property is set to "allergic":
             * 
                   {
                       "hitting-flowers": "sneeze",
                       // Listen for "hitting-flowers", and if the entity is "allergic", trigger a "sneeze" event.
                    
                       "in-the-weeds": "cough"
                       // Another collision event that triggers "cough" if the entity is "allergic".
                   }
             * 
             * @property collisions
             * @type Object
             * @default {}
             */
            collisions: {},
            
            /**
             * The entity state that should cause the following list of collisions to trigger events. If this state is not true, no events are triggered. To trigger events on the inverse of a state, place "!" before the state such as "!allergic".
             * 
             * @property state
             * @type String
             * @default ""
             */
            state: ""
        },
        
        constructor: function (definition) {
            var event      = "",
                collisions = this.collisions,
                state      = this.state;
            
            if (collisions) {
                /**
                 * Events defined by the `collisions` property trigger whenever collisions happen while in the defined state.
                 * 
                 * @event *
                 * @param collisionData {CollisionData} Information regarding the collision that occurred.
                 */
                if (state[0] === '!') {
                    state = state.substring(1);
                    for (event in collisions) {
                        if (collisions.hasOwnProperty(event)) {
                            this.addEventListener(event, collideNeg(this.owner, state, collisions[event]));
                        }
                    }
                } else {
                    for (event in collisions) {
                        if (collisions.hasOwnProperty(event)) {
                            this.addEventListener(event, collidePos(this.owner, state, collisions[event]));
                        }
                    }
                }
            }
        }
    });
}());

//##############################################################################
// CollisionGroup.js
//##############################################################################

/**
 * This component groups other entities with this entity for collision checking. This is useful for carrying and moving platforms. It uses `EntityContainer` component messages if triggered to add to its collision list and also listens for explicit add/remove messages (useful in the absence of an `EntityContainer` component).
 * 
 * @namespace platypus.components
 * @class CollisionGroup
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    //set here to make them reusable objects
    var appendUniqueItems = function (hostArray, insertArray) {
        var i      = 0,
            j      = 0,
            length = hostArray.length,
            found  = false;
        
        for (i = 0; i < insertArray.length; i++) {
            found = false;
            for (j = 0; j < length; j++) {
                if (insertArray[i] === hostArray[j]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                hostArray.push(insertArray[i]);
            }
        }
        
        return hostArray;
    };
    
    return platypus.createComponentClass({
        id: 'CollisionGroup',
        
        constructor: function (definition) {
            var self = this;
            
            this.solidEntities = [];
            
            this.terrain = undefined;
            this.aabb     = new platypus.AABB(this.owner.x, this.owner.y);
            this.prevAABB = new platypus.AABB(this.owner.x, this.owner.y);

            platypus.Vector.assign(this.owner, 'position', 'x', 'y', 'z');
            platypus.Vector.assign(this.owner, 'previousPosition', 'previousX', 'previousY', 'previousZ');
            this.owner.previousX = this.owner.previousX || this.owner.x;
            this.owner.previousY = this.owner.previousY || this.owner.y;
            
            this.collisionGroup = this.owner.collisionGroup = {
                getAllEntities: function () {
                    var x           = 0,
                        count       = 0,
                        childEntity = null;
                    
                    for (x = 0; x < self.solidEntities.length; x++) {
                        childEntity = self.solidEntities[x];
                        if ((childEntity !== self.owner) && childEntity.collisionGroup) {
                            count += childEntity.collisionGroup.getAllEntities();
                        } else {
                            count += 1;
                        }
                    }

                    return count;
                },
                getSize: function () {
                    return self.solidEntities.length;
                },
                getCollisionTypes: function () {
                    return self.getCollisionTypes();
                },
                getSolidCollisions: function () {
                    return self.getSolidCollisions();
                },
                getAABB: function (collisionType) {
                    return self.getAABB(collisionType);
                },
                getPreviousAABB: function (collisionType) {
                    return self.getPreviousAABB(collisionType);
                },
                getShapes: function (collisionType) {
                    return self.getShapes(collisionType);
                },
                getPrevShapes: function (collisionType) {
                    return self.getPrevShapes(collisionType);
                },
                prepareCollision: function (x, y) {
                    return self.prepareCollision(x, y);
                },
                relocateEntity: function (vector, collisionData) {
                    return self.relocateEntity(vector, collisionData);
                },
                movePreviousX: function (x) {
                    return self.movePreviousX(x);
                },
                getSolidEntities: function () {
                    return self.solidEntities;
                },
                jumpThrough: false //TODO: this introduces odd behavior - not sure how to resolve yet. - DDD
            };
        },
        
        events: {
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             * 
             * @method 'child-entity-added'
             * @param entity {Entity} The entity to be added.
             */
            "child-entity-added": function (entity) {
                this.addCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             * 
             * @method 'add-collision-entity'
             * @param entity {Entity} The entity to be added.
             */
            "add-collision-entity": function (entity) {
                this.addCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             * 
             * @method 'child-entity-removed'
             * @param entity {Entity} The entity to be removed.
             */
            "child-entity-removed": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             * 
             * @method 'remove-collision-entity'
             * @param entity {Entity} The entity to be removed.
             */
            "remove-collision-entity": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * When this message is triggered, the collision group updates its record of the owner's last (x, y) coordinate.
             * 
             * @method 'relocate-entity'
             */
            "relocate-entity": function () {
                this.owner.previousPosition.set(this.owner.position);
                this.updateAABB();
            }
        },
        
        methods: {
            addCollisionEntity: function (entity) {
                var i     = 0,
                    types = entity.collisionTypes;
                
                if (types) {
                    for (i = 0; i < types.length; i++) {
                        if (entity.solidCollisions[types[i]].length && !entity.immobile) {
                            this.solidEntities[this.solidEntities.length] = entity;
                        }
                    }
                    this.updateAABB();
                }
            },
            
            removeCollisionEntity: function (entity) {
                var x     = 0,
                    i     = 0,
                    types = entity.collisionTypes;

                if (types) {
                    for (i = 0; i < types.length; i++) {
                        if (entity.solidCollisions[types[i]].length) {
                            for (x in this.solidEntities) {
                                if (this.solidEntities[x] === entity) {
                                    this.solidEntities.splice(x, 1);
                                    break;
                                }
                            }
                        }
                    }
                    this.updateAABB();
                }
            },
            
            getCollisionTypes: function () {
                var x            = 0,
                    childEntity  = null,
                    compiledList = [];
                
                for (x = 0; x < this.solidEntities.length; x++) {
                    childEntity = this.solidEntities[x];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    compiledList = appendUniqueItems(compiledList, childEntity.getCollisionTypes());
                }
                
                return compiledList;
            },

            getSolidCollisions: function () {
                var x            = 0,
                    key          = '',
                    childEntity  = null,
                    compiledList = {},
                    entityList   = null;
                
                for (x = 0; x < this.solidEntities.length; x++) {
                    childEntity = this.solidEntities[x];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    entityList = childEntity.getSolidCollisions();
                    for (key in entityList) {
                        if (entityList.hasOwnProperty(key)) {
                            compiledList[key] = appendUniqueItems(compiledList[key] || [], entityList[key]);
                        }
                    }
                }
                
                return compiledList;
            },
            
            getAABB: function (collisionType) {
                var x           = 0,
                    aabb        = null,
                    childEntity = null;
                
                if (!collisionType) {
                    return this.aabb;
                } else {
                    aabb = new platypus.AABB();
                    for (x = 0; x < this.solidEntities.length; x++) {
                        childEntity = this.solidEntities[x];
                        if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                            childEntity = childEntity.collisionGroup;
                        }
                        
                        aabb.include(childEntity.getAABB(collisionType));
                    }
                    return aabb;
                }
            },

            getPreviousAABB: function (collisionType) {
                var x           = 0,
                    aabb        = null,
                    childEntity = null;
                
                if (!collisionType) {
                    return this.prevAABB;
                } else {
                    aabb = new platypus.AABB();
                    for (x = 0; x < this.solidEntities.length; x++) {
                        childEntity = this.solidEntities[x];
                        if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                            childEntity = childEntity.collisionGroup;
                        }

                        aabb.include(childEntity.getPreviousAABB(collisionType));
                    }
                    return aabb;
                }
            },
            
            updateAABB: function () {
                var x = 0;
                
                this.aabb.reset();
                for (x = 0; x < this.solidEntities.length; x++) {
                    this.aabb.include(((this.solidEntities[x] !== this.owner) && this.solidEntities[x].getCollisionGroupAABB) ? this.solidEntities[x].getCollisionGroupAABB() : this.solidEntities[x].getAABB());
                }
            },
            
            getShapes: function (collisionType) {
                var x           = 0,
                    childEntity = null,
                    shapes      = [],
                    newShapes   = null;
                
                for (x = 0; x < this.solidEntities.length; x++) {
                    childEntity = this.solidEntities[x];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    newShapes = childEntity.getShapes(collisionType);
                    if (newShapes) {
                        shapes = shapes.concat(newShapes);
                    }
                }
                return shapes;
            },

            getPrevShapes: function (collisionType) {
                var x           = 0,
                    childEntity = null,
                    newShapes   = null,
                    shapes      = [];
                
                for (x = 0; x < this.solidEntities.length; x++) {
                    childEntity = this.solidEntities[x];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    newShapes = childEntity.getPrevShapes(collisionType);
                    if (newShapes) {
                        shapes = shapes.concat(newShapes);
                    }
                }
                return shapes;
            },
            
            prepareCollision: function (x, y) {
                var i           = 0,
                    childEntity = null,
                    oX          = 0,
                    oY          = 0;
                
                for (i = 0; i < this.solidEntities.length; i++) {
                    childEntity = this.solidEntities[i];
                    childEntity.saveDX = childEntity.x - childEntity.previousX;
                    childEntity.saveDY = childEntity.y - childEntity.previousY;
                    oX = childEntity.saveOX = this.owner.previousX - childEntity.previousX;
                    oY = childEntity.saveOY = this.owner.previousY - childEntity.previousY;
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    childEntity.prepareCollision(x - oX, y - oY);
                }
            },
            
            movePreviousX: function (x) {
                var childEntity = null,
                    offset      = 0,
                    i           = 0;
                
                for (i = 0; i < this.solidEntities.length; i++) {
                    childEntity = this.solidEntities[i];
                    offset = childEntity.saveOX;
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    childEntity.movePreviousX(x - offset);
                }
            },
            
            relocateEntity: function (vector, collisionData) {
                var childEntity = null,
                    entity      = null,
                    i           = 0;
                
                this.owner.saveDX -= vector.x - this.owner.previousX;
                this.owner.saveDY -= vector.y - this.owner.previousY;

                for (i = 0; i < collisionData.xCount; i++) {
                    if (collisionData.getXEntry(i).thisShape.owner === this.owner) {
                        this.owner.saveDX = 0;
                        break;
                    }
                }
                
                for (i = 0; i < collisionData.yCount; i++) {
                    if (collisionData.getYEntry(i).thisShape.owner === this.owner) {
                        this.owner.saveDY = 0;
                        break;
                    }
                }
                
                for (i = 0; i < this.solidEntities.length; i++) {
                    childEntity = entity = this.solidEntities[i];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    childEntity.relocateEntity(new platypus.Vector(vector.x - entity.saveOX, vector.y - entity.saveOY), collisionData);
                    entity.x += entity.saveDX;
                    entity.y += entity.saveDY;
                    if (entity !== this.owner) {
                        entity.x += this.owner.saveDX;
                        entity.y += this.owner.saveDY;
                    }
                }
            },

            destroy: function () {
                this.solidEntities.length = 0;
            }
        },
        
        publicMethods: {
            /**
             * Gets the bounding box of the group of entities.
             * 
             * @method getCollisionGroupAABB
             * @return platformer.AABB
             */
            getCollisionGroupAABB: function () {
                return this.getAABB();
            },
            
            /**
             * Gets a list of all the entities in the world.
             * 
             * @method getWorldEntities
             * @return Array
             */
            getWorldEntities: function () {
                return this.owner.parent.getWorldEntities();
            },
            
            /**
             * Gets the collision entity representing the world's terrain.
             * 
             * @method getWorldTerrain
             * @return platformer.Entity
             */
            getWorldTerrain: function () {
                return this.owner.parent.getWorldTerrain();
            }
        }
    });
}());

//##############################################################################
// CollisionTiles.js
//##############################################################################

/**
 * This component causes the tile-map to collide with other entities. It must be part of a collision group and will cause "hit-by-tile" messages to fire on colliding entities.
 * 
 * @namespace platypus.components
 * @class CollisionTiles
 * @uses Component
 */
// Requires: ["../CollisionShape.js"]
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var storedTiles = [],
        storedTileIndex = 0,
        serveTiles      = [],
        flip = function (num, arr) {
            if (num < -1) {
                num = Math.abs(num) - 2;
                return arr[num];
            } else {
                return num;
            }
        },
        copySection = function (array, originX, originY, width, height) {
            var x   = 0,
                y   = 0,
                arr = [];

            for (y = 0; y < height; y++) {
                arr[y] = [];
                for (x = 0; x < width; x++) {
                    arr[y][x] = array[originX + x][originY + y];
                }
            }
            return arr;
        },
        cutSection = function (array, originX, originY, width, height) {
            var x   = 0,
                y   = 0,
                arr = [];

            for (y = 0; y < height; y++) {
                arr[y] = [];
                for (x = 0; x < width; x++) {
                    arr[y][x] = array[originX + x][originY + y];
                    array[originX + x][originY + y] = -1;
                }
            }
            return arr;
        },
        pasteSection = function (destinationArray, sourceArray, originX, originY, width, height) {
            var x = 0,
                y = 0;

            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                    destinationArray[originX + x][originY + y] = sourceArray[y][x];
                }
            }
            return destinationArray;
        },
        transforms = {
            "diagonal": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-5, -4, -3, -2];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + x][originY + y] = flip(arr[x][y], flips);
                    }
                }
                return array;
            },
            "diagonal-inverse": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-3, -2, -5, -4];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + height - y - 1] = flip(arr[x][y], flips);
                    }
                }
                return array;
            },
            "horizontal": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-2, -5, -4, -3];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + y] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "vertical": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-4, -3, -2, -5];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + x][originY + height - y - 1] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "rotate-90": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-3, -4, -5, -2];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + height - y - 1][originY + x] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "rotate-180": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-4, -5, -2, -3];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + height - y - 1] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "rotate-270": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-5, -2, -3, -4];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + y][originY + width - x - 1] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "translate": function (array, originX, originY, width, height, dx, dy) {
                var arr = cutSection(array, originX, originY, width, height),
                    x   = 0,
                    y   = 0;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + x + dx][originY + y + dy] = arr[y][x];
                    }
                }
                return array;
            }
        };

    return platypus.createComponentClass({
        id: 'CollisionTiles',
        
        publicProperties: {
            /**
             * A 2D array describing the tile-map with off (-1) and on (!-1) states. Numbers > -1 are solid and numbers -2, -3, -4, and -5 provide for jumpthrough tiles with the solid side being top, right, bottom, and left respectively. Example: `[[-1,-1,-1], [1,-1,-1], [1,1,1]]`. Available on the entity as `entity.collisionMap`.
             * 
             * @property collisionMap
             * @type Array
             * @default []
             */
            collisionMap: [],
            
            /**
             * The width of tiles in world coordinates. Available on the entity as `entity.tileWidth`.
             * 
             * @property tileWidth
             * @type number
             * @default 10
             */
            tileWidth: 10,

            /**
             * The height of tiles in world coordinates. Available on the entity as `entity.tileHeight`.
             * 
             * @property tileWidth
             * @type number
             * @default 10
             */
            tileHeight: 10
        },
        constructor: function (definition) {
            this.tileHalfWidth  = this.tileWidth  / 2;
            this.tileHalfHeight = this.tileHeight / 2;
        },
        
        events: {
            /**
             * Performs a transform of a subset of the collision tile grid.
             * 
             * @method 'transform'
             * @param [transform] {Object} A list of key/value pairs describing the transform.
             * @param [transform.type="horizontal"] {String} The type of transform; one of the following: "horizontal", "vertical", "diagonal", "diagonal-inverse", "rotate-90", "rotate-180", "rotate-270". Height and width should match for diagonal flips and 90 degree rotations.
             * @param [transform.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [transform.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [transform.width=grid.width] {number} Cell width of the bounding box.
             * @param [transform.height=grid.height] {number} Cell height of the bounding box.
             */
            "transform": function (transform) {
                this.transform(transform);
            },

            /**
             * Performs a translation of a subset of the collision tile grid.
             * 
             * @method 'translate'
             * @param [translate] {Object} A list of key/value pairs describing the translation.
             * @param [translate.dx=0] {number} Movement in columns.
             * @param [translate.dy=0] {number} Movement in rows.
             * @param [translate.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [translate.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [translate.width=grid.width] {number} Cell width of the bounding box.
             * @param [translate.height=grid.height] {number} Cell height of the bounding box.
             */
            "translate": function (translate) {
                this.translate(translate);
            }
        },
        
        methods: {
            getShape: function (prevAABB, x, y) {
                var shape = null;
                
                if (storedTileIndex < storedTiles.length) {
                    shape = storedTiles[storedTileIndex];
                    storedTileIndex += 1;
                    shape.update(x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight);
                } else {
                    storedTiles.push(new platypus.CollisionShape(null, {
                        x:      x * this.tileWidth  + this.tileHalfWidth,
                        y:      y * this.tileHeight + this.tileHalfHeight,
                        type:   'rectangle',
                        width:  this.tileWidth,
                        height: this.tileHeight
                    }, 'tiles'));
                    shape = storedTiles[storedTileIndex];
                }
                
                return shape;
            },
            
            addShape: function (shapes, prevAABB, x, y) {
                if (this.collisionMap[x][y] > -1) {
                    shapes.push(this.getShape(prevAABB, x, y));
                } else if (this.collisionMap[x][y] < -1) {
                    switch (this.collisionMap[x][y]) {
                    case -2: //Top
                        if (prevAABB.bottom <= y * this.tileHeight) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    case -3: //Right
                        if (prevAABB.left >= (x + 1) * this.tileWidth) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    case -4: //Bottom
                        if (prevAABB.top >= (y + 1) * this.tileHeight) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    case -5: //Left
                        if (prevAABB.right <= x * this.tileWidth) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    }
                }
                return shapes;
            }
        },
        
        publicMethods: {
            /**
             * Returns the axis-aligned bounding box of the entire map.
             * 
             * @method getAABB
             * @return aabb {AABB} The returned object provides the top, left, width, and height of the collision map.
             */
            getAABB: function () {
                return {
                    left: 0,
                    top:  0,
                    right: this.tileWidth * this.collisionMap.length,
                    bottom: this.tileHeight * this.collisionMap.length[0]
                };
            },
            
            /**
             * Confirms whether a particular map grid coordinate contains a tile.
             * 
             * @method isTile
             * @param x {number} Integer specifying the column of tiles in the collision map to check.
             * @param y {number} Integer specifying the row of tiles in the collision map to check.
             * @return {boolean} Returns `true` if the coordinate contains a collision tile, `false` if it does not.
             */
            isTile: function (x, y) {
                return !((x < 0) || (y < 0) || (x >= this.collisionMap.length) || (y >= this.collisionMap[0].length) || (this.collisionMap[x][y] === -1));
            },
            
            /**
             * Returns all the collision tiles within the provided axis-aligned bounding box as an array of shapes.
             * 
             * @method getTileShapes
             * @param aabb {AABB} The axis-aligned bounding box for which tiles should be returned.
             * @param prevAABB {AABB} The axis-aligned bounding box for a previous location to test for jump-through tiles.
             * @return {Array} Each returned object provides the [CollisionShape](CollisionShape.html) of a tile.
             */
            getTileShapes: function (aabb, prevAABB) {
                var left   = Math.max(Math.floor(aabb.left   / this.tileWidth),  0),
                    top    = Math.max(Math.floor(aabb.top    / this.tileHeight), 0),
                    right  = Math.min(Math.ceil(aabb.right   / this.tileWidth),  this.collisionMap.length),
                    bottom = Math.min(Math.ceil(aabb.bottom  / this.tileHeight), this.collisionMap[0].length),
                    x      = 0,
                    y      = 0,
                    shapes = serveTiles;
                
                serveTiles.length = 0;
                storedTileIndex   = 0;
                
                for (x = left; x < right; x++) {
                    for (y = top; y < bottom; y++) {
                        this.addShape(shapes, prevAABB, x, y);
                    }
                }
                
                return shapes;
            },
            
            /**
             * Performs a transform of a subset of the collision tile grid.
             * 
             * @method transform
             * @param [transform] {Object} A list of key/value pairs describing the transform.
             * @param [transform.type="horizontal"] {String} The type of transform; one of the following: "horizontal", "vertical", "diagonal", "diagonal-inverse", "rotate-90", "rotate-180", "rotate-270". Height and width should match for diagonal flips and 90 degree rotations.
             * @param [transform.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [transform.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [transform.width=grid.width] {number} Cell width of the bounding box.
             * @param [transform.height=grid.height] {number} Cell height of the bounding box.
             */
            transform: function (transform) {
                var t      = transform || {},
                    x      = t.left    || 0,
                    y      = t.top     || 0,
                    width  = t.width   || this.collisionMap[0].length,
                    height = t.height  || this.collisionMap.length,
                    type   = t.type    || "horizontal";
                
                if (transforms[type]) {
                    return transforms[type](this.collisionMap, x, y, width, height);
                } else {
                    return null;
                }
            },
            
            /**
             * Performs a translation of a subset of the collision tile grid.
             * 
             * @method translate
             * @param [translate] {Object} A list of key/value pairs describing the translation.
             * @param [translate.dx=0] {number} Movement in columns.
             * @param [translate.dy=0] {number} Movement in rows.
             * @param [translate.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [translate.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [translate.width=grid.width] {number} Cell width of the bounding box.
             * @param [translate.height=grid.height] {number} Cell height of the bounding box.
             */
            translate: function (translate) {
                var t      = translate || {},
                    x      = t.left    || 0,
                    y      = t.top     || 0,
                    width  = t.width   || this.collisionMap[0].length,
                    height = t.height  || this.collisionMap.length,
                    dx     = t.dx      || 0,
                    dy     = t.dy      || 0;
                
                return transforms.translate(this.collisionMap, x, y, width, height, dx, dy);
            },
            
            /**
             * Gets a subset of the collision tile grid as a 2D array.
             * 
             * @method getCollisionMatrix
             * @param originX {number} Grid coordinate for the left side of the bounding box.
             * @param originY {number} Grid coordinate for the top of the bounding box.
             * @param width {number} Cell width of the bounding box.
             * @param height {number} Cell height of the bounding box.
             * @return {Array}
             */
            getCollisionMatrix: function (originX, originY, width, height) {
                return copySection(this.collisionMap, originX, originY, width, height);
            },
            
            /**
             * Sets a subset of the collision tile grid.
             * 
             * @method setCollisionMatrix
             * @param sourceArray {Array} A 2D array describing the collision tiles to insert into the collision tile grid.
             * @param originX {number} Grid coordinate for the left side of the bounding box.
             * @param originY {number} Grid coordinate for the top of the bounding box.
             * @param width {number} Cell width of the bounding box.
             * @param height {number} Cell height of the bounding box.
             */
            setCollisionMatrix: function (sourceArray, originX, originY, width, height) {
                return pasteSection(this.collisionMap, sourceArray, originX, originY, width, height);
            }
        }
    });
}());

//##############################################################################
// ComponentSwitcher.js
//##############################################################################

/**
 * This component listens for messages and, according to its preset settings, will remove and add components to the entity. This is useful if certain events should modify the behavior of the entity in some way: for example, acquiring a pogo-stick might add a jumping component so the hero can jump.
 * 
 * @namespace platypus.components
 * @class ComponentSwitcher
 * @uses Component 
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var addRemoveComponents = function (definition, owner) {
        return function () {
            //Perform this swap outside of the entity's message loop to prevent endless loop errors due to messages not being able to be unbound.
            //TODO: should probably create a "safe" tick message to handle this sort of entity restructuring operation within the game loop.
            setTimeout(function () {
                var i = 0, j = 0;
                
                if (definition.remove) {
                    if (typeof definition.remove === 'string') {
                        for (i = owner.components.length - 1; i > -1; i--) {
                            if (owner.components[i].type === definition.remove) {
                                owner.removeComponent(owner.components[i]);
                            }
                        }
                    } else {
                        for (i = 0; i < definition.remove.length; i++) {
                            for (j = owner.components.length - 1; j > -1; j--) {
                                if (owner.components[j].type === definition.remove[i]) {
                                    owner.removeComponent(owner.components[j]);
                                }
                            }
                        }
                    }
                }

                if (definition.add) {
                    if (!Array.isArray(definition.add)) {
                        owner.addComponent(new platypus.components[definition.add.type](owner, definition.add));
                    } else {
                        for (i = 0; i < definition.add.length; i++) {
                            owner.addComponent(new platypus.components[definition.add[i].type](owner, definition.add[i]));
                        }
                    }
                }
                
                if (owner.parent) {
                    /**
                     * This message is triggered on the parent when the entity's components change.
                     * 
                     * @event 'child-entity-updated'
                     * @param entity {platformer.Entity} This is the entity itself.
                     */
                    owner.parent.triggerEvent('child-entity-updated', owner);
                }
            }, 1);
        };
    };
    
    return platypus.createComponentClass({
        id: 'ComponentSwitcher',
        
        properties: {
            /**
             * This is the list of messages to listen for (as the keys) with the settings as two arrays of components to add and components to remove.
             * 
                {
                    "found-pogostick":{
                      "add":[
                      // This is a list of components to add when "found-pogostick" is triggered on the entity. If it's adding a single component, "add" can be a reference to the component definition itself rather than an array of one object.
                        {"type": "Mover"},
                        {"type": "HeadGear"}
                      ]
                      
                      "remove": ["CarSeat"]
                      // This is a string list of component ids to remove when "found-pogostick" is triggered on the entity. It will ignore listed components that are not connected to the entity.
                    },
                    
                    // Multiple events can cause unique components to be added or removed
                    "walking-indoors":{
                      "remove": ["HeadGear"]
                    },
                    
                    "contemplate":{
                      "add": {"type": "AIPacer"}
                    }
                  }
                }
             * 
             * @property componentMap
             * @type Object
             * @default null
             */
            componentMap: null
        },
        
        constructor: function (definition) {
            var event = '';
            
            if (this.componentMap) {
                for (event in this.componentMap) {
                    if (this.componentMap.hasOwnProperty(event)) {
                        /**
                         * Message(s) listed by `componentMap` will add or remove components.
                         * 
                         * @event *
                         */
                        this.addEventListener(event, addRemoveComponents(this.componentMap[event], this.owner));
                    }
                }
            }
        }
    });
}());

//##############################################################################
// Counter.js
//##############################################################################

/**
 * A simple component that keeps count of something and sends messages each time the count changes. Can also have a total. When it does it will display 'count / total'.
 * 
 * @namespace platypus.components
 * @class Counter
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";
    
    return platypus.createComponentClass({

        id: 'Counter',

        publicProperties: {
            /**
             * A total the counter is incrementing toward.
             * 
             * @property total
             * @type number
             * @default 0
             */
            total: 0
        },

        constructor: function (definition) {
            this.count = 0;
            this.lastTotal = 0;
            this.lastCount = 0;
        },

        events: {
            /**
             * Each step, this component detects whether the count has changed and triggers an 'update-content' event if so.
             * 
             * @method 'handle-logic'
             */
            "handle-logic": function () {
                var txt = '',
                update  = false;
                
                if (this.total !== this.lastTotal) {
                    this.lastTotal = this.total;
                    update = true;
                }
                
                if (this.count !== this.lastCount) {
                    this.lastCount = this.count;
                    update = true;
                }
                
                if (update) {
                    if (this.total) {
                        txt = String(this.count) + "/" + String(this.total);
                    } else {
                        txt = String(this.count);
                    }
                    
                    /**
                     * A call used to notify other components that the count or total has changed.
                     * 
                     * @event 'update-content'
                     * @param update.text {string} String describing the current count.
                     */
                    this.owner.triggerEvent('update-content', {
                        text: txt
                    });
                }
            },

            /**
             * Changes the total to the given value.
             * 
             * @method 'change-total'
             * @param data.total {number} The new total value.
             */
            "change-total": function (total) {
                this.total = total;
            },

            /**
             * Changes the count to the given value.
             * 
             * @method 'change-count'
             * @param data.count {number} The new count value.
             */
            "change-count": function (count) {
                this.count = count;
            },

            /**
             * Increments the count by 1.
             * 
             * @method 'increment-count'
             */
            "increment-count": function () {
                this.count += 1;
            }
        }
    });
}());

//##############################################################################
// EntityContainer.js
//##############################################################################

/**
# COMPONENT **EntityContainer**
This component allows the entity to contain child entities. It will add several methods to the entity to manage adding and removing entities.

## Dependencies
- **[[Messenger]] - Entity uses `Messenger` in its prototypal chain to enable event handling.

## Messages

### Listens for:
- **load** - This component waits until all other entity components are loaded before it begins adding children entities. This allows other entity components to listen to entity-added messages and handle them if necessary.
- **add-entity** - This message will added the given entity to this component's list of entities.
  - @param message ([[Entity]] object) - Required. This is the entity to be added as a child.
- **remove-entity** - On receiving this message, the provided entity will be removed from the list of child entities.
  - @param message ([[Entity]] object) - Required. The entity to remove.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  - @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Local Broadcasts:
- **child-entity-added** - This message is triggered when a new entity has been added to the list of children entities.
  - @param message ([[Entity]] object) - The entity that was just added.
- **child-entity-removed** - This message is triggered when an entity has been removed from the list of children entities.
  - @param message ([[Entity]] object) - The entity that was just removed.

### Child Broadcasts:
- **peer-entity-added** - This message is triggered when a new entity has been added to the parent's list of children entities.
  - @param message ([[Entity]] object) - The entity that was just added.
- **peer-entity-removed** - This message is triggered when an entity has been removed from the parent's list of children entities.
  - @param message ([[Entity]] object) - The entity that was just removed.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  - @param message (object) - sends the message object received by the original message.

## Entity Methods:
- **addEntity** -  This method will add the provided entity to this component's list of entities.
  - @param entity ([[Entity]] object) - Required. This is the entity to be added as a child.
  - @return entity ([[Entity]] object) - Returns the entity that was just added.
- **removeEntity** - This method will remove the provided entity from the list of child entities.
  - @param message ([[Entity]] object) - Required. The entity to remove.
  - @return entity ([[Entity]] object | false) - Returns the entity that was just removed. If the entity was not foudn as a child, `false` is returned, indicated that the provided entity was not a child of this entity.
- **getEntitiesByType** - This method will return all child entities (including grandchildren) that match the provided type.
  - @param type (string) - Required. The entity type to find.
  - @return entities (Array of [[Entity]] objects) - Returns the entities that match the specified entity type.
- **getEntityById** - This method will return the first child entity it finds with a matching id (including grandchildren).
  - @param id (string) - Required. The entity id to find.
  - @return entity ([[Entity]] object) - Returns the entity that matches the specified entity id.
- **triggerOnChildren** - This method is used by both internal components and external entities to trigger messages on the child entities.
  - @param event (variant) - This is the message(s) to process. This can be a string, an object containing an "event" property (and optionally a "message" property, overriding the value below), or an array of the same.
  - @param value (variant) - This is a message object or other value to pass along to component functions.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message: this is useful for determining how many child entities care about a given message.
- **triggerEvent** - This method is used by both internal components and external entities to trigger messages on the child entities.
  - @param event (string) - This is the message to process.
  - @param value (variant) - This is a message object or other value to pass along to component functions.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message: this is useful for determining how many child entities care about a given message.

## JSON Definition:
    {
      "type": "EntityContainer",
      
      "entities": [{"type": "hero"}, {"type": "tile"}],
      // Optional. "entities" is an Array listing entity definitions to specify entities that should be added as children when this component loads.
      
      "childEvents": ["tokens-flying", "rules-updated"],
      // Optional. "childEvents" lists messages that are triggered on the entity and should be triggered on the children as well.
      
      "aliases": {
      // Optional. To prevent function name conflicts on the entity, you can provide alternatives here.
      
          "addEntity": "addFruit"
          //This causes entity.addFruit() to be created on the entity rather than the default entity.addEntity().
      }
    }
*/

/*
 * Requires: ["../Messenger.js"]
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var childBroadcast = function (event) {
        return function (value, debug) {
            this.triggerOnChildren(event, value, debug);
        };
    };
    
    return platypus.createComponentClass({
        id: 'EntityContainer',
        
        constructor: function (definition) {
            var self  = this,
                event = '';
    
            this.entities = [];
            
             //saving list of entities for load message
            this.definedEntities = null;
            if (definition.entities && this.owner.entities) { //combine component list and entity list into one if they both exist.
                this.definedEntities = definition.entities.concat(this.owner.entities);
            } else {
                this.definedEntities = definition.entities || this.owner.entities || null;
            }
            
            this.owner.entities     = self.entities;
            
            this.childEvents = [];
            if (definition.childEvents) {
                for (event in definition.childEvents) {
                    if (definition.childEvents.hasOwnProperty(event)) {
                        this.addNewPublicEvent(definition.childEvents[event]);
                    }
                }
            }
            this.addNewPrivateEvent('peer-entity-added');
            this.addNewPrivateEvent('peer-entity-removed');
        },
        
        events: {
            "load": function () {
                // putting this here so all other components will have been loaded and can listen for "entity-added" calls.
                var i          = 0,
                    entities   = this.definedEntities;
                
                this.definedEntities = null;
                
                if (entities) {
                    for (i = 0; i < entities.length; i++) {
                        this.addEntity(entities[i]);
                    }
                }
            },
            
            "add-entity": function (entity) {
                this.addEntity(entity);
            },
            
            "remove-entity": function (entity) {
                this.removeEntity(entity);
            },
            
            "child-entity-updated": function (entity) {
                this.updateChildEventListeners(entity);
            }
        },
        
        methods: {
            addNewPublicEvent: function (event) {
                var i = 0;
                
                this.addNewPrivateEvent(event);
                
                // Listen for message on owner
                for (i = 0; i < this.childEvents.length; i++) {
                    if (this.childEvents[i] === event) {
                        return false;
                    }
                }
                this.childEvents.push(event);
                this.addEventListener(event, childBroadcast(event));
            },
            
            addNewPrivateEvent: function (event) {
                var x = 0,
                    y = 0;
                
                if (this.messages[event]) {
                    return false; // event is already added.
                }

                this.messages[event] = []; //to signify it's been added even if not used
                
                //Listen for message on children
                for (x = 0; x < this.entities.length; x++) {
                    if (this.entities[x].messages[event]) {
                        for (y = 0; y < this.entities[x].messages[event].length; y++) {
                            this.addChildEventListener(this.entities[x], event, this.entities[x].messages[event][y].callback, this.entities[x].messages[event][y].scope);
                        }
                    }
                }
            },
            
            updateChildEventListeners: function (entity) {
                this.removeChildEventListeners(entity);
                this.addChildEventListeners(entity);
            },
            
            addChildEventListeners: function (entity) {
                var y     = 0,
                    event = '';
                
                for (event in this.messages) {
                    if (this.messages.hasOwnProperty(event) && entity.messages[event]) {
                        for (y = 0; y < entity.messages[event].length; y++) {
                            this.addChildEventListener(entity, event, entity.messages[event][y].callback, entity.messages[event][y].scope);
                        }
                    }
                }
            },
            
            removeChildEventListeners: function (entity) {
                var i        = 0,
                    events   = null,
                    messages = null,
                    scopes   = null;
                
                if (entity.containerListener) {
                    events   = entity.containerListener.events;
                    messages = entity.containerListener.messages;
                    scopes   = entity.containerListener.scopes;
                    for (i = 0; i < events.length; i++) {
                        this.removeChildEventListener(entity, events[i], messages[i], scopes[i]);
                    }
                    entity.containerListener = null;
                }
            },
            
            addChildEventListener: function (entity, event, callback, scope) {
                if (!entity.containerListener) {
                    entity.containerListener = {
                        events: [],
                        messages: [],
                        scopes: []
                    };
                }
                entity.containerListener.events.push(event);
                entity.containerListener.messages.push(callback);
                entity.containerListener.scopes.push(scope);
                this.bind(event, callback, scope);
            },
            
            removeChildEventListener: function (entity, event, callback, scope) {
                var i        = 0,
                    events   = entity.containerListener.events,
                    messages = entity.containerListener.messages,
                    scopes   = entity.containerListener.scopes;
                
                for (i = 0; i < events.length; i++) {
                    if ((events[i] === event) && (!callback || (messages[i] === callback)) && (!scope || (scopes[i] === scope))) {
                        this.unbind(event, messages[i], scopes[i]);
                    }
                }
            },

            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.entities.length; i++) {
                    this.removeChildEventListeners(this.entities[i]);
                    this.entities[i].destroy();
                }
                this.entities.length = 0;
            }
        },
        
        publicMethods: {
            getEntityById: function (id) {
                var i         = 0,
                    selection = null;
                
                for (i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].id === id) {
                        return this.entities[i];
                    }
                    if (this.entities[i].getEntityById) {
                        selection = this.entities[i].getEntityById(id);
                        if (selection) {
                            return selection;
                        }
                    }
                }
                return undefined;
            },

            getEntitiesByType: function (type) {
                var i         = 0,
                    selection = null,
                    entities  = [];
                
                for (i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].type === type) {
                        entities.push(this.entities[i]);
                    }
                    if (this.entities[i].getEntitiesByType) {
                        selection = this.entities[i].getEntitiesByType(type);
                        if (selection) {
                            entities = entities.concat(selection);
                        }
                    }
                }
                return entities;
            },

            /**
             * This method adds an entity to the owner's group. If an entity definition or a reference to an entity definition is provided, the entity is created and then added to the owner's group.
             *
             * @method addEntity
             * @param newEntity {platypus.Entity|Object|String} Specifies the entity to add. If an object with a "type" property is provided or a String is provided, this component looks up the entity definition to create the entity.
             * @param [newEntity.type] {String} If an object with a "type" property is provided, this component looks up the entity definition to create the entity.
             * @param [newEntity.properties] {Object} A list of key/value pairs that sets the initial properties on the new entity.
             * @return {platypus.Entity} The entity that was just added.
             */
            addEntity: function (newEntity) {
                var entity = null,
                    x = 0;
                
                if (newEntity instanceof platypus.Entity) {
                    entity = newEntity;
                } else {
                    if (typeof newEntity === 'string') {
                        entity = new platypus.Entity(platypus.game.settings.entities[newEntity]);
                    } else if (newEntity.id) {
                        entity = new platypus.Entity(newEntity);
                    } else {
                        entity = new platypus.Entity(platypus.game.settings.entities[newEntity.type], newEntity);
                    }
                    this.owner.triggerEvent('entity-created', entity);
                }
                
                entity.parent = this.owner;
                entity.triggerEvent('adopted', entity);
                
                for (x = 0; x < this.entities.length; x++) {
                    if (!entity.triggerEvent('peer-entity-added', this.entities[x])) {
                        break;
                    }
                }
                this.triggerEventOnChildren('peer-entity-added', entity);

                this.addChildEventListeners(entity);
                this.entities.push(entity);
                this.owner.triggerEvent('child-entity-added', entity);
                return entity;
            },
            
            removeEntity: function (entity) {
                var x = 0;

                for (x = 0; x < this.entities.length; x++) {
                    if (this.entities[x] === entity) {
                        this.removeChildEventListeners(entity);
                        this.entities.splice(x, 1);
                        this.triggerEventOnChildren('peer-entity-removed', entity);
                        this.owner.triggerEvent('child-entity-removed', entity);
                        entity.destroy();
                        entity.parent = null;
                        return entity;
                    }
                }
                return false;
            },
            
            triggerEventOnChildren: function (event, message, debug) {
                if (!this.messages[event]) {
                    this.addNewPrivateEvent(event);
                }
                return this.triggerEvent(event, message, debug);
            },
            triggerOnChildren: function (event, message, debug) {
                if (!this.messages[event]) {
                    this.addNewPrivateEvent(event);
                }
                return this.trigger(event, message, debug);
            }
        }
    }, platypus.Messenger);
}());

//##############################################################################
// EntityController.js
//##############################################################################

/**
# COMPONENT **EntityController**
This component listens for input messages triggered on the entity and updates the state of any controller inputs it is listening for. It then broadcasts messages on the entity corresponding to the input it received.

## Dependencies:
- [[Handler-Controller]] (on entity's parent) - This component listens for a controller "tick" message in order to trigger messages regarding the state of its inputs.

## Messages

### Listens for:
- **handle-controller** - On each `handle-controller` message, this component checks its list of actions and if any of their states are currently true or were true on the last call, that action message is triggered.
- **mousedown** - This message triggers a new message on the entity that includes what button on the mouse was pressed: "mouse:left-button:down", "mouse:middle-button:down", or "mouse:right-button:down".
  - @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mouseup** - This message triggers a new message on the entity that includes what button on the mouse was released: "mouse:left-button:up", "mouse:middle-button:up", or "mouse:right-button:up".
  - @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mousemove** - Updates mouse action states with whether the mouse is currently over the entity.
  - @param message.over (boolean) - Whether the mouse is over the input entity.
- **pause-controls** - This message will stop the controller from triggering messages until "unpause-controls" is triggered on the entity.
- **unpause-controls** - This message will allow the controller to trigger messages until "pause-controls" is triggered on the entity.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, sets the appropriate state and broadcasts the associated message on the next `handle-controller` message. These messages come in pairs and typically have the form of "keyname:up" and "keyname:down" specifying the current state of the input.
  
### Local Broadcasts:
- **mouse:mouse-left:down, mouse:mouse-left:up, mouse:mouse-middle:down, mouse:mouse-middle:up, mouse:mouse-right:down, mouse:mouse-right:up** - This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
  - @param message (DOM Event object) - The original mouse event object is passed along with the control message.
- **north, north-northeast, northeast, east-northeast, east, east-southeast, southeast, south-southeast, south, south-southwest, southwest, west-southwest, west, west-northwest, northwest, north-northwest** - If the soft joystick is enabled on this component, it will broadcast these directional messages if the joystick is in use.
  - @param message (DOM Event object) - Mirrors the mouse event object that moved the joystick.
- **joystick-orientation** - If the soft joystick is enabled on this component, this message will trigger to provide the current orientation of the joystick.
  - @param orientation (number) - A number in radians representing the orientation of the joystick.
- **[Messages specified in definition]** - Broadcasts active states using the JSON-defined message on each `handle-controller` message. Active states include `pressed` being true or `released` being true. If both of these states are false, the message is not broadcasted.
  - @param message.pressed (boolean) - Whether the current input is active.
  - @param message.released (boolean) - Whether the current input was active last tick but is no longer active.
  - @param message.triggered (boolean) - Whether the current input is active but was not active last tick.
  - @param message.over (boolean) - Whether the mouse was over the entity when pressed, released, or triggered. This value is always false for non-mouse input messages.

## JSON Definition:
    {
      "type": "EntityController",
      
      "paused": true,
      // Optional. Whether input controls should start deactivated. Default is false.
      
      "controlMap":{
      // Required. Use the controlMap property object to map inputs to messages that should be triggered. At least one control mapping should be included. The following are a few examples:
      
        "key:x": "run-left",
        // This causes an "x" keypress to fire "run-left" on the entity. For a full listing of key names, check out the `HandlerController` component.
        
        "button-pressed": "throw-block",
        // custom input messages can be fired on this entity from other entities, allowing for on-screen input buttons to run through the same controller channel as other inputs.
        
        "mouse:left-button"
        // The controller can also handle mouse events on the entity if the entity's render component triggers mouse events on the entity (for example, the `RenderSprite` component).
      },
      
      "joystick":{
      // Optional. Determines whether this entity should listen for mouse events to trigger directional events. Can be set simply to "true" to accept all joystick defaults
          
          "directions": 8,
          // Optional: 4, 8, or 16. Determines how many directions to broadcast. Default is 4 ("north", "east", "south", and "west").
          
          "innerRadius": 30,
          // Optional. Number determining how far the mouse must be from the entity's position before joystick events should be triggered. Default is 0.
          
          "outerRadius": 60
          // Optional. Number determining how far the mouse can move away from the entity's position before the joystick stops triggering events. Default is Infinity.
      }
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var distance = function (origin, destination) {
            var x = destination.x - origin.x,
                y = destination.y - origin.y;

            return Math.sqrt((x * x) + (y * y));
        },
        angle = function (origin, destination, distance) {
            var x      = destination.x - origin.x,
                y      = destination.y - origin.y,
                a      = 0,
                circle = Math.PI * 2;

            if (!distance) {
                return a;
            }

            a = Math.acos(x / distance);
            if (y < 0) {
                a = circle - a;
            }
            return a;
        },
        directions = [null, null, null, null, //joystick directions
                ['east', 'south', 'west', 'north'], null, null, null,
                ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'], null, null, null, null, null, null, null,
                ['east', 'east-southeast', 'southeast', 'south-southeast', 'south', 'south-southwest', 'southwest', 'west-southwest', 'west', 'west-northwest', 'northwest', 'north-northwest', 'north', 'north-northeast', 'northeast', 'east-northeast']
            ],
        mouseMap = ['left-button', 'middle-button', 'right-button'],
        State = function (event, trigger) {
            this.event = event;
            this.trigger = trigger;
            this.filters = false;
            this.current = false;
            this.last    = false;
            this.state   = false;
            this.stateSummary = {
                pressed:   false,
                released:  false,
                triggered: false,
                over:      false
            };
        },
        createUpHandler = function (state) {
            var i = 0;
            
            if (Array.isArray(state)) {
                return function (value) {
                    for (i = 0; i < state.length; i++) {
                        state[i].state = false;
                    }
                };
            } else {
                return function (value) {
                    state.state = false;
                };
            }
        },
        createDownHandler = function (state) {
            var i = 0;
            
            if (Array.isArray(state)) {
                return function (value) {
                    for (i = 0; i < state.length; i++) {
                        state[i].current = true;
                        state[i].state   = true;
                        if (value && (typeof (value.over) !== 'undefined')) {
                            state[i].over = value.over;
                        }
                    }
                };
            } else {
                return function (value) {
                    state.current = true;
                    state.state   = true;
                    if (value && (typeof (value.over) !== 'undefined')) {
                        state.over = value.over;
                    }
                };
            }
        },
        addActionState = function (actionList, action, trigger, requiredState) {
            var actionState = actionList[action]; // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
            if (!actionState) {                                // Otherwise create a new state storage object
                actionState = actionList[action] = new State(action, trigger);
            }
            if (requiredState) {
                actionState.setFilter(requiredState);
            }
            return actionState;
        },
        stateProto = State.prototype;
    
    stateProto.update = function () {
        var i = 0;
        
        if (this.current || this.last) {
            this.stateSummary.pressed   = this.current;
            this.stateSummary.released  = !this.current && this.last;
            this.stateSummary.triggered = this.current && !this.last;
            this.stateSummary.over      = this.over;
            if (this.filters) {
                for (i = 0; i < this.filters.length; i++) {
                    if (this.stateSummary[this.filters[i]]) {
                        this.trigger(this.event, this.stateSummary);
                    }
                }
            } else {
                this.trigger(this.event, this.stateSummary);
            }
        }
        
        this.last    = this.current;
        this.current = this.state;
    };
    
    stateProto.setFilter = function (filter) {
        if (!this.filters) {
            this.filters = [filter];
        } else {
            this.filters.push(filter);
        }
        return this;
    };

    stateProto.isPressed = function () {
        return this.current;
    };
    
    stateProto.isTriggered = function () {
        return this.current && !this.last;
    };

    stateProto.isReleased = function () {
        return !this.current && this.last;
    };

    return platypus.createComponentClass({
        id: 'EntityController',
        
        constructor: function (definition) {
            var i           = 0,
                j           = 0,
                k           = 0,
                key         = '',
                actionState = null,
                self        = this,
                trigger     = function (event, obj) {
                    if (!self.paused) {
                        self.owner.trigger(event, obj);
                    }
                };
            
            this.paused = definition.paused || false;
            
            if (definition && definition.controlMap) {
                this.owner.controlMap = definition.controlMap; // this is used and expected by the HandlerController to handle messages not covered by key and mouse inputs.
                this.actions  = {};
                for (key in definition.controlMap) {
                    if (definition.controlMap.hasOwnProperty(key)) {
                        if (typeof definition.controlMap[key] === 'string') {
                            actionState = addActionState(this.actions, definition.controlMap[key], trigger);
                        } else {
                            actionState = [];
                            if (Array.isArray(definition.controlMap[key])) {
                                for (i = 0; i < definition.controlMap[key].length; i++) {
                                    actionState[i] = addActionState(this.actions, definition.controlMap[key][i], trigger);
                                }
                            } else {
                                k = 0;
                                for (j in definition.controlMap[key]) {
                                    if (definition.controlMap[key].hasOwnProperty(j)) {
                                        if (typeof definition.controlMap[key][j] === 'string') {
                                            actionState[k] = addActionState(this.actions, definition.controlMap[key][j], trigger, j);
                                            k += 1;
                                        } else {
                                            for (i = 0; i < definition.controlMap[key][j].length; i++) {
                                                actionState[k] = addActionState(this.actions, definition.controlMap[key][j][i], trigger, j);
                                                k += 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        this.addEventListener(key + ':up', createUpHandler(actionState));
                        this.addEventListener(key + ':down', createDownHandler(actionState));
                    }
                }
            }
            
            if (definition.joystick) {
                this.joystick = {};
                this.joystick.directions  = definition.joystick.directions  || 4; // 4 = n,e,s,w; 8 = n,ne,e,se,s,sw,w,nw; 16 = n,nne,ene,e...
                this.joystick.handleEdge  = definition.joystick.handleEdge  || false;
                this.joystick.innerRadius = definition.joystick.innerRadius || 0;
                this.joystick.outerRadius = definition.joystick.outerRadius || Infinity;
            }
        },
        
        events: {
            'handle-controller': function () {
                var action    = '';
                
                if (this.actions) {
                    for (action in this.actions) {
                        if (this.actions.hasOwnProperty(action)) {
                            this.actions[action].update();
                        }
                    }
                }
            },
            
            'mousedown': function (value) {
                this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':down', value.event);
                if (this.joystick) {
                    this.owner.trigger('joystick:down', value.event);
                    this.handleJoy(value);
                }
            },
            
            'pressup': function (value) {
                this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':up', value.event);
                if (this.joystick) {
                    this.owner.trigger('joystick:up', value.event);
                    this.handleJoy(value);
                }
            },
            
            'pressmove': function (value) {
                if (this.actions['mouse:left-button']   && (this.actions['mouse:left-button'].over !== value.over)) {
                    this.actions['mouse:left-button'].over = value.over;
                }
                if (this.actions['mouse:middle-button'] && (this.actions['mouse:middle-button'].over !== value.over)) {
                    this.actions['mouse:middle-button'].over = value.over;
                }
                if (this.actions['mouse:right-button']  && (this.actions['mouse:right-button'].over !== value.over)) {
                    this.actions['mouse:right-button'].over = value.over;
                }
                if (this.joystick) {
                    this.handleJoy(value);
                }
            },
            
            'pause-controls': function () {
                this.paused = true;
            },
            
            'unpause-controls': function () {
                this.paused = false;
            }
        },
        
        methods: {
            handleJoy: function (event) {
                // The following translate mouse and touch events into messages that this controller can handle in a systematic way
                var segment     = Math.PI / (this.joystick.directions / 2),
                    dist        = distance(this.owner, event),
                    orientation = 0,
                    direction   = '',
                    accuracy    = '';
                
                if ((dist > this.joystick.outerRadius) || (dist < this.joystick.innerRadius)) {
                    return;
                } else if (!this.paused) {
                    orientation = angle(this.owner, event, dist);
                    direction   = directions[this.joystick.directions][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
                    
                    if (this.joystick.handleEdge) {
                        segment  = Math.PI / this.joystick.directions;
                        accuracy = directions[this.joystick.directions * 2][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
                        if (accuracy !== direction) {
                            this.owner.trigger(accuracy.replace(direction, '').replace('-', ''), event);  //There's probably a better way to perform this, but the current method is functional. - DDD
                        }
                    }
                    this.owner.trigger(direction, event);
                    this.owner.trigger("joystick-orientation", orientation);
                }
            }
        }
    });
}());

//##############################################################################
// HandlerCollision.js
//##############################################################################

/**
 * This component checks for collisions between entities which typically have either a [[Collision-Tiles]] component for tile maps or a [[Collision-Basic]] component for other entities. It uses `EntityContainer` component messages if triggered to add to its collision list and also listens for explicit add/remove messages (useful in the absence of an `EntityContainer` component).
 * 
 * @namespace platypus.components
 * @class HandlerCollision
 * @uses Component
 */
 
// Requires: ["../CollisionShape.js", "../AABB.js", "../Vector.js", "../CollisionDataContainer.js"]
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    //set here to make them reusable objects
    
    /**
     * When an entity collides with an entity of a listed collision-type, this message is triggered on the entity. * is the other entity's collision-type.
     * 
     * @event 'hit-by-*'
     * @param collision {Object}
     * @param collision.entity {Entity} The entity with which the collision occurred.
     * @param collision.type {String} The collision type of the other entity.
     * @param collision.shape {CollisionShape} This is the shape of the other entity that caused the collision.
     * @param collision.x {number} Returns -1, 0, or 1 indicating on which side of this entity the collision occurred: left, neither, or right respectively.
     * @param collision.y {number} Returns -1, 0, or 1 indicating on which side of this entity the collision occurred: top, neither, or bottom respectively.
     */
    var triggerMessage = {
            entity: null,
            type:   null,
            x: 0,
            y: 0,
            hitType: null,
            myType: null
        },
        entityCollisionDataContainer = new platypus.CollisionDataContainer(),
        isAABBCollision = function (boxX, boxY) {
            if ((boxX.left       >=  boxY.right)  ||
                    (boxX.right  <=  boxY.left)   ||
                    (boxX.top    >=  boxY.bottom) ||
                    (boxX.bottom <=  boxY.top)) {
                return false;
            }
            return true;
        },
        shapeCollision = function (shapeA, shapeB) {
            var distSquared      = 0,
                radiiSquared     = 0,
                circle           = null,
                rect             = null,
                shapeDistanceX   = 0,
                shapeDistanceY   = 0,
                rectAabb         = null,
                cornerDistanceSq = 0;
            
            if (shapeA.type === 'rectangle' && shapeB.type === 'rectangle') {
                return true;
            } else if (shapeA.type === 'circle' && shapeB.type === 'circle') {
                distSquared = Math.pow((shapeA.x - shapeB.x), 2) + Math.pow((shapeA.y - shapeB.y), 2);
                radiiSquared = Math.pow((shapeA.radius + shapeB.radius), 2);
                if (distSquared <= radiiSquared) {
                    return true;
                }
            } else if ((shapeA.type === 'circle' && shapeB.type === 'rectangle') || (shapeA.type === 'rectangle' && shapeB.type === 'circle')) {
                if (shapeA.type === 'circle') {
                    circle = shapeA;
                    rect = shapeB;
                } else {
                    circle = shapeB;
                    rect = shapeA;
                }
                rectAabb = rect.getAABB();

                shapeDistanceX = Math.abs(circle.x - rect.x);
                shapeDistanceY = Math.abs(circle.y - rect.y);

                if (shapeDistanceX >= (rectAabb.halfWidth + circle.radius)) { return false; }
                if (shapeDistanceY >= (rectAabb.halfHeight + circle.radius)) { return false; }

                if (shapeDistanceX < (rectAabb.halfWidth)) { return true; }
                if (shapeDistanceY < (rectAabb.halfHeight)) { return true; }

                cornerDistanceSq = Math.pow((shapeDistanceX - rectAabb.halfWidth), 2) + Math.pow((shapeDistanceY - rectAabb.halfHeight), 2);
                if (cornerDistanceSq < Math.pow(circle.radius, 2)) {
                    return true;
                }
            }
            return false;
        };
    
    return platypus.createComponentClass({
        id: 'HandlerCollision',
        
        constructor: function (definition) {
            this.entitiesByType = {};
            this.entitiesByTypeLive = {};
            this.allEntities = [];
            this.solidEntitiesLive = [];
            this.softEntitiesLive = [];
            this.allEntitiesLive = [];
            this.groupsLive = [];
            this.nonColliders = [];
            
            this.terrain = undefined;
            this.aabb     = new platypus.AABB(this.owner.x, this.owner.y);
            this.prevAABB = new platypus.AABB(this.owner.x, this.owner.y);
            this.owner.previousX = this.owner.previousX || this.owner.x;
            this.owner.previousY = this.owner.previousY || this.owner.y;
            
            this.updateLiveList = true;
            this.cameraLogicAABB = new platypus.AABB(0, 0);
            this.cameraCollisionAABB = new platypus.AABB(0, 0);
            
            this.timeElapsed = {
                name: 'Col',
                time: 0
            };
        },
        
        events: {
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             * 
             * @method 'child-entity-added'
             * @param entity {Entity} The entity to be added.
             */
            "child-entity-added": function (entity) {
                if (!entity.collideOff) {
                    this.addCollisionEntity(entity);
                }
            },
            
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             * 
             * @method 'add-collision-entity'
             * @param entity {Entity} The entity to be added.
             */
            "add-collision-entity": function (entity) {
                this.addCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             * 
             * @method 'child-entity-removed'
             * @param message ([[Entity]] object) - The entity to be removed.
             */
            "child-entity-removed": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             * 
             * @method 'remove-collision-entity'
             * @param message ([[Entity]] object) - The entity to be removed.
             */
            "remove-collision-entity": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * This message causes the component to go through the entities and check for collisions.
             * 
             * @method 'check-collision-group'
             * @param options {Object}
             * @param [options.camera] {Object} Specifies a region in which to check for collisions. Expects the camera object to contain the following properties: top, left, width, height, and buffer.
             */
            "check-collision-group": function (resp) {
                var time = new Date().getTime(); //TODO: TML - Why create this in here?
                
                if (resp.camera) {
                    this.checkCamera(resp.camera);
                }/*
                if (resp.movers) {
                    this.checkMovers(resp.camera, resp.movers);
                }*/

                this.timeElapsed.name = 'Col-Cam';
                this.timeElapsed.time = new Date().getTime() - time;
                platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                time += this.timeElapsed.time;

                this.prepareCollisions(resp);

                this.timeElapsed.name = 'Col-Prep';
                this.timeElapsed.time = new Date().getTime() - time;
                platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                time += this.timeElapsed.time;

                this.checkGroupCollisions();

                this.timeElapsed.name = 'Col-Group';
                this.timeElapsed.time = new Date().getTime() - time;
                platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                time += this.timeElapsed.time;

                this.checkSolidCollisions();

                this.timeElapsed.name = 'Col-Solid';
                this.timeElapsed.time = new Date().getTime() - time;
                platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                time += this.timeElapsed.time;

                this.resolveNonCollisions(resp);

                this.timeElapsed.name = 'Col-None';
                this.timeElapsed.time = new Date().getTime() - time;
                platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                time += this.timeElapsed.time;

                this.checkSoftCollisions(resp);

                this.timeElapsed.name = 'Col-Soft';
                this.timeElapsed.time = new Date().getTime() - time;
                platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                time += this.timeElapsed.time;
            }
        },
        
        methods: {
            addCollisionEntity: function (entity) {
                var i     = 0,
                    types = entity.collisionTypes;
                
                if ((entity.type === 'tile-layer') || (entity.type === 'collision-layer')) { //TODO: probably should have these reference a required function on the obj, rather than an explicit type list since new collision entity map types could be created - DDD
                    this.terrain = entity;
                    this.updateLiveList = true;
                } else {
                    if (types) {
                        for (i = 0; i < types.length; i++) {
                            if (!this.entitiesByType[types[i]]) {
                                this.entitiesByType[types[i]] = [];
                                this.entitiesByTypeLive[types[i]] = [];
                            }
                            this.entitiesByType[types[i]][this.entitiesByType[types[i]].length] = entity;
                        }
                        if (!entity.immobile) {
                            this.allEntities[this.allEntities.length] = entity;
                        }
                        this.updateLiveList = true;
                    }
                }
            },

            removeCollisionEntity: function (entity) {
                var x     = 0,
                    i     = 0,
                    j     = 0,
                    types = entity.collisionTypes;

                if (types) {
                    for (i = 0; i < types.length; i++) {
                        for (x in this.entitiesByType[types[i]]) {
                            if (this.entitiesByType[types[i]][x] === entity) {
                                this.entitiesByType[types[i]].splice(x, 1);
                                break;
                            }
                        }
                    }
                    
                    if (!entity.immobile) {
                        for (j = 0; j < this.allEntities.length; j++) {
                            if (this.allEntities[j] === entity) {
                                this.allEntities.splice(j, 1);
                                break;
                            }
                        }
                    }
                    this.updateLiveList = true;
                }
            },
            
            checkCamera: (function () {
                var groupSortBySize = function (a, b) {
                    return a.collisionGroup.getAllEntities() - b.collisionGroup.getAllEntities();
                };
                return function (camera, movers) {
                    var i        = 0,
                        j        = 0,
                        length   = 0,
                        list     = null,
                        all      = null,
                        softs    = null,
                        solids   = null,
                        groups   = null,
                        width    = camera.width,
                        height   = camera.height,
                        x        = camera.left + width  / 2,
                        y        = camera.top  + height / 2,
                        buffer   = camera.buffer,
                        entities      = null,
                        entity        = null,
                        check         = isAABBCollision,
                        aabbLogic     = this.cameraLogicAABB,
                        aabbCollision = this.cameraCollisionAABB,
                        types = null;
                    
                    // store buffered size since the actual width x height is not used below.
                    width  += buffer * 2;
                    height += buffer * 2;
                    
                    if (this.updateLiveList || !aabbLogic.matches(x, y, width, height)) {
                        
                        aabbLogic.setAll(x, y, width, height);
                        
                        // Removing this line since it allows logic to run without collision turned on. Not certain why, but can turn this back on and trace down the issue if optimization is necessary. - DDD 12/31/2014
                        //if (this.updateLiveList || !aabbCollision.contains(aabbLogic)) { //if the camera has not moved beyond the original buffer, we do not continue these calculations
                        this.updateLiveList = false;

                        all = this.allEntitiesLive;
                        all.length = 0;

                        solids = this.solidEntitiesLive;
                        solids.length = 0;

                        softs = this.softEntitiesLive;
                        softs.length = 0;

                        groups = this.groupsLive;
                        groups.length = 0;

                        length = this.allEntities.length;// console.log(length);
                        for (i = 0; i < length; i++) {
                            entity = this.allEntities[i];
                            if (entity.alwaysOn || entity.checkCollision || check(entity.getAABB(), aabbLogic)) {
                                entity.checkCollision = false;  //TML - This should be here. I think. :)
                                all[all.length] = entity;

                                types = entity.collisionTypes;
                                if (entity !== this.owner) {
                                    for (j = 0; j < types.length; j++) {
                                        if (entity.solidCollisions[types[j]].length) {
                                            solids[solids.length] = entity;
                                            break;
                                        }
                                    }
                                }
                                for (j = 0; j < types.length; j++) {
                                    if (entity.softCollisions[types[j]].length) {
                                        softs[softs.length] = entity;
                                        break;
                                    }
                                }

                                if (entity.collisionGroup) {
                                    groups.push(entity);
                                }
                            }
                        }

                        groups.sort(groupSortBySize);

                        // add buffer again to capture stationary entities along the border that may be collided against 
                        aabbCollision.setAll(x, y, width + buffer * 2, height + buffer * 2);

                        for (i in this.entitiesByType) {
                            if (this.entitiesByType.hasOwnProperty(i)) {
                                entities = this.entitiesByType[i];
                                list = this.entitiesByTypeLive[i];
                                list.length = 0;
                                length = entities.length;
                                for (j = 0; j < length; j++) {
                                    entity = entities[j];
                                    if (entity.alwaysOn  || check(entity.getAABB(), aabbCollision)) {
                                        list[list.length] = entity;
                                    }
                                }
                            }
                        }
                        //}
                    }
                };
            }()),
            
            prepareCollisions: function (resp) {
                var x      = 0,
                    entity = null;
                
                this.nonColliders.length = 0;
                
                /**
                 * This message is triggered on collision entities to make sure their axis-aligned bounding box is prepared for collision testing.
                 * 
                 * @event 'prepare-for-collision'
                 * @param tick {Object} Object containing information about the current logic step.
                 */
                for (x = this.allEntitiesLive.length - 1; x > -1; x--) {
                    entity = this.allEntitiesLive[x];
                    entity.triggerEvent('prepare-for-collision', resp);
                    if (!entity.collides) {
                        this.nonColliders.push(entity);
                    }
                }
            },
            
            resolveNonCollisions: function (resp) {
                var x      = 0,
                    entity = null,
                    xy     = {
                        position: new platypus.Vector(),
                        relative: false
                    };
                
                /**
                 * This message is triggered on an entity that has been repositioned due to a solid collision.
                 * 
                 * @event 'relocate-entity'
                 * @param object {Object}
                 * @param object.position {Vector} The relocated position of the entity.
                 */
                for (x = this.nonColliders.length - 1; x > -1; x--) {
                    entity = this.nonColliders[x];
                    xy.position.set(entity.position);
                    entity.trigger('relocate-entity', xy);
                }
            },
            
            checkGroupCollisions:  (function () {
                var triggerCollisionMessages = function (entity, otherEntity, thisType, thatType, x, y, hitType, vector) {
                    
                    triggerMessage.entity    = otherEntity;
                    triggerMessage.myType    = thisType;
                    triggerMessage.type      = thatType;
                    triggerMessage.x         = x;
                    triggerMessage.y         = y;
                    triggerMessage.direction = vector;
                    triggerMessage.hitType   = hitType;
                    entity.triggerEvent('hit-by-' + thatType, triggerMessage);
                    
                    if (otherEntity) {
                        triggerMessage.entity    = entity;
                        triggerMessage.type      = thisType;
                        triggerMessage.myType    = thatType;
                        triggerMessage.x         = -x;
                        triggerMessage.y         = -y;
                        triggerMessage.direction = vector.getInverse();
                        triggerMessage.hitType   = hitType;
                        otherEntity.triggerEvent('hit-by-' + thisType, triggerMessage);
                    }

                };

                return function () {
                    var x           = 0,
                        i           = 0,
                        entities    = this.groupsLive,
                        fmi         = new platypus.Vector(),
                        messageData = null;
                    
                    for (x = entities.length - 1; x > -1; x--) {
                        if (entities[x].collisionGroup.getSize() > 1) {
                            entityCollisionDataContainer.reset();
                            fmi.set(0, 0, 0);
                            fmi = this.checkSolidEntityCollision(entities[x], entities[x].collisionGroup, entityCollisionDataContainer, fmi);
                            
                            for (i = 0; i < entityCollisionDataContainer.xCount; i++) {
                                messageData = entityCollisionDataContainer.getXEntry(i);
                                triggerCollisionMessages(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, messageData.direction, 0, 'solid', messageData.vector);
                            }
                            
                            for (i = 0; i < entityCollisionDataContainer.yCount; i++) {
                                messageData = entityCollisionDataContainer.getYEntry(i);
                                triggerCollisionMessages(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, 0, messageData.direction, 'solid', messageData.vector);
                            }
                        }
                    }
                };
            }()),
            
            checkSolidCollisions: (function () {
                var triggerCollisionMessages = function (entity, otherEntity, thisType, thatType, x, y, hitType, vector) {
                    
                    triggerMessage.entity    = otherEntity;
                    triggerMessage.myType    = thisType;
                    triggerMessage.type      = thatType;
                    triggerMessage.x         = x;
                    triggerMessage.y         = y;
                    triggerMessage.direction = vector;
                    triggerMessage.hitType   = hitType;
                    entity.triggerEvent('hit-by-' + thatType, triggerMessage);
                    
                    if (otherEntity) {
                        triggerMessage.entity    = entity;
                        triggerMessage.type      = thisType;
                        triggerMessage.myType    = thatType;
                        triggerMessage.x         = -x;
                        triggerMessage.y         = -y;
                        triggerMessage.direction = vector.getInverse();
                        triggerMessage.hitType   = hitType;
                        otherEntity.triggerEvent('hit-by-' + thisType, triggerMessage);
                    }

                };

                return function () {
                    var x           = 0,
                        i           = 0,
                        messageData = null,
                        entities    = this.solidEntitiesLive,
                        fmi         = new platypus.Vector();
                    
                    for (x = entities.length - 1; x > -1; x--) {
                        entityCollisionDataContainer.reset();
                        fmi.set(0, 0, 0);
                        fmi = this.checkSolidEntityCollision(entities[x], entities[x], entityCollisionDataContainer, fmi);
                        
                        for (i = 0; i < entityCollisionDataContainer.xCount; i++) {
                            messageData = entityCollisionDataContainer.getXEntry(i);
                            triggerCollisionMessages(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, messageData.direction, 0, 'solid', messageData.vector);
                        }
                        
                        for (i = 0; i < entityCollisionDataContainer.yCount; i++) {
                            messageData = entityCollisionDataContainer.getYEntry(i);
                            triggerCollisionMessages(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, 0, messageData.direction, 'solid', messageData.vector);
                        }
                    }
                };
            }()),
            
            checkSolidEntityCollision: function (ent, entityOrGroup, collisionDataCollection, xyInfo) {
                var steps             = 0,
                    step              = 0,
                    i                 = 0,
                    finalMovementInfo = xyInfo,
                    entityDeltaX      = ent.x - ent.previousX,
                    entityDeltaY      = ent.y - ent.previousY,
                    aabb              = null,
                    dX                = 0,
                    dY                = 0,
                    sW                = Infinity,
                    sH                = Infinity,
                    collisionTypes    = entityOrGroup.getCollisionTypes(),
                    ignoredEntities   = false;
                
                if (entityOrGroup.getSolidEntities) {
                    ignoredEntities = entityOrGroup.getSolidEntities();
                }
                
                finalMovementInfo.set(ent.position);

                if (entityDeltaX || entityDeltaY) {
                    
                    if (ent.bullet) {
                        for (i = 0; i < collisionTypes.length; i++) {
                            aabb = entityOrGroup.getAABB(collisionTypes[i]);
                            sW = Math.min(sW, aabb.width);
                            sH = Math.min(sH, aabb.height);
                        }

                        //Stepping to catch really fast entities - this is not perfect, but should prevent the majority of fallthrough cases.
                        steps = Math.ceil(Math.max(Math.abs(entityDeltaX) / sW, Math.abs(entityDeltaY) / sH));
                        steps = Math.min(steps, 100); //Prevent memory overflow if things move exponentially far.
                        dX    = entityDeltaX / steps;
                        dY    = entityDeltaY / steps;
                    } else {
                        steps = 1;
                        dX    = entityDeltaX;
                        dY    = entityDeltaY;
                    }
                    
                    for (step = 0; step < steps; step++) {
                        entityOrGroup.prepareCollision(ent.previousX + dX, ent.previousY + dY);

                        finalMovementInfo.set(ent.position);
                        
                        finalMovementInfo = this.processCollisionStep(ent, entityOrGroup, ignoredEntities, collisionDataCollection, finalMovementInfo, dX, dY, collisionTypes);
                        
                        
                        if ((finalMovementInfo.x === ent.previousX) && (finalMovementInfo.y === ent.previousY)) {
                            entityOrGroup.relocateEntity(finalMovementInfo, collisionDataCollection);
                            //No more movement so we bail!
                            break;
                        } else {
                            entityOrGroup.relocateEntity(finalMovementInfo, collisionDataCollection);
                        }
                    }
                }
                
                return finalMovementInfo;
            },
            
            processCollisionStep: (function () {
                var sweepAABB     = new platypus.AABB(),
                    includeEntity = function (thisEntity, aabb, otherEntity, otherCollisionType, ignoredEntities) {
                        var i         = 0,
                            otherAABB = otherEntity.getAABB(otherCollisionType);
                        
                        if (otherEntity === thisEntity) {
                            return false;
                        } else if (otherEntity.jumpThrough && (aabb.bottom > otherAABB.top)) {
                            return false;
                        } else if (thisEntity.jumpThrough  && (otherAABB.bottom > aabb.top)) { // This will allow platforms to hit something solid sideways if it runs into them from the side even though originally they were above the top. - DDD
                            return false;
                        } else if (ignoredEntities) {
                            for (i = 0; i < ignoredEntities.length; i++) {
                                if (otherEntity === ignoredEntities[i]) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    };

                return function (ent, entityOrGroup, ignoredEntities, collisionDataCollection, finalMovementInfo, entityDeltaX, entityDeltaY, collisionTypes) {
                    var i = 0,
                        y = 0,
                        z = 0,
                        q = 0,
                        potentialCollision       = false,
                        potentialCollidingShapes = [],
                        previousAABB             = null,
                        currentAABB              = null,
                        collisionType            = null,
                        otherEntity              = null,
                        otherCollisionType       = '',
                        otherShapes              = null,
                        entitiesByTypeLive       = this.getWorldEntities(),
                        otherEntities            = null,
                        terrain                  = this.getWorldTerrain(),
                        solidCollisions          = entityOrGroup.getSolidCollisions();
                    
//                    if (!entityOrGroup.jumpThrough || (entityDeltaY >= 0)) { //TODO: Need to extend jumpthrough to handle different directions and forward motion - DDD
    
                    for (i = 0; i < collisionTypes.length; i++) {
                        //Sweep the full movement of each collision type
                        potentialCollidingShapes[i] = [];
                        collisionType = collisionTypes[i];
                        previousAABB = entityOrGroup.getPreviousAABB(collisionType);
                        currentAABB = entityOrGroup.getAABB(collisionType);

                        sweepAABB.reset();
                        sweepAABB.include(currentAABB);
                        sweepAABB.include(previousAABB);

                        for (y = 0; y < solidCollisions[collisionType].length; y++) {
                            otherCollisionType = solidCollisions[collisionType][y];

                            if (entitiesByTypeLive[otherCollisionType]) {
                                otherEntities = entitiesByTypeLive[otherCollisionType];

                                for (z = 0; z < otherEntities.length; z++) {

                                    //Chop out all the special case entities we don't want to check against.
                                    otherEntity = otherEntities[z];

                                    //Do our sweep check against the AABB of the other object and add potentially colliding shapes to our list.
                                    if (includeEntity(ent, previousAABB, otherEntity, otherCollisionType, ignoredEntities) && (isAABBCollision(sweepAABB, otherEntity.getAABB(otherCollisionType)))) {
                                        otherShapes = otherEntity.getShapes(otherCollisionType);

                                        for (q = 0; q < otherShapes.length; q++) {
                                            //Push the shapes on the end!
                                            potentialCollidingShapes[i].push(otherShapes[q]);
                                        }
                                        potentialCollision = true;
                                    }
                                }
                            } else if (terrain && (otherCollisionType === 'tiles')) {
                                //Do our sweep check against the tiles and add potentially colliding shapes to our list.
                                otherShapes = terrain.getTileShapes(sweepAABB, previousAABB);
                                for (q = 0; q < otherShapes.length; q++) {
                                    //Push the shapes on the end!
                                    potentialCollidingShapes[i].push(otherShapes[q]);
                                    potentialCollision = true;
                                }
                            }
                        }
                    }

                    if (potentialCollision) {
                        finalMovementInfo = this.resolveCollisionPosition(ent, entityOrGroup, finalMovementInfo, potentialCollidingShapes, collisionDataCollection, collisionTypes, entityDeltaX, entityDeltaY);
                    }
    
//                    }
                    
                    return finalMovementInfo;
                };
            }()),
            
            resolveCollisionPosition: (function () {
                var collisionData = new platypus.CollisionData();
                
                return function (ent, entityOrGroup, finalMovementInfo, potentialCollidingShapes, collisionDataCollection, collisionTypes, entityDeltaX, entityDeltaY) {
                    var j = 0;
                    
                    if (entityDeltaX !== 0) {
                        for (j = 0; j < collisionTypes.length; j++) {
                            //Move each collision type in X to find the min X movement
                            collisionData.clear();
                            collisionData = this.findMinAxisMovement(ent, entityOrGroup, collisionTypes[j], 'x', potentialCollidingShapes[j], collisionData);
                            
                            if (collisionData.occurred) {
                                collisionDataCollection.tryToAddX(collisionData);
                            }
                        }
                    }
                    
                    if (collisionDataCollection.xCount > 0) {
                        collisionData.copy(collisionDataCollection.getXEntry(0));
                        finalMovementInfo.x = ent.previousX + collisionData.deltaMovement * collisionData.direction;
                    } else {
                        finalMovementInfo.x = ent.x;
                    }
                    
                    // This moves the previous position of everything so that the check in Y can begin.
                    entityOrGroup.movePreviousX(finalMovementInfo.x);
                    
                    if (entityDeltaY !== 0) {
                        for (j = 0; j < collisionTypes.length; j++) {
                            //Move each collision type in Y to find the min Y movement
                            collisionData.clear();
                            collisionData = this.findMinAxisMovement(ent, entityOrGroup, collisionTypes[j], 'y', potentialCollidingShapes[j], collisionData);
                            
                            if (collisionData.occurred) {
                                collisionDataCollection.tryToAddY(collisionData);
                            }
                        }
                    }
                    
                    if (collisionDataCollection.yCount > 0) {
                        collisionData.copy(collisionDataCollection.getYEntry(0));
                        finalMovementInfo.y = ent.previousY + collisionData.deltaMovement * collisionData.direction;
                    } else {
                        finalMovementInfo.y = ent.y;
                    }
                    
                    return finalMovementInfo;
                };
            }()),
            
            findMinAxisMovement: (function () {
                var shapeCollisionData = new platypus.CollisionData();
                
                return function (ent, entityOrGroup, collisionType, axis, potentialCollidingShapes, bestCollisionData) {
                    //Loop through my shapes of this type vs the colliding shapes and do precise collision returning the shortest movement in axis direction
                    var i          = 0,
                        shapes     = entityOrGroup.getShapes(collisionType),
                        prevShapes = entityOrGroup.getPrevShapes(collisionType);
                    
                    for (i = 0; i < shapes.length; i++) {
                        shapeCollisionData.clear();
                        shapeCollisionData = this.findMinShapeMovementCollision(prevShapes[i], shapes[i], axis, potentialCollidingShapes, shapeCollisionData);
                        
                        if (shapeCollisionData.occurred && !bestCollisionData.occurred) {
                            //if a collision occurred and we haven't already have a collision.
                            bestCollisionData.copy(shapeCollisionData);
                        } else if (shapeCollisionData.occurred && bestCollisionData.occurred && (shapeCollisionData.deltaMovement < bestCollisionData.deltaMovement)) {
                            //if a collision occurred and the diff is smaller than our best diff.
                            bestCollisionData.copy(shapeCollisionData);
                        }
                    }
                    
                    return bestCollisionData;
                };
            }()),
            
            /**
             * Find the earliest point at which this shape collides with one of the potential colliding shapes along this axis.
             * For example, cycles through shapes a, b, and c to find the earliest position:
             * 
             *    O---->   [b]  [a]     [c]
             *    
             *    Returns collision location for:
             *    
             *            O[b]
             * 
             */
            findMinShapeMovementCollision: (function () {

                var storeCollisionData = function (collisionData, direction, position, initial, thisShape, thatShape, vector) {
                        collisionData.occurred = true;
                        collisionData.direction = direction;
                        collisionData.position = position;
                        collisionData.deltaMovement = Math.abs(position - initial);
                        collisionData.aABB = thatShape.getAABB();
                        collisionData.thisShape = thisShape;
                        collisionData.thatShape = thatShape;
                        collisionData.vector = vector.copy();
                    },
                    findAxisCollisionPosition = (function () {
                        var v = new platypus.Vector(),
                            returnInfo = {
                                position: 0,
                                contactVector: v
                            },
                            getMovementDistance = function (currentDistance, minimumDistance) {
                                return Math.sqrt(Math.pow(minimumDistance, 2) - Math.pow(currentDistance, 2));
                            },
                            getCorner = function (circlePos, rectanglePos, half) {
                                var diff = circlePos - rectanglePos;
                                return diff - (diff / Math.abs(diff)) * half;
                            },
                            getOffsetForAABB = function (axis, thisAABB, thatAABB) {
                                if (axis === 'x') {
                                    return thatAABB.halfWidth + thisAABB.halfWidth;
                                } else if (axis === 'y') {
                                    return thatAABB.halfHeight + thisAABB.halfHeight;
                                }
                            },
                            getOffsetForCircleVsAABB = function (axis, circle, rect, moving, direction) {
                                var newAxisPosition = 0;

                                if (axis === 'x') {
                                    if (circle.y >= rect.aABB.top && circle.y <= rect.aABB.bottom) {
                                        return rect.aABB.halfWidth + circle.radius;
                                    } else {
                                        v.y = getCorner(circle.y, rect.y, rect.aABB.halfHeight);
                                        newAxisPosition = rect.aABB.halfWidth + getMovementDistance(v.y, circle.radius);
                                        if (moving === circle) {
                                            v.x = -getCorner(circle.x - direction * newAxisPosition, rect.x, rect.aABB.halfWidth) / 2;
                                            v.y = -v.y;
                                        } else {
                                            v.x = getCorner(circle.x, rect.x - direction * newAxisPosition, rect.aABB.halfWidth) / 2;
                                        }
                                        v.normalize();
                                        return newAxisPosition;
                                    }
                                } else if (axis === 'y') {
                                    if (circle.x >= rect.aABB.left && circle.x <= rect.aABB.right) {
                                        return rect.aABB.halfHeight + circle.radius;
                                    } else {
                                        v.x = getCorner(circle.x, rect.x, rect.aABB.halfWidth);
                                        newAxisPosition = rect.aABB.halfHeight + getMovementDistance(v.x, circle.radius);
                                        if (moving === circle) {
                                            v.x = -v.x;
                                            v.y = -getCorner(circle.y - direction * newAxisPosition, rect.y, rect.aABB.halfWidth) / 2;
                                        } else {
                                            v.y = getCorner(circle.y, rect.y - direction * newAxisPosition, rect.aABB.halfWidth) / 2;
                                        }
                                        v.normalize();
                                        return newAxisPosition;
                                    }
                                }
                            },
                            getOffsetForCircles = function (axis, thisShape, thatShape) {
                                if (axis === 'x') {
                                    return getMovementDistance(thisShape.y - thatShape.y, thisShape.radius + thatShape.radius);
                                } else if (axis === 'y') {
                                    return getMovementDistance(thisShape.x - thatShape.x, thisShape.radius + thatShape.radius);
                                }
                            };

                        return function (axis, direction, thisShape, thatShape) {
                            //Returns the value of the axis at which point thisShape collides with thatShape

                            if (thisShape.type === 'rectangle') {
                                if (thatShape.type === 'rectangle') {
                                    returnInfo.position = thatShape[axis] - direction * getOffsetForAABB(axis, thisShape.getAABB(), thatShape.getAABB());
                                    v.x = 0;
                                    v.y = 0;
                                    v[axis] = direction;
                                    return returnInfo;
                                } else if (thatShape.type === 'circle') {
                                    v.x = 0;
                                    v.y = 0;
                                    v[axis] = direction;
                                    returnInfo.position = thatShape[axis] - direction * getOffsetForCircleVsAABB(axis, thatShape, thisShape, thisShape, direction);
                                    return returnInfo;
                                }
                            } else if (thisShape.type === 'circle') {
                                if (thatShape.type === 'rectangle') {
                                    v.x = 0;
                                    v.y = 0;
                                    v[axis] = direction;
                                    returnInfo.position = thatShape[axis] - direction * getOffsetForCircleVsAABB(axis, thisShape, thatShape, thisShape, direction);
                                    return returnInfo;
                                } else if (thatShape.type === 'circle') {
                                    returnInfo.position = thatShape[axis] - direction * getOffsetForCircles(axis, thisShape, thatShape);
                                    v.x = thatShape.x - thisShape.x;
                                    v.y = thatShape.y - thisShape.y;
                                    v[axis] = thatShape[axis] - returnInfo.position;
                                    v.normalize();
                                    return returnInfo;
                                }
                            }
                        };
                    }());
                
                return function (prevShape, currentShape, axis, potentialCollidingShapes, collisionData) {
                    var i = 0,
                        initialPoint    = prevShape[axis],
                        goalPoint       = currentShape[axis],
                        translatedShape = prevShape,
                        direction       = ((initialPoint < goalPoint) ? 1 : -1),
                        position        = goalPoint,
                        collisionInfo   = null,
                        finalPosition   = goalPoint;
                    
                    if (initialPoint !== goalPoint) {
                        if (axis === 'x') {
                            translatedShape.moveX(goalPoint);
                        } else if (axis === 'y') {
                            translatedShape.moveY(goalPoint);
                        }
                        
                        for (i = 0; i < potentialCollidingShapes.length; i++) {
                            position = goalPoint;
                            if (isAABBCollision(translatedShape.getAABB(), potentialCollidingShapes[i].getAABB())) { //TML - Could potentially shove this back into the rectangle shape check, but I'll leave it here.
                                if (shapeCollision(translatedShape, potentialCollidingShapes[i])) {
                                    collisionInfo = findAxisCollisionPosition(axis, direction, translatedShape, potentialCollidingShapes[i]);
                                    position = collisionInfo.position;
                                    
                                    if (direction > 0) {
                                        if (position < finalPosition) {
                                            if (position < initialPoint) { // Reality check: I think this is necessary due to floating point inaccuracies. - DDD
                                                position = initialPoint;
                                            }
                                            finalPosition = position;
                                            storeCollisionData(collisionData, direction, finalPosition, initialPoint, currentShape, potentialCollidingShapes[i], collisionInfo.contactVector);
                                        }
                                    } else {
                                        if (position > finalPosition) {
                                            if (position > initialPoint) { // Reality check: I think this is necessary due to floating point inaccuracies. - DDD
                                                position = initialPoint;
                                            }
                                            finalPosition = position;
                                            storeCollisionData(collisionData, direction, finalPosition, initialPoint, currentShape, potentialCollidingShapes[i], collisionInfo.contactVector);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return collisionData;
                };
            }()),
            
            checkSoftCollisions: function (resp) {
                var x = 0,
                    trigger = function (ent) {
                        return function (collision) {
                            ent.trigger('hit-by-' + collision.type, collision);
                        };
                    };

                for (x = 0; x < this.softEntitiesLive.length; x++) {
                    this.checkEntityForSoftCollisions(this.softEntitiesLive[x], this.getWorldEntities(), trigger(this.softEntitiesLive[x]));
                }
            },
            
            checkEntityForSoftCollisions: function (ent, entitiesByTypeLive, callback) {
                var otherEntity = null,
                    message = triggerMessage,
                    i   = 0,
                    j    = 0,
                    k    = 0,
                    y   = 0,
                    z   = 0,
                    checkAABBCollision = isAABBCollision,
                    softCollisions = null,
                    otherEntities  = null,
                    otherCollisionType = null,
                    shapes = null,
                    otherShapes = null,
                    collisionFound = false;

                message.x = 0;
                message.y = 0;

                for (i = 0; i < ent.collisionTypes.length; i++) {
                    softCollisions = ent.softCollisions[ent.collisionTypes[i]];
                    for (y = 0; y < softCollisions.length; y++) {
                        otherCollisionType = softCollisions[y];
                        otherEntities = entitiesByTypeLive[otherCollisionType];
                        if (otherEntities) {
                            for (z = 0; z < otherEntities.length; z++) {
                                collisionFound = false;
                                otherEntity = otherEntities[z];
                                if ((otherEntity !== ent) && (checkAABBCollision(ent.getAABB(ent.collisionTypes[i]), otherEntity.getAABB(otherCollisionType)))) {
                                    shapes = ent.getShapes(ent.collisionTypes[i]);
                                    otherShapes = otherEntity.getShapes(otherCollisionType);
                                    for (j = 0; j < shapes.length; j++) {
                                        for (k = 0; k < otherShapes.length; k++) {
                                            if (shapeCollision(shapes[j], otherShapes[k])) {
                                                //TML - We're only reporting the first shape we hit even though there may be multiple that we could be hitting.
                                                message.entity  = otherEntity;
                                                message.type    = otherCollisionType;
                                                message.myType  = ent.collisionTypes[i];
                                                message.shape   = otherShapes[k];
                                                message.hitType = 'soft';
                                                
                                                callback(message);
                                                
                                                collisionFound = true;
                                            }
                                            if (collisionFound) {
                                                break;
                                            }
                                        }
                                        if (collisionFound) {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            
            destroy: function () {
                var key = '';
                
                this.allEntities.length = 0;
                this.allEntitiesLive.length = 0;
                this.softEntitiesLive.length = 0;
                this.solidEntitiesLive.length = 0;
                for (key in this.entitiesByType) {
                    if (this.entitiesByType.hasOwnProperty(key)) {
                        this.entitiesByType[key].length = 0;
                    }
                }
            }
        },
        
        publicMethods: {
            /**
             * This method returns an object containing world entities grouped by collision type.
             * 
             * @method getWorldEntities
             * @return {Object} A list of key/value pairs where the keys are collision types and the values are arrays of entities of that type.
             */
            getWorldEntities: function () {
                return this.entitiesByTypeLive;
            },
            
            /**
             * This method returns an entity representing the collision map of the world.
             * 
             * @method getWorldTerrain
             * @return {Entity} - An entity describing the collision map of the world. This entity typically includes a `CollisionTiles` component.
             */
            getWorldTerrain: function () {
                return this.terrain;
            },
            
            /**
             * This method returns a list of collision objects describing soft collisions between an entity and a list of other entities.
             * 
             * @method getEntityCollisions
             * @param entity {Entity} The entity to test against the world.
             * @param [entities] {Array} The list of entities to check against. By default this is all the entities in the world.
             * @return collisions {Array} This is a list of collision objects describing the soft collisions.
             */
            getEntityCollisions: function (entity, entities) {
                var collisions = [];
                
                this.checkEntityForSoftCollisions(entity, entities || this.entitiesByTypeLive, function (collision) {
                    var i    = '',
                        save = {};
                    
                    for (i in collision) {
                        if (collision.hasOwnProperty(i)) {
                            save[i] = collision[i];
                        }
                    }
                    collisions.push(save);
                });
                
                return collisions;
            }
        }
    });
}());

//##############################################################################
// HandlerController.js
//##############################################################################

/**
 * This component handles capturing and relaying input information to the entities that care about it. It takes mouse, keyboard, and custom input messages. State messages are sent immediately to the entities when they are received, the 'HandlerController' message is sent to demarcate ticks.
 * 
 * @namespace platypus.components
 * @class HandlerController
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var keyMap = { //Note: if this list is changed, be sure to update https://github.com/PBS-KIDS/Platypus/wiki/Handler-controller-key-list
            kc0:   'unknown',
            kc8:   'backspace',
            kc9:   'tab',
            kc12:  'numpad-5-shift',
            kc13:  'enter',
            kc16:  'shift',
            kc17:  'ctrl',
            kc18:  'alt',
            kc19:  'pause',
            kc20:  'caps-lock',
            kc27:  'esc',
            kc32:  'space',
            kc33:  'page-up',
            kc34:  'page-down',
            kc35:  'end',
            kc36:  'home',
            kc37:  'left-arrow',
            kc38:  'up-arrow',
            kc39:  'right-arrow',
            kc40:  'down-arrow',
            kc42:  'numpad-multiply',
            kc43:  'numpad-add',
            kc44:  'print-screen',
            kc45:  'insert',
            kc46:  'delete',
            kc47:  'numpad-division',
            kc48:  '0',
            kc49:  '1',
            kc50:  '2',
            kc51:  '3',
            kc52:  '4',
            kc53:  '5',
            kc54:  '6',
            kc55:  '7',
            kc56:  '8',
            kc57:  '9',
            kc59:  'semicolon',
            kc61:  'equals',
            kc65:  'a',
            kc66:  'b',
            kc67:  'c',
            kc68:  'd',
            kc69:  'e',
            kc70:  'f',
            kc71:  'g',
            kc72:  'h',
            kc73:  'i',
            kc74:  'j',
            kc75:  'k',
            kc76:  'l',
            kc77:  'm',
            kc78:  'n',
            kc79:  'o',
            kc80:  'p',
            kc81:  'q',
            kc82:  'r',
            kc83:  's',
            kc84:  't',
            kc85:  'u',
            kc86:  'v',
            kc87:  'w',
            kc88:  'x',
            kc89:  'y',
            kc90:  'z',
            kc91:  'left-windows-start',
            kc92:  'right-windows-start',
            kc93:  'windows-menu',
            kc96:  'back-quote',
            kc106: 'numpad-multiply',
            kc107: 'numpad-add',
            kc109: 'numpad-minus',
            kc110: 'numpad-period',
            kc111: 'numpad-division',
            kc112: 'f1',
            kc113: 'f2',
            kc114: 'f3',
            kc115: 'f4',
            kc116: 'f5',
            kc117: 'f6',
            kc118: 'f7',
            kc119: 'f8',
            kc120: 'f9',
            kc121: 'f10',
            kc122: 'f11',
            kc123: 'f12',
            kc144: 'num-lock',
            kc145: 'scroll-lock',
            kc186: 'semicolon',
            kc187: 'equals',
            kc188: 'comma',
            kc189: 'hyphen',
            kc190: 'period',
            kc191: 'forward-slash',
            kc192: 'back-quote',
            kc219: 'open-bracket',
            kc220: 'back-slash',
            kc221: 'close-bracket',
            kc222: 'quote'
        };

    return platypus.createComponentClass({
        
        id: 'HandlerController',
        
        constructor: function (definition) {
            var self = this;
            
            this.callbackKeyUp   = null;
            this.callbackKeyDown = null;
            
            if (platypus.game.settings.debug) { // If this is a test build, leave in the browser key combinations so debug tools can be opened as expected.
                this.callbackKeyDown = function (event) {
                    self.keyDown(event);
                };
                this.callbackKeyUp = function (event) {
                    self.keyUp(event);
                };
            } else { // Otherwise remove default browser behavior for key inputs so that they do not interfere with game-play.
                this.callbackKeyDown = function (event) {
                    self.keyDown(event);
                    event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
                };
                this.callbackKeyUp = function (event) {
                    self.keyUp(event);
                    event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
                };
            }
            
            window.addEventListener('keydown', this.callbackKeyDown, true);
            window.addEventListener('keyup',   this.callbackKeyUp,   true);
        },
        events: {
            /**
             * Sends a 'handle-controller' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
             * 
             * @method 'tick'
             * @param tick {Object} An object containing tick data.
             */
            "tick": function (tick) {

                /**
                 * Sent to entities on each tick to handle whatever they need to regarding controls.
                 * 
                 * @event 'handle-controller'
                 * @param tick {Object} An object containing tick data.
                 */
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('handle-controller', tick);
                }
            }
        },
        methods: {
            keyDown: function (event) {

                /**
                 *  Message sent to an entity when a key goes from up to down.
                 * 
                 * @event 'key:[keyId]:down'
                 * @param event {DOMEvent} The DOM event that triggered the keydown event.
                 */
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('key:' + (keyMap['kc' + event.keyCode] || ('key-code-' + event.keyCode)) + ':down', event);
                }
            },
            keyUp: function (event) {

                /**
                 * Message sent to child entities when a key goes from down to up.
                 * 
                 * @event 'key:[keyId]:up'
                 * @param event {DOMEvent} The DOM event that triggered the keyup event.
                 */
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('key:' + (keyMap['kc' + event.keyCode] || ('key-code-' + event.keyCode)) + ':up', event);
                }
            },
            destroy: function () {
                window.removeEventListener('keydown', this.callbackKeyDown);
                window.removeEventListener('keyup',   this.callbackKeyUp);
            }
        }
    });
}());

//##############################################################################
// HandlerLogic.js
//##############################################################################

/**
 * A component that handles updating logic components. Each tick it calls all the entities that accept 'handle-logic' messages. This component is usually used on an "action-layer".
 * 
 * @namespace platypus.components
 * @class HandlerLogic
 * @uses Component
 **/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var updateState = function (entity) {
        var state   = null,
            changed = false;
        
        for (state in entity.state) {
            if (entity.state[state] !== entity.lastState[state]) {
                entity.lastState[state] = entity.state[state];
                changed = true;
            }
        }
        
        return changed;
    };

    return platypus.createComponentClass({
        id: "HandlerLogic",
        publicProperties: {
            /**
             * The buffer area around the camera in which entity logic is active. This property is available on the Entity as `entity.buffer`.
             * 
             * @property buffer
             * @type number
             * @default camera width / 10
             */
            buffer: -1,

            /**
             * The length in milliseconds of a single logic step. If the framerate drops too low, logic is run for each step of this many milliseconds. This property is available on the Entity as `entity.stepLength`.
             * 
             * @property stepLength
             * @type number
             * @default 5
             */
            stepLength: 5,
            
            /**
             * The maximum number of steps to take for a given tick, to prevent lag overflow.
             * 
             * @property maxStepsPerTick
             * @type number
             * @default 100
             */
            maxStepsPerTick: 100
        },
        constructor: function (definition) {
            this.entities = [];
            this.activeEntities = this.entities;
            
            this.paused = 0;
            this.leftoverTime = 0;
            this.camera = {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                buffer:     this.buffer,
                active: false
            };
            this.message = {
                delta: this.stepLength,
                tick: null,
                camera: this.camera,
                movers: this.activeEntities
            };
            this.timeElapsed = {
                name: 'Logic',
                time: 0
            };
        },
        
        events: {
            /**
             * Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-logic' message id it's added to the list of entities.
             * 
             * @method 'child-entity-added'
             * @param entity {Entity} The entity that is being considered for addition to the handler.
             */
            "child-entity-added": function (entity) {
                var x = 0,
                    messageIds = entity.getMessageIds();
                
                for (x = 0; x < messageIds.length; x++) {
                    if (messageIds[x] === 'handle-logic' || messageIds[x] === 'handle-post-collision-logic') {
                        this.entities.push(entity);
                        this.updateNeeded = this.camera.active;
                        break;
                    }
                }
            },

            /**
             * Called when an entity should be removed from the list of logically updated entities.
             * 
             * @method 'child-entity-removed'
             * @param entity {Entity} The entity to be removed from the handler.
             */
            "child-entity-removed": function (entity) {
                var j = 0;
                
                for (j = this.entities.length - 1; j > -1; j--) {
                    if (this.entities[j] === entity) {
                        this.entities.splice(j, 1);
                        break;
                    }
                }
            },
            
            /**
             * When this event is triggered, `handle-logic` messages cease to be triggered on each tick.
             * 
             * @method 'pause-logic'
             * @param [options] {Object}
             * @param [options.time] {number} If set, this will pause the logic for this number of milliseconds. If not set, logic is paused until an `unpause-logic` message is triggered.
             */
            "pause-logic": function (resp) {
                if (resp && resp.time) {
                    this.paused = resp.time;
                } else {
                    this.paused = -1;
                }
            },
            
            /**
             * When this event is triggered, `handle-logic` messages begin firing each tick.
             * 
             * @method 'unpause-logic'
             */
            "unpause-logic": function () {
                this.paused = 0;
            },
            
            /**
             * Changes the active logic area when the camera location changes.
             * 
             * @method 'camera-update'
             * @param camera {Object}
             * @param camera.viewport {platypus.AABB} The AABB describing the camera viewport in world units.
             */
            "camera-update": function (camera) {
                this.camera.left   = camera.viewport.left;
                this.camera.top    = camera.viewport.top;
                this.camera.width  = camera.viewport.width;
                this.camera.height = camera.viewport.height;
                
                if (this.camera.buffer === -1) {
                    this.camera.buffer = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
                }
                
                this.camera.active = true;
                
                this.updateNeeded = true;
            },
            
            /**
             * Sends a 'handle-logic' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
             * 
             * @method 'tick'
             * @param tick {Object} Tick information that is passed on to children entities via "handle-logic" events.
             * @param tick.delta {number} The time passed since the last tick.
             */
            "tick": function (resp) {
                var i = 0,
                    j = 0,
                    cycles = 0,
                    child  = null,
                    time   = new Date().getTime();
                
                this.leftoverTime += resp.delta;
                cycles = Math.floor(this.leftoverTime / this.stepLength) || 1;
        
                // This makes the frames smoother, but adds variance into the calculations
        //        this.message.delta = this.leftoverTime / cycles;
        //        this.leftoverTime = 0;
                
                // This makes the frames more exact, but varying step numbers between ticks can cause movement to be jerky
        //        this.message.delta = Math.min(this.leftoverTime, this.stepLength);
        //        this.leftoverTime = Math.max(this.leftoverTime - (cycles * this.stepLength), 0);
        
                // This makes the frames exact, but varying step numbers between ticks can cause movement to be jerky
                this.message.delta = this.stepLength;
                this.leftoverTime = Math.max(this.leftoverTime - (cycles * this.stepLength), 0);
        
                if (this.paused > 0) {
                    this.paused -= resp.delta;
                    if (this.paused < 0) {
                        this.paused = 0;
                    }
                }
                
                if (!this.paused) {
                    this.message.tick = resp;
                    
                    //if (this.updateNeeded) {//causes blocks to fall through dirt - not sure the connection here, so leaving out this optimization for now. - DDD
                    if (this.activeEntities === this.entities) {
                        this.message.movers = this.activeEntities = [];
                    }

                    this.activeEntities.length = 0;
                    for (j = this.entities.length - 1; j > -1; j--) {
                        child = this.entities[j];
                        if (child.alwaysOn  || (typeof child.x === 'undefined') || ((child.x >= this.camera.left - this.camera.buffer) && (child.x <= this.camera.left + this.camera.width + this.camera.buffer) && (child.y >= this.camera.top - this.camera.buffer) && (child.y <= this.camera.top + this.camera.height + this.camera.buffer))) {
                            this.activeEntities.push(child);
                        }
                    }
                    //}
                    
                    //Prevents game lockdown when processing takes longer than time alotted.
                    cycles = Math.min(cycles, this.maxStepsPerTick);
                    
                    for (i = 0; i < cycles; i++) {
                        if (this.owner.triggerEventOnChildren) {
                            this.owner.triggerEventOnChildren('handle-ai', this.message);
                        }
                        /**
                         * This event is triggered on children entities to run their logic.
                         * 
                         * @event 'handle-logic'
                         * @param tick {Object}
                         * @param tick.delta {Number} The time that has passed since the last tick.
                         */
                        for (j = this.activeEntities.length - 1; j > -1; j--) {
                            child = this.activeEntities[j];
                            if (child.triggerEvent('handle-logic', this.message)) {
                                child.checkCollision = true;
                            }
                        }
                        
                        this.timeElapsed.name = 'Logic';
                        this.timeElapsed.time = new Date().getTime() - time;
                        platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                        time += this.timeElapsed.time;
                        
                        /**
                         * This event is triggered on the entity (layer) to test collisions once logic has been completed.
                         * 
                         * @event 'check-collision-group'
                         * @param tick {Object}
                         * @param tick.delta {Number} The time that has passed since the last tick.
                         */
                        if (this.owner.triggerEvent('check-collision-group', this.message)) { // If a collision group is attached, make sure collision is processed on each logic tick.
                            this.timeElapsed.name = 'Collision';
                            this.timeElapsed.time = new Date().getTime() - time;
                            platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                            time += this.timeElapsed.time;

                            /**
                             * This event is triggered on entities to run logic that may depend upon collision responses.
                             * 
                             * @event 'handle-post-collision-logic'
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             */
                             
                            /**
                             * Triggered on entities when the entity's state has been changed.
                             * 
                             * @event 'state-changed'
                             * @param state {Object} A list of key/value pairs representing the owner's state (this value equals `entity.state`).
                             */
                            for (j = this.activeEntities.length - 1; j > -1; j--) {
                                child = this.activeEntities[j];
                                child.triggerEvent('handle-post-collision-logic', this.message);
                                if (updateState(child)) {
                                    child.triggerEvent('state-changed', child.state);
                                }
                            }

                            this.timeElapsed.name = 'Collision Logic';
                            this.timeElapsed.time = new Date().getTime() - time;
                            platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                            time += this.timeElapsed.time;
                        } else {
                            for (j = this.activeEntities.length - 1; j > -1; j--) {
                                child = this.activeEntities[j];
                                if (updateState(child)) {
                                    child.triggerEvent('state-changed', child.state);
                                }
                            }
                        }
                        
                        
                    }
                }
                
                this.timeElapsed.time = new Date().getTime() - time;
                platypus.game.currentScene.trigger('time-elapsed', this.timeElapsed);
            }
        }
    });
}());

//##############################################################################
// HandlerRender.js
//##############################################################################

/**
 * A component that handles updating the render components on entities that are rendering via PIXI. Calls 'handle-render on children entities every tick. Also initializes handlers for mouse events on the layer level.
 *
 * @namespace platypus.components
 * @class HandlerRender
 * @uses Component
 */
/*global PIXI, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({

        id: "HandlerRender",

        properties: {
            /**
             * Indicates the types of input the Container will listen for. Defaults to none.
             *
             *      "acceptInput": {
             *          "click": false, // Whether to listen for mouse/touch events
             *          "camera": false, // Whether camera movement while the mouse (or touch) is triggered should result in a mousemove event
             *          "hover": false // Whether to capture mouse movement even when there is no mouse-down.
             *      }
             *
             * @property acceptInput
             * @type Object
             * @default null
             */
            acceptInput: null

        },

        publicProperties: {

        },

        constructor: function (definition) {
            this.container = new PIXI.Container();

            this.camera = {
                x: 0,
                y: 0
            };

            // The following appends necessary information to displayed objects to allow them to receive touches and clicks
            if (this.acceptInput) {
                this.click = this.acceptInput.click;
                this.cameraMovementMovesMouse = this.acceptInput.camera;
                this.hover = this.acceptInput.hover;
                if (this.click || this.hover) {
                    this.addInputs();
                    this.addEventListener();
                }
            }

            this.renderMessage = {
                delta: 0,
                container: this.container
            };
        },

        events: {
            /**
             * Once the entity is loaded, this component triggers "render-world" to notify other components about the entities' display container.
             *
             * @method 'load'
             */
            "load": function () {
                /**
                 * Once the entity is loaded, this component triggers "render-world" to notify other components about the entities' display container.
                 *
                 * @event 'render-world'
                 * @param data {Object}
                 * @param data.world {PIXI.Container} Contains entities to be rendered.
                 */
                this.owner.triggerEvent('render-world', {
                    world: this.container
                });
            },

            /**
             * Called when a new entity has been added to the parent and should be considered for addition to the handler. Entities are sent a reference the Container that we're rendering to, so they can add their display objects to it and the delta from the lastest tick.
             *
             * @method 'child-entity-added'
             * @param entity {Entity} The entity added to the parent.
             */
            "child-entity-added": function (entity) {
                /**
                 * Triggered on an entity added to the parent.
                 *
                 * @event 'handle-render-load'
                 * @param data {Object}
                 * @param data.delta {Number} The delta time for this tick.
                 * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                 */
                entity.triggerEvent('handle-render-load', this.renderMessage);
            },

            /**
             * Pauses the children of this render Container. If a pause time is not provided. It remains paused until 'unpause-render' is called.
             *
             * @method 'pause-render'
             * @param [data] {Object}
             * @param data.time {Number} How long to pause.
             */
            "pause-render": function (timeData) {
                if (timeData && timeData.time) {
                    this.paused = timeData.time;
                } else {
                    this.paused = -1;
                }
            },

            /**
             * Unpauses the children of this render Container.
             *
             * @method 'pause-render'
             */
            "unpause-render": function () {
                this.paused = 0;
            },

            /**
             * Sends a 'handle-render' message to all the children in the Container. The children in the Container are also paused/unpaused if needed and sorted according to their z value.
             *
             * @method 'tick'
             * @param tick {Object} An object containing tick data.
             */
            "tick": (function () {
                var sort = function (a, b) {
                    return a.z - b.z;
                };

                return function (tick) {
                    var x = 0,
                        child   = null,
                        message = this.renderMessage;

                    message.delta = tick.delta;

                    if (this.paused > 0) {
                        this.paused -= tick.delta;
                        if (this.paused < 0) {
                            this.paused = 0;
                        }
                    }

                    if (this.owner.triggerEventOnChildren) {
                        /**
                         * Triggered every tick on the children entities.
                         *
                         * @event 'handle-render'
                         * @param data {Object}
                         * @param data.delta {Number} The delta time for this tick.
                         * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                         */
                        this.owner.triggerEventOnChildren('handle-render', message);
                    }

                    if (this.container) {
                        for (x = this.container.children.length - 1; x > -1; x--) {
                            child = this.container.children[x];

                            if (child.visible) {
                                if (child.paused && !this.paused) {
                                    child.paused = false;
                                } else if (this.paused) {
                                    child.paused = true;
                                }
                            }
                        }

                        if (this.container.reorder) {
                            this.container.reorder = false;
                            this.container.children.sort(sort);
                        }

                    }
                };
            }()),

            /**
             * Triggered every time the camera position or scale updates. This event triggers the 'mousemove' event if camera movement is set to trigger it. It also updates the internal record of the camera position.
             *
             * @method 'camera-update'
             * @param cameraData {Object} A camera data object
             * @param cameraData.viewport {Object | AABB} An AABB describing the location and size of the camera.
             */
            "camera-update": function (cameraData) {
                this.camera.x = cameraData.viewport.left;
                this.camera.y = cameraData.viewport.top;

                if (this.moveMouse) {
                    this.moveMouse();
                }
            }

        },
        methods: {
            addInputs: (function () {
                var createHandler = function (self, eventName) {
                    return function (event) {
                        var stageX = event.data.global.x,
                            stageY = event.data.global.y,
                            nativeEvent = event.data.originalEvent,
                            x = 0,
                            y = 0;

                        //TML - This is in case we do a scene change using an event and the container is destroyed.
                        if (!self.container) {
                            return;
                        }

                        x = stageX / self.container.transformMatrix.a + self.camera.x;
                        y = stageY / self.container.transformMatrix.d + self.camera.y;

                        event.target.mouseTarget = true;

                        self.owner.trigger(eventName, {
                            event: nativeEvent,
                            cjsEvent: event,
                            x: x,
                            y: y,
                            entity: self.owner
                        });

                        if (self.cameraMovementMovesMouse) {
                            if (eventName === 'pressup') {
                                event.target.mouseTarget = false;
                                self.moveMouse = null;
                                if (event.target.removeDisplayObject) {
                                    event.target.removeDisplayObject();
                                }
                            } else {
                                // This function is used to trigger a move event when the camera moves and the mouse is still triggered.
                                self.moveMouse = function () {
                                    self.owner.trigger('pressmove', {
                                        event: nativeEvent,
                                        x: stageX / self.container.transformMatrix.a + self.camera.x,
                                        y: stageY / self.container.transformMatrix.d + self.camera.y,
                                        entity: self.owner
                                    });
                                };
                            }
                        }
                    };
                };

                return function () {
                    var sprite    = this.container,
                        mousedown = null,
                        mouseover = null,
                        mouseout  = null,
                        pressmove = null,
                        pressup   = null,
                        click     = null,
                        tPM = null,
                        tPU = null,
                        tMD = null,
                        pressed   = false;

                    // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                    if (this.click) {
                        sprite.interactive = true;
                        
                        /**
                         * Dispatched when the 'mousedown' event occurs on the container.
                         *
                         * @event 'mousedown'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.pixiEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        tMD = createHandler(this, 'mousedown');
                        mousedown = function (event) {
                            tMD(event);
                            pressed = true;
                        }.bind(this);
                        
                        /**
                         * Dispatched when the 'pressmove' event occurs on the container.
                         *
                         * @event 'pressmove'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.pixiEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        tPM = createHandler(this, 'pressmove');
                        pressmove = function (event) {
                            if (pressed) {
                                tPM(event);
                            }
                        }.bind(this);
                        
                        /**
                         * Dispatched when the 'pressup' event occurs on the container.
                         *
                         * @event 'pressup'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.pixiEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        tPU = createHandler(this, 'pressup');
                        pressup   = function (event) {
                            tPU(event);
                            pressed = false;
                        }.bind(this);
                        
                        /**
                         * Dispatched when the 'click' event occurs on the container.
                         *
                         * @event 'click'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.pixiEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        click     = createHandler(this, 'click');

                        sprite.addListener('mousedown',       mousedown);
                        sprite.addListener('touchstart',      mousedown);
                        sprite.addListener('mouseup',         pressup);
                        sprite.addListener('touchend',        pressup);
                        sprite.addListener('mouseupoutside',  pressup);
                        sprite.addListener('touchendoutside', pressup);
                        sprite.addListener('mousemove',       pressmove);
                        sprite.addListener('touchmove',       pressmove);
                        sprite.addListener('click',           click);
                        sprite.addListener('tap',             click);
                    }
                    if (this.hover) {
                        sprite.interactive = true;
                        
                        /**
                         * Dispatched when the 'mouseover' event occurs on the container.
                         *
                         * @event 'mouseover'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.pixiEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        mouseover = createHandler(this, 'mouseover');
                        /**
                         * Dispatched when the 'mouseout' event occurs on the container.
                         *
                         * @event 'mouseout'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.pixiEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        mouseout  = createHandler(this, 'mouseout');

                        sprite.addListener('mouseover', mouseover);
                        sprite.addListener('mouseout',  mouseout);
                    }

                    this.removeInputListeners = function () {
                        if (this.click) {
                            sprite.removeListener('mousedown',       mousedown);
                            sprite.removeListener('touchstart',      mousedown);
                            sprite.removeListener('mouseup',         pressup);
                            sprite.removeListener('touchend',        pressup);
                            sprite.removeListener('mouseupoutside',  pressup);
                            sprite.removeListener('touchendoutside', pressup);
                            sprite.removeListener('mousemove',       pressmove);
                            sprite.removeListener('touchmove',       pressmove);
                            sprite.removeListener('click',           click);
                            sprite.removeListener('tap',             click);
                        }
                        if (this.hover) {
                            sprite.removeListener('mouseover', mouseover);
                            sprite.removeListener('mouseout',  mouseout);
                        }
                        this.removeInputListeners = null;
                    };
                };
            }()),

            destroy: function () {
                var self = this;
                if (this.container.mouseTarget) {
                    this.container.visible = false;
                    this.container.removeDisplayObject = function () {
                        self.container = null;
                    };
                } else {
                    this.container = null;
                }
            }
        },

        publicMethods: {

        }
    });
}());

//##############################################################################
// LevelBuilder.js
//##############################################################################

/**
 * This component works in tandem with 'TiledLoader by taking several Tiled maps and combining them before `TiledLoader` processes them. Tiled maps must use the same tilesets for this to function correctly.
 *
 * Note: Set "manuallyLoad" to `true` in the `TiledLoader` component JSON definition so that it will wait for this component's "load-level" call.
 *
 * @namespace platypus.components
 * @class LevelBuilder
 * @uses Component
 */

/*global console */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var mergeData = function (levelData, levelMergeAxisLength, segmentData, segmentMergeAxisLength, nonMergeAxisLength, mergeAxis) {
            var x        = 0,
                y        = 0,
                z        = 0,
                combined = levelData.slice();

            if (mergeAxis === 'horizontal') {
                for (y = nonMergeAxisLength - 1; y >= 0; y--) {
                    for (x = y * segmentMergeAxisLength, z = 0; x < (y + 1) * segmentMergeAxisLength; x++, z++) {
                        combined.splice(((y + 1) * levelMergeAxisLength) + z, 0, segmentData[x]);
                    }
                }
                return combined;
            } else if (mergeAxis === 'vertical') {
                return levelData.concat(segmentData);
            }
        },
        mergeObjects  = function (obj1s, obj2s, mergeAxisLength, mergeAxis) {
            var i    = 0,
                j    = 0,
                list = obj1s.slice(),
                obj  = null;

            for (i = 0; i < obj2s.length; i++) {
                obj = {};
                for (j in obj2s[i]) {
                    if (obj2s[i].hasOwnProperty(j)) {
                        obj[j] = obj2s[i][j];
                    }
                }
                if (mergeAxis === 'horizontal') {
                    obj.x += mergeAxisLength;
                } else if (mergeAxis === 'vertical') {
                    obj.y += mergeAxisLength;
                }
                list.push(obj);
            }
            return list;
        },
        mergeSegment  = function (level, segment, mergeAxis) {
            var i = 0,
                j = 0;

            if (!level.tilewidth && !level.tileheight) {
                //set level tile size data if it's not already set.
                level.tilewidth  = segment.tilewidth;
                level.tileheight = segment.tileheight;
            } else if (level.tilewidth !== segment.tilewidth || level.tileheight !== segment.tileheight) {
                console.warn('Tiled-Loader: Your map has segments with different tile sizes. All tile sizes must match. Segment: ' + segment);
            }

            if (mergeAxis === 'horizontal') {
                if (level.height === 0) {
                    level.height = segment.height;
                } else if (level.height !== segment.height) {
                    console.warn('Tiled-Loader: You are trying to merge segments with different heights. All segments need to have the same height. Level: ' + level + ' Segment: ' + segment);
                }
            } else if (mergeAxis === 'vertical') {
                if (level.width === 0) {
                    level.width = segment.width;
                } else if (level.width !== segment.width) {
                    console.warn('Tiled-Loader: You are trying to merge segments with different widths. All segments need to have the same width. Level: ' + level + ' Segment: ' + segment);
                }
            }

            for (i = 0; i < segment.layers.length; i++) {
                if (!level.layers[i]) {
                    //if the level doesn't have a layer yet, we're creating it and then copying it from the segment.
                    level.layers[i] = {};
                    for (j in segment.layers[i]) {
                        if (segment.layers[i].hasOwnProperty(j)) {
                            level.layers[i][j] = segment.layers[i][j];
                        }
                    }
                } else {
                    if (level.layers[i].type === segment.layers[i].type) {
                        //if the level does have a layer, we're appending the new data to it.
                        if (level.layers[i].data && segment.layers[i].data) {
                            if (mergeAxis === 'horizontal') {
                                level.layers[i].data = mergeData(level.layers[i].data, level.width, segment.layers[i].data, segment.width, level.height, mergeAxis);
                                level.layers[i].width += segment.width;
                            } else if (mergeAxis === 'vertical') {
                                level.layers[i].data = mergeData(level.layers[i].data, level.height, segment.layers[i].data, segment.height, level.width, mergeAxis);
                                level.layers[i].height += segment.height;
                            }
                        } else if (level.layers[i].objects && segment.layers[i].objects) {
                            if (mergeAxis === 'horizontal') {
                                level.layers[i].objects = mergeObjects(level.layers[i].objects, segment.layers[i].objects, level.width * level.tilewidth, mergeAxis);
                            } else if (mergeAxis === 'vertical') {
                                level.layers[i].objects = mergeObjects(level.layers[i].objects, segment.layers[i].objects, level.height * level.tileheight, mergeAxis);
                            }
                        }
                    } else {
                        console.warn('Tiled-Loader: The layers in your level segments do not match. Level: ' + level + ' Segment: ' + segment);
                    }

                }
            }

            if (mergeAxis === 'horizontal') {
                level.width += segment.width;
            } else if (mergeAxis === 'vertical') {
                level.height += segment.height;
            }

            //Go through all the STUFF in segment and copy it to the level if it's not already there.
            for (i in segment) {
                if (segment.hasOwnProperty(i) && !level[i]) {
                    level[i] = segment[i];
                }
            }
        },
        mergeLevels = function (levelSegments) {
            var i = 0,
                j = 0,
                levelDefinitions = platypus.game.settings.levels,
                row              = {
                    height: 0,
                    width:  0,
                    layers: []
                },
                level            = {
                    height: 0,
                    width:  0,
                    layers: []
                },
                segmentsWide = levelSegments[i].length;

            for (i = 0; i < levelSegments.length; i++) {
                if (segmentsWide !== levelSegments[i].length) {
                    console.warn('Tiled-Loader: Your map is not square. Maps must have an equal number of segments in every row.');
                }
                row = {
                    height: 0,
                    width:  0,
                    layers: []
                };
                for (j = 0; j < levelSegments[i].length; j++) {
                    //Merge horizontally
                    if (typeof levelSegments[i][j] === 'string') {
                        mergeSegment(row, levelDefinitions[levelSegments[i][j]], 'horizontal');
                    } else {
                        mergeSegment(row, levelSegments[i][j], 'horizontal');
                    }
                }
                //Then merge vertically
                mergeSegment(level, row, 'vertical');
            }
            return level;
        };

    return platypus.createComponentClass({
        id: 'LevelBuilder',
        
        properties: {
            /**
             * If true, no single map piece is used twice in the creation of the combined map.
             *
             * @property useUniques
             * @type Boolean
             * @default true
             */
            useUniques: true,
            /**
             * A 1D or 2D array of level piece ids. The template defines how the pieces will be arranged and which pieces can be used where. The template must be rectangular in dimensions.
             *
             *      "levelTemplate": [ ["start", "forest"], ["forest", "end"] ]
             *
             * @property levelTemplate
             * @type Array
             * @default null
             */
            levelTemplate: null,
            /**
             * This is an object of key/value pairs listing the pieces that map to an id in the level template. The value can be specified as a string or array. A piece will be randomly chosen from an array when that idea is used. If levelPieces is not defined, ids in the template map directly to level names.
             *
             *      "levelPieces": {
             *          "start"  : "start-map",
             *          "end"      : "end-map",
             *          "forest" : ["forest-1", "forest-2", "forest-3"]
             *      }
             *
             * @property levelPieces
             * @type Object
             * @default null
             */
            levelPieces: null
        },

        publicProperties: {
        },
        
        constructor: function (definition) {
            //this.levelTemplate = this.owner.levelTemplate || definition.levelTemplate;
            //this.levelPieces = this.owner.levelPieces || definition.levelPieces;
            this.levelMessage = {level: null, persistentData: null};
        },

        events: {// These are messages that this component listens for

            /**
             * When the scene has loaded, LevelBuilder compiles the level based on the template and pieces and sends it to the TiledLoader.
             *
             * @method 'scene-loaded'
             * @param persistentData {Object} The persistent data from the previous scene.
             */
            "scene-loaded": function (persistentData) {
                var templateRow  = null,
                    piecesToCopy = null,
                    x            = '',
                    y            = 0,
                    i            = 0,
                    j            = 0;
                
                this.levelMessage.persistentData = persistentData;

                this.levelTemplate = persistentData.levelTemplate || this.levelTemplate;
                this.useUniques = persistentData.useUniques || this.useUniques;
                piecesToCopy = persistentData.levelPieces || this.levelPieces;
                this.levelPieces = {};
                if (piecesToCopy) {
                    for (x in piecesToCopy) {
                        if (piecesToCopy.hasOwnProperty(x)) {
                            if (typeof piecesToCopy[x] === "string") {
                                this.levelPieces[x] = piecesToCopy[x];
                            } else if (piecesToCopy[x].length) {
                                this.levelPieces[x] = [];
                                for (y = 0; y < piecesToCopy[x].length; y++) {
                                    this.levelPieces[x].push(piecesToCopy[x][y]);
                                }
                            } else {
                                throw('Level Builder: Level pieces of incorrect type: ' + piecesToCopy[x]);
                            }
                        }
                    }
                }

                if (this.levelTemplate) {
                    if (this.levelTemplate) {
                        this.levelMessage.level = [];
                        for (i = 0; i < this.levelTemplate.length; i++) {
                            templateRow = this.levelTemplate[i];
                            if (typeof templateRow === "string") {
                                this.levelMessage.level[i] = this.getLevelPiece(templateRow);
                            } else if (templateRow.length) {
                                this.levelMessage.level[i] = [];
                                for (j = 0; j < templateRow.length; j++) {
                                    this.levelMessage.level[i][j] = this.getLevelPiece(templateRow[j]);
                                }
                            } else {
                                throw('Level Builder: Template row is neither a string or array. What is it?');
                            }
                        }
                    } else {
                        throw('Level Builder: Template is not defined');
                    }
                } else {
                    throw('Level Builder: There is no level template.');
                }
                
                if (this.levelMessage.level) {
                    this.levelMessage.level = mergeLevels(this.levelMessage.level);
                    /**
                     * Dispatched when the scene has loaded and the level has been composited so TileLoader can begin loading the level.
                     *
                     * @event 'load-level'
                     * @param data {Object}
                     * @param data.level {Object} An object describing the level dimensions, tiles, and entities.
                     * @param data.persistentData {Object} The persistent data passed from the last scene. We add levelBuilder data to it to pass on.
                     * @param data.persistentData.levelTemplate {Object} A 1D or 2D array of level piece ids. The template defines how the pieces will be arranged and which pieces can be used where. The template must be rectangular in dimensions.
                     * @param data.persistentData.levelPieces {Object} An object of key/value pairs listing the pieces that map to an id in the level template.
                     * @param data.persistentData.useUniques {Boolean} If true, no single map piece is used twice in the creation of the combined map.
                     */
                    this.owner.triggerEvent('load-level', this.levelMessage);
                }
            }
        },
        
        methods: {// These are methods that are called by this component.
            getLevelPiece: function (type) {
                var pieces = this.levelPieces[type] || type,
                    temp   = null,
                    random = 0;
                
                if (pieces) {
                    if (typeof pieces === "string") {
                        if (this.useUniques) {
                            temp = pieces;
                            this.levelPieces[type] = null;
                            return temp;
                        } else {
                            return pieces;
                        }
                    } else if (pieces.length) {
                        random = Math.floor(Math.random() * pieces.length);
                        if (this.useUniques) {
                            return (this.levelPieces[type].splice(random, 1))[0];
                        } else {
                            return pieces[random];
                        }
                    } else {
                        throw('Level Builder: There are no MORE level pieces of type: ' + type);
                    }
                    
                } else {
                    throw('Level Builder: There are no level pieces of type: ' + type);
                }
                
                return null;
            },
            destroy: function () {
                this.levelMessage.level = null;
                this.levelMessage.persistentData = null;
                this.levelMessage = null;
            }
        },
        
        publicMethods: {
            mergeLevels: function (levels) {
                return mergeLevels(levels);
            }
        }
    });
}());

//##############################################################################
// LogicAngularMovement.js
//##############################################################################

/**
 * This component moves the entity in the direction of an internally stored angle value. When moving, the entity constantly accelerates the entity in a direction up to a max velocity.
 *
 * @namespace platypus.components
 * @class LogicAngularMovement
 * @uses Component
 */

/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'LogicAngularMovement',
        
        properties: {
            /**
             * The max velocity.
             *
             * @property maxVelocity
             * @type Number
             * @default 3
             */
            maxVelocity : 3,

            /**
             * The rate of acceleration.
             *
             * @property acceleration
             * @type Number
             * @default 0.01
             */
            acceleration : 0.01,

            /**
             * The offset between the rotation value of the entity and the rotation of the art.
             *
             * @property visualOffset
             * @type Number
             * @default 0
             */
            visualOffset : 0,

            /**
             * The starting heading at which the entity will accelerate. In radians.
             *
             * @property startAngle
             * @type Number
             * @default 0
             */
            startAngle : 0
        },

        publicProperties: {

        },

        constructor: function (definition) {
            this.angle     = this.startAngle;
            this.v         = [0, 0];
            this.moving    = false;
            this.piOverTwo = Math.PI / 2;
            this.owner.rotation = this.owner.rotation || this.visualOffset;
        },

        events: {

            /**
             * Updates the position, velocity, and rotation of the entity
             *
             * @method 'handle-logic'
             * @param tick {Object} The tick data.
             */
            "handle-logic": function (tick) {
                var delta        = tick.delta,
                    currentAngle = 0;
                
                if (this.moving) {
                    this.v[0] += this.acceleration * Math.cos(this.angle) * delta;
                    this.v[1] += this.acceleration * Math.sin(this.angle) * delta;
                    if (this.v[0] === 0) {
                        if (this.v[1] > 0) {
                            currentAngle = this.piOverTwo;
                        } else if (this.v[1] < 0) {
                            currentAngle = -this.piOverTwo;
                        } else {
                            currentAngle = this.angle;
                        }
                    } else {
                        currentAngle = Math.atan(this.v[1] / this.v[0]);
                        if (this.v[0] < 0) {
                            currentAngle = Math.PI + currentAngle;
                        }
                    }
                    if (this.v[0] >= 0) {
                        this.v[0] = Math.min(this.v[0], this.maxVelocity * Math.cos(currentAngle));
                    } else {
                        this.v[0] = Math.max(this.v[0], this.maxVelocity * Math.cos(currentAngle));
                    }
                    if (this.v[1] >= 0) {
                        this.v[1] = Math.min(this.v[1], this.maxVelocity * Math.sin(currentAngle));
                    } else {
                        this.v[1] = Math.max(this.v[1], this.maxVelocity * Math.sin(currentAngle));
                    }
                    
                    this.owner.x += this.v[0];
                    this.owner.y += this.v[1];

                    this.owner.rotation = (currentAngle * (180 / Math.PI)) + this.visualOffset;
                }
            },
            /**
             * Sets the internal heading angle in the component.
             *
             * @method 'set-angle'
             * @param angle {Number} The value you want to set the angle to.
             */
            "set-angle": function (angle) {
                this.angle = angle;
            },
            /**
             * Start the entity accelerating toward the heading angle.
             *
             * @method 'move'
             */
            "move": function () {
                this.moving = true;
            },
            /**
             * Stops the movement toward the heading angle.
             *
             * @method 'stop'
             */
            "stop": function () {
                this.moving = false;
                this.v[0] = 0;
                this.v[1] = 0;
            },
            /**
             * Set the max velocity.
             *
             * @method 'set-max-velocity'
             * @param newMaxV {Number} The max velocity value.
             */
            "set-max-velocity": function (newMaxV) {
                this.maxVelocity = newMaxV;
            }
        }
    });
}());

//##############################################################################
// LogicAttachment.js
//##############################################################################

/**
 * Creates an entity and connects it with the owner entity. This is useful for entities that have a one-to-one relationship with a given entity and must move as if connected to the host entity.
 *
 * @namespace platypus.components
 * @class LogicAttachment
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    var linkId = 0;

    return platypus.createComponentClass({

        id: 'LogicAttachment',

        properties: {
            /**
             * An owner state, set to true when the attachment is attached. Meant to be read by other components or used in rendering.
             *
             * @property attachState
             * @type String
             * @default 'attached'
             */
            attachState: 'attached',
            /**
             * The type of the entity to be attached.
             *
             * @property attachment
             * @type String
             * @default ''
             */
            attachment: '',

            /**
             * The offset of the attached entity in x from the attachee.
             *
             * @property offsetX
             * @type Number
             * @default 0
             */
            offsetX: 0,
            /**
             * The offset of the attached entity in y from the attachee.
             *
             * @property offsetY
             * @type Number
             * @default 0
             */
            offsetY: 0,
            /**
             * The offset of the attached entity in z from the attachee.
             *
             * @property offsetZ
             * @type Number
             * @default 0
             */
            offsetZ: 0.01
        },

        publicProperties: {

        },

        constructor: function (definition) {
            this.state = this.owner.state;

            if (!this.owner.linkId) {
                this.owner.linkId = 'attachment-link-' + linkId;
                linkId += 1;
            }

            this.state[this.attachState] = false;
            this.attachmentPosition = {
                x:  0,
                y:  0,
                z:  0,
                dx: 0,
                dy: 0,
                linkId: this.owner.linkId
            };
            this.attachmentProperties = {
                type: this.attachment,
                properties: this.attachmentPosition
            };

            this.attachment = null;
            this.isAttached = false;
        },

        events: {// These are messages that this component listens for

            /**
             * On receiving this message, updates the attached entity's position.
             *
             * @method 'handle-logic'
             * @param tick {Object} The tick data.
             */
            "handle-logic": function (tick) {
                var offset = 0,
                    state  = this.state;

                if (this.isAttached) {
                    if (!this.attachment) {
                        this.attachmentPosition.x = this.owner.x;
                        this.attachmentPosition.y = this.owner.y;
                        this.attachmentPosition.z = this.owner.z;
                        this.attachment = this.owner.parent.addEntity(this.attachmentProperties);
                    }
                    
                    if (this.attachment.destroyed) {
                        this.owner.parent.removeEntity(this.attachment);
                        this.attachment = null;
                        this.isAttached = false;
                    } else {
                        this.attachment.x = this.owner.x;
                        offset = this.offsetX;
                        if (state.left) {
                            offset *= -1;
                            this.attachment.rotation = 180;
                        } else if (state.right) {
                            this.attachment.rotation = 0;
                        }
                        this.attachment.x += offset;

                        this.attachment.y = this.owner.y;
                        offset = this.offsetY;
                        if (state.top) {
                            offset *= -1;
                            this.attachment.rotation = 90;
                        } else if (state.bottom) {
                            this.attachment.rotation = -90;
                        }
                        this.attachment.y += offset;

                        this.attachment.z = this.owner.z;
                        this.attachment.z += this.offsetZ;
                    }
                } else if (this.attachment) {
                    this.owner.parent.removeEntity(this.attachment);
                    this.attachment = null;
                }

                if (state[this.attachState] !== this.isAttached) {
                    state[this.attachState] = this.isAttached;
                }
            },

            /**
             * Creates and attaches the entity. The input value makes it possible to attach the entity on user input.
             *
             * @method 'attach'
             * @param input {Object} An input object.
             * @param input.pressed {Boolean} If set to true, the entity is created and attached.
             */
            "attach": function (input) {
                this.isAttached = !input || (input.pressed !== false);
            },
            /**
             * Detaches and removes the entity.
             *
             * @method 'detach'
             */
            "detach": function () {
                this.isAttached = false;
            }
        },

        methods: {
            destroy: function () {
                this.state[this.attachState] = false;
                if (this.attachment) {
                    this.owner.parent.removeEntity(this.attachment);
                    this.attachment = null;
                }
                this.isAttached = false;
            }
        }
    });
}());

//##############################################################################
// LogicButton.js
//##############################################################################

/**
# COMPONENT **LogicButton**
This component handles the pressed/released state of a button according to input. It can be set as a toggle button or a simple press-and-release button.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its state.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its current state and broadcasts its logical state to the entity.
- **pressed** - on receiving this message, the state of the button is set to "pressed".
- **released** - on receiving this message, the state of the button is set to "released".
- **mousedown** - on receiving this message, the state of the button is set to "pressed". Note that this component will not listen for "mousedown" if the component is in toggle mode.
- **mouseup** - on receiving this message, the state of the button is set to "released" unless in toggle mode, in which case it toggles between "pressed" and "released".

### Local Broadcasts:
- **state-changed** - this component will trigger this message with both "pressed" and "released" properties denoting its state. Both of these work in tandem and never equal each other.
  - @param message.pressed (boolean) - whether the button is in a pressed state.
  - @param message.released (boolean) - whether the button is in a released state.

## JSON Definition:
    {
      "type": "LogicButton",
      
      "toggle": true,
      // Optional. Determines whether this button should behave as a toggle. Defaults to "false".
      
      "state": "pressed"
      // Optional. Specifies starting state of button; typically only useful for toggle buttons. Defaults to "released".
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicButton',
        constructor: function (definition) {
            this.state = this.owner.state;
            this.state.released = true;
            this.state.pressed  = false;
            this.toggle = !!definition.toggle;

            if (definition.state === 'pressed') {
                this.state.released = false;
                this.state.pressed  = true;
            }
        },
        events: {
            "mousedown": function () {
                if (!this.toggle) {
                    this.updateState('pressed');
                }
            },
            "pressup": function () {
                if (this.toggle) {
                    if (this.state.pressed) {
                        this.updateState('released');
                    } else {
                        this.updateState('pressed');
                    }
                } else {
                    this.updateState('released');
                }
            },
            "handle-logic": function () {
                //TODO: This is only here so that the "state-changed" message is triggered by the Entity for other components needing it.
            }
        },
        
        methods: {
            updateState: function (state) {
                if (this.state.released && (state === 'pressed')) {
                    this.state.pressed = true;
                    this.state.released = false;
                    this.owner.triggerEvent(state, this.state);
                } else if (this.state.pressed && (state === 'released')) {
                    this.state.pressed = false;
                    this.state.released = true;
                    this.owner.triggerEvent(state, this.state);
                }
            }
        }
    });
}());

//##############################################################################
// LogicCanvasButton.js
//##############################################################################

/**
 * Provides button functionality for a RenderSprite component.
 *
 * @namespace platypus.components
 * @class LogicCanvasButton
 * @uses Component
 */
/*global platypus */
(function () {
	"use strict";
	return platypus.createComponentClass({

		id: 'LogicCanvasButton',

        properties: {
            "onPress": "",
			"onRelease": "",
            "onCancel": "",
            "useOnce": false,
            "disabled": false
		},
		publicProperties: {

		},

		constructor: function (definition) {
            this.owner.state.disabled = this.disabled;
            this.owner.state.down = false;
            this.owner.buttonMode = !this.disabled;
            this.cancelled = false;
            this.used = false;
            this.last = null;
		},

		events: {
            "handle-logic": function (tick) {
                if (this.last !== (this.disabled === this.owner.state.disabled)) {
                    this.last = (this.disabled === this.owner.state.disabled);
                }
            },
            "mousedown": function (eventData) {
                this.owner.state.down = true;
                if (!this.owner.state.disabled && !(this.useOnce && this.used)) {
                    if (this.onPress) {
                        this.owner.trigger(this.onPress);
                        this.used = true; //Doing this prevents the Release/Cancel calls from occurring. Need to find a way to let the up and down both call for one use buttons.
                    }
                }
            },
            "pressup": function (eventData) {

                if (!this.owner.state.disabled && !(this.useOnce && this.used)) {
                    if (this.cancelled) {
                        if (this.onCancel) {
                            this.owner.trigger(this.onCancel);
                            this.used = true;
                        }
                    } else {
                        if (this.onRelease) {
                            this.owner.trigger(this.onRelease);
                            this.used = true;
                        }
                    }
                }

                this.owner.state.down = false;
                this.cancelled = false;
            },
            "mouseover": function () {
                if (this.owner.state.down) {
                    this.cancelled = false;
                }
			},
			"mouseout": function () {
                if (this.owner.state.down) {
                    this.cancelled = true;
                }
			},
			"disable": function () {
                this.owner.state.disabled = true;
                this.owner.buttonMode = false;
			},
			"enable": function () {
                this.owner.state.disabled = false;
                this.owner.buttonMode = true;
			},
			"toggle-disabled": function () {
                this.owner.buttonMode = this.owner.state.disabled;
                this.owner.state.disabled = !this.owner.state.disabled;
			}
		}
	});
}());

//##############################################################################
// LogicCarrier.js
//##############################################################################

/**
# COMPONENT **LogicCarrier**
This component allows this entity carry other entities with which it collides. Entities that this component should carry need to have a [[Logic-Portable]] component attached to notify this entity that they are portable.

## Dependencies:
- [[Collision-Group]] - This component will attach a [[Collision-Group]] to this entity if it does not already have this component. `LogicCarrier` uses a collision group to resolve its portable peers' collisions with itself before other world collisions are handled.
- [[Logic-Portable]] (on portable peer entity) - This component listens for 'carry-me' and 'release-me', commonly triggered by [[Logic-Portable]] on a colliding peer entity.

## Messages

### Listens for:
- **load** - On receiving this message, the component ensures that it has a peer collision group component, and adds one if not.
- **carry-me** - On receiving this message, the component triggers `add-collision-entity` on the entity to add the peer entity to its collision group.
  - @param message.entity ([[Entity]]) - Required. The peer entity requesting to be carried.
- **release-me** - On receiving this message, the component triggers `remove-collision-entity` on the entity to remove the peer entity from its collision group.
  - @param message.entity ([[Entity]]) - Required. The peer entity requesting to be released.

### Local Broadcasts
- **add-collision-entity** - On receiving a `carry-me` message, this component triggers this message to add the portable peer to the collision group.
  - @param message ([[Entity]]) - The entity being added to the collision group.
- **remove-collision-entity** - On receiving a `release-me` message, this component triggers this message to remove the portable peer to the collision group.
  - @param message ([[Entity]]) - The entity being removed from the collision group.

## JSON Definition:
    {
      "type": "LogicCarrier"
      // This component has no customizable properties.
    }
    
Requires: ["CollisionGroup"]
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicCarrier',
        constructor: function (definition) {},
        events: {
            "load": function (resp) {
                if (!this.owner.trigger('add-collision-entity', this.owner)) {
                    // This message wasn't handled, so add a CollisionGroup component and try again!
                    this.owner.addComponent(new platypus.components.CollisionGroup(this.owner, {}));
                    this.owner.trigger('add-collision-entity', this.owner);
                }
            },
            "carry-me": function (resp) {
                this.owner.trigger('add-collision-entity', resp.entity);
            },
            "release-me": function (resp) {
                this.owner.trigger('remove-collision-entity', resp.entity);
            }
        }
    });
}());

//##############################################################################
// LogicDelayMessage.js
//##############################################################################

/**
# COMPONENT **LogicDelayMessage**
This component allows certain messages to trigger new messages at a later time. This is useful for any sort of delayed reaction to events.

## Dependencies
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks the running counts on its delayed messages to determine whether to trigger any.
  - @param message.delta - To determine whether to trigger messages, the component keeps a running count of tick lengths.
- **[input messages]** - This component listens for messages as determined by the JSON settings.

### Local Broadcasts:
- **[output messages]** - This component triggers output messages as determined by the JSON settings.

## JSON Definition
    {
      "type": "LogicDelayMessage",
      
      "events": {
      // Required: This is a list of event objects that should be listened for, and the messages that they should trigger at some time in the future.
      
        "saw-clown": {
        // This component will use the following to determine when and what to send on hearing the "saw-clown" event.
        
          "event": "laugh",
          // This component will trigger "laugh"
          
          "message": {"feeling": "happy", "sincerity": "85%"}
          // This can be a value or object to pass as the message content with the "laugh" event.
          
          "delay": 1500,
          // This is the delay in milliseconds before which the new message should be triggered.
          
          "singleInstance": true,
          // This determines whether more "saw-clown" events triggered during the delayed response period should be treated as new messages to be triggered or whether the initial instance prevents additional instances from occurring.
          
          "repeat": true,
          // This sets whether the event should continue to trigger every "delay" amount of time until "cancelEvent" is called. Defaults to `false`.
          
          "cancelEvent": "dropped-popcorn"
          // If set, on receiving this event, the component will not trigger the "laugh" event after all if it's currently planning to.
        },
        
        // Multiple delay messages can be set up on this component.
        "move-right":{
          "event": "look-left",
          "delay": 7000
        }
      
      }
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var createMessage = function (event) {
            var includeMessage = function (event, message) {
                if (message && !event.message) {
                    return {
                        event: event.event,
                        message: message,
                        delay: event.delay,
                        repeat: event.repeat
                    };
                } else {
                    return event;
                }
            };
            if (event.singleInstance) {
                return function (message) {
                    var i = 0,
                        add = true;

                    for (i = 0; i < this.queue.length; i++) {
                        if (this.queue[i].event === event.event) {
                            add = false;
                        }
                    }

                    if (add) {
                        this.queue.push(includeMessage(event, message));
                        this.queueTimes.push(event.delay);
                    }
                };
            } else {
                return function (message) {
                    this.queue.push(includeMessage(event, message));
                    this.queueTimes.push(event.delay);
                };
            }
        },
        createCancellation = function (cancelEvent) {
            return function () {
                var i = 0;

                for (i = this.queue.length - 1; i > -1; i--) {
                    if (this.queue[i] === cancelEvent) {
                        this.queueTimes.splice(i, 1);
                        this.queue.splice(i, 1);
                    }
                }
            };
        };

    return platypus.createComponentClass({
        id: 'LogicDelayMessage',
        
        constructor: function (definition) {
            var event = '';
            
            this.queueTimes = [];
            this.queue = [];
            
            if (definition.events) {
                for (event in definition.events) {
                    if (definition.events.hasOwnProperty(event)) {
                        this.addEventListener(event, createMessage(definition.events[event]));

                        if (definition.events[event].cancelEvent) {
                            this.addEventListener(definition.events[event].cancelEvent, createCancellation(definition.events[event]));
                        }
                    }
                }
            }
        },

        events: {// These are messages that this component listens for
            "handle-logic":  function (resp) {
                var i = 0;
                
                for (i = this.queue.length - 1; i > -1; i--) {
                    this.queueTimes[i] -= resp.delta;
                    
                    if (this.queueTimes[i] <= 0) {
                        this.owner.trigger(this.queue[i].event, this.queue[i].message);
                        
                        if (this.queue[i]) { // Have to check this in case the delayed event matches the cancellation event which would cause this queued message to already be removed.
                            if (this.queue[i].repeat) {
                                this.queueTimes[i] += this.queue[i].delay;
                            } else {
                                this.queueTimes.splice(i, 1);
                                this.queue.splice(i, 1);
                            }
                        }
                    }
                }
            }
        },
        
        methods: {
            destroy: function () {
                this.queueTimes.length = 0;
                this.queue.length = 0;
            }
        }
    });
}());

//##############################################################################
// LogicDestroyMe.js
//##############################################################################

/**
 * This component allows an entity to be removed from the stage when "destroy-me" is triggered.
 * 
 * @namespace platypus.components
 * @class LogicDestroyMe
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";
    
    return platypus.createComponentClass({
        id: 'LogicDestroyMe',
        
        properties: {
            /**
             * Time in milliseconds after the "destroy-me" message is heard before entity should be removed.
             * 
             * @property delay
             * @type number
             * @default 0
             */
            delay: 0
        },
        
        publicProperties: {
            /**
             * Whether this entity has been destroyed. Typically `false` until a "destroy-me" event has been triggered. Available on the entity as `entity.destroyed`.
             * 
             * @property destroyed
             * @type boolean
             * @default false
             */
            destroyed: false
        },
        
        events: {// These are messages that this component listens for

            /**
             * On a `tick` logic message, the component checks whether it should be removed or not.
             * 
             * @method 'handle-logic'
             * @param message.delta {number} To measure the delay before removal, the component keeps a running count of step lengths.
             */
            "handle-logic": function (tick) {
                var dT = tick.delta;
                if (this.destroyed && !this.owner.state.paused) {
                    this.delay -= dT;
                    if (this.delay <= 0) {
                        this.owner.parent.removeEntity(this.owner);
                    }
                }
            },
            
            /**
             * This component will set the entity up for removal on receiving this message.
             * 
             * @method 'destroy-me'
             */
            "destroy-me": function () {
                this.destroyed = true;
            }
                   
        }
    });
}());

//##############################################################################
// LogicDirectionalMovement.js
//##############################################################################

/**
# COMPONENT **LogicDirectionalMovement**
This component changes the (x, y) position of an object according to its current speed and heading. It maintains its own heading information independent of other components allowing it to be used simultaneously with other logic components like [[Logic-Pushable]]. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course accordingly.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
  - @param message.delta - To determine how far to move the entity, the component checks the length of the tick.
- **[directional message]** - Directional messages include `go-down`, `go-south`, `go-down-left`, `go-southwest`, `go-left`, `go-west`, `go-up-left`, `go-northwest`, `go-up`, `go-north`, `go-up-right`, `go-northeast`, `go-right`, `go-east`, `go-down-right`, and `go-southeast`. On receiving one of these messages, the entity adjusts its movement heading.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
- **stop** - Stops motion in all directions until movement messages are again received.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.

### Local Broadcasts:
- **state-changed** - this component will trigger this message when its movement or direction changes. Note that directions are not mutually exclusive: adjacent directions can both be true, establishing that the entity is facing a diagonal direction.
  - @param message.moving (boolean) - whether the entity is in motion.
  - @param message.left (boolean)   - whether the entity is facing left.
  - @param message.right (boolean)  - whether the entity is facing right.
  - @param message.up (boolean)     - whether the entity is facing up.
  - @param message.down (boolean)   - whether the entity is facing down.

## JSON Definition:
    {
      "type": "LogicDirectionalMovement",
      
      "speed": 4.5
      // Optional. Defines the distance in world units that the entity should be moved per millisecond. Defaults to 0.3.
    }
*/
// Requires: ["Mover"]
/*global console */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var processDirection = function (direction) {
            return function (state) {
                this[direction] = (typeof state === 'undefined') || (state && (state.pressed !== false));
            };
        },
        doNothing = function () {},
        rotate = {
            x: function (heading, lastHeading) {
                if (heading !== lastHeading) {
                    if (((heading > 180) && (lastHeading <= 180)) || ((heading <= 180) && (lastHeading > 180))) {
                        this.owner.triggerEvent('transform', 'vertical');
                    }
                }
            },
            y: function (heading, lastHeading) {
                if (heading !== lastHeading) {
                    if (((heading > 90 && heading <= 270) && (lastHeading <= 90 || lastHeading > 270)) || ((heading <= 90 || heading > 270) && (lastHeading > 90 && lastHeading <= 270))) {
                        this.owner.triggerEvent('transform', 'horizontal');
                    }
                }
            },
            z: function (heading, lastHeading) {
                if (heading !== lastHeading) {
                    this.owner.triggerEvent('replace-transform', 'rotate-' + heading);
                }
            }
        };
    
    return platypus.createComponentClass({
        id: 'LogicDirectionalMovement',
        
        properties: {
            axis: 'y',
            heading: 0,
            speed: 0.3
        },
        
        constructor: function (definition) {
            var self = this;
            
            if (!isNaN(this.speed)) {
                this.speed = [this.speed, 0, 0];
            }
            this.initialVector = new platypus.Vector(this.speed);
            this.reorient = rotate[this.axis];
            if (!this.reorient) {
                this.reorient = doNothing;
            }
            
            this.owner.state.paused = false;
            
            if (definition.pause) {
                if (typeof definition.pause === 'string') {
                    this.pausers = [definition.pause];
                } else {
                    this.pausers = definition.pause;
                }
                this.addEventListener('state-changed', function (state) {
                    var i = 0,
                        paused = false;
                    
                    if (definition.pause) {
                        for (i = 0; i < self.pausers.length; i++) {
                            paused = paused || state[self.pausers[i]];
                        }
                        this.owner.state.paused = paused;
                    }
                });
            }

            this.state = this.owner.state;
            this.state.moving = false;
            this.state.left = false;
            this.state.right = false;
            this.state.up = false;
            this.state.down = false;

            this.moving = false;
            this.left = false;
            this.right = false;
            this.up = false;
            this.down = false;
            this.upLeft = false;
            this.upRight = false;
            this.downLeft = false;
            this.downRight = false;
            this.facing = 'right';
            
            this.owner.heading = 0;
        },
        events: {
            "component-added": function (component) {
                if (component === this) {
                    if (!this.owner.addMover) {
                        console.warn('The "LogicDirectionalMovement" component requires a "Mover" component to function correctly.');
                        return;
                    }

                    this.direction = this.owner.addMover({
                        vector: this.speed,
                        event: "moving",
                        orient: false
                    }).vector;
                    this.owner.triggerEvent('moving', this.moving);
                }
            },
            
            "handle-logic": function (resp) {
                var up        = this.up        || this.upLeft || this.downLeft,
                    upLeft    = this.upLeft    || (this.up   && this.left),
                    left      = this.left      || this.upLeft || this.downLeft,
                    downLeft  = this.downLeft  || (this.down && this.left),
                    down      = this.down      || this.downLeft || this.downRight,
                    downRight = this.downRight || (this.down && this.right),
                    right     = this.right     || this.upRight || this.downRight,
                    upRight   = this.upRight   || (this.up   && this.right);
                
                if (up && down) {
                    this.moving = false;
                } else if (left && right) {
                    this.moving = false;
                } else if (upLeft) {
                    this.moving = true;
                    this.facing = 'up-left';
                    this.heading = 225;
                } else if (upRight) {
                    this.moving = true;
                    this.facing = 'up-right';
                    this.heading = 315;
                } else if (downLeft) {
                    this.moving = true;
                    this.facing = 'down-left';
                    this.heading = 135;
                } else if (downRight) {
                    this.moving = true;
                    this.facing = 'down-right';
                    this.heading = 45;
                } else if (left) {
                    this.moving = true;
                    this.facing = 'left';
                    this.heading = 180;
                } else if (right) {
                    this.moving = true;
                    this.facing = 'right';
                    this.heading = 0;
                } else if (up) {
                    this.moving = true;
                    this.facing = 'up';
                    this.heading = 270;
                } else if (down) {
                    this.moving = true;
                    this.facing = 'down';
                    this.heading = 90;
                } else {
                    this.moving = false;
                    
                    // This is to retain the entity's direction even if there is no movement. There's probably a better way to do this since this is a bit of a retrofit. - DDD
                    switch (this.facing) {
                    case 'up':
                        up = true;
                        break;
                    case 'down':
                        down = true;
                        break;
                    case 'left':
                        left = true;
                        break;
                    case 'right':
                        right = true;
                        break;
                    case 'up-left':
                        up = true;
                        left = true;
                        break;
                    case 'up-right':
                        up = true;
                        right = true;
                        break;
                    case 'down-left':
                        down = true;
                        left = true;
                        break;
                    case 'down-right':
                        down = true;
                        right = true;
                        break;
                    }
                }
                
                if (this.owner.heading !== this.heading) {
                    this.direction.set(this.initialVector).rotate((this.heading / 180) * Math.PI);
                    this.reorient(this.heading, this.owner.heading);
                    this.owner.heading = this.heading;
                }
                
                //TODO: possibly remove the separation of this.state.direction and this.direction to just use state?
                if (this.state.moving !== this.moving) {
                    this.owner.triggerEvent('moving', this.moving);
                    this.state.moving = this.moving;
                }

                if (this.state.up !== up) {
                    this.state.up = up;
                }
                if (this.state.right !== right) {
                    this.state.right = right;
                }
                if (this.state.down !== down) {
                    this.state.down = down;
                }
                if (this.state.left !== left) {
                    this.state.left = left;
                }
            },
            
            "go-down": processDirection('down'),
            "go-south": processDirection('down'),
            "go-down-left": processDirection('downLeft'),
            "go-southwest": processDirection('downLeft'),
            "go-left": processDirection('left'),
            "go-west": processDirection('left'),
            "go-up-left": processDirection('upLeft'),
            "go-northwest": processDirection('upLeft'),
            "go-up": processDirection('up'),
            "go-north": processDirection('up'),
            "go-up-right": processDirection('upRight'),
            "go-northeast": processDirection('upRight'),
            "go-right": processDirection('right'),
            "go-east": processDirection('right'),
            "go-down-right": processDirection('downRight'),
            "go-southeast": processDirection('downRight'),

            "stop": function (state) {
                if (!state || (state.pressed !== false)) {
                    this.left = false;
                    this.right = false;
                    this.up = false;
                    this.down = false;
                    this.upLeft = false;
                    this.upRight = false;
                    this.downLeft = false;
                    this.downRight = false;
                }
            },
            
            "accelerate": function (velocity) {
                this.initialVector.normalize().multiply(velocity);
                this.direction.normalize().multiply(velocity);
            }
        }
    });
}());

//##############################################################################
// LogicDragDrop.js
//##############################################################################

/**
# COMPONENT **LogicDragDrop**
A component that allows an object to be dragged and dropped. Can use collision to prevent dropping the objects in certain locations.
NOTE: HandlerRender and the RenderSprite used by this entity need to have their 'touch' or 'click' inputs set to true.

## Dependencies
- [[HandlerLogic]] - Listens for the handle-logic and handle-post-collision-logic calls.
- [[RenderSprite]] - Listens for 'mouseup', 'mousedown', and 'pressmove' calls.

## Messages

### Listens for:
- **handle-logic** - Updates the object's location on the handle-logic tick.
  - @param resp (object) - The tick coming from the scene.
- **handle-post-collision-logic** - Resolves whether the object state after we check if there are any collisions. If the object was dropped and can be dropped, it is.
  - @param resp (object) - The tick coming from the scene.
- **mousedown** - The mousedown event passed from the render component. Fired when we're grabbing the object. Starts the drag.
  - @param eventData (object) - The event data.
- **mouseup** - The mouseup event passed from the render component. Fired when we're trying to drop the object. 
  - @param eventData (object) - The event data.
- **pressmove** - The pressmove event passed from the render component. Tells us when we're dragging the object.
  - @param eventData (object) - The event data.
- **no-drop** - The message passed from the collision system letting us know the object is currently in a location that it cannot be dropped. 
  - @param collisionData (object) - The event data.  
  
## JSON Definition
    {
        "type": "LogicDragDrop"
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        /*********************************************************************
         "createComponentClass" creates the component class and adds the
         following methods and properties that can be referenced from your
         own methods and events:
         
         Property this.owner - a reference to the component's Entity
         Property this.type  - identical to the id provided below
        *********************************************************************/
        
        id: 'LogicDragDrop',
        
        constructor: function (definition) {
            this.nextX = this.owner.x;
            this.nextY = this.owner.y;
            this.grabOffsetX = 0;
            this.grabOffsetY = 0;
            this.owner.state.dragging = false;
            this.owner.state.noDrop = false;
            
            this.tryDrop = false;
            this.hitSomething = false;
        },

        events: {// These are messages that this component listens for
            "handle-logic": function (resp) {
                this.owner.x = this.nextX;
                this.owner.y = this.nextY;
                
                this.owner.state.noDrop = false;
                
            },
            "handle-post-collision-logic": function (resp) {
                if (this.tryDrop) {
                    this.tryDrop = false;
                    if (this.hitSomething) {
                        this.dropFailed = false;
                        this.owner.state.noDrop = true;
                        this.owner.state.dragging = true;
                    } else {
                        this.owner.state.noDrop = false;
                        this.owner.state.dragging = false;
                    }
                    
                } else if (this.hitSomething) {
                    this.owner.state.noDrop = true;
                }
                this.hitSomething = false;
            },
            "mousedown": function (eventData) {
                this.grabOffsetX = eventData.x - this.owner.x;
                this.grabOffsetY = eventData.y - this.owner.y;
                this.owner.state.dragging = true;
            },
            "mouseup": function (eventData) {
                this.tryDrop = true;
            },
            "pressmove": function (eventData) {
                this.nextX = eventData.x - this.grabOffsetX;
                this.nextY = eventData.y - this.grabOffsetY;
            },
            "no-drop": function (collisionData) {
                this.hitSomething = true;
            }
        },
        
        methods: {// These are methods that are called by this component.
            destroy: function () {
                this.owner.state.dragging = null;
                this.owner.state.noDrop = null;
            }
            
        },
        
        publicMethods: {// These are methods that are available on the entity.
            
            
        }
    });
}());

//##############################################################################
// LogicImpactLaunch.js
//##############################################################################

/**
# COMPONENT **LogicImpactLaunch**
This component will cause the entity to move in a certain direction on colliding with another entity.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **impact-launch** - On receiving this message, the component causes the entity's position to change according to the preset behavior.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.
- **hit-solid** - On receiving this message, the component discontinues its impact-launch behavior.
  - @param collisionInfo.y (number) - Either 1,0, or -1. If colliding below, impact-launch behavior ceases.

## JSON Definition:
    {
      "type": "LogicImpactLaunch",
      
      "state": "launching",
      // Optional: This sets the state of the entity while it's being launched. Defaults to "stunned".
      
      "accelerationX": 5,
      "accelerationY": 5,
      // Optional: acceleration entity should have in world units while being launched. Defaults to -0.2 for x and -0.6 for y.
      
      "flipX": true,
      "flipY": true
      // Optional: whether the directions of acceleration should flip according to the direction of the collision. Defaults to false for y and true for x.
    }

*/
/*global console */
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicImpactLaunch',
        constructor: function (definition) {
            this.stunState = definition.state || "stunned";
            
            this.aX = this.owner.accelerationX || definition.accelerationX || -0.2;
            this.aY = this.owner.accelerationY || definition.accelerationY || -0.6;
            this.flipX = ((this.owner.flipX === false) || ((this.owner.flipX !== true) && (definition.flipX === false))) ? 1 : -1;
            this.flipY = (this.owner.flipY || definition.flipY) ? -1 : 1;
            this.mX = 1;
            this.mY = 1;
            
            if (typeof this.owner.dx !== 'number') {
                this.owner.dx = 0;
            }
            if (typeof this.owner.dy !== 'number') {
                this.owner.dy = 0;
            }
            
            this.justJumped = false;
            this.stunned = false;
            
            this.state = this.owner.state;
            this.state.impact  = false;
            this.state[this.stunState] = false;

            // Notes definition changes from older versions of this component.
            if (definition.message) {
                console.warn('"' + this.type + '" components no longer accept "message": "' + definition.message + '" as a definition parameter. Use "aliases": {"' + definition.message + '": "impact-launch"} instead.');
            }
        },
        
        events: {
            "handle-logic": function () {
                if (this.state.impact !== this.justJumped) {
                    this.state.impact = this.justJumped;
                }
                if (this.state[this.stunState] !== this.stunned) {
                    this.state[this.stunState] = this.stunned;
                }

                if (this.justJumped) {
                    this.justJumped = false;
                    this.stunned = true;
                    this.owner.dx = this.aX * this.mX;
                    this.owner.dy = this.aY * this.mY;
                }
            },
            
            "impact-launch": function (collisionInfo) {
                var dx = collisionInfo.x,
                    dy = collisionInfo.y;
                
                if (collisionInfo.entity) {
                    dx = collisionInfo.entity.x - this.owner.x;
                    dy = collisionInfo.entity.y - this.owner.y;
                }

                if (!this.stunned) {
                    this.justJumped = true;
                    this.owner.dx = 0;
                    if (dx > 0) {
                        this.mX = 1;
                    } else if (dx < 0) {
                        this.mX = this.flipX;
                    }
                    this.owner.dy = 0;
                    if (dy > 0) {
                        this.mY = 1;
                    } else if (dy < 0) {
                        this.mY = this.flipY;
                    }
                }
                return true;
            },
            
            "hit-solid": function (collisionInfo) {
                if (this.stunned && (collisionInfo.y > 0)) {
                    this.stunned = false;
                    this.owner.dx = 0;
                    this.owner.dy = 0;
                }
                return true;
            }
        }
    });
}());

//##############################################################################
// LogicPacingPlatform.js
//##############################################################################

/**
# COMPONENT **LogicPacingPlatform**
This component changes the (x, y) position of an object according to its speed and heading and alternates back and forth. This is useful for in-place moving platforms.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
  - @param message.delta - To determine how far to move the entity, the component checks the length of the tick.

## JSON Definition:
    {
      "type": "LogicDirectionalMovement",
      
      "angle": 3.14,
      // Optional. Defines the angle of movement in radians. Defaults to 0 (horizontal, starts moving right).
      
      "distance": 440,
      // Optional. Declares distance in world units that the entity should move back and forth across. Defaults to 128.
      
      "period": 6000,
      // Optional. Sets the time in milliseconds that the entity should take to make a complete movement cycle. Defaults to 4 seconds (4000).
      
      "startPos": 0
      // Optional. Position in the cycle that the movement should begin. Defaults in the middle at 0; PI/2 and -PI/2 will put you at the extremes.
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'LogicPacingPlatform',
        
        constructor: function (definition) {
            this.ang              = this.owner.angle      || definition.angle     || 0; //PI/2 makes it go down first
            this.dist              = this.owner.distance || definition.distance || 128; //Distance in pixels
            this.period              = this.owner.period    || definition.period     || 4000;
            this.time              = 0;
            this.startPos          = this.owner.startPos || definition.startPos || 0; //PI/2 and -PI/2 will put you at the extremes
            this.offset             = 0;
            this.originX          = this.owner.x;
            this.originY          = this.owner.y;
        },

        events: {// These are messages that this component listens for
            'handle-logic': function (update) {
                var delta = update.delta;
                
                this.time += delta;
                if (this.time > this.period) {
                    this.time = this.time % this.period;
                }
                this.offset = (this.time / this.period) * (2 * Math.PI);
                
                this.owner.x = this.originX + Math.sin(this.offset + this.startPos) * this.dist * Math.cos(this.ang);
                this.owner.y = this.originY + Math.sin(this.offset + this.startPos) * this.dist * Math.sin(this.ang);
            }
        }
    });
}());

//##############################################################################
// LogicPortable.js
//##############################################################################

/**
# COMPONENT **LogicPortable**
This component allows this entity to be carried by other entities with which it collides. Entities that should carry this entity need to have a [[Logic-Carrier]] component attached.

## Dependencies:
- [[HandlerLogic]] (on parent entity) - This component listens for 'handle-logic' messages to determine whether it should be carried or released each game step.
- [[LogicCarrier]] (on peer entity) - This component triggers 'carry-me' and 'release-me' message, listened for by [[Logic-Carrier]] to handle carrying this entity.

## Messages

### Listens for:
- **handle-logic** - On receiving this message, this component triggers 'carry-me' or 'release-me' if its connection to a carrying entity has changed.
- **hit-solid** - On receiving this message, this component determines whether it is hitting its carrier or another entity. If it is hitting a new carrier, it will broadcast 'carry-me' on the next game step.
  - @param message.entity ([[Entity]]) - The entity with which the collision occurred.
  - @param message.x (number) - -1, 0, or 1 indicating on which side of this entity the collision occurred: left, neither, or right respectively.
  - @param message.y (number) - -1, 0, or 1 indicating on which side of this entity the collision occurred: top, neither, or bottom respectively.

### Peer Broadcasts
- **carry-me** - This message is triggered on a potential carrying peer, notifying the peer that this entity is portable.
  - @param message.entity ([[Entity]]) - This entity, requesting to be carried.
- **release-me** - This message is triggered on the current carrier, notifying them to release this entity.
  - @param message.entity ([[Entity]]) - This entity, requesting to be released.

## JSON Definition:
    {
      "type": "LogicPortable",

      "portableDirections": {down: true}
      // This is an object specifying the directions that this portable entity can be carried on. Default is {down:true}, but "up", "down", "left", and/or "right" can be specified as object properties set to `true`.
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicPortable',
        constructor: function (definition) {
            this.portableDirections = definition.portableDirections || {
                down: true //default is false, 'true' means as soon as carrier is connected downward
            };
    
            this.carrier      = this.lastCarrier = undefined;
            this.message      = {
                entity: this.owner
            };
        },
        events: {
            "handle-logic": function (resp) {
                if (this.carrierConnected) {
                    if (this.carrier !== this.lastCarrier) {
                        if (this.lastCarrier) {
                            this.lastCarrier.trigger('release-me', this.message);
                        }
                        this.carrier.trigger('carry-me', this.message);
                    }
                    
                    this.carrierConnected = false;
                } else {
                    if (this.carrier) {
                        this.carrier.trigger('release-me', this.message);
                        this.carrier = undefined;
                    }
                }
                this.lastCarrier = this.carrier;
            },
            "hit-solid": function (collisionInfo) {
                if (collisionInfo.y > 0) {
                    this.updateCarrier(collisionInfo.entity, 'down');
                } else if (collisionInfo.y < 0) {
                    this.updateCarrier(collisionInfo.entity, 'up');
                } else if (collisionInfo.x < 0) {
                    this.updateCarrier(collisionInfo.entity, 'left');
                } else if (collisionInfo.x > 0) {
                    this.updateCarrier(collisionInfo.entity, 'right');
                }
            }
        },
        methods: {
            updateCarrier: function (entity, direction) {
                if (this.portableDirections[direction]) {
                    if (entity) {
                        if (entity !== this.carrier) {
                            this.carrier = entity;
                        }
                        this.carrierConnected = true;
                    }
                }
            }
        }
    });
}());

//##############################################################################
// LogicPortal.js
//##############################################################################

/**
# COMPONENT **LogicPortal**
A component which changes the scene when activated. When the portal receives an occupied message it sends the entity in that message notifying it. This message is meant to give the entity a chance to activate the portal in the manner it wants. The portal can also be activated by simply telling it to activate.

## Dependencies
- [[HandlerLogic]] (on entity's parent) - This component listens for a "handle-logic" message it then checks to see if it should change the scene if the portal is activated.
- [[SceneChanger]] (on entity) - This component listens for the "new-scene" message that the LogicPortal sends and actually handles the scene changing.
- [[CollisionBasic]] (on entity) - Not required, but if we want the 'occupied-portal' call to fire on collision you'll need to have a CollisionBasic component on the portal.

## Messages

### Listens for:
- **handle-logic** - Checks to see if we should change scene if the portal is activated.
- **occupied-portal** - This message takes an entity and then sends the entity a 'portal-waiting' message. The idea behind this was that you could use it with collision. When an entity gets in front of the portal the collision sends this message, we then tell the entity that collided to do whatever it needs and then it calls back to activate the portal.
  - @param message.entity (entity Object) - The entity that will receive the 'portal-waiting' message.
- **activate-portal** - This message turns the portal on. The next 'handle-logic' call will cause a change of scene.

### Local Broadcasts:
- **new-scene** - Calls the 'SceneChanger' component to tell it to change scenes.
  - @param object.destination (string) - The id of the scene that we want to go to.

### Peer Broadcasts:
- **portal-waiting** - Informs another object that the portal is waiting on it to send the activate message.
  - @param entity - This is the portal entity. To be used so that the object can communicate with it directly.

## JSON Definition
    {
      "type": "name-of-component",
      "destination" : "level-2"
      //Required - The destination scene to which the portal will take us. In most cases this will come into the portal from Tiled where you'll set a property on the portal you place.
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicPortal',
        constructor: function (definition) {
            var i = 0,
                entrants = definition.entrants || definition.entrant;
             
            this.destination = this.owner.destination || definition.destination;
            this.used = false;
            this.ready = false;
            this.wasReady = false;
            if (entrants) {
                this.entrants = {};
                if (Array.isArray(entrants)) {
                    for (i = 0; i < entrants.length; i++) {
                        this.entrants[entrants[i]] = false;
                    }
                } else {
                    this.entrants[entrants] = false;
                }
            }
        },
        events: {
            "handle-logic": function () {
                var i = '';
                
                if (!this.used && this.activated) {
                    this.owner.trigger("port-" + this.destination);
                    this.used = true;
                } else if (this.ready && !this.wasReady) {
                    this.owner.triggerEvent('portal-waiting');
                    this.wasReady = true;
                } else if (this.wasReady && !this.ready) {
                    this.owner.triggerEvent('portal-not-waiting');
                    this.wasReady = false;
                }
                
                this.owner.state.occupied = false;
                this.owner.state.ready = true;
                
                //Reset portal for next collision run.
                for (i in this.entrants) {
                    if (this.entrants.hasOwnProperty(i)) {
                        if (this.entrants[i]) {
                            this.owner.state.occupied = true;
                            this.entrants[i] = false;
                        } else {
                            this.owner.state.ready = false;
                        }
                    }
                }
                this.ready = false;
            },
            "occupied-portal": function (collision) {
                var i = '';
                
                this.entrants[collision.entity.type] = true;
                
                for (i in this.entrants) {
                    if (this.entrants.hasOwnProperty(i) && !this.entrants[i]) {
                        return;
                    }
                }
                
                this.ready = true;
            },
            "activate-portal": function () {
                this.activated = true;
            }
        }
    });
}());

//##############################################################################
// LogicPushable.js
//##############################################################################

/**
# COMPONENT **LogicPushable**
A component that enables an entity to be pushed.

## Dependencies
- [[HandlerLogic]] (on entity's parent) - This component listens for a "handle-logic" message. It then moves the entity if it's being pushed.
- [[CollisionBasic]] (on entity) - This component listens for messages from the CollisionBasic component. In particular 'hit-solid' and 'push-entity' are coming from collision. 

## Messages

### Listens for:
- **handle-logic** - Checks to see if we're being pushed. If so, we get pushed. Then resets values.
  - @param resp.delta (number) - The time since the last tick.
- **push-entity** - Received when we collide with an object that can push us. We resolve which side we're colliding on and set up the currentPushX and currentPushY values so we'll move on the handle-logic call.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.
- **hit-solid** - Called when the entity collides with a solid object. Stops the object from being pushed further in that direction.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.

## JSON Definition
    {
      "type": "LogicPushable",
       "xPush" : .01,
      //Optional - The distance per millisecond this object can be pushed in x. Defaults to .01.
      "yPush" : .01,
      //Optional - The distance per millisecond this object can be pushed in y. Defaults to .01.
      "push" : .01
      //Optional - The distance per millisecond this object can be pushed in x and y. Overwritten by the more specific values xPush and yPush. Defaults to .01.
    }
*/

/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var setMagnitude = function (direction, magnitude) {
        return (direction / Math.abs(direction)) * magnitude;
    };
    
    return platypus.createComponentClass({
        id: 'LogicPushable',
        constructor: function (definition) {
            this.yPush = definition.push || definition.yPush || 0;
            this.xPush = definition.push || definition.xPush || 0.1;
            if (definition.roll) {
                this.radius = definition.radius || this.owner.radius || ((this.owner.width || this.owner.height || 2) / 2);
                this.owner.orientation = this.owner.orientation || 0;
            } else {
                this.radius = 0;
            }
            this.currentPushX = 0;
            this.currentPushY = 0;
            this.lastX = this.owner.x;
            this.lastY = this.owner.y;
            this.pushers = [];
        },
        events: {
            "handle-logic": function (resp) {
                var i = 0,
                    delta = resp.delta;
                
                if (this.currentPushY) {
                    this.owner.y += setMagnitude(this.currentPushY, this.yPush * delta);
                    this.currentPushY = 0;
                }
                if (this.currentPushX) {
                    this.owner.x += setMagnitude(this.currentPushX, this.xPush * delta);
                    this.currentPushX = 0;
                }
                if ((this.lastX !== this.owner.x) || (this.lastY !== this.owner.y)) {
                    if (this.radius) {
                        this.owner.orientation += (this.owner.x + this.owner.y - this.lastX - this.lastY) / this.radius;
                    }
                    this.lastX = this.owner.x;
                    this.lastY = this.owner.y;
                }
                for (i = 0; i < this.pushers.length; i++) {
                    this.pushers[i].triggerEvent('pushed', this.owner);
                }
                this.pushers.length = 0;
            },
            "push-entity": function (collisionInfo) {
                var x = (collisionInfo.x || 0),
                    y = (collisionInfo.y || 0);
                
                this.currentPushX -= x;
                this.currentPushY -= y;
                if ((this.yPush && y) || (this.xPush && x)) {
                    this.pushers.push(collisionInfo.entity);
                }
            },
            "hit-solid": function (collisionInfo) {
                if (((collisionInfo.y > 0) && (this.vY > 0)) || ((collisionInfo.y < 0) && (this.vY < 0))) {
                    this.vY = 0;
                } else if (((collisionInfo.x < 0) && (this.vX < 0)) || ((collisionInfo.x > 0) && (this.vX > 0))) {
                    this.vX = 0;
                }
                return true;
            }
        }
    });
}());

//##############################################################################
// LogicRebounder.js
//##############################################################################

/**
# COMPONENT **LogicRebounder**
This component works with `CollisionBasic` to cause entities to bounce away on solid collisions.

## Dependencies
- [[CollisionBasic]] - Relies on collision messages to perform rebounding movement.

## Messages

### Listens for:
- **handle-logic** - On receiving this message, `LogicRebounder` clears its stored collision information.
- **hit-static** - On receiving this message, `LogicRebounder` rebounds.
  - @param message.direction (2d vector) - This is the direction in which the collision occurred, tangental to the impact interface.
- **hit-non-static** - On receiving this message, `LogicRebounder` rebounds.
  - @param message.direction (2d vector) - This is the direction in which the collision occurred, tangental to the impact interface.
  - @param message.entity ([[entity]]) - This is the entity with which this entity is colliding.
- **share-velocity** - On receiving this message, `LogicRebounder` stores collision information.
  - @param entity ([[entity]]) - This is the entity with which this entity is colliding.

### Peer Broadcasts:
- **share-velocity** - This component triggers this message to prevent double collision calls.
  - @param entity ([[entity]]) - This entity.

## JSON Definition
    {
      "type": "LogicRebounder",
      
      "mass": 12,
      // Optional. Relative size of the entity. Defaults to 1.
      
      "elasticity": 0.4
      // Optional. Bounciness of the entity. Defaults to 0.8.
    }

Requires: ["../Vector.js"]
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicRebounder',
        
        constructor: function (definition) {
            platypus.Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');

            this.owner.mass = this.owner.mass || definition.mass || 1;
            this.elasticity = definition.elasticity || 0.8;
            
            this.v = new platypus.Vector(0, 0, 0);
            this.incidentVector = new platypus.Vector(0, 0, 0);
            
            this.staticCollisionOccurred = false;
            this.nonStaticCollisionOccurred = false;
            
            this.hitThisTick = [];
            this.otherV = new platypus.Vector(0, 0, 0);
            this.otherVelocityData = [];
        },

        events: {// These are messages that this component listens for
            "handle-logic": function (resp) {
                this.hitThisTick = [];
                this.otherVelocityData.length = 0;
            },
            "hit-static": function (collData) {
                var magnitude = 0;
                
                this.v.set(this.owner.velocity);
                this.incidentVector.set(collData.direction);
                
                magnitude = this.v.scalarProjection(this.incidentVector);
                if (!isNaN(magnitude)) {
                    this.incidentVector.scale(magnitude * (1 + this.elasticity));
                    this.v.subtractVector(this.incidentVector);
                }
                
                this.owner.velocity.set(this.v);
            },
            "hit-non-static": function (collData) {
                var x = 0,
                    other          = collData.entity,
                    otherVSet      = false,
                    relevantV      = 0,
                    otherRelevantV = 0,
                    reboundV       = 0;
                
                for (x = 0; x < this.hitThisTick.length; x++) {
                    if (other === this.hitThisTick[x]) {
                        return;
                    }
                }
                this.hitThisTick.push(other);
                
                for (x = 0; x < this.otherVelocityData.length; x++) {
                    if (other === this.otherVelocityData[x].entity) {
                        this.otherV.set(this.otherVelocityData[x].velocity);
                        otherVSet = true;
                        break;
                    }
                }
                
                if (!otherVSet) {
                    this.otherV.set(other.velocity);
                    other.triggerEvent('share-velocity', this.owner);
                }
                
                this.v.set(this.owner.velocity);
                this.incidentVector.set(collData.direction);
                
                
                relevantV = this.v.scalarProjection(this.incidentVector);
                relevantV = (isNaN(relevantV)) ? 0 : relevantV;
                otherRelevantV = this.otherV.scalarProjection(this.incidentVector);
                otherRelevantV = (isNaN(otherRelevantV)) ? 0 : otherRelevantV;
                
                reboundV = (relevantV * (this.owner.mass - other.mass) + 2 * other.mass * otherRelevantV) / (this.owner.mass + other.mass);
                
                this.incidentVector.scale(reboundV - relevantV);
                
                this.owner.velocity.set(this.incidentVector);
                
            },
            "share-velocity": function (other) {
                this.otherVelocityData.push({entity: other, velocity: new platypus.Vector(other.velocity)});
            }
        },
        
        methods: {// These are methods that are called by this component.
            destroy: function () {
                this.v = null;
                this.otherV = null;
                this.incidentVector = null;
                this.hitThisTick = null;
            }
        },
        
        publicMethods: {// These are methods that are available on the entity.

        }
    });
}());

//##############################################################################
// LogicRegionSpawner.js
//##############################################################################

/**
# COMPONENT **LogicRegionSpawner**
This component spawns new entities within a given area at set intervals.

## Dependencies
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to determine whether to spawn another entity.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component determines whether to spawn another entity.
  - @param message.delta - To determine whether to spawn, the component keeps a running count of tick lengths.

## JSON Definition
    {
      "type": "LogicSpawner",
      // List all additional parameters and their possible values here.
      
      "spawn": "teddy-bear",
      // Required. String identifying the type of entity to spawn.
      
      "interval": 30000,
      // Optional. Time in milliseconds between spawning an entity. Defaults to 1000.
      
      "regions": {
      // If spawning entity covers a large area, the spawned entities can be randomly spawned over a regional grid, so that the whole area gets a somewhat uniform coverage of spawned entities

        "width": 4000,
        "height": 5000,
        // Optional. Dimensions of a spawning region in world units. Defaults to entity's dimensions. The entity's dimensions are sliced into chunks of this size for spawn distribution.
      }
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'LogicRegionSpawner',
        
        constructor: function (definition) {
            var x       = 0,
                y       = 0,
                columns = 1,
                rows    = 1,
                width   = 0,
                height  = 0,
                rw      = 0,
                rh      = 0;
            
            this.spawnPosition = {
                x: 0,
                y: 0
            };
            this.spawnProperties = {
                properties: this.spawnPosition
            };
            
            this.regions = null;
            this.usedRegions = null;
            this.regionWidth = 0;
            this.regionHeight = 0;
            if (definition.regions) {
                this.regions = [];
                this.usedRegions = [];
                this.regionWidth  = width  = definition.regions.width  || this.owner.width;
                this.regionHeight = height = definition.regions.height || this.owner.height;
                columns = Math.round(this.owner.width  / width);
                rows    = Math.round(this.owner.height / height);
                for (x = 0; x < columns; x++) {
                    for (y = 0; y < rows; y++) {
                        rw = Math.min(width,  this.owner.width  - x * width);
                        rh = Math.min(height, this.owner.height - y * height);
                        this.regions.push({
                            x: x * width,
                            y: y * height,
                            width: rw,
                            height: rh
                        });
                    }
                }
            }
            
            this.entityClass = platypus.game.settings.entities[definition.spawn];
            
            this.interval = this.owner.interval || definition.interval || 1000;
            this.time = 0;
        },

        events: {// These are messages that this component listens for
            "handle-logic": function (resp) {
                var regions = this.regions,
                    region  = null;
                
                this.time += resp.delta;
                
                if (this.time > this.interval) {
                    this.time -= this.interval;
                    
                    if (regions) {
                        if (!regions.length) {
                            this.regions = this.usedRegions;
                            this.usedRegions = regions;
                            regions = this.regions;
                        }
                        
                        region = regions[Math.floor(regions.length * Math.random())];
                        
                        this.spawnPosition.x = this.owner.x - (this.owner.regX || 0) + (region.x + (Math.random() * region.width));
                        this.spawnPosition.y = this.owner.y - (this.owner.regY || 0) + (region.y + (Math.random() * region.height));
                    } else {
                        this.spawnPosition.x = this.owner.x - (this.owner.regX || 0) + (Math.random() * this.owner.width);
                        this.spawnPosition.y = this.owner.y - (this.owner.regY || 0) + (Math.random() * this.owner.height);
                    }

                    this.owner.triggerEvent('entity-created', this.owner.parent.addEntity(new platypus.Entity(this.entityClass, this.spawnProperties)));
                }
            }
        }
    });
}());

//##############################################################################
// LogicRotationalMovement.js
//##############################################################################

/**
# COMPONENT **LogicRotationalMovement**
This component changes the (x, y) position of an object according to its current speed and heading. It maintains its own heading information independent of other components allowing it to be used simultaneously with other logic components like [[Logic-Pushable]]. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course accordingly.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
  - @param message.delta - To determine how far to move the entity, the component checks the length of the tick.
- **[directional message]** - Directional messages include `turn-left`, `turn-right`, `go-forward`, and `go-backward`. On receiving one of these messages, the entity adjusts its movement and orientation.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new orientation.
- **stop** - Stops rotational and linear motion movement messages are again received.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.
- **stop-turning** - Stops rotational motion until movement messages are again received.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.
- **stop-moving** - Stops linear motion until movement messages are again received.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.

## JSON Definition:
    {
      "type": "LogicRotationalMovement",
      
      "speed": 4.5,
      // Optional. Defines the distance in world units that the entity should be moved per millisecond. Defaults to 0.3.
      
      "angle": 0,
      // Optional: Radian orientation that entity should begin in. Defaults to 0 (facing right).
      
      "degree": 0.1
      // Optional: Unit in radian that the angle should change per millisecond.
    }
*/
/*global platypus */
(function () {
    "use strict";

    var pi  = Math.PI,
        cos = Math.cos,
        sin = Math.sin,
        polarToCartesianX = function (m, a) {
            return m * cos(a);
        },
        polarToCartesianY = function (m, a) {
            return m * sin(a);
        };
    
    return platypus.createComponentClass({
        id: 'LogicRotationalMovement',
        constructor: function (definition) {
            this.speed = definition.speed || 0.3;
            this.magnitude = 0;
            this.degree = (definition.degree || 1) * pi / 180;
            this.angle = definition.angle || 0;
            
            this.state = this.owner.state;
            this.state.moving       = false;
            this.state.turningRight = false;
            this.state.turningLeft  = false;
    
            this.owner.orientation  = 0;
            
            this.moving = false;
            this.turningRight = false;
            this.turningLeft = false;
        },
        events: {
            "handle-logic": function (resp) {
                var vX = 0,
                    vY = 0;
                
                if (this.turningRight) {
                    this.angle += this.degree * resp.delta / 15;
                }
        
                if (this.turningLeft) {
                    this.angle -= this.degree * resp.delta / 15;
                }
                
                if (this.moving) {
                    vX = polarToCartesianX(this.magnitude, this.angle);
                    vY = polarToCartesianY(this.magnitude, this.angle);
                }
        
                this.owner.x += (vX * resp.delta);
                this.owner.y += (vY * resp.delta);
                
                if (this.state.moving !== this.moving) {
                    this.state.moving = this.moving;
                }
                if (this.state.turningLeft !== this.turningLeft) {
                    this.state.turningLeft = this.turningLeft;
                }
                if (this.state.turningRight !== this.turningRight) {
                    this.state.turningRight = this.turningRight;
                }
                if (this.owner.orientation !== this.angle) {
                    this.owner.orientation = this.angle;
                }
            },
            "turn-right": function (state) {
                if (state) {
                    this.turningRight = state.pressed;
                } else {
                    this.turningRight = true;
                }
            },
            "turn-left": function (state) {
                if (state) {
                    this.turningLeft = state.pressed;
                } else {
                    this.turningLeft = true;
                }
            },
            "go-forward": function (state) {
                if (!state || state.pressed) {
                    this.moving = true;
                    this.magnitude = this.speed;
                } else {
                    this.moving = false;
                }
            },
            "go-backward": function (state) {
                if (!state || state.pressed) {
                    this.moving = true;
                    this.magnitude = -this.speed;
                } else {
                    this.moving = false;
                }
            },
            "stop": function (state) {
                if (!state || state.pressed) {
                    this.moving = false;
                    this.turningLeft = false;
                    this.turningRight = false;
                }
            },
            "stop-moving": function (state) {
                if (!state || state.pressed) {
                    this.moving = false;
                }
            },
            "stop-turning": function (state) {
                if (!state || state.pressed) {
                    this.turningLeft = false;
                    this.turningRight = false;
                }
            }
        }
    });
}());

//##############################################################################
// LogicSpawner.js
//##############################################################################

/**
# COMPONENT **LogicSpawner**
This component creates an entity and propels it away. This is useful for casting, firing, tossing, and related behaviors.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to determine whether it should be spawning or not.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks its current state to decide whether to spawn entities.
- **spawn** - creates an entity on the following tick message.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: false results in no entities being created. Is this primarily for controller input.

## JSON Definition
    {
      "type": "LogicSpawner"
      // List all additional parameters and their possible values here.

      "spawneeClass": "wet-noodle",
      // Required: string identifying the type of entity to create.
      
      "state": "tossing",
      // Optional. The entity state that should be true while entities are being created. Defaults to "firing".
      
      "speed": 4,
      // Optional. The velocity with which the entity should start. Initial direction is determined by this entity's facing states ("top", "right", etc).
      
      "offsetX": 45,
      "offsetY": -20,
      // Optional. Location relative to the entity where the should be located once created. Defaults to (0, 0).
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'LogicSpawner',
        
        constructor: function (definition) {
            var className = this.owner.spawneeClass || definition.spawneeClass,
                prop = '',
                x = 0;

            this.state = this.owner.state;
            this.stateName = definition.state || 'spawning';
            this.entityClass = platypus.game.settings.entities[className];
            this.speed = definition.speed || this.owner.speed || 0;

            this.state[this.stateName] = false;
            
            this.spawneeProperties = {
                x:  0,
                y:  0,
                z:  0,
                dx: 0,
                dy: 0,
                spawner: this.owner
            };
            
            if (definition.passOnProperties) {
                for (x = 0; x < definition.passOnProperties.length; x++) {
                    prop = definition.passOnProperties[x];
                    if (this.owner[prop]) {
                        this.spawneeProperties[prop] = this.owner[prop];
                    }
                }
            }
            
            
            this.propertiesContainer = {
                properties: this.spawneeProperties
            };
            
            this.offsetX = this.owner.offsetX || definition.offsetX || 0;
            this.offsetY = this.owner.offsetY || definition.offsetY || 0;
            
            this.firing = false;
        },

        events: {// These are messages that this component listens for
            "handle-logic": function () {
                var offset = 0,
                    classZ = 0,
                    state  = this.state;
                
                if (this.firing) {
                    this.spawneeProperties.x = this.owner.x;
                    this.spawneeProperties.y = this.owner.y;
                    classZ = (this.entityClass.properties && this.entityClass.properties.z) ? this.entityClass.properties.z : 0;
                    this.spawneeProperties.z = this.owner.z + classZ;
                    
                    offset = this.offsetX;
                    if (state.left) {
                        offset *= -1;
                    }
                    this.spawneeProperties.x += offset;
                    
                    offset = this.offsetY;
                    if (state.top) {
                        offset *= -1;
                    }
                    this.spawneeProperties.y += offset;
                    
                    if (this.speed) {
                        if (state.top) {
                            this.spawneeProperties.dy = -this.speed;
                        } else if (state.bottom) {
                            this.spawneeProperties.dy = this.speed;
                        } else {
                            delete this.spawneeProperties.dy;
                        }
                        if (state.left) {
                            this.spawneeProperties.dx = -this.speed;
                        } else if (state.right) {
                            this.spawneeProperties.dx = this.speed;
                        } else {
                            delete this.spawneeProperties.dx;
                        }
                    } else {
                        delete this.spawneeProperties.dx;
                        delete this.spawneeProperties.dy;
                    }
                    
                    if (this.parent) {
                        this.owner.triggerEvent('entity-created', this.parent.addEntity(new platypus.Entity(this.entityClass, this.propertiesContainer)));
                    }
                }
                
                if (state[this.stateName] !== this.firing) {
                    state[this.stateName] = this.firing;
                }

                this.firing = false;
            },
            "spawn": function (value) {
                this.firing = !value || (value.pressed !== false);
                
                this.parent = this.owner.parent; //proofing against this entity being destroyed prior to spawned entity. For example, when a destroyed entity spawns a drop.
            }
        }
    });
}());

//##############################################################################
// LogicStateMachine.js
//##############################################################################

/**
# COMPONENT **LogicStateMachine**
This component is a general purpose state-machine for an entity, taking in various message inputs to determine the entity's state and triggering messages as necessary when a certain state occurs or several state combinations are in place.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks sustained inputs for changes in state.
- **update-state** - Updates the entity's state according to this message's state information.
  - @param message (object) - This is an object of key/value pairs where keys are states and the values are booleans to turn on and off states.
- **state-changed** - Updates the entity's state according to this message's state information, and broadcasts any applicable messages.
  - @param message (object) - This is an object of key/value pairs where keys are states and the values are booleans to turn on and off states.
- **[input messages]** - This component listens for messages as determined by the JSON settings.

### Local Broadcasts:
- **[output messages]** - This component triggers output messages as determined by the JSON settings.

## JSON Definition
    {
      "type": "LogicStateMachine",
      
      "inputs":{
      // This is a list of messages that this component should listen for to change states.
      
        "smell-toast":{
        // If the entity triggers "smell-toast", this component will change the state of the entity as follows:
        
          "smelling-food": true,
          "smelling-nothing": false
        },
        
        "go-to-store":{
          "at-store": true
        }
      },
      
      "sustained-inputs":{
      // These are messages that must be triggered every tick for the state to remain true: if not, they become false.
        "near-grover": "smelling-trash"
      },
      
      "outputs":{
      //These are messages that should be triggered when certain conditions are met. The messages are only triggered the instant the condition is met, until the conditions are no longer met and then once again met.
      
        "smelling-food":{
        // Keys map to states, and if true, the value of the key is processed. In this case, the value of the "smelling-food" key is another object of key/value pairs, giving us another layer of checks.
        
          "!smelling-trash": "time-to-eat",
          // This key is an inverse check, meaning that the "smelling-trash" state of the entity must be false to continue along this path. This time the value is a string, so the string "time-to-eat" is treated as a message to be broadcast if the entity is both "smelling-food" and not "smelling-trash".
          
          "true": "belly-rumble"
          // In some cases, a message should be triggered for a set of states, while still doing deeper state checks like above. "true" will always handle the next layer of values if the parent key was true. 
        },
        
        "smelling-trash": "feeling-sick"
        // Multiple states can be handled to multiple depths, like a list of if () statements
        
        "!smelling-nothing":{
          "!smelling-trash":{
            "!at-store": "go-to-store",
            // Note that the "go-to-store" message will change this entity's state to "at-store" according to "inputs" above, but LogicStateMachine uses a cache of states when broadcasting output messages, so the next section will not be processed until the next state check.
            
            "at-store":{
              "have-money": "buy-more-food",
              "!have-money": "buy-less-food"
            }
          }
        }
      }
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var changeState = function (changes, state) {
            return function (value) {
                var i = null;

                for (i in changes) {
                    if (changes.hasOwnProperty(i)) {
                        state[i] = changes[i];
                    }
                }
            };
        },
        changeSustainedState = function (change, state) {
            return function (value) {
                state[change] = true;
            };
        },
        handleResult = null,
        handleOutput = null;
    
    handleResult = function (title, state, last, checks, changed, self, queue) {
        var i = 0,
            key      = '',
            resolved = false,
            message  = checks.message || (checks.message === 0) || (checks.message === false);

        if (changed) {
            if (typeof checks === 'string') {
                self.trigger(checks);
                resolved = true;
            } else if (Array.isArray(checks)) {
                for (i = 0; i < checks.length; i++) {
                    handleResult(title, state, last, checks[i], changed, self, queue);
                }
                resolved = true;
            } else if (checks.event && (message || checks.delay)) {
                if (checks.delay) {
                    queue.push(checks);
                } else {
                    self.trigger(checks.event, checks.message);
                }
                resolved = true;
            } else if (checks['true']) {
                handleResult(title, state, last, checks['true'], changed, self, queue);
            }
        }

        if (!resolved) {
            for (key in checks) {
                if (checks.hasOwnProperty(key) && (key !== 'true')) {
                    handleOutput(key, state, last, checks[key], changed, self, queue);
                }
            }
        }
    };
    
    handleOutput = function (title, state, last, checks, changed, self, queue) {
        var c     = changed,
            value = false;

        if (title.charAt(0) === '!') {
            value = (state[title.substring(1)] === false);
            if ((title !== 'outputs') && (last[title.substring(1)] !== state[title.substring(1)])) {
                c = true;
            }
        } else {
            value = (state[title] === true);
            if ((title !== 'outputs') && (last[title] !== state[title])) {
                c = true;
            }
        }

        if (value || (title === 'outputs')) {
            handleResult(title, state, last, checks, c, self, queue);
        }
    };

    return platypus.createComponentClass({
        id: 'LogicStateMachine',
        
        constructor: function (definition) {
            var i = null;
            
            this.state = this.owner.state;
            
            if (definition.inputs) {
                for (i in definition.inputs) {
                    if (definition.inputs.hasOwnProperty(i)) {
                        this.addEventListener(i, changeState(definition.inputs[i], this.state));
                    }
                }
            }

            this.sustainedState = {};
            if (definition["sustained-inputs"]) {
                for (i in definition["sustained-inputs"]) {
                    if (definition["sustained-inputs"].hasOwnProperty(i)) {
                        this.addEventListener(i, changeSustainedState(definition["sustained-inputs"][i], this.sustainedState));
                        this.sustainedState[definition["sustained-inputs"][i]] = false;
                    }
                }
            }

            this.snapshot = {};
            this.last = {};
            this.tempQueue = [];
            this.queueTimes = [];
            this.queue = [];
            this.outputs = definition.outputs || null;
        },

        events: {
            "handle-logic":  function (resp) {
                var i = '';
                
                for (i in this.sustainedState) {
                    if (this.sustainedState.hasOwnProperty(i)) {
                        if (this.owner.state[i] !== this.sustainedState[i]) {
                            this.owner.state[i] = this.sustainedState[i];
                        }
                        this.sustainedState[i] = false;
                    }
                }
                
                for (i = this.queue.length - 1; i > -1; i--) {
                    this.queueTimes[i] -= resp.delta;
                    
                    if (this.queueTimes[i] <= 0) {
                        this.owner.trigger(this.queue[i].event, this.queue[i].message);
                        this.queueTimes.splice(i, 1);
                        this.queue.splice(i, 1);
                    }
                }
            },
            
            "update-state": function (state) {
                var i = '';
                
                for (i in state) {
                    if (state.hasOwnProperty(i)) {
                        this.state[i] = state[i];
                    }
                }
            },
            
            "state-changed": function (state) {
                var i = null;
                
                if (this.outputs) {
                    for (i in state) {
                        if (state[i] !== this.snapshot[i]) {
                            this.snapshot[i] = state[i];
                        }
                    }
                    this.tempQueue.length = 0;
                    handleOutput('outputs', this.snapshot, this.last, this.outputs, false, this.owner, this.tempQueue);
                    for (i = 0; i < this.tempQueue.length; i++) {
                        this.queue.push(this.tempQueue[i]);
                        this.queueTimes.push(this.tempQueue[i].delay);
                    }
                    for (i in this.snapshot) {
                        if (this.snapshot[i] !== this.last[i]) {
                            this.last[i] = this.snapshot[i];
                        }
                    }
                }
            }
        }
    });
}());

//##############################################################################
// LogicSwitch.js
//##############################################################################

/**
# COMPONENT **LogicSwitch**
This component serves as a switch in the game world, typically tied to collision events such that this entity changes state when another entity collides or passed over.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its state.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component determines its state and triggers messages accordingly.
- **switch-pressed** - Causes the switch to be in a pressed state.

### Local Broadcasts:
- **switch-on** - This message is triggered when the switch has just been pressed.
- **switch-off** - This message is triggered when the switch has just been released.
- **initial-press** - This message is triggered the first time the switch is pressed. This occurs before the "switch-on" message is triggered.

## JSON Definition:
    {
      "type": "LogicSwitch",
      
      "sticky": true
      // Optional. Whether a pressed switch should stay pressed once collision messages cease. Defaults to `false`.
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'LogicSwitch',
        
        constructor: function (definition) {
            this.state = this.owner.state;
            this.pressed = false;
            this.wasPressed = this.pressed;
            this.sticky = definition.sticky || false;
            this.state.pressed = false;
            this.initialPress = true;
        },

        events: {// These are messages that this component listens for
            'handle-logic': function () {
                if (this.sticky) {
                    if (this.pressed && !this.wasPressed) {
                        this.state.pressed = true;
                        this.wasPressed = true;
                        this.owner.trigger('switch-on');
                    }
                } else {
                    if (this.pressed !== this.wasPressed) {
                        if (this.pressed) {
                            this.state.pressed = true;
                            this.owner.trigger('switch-on');
                        } else {
                            this.state.pressed = false;
                            this.owner.trigger('switch-off');
                        }
                    }
                    this.wasPressed = this.pressed;
                    this.pressed = false;
                }
            },
            'switch-pressed': function () {
                this.pressed = true;
                if (this.initialPress) {
                    this.owner.trigger('initial-press');
                    this.initialPress = false;
                }
            }
        }
    });
}());

//##############################################################################
// LogicTeleportee.js
//##############################################################################

/**
# COMPONENT **LogicTeleportee**
This component causes an entity to teleport when receiving a teleport message.

## Dependencies:
- [[CollisionBasic]] (on entity) - This component triggers "relocate-entity" to perform teleport, for which "CollisionBasic" listens.
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **teleport** - Teleports the entity to its set destination.
- **set-destination** - Sets the destination to teleport to in world coordinates.
  - @param message.x, message.y (number) - The position in world coordinates to set the teleport destination to.
- **hit-telepoint** - Sets the destination to the colliding entity's coordinates: useful for checkpoint behavior.
  - @param message ([[Entity]]) - The entity whose coordinates will be the teleport destination.

### Local Broadcasts:
- **relocate-entity** - Broadcasts the new location for the entity.
  - @param message.x, message.y (number) - The position in world coordinates to set the teleport destination to.
- **teleport-complete** - Triggered once the entity has been moved to the new location.

## JSON Definition
    {
      "type": "LogicTeleportee"
    }

Requires: ["../Vector.js"]
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicTeleportee',
        
        constructor: function (definition) {
            this.teleportDestination = new platypus.Vector();
            this.teleportNow = false;
            this.DestinationSet = false;
        },

        events: {// These are messages that this component listens for
            "handle-logic": function () {
                if (this.teleportNow) {
                    this.owner.trigger('relocate-entity', {position: this.teleportDestination});
                    this.teleportNow = false;
                    this.owner.trigger('teleport-complete');
                }
            },
            "teleport": function () {
                if (this.destinationSet) {
                    this.teleportNow = true;
                }
            },
            "set-destination": function (position) {
                this.setDestination(position);
            },
            "hit-telepoint": function (collisionInfo) {
                this.setDestination(collisionInfo.entity);
            }
        },
        
        methods: {
            setDestination: function (position) {
                this.teleportDestination.set(position.x, position.y);
                this.destinationSet = true;
            }
        }
    });
}());

//##############################################################################
// LogicTeleporter.js
//##############################################################################

/**
# COMPONENT **LogicTeleporter**
This component listens for redirected collision messages and fires a message on the colliding entity to specify where the colliding entity should relocate itself.

## Dependencies:
- [[Collision-Basic]] (on entity) - This component listens for collision messages on the entity.
- [[Entity-Container]] (on entity's parent) - This component listens for new peer entities being added on its parent to find its teleport destination.

## Messages

### Listens for:
- **peer-entity-added** - This teleporter listens as other entities are added so it can recognize the entity it should teleport colliding objects to.
  - @param message (object) - expects an entity as the message object in order to determine whether it is the requested teleportation destination.
- **teleport-entity** - On receiving this message, the component will fire `teleport` on the colliding entity, sending this.destination. The colliding entity must handle the `teleport` message and relocate itself.
  - @param message.x (integer) - uses `x` to determine if collision occurred on the left (-1) or right (1) of this entity.
  - @param message.y (integer) - uses `y` to determine if collision occurred on the top (-1) or bottom (1) of this entity.
  - @param message.entity (object) - triggers a `teleport` message on `entity`.

### Peer Broadcasts:
- **teleport** - On receiving a `teleport-entity` message, if the colliding entity is colliding on the teleporter's facing side, this message is triggered on the colliding entity.
  - @param message (object) - sends the destination entity as the message object, the x and y coordinates being the most important information for the listening entity.

## JSON Definition:
    {
      "type": "LogicTeleporter",
      
      "facing": "up",
      // Optional: "up", "down", "left", or "right". Will only trigger "teleport" if colliding entity collides on the facing side of this entity. If nothing is specified, all collisions fire a "teleport" message on the colliding entity.
      
      "teleportId": "Destination entity's linkId property"
      // Required: String that matches the "linkId" property of the destination entity. This destination entity is passed on a "teleport" message so teleporting entity knows where to relocate.
    }

*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicTeleporter',

        constructor: function (definition) {
            
            this.destination = undefined;
            this.linkId = this.owner.teleportId || definition.teleportId;
            this.facing = this.owner.facing || definition.facing || false;
        
            if (this.facing) {
                this.owner.state['facing-' + this.facing] = true;
            }
        },

        events: {// These are messages that this component listens for
            "peer-entity-added": function (entity) {
                if (!this.destination && (entity.linkId === this.linkId)) {
                    this.destination = entity;
                }
            },
    
            "teleport-entity": function (collisionInfo) {
                switch (this.facing) {
                case 'up':
                    if (collisionInfo.y < 0) {
                        collisionInfo.entity.trigger('teleport', this.destination);
                    }
                    break;
                case 'right':
                    if (collisionInfo.x > 0) {
                        collisionInfo.entity.trigger('teleport', this.destination);
                    }
                    break;
                case 'down':
                    if (collisionInfo.y > 0) {
                        collisionInfo.entity.trigger('teleport', this.destination);
                    }
                    break;
                case 'left':
                    if (collisionInfo.x < 0) {
                        collisionInfo.entity.trigger('teleport', this.destination);
                    }
                    break;
                default:
                    collisionInfo.entity.trigger('teleport', this.destination);
                    break;
                }
            }
        },
        
        methods: {// These are methods that are called on the component
            "destroy": function () {
                this.destination = undefined;
            }
        }
        
    });
}());

//##############################################################################
// LogicTimer.js
//##############################################################################

/**
# COMPONENT **LogicTimer**
A timer that can used to trigger events. The timer can increment and decrement. It can be an interval timer, going off over and over. Has a max time which it will not exceed by default this is 1 hour.

## Dependencies
- [[Handler-Logic]] (on entity's parent) - This component listens for a "handle-logic" message to update the timer.

## Messages

### Listens for:
- **handle-logic** - Handles the update for the timer. Increments or decrements the current time. If it's hit the max it stops the timer at the max. If it hits the alarm it sets it off. Sends an update message indicating the timer's current time for other components to use.
  - @param data.delta (number) - The time passed since the last tick.
- **set** - Set the time.
  - @param data.time (number) - The new value for the time.
- **start** - Start the timer counting.
- **stop** - Stop the timer counting.

### Local Broadcasts:
- **[alarm message from definition]** - The definition.alarm value from the JSON definition is used as the message id. It's sent when the alarm goes off.
- **[update message from definition]** - The definition.update value from the JSON definition is used as the message id. It's sent every 'handle-logic' tick. 
  - @param message.time (number) - The current time value for the timer.

## JSON Definition
    {
      "type": "LogicTimer",
      "time" : 0,
      //Optional - The starting time for the timer. Defaults to 0.
      "alarmTime" : 10000,
      //Optional - The time when the alarm will trigger the alarm message. Defaults to undefined, which never triggers the alarm.
      "isInterval" : false,
      //Optional - Whether or not the alarm fires at intervals of the alarmTime. Defaults to false.
      "alarmMessage" : "ding",
      //Optional - The message sent when the alarm goes off. Defaults to an empty string.
      "updateMessage" : "",
      //Optional - The message sent when the timer updates. Defaults to an empty string.
      "on" : true,
      //Optional - Whether the alarm starts on. Defaults to true.
      "isIncrementing" : true,
      //Optional - Whether the timer is incrementing or decrementing. If the value is false it is decrementing. Defaults to true.
      "maxTime" : 3600000
      //Optional - The max value, positive or negative, that the timer will count to. At which it stops counting. Default to 3600000 which equals an hour.
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicTimer',
        constructor: function (definition) {
            this.time = this.owner.time || definition.time ||  0;
            this.prevTime = this.time;
            this.alarmTime = this.owner.alarmTime || definition.alarmTime || undefined;
            this.isInterval = this.owner.isInterval || definition.isInterval || false;
            this.alarmMessage =  this.owner.alarmMessage || definition.alarmMessage || '';
            this.updateMessage = this.owner.updateMessage || definition.updateMessage || '';
            this.isOn = this.owner.on || definition.on || true;
            this.isIncrementing = this.owner.isIncrementing || definition.isIncrementing || true;
            this.maxTime = this.owner.maxTime || definition.maxTime || 3600000; //Max time is 1hr by default.
        },
        events: {
            "handle-logic": function (data) {
                if (this.isOn) {
                    this.prevTime = this.time;
                    if (this.isIncrementing) {
                        this.time += data.delta;
                    } else {
                        this.time -= data.delta;
                    }
                    
                    if (Math.abs(this.time) > this.maxTime) {
                        //If the timer hits the max time we turn it off so we don't overflow anything.
                        if (this.time > 0) {
                            this.time = this.maxTime;
                        } else if (this.time < 0) {
                            this.time = -this.maxTime;
                        }
                        this['stop-timer']();
                    }
                    
                    if (typeof this.alarmTime !== 'undefined') {
                        if (this.isInterval) {
                            if (this.isIncrementing) {
                                if (Math.floor(this.time / this.alarmTime) > Math.floor(this.prevTime / this.alarmTime)) {
                                    this.owner.trigger(this.alarmMessage);
                                }
                            } else {
                                if (Math.floor(this.time / this.alarmTime) < Math.floor(this.prevTime / this.alarmTime)) {
                                    this.owner.trigger(this.alarmMessage);
                                }
                            }
                        } else {
                            if (this.isIncrementing) {
                                if (this.time > this.alarmTime && this.prevTime < this.alarmTime) {
                                    this.owner.trigger(this.alarmMessage);
                                }
                            } else {
                                if (this.time < this.alarmTime && this.prevTime > this.alarmTime) {
                                    this.owner.trigger(this.alarmMessage);
                                }
                            }
                        }
                    }
                }
                this.owner.trigger(this.updateMessage, {time: this.time});
            },
            "set-timer": function (data) {
                this.time = data.time;
            },
            "start-timer": function () {
                this.isOn = true;
            },
            "stop-timer": function () {
                this.isOn = false;
            }
        }
    });
}());

//##############################################################################
// LogicWindUpRacer.js
//##############################################################################

/**
# COMPONENT **LogicWindUpRacer**
Replicates logic for a wind-up toy: listens for a wind-up message over a series of ticks to charge, and then begins racing once the charge is complete.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its charging counter if necessary.
  - @param message.delta - To determine how much to charge, the component checks the length of the tick.
- **wind-up** - creates and connects the shield entity to this entity.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: false causes a "drop-shield" behavior.
- **stop-racing** - stops the entity movement.
- **hit-solid** - On receiving this message, the entity stops racing.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 

### Local Broadcasts:
- **winding** - This message is triggered when the entity begins winding up.
- **stopped-winding** - This message is triggered when the entity stops winding.
- **racing** - This message is triggered when winding is finished and the entity begins racing.
- **stopped-racing** - This message is triggered when the entity stops racing.
- **blocked** - This message is triggered if the entity collides while racing.
  - @param message (object) - Collision information from the "hit-solid" message. 

## JSON Definition
    {
      "type": "LogicWindUpRacer",

      "windTime": 1000,
      // Optional. Time in milliseconds that entity needs to receive wind-up calls before racing can begin. Defaults to 500.
      
      "raceTime": 4000,
      // Optional. Time in milliseconds that entity will race before coming to a stop. Defaults to 5000.
      
      "speed": 1
      // Optional. Velocity at which the entity should travel while racing. Defaults to 0.3.
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'LogicWindUpRacer',
        
        constructor: function (definition) {
            this.windTime = definition.windTime || 500;
            this.raceTime = definition.raceTime || 5000;
            this.speed = definition.speed || this.owner.speed || 0.3;
            
            this.windProgress = 0;
            
            this.winding = false;
            this.racing = false;
            this.blocked = false;
            this.right = false;
            this.left = false;
            
            this.state = this.owner.state;
            this.state.windingUp = false;
            this.state.racing = false;
            this.state.blocked = false;
        },

        events: {// These are messages that this component listens for
            "handle-logic": function (resp) {
                if (this.racing) {
                    if (!this.blocked && this.right && this.state.right) {
                        this.owner.x += this.speed;
                        this.owner.trigger('racing');
                    } else if (!this.blocked && this.left && this.state.left) {
                        this.owner.x -= this.speed;
                        this.owner.trigger('racing');
                    } else {
                        this.racing = false;
                        this.owner.trigger('stopped-racing');
                    }
                } else {
                    if (this.winding) {
                        if ((this.right && this.state.right) || (this.left && this.state.left)) {
                            this.windProgress += resp.delta;
                        }
                        this.owner.trigger('winding');
                    } else {
                        if (this.windProgress) {
                            if (this.windProgress > this.windTime) {
                                this.racing = true;
                            }
                            this.windProgress = 0;
                            this.owner.trigger('stopped-winding');
                        }
                    }
                }
                
                if (this.state.windingUp !== this.winding) {
                    this.state.windingUp = this.winding;
                }
                if (this.state.racing !== this.racing) {
                    this.state.racing = this.racing;
                }
                if (this.state.blocked !== this.blocked) {
                    this.state.blocked = this.blocked;
                }
                
                this.blocked = false;
            },
            "stop-racing": function (value) {
                this.racing = false;
                this.owner.trigger('stopped-racing');
            },
            "wind-up": function (value) {
                this.winding = !value || (value.pressed !== false);
                this.right = this.state.right;
                this.left  = this.state.left;
            },
            "hit-solid": function (collision) {
                if (collision.x) {
                    if (this.racing && ((this.right && (collision.x > 0)) || (this.left && (collision.x < 0)))) {
                        this.blocked = true;
                        this.owner.trigger('blocked', collision);
                    }
                }
            }
        },
    
        methods: {
            destroy: function () {
                this.state.windingUp = false;
                this.state.racing = false;
                this.state.blocked = false;
            }
        }
    });
}());

//##############################################################################
// Motion.js
//##############################################################################

/**
 * This component works in tandem with the [`Mover`]("Mover"%20Component.html) component by adding a vector of motion to the entity. This component is typically created by `Mover` and doesn't need to be added separately.
 * 
 * @namespace platypus.components
 * @class Motion
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";
    
    var tempVector = new platypus.Vector(),
        prepUpdate = function (func) {
            return function (velocity, position, delta, grounded) {
                if (this.accelerator) {
                    this.resultant = velocity;
                } else {
                    this.resultant = position;
                }
                this.update = func;
                this.update(velocity, position, delta, grounded);
            };
        },
        isTrue = function () {
            return true;
        },
        createController = function (self, definition) {
            var active = self.active,
                enact  = true,
                ready  = true,
                getActiveState = isTrue,
                getInstantState = isTrue,
                state = self.owner.state,
                controlState = definition.controlState,
                instantState = definition.instantState,
                instantSuccess = definition.instantSuccess;

            if (controlState) {
                getActiveState = function () {
                    return state[controlState];
                };
            }

            if (definition.event) {
                /**
                 * This event controls whether this motion is active or inactive.
                 * 
                 * @method '[defined by event property]'
                 * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                 */
                self.addEventListener(definition.event, function (control) {
                    active = (control && (control.pressed !== false));
                });
            }

            if (definition.instantEvent || instantState || definition.instantBegin || definition.instantEnd) {
                if (instantState) {
                    getInstantState = function () {
                        return state[instantState];
                    };
                }

                if (definition.instantEvent || definition.instantBegin || definition.instantEnd) {
                    enact = false;
                    if (definition.instantEvent) {
                        /**
                        * This event triggers an instant motion.
                        *
                        * @method '[defined by instantEvent property]'
                        * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                        */
                        self.addEventListener(definition.instantEvent, function (control) {
                            enact = (control && (control.pressed !== false));
                        });
                    }
                    if (definition.instantBegin) {
                        /**
                        * This event triggers the beginning of an instant motion.
                        *
                        * @method '[defined by instantBegin property]'
                        * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                        */
                        self.addEventListener(definition.instantBegin, function () {
                            enact = true;
                        });
                    }
                    if (definition.instantEnd) {
                        /**
                        * This event triggers the end of an instant motion.
                        *
                        * @method '[defined by instantEnd property]'
                        * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                        */
                        self.addEventListener(definition.instantEnd, function () {
                            enact = false;
                        });
                    }
                }

                self.update = prepUpdate(function (velocity, position, delta, grounded) {
                    var state = getInstantState();

                    this.active = active && getActiveState();

                    if (ready && enact && this.active && state) {
                        ready = false; // to insure a single instance until things are reset
                        this.move(1);
                        if (instantSuccess) {
                            this.owner.triggerEvent(instantSuccess);
                        }
                    } else if (!ready && !(enact && state)) {
                        ready = true;
                        this.decay();
                    }
                });
            } else {
                self.update = prepUpdate(function (velocity, position, delta, grounded) {
                    this.active = active && getActiveState();
                    if (this.active) {
                        this.move(delta);
                    }
                });
            }
        };
    
    return platypus.createComponentClass({
        
        id: 'Motion',

        properties: {
            /**
             * Whether this motion should automatically re-orient when the entity re-orients.
             * 
             * @property orient
             * @type boolean
             * @default true
             */
            orient: true,
            
            /**
             * Whether this motion accelerates the entity (versus a flat velocity addition).
             * 
             * @property accelerator
             * @type boolean
             * @default true
             */
            accelerator: false,
            
            /**
             * Whether this motion is current acting on the entity. This boolean value can be tied to a specific entity state and/or event using the `event` and `controlState` properties.
             * 
             * @property active
             * @type boolean
             * @default true
             */
            active: true,
            
            /**
             * This is the highest magnitude allowed for the motion vector.
             * 
             * @property maxMagnitude
             * @type number
             * @default Infinity
             */
            maxMagnitude: Infinity,
            
            /**
             * When this event is triggered on the entity, this motion can be turned on or off. Sending `true` or `{pressed: true}` makes the motion active. Sending `false` or `{pressed: false}` makes the motion inactive.
             * 
             * @property event
             * @type String
             * @default ""
             */
            event: "",
            
            /**
             * When this state on the entity changes, this motion's active state is changed to match. If an "event" property is also set on this component, both the event and the state must be true for the motion to be active.
             * 
             * @property controlState
             * @type String
             * @default ""
             */
            controlState: "",
            
            /**
             * If instantEvent or instantState are set, the motion is only triggered for a single step and must be re-triggered to activate again. Sending `true` or `{pressed: true}` makes the motion active.
             * 
             * @property instantEvent
             * @type String
             * @default ""
             */
            instantEvent: "",
            
            /**
             * If instantBeing is set, the motion is triggered for a single step and must be re-triggered to activate again. The motion cannot begin again until it is ended by instantEnd or instant Event.
             *
             * @property instantBegin
             * @type String
             * @default ""
             */
            instantBegin: "",

            /**
             * If instantEnd is set, when triggered it will reset the event so that it can triggered again.
             *
             * @property instantEnd
             * @type String
             * @default ""
             */
            instantEnd: "",

            /**
             * If instantEvent or instantState are set, the motion is only triggered for a single step and must be re-triggered to activate again. When the instantState on the entity becomes `true`, this motion's active state is changed to match. If an "instantEvent" property is also set on this component, both the event and the state must be true for the motion to be active. If "event" or "controlState" are also defined, they must also be `true` to trigger an instant motion on the entity.
             * 
             * @property instantState
             * @type String
             * @default ""
             */
            instantState: "",
            
            /**
             * If instantEvent or instantState are set, this event is triggered when the intance of motion occurs on the entity.
             * 
             * @property instantSuccess
             * @type String
             * @default ""
             */
            instantSuccess: "",
            
            /**
             * This determines if setting active to `false` (via the control event or state) should dampen velocity. This is a ratio applied to the vector magnitude between 0 and 1. This is useful for events like jumping where a longer keypress should jump farther than a shorter keypress. Here's an example for a variable-height jump motion:
             * 
             *      {
             *          vector: [0, -1.6, 0],
             *          accelerator: true,
             *          controlState: "grounded",
             *          instantEvent: "jump",
             *          instantDecay: 0.2
             *      }
             * 
             * @property instantDecay
             * @type number
             * @default null
             */
            instantDecay: null,
            
            /**
             * A vector, Array, or number specifying the direction and magnitude of the motion. Numbers apply magnitude along the x-axis. Arrays map to [x, y, z] on the vector.
             * 
             * @property vector
             * @type Vector|Array|number
             * @default Vector(0, 0, 0)
             */
            vector: 0
        },
        
        constructor: function (definition) {
            this.vector = new platypus.Vector(this.vector);
            this.triggered = false;
            
            if (!isNaN(this.instantDecay)) {
                this.capMagnitude = this.vector.magnitude() * this.instantDecay;
            } else {
                this.capMagnitude = -1;
            }
            
            createController(this, definition);
            
            if (this.orient) { // Orient vectors in case the entity is in a transformed position.
                this.owner.triggerEvent('orient-vector', this.vector);
            }
        },

        events: {
            "set-vector": function(newVector) {
                this.vector.set(newVector);
                if (!isNaN(this.instantDecay)) {
                    this.capMagnitude = this.vector.magnitude() * this.instantDecay;
                } else {
                    this.capMagnitude = -1;
                }
            }
        },

        methods: {
            move: function (delta) {
                if (this.vector.magnitude() > this.maxMagnitude) {
                    this.vector.normalize().multiply(this.maxMagnitude);
                }
                this.resultant.add(tempVector.set(this.vector).multiply(delta));
            },
            
            // This handles things like variable height jumping by adjusting the jump velocity to the pre-determined cap velocity for jump-button release.
            decay: function () {
                var s = null;
                
                if (this.capMagnitude >= 0) {
                    s = tempVector.set(this.resultant).scalarProjection(this.vector);
                    if (s > this.capMagnitude) {
                        this.resultant.subtractVector(tempVector.set(this.vector).normalize().scale(s - this.capMagnitude));
                    }
                }
            },
            
            destroy: function () {
                if (this.orient) {
                    this.owner.triggerEvent('remove-vector', this.vector);
                }
            }
        },
        
        publicMethods: {
        }
    });
}());

//##############################################################################
// Mover.js
//##############################################################################

/**
 * This component handles entity motion via velocity and acceleration changes. This is useful for directional movement, gravity, bounce-back collision reactions, jumping, etc.
 * 
 * @namespace platypus.components
 * @class Mover
 * @uses Component
 */
// Requires: ["Motion", "../Vector.js"]
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var tempVector = new platypus.Vector();
    
    return platypus.createComponentClass({
        
        id: 'Mover',

        properties: {
            /** This is a normalized vector describing the direction the ground should face away from the entity.
             * 
             * @property ground
             * @type Array|Vector
             * @default Vector(0, 1)
             */
            ground: [0, 1]
        },
        
        publicProperties: {
            /**
             * A list of key/value pairs describing vectors or vector-like objects describing acceleration and velocity on the entity. See the ["Motion"]("Motion"%20Component.html) component for properties.
             * 
             * @property movers
             * @type Array
             * @default []
             */
            movers: [],
            
            /**
             * If specified, the property adds gravity motion to the entity.
             * 
             * @property gravity
             * @type number|Array|Vector
             * @default: 0
             */
            gravity: 0,
            
            /**
             * If specified, the property adds jumping motion to the entity.
             * 
             * @property jump
             * @type number|Array|Vector
             * @default: 0
             */
            jump: 0,
            
            /**
             * If specified, the property adds velocity to the entity.
             * 
             * @property speed
             * @type number|Array|Vector
             * @default: 0
             */
            speed: 0,
            
            /**
             * This property determines how quickly velocity is dampened when the entity is not in a "grounded" state. This should be a value between 0 (no motion) and 1 (no drag).
             * 
             * @property drag
             * @type number
             * @default 0.99
             */
            drag: 0.99,
            
            /**
             * This property determines how quickly velocity is dampened when the entity is in a "grounded" state. This should be a value between 0 (no motion) and 1 (no friction).
             * 
             * @property friction
             * @type number
             * @default 0.94
             */
            friction: 0.94,
            
            /**
             * This property determines the maximum amount of velocity this entity can maintain.
             * 
             * @property maxMagnitude
             * @type number
             * @default Infinity
             */
            maxMagnitude: Infinity
        },
        
        constructor: function (definition) {
            platypus.Vector.assign(this.owner, 'position',  'x',  'y',  'z');
            platypus.Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');

            this.position = this.owner.position;
            this.velocity = this.owner.velocity;
            
            // Copy movers so we're not re-using mover definitions
            this.moversCopy = this.movers;
            this.movers = [];

            this.ground = new platypus.Vector(this.ground);
        },

        events: {
            /**
             * When a ["Motion"]("Motion"%20Component.html) component is added, this component adds it to its list of movers.
             * 
             * @method 'component-added'
             * @param component {"Motion" Component} The motion to add as a mover on this entity.
             */
            "component-added": function (component) {
                if (component.type === 'Motion') {
                    this.movers.push(component);
                }
            },
            
            /**
             * When a ["Motion"]("Motion"%20Component.html) component is removed, this component removes it from its list of movers.
             * 
             * @method 'component-removed'
             * @param component {"Motion" Component} The motion to remove as a mover from this entity.
             */
            "component-removed": function (component) {
                var i = 0;
                
                if (component.type === 'Motion') {
                    for (i = 0; i < this.movers.length; i++) {
                        if (component === this.movers[i]) {
                            this.movers.splice(i, 1);
                            break;
                        }
                    }
                }
            },
            
            /**
             * This component listens for a "load" event before setting up its mover list.
             * 
             * @method 'load'
             */
            "load": function () {
                var i = 0,
                    movs = this.moversCopy;
                
                delete this.moversCopy;
                for (i = 0; i < movs.length; i++) {
                    this.addMover(movs[i]);
                }
                
                // Set up speed property if supplied.
                if (this.speed) {
                    if (!isNaN(this.speed)) {
                        this.speed = [this.speed, 0, 0];
                    }
                    this.speed = this.addMover({
                        vector: this.speed,
                        controlState: "moving"
                    }).vector;
                }

                // Set up gravity property if supplied.
                if (this.gravity) {
                    if (!isNaN(this.gravity)) {
                        this.gravity = [0, this.gravity, 0];
                    }
                    this.gravity = this.addMover({
                        vector: this.gravity,
                        orient: false,
                        accelerator: true,
                        event: "gravitate"
                    }).vector;
                }
                
                // Set up jump property if supplied.
                if (this.jump) {
                    if (!isNaN(this.jump)) {
                        this.jump = [0, this.jump, 0];
                    }
                    this.jump = this.addMover({
                        vector: this.jump,
                        accelerator: true,
                        controlState: "grounded",
                        state: "jumping",
                        instantEvent: "jump",
                        instantSuccess: "just-jumped",
                        instantDecay: 0.2
                    }).vector;
                }
            },
            
            /**
             * On each "handle-logic" event, this component moves the entity according to the list of movers on the entity.
             * 
             * @method 'handle-logic'
             * @param tick {Object}
             * @param tick.delta {number} The amount of time in milliseconds since the last tick.
             */
            "handle-logic": function (tick) {
                var i = 0,
                    delta    = tick.delta,
                    vect     = tempVector,
                    velocity = this.velocity,
                    position = this.position;
                
                if (this.owner.state.paused) {
                    return;
                }
                
                for (i = 0; i < this.movers.length; i++) {
                    this.movers[i].update(velocity, position, delta, this.grounded);
                }
                
                // Finally, add aggregated velocity to the position
                if (this.grounded) {
                    velocity.multiply(this.friction);
                } else {
                    velocity.multiply(this.drag);
                }
                if (velocity.magnitude() > this.maxMagnitude) {
                    velocity.normalize().multiply(this.maxMagnitude);
                }
                vect.set(velocity).multiply(delta);
                position.add(vect);
                
                if (this.grounded !== this.owner.state.grounded) {
                    this.owner.state.grounded = this.grounded;
                }
                this.grounded = false;
            },
            
            /**
             * On receiving this message, this component stops velocity in the direction of the collision and sets "grounded" to `true` if colliding with the ground.
             * 
             * @method 'hit-solid'
             * @param collisionInfo {Object}
             * @param collisionInfo.direction {Vector} The direction of collision from the entity's position.
             */
            "hit-solid": function (collisionInfo) {
                var s = this.velocity.scalarProjection(collisionInfo.direction),
                    v = tempVector;
                
                if (collisionInfo.direction.dot(this.ground) > 0) {
                    this.grounded = true;
                }
                
                if (v.set(collisionInfo.direction).normalize().multiply(s).dot(this.velocity) > 0) {
                    this.velocity.subtractVector(v);
                }
            }
        },
        
        methods: {
            destroy: function () {
                var i = 0;
                
                for (i = this.movers.length - 1; i >= 0; i--) {
                    this.removeMover(this.movers[i]);
                }
            }
        },
        
        publicMethods: {
            /**
             * This method adds a mover to the entity in the form of a ["Motion"]("Motion"%20Component.html) component definition.
             * 
             * @method addMover
             * @param mover {Object} For motion definition properties, see the ["Motion"]("Motion"%20Component.html) component.
             * @return motion {"Motion" Component}
             */
            addMover: function (mover) {
                var m = this.owner.addComponent(new platypus.components.Motion(this.owner, mover));

                return m;
            },
            
            /**
             * This method removes a mover from the entity.
             * 
             * @method removeMover
             * @param motion {"Motion" Component}
             */
            removeMover: function (m) {
                this.owner.removeComponent(m);
            }
        }
    });
}());

//##############################################################################
// Node.js
//##############################################################################

/**
# COMPONENT **Node**
This component causes an entity to be a position on a [[NodeMap]]. This component should not be confused with `NodeResident` which should be used on entities that move around on a NodeMap: `Node` simply represents a non-moving location on the NodeMap.

## Dependencies
- [[NodeMap]] (on entity's parent) - This component uses the `NodeMap` to determine its location and navigate to other nodes.
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location and triggers messages regarding its neighbors.
  - @param message.delta (Number) - This component uses the current time to determine its progress along an edge if moving from node to node on the map.
- **on-node** - Sets the entity's position to the sent node, updates its coordinates, and triggers messages regarding its neighbors if any.
  - @param node (Node) - The node that this entity should be located on.
- **leave-node** - Removes the entity from its current node if it's on one.
- **goto-node** - Begins moving the entity along edges to get to sent node.
  - @param node (Node) - The node that this entity should move to.
- **follow** - Causes this entity to follow another entity. The leading entity must also have a `NodeResident` component and exist in the NodeMap.
  - @param entity (Entity) - The entity that this entity should follow.

### Local Broadcasts:
- **next-to-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all neighboring entities, as well as on itself on behalf of neighboring entities.
  - @param entity (Entity) - The entity that is next to the listening entity.
- **with-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all entities residing on the same node, as well as on itself on behalf of all resident entities.
  - @param entity (Entity) - The entity that is with the listening entity.
- **left-node** - Triggered when the entity leaves a node.
  - @param node (Node) - The node that the entity just left.
- **[Messages specified in definition]** - When the entity is placed on a node, it checks out the type of node and triggers a message on the entity if an event is listed for the current node type.

## States
- **on-node** - This state is true when the entity is on a node.
- **moving** - This state is true when the entity is moving from one node to another.
- **going-[direction]** - This state is true when the entity is moving (or has just moved) in a direction (determined by the NodeMap) from one node to another.
  
## JSON Definition
    {
      "type": "NodeResident",
      
      "nodeId": "city-hall",
      // Optional. The id of the node that this entity should start on. Uses the entity's nodeId property if not set here.
      
      "nodes": ['path','sidewalk','road'],
      // Optional. This is a list of node types that this entity can reside on. If not set, entity can reside on any type of node.
      
      "shares": ['friends','neighbors','city-council-members'],
      // Optional. This is a list of entities that this entity can reside with on the same node. If not set, this entity cannot reside with any entities on the same node.
      
      "speed": 5,
      // Optional. Sets the speed with which the entity moves along an edge to an adjacent node. Default is 0 (instantaneous movement).
      
      "updateOrientation": true
      // Optional. Determines whether the entity's orientation is updated by movement across the NodeMap. Default is false.
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
	return platypus.createComponentClass({
		
		id: 'Node',
		
		publicProperties: {
			x: 0,
			y: 0,
			z: 0
		},
		
		constructor: function (definition) {
			this.nodeId = definition.nodeId || this.owner.nodeId || this.owner.id || String(Math.random());
			
			if ((typeof this.nodeId !== 'string') && (this.nodeId.length)) {
				this.nodeId = definition.nodeId.join('|');
			}
			
			this.owner.nodeId = this.nodeId;
			
			this.owner.isNode = true;
			this.map = this.owner.map = this.owner.map || null;
			this.contains = this.owner.contains = [];
			this.edgesContain = this.owner.edgesContain = [];
			
			platypus.Vector.assign(this.owner, 'position', 'x', 'y', 'z');
			
			this.neighbors = this.owner.neighbors = definition.neighbors || this.owner.neighbors || {};
		},
		
		events: {
			"add-neighbors": function (neighbors) {
				var i = 0,
				    direction = null;
				
				for (direction in neighbors) {
                    if (neighbors.hasOwnProperty(direction)) {
                        this.neighbors[direction] = neighbors[direction];
                    }
				}
				
				for (i = 0; i < this.contains.length; i++) {
					this.contains[i].triggerEvent('set-directions');
				}
			},
			"remove-neighbor": function (nodeOrNodeId) {
				var i  = null,
				    id = nodeOrNodeId;
				
				if (typeof id !== 'string') {
					id = id.nodeId;
				}

				for (i in this.neighbors) {
                    if (this.neighbors.hasOwnProperty(i)) {
                        if (typeof this.neighbors[i] === 'string') {
                            if (this.neighbors[i] === id) {
                                delete this.neighbors[i];
                                break;
                            }
                        } else {
                            if (this.neighbors[i].nodeId === id) {
                                delete this.neighbors[i];
                                break;
                            }
                        }
                    }
				}
			}
		},
		
		publicMethods: {
			getNode: function (desc) {
				var neighbor = null;
				
				//map check
				if (!this.map && this.owner.map) {
					this.map = this.owner.map;
				}
				
				if (this.neighbors[desc]) {
					neighbor = this.neighbors[desc];
					if (neighbor.isNode) {
						return neighbor;
					} else if (typeof neighbor === 'string') {
						neighbor = this.map.getNode(neighbor);
						if (neighbor) {
							this.neighbors[desc] = neighbor;
							return neighbor;
						}
					} else if (neighbor.length) {
						neighbor = this.map.getNode(neighbor.join('|'));
						if (neighbor) {
							this.neighbors[desc] = neighbor;
							return neighbor;
						}
					}
					return null;
				} else {
					return null;
				}
			},
			addToNode: function (entity) {
                var i = 0;
                
				for (i = 0; i < this.contains.length; i++) {
					if (this.contains[i] === entity) {
						return false;
					}
				}
				this.contains.push(entity);
				return entity;
			},
			removeFromNode: function (entity) {
                var i = 0;
                
				for (i = 0; i < this.contains.length; i++) {
					if (this.contains[i] === entity) {
						return this.contains.splice(i, 1)[0];
					}
				}
				return false;
			},
			addToEdge: function (entity) {
                var i = 0;
                
				for (i = 0; i < this.edgesContain.length; i++) {
					if (this.edgesContain[i] === entity) {
						return false;
					}
				}
				this.edgesContain.push(entity);
				return entity;
			},
			removeFromEdge: function (entity) {
                var i = 0;
                
				for (i = 0; i < this.edgesContain.length; i++) {
					if (this.edgesContain[i] === entity) {
						return this.edgesContain.splice(i, 1)[0];
					}
				}
				return false;
			}
		}
	});
}());

//##############################################################################
// NodeMap.js
//##############################################################################

/**
# COMPONENT **NodeMap**
This component sets up a NodeMap to be used by the [[NodeResident]] component on this entity's child entities.

## Dependencies
- [[EntityContainer]] - This component expects the entity to have an `EntityContainer` component so it knows when `NodeResident` children are added.

## Messages

### Listens for:
- **add-node** - Expects a node definition to create a node in the NodeMap.
  - @param definition.nodeId (string or array) - This value becomes the id of the Node. Arrays are joined using "|" to create the id string.
  - @param definition.type (string) - This determines the type of the node.
  - @param definition.x (number) - Sets the x axis position of the node.
  - @param definition.y (number) - Sets the y axis position of the node.
  - @param definition.z (number) - Sets the z axis position of the node.
  - @param definition.neighbors (object) - A list of key/value pairs where the keys are directions from the node and values are node ids. For example: {"west": "node12"}.
- **child-entity-added** - Checks the child entity for a nodeId and if found adds the child to the corresponding node.
  - @param entity (Entity) - The entity that may be placed on a node.

## JSON Definition
    {
      "type": "NodeMap"
      
      "map": [
      // Optional. An array of node definitions to create the NodeMap.
        
        {
          "NodeId": "Node1",
          // A string or array that becomes the id of the Node. Arrays are joined using "|" to create the id string.
          
          "type": "path",
          // A string that determines the type of the node.
          
          "x": 0,
          // Sets the x axis position of the node.
          
          "y": 0,
          // Sets the y axis position of the node.
          
          "z": 0,
          // Sets the z axis position of the node.

          "neighbors": {
          // A list of key/value pairs where the keys are directions from the node and values are node ids.
            
            "west": "node0",
            "east": "node2"
          }
        }
      ]
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    // This is a basic node object, but can be replaced by entities having a `Node` component if more functionality is needed.
    var Node = function (definition, map) {
            if (definition.id) {
                if (typeof definition.id === 'string') {
                    this.id = definition.id;
                } else if (Array.isArray(definition.id)) {
                    this.id = definition.id.join('|');
                } else {
                    this.id = String(Math.random());
                }
            } else {
                this.id = String(Math.random());
            }

            this.isNode = true;
            this.map = map;
            this.contains = [];
            this.type = definition.type || '';
            this.x = definition.x || 0;
            this.y = definition.y || 0;
            this.z = definition.z || 0;

            this.neighbors = definition.neighbors || {};
        },
        proto = Node.prototype;
	
    proto.getNode = function (desc) {
        var neighbor = null;
        
        if (this.neighbors[desc]) {
            neighbor = this.neighbors[desc];
            if (neighbor.isNode) {
                return neighbor;
            } else if (typeof neighbor === 'string') {
                neighbor = this.map.getNode(neighbor);
                if (neighbor) {
                    this.neighbors[desc] = neighbor;
                    return neighbor;
                }
            } else if (Array.isArray(neighbor)) {
                neighbor = this.map.getNode(neighbor.join('|'));
                if (neighbor) {
                    this.neighbors[desc] = neighbor;
                    return neighbor;
                }
            }
            return null;
        } else {
            return null;
        }
    };

    proto.add = function (entity) {
        var i = 0;
        
        for (i = 0; i < this.contains.length; i++) {
            if (this.contains[i] === entity) {
                return false;
            }
        }
        this.contains.push(entity);
        return entity;
    };
    
    proto.remove = function (entity) {
        var i = 0;
        
        for (i = 0; i < this.contains.length; i++) {
            if (this.contains[i] === entity) {
                return this.contains.splice(i, 1)[0];
            }
        }
        return false;
    };
	
	return platypus.createComponentClass({
		id: 'NodeMap',
		
        constructor: function (definition) {
            var i = 0;
            
            this.owner.map = this.map = [];
            
            this.residentsAwaitingNode = [];
            
            if (definition.map) {
                for (i = 0; i < definition.map.length; i++) {
                    this.map.push(new Node(definition.map[i], this));
                }
            }
        },

        events: {
            "add-node": function (nodeDefinition) {
                var i = 0,
                    entity = null,
                    node   = null;
                
				if(nodeDefinition.isNode){// if it's already a node, put it on the map.
					node = nodeDefinition;
                    nodeDefinition.map = this;
				} else {
                    node = new Node(nodeDefinition, this);
				}

				this.map.push(node);
                
                for (i = this.residentsAwaitingNode.length - 1; i >= 0; i--) {
                    entity = this.residentsAwaitingNode[i];
                    if (node.id === entity.nodeId) {
                        this.residentsAwaitingNode.splice(i, 1);
        				entity.node = this.getNode(entity.nodeId);
       					entity.triggerEvent('on-node', entity.node);
                    }
                }
			},
			"child-entity-added": function (entity) {
				if(entity.isNode){        // a node
					this.owner.triggerEvent('add-node', entity);
				} else if(entity.nodeId){ // a NodeResident
					entity.node = this.getNode(entity.nodeId);
                    if(!entity.node){
                        this.residentsAwaitingNode.push(entity);
                    } else {
    					entity.triggerEvent('on-node', entity.node);
                    }
				}
			}
		},
		
		publicMethods: {
			getNode: function () {
                var i       = 0,
                    id      = '',
                    divider = '',
                    args    = arguments;
                
                if (args.length === 1) {
                    if (args[0].isNode) {
						return args[0];
					} else if (Array.isArray(args[0])) {
						args = args[0];
					}
				}
				
                for (i = 0; i < args.length; i++) {
                    id += divider + args[i];
                    divider = '|';
                }
                for (i = 0; i < this.map.length; i++) {
                    if (this.map[i].id === id) {
                        return this.map[i];
                    }
                }
                return null;
            },
            
            /**
             * Finds the closest node to a given point, with respect to any inclusion or exclusion lists.
             */
            getClosestNode: (function(){
                var v1 = new platypus.Vector(0, 0, 0),
                    v2 = new platypus.Vector(0, 0, 0);

                return function (point, including, excluding) {
                    var i = 0,
                        j = 0,
                        p1 = v1.set(point),
                        p2 = v2,
                        m = 0,
                        list = including || this.map,
                        closest = null,
                        exclude = false,
                        d = Infinity;
                    
                    for (i = 0; i < list.length; i++) {
                        m = p2.set(p1).subtractVector(list[i].position).magnitude();
                        if (m < d) {
                            if (excluding) {
                                exclude = false;
                                for (j = 0; j < excluding.length; j++) {
                                    if (excluding[j] === list[i]) {
                                        exclude = true;
                                        break;
                                    }
                                }
                                if (exclude) {
                                    break;
                                }
                            }
                            
                            d = m;
                            closest = list[i];
                        }
                    }
                    
                    return closest;
                };
            }())
        }
    });
}());

//##############################################################################
// NodeResident.js
//##############################################################################

/**
# COMPONENT **NodeResident**
This component connects an entity to its parent's [[NodeMap]]. It manages navigating the NodeMap and triggering events on the entity related to its position.

## Dependencies
- [[NodeMap]] (on entity's parent) - This component uses the `NodeMap` to determine its location and navigate to other nodes.
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location and triggers messages regarding its neighbors.
  - @param message.delta (Number) - This component uses the current time to determine its progress along an edge if moving from node to node on the map.
- **on-node** - Sets the entity's position to the sent node, updates its coordinates, and triggers messages regarding its neighbors if any.
  - @param node (Node) - The node that this entity should be located on.
- **leave-node** - Removes the entity from its current node if it's on one.
- **goto-node** - Begins moving the entity along edges to get to sent node.
  - @param node (Node) - The node that this entity should move to.
- **follow** - Causes this entity to follow another entity. The leading entity must also have a `NodeResident` component and exist in the NodeMap.
  - @param entity (Entity) - The entity that this entity should follow.

### Local Broadcasts:
- **next-to-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all neighboring entities, as well as on itself on behalf of neighboring entities.
  - @param entity (Entity) - The entity that is next to the listening entity.
- **with-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all entities residing on the same node, as well as on itself on behalf of all resident entities.
  - @param entity (Entity) - The entity that is with the listening entity.
- **left-node** - Triggered when the entity leaves a node.
  - @param node (Node) - The node that the entity just left.
- **[Messages specified in definition]** - When the entity is placed on a node, it checks out the type of node and triggers a message on the entity if an event is listed for the current node type.

## States
- **on-node** - This state is true when the entity is on a node.
- **moving** - This state is true when the entity is moving from one node to another.
- **going-[direction]** - This state is true when the entity is moving (or has just moved) in a direction (determined by the NodeMap) from one node to another.
  
## JSON Definition
    {
      "type": "NodeResident",
      
      "nodeId": "city-hall",
      // Optional. The id of the node that this entity should start on. Uses the entity's nodeId property if not set here.
      
      "nodes": {"path": "walking", "sidewalk": "walking", "road": "driving"],
      // Optional. This is a list of node types that this entity can reside on. If not set, entity can reside on any type of node.
      
      "shares": ['friends','neighbors','city-council-members'],
      // Optional. This is a list of entities that this entity can reside with on the same node. If not set, this entity can reside with any entities on the same node.
      
      "speed": 5,
      // Optional. Sets the speed with which the entity moves along an edge to an adjacent node. Default is 0 (instantaneous movement).
      
      "updateOrientation": true
      // Optional. Determines whether the entity's orientation is updated by movement across the NodeMap. Default is false.
    }
*/

/**
 * This component connects an entity to its parent's [[NodeMap]]. It manages navigating the NodeMap and triggering events on the entity related to its position.
 *
 * @namespace platypus.components
 * @class NodeResident
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
	var createGateway = function(nodeDefinition, map, gateway){
		return function(resp){
			// ensure it's a node if one is available at this gateway
			var node = map.getNode(nodeDefinition);
			
			if(this.isPassable(node)){
				this.destinationNodes.length = 0;
				this.destinationNodes.push(node);
				
				if(this.node){
					this.onEdge(node);
				} else {
					this.distance = 0;
				}
				this.progress = 0;
				
				this.setState('going-' + gateway);
				return true;
			}
			
			return false;
		};
	},
	distance = function(origin, destination){
		var x = destination.x - origin.x,
		y = destination.y - origin.y,
		z = destination.z - origin.z;
		
		return Math.sqrt(x*x + y*y + z*z);
	},
	angle = function(origin, destination, distance, ratio){
		var x = destination.x - origin.x,
		y     = destination.y - origin.y,
		a     = 0;
		
		if (origin.rotation && destination.rotation) {
			x = (origin.rotation + 180) % 360;
			y = (destination.rotation + 180) % 360;
			return (x * (1 - ratio) + y * ratio + 180) % 360;
		} else {
			if(!distance){
				return a;
			}
	
			a = Math.acos(x/distance);
			if (y < 0){
				a = (Math.PI * 2) - a;
			}
			return a * 180 / Math.PI;
		}
	},
	axisProgress = function(r, o, d, f){
		return o * (1 - r) + d * r + f;
	},
	isFriendly = function(entities, kinds){
		var x = 0,
		y     = 0,
		found = false;
		
		if (kinds === null) {
			return true;
		}
		
		for(; x < entities.length; x++){
			for(y = 0; y < kinds.length; y++){
				if(entities[x].type === kinds[y]){
					found = true;
				}
			}
			if(!found){
				return false;
			} else {
				found = false;
			}
		}
		
		return true;
	};
	
	return platypus.createComponentClass({
		
		id: 'NodeResident',
		
		constructor: function(definition){
			var offset = definition.offset || this.owner.nodeOffset || {};
			
			this.nodeId = this.owner.nodeId = definition.nodeId || this.owner.nodeId;
			
			this.neighbors = {};
			this.friendlyNodes = definition.nodes || null;
			this.friendlyEntities = definition.shares || null;
			this.speed = definition.speed || 0;
			this.snapToNodes = definition.snapToNodes || false;
			this.updateOrientation = definition.updateOrientation || false;
			this.distance = 0;
			this.buffer   = definition.buffer || 0;
			this.progress = 0;
			this.offset = {
				x: offset.x || 0,
				y: offset.y || 0,
				z: offset.z || 0
			};
			this.destinationNodes = [];
			this.algorithm = definition.algorithm || distance;
			
			this.state = this.owner.state;
			this.currentState = '';
			
		},
		
		events: {
			"set-algorithm": function (algorithm) {
				this.algorithm = algorithm || distance;
			},
			"handle-logic": function (resp) {
				var i    = 0,
				ratio    = 0,
				momentum = 0,
				node     = null;
				
				if (!this.owner.node) {
					this.owner.triggerEvent('on-node', this.owner.parent.getClosestNode([this.owner.x, this.owner.y]));
					
					/**
					 * This event is triggered if the entity is placed on the map but not assigned a node. It is moved to the nearest node and "in-location" is triggered.
					 * 
					 * @event 'in-location'
					 * @param entity {platypus.Entity} The entity that is in location.
					 */
					this.owner.triggerEvent('in-location', this.owner);
				}

				if (typeof this.owner.speed === 'number') {
					this.speed = this.owner.speed;
				}

				if(this.followEntity){
					node = this.followEntity.node || this.followEntity;
//					console.log('Following (' + (node && node.isNode && (node !== this.node)) + ')', node);
					if(node && node.isNode && (node !== this.node)){
						this.lag = 0;
						this.state.moving = this.gotoNode();
						if (this.followDistance){
							momentum = this.lag;
						}
					} else {
					    this.followEntity = null;
					}
				} else {
					momentum = this.speed * resp.delta;
				}

				// if goto-node was blocked, try again.
				if(this.blocked){
					this.blocked = false;
					if(this.goingToNode){
						this.owner.triggerEvent('goto-closest-node', this.goingToNode);
					}
				}
				
				if(this.destinationNodes.length){
					this.state.moving = true;
					if(this.node){
						//console.log('Leaving ' + this.node.id);
						this.onEdge(this.destinationNodes[0]);
					} else if(!this.lastNode){
						this.owner.triggerEvent('on-node', this.destinationNodes[0]);
						this.destinationNodes.splice(0, 1);
						if(!this.destinationNodes.length){
							this.state.moving = false;
							return ;
						}
					}
					
					if(this.snapToNodes){
						for(; i < this.destinationNodes.length; i++){
							this.owner.triggerEvent('on-node', this.destinationNodes[i]);
						}
						this.destinationNodes.length = 0;
					} else {
						while(this.destinationNodes.length && momentum){
							if((this.progress + momentum) >= this.distance){
								node = this.destinationNodes[0];
								momentum -= (this.distance - this.progress);
								this.progress = 0;
								this.destinationNodes.splice(0,1);
								this.owner.triggerEvent('on-node', node);
								if(this.destinationNodes.length && momentum){
									this.onEdge(this.destinationNodes[0]);								}
							} else {
								this.progress += momentum;
								ratio = this.progress / this.distance;
								this.owner.x = axisProgress(ratio, this.lastNode.x, this.destinationNodes[0].x, this.offset.x);
								this.owner.y = axisProgress(ratio, this.lastNode.y, this.destinationNodes[0].y, this.offset.y);
								this.owner.z = axisProgress(ratio, this.lastNode.z, this.destinationNodes[0].z, this.offset.z);
								if(this.updateOrientation){
									this.owner.rotation = angle(this.lastNode, this.destinationNodes[0], this.distanc, ratio);
								}
								momentum = 0;
							}
						}
					}
				} else {
					this.state.moving = false;
				}
			},
			"on-node": function(node){
				var i    = '',
				j        = 0,
				entities = null;
				
				this.owner.node = this.node = node; //TODO: not sure if this needs to be accessible outside this component.
				this.node.removeFromEdge(this.owner);
				if(this.lastNode){
					this.lastNode.removeFromEdge(this.owner);
				}
				this.node.addToNode(this.owner);
				
				this.setState('on-node');
				
				this.owner.x = this.node.x + this.offset.x;
				this.owner.y = this.node.y + this.offset.y;
				this.owner.z = this.node.z + this.offset.z;
				if(this.updateOrientation && this.node.rotation){
					this.owner.rotation = this.node.rotation;
				}
				
				//add listeners for directions
				this.owner.triggerEvent('set-directions');
				
				//trigger mapped messages for node types
				if(this.friendlyNodes && this.friendlyNodes[node.type]){
					this.owner.trigger(this.friendlyNodes[node.type], node);
				}

				//trigger "with" events
				entities = node.contains;
				for (j = 0; j < entities.length; j++){
					if(this.owner !== entities[j]){
						entities[j].triggerEvent("with-" + this.owner.type, this.owner);
						this.owner.triggerEvent("with-" + entities[j].type, entities[j]);
					}
				}
			},
			"leave-node": function(){
				if(this.node){
					this.node.removeFromNode(this.owner);
					this.owner.triggerEvent('left-node', this.node);
					this.owner.triggerEvent('remove-directions');
				}
				this.lastNode = this.node;
				this.node = null;
			},
			"goto-node": function(node){
				this.gotoNode(node);
			},
			"follow": function(entityOrNode){
				if(entityOrNode.entity){
					this.followDistance = entityOrNode.distance;
					this.followEntity = entityOrNode.entity;
				} else {
					this.followDistance = 0;
					this.followEntity = entityOrNode;
				}
			},
			"goto-closest-node": (function(){
				var checkList = function(here, list){
					var i = 0;
					
					for (; i < list.length; i++){
						if(list[i] === here){
							return true;
						}
					}
					
					return false;
				},
				checkType = function(here, type){
					return (here.type === type);
				},
				checkObjectType = function(here, node){
					return (here.type === node.type);
				};
				
				return function(nodesOrNodeType){
					var travResp = null,
					depth        = 20, //arbitrary limit
					origin       = this.node || this.lastNode,
					test         = null,
					steps        = nodesOrNodeType.steps || 0;

					this.goingToNode = nodesOrNodeType;
					
					if(typeof nodesOrNodeType === 'string'){
						test = checkType;
					} else if(typeof nodesOrNodeType.type === 'string'){
						test = checkObjectType;
					} else {
						test = checkList;
					}
					
					if(origin && nodesOrNodeType && !test(origin, nodesOrNodeType)){
						travResp = this.traverseNode({
							depth:        depth,
							origin:       origin,
							position:     origin,
							test:         test,
							destination:  nodesOrNodeType,
							nodes:        [],
							shortestPath: Infinity,
							distance:     0,
							found:        false,
							algorithm:    this.algorithm,
							blocked:      false
						});
						
						travResp.distance -= this.progress;
						
						if(travResp.found){
							//TODO: should probably set this up apart from this containing function
							if(this.followEntity){
								if(!this.followDistance){
									return this.setPath(travResp, steps);
								} else {
									if((travResp.distance + (this.followEntity.progress || 0)) > this.followDistance){
										this.lag = travResp.distance + (this.followEntity.progress || 0) - this.followDistance;
										return this.setPath(travResp, steps);
									} else {
										this.lag = 0;
									}
								}
							} else {
								return this.setPath(travResp, steps);
							}
						} else if(travResp.blocked){
							this.blocked = true;
							return false;
						}
					}
					
					return false;
				};
			})(),
			"set-directions": function(){
				var i    = '',
				j        = 0,
				entities = null,
				node     = this.node,
				nextNode = null;
				
				this.owner.triggerEvent('remove-directions');
				
				for (i in node.neighbors){
					this.neighbors[i] = createGateway(node.neighbors[i], node.map, i);
					this.addEventListener(i, this.neighbors[i]);
					
					//trigger "next-to" events
					nextNode = node.map.getNode(node.neighbors[i]);
					if(nextNode){
						entities = nextNode.contains;
						for (j = 0; j < entities.length; j++){
							entities[j].triggerEvent("next-to-" + this.owner.type, this.owner);
							this.owner.triggerEvent("next-to-" + entities[j].type, entities[j]);
						}
					}
				}
			},
			"remove-directions": function(){
				for (var i in this.neighbors){
					this.removeEventListener(i, this.neighbors[i]);
					delete this.neighbors[i];
				}
			}
		},
		
		methods:{
			gotoNode: (function(){
				var test = function(here, there){
					return (here === there);
				};
				
				return function(node){
					var travResp = null,
					depth = 20, //arbitrary limit
					origin = this.node || this.lastNode;
					
					if(!node && this.followEntity){
						node = this.followEntity.node || this.followEntity.lastNode || this.followEntity;
					}
					
					if(origin && node && (this.node !== node)){
						travResp = this.traverseNode({
							depth:        depth,
							origin:       origin,
							position:     origin,
							test:         test,
							destination:  node,
							nodes:        [],
							shortestPath: Infinity,
							distance:     0,
							found:        false,
							algorithm:    this.algorithm,
							blocked:      false
						});
						
						travResp.distance -= this.progress;
						
						if(travResp.found){
							//TODO: should probably set this up apart from this containing function
							if(this.followEntity){
								if(!this.followDistance){
									return this.setPath(travResp);
								} else {
									if((travResp.distance + (this.followEntity.progress || 0)) > this.followDistance){
										this.lag = travResp.distance + (this.followEntity.progress || 0) - this.followDistance;
										return this.setPath(travResp);
									} else {
										this.lag = 0;
									}
								}
							} else {
								return this.setPath(travResp);
							}
						} else if(travResp.blocked){
							this.blocked = true;
							return false;
						}
					}
					
					return false;
				};
			})(),
			
			isPassable: function(node){
				/*if(log){
					if(!node){
						console.log('No node.'); 
					} else if(this.node === node) {
						console.log(node.id + ': Same as current node.');
					} else if((this.friendlyNodes && (typeof this.friendlyNodes[node.type] === 'undefined'))){
						console.log(node.id + ': Not a friendly node type (' + node.type + ').');
					} else if ((node.contains.length && !isFriendly(node.contains, this.friendlyEntities))){
						console.log(node.id + ': Blocked by Entity', node.contains);
					}
					return node && (this.node !== node) && (!this.friendlyNodes || (typeof this.friendlyNodes[node.type] !== 'undefined')) && (!node.contains.length || isFriendly(node.contains, this.friendlyEntities));
				}*/
				return node && (this.node !== node) && (!this.friendlyNodes || (typeof this.friendlyNodes[node.type] !== 'undefined')) && (!node.contains.length || isFriendly(node.contains, this.friendlyEntities));
			},
			traverseNode: function(record){
				//TODO: may want to make this use A*. Currently node traversal order is arbitrary and essentially searches entire graph, but does clip out paths that are too long.
				
				var i     = 1,
				j         = '',
				map       = record.position.map,
				neighbors = null,
				node      = null,
				nodeList  = null,
				resp      = null,
				algorithm = record.algorithm || distance,
				savedResp = {
					shortestPath: Infinity,
					found: false,
					blocked: false
				},
				blocked   = true,
				hasNeighbor = false;

				if((record.depth === 0) || (record.distance > record.shortestPath)){
					// if we've reached our search depth or are following a path longer than our recorded successful distance, bail
					return record;
				} else if(record.test(record.position, record.destination)){
					// if we've reached our destination, set shortest path information and bail.
					record.found = true;
					record.shortestPath = record.distance;
					return record;
				} else {
					//Make sure we do not trace an infinite node loop.
					nodeList = record.nodes;
					for(; i < nodeList.length - 1; i++){
						if(nodeList[i] === record.position){
							return record;
						}
					}
						
					neighbors = record.position.neighbors;
					for (j in neighbors){
						node = map.getNode(neighbors[j]);
						hasNeighbor = true;
						if(this.isPassable(node)){
							nodeList = record.nodes.slice();
							nodeList.push(node);
							resp = this.traverseNode({
								depth:        record.depth - 1,
								origin:       record.origin,
								position:     node,
								destination:  record.destination,
								test:         record.test,
								algorithm:    algorithm,
								nodes:        nodeList,
								shortestPath: record.shortestPath,
								distance:     record.distance + algorithm(record.position, node),
								gateway:      record.gateway || j,
								found:        false,
								blocked:      false
							});
							if(resp.found && (savedResp.shortestPath > resp.shortestPath)){
								savedResp = resp;
							}
							blocked = false;
						}
					}
					savedResp.blocked = (hasNeighbor && blocked);
					return savedResp;
				}
			},
			setPath: function(resp, steps){
				if(resp.nodes[0] === this.node){
					resp.nodes.splice(0,1);
				}
				this.destinationNodes = resp.nodes;
				if(steps){
					this.destinationNodes.length = Math.min(steps, this.destinationNodes.length);
				}
			},
			setState: function(state){
				if(state === 'on-node'){
					this.state['on-node'] = true;
				} else {
					this.state['on-node'] = false;
					if(this.currentState){
						this.state[this.currentState] = false;
					}
					this.currentState = state;
					this.state[state] = true;
				}
			},
			onEdge: function(toNode){
				this.distance = distance(this.node, toNode);
				if(this.updateOrientation){
					this.owner.rotation = angle(this.node, toNode, this.distance, this.progress / this.distance);
				}
				this.node.addToEdge(this.owner);
				toNode.addToEdge(this.owner);
				this.owner.triggerEvent('leave-node');
			}
		}
	});
}());

//##############################################################################
// Orientation.js
//##############################################################################

/**
 * This component handles the orientation of an entity. It maintains an `orientationMatrix` property on the owner to describe the entity's orientation using an affine transformation matrix.
 * 
 * Several methods on this component accept either a 3x3 2D Array or a string to describe orientation changes. Accepted strings include:
 *  - "horizontal"       - This flips the entity around the y-axis.
 *  - "vertical"         - This flips the entity around the x-axis.
 *  - "diagonal"         - This flips the entity around the x=y axis.
 *  - "diagonal-inverse" - This flips the entity around the x=-y axis.
 *  - "rotate-90"        - This rotates the entity 90 degrees clockwise.
 *  - "rotate-180"       - This rotates the entity 180 degrees clockwise (noticeable when tweening).
 *  - "rotate-270"       - This rotates the entity 90 degrees counter-clockwise. 
 * 
 * NOTE: This component absorbs specific properties already on the entity into orientation:
 *  - **orientationMatrix**: 3x3 2D array describing an affine transformation.
 *  - If the above is not provided, these properties are used to set initial orientation. This is useful when importing Tiled maps.
 *     - **scaleX**: absorb -1 if described
 *     - **scaleY**: absorb -1 if described
 *     - **rotation**: absorb 90 degree rotations
 * 
 * @namespace platypus.components
 * @class Orientation
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var matrices = {
            'horizontal':              [[ -1,  0,  0],
                                        [  0,  1,  0],
                                        [  0,  0, -1]],
            'vertical':                [[  1,  0,  0],
                                        [  0, -1,  0],
                                        [  0,  0, -1]],
            'diagonal':                [[  0,  1,  0],
                                        [  1,  0,  0],
                                        [  0,  0, -1]],
            'diagonal-inverse':        [[  0, -1,  0],
                                        [ -1,  0,  0],
                                        [  0,  0, -1]],
            'rotate-90':               [[  0, -1,  0],
                                        [  1,  0,  0],
                                        [  0,  0,  1]],
            'rotate-180':              [[ -1,  0,  0],
                                        [  0, -1,  0],
                                        [  0,  0,  1]],
            'rotate-270':              [[  0,  1,  0],
                                        [ -1,  0,  0],
                                        [  0,  0,  1]]
        },
        multiply = (function () {
            var cell = function (row, column, m) {
                var i = 0,
                    sum = 0;

                for (i = 0; i < row.length; i++) {
                    sum += row[i] * m[i][column];
                }

                return sum;
            };

            return function (a, b, dest) {
                var i   = 0,
                    j   = 0,
                    arr = [];

                for (i = 0; i < a.length; i++) {
                    for (j = 0; j < a[0].length; j++) {
                        arr.push(cell(a[i], j, b));
                    }
                }

                for (i = 0; i < a.length; i++) {
                    for (j = 0; j < a[0].length; j++) {
                        dest[i][j] = arr.splice(0, 1)[0];
                    }
                }
            };
        }()),
        identitize = function (m) {
            var i = 0,
                j = 0;

            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    if (i === j) {
                        m[i][j] = 1;
                    } else {
                        m[i][j] = 0;
                    }
                }
            }

            return m;
        };
    
    return platypus.createComponentClass({
        id: 'Orientation',
        publicProperties: {
            /**
             * The Entity's scale along the X-axis will mirror the entity's initial orientation if it is negative. This value is available via `entity.scaleX`, but is not manipulated by this component after instantiation.
             * 
             * @property scaleX
             * @type number
             * @default 1
             */
            "scaleX": 1,

            /**
             * The Entity's scale along the Y-axis will flip the entity's initial orientation if it is negative. This value is available via `entity.scaleY`, but is not manipulated by this component after instantiation.
             * 
             * @property scaleY
             * @type number
             * @default 1
             */
            "scaleY": 1,

            /**
             * The Entity's rotation will rotate entity's initial orientation if it is a multiple of 90 degrees. This value is available via `entity.rotation`, but is not manipulated by this component after instantiation.
             * 
             * @property rotation
             * @type number
             * @default 0
             */
            "rotation": 0,

            /**
             * The Entity's orientation is an angle in radians describing an entity's orientation around the Z-axis. This property is affected by a changing `entity.orientationMatrix` but does not itself change the orientation matrix.
             * 
             * @property orientation
             * @type number
             * @default 0
             */
            "orientation": 0,
            
            /**
             * The entity's orientation matrix determines the orientation of an entity and its vectors. It's a 3x3 2D Array describing an affine transformation of the entity.
             * 
             * @property orientationMatrix
             * @type Array
             * @default 3x3 identity matrix
             */
            "orientationMatrix": null
        },
        constructor: (function () {
            var setupOrientation = function (self, orientation) {
                var normal = new platypus.Vector([0, 0, 1]),
                    origin = new platypus.Vector([1, 0, 0]),
                    vector = new platypus.Vector([1, 0, 0]),
                    owner  = self.owner,
                    matrix = [[1, 0, 0],
                              [0, 1, 0],
                              [0, 0, 1]];
                
                Object.defineProperty(owner, 'orientationMatrix', {
                    get: function () {
                        multiply(self.matrixTween, self.matrix, identitize(matrix));
                        return matrix;
                    },
                    enumerable: true
                });

                delete owner.orientation;
                Object.defineProperty(owner, 'orientation', {
                    get: function () {
                        return vector.signedAngleTo(origin, normal);
                    },
                    set: function (value) {
                        vector.set(origin).rotate(value);
                    },
                    enumerable: true
                });

                if (orientation) {
                    if (isNaN(orientation)) {
                        vector.set(orientation);
                    } else {
                        vector.rotate(orientation);
                    }
                }

                return vector;
            };
            
            return function (definition) {
                this.loadedOrientationMatrix = this.orientationMatrix;
                
                // This is the stationary transform
                this.matrix   = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
                
                // This is the tweening transform
                this.matrixTween = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
                
                this.vectors  = [];
                this.inverses = [];
                this.tweens   = [];
                
                this.owner.triggerEvent('orient-vector', setupOrientation(this, this.orientation));
            };
        }()),

        events: {
            /**
             * This component listens for this event prior to loading initial transformations.
             * 
             * @method 'load'
             */
            "load": function () {
                if (this.loadedOrientationMatrix) {
                    this.transform(this.loadedOrientationMatrix);
                } else {
                    if (this.scaleX && this.scaleX < 0) {
                        this.scaleX = -this.scaleX;
                        this.transform('horizontal');
                    }
                    if (this.scaleY && this.scaleY < 0) {
                        this.scaleY = -this.scaleY;
                        this.transform('vertical');
                    }
                    if (this.rotation) {
                        if (((this.rotation + 270) % 360) === 0) {
                            this.rotation = 0;
                            this.transform('rotate-90');
                        } else if (((this.rotation + 180) % 360) === 0) {
                            this.rotation = 0;
                            this.transform('rotate-180');
                        } else if (((this.rotation + 90) % 360) === 0) {
                            this.rotation = 0;
                            this.transform('rotate-270');
                        }
                    }
                }
                delete this.loadedOrientationMatrix;
            },
            
            /**
             * On the 'handle-logic' event, this component updates any transformational tweening of the entity.
             * 
             * @method 'handle-logic'
             * @param tick.delta {number} Time passed since the last logic step.
             */
            "handle-logic": function (tick) {
                var i = 0,
                    delta = tick.delta,
                    state = this.owner.state,
                    finishedTweening = [];
                
                if (this.tweens.length) {
                    state.reorienting = true;
                    identitize(this.matrixTween);
                    
                    for (i = this.tweens.length - 1; i >= 0; i--) {
                        if (this.updateTween(this.tweens[i], delta)) { // finished tweening
                            finishedTweening.push(this.tweens.splice(i, 1)[0]);
                        }
                    }
                    for (i = 0; i < this.vectors.length; i++) {
                        this.updateVector(this.vectors[i], this.inverses[i]);
                    }
                    for (i = 0; i < finishedTweening.length; i++) {
                        this.transform(finishedTweening[i].endMatrix);
                        finishedTweening[i].onFinished(finishedTweening[i].endMatrix);
                    }
                } else if (state.reorienting) {
                    identitize(this.matrixTween);
                    state.reorienting = false;
                }
            },
            
            /**
             * On receiving this message, any currently running orientation tweens are discarded, returning the entity to its last stable position.
             * 
             * @method 'drop-tweens'
             */
            "drop-tweens": function () {
                var i = 0;
                
                this.tweens.length = 0;
                for (i = 0; i < this.vectors.length; i++) {
                    this.updateVector(this.vectors[i], this.inverses[i]);
                }
            },
            
            /**
             * On receiving a vector via this event, the component will transform the vector using the current orientation matrix and then store the vector and continue manipulating it as the orientation matrix changes.
             * 
             * @method 'orient-vector'
             * @param vector {Vector} The vector whose orientation will be maintained.
             */
            "orient-vector": function (vector) {
                var i = 0,
                    found = false,
                    aligned = vector.aligned || false;
                
                if (vector.vector) {
                    vector = vector.vector;
                }
                
                for (i = 0; i < this.vectors.length; i++) {
                    if (vector === this.vectors[i]) {
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    if (!aligned) {
                        vector.multiply(this.matrix);
                    }
                    this.vectors.push(vector);
                    this.inverses.push(new platypus.Vector());
                }
            },
            
            /**
             * On receiving this message, the maintained vector is immediately dropped from the list of maintained vectors.
             * 
             * @method 'remove-vector'
             * @param vector {Vector} The vector to be removed.
             */
            "remove-vector": function (vector) {
                var i = 0;
                
                for (i = 0; i < this.vectors.length; i++) {
                    if (vector === this.vectors[i]) {
                        this.vectors.splice(i, 1);
                        this.inverses.splice(i, 1);
                        break;
                    }
                }
            },
            
            /**
             * This message causes the component to begin tweening the entity's orientation over a span of time into the new orientation.
             * 
             * @method 'tween-transform'
             * @param options {Object} A list of key/value pairs describing the tween options.
             * @param options.matrix {Array} A transformation matrix: only required if `transform` is not provided
             * @param options.transform {String} A transformation type: only required if `matrix` is not provided.
             * @param options.time {number} The time over which the tween occurs. 0 makes it instantaneous.
             * @param [options.angle] {number} Angle in radians to transform. This is only valid for rotations and is derived from the transform if not provided.
             * @param [options.tween] {Function} A function describing the transition. Performs a linear transition by default. See CreateJS Ease for other options.
             * @param [options.onTick] {Function} A function that should be processed on each tick as the tween occurs.
             * @param [options.onFinished] {Function} A function that should be run once the transition is complete.
             */
            "tween-transform": (function () {
                var doNothing = function () {
                        // Doing nothing!
                    },
                    linearEase = function (t) {
                        return t;
                    };

                return function (props) {
                    var angle  = props.angle || 0,
                        matrix = props.matrix;
                    
                    if (!matrix) {
                        matrix = matrices[props.transform];
                    }
                    
                    if (!angle && (props.transform.indexOf('rotate') === 0)) {
                        switch (props.transform) {
                        case 'rotate-90':
                            angle = Math.PI / 2;
                            break;
                        case 'rotate-180':
                            angle = Math.PI;
                            break;
                        case 'rotate-270':
                            angle = -Math.PI / 2;
                            break;
                        default:
                            angle = (props.transform.split('-')[1] / 180) * Math.PI;
                            break;
                        }
                    }
                    
                    this.tweens.push({
                        transform: props.transform,
                        endTime: props.time || 0,
                        time: 0,
                        endMatrix: matrix,
                        angle: angle,
                        tween: props.tween || linearEase,
                        onFinished: props.onFinished || doNothing,
                        onTick: props.onTick || doNothing
                    });
                };
            }()),
            
            /**
             * This message performs an immediate transform of the entity by performing the transformation via a prepended matrix multiplication.
             * 
             * @method 'transform'
             * @param transform {Array|String} A 3x3 @D Array or a string describing a transformation.
             */
            "transform": function (transform) {
                this.transform(transform);
            },
            
            /**
             * This message performs an immediate transform of the entity by performing the transformation via a prepended matrix multiplication.
             * 
             * @method 'prepend-transform'
             * @param transform {Array|String} A 3x3 @D Array or a string describing a transformation.
             */
            "prepend-transform": function (transform) {
                this.transform(transform);
            },
            
            /**
             * This message performs an immediate transform of the entity by performing the transformation via an appended matrix multiplication.
             * 
             * @method 'append-transform'
             * @param transform {Array|String} A 3x3 @D Array or a string describing a transformation.
             */
            "append-transform": function (transform) {
                this.transform(transform, true);
            },
            
            /**
             * This message performs an immediate transform of the entity by returning the entity to an identity transform before performing a matrix multiplication.
             * 
             * @method 'replace-transform'
             * @param transform {Array|String} A 3x3 @D Array or a string describing a transformation.
             */
            "replace-transform": function (transform) {
                this.replace(transform);
            }
        },
        
        methods: {
            transform: function (transform, append) {
                if (Array.isArray(transform)) {
                    this.multiply(transform, append);
                } else if (typeof transform === 'string') {
                    if (matrices[transform]) {
                        this.multiply(matrices[transform], append);
                    }
                }
            },
            
            multiply: (function () {
                return function (m, append) {
                    var i = 0;
                    
                    if (append) {
                        multiply(this.matrix, m, this.matrix);
                    } else {
                        multiply(m, this.matrix, this.matrix);
                    }
                    
                    for (i = 0; i < this.vectors.length; i++) {
                        this.vectors[i].multiply(m);
                        this.inverses[i].multiply(m);
                    }
                    
                    /**
                     * Once a transform is complete, this event is triggered to notify the entity of the completed transformation.
                     * 
                     * @event 'orientation-updated'
                     * @param matrix {Array} A 3x3 2D array describing the change in orientation.
                     */
                    this.owner.triggerEvent('orientation-updated', m);
                };
            }()),

            replace: (function () {
                var det2 = function (a, b, c, d) {
                        return a * d - b * c;
                    },
                    det3 = function (a) {
                        var i = 0,
                            sum = 0;

                        for (i = 0; i < 3; i++) {
                            sum += a[i][0] * a[(i + 1) % 3][1] * a[(i + 2) % 3][2];
                            sum -= a[i][2] * a[(i + 1) % 3][1] * a[(i + 2) % 3][0];
                        }
                        return sum;
                    },
                    invert = function (a) {
                        var arr = [[], [], []],
                            inv = 1 / det3(a);

                        arr[0].push(det2(a[1][1], a[1][2], a[2][1], a[2][2]) * inv);
                        arr[0].push(det2(a[0][2], a[0][1], a[2][2], a[2][1]) * inv);
                        arr[0].push(det2(a[0][1], a[0][2], a[1][1], a[1][2]) * inv);
                        arr[1].push(det2(a[1][2], a[1][0], a[2][2], a[2][0]) * inv);
                        arr[1].push(det2(a[0][0], a[0][2], a[2][0], a[2][2]) * inv);
                        arr[1].push(det2(a[0][2], a[0][0], a[1][2], a[1][0]) * inv);
                        arr[2].push(det2(a[1][0], a[1][1], a[2][0], a[2][1]) * inv);
                        arr[2].push(det2(a[0][1], a[0][0], a[2][1], a[2][0]) * inv);
                        arr[2].push(det2(a[0][0], a[0][1], a[1][0], a[1][1]) * inv);

                        return arr;
                    };
                
                return function (m) {
                    // We invert the matrix so we can re-orient all vectors for the incoming replacement matrix.
                    this.multiply(invert(this.matrix));
                    this.multiply(m);
                };
            }()),
            
            updateTween: (function () {
                var getMid = function (a, b, t) {
                    return (a * (1 - t) + b * t);
                };
                
                return function (tween, delta) {
                    var t = 0,
                        a = 1,                //  a c -
                        b = 0,                //  b d -
                        c = 0,                //  - - z
                        d = 1,
                        z = 1,
                        angle = 0,
                        m = tween.endMatrix,
                        matrix = null;
                    
                    tween.time += delta;
                    
                    if (tween.time >= tween.endTime) {
                        return true;
                    }
                    
                    t = tween.tween(tween.time / tween.endTime);
                    
                    if (tween.angle) {
                        angle = t * tween.angle;
                        a = d = Math.cos(angle);
                        b = Math.sin(angle);
                        c = -b;
                    } else {
                        a = getMid(a, m[0][0], t);
                        b = getMid(b, m[1][0], t);
                        c = getMid(c, m[0][1], t);
                        d = getMid(d, m[1][1], t);
                        z = getMid(z, m[2][2], t);
                    }
                    
                    matrix = [[a, c, 0], [b, d, 0], [0, 0, z]];

                    multiply(matrix, this.matrixTween, this.matrixTween);

                    tween.onTick(t, matrix);
                };
            }()),
            
            updateVector: function (vector, inverse) {
                inverse.set(vector.add(inverse));
                vector.multiply(this.matrixTween);
                inverse.subtractVector(vector);
            },
            
            destroy: function () {
                
            }
        },
        
        publicMethods: {
            
        }
    });
}());

//##############################################################################
// RandomEvents.js
//##############################################################################

/**
# COMPONENT **RandomEvents**
This component listens for certain messages, picks a message from a related list of events, and triggers it. This is useful for adding random behaviors to an entity, such as having an entity say one thing from a list of audio clips.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for messages and on receiving them, triggers a random message from the JSON-defined list.
  - @param message (any) - If a message object comes in with the event, it is passed along with the selected random message.

### Local Broadcasts:
- **[Messages specified in definition]** - On receiving a recognized message, this component triggers one message from a JSON-defined list.
  - @param message (any) - If a message object comes in with the triggered event, it is passed along with the selected random message.

## JSON Definition
    {
      "type": "RandomEvents"
      
      "events"{
      // This is a key/value list of events to listen for, with each event mapping to an array of events to pick from.
      
        "make-sound": ["scream", "whisper", "talk"]
        //on the component receiving the "make-sound" message, it will trigger one of the three possible messages listed here.
      }
    }
*/
/*global platypus */
(function () {
    "use strict";

    var createTrigger = function (eventList) {
        return function (value, debug) {
            this.owner.trigger(eventList[Math.floor(Math.random() * eventList.length)], value, debug);
        };
    };

    return platypus.createComponentClass({
        id: 'RandomEvents',
        
        constructor: function (definition) {
            var event = '';
            
            if (definition.events) {
                for (event in definition.events) {
                    if (definition.events.hasOwnProperty(event)) {
                        this.addEventListener(event, createTrigger(definition.events[event]));
                    }
                }
            }
        }
    });
}());

//##############################################################################
// RelayFamily.js
//##############################################################################

/**
 * This component allows an entity to communicate directly with one or more entities via the message model, by passing local messages directly to entities in the same family as new triggered events. This component is placed on a single entity and all entities created by this entity become part of its "family".
 *
 * @namespace platypus.components
 * @class RelayFamily
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var trigger = function (entities, event, value, debug) {
            var i = 0;

            for (i = 0; i < entities.length; i++) {
                entities[i].trigger(event, value, debug);
            }
        },
        broadcast = function (event) {
            return function (value, debug) {
                trigger(this.owner.familyLinks, event, value, debug);
            };
        };

    return platypus.createComponentClass({
        id: 'RelayFamily',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the event that will be broadcast to its linked entities. The value can also be an array of events to be fired on linked entities.
             *
             *      "events": {
             *          "sleeping": "good-night",
             *          "awake": ["alarm", "get-up"]
             *      }
             *
             * @property events
             * @type Object
             * @default null
             */
            events: null
        },

        publicProperties: {

        },

        constructor: function (definition) {
            var event = '';
            
            if (this.events) {
                for (event in this.events) {
                    if (this.events.hasOwnProperty(event)) {
                        this.addEventListener(event, broadcast(this.events[event]));
                    }
                }
            }
    
            this.owner.familyLinks = [this.owner];
        },
        
        events: {


            /**
             * Called when linking a new member to the family, this event accepts a list of family members from the new member and uses it to link all the family members together.
             *
             * @method 'link-family'
             * @param links {Array|Entities} An array of entities.
             */
            "link-family": function (links) {
                var i = 0,
                    oldList = this.owner.familyLinks,
                    newList = links.concat(oldList);

                for (i = 0; i < newList.length; i++) {
                    newList[i].familyLinks = newList;
                }
                trigger(links,   'family-members-added', oldList);
                trigger(oldList, 'family-members-added', links);
            },
            
            /**
             * Called when this entity spawns a new entity, this event links the newly created entity to this entity.
             *
             * @method 'entity-created'
             * @param entity {Entity} The entity to link.
             */
            "entity-created": function (entity) {
                if (!entity.triggerEvent('link-family', this.owner.familyLinks)) {
                    entity.addComponent(new platypus.components['RelayFamily'](entity, {}));
                    entity.triggerEvent('link-family', this.owner.familyLinks);
                }
            }
        },
        
        methods: {
            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.owner.familyLinks.length; i++) {
                    if (this.owner === this.owner.familyLinks[i]) {
                        this.owner.familyLinks.splice(i, 1);
                        break;
                    }
                }
                trigger(this.owner.familyLinks, 'family-member-removed', this.owner);
                this.events = null;
            }
        }
    });
}());

//##############################################################################
// RelayGame.js
//##############################################################################

/**
 * This component listens for specified local entity messages and re-broadcasts them at the scene level.
 *
 * @namespace platypus.components
 * @class RelayGame
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    var broadcast = function (event) {
        return function (value, debug) {
            platypus.game.currentScene.trigger(event, value, debug);
        };
    };
    
    return platypus.createComponentClass({
        id: 'RelayGame',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the event to be broadcast to the scene. The value can also be an array of events to be fired on the scene.
             *
             *      "events": {
             *          "sleeping": "good-night",
             *          "awake": ["alarm", "get-up"]
             *      }
             *
             * @property events
             * @type Object
             * @default null
             */
            events: null
        },

        publicProperties: {

        },

        constructor: function (definition) {
            var event = '';
            
            // Messages that this component listens for and then broadcasts to all layers.
            if (this.events) {
                for (event in this.events) {
                    if (this.events.hasOwnProperty(event)) {
                        this.addEventListener(event, broadcast(this.events[event]));
                    }
                }
            }
        }
    });
}());

//##############################################################################
// RelayLinker.js
//##############################################################################

/**
 * Allows an entity to communicate directly with one or more entities via the message model by passing local events directly to the linked entities as new triggered events.
 *
 * @namespace platypus.components
 * @class RelayLinker
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var broadcast = function (event) {
        return function (value, debug) {
            var i = 0;
            
            for (i = 0; i < this.links.length; i++) {
                this.links[i].trigger(event, value, debug);
            }
        };
    };

    return platypus.createComponentClass({
        id: 'RelayLinker',

        properties: {
            /**
             * The id that defines the 'channel' the linkers are talking on. This should be matched on the entity/entities you want to talk between.
             *
             * @property linkId
             * @type String
             * @default 'linked'
             */
            linkId: 'linked',
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the event to be broadcast to its linked entities. The value can also be an array of events to be fired on linked entities.
             *
             *      "events": {
             *          "sleeping": "good-night",
             *          "awake": ["alarm", "get-up"]
             *      }
             *
             * @property events
             * @type Object
             * @default null
             */
            events: null
        },

        publicProperties: {

        },

        constructor: function (definition) {
            var i = 0,
                self  = this,
                event = '';

            if (this.events) {
                for (event in this.events) {
                    if (this.events.hasOwnProperty(event)) {
                        this.addEventListener(event, broadcast(this.events[event]));
                    }
                }
            }
            
            if (!this.owner.linkId) {
                this.owner.linkId = this.linkId;
            }
            
            this.addEventListener('to-' + this.linkId + '-entities', broadcast('from-' + this.linkId + '-entities'));
            this.addEventListener('from-' + this.linkId + '-entities', function (resp) {
                self.owner.trigger(resp.message, resp.value, resp.debug);
            });
            
            this.links = [];
            
            if (this.owner.linkEntities) {
                for (i = 0; i < this.owner.linkEntities.length; i++) {
                    this.links.push(this.owner.linkEntities[i]);
                }
            }
            
            this.message = {
                message: '',
                value: null
            };
            this.linkMessage = {
                entity: this.owner,
                linkId: this.linkId,
                reciprocate: false
            };
            
            // In case linker is added after adoption
            if (this.owner.parent) {
                this.resolveAdoption();
            }
        },
        
        events: {

            /**
             * Called when the object is added to its parent, on receiving this message, the component tries to link itself with objects with the same link id.
             *
             * @method 'adopted'
             * @param owner {Entity} The owner of this component.
             */
            "adopted": function (owner) {
                this.resolveAdoption(owner);
            },
            
            /**
             * On receiving this message, this component checks the linkId of the requesting entity and adds it to its list of connections if it matches.
             *
             * @method 'link-entity'
             * @param toLink {Entity} The enquiring entity.
             */
            "link-entity": function (toLink) {
                var i = 0,
                    already = false;
                
                if ((toLink.linkId === this.linkId) && (toLink.entity !== this.owner)) {
                    // Make sure this link is not already in place
                    for (i = 0; i < this.links.length; i++) {
                        if (this.links[i] === toLink.entity) {
                            already = true;
                            break;
                        }
                    }
                    
                    if (!already) {
                        this.links.push(toLink.entity);
                        if (toLink.reciprocate) {
                            this.linkMessage.reciprocate = false;
                            toLink.entity.trigger('link-entity', this.linkMessage);
                        }
                    }
                }
            },
            
            /**
             * Removes the requesting entity from this component's list of linked entities and no farther messages will be transmitted.
             *
             * @method 'unlink-entity'
             * @param toUnlink {Entity} The enquiring entity.
             */
            "unlink-entity": function (toUnlink) {
                var i = 0;
                
                for (i = 0; i < this.links.length; i++) {
                    if (toUnlink.entity === this.links[i]) {
                        this.links.splice(i, 1);
                        break;
                    }
                }
            }
        },
        
        methods: {
            resolveAdoption: function (owner) {
                var grandparent = this.owner.parent;
                while (grandparent.parent) {
                    grandparent = grandparent.parent;
                }
                this.linkMessage.reciprocate = true;
                grandparent.trigger('link-entity', this.linkMessage, true);
            },
            
            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.links.length; i++) {
                    this.links[i].trigger('unlink-entity', this.linkMessage);
                }
                this.links.length = 0;
                this.events = null;
            }
        }
    });
}());

//##############################################################################
// RelayParent.js
//##############################################################################

/**
# COMPONENT **RelayParent**
This component listens for specified local entity messages and re-broadcasts them on its parent entity.

## Dependencies:
- [[Entity-Container]] (on entity's parent) - This component can broadcast messages to its parent; `this.parent` is commonly specified by being a member of an entity container.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages.
  - @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Parent Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages on the entity's parent if one exists.
  - @param message (object) - sends the message object received by the original message.

## JSON Definition:
    {
      "type": "RelayParent",
      
      "events": {
      // Required: Maps local messages to trigger messages on the entity's parent. At least one of the following mappings should be included.
        
        "local-message-3": "parent-message",
        // On receiving "local-message-3", triggers "parent-message" on the entity's parent.
        
        "local-message-4": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-4", triggers each message in the array in sequence on the entity's parent.
      }
    }
*/
/*global platypus */
(function () {
    "use strict";

    var broadcast = function (event) {
        return function (value, debug) {
            if (this.owner.parent) {
                this.owner.parent.trigger(event, value, debug);
            }
        };
    };
    
    return platypus.createComponentClass({
        id: 'RelayParent',
        
        constructor: function (definition) {
            var event = '';
            
            // Messages that this component listens for and then broadcasts to parent.
            if (definition.events) {
                for (event in definition.events) {
                    if (definition.events.hasOwnProperty(event)) {
                        this.addEventListener(event, broadcast(definition.events[event]));
                    }
                }
            }
        }
    });
}());

//##############################################################################
// RelaySelf.js
//##############################################################################

/**
 * This component listens for specified local entity messages and re-broadcasts them on itself as other messages.
 *
 * @namespace platypus.components
 * @class RelaySelf
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    var broadcast = function (event) {
        return function (value, debug) {
            this.owner.trigger(event, value, debug);
        };
    };
    
    return platypus.createComponentClass({
        id: 'RelaySelf',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the new event to be broadcast on this entity. The value can also be an array of events to be fired.
             *
             *      "events": {
             *          "sleeping": "good-night",
             *          "awake": ["alarm", "get-up"]
             *      }
             *
             * @property events
             * @type Object
             * @default null
             */
            events: null
        },

        publicProperties: {

        },

        constructor: function (definition) {
            var event = '';
            
            // Messages that this component listens for and then triggers on itself as a renamed message - useful as a logic place-holder for simple entities.
            if (this.events) {
                for (event in this.events) {
                    if (this.events.hasOwnProperty(event)) {
                        this.addEventListener(event, broadcast(this.events[event]));
                    }
                }
            }
        }
    });
}());

//##############################################################################
// RenderDebug.js
//##############################################################################

/**
# COMPONENT **RenderDebug**
This component is attached to entities that will appear in the game world. It serves two purposes. First, it displays a rectangle that indicates location of the object. By default it uses the specified position and dimensions of the object (in grey), if the object has a collision component it will display the AABB of the collision shape (in pink). If the entity has a [[Logic-Carrier]] component and is/was carrying an object, a green rectangle will be drawn showing the collision group. The RenderDebug component also allows the user to click on an object and it will print the object in the debug console. 

## Dependencies
- [[HandlerRender]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render** - Repositions the pieces of the component in preparation for rendering
- **handle-render-load** - The visual components are set up and added to the stage. Setting up mouse input stuff. The click-to-print-to-console functionality is set up too. 
  - @param resp.stage ([createjs.Stage][link1]) - This is the stage on which the component will be displayed.

### Local Broadcasts:
- **mousedown** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  

## JSON Definition
    {
      "type": "RenderDebug",
      "acceptInput": {
          //Optional - What types of input the object should take.
          "hover": false;
          "click": false; 
      }, 
      "regX": 0,
      //Optional - The X offset from X position for the displayed shape. If you're using the AABB this is set automatically.
      "regY": 0
      //Optional - The Y offset from Y position for the displayed shape. If you're using the AABB this is set automatically.
    }
    
[link1]: http://createjs.com/Docs/EaselJS/Stage.html
*/
/*global console, createjs, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var types = {
            "aabb":      0xff88ff,
            "render":    0x888888,
            "collision": 0xff00ff,
            "group":     0x00ff00
        },
        createShape = function (shape, type, width, height, regX, regY, z) {
            var newShape = null;

            switch (shape) {
            case 'rectangle':
                newShape = new PIXI.Graphics().beginFill(types[type], 0.1).drawRect(-width  / 2, -height / 2, width, height);
                break;
            case 'circle':
                newShape = new PIXI.Graphics().beginFill(types[type], 0.1).drawCircle(0, 0, width);
                break;
            }
            newShape.z = z;

            return newShape;
        };
    
    return platypus.createComponentClass({
        
        id: 'RenderDebug',
        
        constructor: function (definition) {
            this.regX = definition.regX || 0;
            this.regY = definition.regY || 0;
            this.parentContainer = null;
            this.shapes = [];
            
            this.isOutdated = true;
        },
        
        events: {// These are messages that this component listens for
            "handle-render-load": function (resp) {
                if (!platypus.game.settings.debug) {
                    this.owner.removeComponent(this);
                } else if (!this.parentContainer && resp && resp.container) {
                    this.parentContainer = resp.container;
                }
            },
            
            "handle-render": function (renderData) {
                var i = 0,
                    aabb = null;

                if (!this.parentContainer) {
                    if (!platypus.game.settings.debug) {
                        this.owner.removeComponent(this);
                        return;
                    } else if (renderData.container) {
                        this.parentContainer = resp.container;
                    } else {
                        console.warn('No Container, removing render debug component from "' + this.owner.type + '".');
                        this.owner.removeComponent(this);
                        return;
                    }
                }

                if (this.isOutdated) {
                    this.updateSprites();
                    this.isOutdated = false;
                }
                
                for (i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].x = this.owner.x;
                    this.shapes[i].y = this.owner.y;
                }
                
                if (this.owner.getCollisionGroupAABB) {
                    aabb = this.owner.getCollisionGroupAABB();
                    if (!this.groupShape) {
                        this.groupShape = new PIXI.Graphics().beginFill("rgba(255,255,0,0.2)").drawRect(-0.5, -0.5, 1, 1);
                        this.groupShape.z     = (this.owner.z || 0) + 10000;
                        this.parentContainer.addChild(this.groupShape);
                    }
                    this.groupShape.scaleX = aabb.width;
                    this.groupShape.scaleY = aabb.height;
                    this.groupShape.x      = aabb.x;
                    this.groupShape.y      = aabb.y;
                }
            },
            
            "orientation-updated": function () {
                this.isOutdated = true;
            }
            
        },
        
        methods: {
            updateSprites: function () {
                var z        = (this.owner.z || 0) + 10000,
                    i        = 0,
                    j        = 0,
                    width    = this.owner.width  = this.owner.width  || 300,
                    height   = this.owner.height = this.owner.height || 100,
                    shapes   = null,
                    aabb     = null,
                    shape    = null;

                for (i = 0; i < this.shapes.length; i++) {
                    this.parentContainer.removeChild(this.shapes[i]);
                }
                this.shapes.length = 0;

                if (this.owner.getAABB) {
                    for (j = 0; j < this.owner.collisionTypes.length; j++) {
                        aabb   = this.owner.getAABB(this.owner.collisionTypes[j]);
                        width  = this.initialWidth  = aabb.width;
                        height = this.initialHeight = aabb.height;
                        shapes = this.owner.getShapes(this.owner.collisionTypes[j]);
                        
                        shape  = createShape('rectangle', 'aabb', width, height, this.owner.x - aabb.x, this.owner.y - aabb.y, z--);
                        this.shapes.push(shape);
                        this.parentContainer.addChild(shape);
                        this.addInput(shape);
                        
                        for (i = 0; i < shapes.length; i++) {
                            shape = createShape(shapes[i].type, 'collision', shapes[i].radius || shapes[i].width, shapes[i].height, -shapes[i].offsetX, -shapes[i].offsetY, z--);
                            this.shapes.push(shape);
                            this.parentContainer.addChild(shape);
                            this.addInput(shape);
                        }
                    }
                } else {
                    shape = createShape('rectangle', 'render', width, height, width / 2, height / 2, z--);
                    this.shapes.push(shape);
                    this.parentContainer.addChild(shape);
                    this.addInput(shape);
                }
            },
            
            addInput: (function () {
                var lastEntityLog = null,
                    createHandler = function (self) {
                        return function (event) {
                            if (lastEntityLog !== self.owner) {
                                lastEntityLog = self.owner;
                                console.log('Entity "' + lastEntityLog.type + '":', lastEntityLog);
                            }

                            return false;
                        };
                    };
                
                return function (sprite) {
                    sprite.interactive = true;
                    sprite.addListener('rightdown', createHandler(this));
                };
            }()),
            
            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.shapes.length; i++) {
                    this.parentContainer.removeChild(this.shapes[i]);
                }
                this.shapes.length = 0;
                this.parentContainer = undefined;
            }
        }
    });
}());

//##############################################################################
// RenderDestroyMe.js
//##############################################################################

/**
# COMPONENT **RenderDestroyMe**
This component will destroy the entity once an animation has finished. This is useful for explosions or similar animations where the entity is no longer needed once the animation completes.

## Dependencies:
- [[RenderSprite]] (component on entity) - This component listens for the "animation-complete" event triggered by RenderSprite.

### Listens for:
- **animation-complete** - On receiving this message, the component match the animation id with its animation id setting and destroy the entity if they match.
  - @param animationId (string) - animation id for the animation that just finished.

## JSON Definition:
    {
      "type": "RenderDestroyMe",
      
      "animationId": "bigExplosion"
      //This or animationIds Required. String identifying the animation that should destroy this entity on its completion.
      
      "animationIds": ["bigExplosion", "lessBigExplosion"]
      //This or animationIds Required. Array of Strings identifying the animations that should destroy this entity on their completion.
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'RenderDestroyMe',

        constructor: function (definition) {
            this.animationIds = null;
            
            if (definition.animationId) {
                this.animationIds = [definition.animationId];
            } else if (definition.animationIds) {
                this.animationIds = definition.animationIds;
            }
        },

        events: {// These are messages that this component listens for
            "animation-ended": function (animation) {
                var id = animation.name,
                    x  = 0;
                
                if (this.animationIds) {
                    for (x = 0; x < this.animationIds.length; x++) {
                        if (this.animationIds[x] === id) {
                            this.owner.parent.removeEntity(this.owner);
                            break;
                        }
                    }
                } else {
                    this.owner.parent.removeEntity(this.owner);
                }
            }
        }
    });
}());

//##############################################################################
// RenderProgress.js
//##############################################################################

/**
 * This component creates a visual progress bar that can be used for loading assets or showing other types of progress changes.
 *
 * @namespace platypus.components
 * @class RenderProgress
 * @uses Component
 */
/*global console, PIXI, platypus */
(function () {
    "use strict";
    
    return platypus.createComponentClass({
        
        id: 'RenderProgress',
        
        properties: {
            //TODO: Document!
            backgroundColor: 0x000000,
            
            color: 0xffffff,
            
            rotate: false,
            
            mirror: false,
            
            flip: false,
            
            width: 100,
            
            height: 20,
            
            regX: 0,
            
            regY: 0
        },
        
        publicProperties: {
            x: 0,
            
            y: 0,
            
            z: 0
        },
        
        constructor: function (definition) {
            var b   = new PIXI.Graphics(),
                f   = new PIXI.Graphics(),
                con = new PIXI.Container();
            
            this.parentContainer = null;
            this.background = b;
            this.progress   = f;
            this.container  = con;
            
            if (typeof this.backgroundColor === 'string') {
                this.backgroundColor = +this.backgroundColor.replace('#', '0x');
            }
            if (typeof this.color === 'string') {
                this.color = +this.color.replace('#', '0x');
            }
            
            b.f(this.backgroundColor).r(-this.regX, -this.regY, this.width, this.height);
            f.f(this.color).r(-this.regX, -this.regY, this.width, this.height);
            f.scaleX = 0.0001;
            con.addChild(b);
            con.addChild(f);
        },
        
        events: {
            "handle-render-load": function (resp) {
                if (!this.parentContainer && resp && resp.container) {
                    this.parentContainer = resp.container;
                    this.parentContainer.addChild(this.container);
                }
            },
            
            "handle-render": function (resp) {
                if (!this.container) { // If this component's removal is pending
                    return;
                }

                if (!this.parentContainer) {
                    if (resp && resp.container) {
                        this.parentContainer = resp.container;
                        this.parentContainer.addChild(this.container);
                    } else {
                        console.warn('No PIXI Stage, removing ProgressRender component from "' + this.owner.type + '".');
                        this.owner.removeComponent(this);
                    }
                }
                
                this.container.x = this.x;
                this.container.y = this.y;
                this.container.z = this.z;
            },
            
            "update-progress": function (progress) {
                if (isNaN(progress)) {
                    if (typeof progress.fraction === 'number') {
                        this.progress.scaleX = progress.fraction;
                    } else if ((typeof progress.total === 'number') && (typeof progress.progress === 'number')) {
                        this.progress.scaleX = progress.progress / progress.total;
                    }
                } else {
                    this.progress.scaleX = progress;
                }
            }
        },
        
        methods: {
            destroy: function () {
                if (this.parentContainer) {
                    this.parentContainer.removeChild(this.container);
                    this.parentContainer = null;
                }
                this.container = null;
            }
        }
    });
}());

//##############################################################################
// RenderSprite.js
//##############################################################################

/**
 * This component is attached to entities that will appear in the game world. It renders a static or animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
 *
 * @namespace platypus.components
 * @class RenderSprite
 * @uses Component
 */
/*global console, PIXI, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var ssCache = {},
        tempMatrix = new PIXI.Matrix(),
        changeState = function (state) {
            return function (value) {
                //9-23-13 TML - Commenting this line out to allow animation events to take precedence over the currently playing animation even if it's the same animation. This is useful for animations that should restart on key events.
                //                We may eventually want to add more complexity that would allow some animations to be overridden by messages and some not.
                //if (this.currentAnimation !== state) {
                if (this.animationFinished || (this.lastState >= -1)) {
                    this.currentAnimation = state;
                    this.lastState = -1;
                    this.animationFinished = false;
                    this.sprite.gotoAndPlay(state);
                } else {
                    this.waitingAnimation = state;
                    this.waitingState = -1;
                }
                //}
            };
        },
        createTest = function (testStates, animation) {
            var i = 0,
                states = testStates.replace(/ /g, '').split(',');
            
            if (testStates === 'default') {
                return function (state) {
                    return animation;
                };
            } else {
                return function (state) {
                    for (i = 0; i < states.length; i++) {
                        if (!state[states[i]]) {
                            return false;
                        }
                    }
                    return animation;
                };
            }
        },
        processGraphics = (function () {
            var process = function (gfx, value) {
                var paren  = value.indexOf('('),
                    func   = value.substring(0, paren),
                    values = value.substring(paren + 1, value.indexOf(')'));

                if (values.length) {
                    gfx[func].apply(gfx, values.split(','));
                } else {
                    gfx[func]();
                }
            };

            return function (gfx, value) {
                var i = 0,
                    arr = value.split('.');

                for (i = 0; i < arr.length; i++) {
                    process(gfx, arr[i]);
                }
            };
        }());
    
    return platypus.createComponentClass({
        
        id: 'RenderSprite',
        
        properties: {

            /**
             * The id of the image. Unless otherwise defined the image id is the the name of the image. image is only used when there is no spritesheet. It is useful for files containing a single image.
             *
             * @property image
             * @type String
             * @default null
             */
            image: null,

            /**
             * The x registration point of the image. Used when you don't a spritesheet and are using the image property.
             *
             * @property regX
             * @type Number
             * @default 0
             */
            regX: 0,

            /**
             * The y registration point of the image. Used when you don't a spritesheet and are using the image property.
             *
             * @property regY
             * @type Number
             * @default 0
             */
            regY: 0,

           /**
             * spriteSheet can either be a String or an object. If a string, the spritesheet data will be loaded from the file with a matching name in the spritesheet folder. Otherwise the definition is in full here. That spritesheet data defines an EaselJS sprite sheet to use for rendering. See http://www.createjs.com/Docs/EaselJS/SpriteSheet.html for the full specification.
             *
             *  "spriteSheet": 'hero-image'
             *
             *  -OR-
             *
             *  "spriteSheet": {
             *
             *      "images": ["example0", "example1"], //Can also define 'image' and give the
             *      "frames": {
             *          "width":  100,
             *          "height": 100,
             *          "regY":   100,
             *          "regX":   50
             *      },
             *      "animations":{
             *          "default-animation":[2],
             *          "walking": {"frames": [0, 1, 2], "speed": 4},
             *          "swing": {"frames": [3, 4, 5], "speed": 4}
             *      }
             *  }
             * @property spriteSheet
             * @type String or Object
             * @default null
             */
            spriteSheet: null,

            /**
             * Optional. An object containg key-value pairs that define a mapping from triggered events or entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the sprite sheet definition using the animation names as the keys.
             *
             *  "animationMap":{
             *      "standing": "default-animation"  // On receiving a "standing" event, or when this.owner.state.standing === true, the "default" animation will begin playing.
             *      "ground,moving": "walking",  // Comma separated values have a special meaning when evaluating "state-changed" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
             *      "ground,striking": "swing!", // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.
             *      "default": "default-animation" // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
             *  }
             *
             *
             * @property animationMap
             * @type Object
             * @default null
             */
            animationMap: null,

            /**
             * Optional. A mask definition that determines where the image should clip. A string can also be used to create more complex shapes via the PIXI graphics API like: "mask": "r(10,20,40,40).dc(30,10,12)". Defaults to no mask or, if simply set to true, a rectangle using the entity's dimensions.
             *
             *  "mask": {
             *      "x": 10,
             *      "y": 10,
             *      "width": 40,
             *      "height": 40
             *  },
             *
             *  -OR-
             *
             *  "mask": "r(10,20,40,40).dc(30,10,12)"
             *
             * @property mask
             * @type Object
             * @default null
             */
            mask: null,

            /**
             * Optional. Defines what types of input the entity will take. Defaults to no input. A hitArea can be defined that determines where on the image should be clickable. A string can also be used to create more complex shapes via the PIXI graphics API like: "hitArea": "r(10,20,40,40).dc(30,10,12)". Defaults to this component's image if not specified or, if simply set to `true`, a rectangle using the entity's dimensions.
             *
             *
             *  "acceptInput": {
             *      "hover": false,
             *      "click": false,
             *      "hitArea": {
             *          "x": 10,
             *          "y": 10,
             *          "width": 40,
             *          "height": 40
             *      }
             *
             *      -OR-
             *
             *      "hitArea": "r(10,20,40,40).dc(30,10,12)"
             *  }
             *
             * @property acceptInput
             * @type Object
             * @default null
             */
            acceptInput: null,

            /**
             * Optional. Defines locations where other sprites on this entity can pin themselves to this sprite. This is useful for puppet-like dynamics. Each pin location has an id, which is used in the 'pinTo' property of another sprite to define where it connects. A pin location is defined as a set of (x,y,z) coordinates or, for moving pins, as a collection of (x,y,z) coordinates cooresponding to frames in the spritesheet. These coordinates are relative to the top-left corner of the sprite.
             *
             *  "pinLocations": [{
             *      "pinId": "head",
             *      "x": 15,
             *      "y": -30,
             *      "z": 1,
             *
             *      -AND/OR one of the following two-
             *
             *      "frames": {"0": {"x": 12, "y": -32}, "3": {"x": 12}}  //The keys specify the the frame to match the pin to. If a frame doesn't have coordinates or a parameter is undefined, the x/y/z values above are used. If they're not specified, the pinned sprite is invisible.
             *
             *      "frames": [{"x": 12, "y": -32}, null, {"x": 12}]  //In this format, we assume the indexes of the array match those of the frames. If a given index is null or a parameter is undefined, the x/y/z values above are used. If they're not specified, the pinned sprite is invisible.
             *
             *  }],
             *
             * @property pinLocations
             * @type Object
             * @default null
             */
            pinLocations: null,

            /**
             * Optional. Pin id of another sprite on this entity to pin this sprite to.
             *
             * @property pinTo
             * @type String
             * @default null
             */
            pinTo: null,

            /**
             * Optional. The offset of the z-index of the sprite from the entity's z-index. Will default to 0.
             *
             * @property scaleY
             * @type Number
             * @default 0
             */
            offsetZ: 0,

            /**
             * Optional. Whether this object can be rotated. It's rotational angle is set by setting the this.owner.rotation value on the entity.
             *
             * @property rotate
             * @type Boolean
             * @default false
             */
            rotate: false,

            /**
             * Whether this object can be mirrored over X. To mirror it over X set the this.owner.rotation value to be > 90  and < 270.
             *
             * @property mirror
             * @type Boolean
             * @default false
             */
            mirror: false,

            /**
             * Optional. Whether this object can be flipped over Y. To flip it over Y set the this.owner.rotation to be > 180.
             *
             * @property flip
             * @type Boolean
             * @default false
             */
            flip: false,

            /**
             * Optional. Whether this object is visible or not. To change the visible value dynamically set this.owner.state.visible to true or false.
             *
             * @property visible
             * @type Boolean
             * @default false
             */
            visible: true,

            /**
             * Optional. Specifies whether this component should listen to events matching the animationMap to animate. Set this to true if the component should animate for on events. Default is false.
             *
             * @property eventBased
             * @type Boolean
             * @default false
             */
            eventBased: false,

            /**
             * Optional. Specifies whether this component should listen to changes in the entity's state that match the animationMap to animate. Set this to true if the component should animate based on this.owner.state. Default is true.
             *
             * @property stateBased
             * @type Boolean
             * @default true
             */
            stateBased: true,

            /**
             * Optional. Whether this sprite should be cached into an entity with a `RenderTiles` component (like "render-layer"). The `RenderTiles` component must have its "entityCache" property set to `true`. Warning! This is a one-direction setting and will remove this component from the entity once the current frame has been cached.
             *
             * @property cache
             * @type Boolean
             * @default false
             */
            cache: false,

            /**
             * Optional. When using stateBased animations, forces animations to complete before starting a new animation. Defaults to false.
             *
             * @property forcePlayThrough
             * @type Boolean
             * @default false
             */
            forcePlayThrough: false,

            /**
             * Optional. Ignores the opacity of the owner. Used when multiple RenderSprite components are on the same entity.
             *
             * @property ignoreOpacity
             * @type Boolean
             * @default false
             */
            ignoreOpacity: false
        },

        publicProperties: {
            /**
             * Determines whether hovering over the sprite should alter the cursor.
             *
             * @property buttonMode
             * @type Boolean
             * @default false
             */
            buttonMode: false,

            /**
             * Optional. The X scaling factor for the image. Defaults to 1.
             *
             * @property scaleX
             * @type Number
             * @default 1
             */
            scaleX: 1,

            /**
             * Optional. The Y scaling factor for the image. Defaults to 1.
             *
             * @property scaleY
             * @type Number
             * @default 1
             */
            scaleY: 1,

            /**
             * Optional. The X swek factor of the sprite. Defaults to 0.
             *
             * @property skewX
             * @type Number
             * @default 0
             */
            skewX: 0,

            /**
             * Optional. The Y skew factor for the image. Defaults to 0.
             *
             * @property skewY
             * @type Number
             * @default 0
             */
            skewY: 0,

            /**
             * Optional. The rotation of the sprite in degrees. All sprites on the same entity are rotated the same amount except when pinned or if they ignore the rotation value by setting 'rotate' to false.
             *
             * @property rotation
             * @type Number
             * @default 1
             */
            rotation: 0,

            /**
             * Optional. The x position of the entity. Defaults to 0.
             *
             * @property x
             * @type Number
             * @default 0
             */
            x: 0,
            
            /**
             * Optional. The y position of the entity. Defaults to 0.
             *
             * @property y
             * @type Number
             * @default 0
             */
            y: 0,
            
            /**
             * Optional. The z position of the entity. Defaults to 0.
             *
             * @property z
             * @type Number
             * @default 0
             */
            z: 0
        },
        
        constructor: (function () {
            var defaultAnimations = {"default": 0},
                createSpriteSheet = function (ssDef, srcImage, entity, component) {
                    var image  = null,
                        ss     = {
                            framerate:     0,
                            images:     null,
                            frames:     null,
                            animations: null
                        },
                        cache  = {
                            definition: ss,
                            spriteSheet: null
                        };

                    //If we've already created an object with this spriteSheet, used the cached version.
                    if (typeof ssDef === 'string' && ssCache[ssDef]) {
                        return ssCache[ssDef];
                    }

                    //If spriteSheet is a string, we look it up the spritesheet data, otherwise we use the object provided.
                    if (ssDef && typeof ssDef === 'string' && platypus.game.settings.spriteSheets[ssDef]) {
                        ssDef = platypus.game.settings.spriteSheets[ssDef];
                    } else if (ssDef && typeof ssDef === 'object') {
                        //We're fine.
                    } else if (srcImage) {
                        ssDef = {"images": [srcImage]};
                    } else {
                        console.warn(entity.type + ' - RenderSprite : Neither spriteSheet nor image defined.');
                    }

                    if (ssDef.framerate) {
                        ss.framerate = ssDef.framerate;
                    }

                    if (ssDef.images && Array.isArray(ssDef.images)) {
                        ss.images = ssDef.images.slice();
                    } else {
                        console.warn(entity.type + ' - RenderSprite : No source image(s) defined.');
                    }

                    if (ssDef && ssDef.frames) {
                        ss.frames = ssDef.frames;
                    } else {
                        // Assume this is a single frame image and define accordingly.
                        image = ss.images[0];
                        if (image) {
                            ss.frames = [[
                                0,
                                0,
                                ss.images[0].width  || entity.width || 1,
                                ss.images[0].height || entity.height || 1,
                                0,
                                component.regX || entity.regX || 0,
                                component.regY || entity.regY || 0
                            ]];
                        }
                    }

                    if (ssDef && ssDef.animations) {
                        ss.animations = ssDef.animations;
                    } else {
                        // Assume this is a single frame image and define accordingly.
                        ss.animations = defaultAnimations;
                    }

                    cache.spriteSheet = cache.definition; //TODO: definition and actual can be stored together now

                    return cache;
                },
                createAnimationMap = function (animationMap, ss) {
                    var map  = null,
                        anim = '';

                    if (animationMap) {
                        return animationMap;
                    } else if (Array.isArray(ss.frames) && (ss.frames.length === 1)) {
                        // This is a single frame animation, so no mapping is necessary
                        return null;
                    } else {
                        // Create 1-to-1 animation map since none was defined
                        map = {};
                        for (anim in ss.animations) {
                            if (ss.animations.hasOwnProperty(anim)) {
                                map[anim] = anim;
                            }
                        }
                        return map;
                    }
                },
                setupEventsAndStates = function (component, map) {
                    var anim      = '',
                        animation = '';

                    component.followThroughs = {};
                    component.checkStates = [];

                    for (anim in map) {
                        if (map.hasOwnProperty(anim)) {
                            animation = map[anim];

                            //TODO: Should probably find a cleaner way to accomplish this. Maybe in the animationMap definition? - DDD
                            if (animation[animation.length - 1] === '!') {
                                animation = animation.substring(0, animation.length - 1);
                                component.followThroughs[animation] = true;
                            } else {
                                component.followThroughs[animation] = false;
                            }

                            if (component.eventBased) {
                                component.addEventListener(anim, changeState(animation));
                            }
                            if (component.stateBased) {
                                component.checkStates.push(createTest(anim, animation));
                            }
                        }
                    }
                };
            
            return function (definition) {
                var self = this,
                    ss       = createSpriteSheet(this.spriteSheet, this.image, this.owner, this),
                    map      = createAnimationMap(this.animationMap, ss.definition);
                
                this.sprite     = null;
                
                this.parentContainer      = null;
                this.stateBased = map && this.stateBased;
                this.eventBased = map && this.eventBased;
                this.hover      = false;
                this.click      = false;
                
                this.camera = {
                    x: 0,
                    y: 0
                };

                if (this.eventBased || this.stateBased) {
                    setupEventsAndStates(this, map);
                    this.currentAnimation = map['default'] || '';
                }
                
                /*
                 * PIXIAnimation created here:
                 */
                this.sprite = new platypus.PIXIAnimation(ss.spriteSheet, this.currentAnimation || 0);
                this.sprite.onComplete = function (animation) {
                    /**
                     * This event fires each time an animation completes.
                     * 
                     * @event 'animation-ended'
                     * @param animation {String} The id of the animation that ended.
                     */
                    self.owner.trigger('animation-ended', animation);
                    if (self.waitingAnimation) {
                        self.currentAnimation = self.waitingAnimation;
                        self.waitingAnimation = false;
                        self.lastState = self.waitingState;
                        
                        self.animationFinished = false;
                        self.sprite.gotoAndPlay(self.currentAnimation);
                    } else {
                        self.animationFinished = true;
                    }
                };

                this.affine = new PIXI.Matrix();
                
                // add pins to sprite and setup this.container if needed.
                if (this.pinLocations) {
                    this.container = new PIXI.Container();
                    this.container.transformMatrix = new PIXI.Matrix();
                    this.container.addChild(this.sprite);
                    this.sprite.z = 0;

                    this.addPins(this.pinLocations, ss.definition.frames);
                    this.sprite.transformMatrix = new PIXI.Matrix();
                } else {
                    this.container = this.sprite;
                    this.sprite.transformMatrix = new PIXI.Matrix();
                }
    
                // pin to another RenderSprite
                if (this.pinTo) {
                    this.owner.triggerEvent('pin-me', this.pinTo);
                }
                
                /* These next few need this.container set up */
                
                //handle hitArea
                if (this.acceptInput) {
                    this.hover = this.acceptInput.hover || false;
                    this.click = this.acceptInput.click || false;
                    
                    if (this.acceptInput.hitArea) {
                        if (typeof this.acceptInput.hitArea === 'string') {
                            this.container.hitArea = this.setHitArea(this.acceptInput.hitArea);
                        } else {
                            this.container.hitArea = this.setHitArea('r(' + (this.owner.x || 0) + ',' + (this.owner.y || 0) + ',' + (this.owner.width || 0) + ',' + (this.owner.height || 0) + ')');
                        }
                    }
                }
                
                this.isOnCamera = true;
                this.state = this.owner.state;
                this.stateChange = false;
                this.lastState = -1;
    
                this.waitingAnimation = false;
                this.waitingState = 0;
                this.playWaiting = false;
                this.animationFinished = false;
    
                //Check state against entity's prior state to update animation if necessary on instantiation.
                this.stateChange = true;
                
                if (this.cache) {
                    this.updateSprite(false);
                    this.owner.cacheRender = this.container;
                }
            };
        }()),
        
        events: {
            /**
             * On receiving a "cache" event, this component triggers "cache-sprite" to cache its rendering into the background. This is an optimization for static images to reduce render calls.
             *
             * @method 'cache'
             */
            "cache": function () {
                this.updateSprite(false);
                this.owner.cacheRender = this.container;
                if (this.owner.parent && this.owner.parent.triggerEventOnChildren) {
                    /**
                     * On receiving a "cache" event, this component triggers "cache-sprite" to cache its rendering into the background. This is an optimization for static images to reduce render calls.
                     *
                     * @event 'cache-sprite'
                     * @param entity {platypus.Entity} This component's owner.
                     */
                    this.owner.parent.triggerEventOnChildren('cache-sprite', this.owner);
                } else {
                    console.warn('Unable to cache sprite for ' + this.owner.type);
                }
            },

            /**
             * Listens for this event to determine whether this sprite is visible.
             *
             * @method 'handle-render-load'
             * @param handlerData {Object} Data from the render handler
             * @param handlerData.container {PIXI.Container} The parent container.
             */
            "camera-update": function (camera) {
                var bounds   = null,
                    viewport = camera.viewport,
                    sprite   = this.sprite,
                    matrix   = null,
                    pinning  = null;
                
                this.camera.x = camera.viewport.left;
                this.camera.y = camera.viewport.top;
                
                // Set visiblity of sprite if within camera bounds
                if (sprite) { //TODO: At some point, may want to do this according to window viewport instead of world viewport so that native PIXI bounds checks across the whole stage can be used. - DDD 9-21-15
                    matrix = sprite.transformMatrix.copy(tempMatrix);
                    pinning = this.pinnedTo;
                    while (pinning) {
                        matrix.prepend(pinning.container.transformMatrix);
                        pinning = pinning.pinnedTo;
                    }

                    sprite._currentBounds = null;
                    bounds = sprite.getBounds(matrix);
                    
                    if (bounds && ((bounds.x + bounds.width < viewport.left) || (bounds.x > viewport.right) || (bounds.y + bounds.height < viewport.top) || (bounds.y > viewport.bottom))) {
                        this.isOnCamera = false;
                    } else {
                        this.isOnCamera = true;
                    }
                }
            },
            
            /**
             * A setup message used to add the sprite to the stage. On receiving this message, the component sets its parent container to the stage contained in the message if it doesn't already have one.
             *
             * @method 'handle-render-load'
             * @param handlerData {Object} Data from the render handler
             * @param handlerData.container {PIXI.Container} The parent container.
             */
            "handle-render-load": function (handlerData) {
                if (!this.parentContainer && handlerData && handlerData.container) {
                    this.addStage(handlerData.container);
                    this.updateSprite(true); // Initial set up in case position, etc is needed prior to the first "render" event.
                }
            },
            
            /**
             * The render update message. This updates the sprite. If a sprite doesn't have a container, it's removed.
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {PIXI.Container} The parent container.
             */
            "handle-render": function (renderData) {
                if (!this.container) { // If this component's removal is pending
                    return;
                }

                if (!this.parentContainer) {
                    if (!this.pinTo) { //In case this component was added after handler-render is initiated
                        if (!this.addStage(renderData.container)) {
                            console.warn('No PIXI Stage, removing render component from "' + this.owner.type + '".');
                            this.owner.removeComponent(this);
                            return;
                        }
                    } else {
                        return;
                    }
                }
                
                this.updateSprite(true);
            },
            
            /**
             * This event is fired when the entity state changes. This is used to update the currently playing animation when it is state based.
             *
             * @method 'state-changed'
             */
            "state-changed": function () {
                this.stateChange = true;
            },
            
            /**
             * This event makes the sprite invisible. When multiple sprites are pinned together, the entire group is invisible.
             *
             * @method 'hide-sprite'
             */
            "hide-sprite": function () {
                this.visible = false;
            },

            /**
             * This event makes the sprite visible. When multiple sprites are pinned together, the entire group is made visible.
             *
             * @method 'show-sprite'
             */
            "show-sprite": function () {
                this.visible = true;
            },
            
            /**
             * If this component has a matching pin location, it will trigger "attach-pin" on the entity with the matching pin location.
             *
             * @method 'pin-me'
             * @param pinId {String} The id of the pin location we're trying to attach to.
             */
            "pin-me": function (pinId) {
                if (this.pins && this.pins[pinId]) {
                    /**
                     * Called by "pin-me", this event is responding to the inquiring component with the information about the pin it should attach to.
                     *
                     * @event 'attach-pin'
                     * @param pinInfo {Object} Information about the pin.
                     */
                    this.owner.trigger("attach-pin", this.pins[pinId]);
                }
            },
            
            /**
             * On receiving this message, the component checks whether it wants to be pinned, and if so, adds itself to the provided container.
             *
             * @method 'attach-pin'
             * @param pinInfo {Object} Information about the pin.
             * @param pinInfo.pinId {String} The pin id.
             * @param pinInfo.container {PIXI.Container} The container to add this sprite to.
             */
            "attach-pin": function (pinInfo) {
                if (pinInfo.pinId === this.pinTo) {
                    this.parentContainer = pinInfo.container;
                    this.parentContainer.addChild(this.container);
                    this.addInputs();
                    this.pinnedTo = pinInfo;
                    this.updateSprite(true); // Initial set up in case position, etc is needed prior to the first "render" event.
                }
            },
            
            /**
             * On receiving this message, the component checks whether it is pinned to the specified pin. If so, it removes itself from the container.
             *
             * @method 'remove-pin'
             * @param pinInfo {Object} Information about the pin.
             * @param pinInfo.pinId {String} The pin id.
             * @param pinInfo.container {PIXI.Container} The container to add this sprite to.
             */
            "remove-pin": function (pinInfo) {
                if (pinInfo.pinId === this.pinTo) {
                    this.parentContainer.removeChild(this.container);
                    this.parentContainer = null;
                    this.pinnedTo = null;
                }
            },
            
            /**
             * This event dispatches a PIXI.Event on this component's PIXI.Sprite. Useful for rerouting mouse/keyboard events.
             *
             * @method 'dispatch-event'
             * @param event {Object | PIXI.Event} The event to dispatch.
             */
            "dispatch-event": function (event) {
                this.sprite.dispatchEvent(this.sprite, event.event, event.data);
            },
            
            /**
             * Adds input event listeners to the sprite, enabling input.
             *
             * @method 'input-on'
             */
            "input-on": function () {
                if (!this.removeInputListeners) {
                    this.addInputs();
                }
            },
            
            /**
             * Removes the input event listeners on the sprite, disabling input.
             *
             * @method 'input-off'
             */
            "input-off": function () {
                if (this.removeInputListeners) {
                    this.removeInputListeners();
                }
            },
            
            /**
             * Defines the mask on the container/sprite. If no mask is specified, the mask is set to null.
             *
             * @method 'set-mask'
             * @param mask {Object} The mask. This can specified the same way as the 'mask' parameter on the component.
             */
            "set-mask": function (mask) {
                this.setMask(mask);
            }
        },
        
        methods: {
            addStage: function (stage) {
                if (stage && !this.pinTo) {
                    this.parentContainer = stage;
                    this.parentContainer.addChild(this.container);

                    //Handle mask
                    if (this.mask) {
                        this.setMask(this.mask);
                    }

                    this.addInputs();
                    return stage;
                } else {
                    return null;
                }
            },
            
            updateSprite: (function () {
                var sort = function (a, b) {
                    return a.z - b.z;
                };
                
                return function (playing) {
                    var i = 0,
                        x = 0,
                        y = 0,
                        o = null,
                        rotation = 0,
                        testCase = false,
                        mirrored = 1,
                        flipped  = 1,
                        angle    = null,
                        m        = this.affine.copy(this.container.transformMatrix),
                        temp     = PIXI.Matrix.TEMP_MATRIX;
                    
                    if (this.buttonMode !== this.container.buttonMode) {
                        this.container.buttonMode = this.buttonMode;
                    }
                    
                    if (this.pinnedTo) {
                        if (this.pinnedTo.frames && this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame]) {
                            x = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].x;
                            y = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].y;
                            if (this.container.z !== this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].z) {
                                if (this.parentContainer) {
                                    this.parentContainer.reorder = true;
                                }
                                this.container.z = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].z;
                            }
                            rotation = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].angle || 0;
                            this.visible = true;
                        } else if (this.pinnedTo.defaultPin) {
                            x = this.pinnedTo.defaultPin.x;
                            y = this.pinnedTo.defaultPin.y;
                            if (this.container.z !== this.pinnedTo.defaultPin.z) {
                                if (this.parentContainer) {
                                    this.parentContainer.reorder = true;
                                }
                                this.container.z = this.pinnedTo.defaultPin.z;
                            }
                            rotation = this.pinnedTo.defaultPin.angle || 0;
                            this.visible = true;
                        } else {
                            this.visible = false;
                        }
                    } else {
                        x = this.owner.x;
                        y = this.owner.y;
                        if (this.rotate) {
                            rotation = this.rotation;
                        }
                        if (this.container.z !== (this.owner.z + this.offsetZ)) {
                            if (this.parentContainer) {
                                this.parentContainer.reorder = true;
                            }
                            this.container.z = (this.owner.z + this.offsetZ);
                        }
    
                        if (!this.ignoreOpacity && (this.owner.opacity || (this.owner.opacity === 0))) {
                            this.container.alpha = this.owner.opacity;
                        }
                    }
                    
                    if (this.container.reorder) {
                        this.container.reorder = false;
                        this.container.children.sort(sort);
                    }
                    
                    if (this.mirror || this.flip) {
                        angle = this.rotation % 360;
                        
                        if (this.mirror && (angle > 90) && (angle < 270)) {
                            mirrored = -1;
                        }
                        
                        if (this.flip && (angle < 180)) {
                            flipped = -1;
                        }
                    }
                    
                    if (this.stateBased && this.stateChange) {
                        if (this.state.visible !== undefined) {
                            this.visible = this.state.visible;
                        }
                        if (this.checkStates) {
                            for (i = 0; i < this.checkStates.length; i++) {
                                testCase = this.checkStates[i](this.state);
                                if (testCase) {
                                    if (this.currentAnimation !== testCase) {
                                        if (!this.followThroughs[this.currentAnimation] && (!this.forcePlaythrough || (this.animationFinished || (this.lastState >= +i)))) {
                                            this.currentAnimation = testCase;
                                            this.lastState = +i;
                                            this.animationFinished = false;
                                            if (playing) {
                                                this.sprite.gotoAndPlay(testCase);
                                            } else {
                                                this.sprite.gotoAndStop(testCase);
                                            }
                                        } else {
                                            this.waitingAnimation = testCase;
                                            this.waitingState = +i;
                                        }
                                    } else if (this.waitingAnimation && !this.followThroughs[this.currentAnimation]) {// keep animating this animation since this animation has already overlapped the waiting animation.
                                        this.waitingAnimation = false;
                                    }
                                    break;
                                }
                            }
                        }
                        this.stateChange = false;
                    }
                    
                    this.container.visible = this.visible && this.isOnCamera;

                    // Handle rotation
                    if (rotation) {
                        m.rotate((rotation / 180) * Math.PI);
                    }

                    if (this.pinnedTo) {
                        temp.tx = x;
                        temp.ty = y;
                        temp.a = mirrored;
                        temp.b = 0;
                        temp.c = 0;
                        temp.d = flipped;
                        m.prepend(temp);
                    } else {
                        if (this.owner.orientationMatrix) { // This is a 3x3 2D matrix describing an affine transformation.
                            o = this.owner.orientationMatrix;
                            temp.tx = o[0][2];
                            temp.ty = o[1][2];
                            temp.a = o[0][0];
                            temp.b = o[1][0];
                            temp.c = o[0][1];
                            temp.d = o[1][1];
                            m.prepend(temp);
                        }
                        
                        temp.tx = x;
                        temp.ty = y;
                        temp.a = this.scaleX * mirrored;
                        temp.b = this.owner.skewX;
                        temp.c = this.owner.skewY;
                        temp.d = this.scaleY * flipped;
                        m.prepend(temp);
                    }
                };
            }()),
            
            triggerInput: function (event, eventName) {
                //TML - This is in case we do a scene change using an event and the container is destroyed.
                if (!this.container) {
                    return;
                }

                this.owner.trigger(eventName, {
                    event: event.data.originalEvent,
                    pixiEvent: event,
                    x: event.data.global.x / this.parentContainer.transformMatrix.a + this.camera.x,
                    y: event.data.global.y / this.parentContainer.transformMatrix.d + this.camera.y,
                    entity: this.owner
                });
            },
            
            addInputs: function () {
                var pressed   = false,
                    sprite    = this.container,
                    mousedown = null,
                    mouseover = null,
                    mouseout  = null,
                    pressmove = null,
                    pressup   = null,
                    click     = null;
                
                // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                if (this.click) {
                    sprite.interactive = true;
                    
                    mousedown = function (event) {
                        this.triggerInput(event, 'mousedown');
                        event.target.mouseTarget = true;
                        pressed = true;
                    }.bind(this);
                    
                    pressmove = function (event) {
                        if (pressed) {
                            this.triggerInput(event, 'pressmove');
                            event.target.mouseTarget = true;
                        } else {
                            this.triggerInput(event, 'mousemove');
                        }
                    }.bind(this);
                    
                    pressup   = function (event) {
                        this.triggerInput(event, 'pressup');
                        event.target.mouseTarget = false;
                        pressed = false;
                        
                        if (event.target.removeDisplayObject) {
                            event.target.removeDisplayObject();
                        }
                    }.bind(this);
                    
                    click     = function (event) {
                        this.triggerInput(event, 'click');
                    }.bind(this);
                    
                    sprite.addListener('mousedown',       mousedown);
                    sprite.addListener('touchstart',      mousedown);
                    sprite.addListener('mouseup',         pressup);
                    sprite.addListener('touchend',        pressup);
                    sprite.addListener('mouseupoutside',  pressup);
                    sprite.addListener('touchendoutside', pressup);
                    sprite.addListener('mousemove',       pressmove);
                    sprite.addListener('touchmove',       pressmove);
                    sprite.addListener('click',           click);
                    sprite.addListener('tap',             click);
                }
                if (this.hover) {
                    sprite.interactive = true;

                    mouseover = function (event) {
                        this.triggerInput(event, 'mouseover');
                    }.bind(this);
                    mouseout  = function (event) {
                        this.triggerInput(event, 'mouseout');
                    }.bind(this);

                    sprite.addListener('mouseover', mouseover);
                    sprite.addListener('mouseout',  mouseout);
                }

                this.removeInputListeners = function () {
                    if (this.click) {
                        sprite.removeListener('mousedown',       mousedown);
                        sprite.removeListener('touchstart',      mousedown);
                        sprite.removeListener('mouseup',         pressup);
                        sprite.removeListener('touchend',        pressup);
                        sprite.removeListener('mouseupoutside',  pressup);
                        sprite.removeListener('touchendoutside', pressup);
                        sprite.removeListener('mousemove',       pressmove);
                        sprite.removeListener('touchmove',       pressmove);
                        sprite.removeListener('click',           click);
                        sprite.removeListener('tap',             click);
                    }
                    if (this.hover) {
                        sprite.removeListener('mouseover', mouseover);
                        sprite.removeListener('mouseout',  mouseout);
                    }
                    sprite.interactive = false;
                    this.removeInputListeners = null;
                };
            },
            
            addPins: function (pins, frames) {
                var i = 0,
                    j = 0,
                    pin   = null,
                    regX  = frames.regX || 0,
                    regY  = frames.regY || 0,
                    isArray = Array.isArray(frames);
                
                this.pinsToRemove = this.pinsToRemove || [];
                
                this.pins = {};
                
                for (i = 0; i < pins.length; i++) {
                    this.pinsToRemove.push(pins[i].pinId);

                    if (isArray) {
                        regX = frames[0][5] || 0;
                        regY = frames[0][6] || 0;
                    }
                    
                    this.pins[pins[i].pinId] = pin = {
                        pinId: pins[i].pinId,
                        sprite: this.sprite,
                        container: this.container
                    };

                    if ((typeof pins[i].x === 'number') && (typeof pins[i].y === 'number')) {
                        pin.defaultPin = {
                            x: (pins[i].x - regX),
                            y: (pins[i].y - regY),
                            z: pins[i].z || 0.00000001, //force z to prevent flickering z-order issues.
                            angle: (pins[i].angle || 0)
                        };
                    }
                    
                    if (pins[i].frames) {
                        pin.frames = [];
                        for (j = 0; j < pins[i].frames.length; j++) {
                            if (pins[i].frames[j]) {
                                if (isArray) {
                                    regX = frames[j][5] || 0;
                                    regY = frames[j][6] || 0;
                                }
                                if ((typeof pins[i].frames[j].x === 'number') && (typeof pins[i].frames[j].y === 'number')) {
                                    pin.frames.push({
                                        x: (pins[i].frames[j].x - regX),
                                        y: (pins[i].frames[j].y - regY),
                                        z: pins[i].frames[j].z || (pin.defaultPin ? pin.defaultPin.z : 0.00000001),
                                        angle: pins[i].frames[j].angle || (pin.defaultPin ? pin.defaultPin.angle : 0)
                                    });
                                } else if (pin.defaultPin) {
                                    if (typeof pins[i].frames[j].x === 'number') {
                                        pin.frames.push({
                                            x: (pins[i].frames[j].x - regX),
                                            y: pin.defaultPin.y,
                                            z: pins[i].frames[j].z || pin.defaultPin.z,
                                            angle: pins[i].frames[j].angle || pin.defaultPin.angle
                                        });
                                    } else if (typeof pins[i].frames[j].y === 'number') {
                                        pin.frames.push({
                                            x: pin.defaultPin.x,
                                            y: (pins[i].frames[j].y - regY),
                                            z: pins[i].frames[j].z || pin.defaultPin.z,
                                            angle: pins[i].frames[j].angle || pin.defaultPin.angle
                                        });
                                    } else {
                                        pin.frames.push(null);
                                    }
                                } else {
                                    pin.frames.push(null);
                                }
                            } else {
                                pin.frames.push(null);
                            }
                        }
                    }
                    /**
                     * This event is triggered for each pin created. It is intended for other RenderSprite components looking to pin to this pin.
                     *
                     * @event 'attach-pin'
                     * @param pin {Object} The created pin.
                     */
                    this.owner.trigger('attach-pin', pin);
                }
            },

            removePins: function () {
                var i = 0;
                
                if (this.pins && this.pinsToRemove) {
                    for (i = 0; i < this.pinsToRemove.length; i++) {
                        this.owner.trigger('remove-pin', this.pins[this.pinsToRemove[i]].pinId);
                        delete this.pins[this.pinsToRemove[i]];
                    }
                    this.pinsToRemove.length = 0;
                }
            },
            
            setMask: function (shape) {
                var gfx = null;
                
                if (this.mask && this.parentContainer) {
                    this.parentContainer.removeChild(this.mask);
                }
                
                if (!shape) {
                    this.mask = this.container.mask = null;
                    return;
                }
                
                if (shape instanceof PIXI.Graphics) {
                    gfx = shape;
                } else {
                    gfx = new PIXI.Graphics();
                    gfx.beginFill(0x000000, 1);
                    if (typeof shape === 'string') {
                        processGraphics(gfx, shape);
                    } else if (shape.radius) {
                        gfx.dc(shape.x || 0, shape.y || 0, shape.radius);
                    } else if (shape.width && shape.height) {
                        gfx.r(shape.x || 0, shape.y || 0, shape.width, shape.height);
                    }
                    gfx.endFill();
                }
                
                gfx.isMask = true;

                this.mask = this.container.mask = gfx;

                if (this.parentContainer) {
                    this.parentContainer.addChild(this.mask);
                }
            },
            
            setHitArea: (function () {
                var savedHitAreas = {}; //So generated hitAreas are reused across identical entities.
                
                return function (shape) {
                    var ha  = null,
                        sav = '';
                    
                    if (typeof shape === 'string') {
                        sav = shape;
                    } else {
                        sav = JSON.stringify(shape);
                    }
                    
                    ha = savedHitAreas[sav];

                    if (!ha) {
                        ha   = new PIXI.Graphics();
                        ha.x = 0;
                        ha.y = 0;

                        ha.beginFill(0x000000); // Force the fill.

                        if (typeof shape === 'string') {
                            processGraphics(ha, shape);
                        } else if (shape.radius) {
                            ha.dc(shape.x || 0, shape.y || 0, shape.radius);
                        } else {
                            ha.r(shape.x || 0, shape.y || 0, shape.width || this.owner.width || 0, shape.height || this.owner.height || 0);
                        }
                        
                        savedHitAreas[sav] = ha;
                    }
                    
                    return ha;
                };
            }()),
            
            destroy: function () {
                var self = this;

                if (this.removeInputListeners) {
                    this.removeInputListeners();
                }
                if (this.parentContainer) {
                    if (this.container.mouseTarget) {
                        this.container.visible = false;
                        this.container.removeDisplayObject = function () {
                            self.parentContainer.removeChild(self.container);
                            self.parentContainer = null;
                            self.container = null;
                        };
                    } else {
                        this.parentContainer.removeChild(this.container);
                        this.parentContainer = null;
                        this.container = null;
                    }
                }
                this.removePins();
                this.followThroughs = null;
                this.sprite = null;
            }
        }
    });
}());

//##############################################################################
// RenderTiles.js
//##############################################################################

/**
 * This component handles rendering tile map backgrounds.
 * 
 * When rendering the background, this component figures out what tiles are being displayed and caches them so they are rendered as one image rather than individually.
 * 
 * As the camera moves, the cache is updated by blitting the relevant part of the old cached image into a new cache and then rendering tiles that have shifted into the camera's view into the cache.
 * 
 * @namespace platypus.components
 * @class RenderTiles
 * @uses Component
 */
/*global PIXI, platypus, springroll */
/*jslint nomen:true, bitwise:true, plusplus:true */
(function () {
    "use strict";

    var tempCache = new platypus.AABB(),
        sort = function (a, b) {
            return a.z - b.z;
        },
        getPowerOfTwo = function (amount) {
            var x = 1;
            
            while (x < amount) {
                x *= 2;
            }
            
            return x;
        },
        transformCheck = function (value, m) {
            var v = +(value.substring(4)),
                a = !!(0x20000000 & v),
                b = !!(0x40000000 & v),
                c = !!(0x80000000 & v);

            if (a || b || c) {
                if (a && b && c) {
                    m.a = 0;
                    m.b = -1;
                    m.c = -1;
                    m.d = 0;
                } else if (a && c) {
                    m.a = 0;
                    m.b = 1;
                    m.c = -1;
                    m.d = 0;
                } else if (b && c) { // 180 deg
                    m.a = -1;
                    m.b = 0;
                    m.c = 0;
                    m.d = -1;
                } else if (a && b) {
                    m.a = 0;
                    m.b = -1;
                    m.c = 1;
                    m.d = 0;
                } else if (a) {
                    m.a = 0;
                    m.b = 1;
                    m.c = 1;
                    m.d = 0;
                } else if (b) { // vertical flip
                    m.a = 1;
                    m.b = 0;
                    m.c = 0;
                    m.d = -1;
                } else if (c) { // horizontal flip
                    m.a = -1;
                    m.b = 0;
                    m.c = 0;
                    m.d = 1;
                }
            } else {
                m.a = 1;
                m.b = 0;
                m.c = 0;
                m.d = 1;
            }
            return 0x0fffffff & v;
        },
        Template = function (tile) {
            this.instances = [tile];
            this.index = 0;
            tile.template = this; // backwards reference for clearing index later.
        },
        nullTemplate = {
            getNext: function () {
                return null;
            }
        },
        prototype = Template.prototype;
        
    prototype.getNext = function () {
        var instance = this.instances[this.index],
            template = null;
        
        if (!instance) {
            template = this.instances[0];
            instance = this.instances[this.index] = new PIXI.Sprite(template.texture);
            instance.transformMatrix = template.transformMatrix.clone();
            instance.anchor = template.anchor;
        }
        
        this.index += 1;
        
        return instance;
    };
    
    prototype.clear = function () {
        this.index = 0;
    };

    return platypus.createComponentClass({
        
        id: 'RenderTiles',
        
        properties: {
            /**
             * The amount of space in pixels around the edge of the camera that we include in the buffered image. If not set, largest buffer allowed by maximumBuffer is used.
             * 
             * @property buffer
             * @type number
             * @default 0
             */
            buffer: 0,

            /**
             * Determines whether to cache the entire map across one or more texture caches. By default this is `false`; however, if the entire map fits on one or two texture caches, this is set to `true` since it is more efficient than dynamic buffering.
             * 
             * @property cacheAll
             * @type Boolean
             * @default false
             */
            cacheAll: false,

            /**
             * Whether to cache entities on this layer if the entity's render component requests caching.
             * 
             * @property entityCache
             * @type boolean
             * @default false
             */
            entityCache: false,
    
            /**
             * This is a two dimensional array of the spritesheet indexes that describe the map that you're rendering.
             * 
             * @property imageMap
             * @type Array
             * @default []
             */
            imageMap: [],
            
            /**
             * The amount of space that is buffered. Defaults to 2048 x 2048 or a smaller area that encloses the tile layer.
             * 
             * @property maximumBuffer
             * @type number
             * @default 2048
             */
            maximumBuffer: 2048,
    
            /**
             * The x-scale the tilemap is being displayed at.
             * 
             * @property scaleX
             * @type number
             * @default 1
             */
            scaleX: 1,
            
            /**
             * The y-scale the tilemap is being displayed at.
             * 
             * @property scaleY
             * @type number
             * @default 1
             */
            scaleY: 1,
            
            /**
             * EaselJS SpriteSheet describing all the tile images.
             * 
             * @property spriteSheet
             * @type SpriteSheet
             * @default null
             */
            spriteSheet: null,
            
            /**
             * This is the height in pixels of individual tiles.
             * 
             * @property tileHeight
             * @type number
             * @default 10
             */
            tileHeight: 10,
             
            /**
             * This is the width in pixels of individual tiles.
             * 
             * @property tileWidth
             * @type number
             * @default 10
             */
            tileWidth: 10
        },

        constructor: function (definition) {
            this.controllerEvents = undefined;
            this.doMap            = null; //list of display objects that should overlay tile map.
            this.tiles            = {};
            
            this.renderer         = springroll.Application.instance.display.renderer;
            this.tilesSprite      = null;
            this.cacheTexture     = null;
            this.cacheCamera      = null;
            this.laxCam = new platypus.AABB();
            
            // temp values
            this.worldWidth    = this.layerWidth    = this.tileWidth;
            this.worldHeight   = this.layerHeight   = this.tileHeight;
            
            this.cache = new platypus.AABB();
            this.cachePixels = new platypus.AABB();
            
            this.reorderedStage = false;
            this.updateCache = false;
        },

        events: {
            /**
             * This event is triggered before `handle-render` and provides the container that this component will require to display. In this case it compiles the array of tiles that make up the map and adds the tilesSprite displayObject to the stage.
             * 
             * @method 'handle-render-load'
             * @param data.container {PIXI.Container} Container to contain this tile-rendering.
             */
            "handle-render-load": function (resp) {
                var z = this.owner.z,
                    renderer = this.renderer,
                    parentContainer = null,
                    imgMap = this.imageMap,
                    maxBuffer = this.maximumBuffer;

                if (resp && resp.container) {
                    parentContainer = this.parentContainer = resp.container;
                    
                    if (parentContainer && !this.reorderedStage) {
                        parentContainer.reorder = true;
                        this.reorderedStage = true;
                    }
                    
                    this.imageMap = [];
                    this.addImageMap(imgMap);
                    
                    this.tilesWidth  = this.imageMap[0].length;
                    this.tilesHeight = this.imageMap[0][0].length;
                    this.layerWidth  = this.tilesWidth  * this.tileWidth;
                    this.layerHeight = this.tilesHeight * this.tileHeight;
                    
                    // Set up buffer cache size
                    this.cacheWidth = Math.min(getPowerOfTwo(this.layerWidth), maxBuffer);
                    this.cacheHeight = Math.min(getPowerOfTwo(this.layerHeight), maxBuffer);

                    this.cacheCamera = new PIXI.Container();
                    this.cacheCameraWrapper = new PIXI.Container();
                    this.cacheCameraWrapper.addChild(this.cacheCamera);

                    this.updateBufferRegion();

                    if ((this.layerWidth <= this.cacheWidth) && (this.layerHeight <= this.cacheHeight)) { // We never need to recache.
                        this.cacheAll   = true;
                        
                        this.cacheTexture = new PIXI.RenderTexture(renderer, this.cacheWidth, this.cacheHeight);
    
                        //TODO: Temp fix for broken SpringRoll PIXI implementation.
                        this.cacheTexture.baseTexture.realWidth = this.cacheWidth;
                        this.cacheTexture.baseTexture.realHeight = this.cacheHeight;
                        this.cacheTexture._updateUvs();
                        
                        this.tilesSprite = new PIXI.Sprite(this.cacheTexture);
                        this.tilesSprite.scaleX = this.scaleX;
                        this.tilesSprite.scaleY = this.scaleY;
                        this.tilesSprite.z = z;

                        this.cache.setBounds(0, 0, this.tilesWidth - 1, this.tilesHeight - 1);
                        this.update(this.cacheTexture, this.cache);
                        parentContainer.addChild(this.tilesSprite);
                    } else if (this.cacheAll || ((this.layerWidth <= this.cacheWidth * 2) && (this.layerHeight <= this.cacheHeight)) || ((this.layerWidth <= this.cacheWidth) && (this.layerHeight <= this.cacheHeight * 2))) { // We cache everything across several textures creating a cache grid.
                        this.cacheAll = true;
                        
                        this.cacheGrid = [];
                        
                        // Creating this here but instantiating the grid later so that the previous scene has a chance to release gpu textures and reduce memory overhead. - DDD 9-18-15
                        this.createGrid = function () {
                            var w = 0,
                                h = 0,
                                x = 0,
                                y = 0,
                                z = this.owner.z,
                                col = null,
                                ct = null;
                            
                            for (x = 0; x < this.tilesWidth; x += this.cacheTilesWidth) {
                                col = [];
                                this.cacheGrid.push(col);
                                for (y = 0; y < this.tilesHeight; y += this.cacheTilesHeight) {
                                    // This prevents us from using too large of a cache for the right and bottom edges of the map.
                                    w = Math.min(getPowerOfTwo((this.tilesWidth  - x) * this.tileWidth),  this.cacheWidth);
                                    h = Math.min(getPowerOfTwo((this.tilesHeight - y) * this.tileHeight), this.cacheHeight);                                
                                    
                                    ct = new PIXI.RenderTexture(renderer, w, h);
                                    ct.baseTexture.realWidth  = w;
                                    ct.baseTexture.realHeight = h;
                                    ct._updateUvs();
                                    
                                    ct = new PIXI.Sprite(ct);
                                    ct.x = x * this.tileWidth;
                                    ct.y = y * this.tileHeight;
                                    ct.z = z;
                                    ct.scaleX = this.scaleX;
                                    ct.scaleY = this.scaleY;
                                    col.push(ct);
                                    parentContainer.addChild(ct);
                                    
                                    z -= 0.000001; // so that tiles of large caches overlap consistently.
                                }
                            }
                        }.bind(this);
                        
                        this.updateCache = true;
                    } else {
                        this.cacheAll = false;
                        
                        this.cacheTexture = new PIXI.RenderTexture(renderer, this.cacheWidth, this.cacheHeight);
    
                        //TODO: Temp fix for broken SpringRoll PIXI implementation.
                        this.cacheTexture.baseTexture.realWidth = this.cacheWidth;
                        this.cacheTexture.baseTexture.realHeight = this.cacheHeight;
                        this.cacheTexture._updateUvs();
                        
                        this.tilesSprite = new PIXI.Sprite(this.cacheTexture);
                        this.tilesSprite.scaleX = this.scaleX;
                        this.tilesSprite.scaleY = this.scaleY;
                        this.tilesSprite.z = z;

                        // Set up copy buffer and circular pointers
                        this.cacheTexture.alternate = new PIXI.RenderTexture(renderer, this.cacheWidth, this.cacheHeight);
                        this.tilesSpriteCache = new PIXI.Sprite(this.cacheTexture.alternate);
                        
                        //TODO: Temp fix for broken SpringRoll PIXI implementation.
                        this.cacheTexture.alternate.baseTexture.realWidth = this.cacheWidth;
                        this.cacheTexture.alternate.baseTexture.realHeight = this.cacheHeight;
                        this.cacheTexture.alternate._updateUvs();

                        this.cacheTexture.alternate.alternate = this.cacheTexture;
                        parentContainer.addChild(this.tilesSprite);
                    }
                }
            },
            
            /**
             * If this component should cache entities, it checks peers for a "renderCache" display object and adds the display object to its list of objects to render on top of the tile set.
             * 
             * @method 'cache-sprite'
             * @param entity {Entity} This is the peer entity to be checked for a renderCache.
             */
            "cache-sprite": function (entity) {
                this.cacheSprite(entity);
            },

            /**
             * If this component should cache entities, it checks peers for a "renderCache" display object and adds the display object to its list of objects to render on top of the tile set.
             *
             * @method 'peer-entity-added'
             * @param entity {Entity} This is the peer entity to be checked for a renderCache.
             */
            "peer-entity-added": function (entity) {
                this.cacheSprite(entity);
            },
            
            /**
             * This event adds a layer of tiles to render on top of the existing layer of rendered tiles.
             * 
             * @method 'add-tiles'
             * @param message.imageMap {Array} This is a 2D mapping of tile indexes to be rendered.
             */
            "add-tiles": function (definition) {
                var map = definition.imageMap;
                
                if (map) {
                    this.addImageMap(map);
                }
            },

            /**
             * Provides the width and height of the world.
             * 
             * @method 'camera-loaded'
             * @param camera {Object}
             * @param camera.worldWidth {number} The width of the world.
             * @param camera.worldHeight {number} The height of the world.
             * @param camera.viewport {platypus.AABB} The AABB describing the camera viewport in world units.
             */
            "camera-loaded": function (camera) {
                this.worldWidth  = camera.worldWidth;
                this.worldHeight = camera.worldHeight;
                
                if (this.buffer && !this.cacheAll) { // do this here to set the correct mask before the first caching.
                    this.updateBufferRegion(camera.viewport);
                }
            },

            /**
             * Triggered when the camera moves, this function updates which tiles need to be rendered and caches the image.
             * 
             * @method 'camera-update'
             * @param camera {Object} Provides information about the camera.
             * @param camera.viewport {platypus.AABB} The AABB describing the camera viewport in world units.
             */
            "camera-update": function (camera) {
                var x = 0,
                    y = 0,
                    inFrame = false,
                    sprite  = null,
                    ctw     = 0,
                    cth     = 0,
                    ctw2    = 0,
                    cth2    = 0,
                    cache   = this.cache,
                    cacheP  = this.cachePixels,
                    vp      = camera.viewport,
                    resized = (this.buffer && ((vp.width !== this.laxCam.width) || (vp.height !== this.laxCam.height))),
                    tempC   = tempCache,
                    laxCam  = this.convertCamera(vp);
                
                if (!this.cacheAll && (cacheP.empty || !cacheP.contains(laxCam)) && (this.imageMap.length > 0)) {
                    if (resized) {
                        this.updateBufferRegion(laxCam);
                    }
                    ctw     = this.cacheTilesWidth - 1;
                    cth     = this.cacheTilesHeight - 1;
                    ctw2    = ctw / 2;
                    cth2    = cth / 2;
                    
                    //only attempt to draw children that are relevant
                    tempC.setAll(Math.round(laxCam.x / this.tileWidth - ctw2) + ctw2, Math.round(laxCam.y / this.tileHeight - cth2) + cth2, ctw, cth);
                    if (tempC.left < 0) {
                        tempC.moveX(tempC.halfWidth);
                    } else if (tempC.right > this.tilesWidth - 1) {
                        tempC.moveX(this.tilesWidth - 1 - tempC.halfWidth);
                    }
                    if (tempC.top < 0) {
                        tempC.moveY(tempC.halfHeight);
                    } else if (tempC.bottom > this.tilesHeight - 1) {
                        tempC.moveY(this.tilesHeight - 1 - tempC.halfHeight);
                    }
        
                    if (cache.empty || !tempC.contains(cache)) {
                        this.tilesSpriteCache.texture = this.cacheTexture;
                        this.cacheTexture = this.cacheTexture.alternate;
                        this.tilesSprite.texture = this.cacheTexture;
                        this.update(this.cacheTexture, tempC, this.tilesSpriteCache, cache);
                    }
                    
                    // Store pixel bounding box for checking later.
                    cacheP.set(cache).setAll((cacheP.x + 0.5) * this.tileWidth, (cacheP.y + 0.5) * this.tileHeight, (cacheP.width + 1) * this.tileWidth, (cacheP.height + 1) * this.tileHeight);
                }

                if (this.cacheGrid) {
                    for (x = 0; x < this.cacheGrid.length; x++) {
                        for (y = 0; y < this.cacheGrid[x].length; y++) {
                            sprite = this.cacheGrid[x][y];
                            cacheP.setAll((x + 0.5) * this.cacheClipWidth, (y + 0.5) * this.cacheClipHeight, this.cacheClipWidth, this.cacheClipHeight);
                            
                            inFrame = cacheP.intersects(laxCam)
                            if (sprite.visible && !inFrame) {
                                sprite.visible = false;
                            } else if (!sprite.visible && inFrame) {
                                sprite.visible = true;
                            }
                        }
                    }
                } else {
                    this.tilesSprite.x = camera.viewport.left - laxCam.left + cache.left * this.tileWidth;
                    this.tilesSprite.y = camera.viewport.top  - laxCam.top  + cache.top  * this.tileHeight;
                }
            },

            /**
             * On receiving this message, determines whether to update which tiles need to be rendered and caches the image.
             * 
             * @method 'handle-render'
             */
            "handle-render": function (camera) {
                if (this.updateCache) {
                    this.updateCache = false;
                    if (this.cacheGrid) {
                        this.updateGrid();
                    } else {
                        this.update(this.cacheTexture, this.cache);
                    }
                }
            }
        },
    
        methods: {
            cacheSprite: function (entity) {
                var x = 0,
                    y = 0,
                    object = entity.cacheRender,
                    bounds = null,
                    top = 0,
                    bottom = 0,
                    right = 0,
                    left = 0;

                // Determine whether to merge this image with the background.
                if (this.entityCache && object) { //TODO: currently only handles a single display object on the cached entity.
                    if (!this.doMap) {
                        this.doMap = [];
                    }

                    // Determine range:
                    bounds = object.getBounds(object.transformMatrix);
                    top    = Math.max(0, Math.floor(bounds.y / this.tileHeight));
                    bottom = Math.min(this.tilesHeight, Math.ceil((bounds.y + bounds.height) / this.tileHeight));
                    left   = Math.max(0, Math.floor(bounds.x / this.tileWidth));
                    right  = Math.min(this.tilesWidth, Math.ceil((bounds.x + bounds.width) / this.tileWidth));

                    // Find tiles that should include this display object
                    for (x = left; x < right; x++) {
                        if (!this.doMap[x]) {
                            this.doMap[x] = [];
                        }
                        for (y = top; y < bottom; y++) {
                            if (!this.doMap[x][y]) {
                                this.doMap[x][y] = [];
                            }
                            this.doMap[x][y].push(object);
                        }
                    }

                    // Prevent subsequent draws
                    entity.removeComponent('RenderSprite');
                    
                    this.updateCache = true; //TODO: This currently causes a blanket cache update - may be worthwhile to only recache if this entity's location is currently in a cache (either cacheGrid or the current viewable area).
                }
            },

            convertCamera: function (camera) {
                var worldWidth  = this.worldWidth / this.scaleX,
                    worldPosX   = worldWidth - camera.width,
                    worldHeight = this.worldHeight / this.scaleY,
                    worldPosY   = worldHeight - camera.height,
                    laxCam      = this.laxCam;
                
                if ((worldWidth === this.layerWidth) || !worldPosX) {
                    laxCam.moveX(camera.x);
                } else {
                    laxCam.moveX(camera.left * (this.layerWidth - camera.width) / worldPosX + camera.halfWidth);
                }

                if ((worldHeight === this.layerHeight) || !worldPosY) {
                    laxCam.moveY(camera.y);
                } else {
                    laxCam.moveY(camera.top * (this.layerHeight - camera.height) / worldPosY + camera.halfHeight);
                }

                if (camera.width !== laxCam.width || camera.height !== laxCam.height) {
                    laxCam.resize(camera.width, camera.height);
                }
                
                return laxCam;
            },
            
            createTile: function (imageName) {
                var tile = null,
                    anim = '';
                
                // "tile-1" is empty, so it remains a null reference.
                if (imageName === 'tile-1') {
                    return nullTemplate;
                }
                
                tile = new platypus.PIXIAnimation(this.spriteSheet);
                tile.transformMatrix = new PIXI.Matrix();
                anim = 'tile' + transformCheck(imageName, tile.transformMatrix);
                tile.gotoAndStop(anim);
                
                return new Template(tile);
            },
            
            addImageMap: function (map) {
                var x = 0,
                    y = 0,
                    index  = '',
                    newMap = [],
                    tiles  = this.tiles,
                    tile   = null;
                
                for (x = 0; x < map.length; x++) {
                    newMap[x] = [];
                    for (y = 0; y < map[x].length; y++) {
                        index = map[x][y];
                        tile = tiles[index];
                        if (!tile && (tile !== null)) { // Empty grid spaces are null, so we needn't create a new tile.
                            tile = tiles[index] = this.createTile(index);
                        }
                        newMap[x][y] = tiles[index];
                    }
                }
                
                this.imageMap.push(newMap);
            },
            
            updateBufferRegion: function (viewport) {
                var clipW = Math.floor(this.cacheWidth  / this.tileWidth),
                    clipH = Math.floor(this.cacheHeight / this.tileHeight);
                    
                if (viewport) {
                    this.cacheTilesWidth  = Math.min(this.tilesWidth,  Math.ceil((viewport.width  + this.buffer * 2) / this.tileWidth),  clipW);
                    this.cacheTilesHeight = Math.min(this.tilesHeight, Math.ceil((viewport.height + this.buffer * 2) / this.tileHeight), clipH);
                } else {
                    this.cacheTilesWidth  = Math.min(this.tilesWidth,  clipW);
                    this.cacheTilesHeight = Math.min(this.tilesHeight, clipH);
                }

                this.cacheClipWidth   = this.cacheTilesWidth  * this.tileWidth;
                this.cacheClipHeight  = this.cacheTilesHeight * this.tileHeight;
                this.cacheCamera.mask = new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, this.cacheClipWidth, this.cacheClipHeight).endFill();
            },
            
            update: function (texture, bounds, tilesSpriteCache, oldBounds) {
                var x = 0,
                    y = 0,
                    z = 0,
                    layer   = 0,
                    tile    = null,
                    ent     = null,
                    ents    = [],
                    tiles   = [],
                    oList   = null;
                
                for (x = bounds.left; x <= bounds.right; x++) {
                    for (y = bounds.top; y <= bounds.bottom; y++) {
                        if (!oldBounds || oldBounds.empty || (y > oldBounds.bottom) || (y < oldBounds.top) || (x > oldBounds.right) || (x < oldBounds.left)) {
                            // draw tiles
                            for (layer = 0; layer < this.imageMap.length; layer++) {
                                tile = this.imageMap[layer][x][y].getNext();
                                if (tile) {
                                    if (tile.template) {
                                        tiles.push(tile.template);
                                    }
                                    tile.transformMatrix.tx = (x + 0.5) * this.tileWidth;
                                    tile.transformMatrix.ty = (y + 0.5) * this.tileHeight;
                                    this.cacheCamera.addChild(tile);
                                }
                            }
                                
                            // check for cached entities
                            if (this.doMap && this.doMap[x] && this.doMap[x][y]) {
                                oList = this.doMap[x][y];
                                for (z = 0; z < oList.length; z++) {
                                    if (!oList[z].drawn) {
                                        oList[z].drawn = true;
                                        ents.push(oList[z]);
                                    }
                                }
                            }
                        }
                    }
                }

                // Draw cached entities
                if (ents.length) {
                    ents.sort(sort);
                    for (z = 0; z < ents.length; z++) {
                        ent = ents[z];
                        delete ent.drawn;
                        this.cacheCamera.addChild(ent);
                        if (ent.mask) {
                            this.cacheCamera.addChild(ent.mask);
                        }
                    }
                }
                
                // Clear out tile instances
                for (z = 0; z < tiles.length; z++) {
                    tiles[z].clear();
                }
                
                if (tilesSpriteCache && !oldBounds.empty) {
                    tilesSpriteCache.x = oldBounds.left * this.tileWidth;
                    tilesSpriteCache.y = oldBounds.top * this.tileHeight;
                    this.cacheCamera.addChild(tilesSpriteCache); // To copy last rendering over.
                }
                this.cacheCamera.x = -bounds.left * this.tileWidth;
                this.cacheCamera.y = -bounds.top * this.tileHeight;
                texture.clear();
                texture.render(this.cacheCameraWrapper);
                texture.requiresUpdate = true;
                this.cacheCamera.removeChildren();
                
                if (oldBounds) {
                    oldBounds.set(bounds);
                }
            },
            
            updateGrid: function () {
                var x = 0,
                    y = 0,
                    grid = this.cacheGrid;
                
                if (this.createGrid) {
                    this.createGrid();
                    this.createGrid = null;
                }
                
                for (x = 0; x < grid.length; x++) {
                    for (y = 0; y < grid[x].length; y++) {
                        this.cache.setBounds(x * this.cacheTilesWidth, y * this.cacheTilesHeight, Math.min((x + 1) * this.cacheTilesWidth, this.tilesWidth - 1), Math.min((y + 1) * this.cacheTilesHeight, this.tilesHeight - 1));
                        this.update(grid[x][y].texture, this.cache);
                    }
                }
            },
            
            destroy: function () {
                var x = 0,
                    y = 0,
                    grid = this.cacheGrid;
                    
                if (grid) {
                    for (x = 0; x < grid.length; x++) {
                        for (y = 0; y < grid[x].length; y++) {
                            grid[x][y].texture.destroy(true);
                            this.parentContainer.removeChild(grid[x][y]);
                        }
                    }
                    delete this.cacheGrid;
                } else {
                    if (this.tilesSprite.texture.alternate) {
                        this.tilesSprite.texture.alternate.destroy(true);
                    }
                    this.tilesSprite.texture.destroy(true);
                    this.parentContainer.removeChild(this.tilesSprite);
                }
                this.imageMap.length = 0;
                this.tiles = null;
                this.parentContainer = null;
                this.tilesSprite = null;
            }
        }
    });
}());

//##############################################################################
// SceneChanger.js
//##############################################################################

/**
# COMPONENT **SceneChanger**
This component allows the entity to initiate a change from the current scene to another scene.

## Messages

### Listens for:
- **new-scene** - On receiving this message, a new scene is loaded according to provided parameters or previously determined component settings.
  - @param message.scene (string) - This is a label corresponding with a predefined scene.
  - @param message.transition (string) - This can be "instant" or "fade-to-black". Defaults to an instant transition.
  - @param message.persistentData (object) - Any JavaScript value(s) that should be passed to the next scene via the "scene-loaded" call.
- **set-scene** - On receiving this message, a scene value is stored, waiting for a `new-scene` to make the transition.
  - @param scene (string) - This is a label corresponding with a predefined scene.
- **set-persistent-scene-data** - On receiving this message, persistent data is stored, waiting for a `new-scene` to make the transition.
  - @param persistentData (object) - Any JavaScript value(s) that should be passed to the next scene via the "scene-loaded" call.

## JSON Definition:
    {
      "type": "SceneChanger",
      
      "scene": "scene-menu",
      // Optional (but must be provided by a "SceneChanger" parameter if not defined here). This causes the "new-scene" trigger to load this scene.
      
      "transition": "fade-to-black",
      // Optional. This can be "instant" or "fade-to-black". Defaults to an "instant" transition.
      
      "preload": true,
      // Optional. Whether the scene should already be loaded in the background.
      
      "persistentData": {"runningScore": 1400}
      // Optional. An object containing key/value pairs of information that should be passed into the new scene on the new scenes "scene-loaded" call.
    }
*/
/*global console */
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'SceneChanger',
        
        constructor: function (definition) {
            this.scene = this.owner.scene || definition.scene;
            this.transition = this.owner.transition || definition.transition || 'instant';
            this.persistentData = definition.persistentData || {};
            this.preload = definition.preload || false;
            
            // Notes definition changes from older versions of this component.
            if (definition.message) {
                console.warn('"' + this.type + '" components no longer accept "message": "' + definition.message + '" as a definition parameter. Use "aliases": {"' + definition.message + '": "new-scene"} instead.');
            }
        },

        events: {
            "scene-live": function () {
                //Makes sure we're in the current scene before preloading the next one.
                if (this.preload) {
                    platypus.game.loadScene(this.scene, this.transition, this.persistentData, true);
                }
            },
            "new-scene": function (response) {
                var resp       = response || this,
                    scene      = resp.scene || this.scene,
                    transition = resp.transition || this.transition,
                    data       = resp.persistentData || this.persistentData;
            
                platypus.game.loadScene(scene, transition, data);
            },
            "set-scene": function (scene) {
                this.scene = scene;
            },
            "set-persistent-scene-data": function (dataObj) {
                var key = '';
                
                for (key in dataObj) {
                    if (dataObj.hasOwnProperty(key)) {
                        this.persistentData[key] = dataObj[key];
                    }
                }
            }
        }
    });
}());

//##############################################################################
// TiledLoader.js
//##############################################################################

/**
 * This component is attached to a top-level entity (loaded by the [Scene](Scene.html)) and, once its peer components are loaded, ingests a JSON file exported from the [Tiled map editor](http://www.mapeditor.org/) and creates the tile maps and entities. Once it has finished loading the map, it removes itself from the list of components on the entity.
 * 
 * This component requires an [[EntityContainer]] since it calls `entity.addEntity()` on the entity, provided by `EntityContainer`.
 * 
 * This component looks for the following entities, and if not found will load default versions:

        {
            "render-layer": {
                "id": "render-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import",
                    "entityCache": true
                }]
            },
            "collision-layer": {
                "id": "collision-layer",
                "components":[{
                    "type": "CollisionTiles",
                    "collisionMap": "import"
                }]
            },
            "image-layer": {
                "id": "image-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import"
                }]
            },
            "tile-layer": {
                "id": "tile-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import"
                },{
                    "type": "CollisionTiles",
                    "collisionMap": "import"
                }]
            }
        }

 * @namespace platypus.components
 * @class TiledLoader
 * @uses Component
 */
/*global console, platypus */
/*jslint bitwise: true, plusplus: true */
(function () {
    "use strict";

    var transformCheck = function (v) {
            var a = !!(0x20000000 & v),
                b = !!(0x40000000 & v),
                c = !!(0x80000000 & v);

            if (a && c) {
                return -3;
            } else if (a) {
                return -5;
            } else if (b) {
                return -4;
            } else {
                return -2;
            }
        },
        transform = {
            x: 1,
            y: 1,
            id: -1
        },
        entityTransformCheck = function (v) {
            var resp = transform,
                //        a = !!(0x20000000 & v),
                b = !!(0x40000000 & v),
                c = !!(0x80000000 & v);

            resp.id = 0x0fffffff & v;
            resp.x = 1;
            resp.y = 1;

            if (b && c) {
                resp.x = -1;
                resp.y = -1;
            } else if (b) {
                resp.y = -1;
            } else if (c) {
                resp.x = -1;
            }
            return resp;
        },
        // These are provided but can be overwritten by entities of the same name in the configuration.
        standardEntityLayers = {
            "render-layer": {
                "id": "render-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import",
                    "entityCache": true
                }]
            },
            "collision-layer": {
                "id": "collision-layer",
                "components":[{
                    "type": "CollisionTiles",
                    "collisionMap": "import"
                }]
            },
            "image-layer": {
                "id": "image-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import"
                }]
            },
            "tile-layer": {
                "id": "tile-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import"
                },{
                    "type": "CollisionTiles",
                    "collisionMap": "import"
                }]
            }
        };

    return platypus.createComponentClass({
        id: 'TiledLoader',

        properties: {
            /**
             * If specified, the referenced images are used as the game sprite sheets instead of the images referenced in the Tiled map. This is useful for using different or better quality art from the art used in creating the Tiled map.
             *
             * @property images
             * @type Array
             * @default null
             */
            images: null,

            /**
             * Adds a number to each additional Tiled layer's z coordinate to maintain z-order. Defaults to 1000.
             *
             * @property layerIncrement
             * @type number
             * @default 1000
             */
            layerIncrement: 1000,

            /**
             * Keeps the tile maps in separate render layers. Default is 'false' to for better optimization.
             *
             * @property separateTiles
             * @type boolean
             * @default false
             */
            separateTiles: false
        },

        publicProperties: {
            /**
             * Specifies the JSON level to load. Available on the entity as `entity.level`.
             *
             * @property level
             * @type String
             */
            level: null,

            /**
             * Sets how many world units in width and height correspond to a single pixel in the Tiled map. Default is 1: One pixel is one world unit. Available on the entity as `entity.unitsPerPixel`.
             *
             * @property unitsPerPixel
             * @type number
             * @default 1
             */
            unitsPerPixel: 1,

            /**
             * If images are provided, this property sets the scale of the art relative to world coordinates. Available on the entity as `entity.imagesScale`.
             *
             * @property imagesScale
             * @type number
             * @default 1
             */
            imagesScale: 1,

            /**
             * Can be "left", "right", or "center". Defines where entities registered X position should be when spawned. Available on the entity as `entity.entityPositionX`.
             *
             * @property entityPositionX
             * @type String
             * @default "center"
             */
            entityPositionX: "center",

            /**
             * Can be "top", "bottom", or "center". Defines where entities registered Y position should be when spawned. Available on the entity as `entity.entityPositionY`.
             *
             * @property entityPositionY
             * @type String
             * @default "bottom"
             */
            entityPositionY: "bottom",

            /**
             * Whether to wait for a "load-level" event before before loading. Available on the entity as `entity.manuallyLoad`.
             *
             * @property manuallyLoad
             * @type boolean
             * @default false
             */
            manuallyLoad: false
        },

        constructor: function (definition) {
            this.entities = [];
            this.layerZ = 0;
            this.followEntity = false;
        },

        events: {

            /**
             * On receiving this message, the component commences loading the Tiled map JSON definition. Once finished, it removes itself from the entity's list of components.
             *
             * @method 'scene-loaded'
             * @param persistentData {Object} Data passed from the last scene into this one.
             */
            "scene-loaded": function (persistentData) {
                if (!this.manuallyLoad) {
                    this.loadLevel({
                        level: this.level || persistentData.level,
                        persistentData: persistentData
                    });
                }
            },

            /**
             * If `manuallyLoad` is set, the component will wait for this message before loading the Tiled map JSON definition.
             *
             * @method 'load-level'
             * @param levelData {Object}
             * @param levelData.level {String|Object} The level to load.
             * @param [levelData.persistentData] {Object} Information passed from the last scene.
             */
            "load-level": function (levelData) {
                this.loadLevel(levelData);
            }
        },

        methods: {
            loadLevel: function (levelData) {
                var level = levelData.level,
                    actionLayer = 0,
                    layer = false;

                //format level appropriately
                if (typeof level === 'string') {
                    level = platypus.game.settings.levels[level];
                }

                for (actionLayer = 0; actionLayer < level.layers.length; actionLayer++) {
                    layer = this.setupLayer(level.layers[actionLayer], level, layer);
                    if (this.separateTiles) {
                        layer = false;
                    }
                }

                /**
                 * Once finished loading the map, this message is triggered on the entity to notify other components of completion.
                 *
                 * @event 'world-loaded'
                 * @param world {Object} World data.
                 * @param world.width {number} The width of the world in world units.
                 * @param world.height {number} The height of the world in world units.
                 * @param world.tile {Object} Properties of the world tiles.
                 * @param world.tile.width {number} The width in world units of a single tile.
                 * @param world.tile.height {number} The height in world units of a single tile.
                 * @param world.camera {Entity} If a camera property is found on one of the loaded entities, this property will point to the entity on load that a world camera should focus on.
                 */
                this.owner.trigger('world-loaded', {
                    width: level.width * level.tilewidth * this.unitsPerPixel,
                    height: level.height * level.tileheight * this.unitsPerPixel,
                    tile: {
                        width: level.tilewidth,
                        height: level.tileheight
                    },
                    camera: this.followEntity
                });
                this.owner.removeComponent(this);
            },

            setupLayer: function (layer, level, combineRenderLayer) {
                var self = this,
                    images = self.images || [],
                    tilesets = level.tilesets,
                    tileWidth = level.tilewidth,
                    tileHeight = level.tileheight,
                    widthOffset = 0,
                    heightOffset = 0,
                    x = 0,
                    p = 0,
                    w = 0,
                    h = 0,
                    a = 0,
                    v = null,
                    obj = 0,
                    entity = null,
                    entityPositionX = "",
                    entityPositionY = "",
                    property = null,
                    entityType = '',
                    gid = -1,
                    smallestX = Infinity,
                    largestX = -Infinity,
                    smallestY = Infinity,
                    largestY = -Infinity,
                    transform = null,
                    tileset = null,
                    properties = null,
                    layerCollides = true,
                    numberProperty = 0,
                    polyPoints = null,
                    fallbackWidth = 0,
                    fallbackHeight = 0,
                    convertImageLayer = function (imageLayer) {
                        var i = 0,
                            dataCells = 0,
                            props = imageLayer.properties || {},
                            tileLayer = {
                                data: [],
                                image: '',
                                height: 1,
                                name: imageLayer.name,
                                type: 'tilelayer',
                                width: 1,
                                tileheight: tileHeight,
                                tilewidth: tileWidth,
                                x: imageLayer.x,
                                y: imageLayer.y,
                                properties: props
                            };

                        if (props.repeat) {
                            tileLayer.width = +props.repeat;
                            tileLayer.height = +props.repeat;
                        }
                        if (props['repeat-x']) {
                            tileLayer.width = +props['repeat-x'];
                        }
                        if (props['repeat-y']) {
                            tileLayer.height = +props['repeat-y'];
                        }
                        dataCells = tileLayer.width * tileLayer.height;
                        for (i = 0; i < dataCells; i++) {
                            tileLayer.data.push(1);
                        }

                        if (platypus.assets[imageLayer.name] && platypus.assets[imageLayer.name].asset) { // Prefer to have name in tiled match image id in game
                            tileLayer.image = imageLayer.name;
                            tileLayer.tileheight = platypus.assets[imageLayer.name].asset.height;
                            tileLayer.tilewidth = platypus.assets[imageLayer.name].asset.width;
                        } else {
                            console.warn('Component TiledLoader: Cannot find the "' + imageLayer.name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + imageLayer.name + '".');
                            tileLayer.image = imageLayer.image;
                        }

                        return tileLayer;
                    },
                    createLayer = function (entityKind, layer) {
                        var width = layer.width,
                            height = layer.height,
                            tHeight = layer.tileheight || tileHeight,
                            tWidth = layer.tilewidth || tileWidth,
                            newWidth = 0,
                            newHeight = 0,
                            tileTypes = 0,
                            tileDefinition = null,
                            importAnimation = null,
                            importCollision = null,
                            importRender = null,
                            renderTiles = false,
                            tileset = null,
                            jumpthroughs = null,
                            index = 0,
                            x = 0,
                            y = 0,
                            data = layer.data;

                        //This builds in parallaxing support by allowing the addition of width and height properties into Tiled layers so they pan at a separate rate than other layers.
                        if (layer.properties) {
                            if (layer.properties.width) {
                                newWidth  = parseInt(layer.properties.width,  10);
                            }
                            if (layer.properties.height) {
                                newHeight = parseInt(layer.properties.height, 10);
                            }
                            if (newWidth || newHeight) {
                                newWidth  = newWidth  || width;
                                newHeight = newHeight || height;
                                data      = [];
                                for (x = 0; x < newWidth; x++) {
                                    for (y = 0; y < newHeight; y++) {
                                        if ((x < width) && (y < height)) {
                                            data[x + y * newWidth] = layer.data[x + y * width];
                                        } else {
                                            data[x + y * newWidth] = 0;
                                        }
                                    }
                                }
                                width  = newWidth;
                                height = newHeight;
                            }
                        }

                        //TODO: a bit of a hack to copy an object instead of overwrite values
                        tileDefinition = JSON.parse(JSON.stringify(platypus.game.settings.entities[entityKind] || standardEntityLayers[entityKind]));

                        importAnimation = {};
                        importCollision = [];
                        importRender = [];

                        if (entityKind === 'collision-layer') {
                            jumpthroughs = [];
                            for (x = 0; x < tilesets.length; x++) {
                                tileset = tilesets[x];
                                if (tileset.tileproperties) {
                                    for (y in tileset.tileproperties) {
                                        if (tileset.tileproperties.hasOwnProperty(y)) {
                                            if (tileset.tileproperties[y].jumpThrough) {
                                                jumpthroughs.push(tileset.firstgid + parseInt(y, 10) - 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        tileDefinition.properties = tileDefinition.properties || {};
                        tileDefinition.properties.width = tWidth * width * self.unitsPerPixel;
                        tileDefinition.properties.height = tHeight * height * self.unitsPerPixel;
                        tileDefinition.properties.columns = width;
                        tileDefinition.properties.rows = height;
                        tileDefinition.properties.tileWidth = tWidth * self.unitsPerPixel;
                        tileDefinition.properties.tileHeight = tHeight * self.unitsPerPixel;
                        tileDefinition.properties.scaleX = self.imagesScale;
                        tileDefinition.properties.scaleY = self.imagesScale;
                        tileDefinition.properties.layerZ = self.layerZ;
                        tileDefinition.properties.z = tileDefinition.properties.z || self.layerZ;

                        tileTypes = (tilesets[tilesets.length - 1].imagewidth / tWidth) * (tilesets[tilesets.length - 1].imageheight / tHeight) + tilesets[tilesets.length - 1].firstgid;
                        for (x = -1; x < tileTypes; x++) {
                            importAnimation['tile' + x] = x;
                        }
                        for (x = 0; x < width; x++) {
                            importCollision[x] = [];
                            importRender[x] = [];
                            for (y = 0; y < height; y++) {
                                index = +data[x + y * width] - 1;
                                importRender[x][y] = 'tile' + index;
                                if (jumpthroughs && jumpthroughs.length && (jumpthroughs[0] === (0x0fffffff & index))) {
                                    index = transformCheck(index);
                                }
                                importCollision[x][y] = index;
                            }
                        }
                        for (x = 0; x < tileDefinition.components.length; x++) {
                            if (tileDefinition.components[x].type === 'RenderTiles') {
                                renderTiles = tileDefinition.components[x];
                            }
                            if (tileDefinition.components[x].spriteSheet === 'import') {
                                tileDefinition.components[x].spriteSheet = {
                                    images: (layer.image ? [layer.image] : images),
                                    frames: {
                                        width: tWidth * self.unitsPerPixel / self.imagesScale,
                                        height: tHeight * self.unitsPerPixel / self.imagesScale,
                                        regX: (tWidth * self.unitsPerPixel / self.imagesScale) / 2,
                                        regY: (tHeight * self.unitsPerPixel / self.imagesScale) / 2
                                    },
                                    animations: importAnimation
                                };
                            } else if (tileDefinition.components[x].spriteSheet) {
                                if (typeof tileDefinition.components[x].spriteSheet === 'string' && platypus.game.settings.spriteSheets[tileDefinition.components[x].spriteSheet]) {
                                    tileDefinition.components[x].spriteSheet = platypus.game.settings.spriteSheets[tileDefinition.components[x].spriteSheet];
                                }
                                if (!tileDefinition.components[x].spriteSheet.animations) {
                                    tileDefinition.components[x].spriteSheet.animations = importAnimation;
                                }
                            }
                            if (tileDefinition.components[x].collisionMap === 'import') {
                                tileDefinition.components[x].collisionMap = importCollision;
                            }
                            if (tileDefinition.components[x].imageMap === 'import') {
                                tileDefinition.components[x].imageMap = importRender;
                            }
                        }
                        self.layerZ += self.layerIncrement;

                        if ((entityKind === 'render-layer') && combineRenderLayer && (combineRenderLayer.tileHeight === tHeight) && (combineRenderLayer.tileWidth === tWidth) && (combineRenderLayer.columns === width) && (combineRenderLayer.rows === height)) {
                            combineRenderLayer.trigger('add-tiles', renderTiles);
                            return combineRenderLayer;
                        } else {
                            return self.owner.addEntity(new platypus.Entity(tileDefinition, {
                                properties: {

                                }
                            }));
                        }
                    };

                if (images.length === 0) {
                    for (x = 0; x < tilesets.length; x++) {
                        if (platypus.assets[tilesets[x].name] && platypus.assets[tilesets[x].name].asset) { // Prefer to have name in tiled match image id in game
                            images.push(tilesets[x].name);
                        } else {
                            console.warn('Component TiledLoader: Cannot find the "' + tilesets[x].name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + tilesets[x].name + '".');
                            images.push(tilesets[x].image);
                        }
                    }
                } else {
                    images = images.slice(); //so we do not overwrite settings array
                }

                if (layer.type === 'tilelayer') {
                    // First determine which type of entity this layer should behave as:
                    entity = 'render-layer'; // default
                    if (layer.properties && layer.properties.entity) {
                        entity = layer.properties.entity;
                    } else { // If not explicitly defined, try using the name of the layer
                        switch (layer.name) {
                        case "collision":
                            entity = 'collision-layer';
                            break;
                        case "action":
                            entity = 'tile-layer';
                            for (x = 0; x < level.layers.length; x++) {
                                if (level.layers[x].name === 'collision' || (level.layers[x].properties && level.layers[x].properties.entity === 'collision-layer')) {
                                    layerCollides = false;
                                }
                            }
                            if (!layerCollides) {
                                entity = 'render-layer';
                            }
                            break;
                        }
                    }

                    if (entity === 'tile-layer') {
                        createLayer('collision-layer', layer);
                        return createLayer('render-layer', layer);
                    } else if (entity === 'collision-layer') {
                        createLayer(entity, layer);
                    } else {
                        return createLayer(entity, layer);
                    }
                } else if (layer.type === 'imagelayer') {
                    // set up temp tile layer to pass in image layer as if it's tiled.
                    return createLayer('image-layer', convertImageLayer(layer));
                } else if (layer.type === 'objectgroup') {
                    entityPositionX = this.entityPositionX;
                    entityPositionY = this.entityPositionY;

                    if (layer.properties) {
                        if (layer.properties.entityPositionX) {
                            entityPositionX = layer.properties.entityPositionX;
                        }
                        if (layer.properties.entityPositionY) {
                            entityPositionY = layer.properties.entityPositionY;
                        }
                    }

                    for (obj = 0; obj < layer.objects.length; obj++) {
                        entity = layer.objects[obj];
                        gid = entity.gid || -1;
                        transform = null;

                        if (gid !== -1) {
                            transform = entityTransformCheck(gid);
                            gid = transform.id;
                        }

                        for (x = 0; x < tilesets.length; x++) {
                            if (tilesets[x].firstgid > gid) {
                                break;
                            } else {
                                tileset = tilesets[x];
                            }
                        }

                        // Check Tiled data to find this object's type
                        entityType = '';
                        if (entity.type !== '') {
                            entityType = entity.type;
                        } else if (entity.name !== '') {
                            entityType = entity.name;
                        } else if (tileset.tileproperties[gid - tileset.firstgid]) {
                            if (tileset.tileproperties[gid - tileset.firstgid].entity) {
                                entityType = tileset.tileproperties[gid - tileset.firstgid].entity;
                            } else if (tileset.tileproperties[gid - tileset.firstgid].type) {
                                entityType = tileset.tileproperties[gid - tileset.firstgid].type;
                            }
                        }

                        if (entityType !== '') {
                            properties = {};

                            //Copy properties from Tiled
                            if (transform) {
                                properties.scaleX = transform.x;
                                properties.scaleY = transform.y;
                            } else {
                                properties.scaleX = 1;
                                properties.scaleY = 1;
                            }

                            if ((gid >= 0) && tileset.tileproperties && tileset.tileproperties[gid - tileset.firstgid]) {
                                for (x in tileset.tileproperties[gid - tileset.firstgid]) {
                                    //This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
                                    if (tileset.tileproperties[gid - tileset.firstgid].hasOwnProperty(x)) {
                                        numberProperty = parseFloat(tileset.tileproperties[gid - tileset.firstgid][x]);
                                        if (numberProperty === 0 || (!!numberProperty)) {
                                            properties[x] = numberProperty;
                                        } else if (tileset.tileproperties[gid - tileset.firstgid][x] === 'true') {
                                            properties[x] = true;
                                        } else if (tileset.tileproperties[gid - tileset.firstgid][x] === 'false') {
                                            properties[x] = false;
                                        } else {
                                            properties[x] = tileset.tileproperties[gid - tileset.firstgid][x];
                                        }
                                    }
                                }
                            }

                            for (x in entity.properties) {
                                if (entity.properties.hasOwnProperty(x)) {
                                    property = entity.properties[x];
                                    if (typeof property === 'string') {
                                        //This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
                                        numberProperty = parseFloat(property);
                                        if (numberProperty === 0 || (!!numberProperty)) {
                                            properties[x] = numberProperty;
                                        } else if (property === 'true') {
                                            properties[x] = true;
                                        } else if (property === 'false') {
                                            properties[x] = false;
                                        } else if ((property.length > 2) && (((property[0] === '{') && (property[property.length - 1] === '}')) || ((property[0] === '[') && (property[property.length - 1] === ']')))) {
                                            try {
                                                properties[x] = JSON.parse(property);
                                            } catch (e) {
                                                properties[x] = property;
                                            }
                                        } else {
                                            properties[x] = property;
                                        }
                                    } else {
                                        properties[x] = property;
                                    }
                                }
                            }

                            if (entity.polygon || entity.polyline) {
                                //Figuring out the width of the polygon and shifting the origin so it's in the top-left.
                                smallestX = Infinity;
                                largestX = -Infinity;
                                smallestY = Infinity;
                                largestY = -Infinity;

                                polyPoints = null;
                                if (entity.polygon) {
                                    polyPoints = entity.polygon;
                                } else if (entity.polyline) {
                                    polyPoints = entity.polyline;
                                }

                                for (x = 0; x < polyPoints.length; x++) {
                                    if (polyPoints[x].x > largestX) {
                                        largestX = polyPoints[x].x;
                                    }
                                    if (polyPoints[x].x < smallestX) {
                                        smallestX = polyPoints[x].x;
                                    }
                                    if (polyPoints[x].y > largestY) {
                                        largestY = polyPoints[x].y;
                                    }
                                    if (polyPoints[x].y < smallestY) {
                                        smallestY = polyPoints[x].y;
                                    }
                                }
                                properties.width = largestX - smallestX;
                                properties.height = largestY - smallestY;
                                properties.x = entity.x + smallestX;
                                properties.y = entity.y + smallestY;

                                widthOffset = 0;
                                heightOffset = 0;
                                properties.width = properties.width * this.unitsPerPixel;
                                properties.height = properties.height * this.unitsPerPixel;

                                properties.x = properties.x * this.unitsPerPixel;
                                properties.y = properties.y * this.unitsPerPixel;

                                if (entity.polygon) {
                                    properties.shape = {};
                                    properties.shape.type = 'polygon';
                                    properties.shape.points = [];
                                    for (p = 0; p < polyPoints.length; p++) {
                                        properties.shape.points.push({
                                            "x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel),
                                            "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel)
                                        });
                                    }
                                } else if (entity.polyline) {
                                    properties.shape = {};
                                    properties.shape.type = 'polyline';
                                    properties.shape.points = [];
                                    for (p = 0; p < polyPoints.length; p++) {
                                        properties.shape.points.push({
                                            "x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel),
                                            "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel)
                                        });
                                    }
                                }
                            } else {
                                fallbackWidth = tileWidth * this.unitsPerPixel;
                                fallbackHeight = tileHeight * this.unitsPerPixel;
                                widthOffset = 0;
                                heightOffset = 0;
                                properties.width = (entity.width || 0) * this.unitsPerPixel;
                                properties.height = (entity.height || 0) * this.unitsPerPixel;

                                if (entityType && platypus.game.settings.entities[entityType] && platypus.game.settings.entities[entityType].properties) {
                                    if (!properties.width) {
                                        properties.width = platypus.game.settings.entities[entityType].properties.width || 0;
                                        widthOffset = fallbackWidth;
                                    }
                                    if (!properties.height) {
                                        properties.height = platypus.game.settings.entities[entityType].properties.height || 0;
                                        heightOffset = fallbackHeight;
                                    }
                                }

                                if (!properties.width) {
                                    properties.width = fallbackWidth;
                                }
                                if (!properties.height) {
                                    properties.height = fallbackHeight;
                                }
                                widthOffset = widthOffset || properties.width;
                                heightOffset = heightOffset || properties.height;

                                properties.x = entity.x * this.unitsPerPixel;
                                properties.y = entity.y * this.unitsPerPixel;

                                if (entity.rotation) {
                                    w = (entity.width || fallbackWidth) / 2;
                                    h = (entity.height || fallbackHeight) / 2;
                                    a = ((entity.rotation / 180) % 2) * Math.PI;
                                    v = new platypus.Vector(w, -h).rotate(a);
                                    properties.rotation = entity.rotation;
                                    properties.x = Math.round((properties.x + v.x - w) * 1000) / 1000;
                                    properties.y = Math.round((properties.y + v.y + h) * 1000) / 1000;
                                }

                                if (entityPositionX === 'left') {
                                    properties.regX = 0;
                                } else if (entityPositionX === 'center') {
                                    properties.regX = properties.width / 2;
                                    properties.x += widthOffset / 2;
                                } else if (entityPositionX === 'right') {
                                    properties.regX = properties.width;
                                    properties.x += widthOffset;
                                }

                                if (gid === -1) {
                                    properties.y += properties.height;
                                }
                                if (entityPositionY === 'bottom') {
                                    properties.regY = properties.height;
                                } else if (entityPositionY === 'center') {
                                    properties.regY = properties.height / 2;
                                    properties.y -= heightOffset / 2;
                                } else if (entityPositionY === 'top') {
                                    properties.regY = 0;
                                    properties.y -= heightOffset;
                                }

                                if (entity.ellipse) {
                                    properties.shape = {};
                                    properties.shape.type = 'ellipse';
                                    properties.shape.width = properties.width * this.unitsPerPixel;
                                    properties.shape.height = properties.height * this.unitsPerPixel;
                                } else if (entity.width && entity.height) {
                                    properties.shape = {};
                                    properties.shape.type = 'rectangle';
                                    properties.shape.width = properties.width * this.unitsPerPixel;
                                    properties.shape.height = properties.height * this.unitsPerPixel;
                                }
                            }

                            if (platypus.game.settings.entities[entityType].properties) {
                                properties.scaleX *= this.imagesScale * (platypus.game.settings.entities[entityType].properties.scaleX || 1); //this.unitsPerPixel;
                                properties.scaleY *= this.imagesScale * (platypus.game.settings.entities[entityType].properties.scaleY || 1); //this.unitsPerPixel;
                            } else {
                                properties.scaleX *= this.imagesScale;
                                properties.scaleY *= this.imagesScale;
                            }
                            properties.layerZ = this.layerZ;

                            //Setting the z value. All values are getting added to the layerZ value.
                            if (properties.z) {
                                properties.z += this.layerZ;
                            } else if (entityType && platypus.game.settings.entities[entityType] && platypus.game.settings.entities[entityType].properties && platypus.game.settings.entities[entityType].properties.z) {
                                properties.z = this.layerZ + platypus.game.settings.entities[entityType].properties.z;
                            } else {
                                properties.z = this.layerZ;
                            }

                            properties.parent = this.owner;
                            entity = this.owner.addEntity(new platypus.Entity(platypus.game.settings.entities[entityType], {
                                properties: properties
                            }));
                            if (entity) {
                                if (entity.camera) {
                                    this.followEntity = {
                                        entity: entity,
                                        mode: entity.camera
                                    }; //used by camera
                                }
                                this.owner.triggerEvent('entity-created', entity);
                            }
                        }
                    }
                    this.layerZ += this.layerIncrement;
                    return false;
                }
            },

            "destroy": function () {
                this.entities.length = 0;
            }
        }
    });
}());

//##############################################################################
// Tween.js
//##############################################################################

/**
# COMPONENT **Tween**
Tween takes a list of tween definitions and plays them as needed.

## Dependencies
- [[TweenJS]] - This component requires the CreateJS TweenJS module.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for messages and on receiving them, begins playing the corresponding tween.

### Local Broadcasts:
- **[Messages specified in definition]** - Broadcasts messages from a given tween definition.

## JSON Definition
    {
      "type": "Tween",

      "events": {
      // Required. A key/value list of events and an array representing the tween they should trigger.

            "begin-flying": [
            // When "begin-flying" is triggered on this entity, the following tween begins. Tween definitions adhere to a similar structure outlined by the TweenJS documentation. Each milestone on the tween is an item in this array.

                ["to", {
                    "scaleY": 1,
                    "y": 400
                }, 500],
                // If the definition is an array, the first parameter is the type of milestone, in this case "to", with all following parameters passed directly to the equivalent Tween function.
                
                ["call", "fly"],
                // "call" milestones can take a function or a string. If it's a string, the string will be triggered as an event on the entity. In this case, the component will trigger "fly".
            ]
        }
    }
*/
/*global createjs, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var createTrigger = function (entity, event, message, debug) {
            return function () {
                entity.trigger(event, message, debug);
            };
        },
        createTween = function (definition) {
            return function (values) {
                var i  = 0,
                    tweens = definition,
                    tweenDef = null,
                    arr = null,
                    tween = createjs.Tween.get(this.owner);

                if (Array.isArray(values)) {
                    tweens = values;
                } else if (!Array.isArray(tweens)) {
                    return;
                }

                for (i = 0; i < tweens.length; i++) {
                    tweenDef = tweens[i];
                    if (typeof tweenDef === 'string') {
                        tween.call(createTrigger(this.owner, tweenDef));
                    } else if (Array.isArray(tweenDef)) {
                        if (tweenDef[0] === 'call' && typeof tweenDef[1] === 'string') {
                            tween.call(createTrigger(this.owner, tweenDef[1]));
                        } else {
                            arr = tweenDef.slice();
                            arr.splice(0, 1);
                            tween[tweenDef[0]].apply(tween, arr);
                        }
                    } else {
                        if (tweenDef.method === 'call' && typeof tweenDef.params === 'string') {
                            tween.call(createTrigger(this.owner, tweenDef.params));
                        } else {
                            tween[tweenDef.method].apply(tween, tweenDef.params);
                        }
                    }
                }
            };
        };

    return platypus.createComponentClass({
        id: 'Tween',
        
        constructor: function (definition) {
            var event = '';
            
            if (definition.events) {
                for (event in definition.events) {
                    if (definition.events.hasOwnProperty(event)) {
                        this.addEventListener(event, createTween(definition.events[event]));
                    }
                }
            }
        }
    });
}());

//##############################################################################
// VoiceOver.js
//##############################################################################

/**
 * This component uses its definition to load AudioVO and RenderSprite components who work in an interconnected way to render animations corresponding to one or more audio tracks.
 *
 * In addition to its own properties, this component also accepts all properties accepted by either [[RenderSprite]] or [[AudioVO]] and passes them along when it creates those components.
 *
 * @namespace platypus.components
 * @class VoiceOver
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var getEventName = function (msg, VO) {
            if (VO === ' ') {
                return msg + 'default';
            } else {
                return msg + VO;
            }
        },
        createAudioDefinition = function (sound, events, message, frameLength) {
            var i          = 0,
                key        = '',
                definition = {},
                time       = 0,
                lastFrame  = '',
                thisFrame  = '',
                voice = sound.voice;

            if (typeof sound.sound === 'string') {
                definition.sound = sound.sound;
                definition.events = [];
            } else {
                for (key in sound.sound) {
                    if (sound.sound.hasOwnProperty(key)) {
                        definition[key] = sound.sound[key];
                    }
                }

                if (definition.events) {
                    definition.events = definition.events.slice();
                } else {
                    definition.events = [];
                }
            }

            if (voice) {
                voice += ' ';

                for (i = 0; i < voice.length; i++) {
                    thisFrame = voice[i];
                    if (thisFrame !== lastFrame) {
                        lastFrame = thisFrame;
                        definition.events.push({
                            "time": time,
                            "event": getEventName(message, thisFrame)
                        });
                    }
                    time += frameLength;
                }
            }

            return definition;
        },
        createVO = function (sound, events, message, frameLength) {
            var i = 0,
                definitions = [];

            if (!events[' ']) {
                events[' '] = events['default'];
            }

            if (Array.isArray(sound)) {
                for (i = 0; i < sound.length; i++) {
                    definitions.push(createAudioDefinition(sound[i], events, message, frameLength));
                }
                return definitions;
            } else {
                return createAudioDefinition(sound, events, message, frameLength);
            }
        };

    return platypus.createComponentClass({
        id: 'VoiceOver',
        
        properties: {
            /**
             * Sets the pairing between letters in the voice-over strings and the animation frame to play.
             *
             *       "animationMap": {
             *         "default": "mouth-closed"
             *         // Required. Specifies animation of default position.
             *
             *         "w": "mouth-o",
             *         "a": "mouth-aah",
             *         "t": "mouth-t"
             *         // Optional. Also list single characters that should map to a given voice-over animation frame.
             *       }
             *
             * @property animationMap
             * @type Object
             * @default: {"default": "default"}
             */
            animationMap: {"default": "default"},

            /**
             * Specifies how long a described voice-over frame should last in milliseconds.
             *
             * @property frameLength
             * @type Number
             * @default 100
             */
            frameLength: 100,

            /**
             * Specifies the prefix that messages between the render and Audio components should use. This will cause the audio to trigger events like "i-say-w" and "i-say-a" (characters listed in the animationMap), that the RenderSprite uses to show the proper frame.
             *
             * @property messagePrefix
             * @type String
             * @default "VoiceOver"
             */
            messagePrefix: "VoiceOver",

            /**
             * This maps events to audio clips and voice over strings.
             *
             *      "voiceOverMap": {
             *          "message-triggered": [{
             *              "sound": "audio-id",
             *              // Required. This is the audio clip to play when "message-triggered" is triggered. It may be a string as shown or an object of key/value pairs as described in an [[audio]] component definition.
             *              "voice": "waat"
             *              // Optional. This string defines the voice-over sequence according to the frames defined by animationMap. Each character lasts the length specified by "frameLength" above. If not specified, voice will be the default frame.
             *          }]
             *      }
             *
             * @property voiceOverMap
             * @type Object
             * @default {}
             */
            voiceOverMap: {}
        },

        constructor: function (definition) {
            var i = '',
                audioDefinition     = {
                    audioMap: {},
                    aliases:  definition.aliases
                },
                animationDefinition = {
                    spriteSheet:   definition.spriteSheet,
                    acceptInput:   definition.acceptInput,
                    scaleX:        definition.scaleX,
                    scaleY:        definition.scaleY,
                    rotate:        definition.rotate,
                    mirror:        definition.mirror,
                    flip:          definition.flip,
                    hidden:        definition.hidden,
                    animationMap:  {},
                    pins:          definition.pins,
                    pinTo:         definition.pinTo,
                    aliases:       definition.aliases,
                    eventBased:    true, // VO triggers events for changing lip-sync frames.
                    stateBased:    definition.stateBased || false
                };
            
            this.message = this.messagePrefix + '-';
            
            for (i in this.animationMap) {
                if (this.animationMap.hasOwnProperty(i)) {
                    animationDefinition.animationMap[getEventName(this.message, i)] = this.animationMap[i];
                }
            }
            animationDefinition.animationMap['default'] = this.animationMap['default'];
            this.owner.addComponent(new platypus.components.RenderSprite(this.owner, animationDefinition));

            for (i in this.voiceOverMap) {
                if (this.voiceOverMap.hasOwnProperty(i)) {
                    audioDefinition.audioMap[i] = createVO(this.voiceOverMap[i], this.animationMap, this.message, this.frameLength);
                }
            }
            this.owner.addComponent(new platypus.components.AudioVO(this.owner, audioDefinition));
        },

        events: {
            /**
             * On receiving this message, this component removes itself from the entity. (It creates the [[RenderSprite]] and [[AudioVO]] components in its constructor.)
             *
             * @method 'load'
             */
            "load": function () {
                this.owner.removeComponent(this);
            }
        }
    });
}());

//##############################################################################
// XHR.js
//##############################################################################

/**
 * This component provides component-based XHR communication with a server.
 * 
 * @namespace platypus.components
 * @class XHR
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'XHR',
        
        properties: {
            /**
             * Sets the XHR method to use.
             * 
             * @property method
             * @type String
             * @default "GET"
             */
            method: "GET",
            
            /**
             * Sets the path to connect to the server.
             * 
             * @property path
             * @type String
             * @default ""
             */
            path: "",
            
            /**
             * Sets the XHR response type.
             * 
             * @property responseType
             * @type String
             * @default "text"
             */
            responseType: "text",
            
            /**
             * Whether cookies should be retained on cross-domain calls.
             * 
             * @property withCredentials
             * @type boolean
             * @default false
             */
            withCredentials: false
        },
        
        constructor: function (definition) {
            this.setProperties(definition);
        },

        events: {// These are messages that this component listens for
            /**
             * On receiving this message, this component makes a request from the server using the provided information. Note that properties set here will reset the properties set by this component's JSON definition.
             * 
             * @method 'request'
             * @param message {Object}
             * @param message.method {String} XHR method to use: must be "GET" or "POST".
             * @param message.path {String} The path to the server resource.
             * @param [message.responseType="text"] {String} Response type expected.
             * @param [message.data] {Object} An object of string key/value pairs to be transmitted to the server.
             * @param message.onload {Function} A function that should be run on receiving a response from the server. This defaults to triggering a "response" message containing the responseText value.
             */
            "request": function (resp) {
                this.setProperties(resp);
                
                if (this.method === "GET") {
                    this.get();
                } else if (this.method === "POST") {
                    this.post();
                } else {
                    throw "Method must be GET or POST";
                }
            }
        },
        
        methods: {// These are methods that are called on the component
            setProperties: function (properties) {
                var key     = '',
                    divider = '',
                    self    = this,
                    props   = properties || this;
                
                this.method       = props.method       || this.method       || "GET";
                this.path         = props.path         || this.path         || null;
                this.responseType = props.responseType || this.responseType || "text";
                this.withCredentials = props.withCredentials || this.withCredentials || false;
                
                if ((props !== this) && props.data) {
                    this.data = '';
                    for (key in props.data) {
                        if (props.data.hasOwnProperty(key)) {
                            this.data += divider + key + '=' + props.data[key];
                            divider = '&';
                        }
                    }
                } else {
                    this.data = '';
                }
                
                this.onload = props.onload || this.onload || function (e) {
                    if (this.status === 200) {
                        /**
                         * This message is triggered on receiving a response from the server (if "onload" is not set by the original "request" message).
                         * 
                         * @event 'response'
                         * @param message {String} The message contains the responseText returned by the server.
                         */
                        self.owner.trigger('response', this.responseText);
                    }
                };
            },
            get: function () {
                var xhr  = new XMLHttpRequest(),
                    path = this.path;
                
                if (this.data) {
                    path += '?' + this.data;
                }
                
                xhr.open(this.method, path, true);
                xhr.withCredentials = this.withCredentials;
                xhr.responseType = this.responseType;
                xhr.onload = this.onload;
                xhr.send();
            },
            post: function () {
                var xhr = new XMLHttpRequest();
                
                xhr.open(this.method, this.path, true);
                xhr.withCredentials = this.withCredentials;
                xhr.responseType = this.responseType;
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.onload = this.onload;
                xhr.send(this.data);
            }
        }
    });
}());