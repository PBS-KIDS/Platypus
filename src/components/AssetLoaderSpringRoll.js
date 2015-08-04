/**
 * This component loads a list of assets, wrapping [SpringRoll](http://www.createjs.com/Docs/PreloadJS/modules/PreloadJS.html) loading functionality into a game engine component.
 *
 * @namespace platypus.components
 * @class AssetLoaderSpringRoll
 * @uses Component
 */
/*global springroll, platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'AssetLoaderSpringRoll',
        
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
             * A DOM element id for an element that should be updated as assets are loaded.
             * 
             * @property progressBar
             * @type String
             * @default ""
             */
            progressBar: '',
            
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
                var i          = 0,
                    self       = this,
                    loader     = null,
                    loadAssets = [],
                    checkPush  = function (asset, list) {
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
                    fileloadfunc = function (item) {
                        var asset = self.owner.assets[item.manifestData.id] = {
                            data:  item.manifestData.data,
                            asset: item.content
                        };
                        
                        if (self.cache) {
                            platypus.assets[item.manifestData.id] = asset;
                        }
                        
                        self.progress += 1;
                        
                        /**
                         * This message is broadcast when an asset has been loaded.
                         * 
                         * @event 'fileload'
                         * @param load {Object} 
                         * @param load.asset {Object} Loaded asset.
                         * @param load.data {Object} Key/value pairs containing asset data. 
                         * @param load.complete {boolean} Whether this is the final asset to be loaded.
                         * @param load.total {number} The total number of assets being loaded.
                         * @param load.progress {number} The number of assets finished loading.
                         * @param load.fraction {number} Value of (progress / total) provided for convenience.
                         */
                        self.owner.trigger('fileload', {
                            asset:    item.content,
                            complete: (self.progress === self.total),
                            data:     item.manifestData.data,
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
                
                if (springroll && springroll.Application && springroll.Application.instance) {
                    loader = springroll.Application.instance.loader;

                    for (i = 0; i < this.assets.length; i++) {
                        if (typeof this.assets[i].src === 'string') {
                            checkPush(this.assets[i], loadAssets);
                        }
                    }
    
                    platypus.assets = platypus.assets || {};
                    this.total = loadAssets.length;
                    for (i = 0; i < loadAssets.length; i++) {
                        loader.load(loadAssets[i].src, fileloadfunc, null, 0, loadAssets[i]);
                    }
                }
            },

            /**
             * This message used to update a progress bar if one has been defined by the component's constructor.
             * 
             * @method 'fileload'
             * @param progress {Object} Key/value pairs describing asset-loading progress.
             * @param progress.fraction {number} Value of (progress / total) is used to set the width of the progress bar element.
             */
            "fileload": function (progress) {
                var pb = null;

                if (this.progressBar) {
                    pb = document.getElementById(this.progressBar);
                    if (pb) {
                        pb = pb.style;

                        pb.width = (progress.fraction * 100) + '%';
                        pb.backgroundSize = ((1 / progress.fraction) * 100) + '%';
                    }
                }
            }
        }
    });
}());
