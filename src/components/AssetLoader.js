/**
 * This component loads a list of assets, wrapping [PreloadJS](http://www.createjs.com/Docs/PreloadJS/modules/PreloadJS.html) functionality into a game engine component.
 *
 * @namespace platypus.components
 * @class AssetLoader
 * @uses Component
 */
/*global createjs, platypus */
(function () {
    "use strict";

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
            
            this.message = {
                complete: false,
                total: 0,
                progress: 0,
                fraction: 0
            };
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
                var i         = '',
                    self      = this,
                    checkPush = function (asset, list) {
                        var key   = '',
                            found = false;

                        for (key in list) {
                            if (list.hasOwnProperty(key)) {
                                if (list[key].id === asset.id) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            list.push(asset);
                        }
                    },
                    loader     = new createjs.LoadQueue(this.useXHR, "", this.crossOrigin),
                    loadAssets = [],
                    fileloadfunc = function (event) {
                        var item   = event.item,
                            data   = item.data,
                            result = event.result;

                        platypus.assets[event.item.id] = {
                            data:  data,
                            asset: result
                        };

                        self.message.progress += 1;
                        self.message.fraction = self.message.progress / self.message.total;
                        if (self.message.progress === self.message.total) {
                            self.message.complete = true;
                        }

                        /**
                         * This message is broadcast when an asset has been loaded.
                         * 
                         * @event 'fileload'
                         * @param complete {boolean} Whether this is the final asset to be loaded.
                         * @param total {number} The total number of assets being loaded.
                         * @param progress {number} The number of assets finished loading.
                         * @param fraction {number} Value of (progress / total) provided for convenience.
                         */
                        self.owner.trigger('fileload', self.message);
                    };

                loader.addEventListener('fileload', fileloadfunc);

                loader.addEventListener('error', function (event) {
                    if (event.item && !event.error) { //Handles this PreloadJS bug: https://github.com/CreateJS/PreloadJS/issues/46
                        event.item.tag.src = event.item.src;
                        fileloadfunc(event);
                    }
                });

                loader.addEventListener('complete', function (event) {
                    setTimeout(function () { // Allow current process to finish before firing completion.

                        /**
                         * This message is triggered when the asset loader is finished loading assets.
                         * 
                         * @event 'complete'
                         */
                        self.owner.triggerEvent('complete');
                    }, 10);
                });

                for (i in this.assets) {
                    if (this.assets.hasOwnProperty(i) && (typeof this.assets[i].src === 'string')) {
                        checkPush(this.assets[i], loadAssets);
                    }
                }

                if (createjs.Sound) {
                    loader.installPlugin(createjs.Sound);
                }
                self.message.total = loadAssets.length;
                loader.loadManifest(loadAssets);
                platypus.assets = {};
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
