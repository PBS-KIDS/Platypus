/**
 * This component loads a list of assets, wrapping [PreloadJS](http://www.createjs.com/Docs/PreloadJS/modules/PreloadJS.html) or [SpringRoll](http://springroll.github.io/SpringRoll/classes/springroll.Loader.html)loading functionality into a game engine component.
 *
 * @namespace platypus.components
 * @class AssetLoader
 * @uses Component
 */
/*global console, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var checkPush  = function (asset, list) {
            var i = 0,
                found = false;
    
            for (i = 0; i < list.length; i++) {
                if (list[i].id === asset.id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                list.push(asset);
            }
        },
        createJSInterface = function (resp) {
            return {
                id:    resp.item.id,
                data:  resp.item.data,
                asset: resp.result
            };
        },
        springRollInterface = function (resp) {
            return {
                id:    resp.manifestData.id,
                data:  resp.manifestData.data,
                asset: resp.content
            };
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
            cache: true,
            
            /**
             * Whether images are loaded from a CORS-enabled domain.
             * 
             * @property crossOrigin
             * @type String
             * @default ""
             */
            crossOrigin: '',
            
            /**
             * Whether to use XHR for asset downloading.
             * 
             * @property useXHR
             * @type boolean
             * @default true
             */
            useXHR: true
        },

        constructor: function (definition) {
            if (!this.assets) {
                this.assets = platypus.game.settings.assets;
            }
            
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
                var self = this,
                    onFileLoad = function (resp) {
                        var item = self.assetInterface(resp),
                            asset = self.owner.assets[item.id] = {
                                data:  item.data,
                                asset: item.asset
                            };
                        
                        if (self.cache) {
                            platypus.assets[item.id] = asset;
                        }
                        
                        self.progress += 1;
                        
                        /**
                         * This message is broadcast when an asset has been loaded.
                         * 
                         * @event 'file-load'
                         * @param load {Object} 
                         * @param load.asset {Object} Loaded asset.
                         * @param load.data {Object} Key/value pairs containing asset data. 
                         * @param load.complete {boolean} Whether this is the final asset to be loaded.
                         * @param load.total {number} The total number of assets being loaded.
                         * @param load.progress {number} The number of assets finished loading.
                         * @param load.fraction {number} Value of (progress / total) provided for convenience.
                         */
                        self.owner.trigger('file-load', {
                            asset:    item.asset,
                            complete: (self.progress === self.total),
                            data:     item.data,
                            fraction: self.progress / self.total,
                            progress: self.progress,
                            total:    self.total
                        });
                        
                        if (self.progress === self.total) {
                            /**
                             * This message is triggered when the asset loader is finished loading assets.
                             * 
                             * @event 'complete'
                             */
                            self.owner.triggerEvent('complete');
                        }
                    };
                
                if (window.springroll && window.springroll.Application && window.springroll.Application.instance) {
                    this.springRollLoad(onFileLoad);
                } else if (window.createjs && window.createjs.LoadQueue) {
                    this.createJSLoad(onFileLoad);
                } else {
                    console.warn('AssetLoader: Must have SpringRoll or PreloadJS loaded to load assets.');
                }
            }
        },
        
        methods: {
            destroy: function () {
                delete this.owner.assets;
            },
            
            createJSLoad: function (onFileLoad) {
                var i = 0,
                    loadAssets = [],
                    loader = new window.createjs.LoadQueue(this.useXHR, "", this.crossOrigin);

                this.assetInterface = createJSInterface;
                
                loader.addEventListener('fileload', onFileLoad);

                for (i = 0; i < this.assets.length; i++) {
                    if (typeof this.assets[i].src === 'string') {
                        checkPush(this.assets[i], loadAssets);
                    }
                }

                if (window.createjs.Sound) {
                    loader.installPlugin(window.createjs.Sound);
                }
                platypus.assets = platypus.assets || {};
                this.total = loadAssets.length;
                loader.loadManifest(loadAssets);
            },
            
            springRollLoad: function (onFileLoad) {
                var i = 0,
                    loadAssets = [],
                    loader = window.springroll.Application.instance.loader;

                this.assetInterface = springRollInterface;
                
                for (i = 0; i < this.assets.length; i++) {
                    if (typeof this.assets[i].src === 'string') {
                        checkPush(this.assets[i], loadAssets);
                    }
                }

                platypus.assets = platypus.assets || {};
                this.total = loadAssets.length;
                for (i = 0; i < loadAssets.length; i++) {
                    loader.load(loadAssets[i].src, onFileLoad, null, 0, loadAssets[i]);
                }
            }
        }
    });
}());
