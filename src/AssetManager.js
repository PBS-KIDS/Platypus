/**
 * This class is instantiated by Platypus at `platypus.assetCache` to track assets: loading assets needed for particular layers and unloading assets once they're no longer needed.
 *
 * @memberof platypus
 * @class AssetManager
**/
/* global platypus, setTimeout */
import Data from './Data.js';
import DataMap from './DataMap.js';
import {Loader} from 'pixi.js';
import {arrayCache} from './utils/array.js';

const
    fn = /^(?:\w+:\/{2}\w+(?:\.\w+)*\/?)?(?:[\/.]*?(?:[^?]+)?\/)?(?:([^\/?]+)\.(\w+|{\w+(?:,\w+)*}))(?:\?\S*)?$/,
    folders = {
        png: 'images',
        jpg: 'images',
        jpeg: 'images',
        ogg: 'audio',
        mp3: 'audio',
        m4a: 'audio',
        wav: 'audio'
    },
    formatAsset = function (asset) { //TODO: Make this behavior less opaque.
        const
            path = asset.src || asset,
            match = path.match(fn);
            
        return Data.setUp(
            'id', asset.id || (match ? match[1] : path),
            'src', (platypus.game.options[folders[match[2].toLowerCase()]] || '') + path
        );
    };

export default class AssetManager {
    constructor () {
        this.assets = DataMap.setUp();
        this.counts = Data.setUp();
    }

    /**
     * This method removes an asset from memory if it's the last needed instance of the asset.
     *
     * @method platypus.AssetManager#delete
     * @param {*} id
     * @return {Boolean} Returns `true` if asset was removed from asset cache.
     */
    delete (id) {
        const assets = this.assets;

        if (assets.has(id)) {
            const counts = this.counts;

            counts[id] -= 1;
            if (counts[id] === 0) {
                const asset = assets.get(id);
                
                if (asset && asset.src) {
                    asset.src = '';
                }
                assets.delete(id);
            }

            return !counts[id];
        } else {
            return false;
        }
    }

    /**
     * Returns a loaded instance of a given asset.
     *
     * @method platypus.AssetManager#get
     * @param {*} id
     * @return {Object} Returns the asset if defined.
     */
    get (id) {
        return this.assets.get(id);
    }

    /**
     * Returns id for given path.
     *
     * @method platypus.AssetManager#getFileId
     * @param {*} path
     * @return {String} Returns id generated from path.
     */
    getFileId (path) {
        const match = path.match(fn);

        return match ? match[1] : path;
    }

    /**
     * Returns whether a given asset is currently loaded by the AssetManager.
     *
     * @method platypus.AssetManager#has
     * @param {*} id
     * @return {Object} Returns `true` if the asset is loaded and `false` if not.
     */
    has (id) {
        return this.assets.has(id);
    }

    /**
     * Sets a mapping between an id and a loaded asset. If the mapping already exists, simply increment the count for a given id.
     *
     * @method platypus.AssetManager#set
     * @param {*} id
     * @param {*} value The loaded asset.
     * @param {Number} count The number of assets needed.
     */
    set (id, value, count = 1) {
        const
            assets = this.assets,
            counts = this.counts;

        if (assets.has(id)) {
            counts[id] += count;
        } else {
            assets.set(id, value);
            counts[id] = count;
        }
    }

    /**
     * Loads a list of assets.
     *
     * @method platypus.AssetManager#load
     * @param {Array} list A list of assets to load.
     * @param {Function} one This function is called as each asset is loaded.
     * @param {Function} all This function is called once all assets in the list are loaded.
     */
    load (list, one, all) {
        const
            counts = this.counts,
            needsLoading = arrayCache.setUp(),
            adds = Data.setUp();

        for (let i = 0; i < list.length; i++) {
            const
                item = formatAsset(list[i]),
                id = item.id || item.src || item;

            if (this.has(id)) {
                counts[id] += 1;
            } else if (adds.hasOwnProperty(id)) {
                adds[id] += 1;
            } else {
                adds[id] = 1;
                needsLoading.push(item);
            }
        }

        if (needsLoading.length) {
            const queue = new Loader(),
                total = needsLoading.length;
            let progress = 0;

            queue.onLoad.add((loader, response) => {
                this.set(response.name, response.data, adds[response.name]);
                progress += 1;
                if (one) {
                    one(progress / total);
                }
            });

            if (all) {
                queue.onComplete.add(all);
            }
            
            for (let i = 0; i < total; i++) {
                const
                    item = needsLoading[i],
                    id = item.id || item.src || item;

                queue.add(id, item.src || item, item);
            }

            queue.load();
        } else {
            setTimeout(() => { // To run in same async sequence as above.
                if (one) {
                    one(1);
                }
                if (all) {
                    all();
                }
            }, 1);
        }

        arrayCache.recycle(needsLoading);
    }

    /**
     * Unloads a list of assets. This is identical to passing each item in the list to `.delete()`.
     *
     * @method platypus.AssetManager#unload
     * @param {Array} list A list of assets to unload.
     */
    unload (list) {
        var i = list.length;

        while (i--) {
            this.delete(list[i].id || list[i]);
        }
    }
}
