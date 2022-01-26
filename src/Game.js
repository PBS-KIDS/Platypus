/* global document, platypus, window */
import {Application, CaptionPlayer, ScaleManager, TextRenderer} from 'springroll';
import {Container, Renderer, Ticker} from 'pixi.js';
import {arrayCache, greenSlice, greenSplice, union} from './utils/array.js';
import Async from './Async.js';
import Data from './Data.js';
import Entity from './Entity.js';
import Messenger from './Messenger.js';
import SFXPlayer from './SFXPlayer.js';
import Sound from 'pixi-sound';
import Storage from './Storage.js';
import TweenJS from '@tweenjs/tween.js';
import VOPlayer from './VOPlayer.js';
import config from 'config';
import sayHello from './sayHello.js';

export default (function () {
    const XMLHttpRequest = window.XMLHttpRequest,
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

    /**
     * This class is used to create the `platypus.game` object and loads the Platypus game as described by the game configuration files.
     *
     * Configuration definition typically takes something like the following structures, but is highly dependent on the particular components used in a given game:
     *
     *     {
     *         "atlases": {}, // Keyed list of Spine atlases.
     *         "captions": {}, // Keyed list of captions for closed captioning.
     *         "entities": {}, // Keyed list of entity definitions.
     *         "levels": {}, // Keyed list of Tiled levels.
     *         "mouthCues": {}, // Keyed list of Rhubarb mouth cues for lip synch.
     *         "scenes": {}, // Keyed list of scene definitions.
     *         "skeletons": {}, // Keyed list of Spine skeletons.
     *         "spriteSheets": {} // Keyed list of sprite sheet definitions.
     *     }
     *
     * Options may include any of these:
     *
     *     {
     *         audio: '', // Relative path to audio assets (like "assets/audio/").
     *         canvasId: '', // HTML element ID for the canvas to draw to. If specified but unfound, will create a canvas with this ID.
     *         display: {}, // Display options are passed directly to PixiJS for setting up the renderer.
     *         features: { // Features supported for the Springroll application. Defaults are listed below.
     *             sfx: true,
     *             vo: true,
     *             music: true,
     *             sound: true,
     *             captions: true
     *         },
     *         images: '', // Relative path to graphical assets (like "assets/images/").
     *         name: '', // Name of game. Used for local storage keys and displayed in the console on run.
     *         storageKeys: [] // Array of keys to create in local storage on first run so game code may assume they exist.
     *         version: '' // Version of the game. This is displayed in the console on run.
     *     }
     *
     * @memberof platypus
     * @extends platypus.Messenger
     */
    class Game extends Messenger {
        /**
         * @constructor
         * @param definition {Object} Collection of configuration settings, typically from config.json.
         * @param options {Object} Options describing the display options, Springroll features, etc.
         * @param [onFinishedLoading] {Function} An optional function to run once the game has begun.
         * @return {platypus.Game} Returns the instantiated game.
         */
        constructor (definition, options, onFinishedLoading) {
            const
                displayOptions = options.display || {},
                load = function (displayOptions, settings) {
                    const
                        dpi = window.devicePixelRatio || 1,
                        ticker = Ticker.shared;
                        
                    platypus.game = this; //Make this instance the only Game instance.
                    
                    if (config.dev) {
                        settings.debug = true;
                    }
                    
                    this.settings = settings;

                    if (settings.captions) {
                        const captionsElement = document.getElementById("captions") || (function (canvas) {
                            const element = document.createElement('div');
                            
                            element.setAttribute('id', 'captions');
                            canvas.parentNode.insertBefore(element, canvas);
                            return element;
                        }(this.canvas));
                        this.voPlayer.captions = new CaptionPlayer(settings.captions, new TextRenderer(captionsElement));
                    }

                    this.stage = new Container();
                    this.stage.sortableChildren = true;
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

                    if (displayOptions.aspectRatio) { // Aspect ratio may be a single value like "4:3" or "4:3-2:1" for a range
                        const
                            aspectRatioRange = displayOptions.aspectRatio.split('-'),
                            ratioArray1 = aspectRatioRange[0].split(':'),
                            ratioArray2 = aspectRatioRange[aspectRatioRange.length - 1].split(':'),
                            ratio1 = ratioArray1[0] / ratioArray1[1],
                            ratio2 = ratioArray2[0] / ratioArray2[1],
                            smallRatio = Math.min(ratio1, ratio2),
                            largeRatio = Math.max(ratio1, ratio2);

                        this.scaleManager = new ScaleManager(({width, height/*, ratio*/}) => {
                            const
                                renderer = this.renderer,
                                frame = document.getElementById('content'),
                                newHeight = (width / smallRatio) >> 0,
                                newWidth = (height * largeRatio) >> 0;
                            let h = height * dpi,
                                w = width * dpi;
                
                            if (height > newHeight) {
                                frame.style.height = newHeight + 'px';
                                frame.style.top = (((height - newHeight) / 2) >> 0) + 'px';
                                frame.style.width = '';
                                frame.style.left = '';
                                h = newHeight * dpi;
                            } else if (width > newWidth) {
                                frame.style.width = newWidth + 'px';
                                frame.style.left = (((width - newWidth) / 2) >> 0) + 'px';
                                frame.style.height = '';
                                frame.style.top = '';
                                w = newWidth * dpi;
                            } else {
                                frame.style.height = '';
                                frame.style.top = '';
                                frame.style.width = '';
                                frame.style.left = '';
                            }

                            renderer.resize(w, h);
                            renderer.render(this.stage); // to prevent flickering from canvas adjustment.
                        });
                    } else {
                        this.scaleManager = new ScaleManager(({width, height/*, ratio*/}) => {
                            const
                                renderer = this.renderer;

                            renderer.resize(width * dpi, height * dpi);
                            renderer.render(this.stage); // to prevent flickering from canvas adjustment.
                        });
                    }
                    this.scaleManager.onResize({ // Run once to resize content div.
                        width: window.innerWidth,
                        height: window.innerHeight
                    });

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
                        deltaTime: 0, // PIXI ticker frame value
                        elapsed: 0 // MS since game start (minus pauses)
                    });

                    // START GAME!
                    ticker.add(this.tickInstance);
                    this.paused = false;

                    if (config.dev) {
                        setUpFPS(ticker, this.canvas);
                    }
                };
            let canvas = null;
            
            super();

            if (!definition) {
                platypus.debug.warn('No game definition is supplied. Game not created.');
                return;
            }

            this.options = options;

            // Get or set canvas.
            if (options.canvasId) {
                canvas = window.document.getElementById(options.canvasId);
            }
            if (!canvas) {
                canvas = window.document.createElement('canvas');
                window.document.body.appendChild(canvas);
                if (options.canvasId) {
                    canvas.setAttribute('id', options.canvasId);
                }
            }
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Fix for MS Edge so that "no-drag" icon doesn't appear on drag.
            canvas.ondragstart = function () {
                return false;
            };

            this.canvas = canvas;

            this.voPlayer = new VOPlayer(this, platypus.assetCache);
            this.voPlayer.trackSound = platypus.supports.iOS;

            this.sfxPlayer = new SFXPlayer();
            this.musicPlayer = new SFXPlayer();
            
            this.springroll = (function () {
                const
                    springroll = new Application({
                        features: options.features || {
                            sfx: true,
                            vo: true,
                            music: true,
                            sound: true,
                            captions: true
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
                
                state.soundVolume.subscribe(function () {
                    /* SR seems to trigger this too aggressively, in that it already calls mute/unmute on the comprising sfx/music/vo channels. We rely on the others instead. */
                });
                
                state.musicVolume.subscribe((current) => {
                    platypus.game.musicPlayer.setVolume(current);
                });
                
                state.voVolume.subscribe(function (current) {
                    platypus.game.voPlayer.setVolume(current);
                });

                state.captionsMuted.subscribe(function (current) {
                    platypus.game.voPlayer.setCaptionMute(current);
                });
                
                state.sfxVolume.subscribe(function (current) {
                    platypus.game.sfxPlayer.setVolume(current);
                });

                this.storage = new Storage(springroll, options);

                return springroll;
            }.bind(this))();

            this.layers = arrayCache.setUp();
            this.sceneLayers = arrayCache.setUp();
            this.loading = arrayCache.setUp();
            this.loadingQueue = arrayCache.setUp();

            if (typeof definition === 'string') {
                loadJSONLinks(definition, load.bind(this, displayOptions));
            } else {
                load.bind(this)(displayOptions, definition);
            }
        }
        
        /**
         * This method causes the game to tick once.
         *
         * @param ticker {PIXI.Ticker} The ticker being used to set the game tick.
         * @param tickMessage {Object} Event tracking tick data.
         * @param deltaTime {number} The time elapsed since the last tick.
         * @fires platypus.Game#tick
         * @fires platypus.Entity#tick
         **/
        tick (ticker, tickMessage, deltaTime) {
            const loading = this.loading;

            tickMessage.delta = tickMessage.deltaMS = ticker.deltaMS;
            tickMessage.deltaTime = deltaTime;
            tickMessage.elapsed += ticker.deltaMS;

            // If layers need to be loaded, load them!
            if (loading.length) {
                for (let i = 0; i < loading.length; i++) {
                    loading[i]();
                }
                loading.length = 0;
            }

            TweenJS.update();

            /**
             * This event is triggered on the game as well as each layer currently loaded.
             *
             * @event platypus.Game#tick
             * @param tickMessage {Object} Event tracking tick data. This object is re-used for subsequent ticks.
             * @param tickMessage.delta {Number} Time in MS passed since last tick.
             * @param tickMessage.elapsed {Number} Time in MS passed since game load.
             */
            this.triggerEvent('tick', tickMessage);
            /**
             * This event is triggered on the game as well as each layer currently loaded.
             *
             * @event platypus.Entity#tick
             * @param tickMessage {Object} Event tracking tick data. This object is re-used for subsequent ticks.
             * @param tickMessage.delta {Number} Time in MS passed since last tick.
             * @param tickMessage.elapsed {Number} Time in MS passed since game load.
             */
            this.triggerOnChildren('tick', tickMessage);
            this.renderer.render(this.stage);
        }

        /**
         * This method is used by external objects to trigger messages on the layers as well as internal entities broadcasting messages across the scope of the scene.
         *
         * @param {String} eventId This is the message to process.
         * @param {*} event This is a message object or other value to pass along to component functions.
         **/
        triggerOnChildren (...args) {
            const layers = this.layers;

            for (let i = 0; i < layers.length; i++) {
                layers[i].trigger(...args);
            }
        }
        
        /**
         * Loads one or more layers.
         *
         * If one layer is specified, it will complete loading if no other layers are already loading. If other layers are presently loading, it will complete as soon as other layers are complete.
         *
         * If an array of layers is specified, all layers must finish loading before any receive a completion event.
         *
         * @param layerId {Array|String} The layer(s) to load.
         * @param data {Object} A list of key/value pairs describing options or settings for the loading scene.
         * @param isScene {Boolean} Whether the layers from a previous scene should be replaced by these layers.
         * @param progressIdOrFunction {String|Function} Whether to report progress. A string sets the id of progress events whereas a function is called directly with progress.
         * @fires platypus.Entity#layer-unloaded
         * @fires platypus.Entity#unload-layer
         * @fires platypus.Entity#layer-loaded
         * @fires platypus.Entity#layer-live
        **/
        load (layerId, data, isScene, progressIdOrFunction) {
            this.loadingQueue.push(layerId);
            // Delay load so it doesn't begin a scene mid-tick.
            this.loading.push(() => {
                const
                    layers = Array.isArray(layerId) ? greenSlice(layerId) : arrayCache.setUp(layerId),
                    assets = arrayCache.setUp(),
                    properties = arrayCache.setUp(),
                    loader = arrayCache.setUp((callback) => {
                        const
                            queue = this.loadingQueue,
                            index = queue.indexOf(layerId);

                        // Make sure previous layers have already gone live.
                        if (index === 0) {
                            queue.shift();
                            callback();
                            while (typeof queue[0] === 'function') {
                                const prevCallback = queue[0];
                                queue.shift();
                                prevCallback();
                            }
                        } else { // Not the next in line, so we'll handle this later. (ie bracket above on another group of layers completion)
                            queue[index] = callback;
                        }
                    }),
                    getDefinition = (layer) => {
                        const id = layer ? layer.type || layer : null;

                        let layerDefinition = null;
                        
                        if (!id) {
                            platypus.debug.warn('Game: A layer id or layer definition must be provided to load a layer.');
                            return null;
                        } else if (typeof id === 'string') {
                            if (!this.settings.entities[id]) {
                                platypus.debug.warn('Game: A layer with the id "' + id + '" has not been defined in the game settings.');
                                return null;
                            }
                            layerDefinition = this.settings.entities[id];
                        } else {
                            layerDefinition = layer;
                        }

                        return layerDefinition;
                    },
                    loadAssets = function (layerDefinitions, properties, data, assetLists, progressCallback, completeCallback) {
                        const assets = arrayCache.setUp();
        
                        for (let i = 0; i < layerDefinitions.length; i++) {
                            const
                                props = Data.setUp(properties[i]),
                                arr = assetLists[i] = Entity.getAssetList(layerDefinitions[i], props, data);

                            for (let j = 0; j < arr.length; j++) {
                                assets.push(arr[j]); // We don't union so that we can remove individual layers as needed and their asset dependencies.
                            }
                            props.recycle();
                        }

                        platypus.assetCache.load(assets, progressCallback, completeCallback);
                    },
                    loadLayer = function (layers, assetLists, index, layerDefinition, properties, data, completeCallback) {
                        const props = Data.setUp(properties);
        
                        props.stage = this.stage;
                        props.parent = this;

                        if (layerDefinition) { // Load layer
                            const
                                holds = Data.setUp('count', 1, 'release', () => {
                                    holds.count -= 1;
                                    if (!holds.count) { // All holds have been released
                                        holds.recycle();
                                        
                                        completeCallback();
                                    }
                                }),
                                layer = new Entity(layerDefinition, {
                                    properties: props
                                }, (entity) => {
                                    layers[index] = entity;
                                    holds.release();
                                });
        
                            layer.unloadLayer = () => {
                                const
                                    release = () => {
                                        holds -= 1;
                                        if (holds === 0) {
                                            // Delay load so it doesn't end a layer mid-tick.
                                            window.setTimeout(() => {
                                                /**
                                                 * This event is triggered on the layers once the Scene is over.
                                                 *
                                                 * @event platypus.Entity#layer-unloaded
                                                 */
                                                layer.triggerEvent('layer-unloaded');
    
                                                platypus.debug.olive('Layer unloaded: ' + layer.id);
                                    
                                                greenSplice(this.layers, this.layers.indexOf(layer));
    
                                                layer.destroy();
                                                platypus.assetCache.unload(assetLists[index]);
                                                arrayCache.recycle(assetLists[index]);
                                            }, 1);
                                        }
                                    };
                                let holds = 1;
    
                                /**
                                 * This event is triggered on the layer to allow children of the layer to place a hold on the closing until they're ready.
                                 *
                                 * @event platypus.Entity#unload-layer
                                 * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
                                 * @param hold {Function} Calling this function places a hold; `release` must be called to release this hold and unload the layer.
                                 * @param release {Function} Calling this function releases a previous hold.
                                 */
                                layer.triggerEvent('unload-layer', () => {
                                    holds += 1;
                                }, release);
    
                                platypus.debug.olive('Layer unloading: ' + layer.id);
                                release();
                            };
                            
                            /**
                             * This event is triggered on the layers once all assets have been readied and the layer is created.
                             *
                             * @event platypus.Entity#layer-loaded
                             * @param persistentData {Object} Data passed from the last scene into this one.
                             * @param persistentData.level {Object} A level name or definition to load if the level is not already specified.
                             * @param holds {platypus.Data} An object that handles any holds on before making the scene live.
                             * @param holds.count {Number} The number of holds to wait for before triggering "scene-live"
                             * @param holds.release {Function} The method to trigger to let the scene loader know that one hold has been released.
                             */
                            layer.triggerEvent('layer-loaded', data, holds);
                        }
                    },
                    progressHandler = progressIdOrFunction ? ((typeof progressIdOrFunction === 'string') ? function (progress, ratio) {
                        progress.progress = ratio;
                        this.triggerOnChildren('load-progress', progress);
                    }.bind(this, Data.setUp(
                        'id', progressIdOrFunction,
                        'progress', 0
                    )) : progressIdOrFunction) : null;

                for (let i = 0; i < layers.length; i++) {
                    const
                        layer = layers[i],
                        layerDefinition = getDefinition(layer),
                        layerProps = (layer && layer.type && layer.properties) || null;

                    loader.push(loadLayer.bind(this, layers, assets, i, layerDefinition, layerProps, data));
                    layers[i] = layerDefinition;
                    properties[i] = layerProps;
                }

                loadAssets(layers, properties, data, assets, progressHandler, () => {
                    Async.setUp(loader, () => {
                        for (let i = 0; i < layers.length; i++) {
                            const layer = layers[i];

                            this.layers.push(layer);

                            if (isScene) {
                                this.sceneLayers.push(layer);
                            }

                            platypus.debug.olive('Layer live: ' + layer.id);
    
                            /**
                             * This event is triggered on each newly-live layer once it is finished loading and ready to display.
                             *
                             * @event platypus.Entity#layer-live
                             * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
                             */
                            layer.triggerEvent('layer-live', data);
                        }
                    });
                });
            });
        }

        /**
         * Loads a scene.
         *
         * @param layersOrId {Array|Object|String} The list of layers, an object with a `layers` Array property, or scene id to load.
         * @param data {Object} A list of key/value pairs describing options or settings for the loading scene.
         * @param progressIdOrFunction {String|Function} Whether to report progress. A string sets the id of progress events whereas a function is called directly with progress.
         **/
        loadScene (layersOrId, data, progressIdOrFunction = 'scene') {
            const sceneLayers = this.sceneLayers;
            let layers = layersOrId;
            
            if (typeof layers === 'string') {
                layers = this.settings.scenes && this.settings.scenes[layers];
            }

            if (!layers) {
                platypus.debug.warn('Game: "' + layersOrId + '" is an invalid scene.');
                return;
            }

            if (layers.layers) { // Object containing a list of layers.
                layers = layers.layers;
            }
            
            while (sceneLayers.length) {
                this.unload(sceneLayers[0]);
            }

            this.load(layers, data, true, progressIdOrFunction);
        }
        
        /**
         * Unloads a layer.
         *
         * @param layer {String|Object} The layer to unload.
        **/
        unload (layer) {
            let layerToUnload = layer,
                sceneIndex = 0;

            if (typeof layerToUnload === 'string') {
                for (let i = 0; i < this.layers.length; i++) {
                    if (this.layers[i].type === layerToUnload) {
                        layerToUnload = this.layers[i];
                        break;
                    }
                }
            }

            sceneIndex = this.sceneLayers.indexOf(layerToUnload); // remove scene entry if it exists
            if (sceneIndex >= 0) {
                greenSplice(this.sceneLayers, sceneIndex);
            }

            layerToUnload.unloadLayer();
        }
        
        /**
         * This method will return the first entity it finds with a matching id.
         *
         * @param {string} id The entity id to find.
         * @return {Entity} Returns the entity that matches the specified entity id.
         **/
        getEntityById (id) {
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
            return null;
        }

        /**
         * This method will return all game entities that match the provided type.
         *
         * @param {String} type The entity type to find.
         * @return entities {Array} Returns the entities that match the specified entity type.
         **/
        getEntitiesByType (type) {
            var i = 0,
                selection = null,
                entities  = arrayCache.setUp();
            
            for (i = 0; i < this.layers.length; i++) {
                if (this.layers[i].type === type) {
                    entities.push(this.layers[i]);
                }
                if (this.layers[i].getEntitiesByType) {
                    selection = this.layers[i].getEntitiesByType(type);
                    union(entities, selection);
                    arrayCache.recycle(selection);
                }
            }
            return entities;
        }
        
        /**
        * This method destroys the game.
        *
        **/
        destroy () {
            const layers = this.layers;

            for (let i = 0; i < layers.length; i++) {
                layers[i].destroy();
            }
            layers.recycle();
        }
    }
    
    return Game;
}());