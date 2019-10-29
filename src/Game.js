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
/* global document, platypus, window */
import {Application, ScaleManager} from 'springroll';
import {Container, Renderer, Ticker} from 'pixi.js';
import Messenger from './Messenger.js';
import Scene from './Scene.js';
import Sound from 'pixi-sound';
import Storage from './Storage.js';
import TweenJS from '@tweenjs/tween.js';
import {arrayCache} from './utils/array.js';
import config from 'config';
import sayHello from './sayHello.js';

export default (function () {
    var XMLHttpRequest = window.XMLHttpRequest,
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
                        platypus.debug.warn('Error parsing "' + path + '": ' + e.message);
                    }
                } else {
                    platypus.debug.warn('Error opening "' + path + '": ' + xhr.description);
                }
                
                callback(obj);
            };
            xhr.send();
        },
        loadJSONLinks = function (obj, callback) {
            var i = 0,
                key = '',
                callbacks = 0,
                resolve = function () {
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
        load = function (scene, data) {
            var id = '',
                sceneInstance = null;
            
            if (!scene) {
                platypus.debug.warn('Game: A scene id or scene definition must be provided to load a scene.');
                return;
            } else if (typeof scene === 'string') {
                if (!this.scenes[scene]) {
                    platypus.debug.warn('Game: A scene with the id "' + scene + '" has not been defined in the game settings.');
                    return;
                }
                this.scenes[scene].data = data; //sets data to send to next scene.
                id = scene;
            } else {
                id = scene.id = scene.id || "new-scene";
                sceneInstance = new Scene(new Container(), scene);
                sceneInstance.data = data;
                this.scenes[id] = sceneInstance;
                this.stage.addChild(sceneInstance.panel);
            }

            if (this.isTransitioning) {
                return;
            }

            this.outgoingScene = this.currentScene;
            this.incomingScene = this.scenes[id];

            if (!this.outgoingScene) {
                this.incomingScene.trigger('load-scene', () => {
                    this.incomingScene.trigger('show-scene');
                });
            } else {
                this.outgoingScene.trigger('exit-scene', () => {
                    this.incomingScene.trigger('load-scene', () => {
                        this.incomingScene.trigger('show-scene');
                    });
                });
            }
        },
        setUpFPS = function (ticker, canvas) {
            var framerate = document.createElement("div"),
                framerateTimer = 0;

            framerate.id = "framerate";
            framerate.innerHTML = "FPS: 00.000";
            canvas.parentNode.insertBefore(framerate, canvas);

            ticker.add(function () {
                framerateTimer += this.deltaMS;

                // Only update the framerate every second
                if (framerateTimer >= 1000) {
                    framerate.innerHTML = "FPS: " + this.FPS.toFixed(3);
                    framerateTimer = 0;
                }
            }.bind(ticker));
        };

    class Game extends Messenger {
        constructor (definition, options, onFinishedLoading) {
            var displayOptions = options.display || {},
                load = function (displayOptions, settings) {
                    var id = '',
                        scene  = '',
                        scenes = {},
                        ticker = Ticker.shared;
                        
                    platypus.game = this; //Make this instance the only Game instance.
                    
                    this.currentScene = null;
                    this.settings = settings;
                    this.stage = new Container();
                    this.renderer = new Renderer({
                        width: this.canvas.width,
                        height: this.canvas.height,
                        view: this.canvas,
                        transparent: !!displayOptions.transparent,
                        antialias: !!displayOptions.antiAlias,
                        preserveDrawingBuffer: !!displayOptions.preserveDrawingBuffer,
                        clearBeforeRender: !!displayOptions.clearView,
                        backgroundColor: displayOptions.backgroundColor || 0,
                        autoResize: false
                    });
                    this.scaleManager = new ScaleManager({
                        width: this.canvas.width,
                        height: this.canvas.height
                    });
                    this.scaleManager.enable(({width, height/*, ratio*/}) => {
                        var renderer = this.renderer;

                        renderer.resize(width, height);
                        renderer.render(this.stage); // to prevent flickering from canvas adjustment.
                    });

                    // Create Game Scenes.
                    for (scene in settings.scenes) {
                        if (settings.scenes.hasOwnProperty(scene)) {
                            id = settings.scenes[scene].id = settings.scenes[scene].id || scene;
                            scenes[id] = new Scene(new Container(), settings.scenes[scene]);
                        }
                    }
                    this.scenes = scenes;
                    
                    if (onFinishedLoading) {
                        onFinishedLoading(this);
                    }

                    if (!settings.hideHello) {
                        sayHello(this);
                    }

                    platypus.debug.general("Game config loaded.", settings);

                    //Add Debug tools
                    window.getEntityById = function (id) {
                        return this.getEntityById(id);
                    }.bind(this);
    
                    window.getEntitiesByType = function (type) {
                        return this.getEntitiesByType(type);
                    }.bind(this);
                    
                    window.getVisibleSprites = function (c, a) {
                        var i = 0;
                        
                        a = a || arrayCache.setUp();
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

                    this.ticker = ticker;
                    this.tickInstance = this.tick.bind(this, ticker, {
                        delta: 0, // standard, backwards-compatible parameter for `deltaMS`
                        deltaMS: 0, // MS from last frame (matches above)
                        deltaTime: 0 // PIXI ticker frame value
                    });

                    // START GAME!
                    ticker.add(this.tickInstance);
                    this.paused = false;

                    if (config.dev) {
                        setUpFPS(ticker, this.canvas);
                    }
                };
            
            super();

            if (!definition) {
                platypus.debug.warn('No game definition is supplied. Game not created.');
                return;
            }

            this.options = options;

            // Get or set canvas.
            if (options.canvasId) {
                this.canvas = window.document.getElementById(options.canvasId);
            }
            if (!this.canvas) {
                this.canvas = window.document.createElement('canvas');
                window.document.body.appendChild(this.canvas);
                if (options.canvasId) {
                    this.canvas.setAttribute('id', options.canvasId);
                }
            }
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;

            this.springroll = (function () {
                const
                    springroll = new Application({
                        features: options.features || {
                            sfx: true,
                            vo: true,
                            music: true,
                            sound: true
                        }
                    }),
                    state = springroll.state;

                state.pause.subscribe(function (current) {
                    if (current) {
                        if (!this.paused) {
                            this.ticker.remove(this.tickInstance);
                            this.paused = true;
                            Sound.pauseAll();
                        }
                    } else {
                        if (this.paused) {
                            this.ticker.add(this.tickInstance);
                            this.paused = false;
                            Sound.resumeAll();
                        }
                    }
                }.bind(this));
                
                state.soundVolume.subscribe(function (current) {
                    /* SR seems to trigger this too aggressively. We rely on the others instead.
                    if (current) {
                        Sound.muteAll();
                    } else {
                        Sound.unmuteAll();
                    } */
                });
                
                state.musicVolume.subscribe((current) => {
                    if (current) {
                        this.triggerOnChildren('mute-music');
                    } else {
                        this.triggerOnChildren('unmute-music');
                    }
                });
                
                state.voVolume.subscribe(function (current) {
                    // toggleChannelMute('vo', 'mutedBySR', 'mutedBySRGlobal', current);
                    // toggleChannelMute('tutorial', 'mutedBySR', 'mutedBySRGlobal', current);
                });
                
                state.sfxVolume.subscribe(function (current) {
                    // toggleChannelMute('sfx', 'mutedBySR', 'mutedBySRGlobal', current);
                });

                this.storage = new Storage(springroll, options);

                return springroll;
            }.bind(this))();

            if (typeof definition === 'string') {
                loadJSONLinks(definition, load.bind(this, displayOptions));
            } else {
                load.bind(this)(displayOptions, definition);
            }
        }
        
        /**
        * This method causes the game to tick once. It's called by the SpringRoll Application.
        *
        * @method tick
        * @param tickMessage {Object} Event tracking tick data.
        * @param ticker {PIXI.Ticker} The ticker being used to set the game tick.
        * @param deltaTime {number} The time elapsed since the last tick.
        **/
        tick (ticker, tickMessage, deltaTime) {
            tickMessage.delta = tickMessage.deltaMS = ticker.deltaMS;
            tickMessage.deltaTime = deltaTime;

            TweenJS.update();
            this.triggerOnChildren('tick', tickMessage);
            this.renderer.render(this.stage);
        }

        /**
        * This method triggers an event on the scene if there is a current scene.
        *
        * @method triggerEventOnChildren
        **/
        triggerOnChildren (...args) {
            if (this.currentScene) {
                this.currentScene.triggerOnChildren(...args);
            }
        }
        
        /**
        * Loads a scene.
        *
        * @method loadScene
        * @param sceneId {String} The scene to load.
        * @param transition="instant" {String} What type of transition to make. Currently there are: 'fade-to-black', 'crossfade', and 'instant'.
        * @param data {Object} A list of key/value pairs describing options or settings for the loading scene.
        * @param preloading=false {boolean} Whether the scene should appear immediately or just be loaded and not shown.
        **/
        loadScene (scene, data) {
            // Delay load so it doesn't end a scene mid-tick.
            window.setTimeout(load.bind(this, scene, data), 1);
        }
        
        /**
        * This method will return the first entity it finds with a matching id.
        *
        * @method getEntityById
        * @param {string} id The entity id to find.
        * @return {platypus.Entity} Returns the entity that matches the specified entity id.
        **/
        getEntityById (id) {
            if (this.currentScene) {
                return this.currentScene.getEntityById(id);
            } else {
                return null;
            }
        }

        /**
        * This method will return all game entities that match the provided type.
        *
        * @method getEntitiesByType
        * @param {String} type The entity type to find.
        * @return entities {Array} Returns the entities that match the specified entity type.
        **/
        getEntitiesByType (type) {
            if (this.currentScene) {
                return this.currentScene.getEntitiesByType(type);
            } else {
                return arrayCache.setUp();
            }
        }
        
        /**
        * This method destroys the game.
        *
        * @method destroy
        **/
        destroy () {
        }
    }
    
    return Game;
}());