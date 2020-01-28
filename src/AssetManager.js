/**
 *
 * @namespace platypus
 * @class AssetManager
 * @constructor
**/
/* global platypus */
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
        wav: 'audio',
        "{ogg,mp3}": 'audio'
    },
    formatAsset = function (asset) {
        var match = asset.match(fn),
            a = Data.setUp(
                'id', asset,
                'src', (platypus.game.options[folders[match[2].toLowerCase()]] || '') + asset
            );
        
        //TODO: Make this behavior less opaque.
        if (match) {
            a.id = match[1];
        } else {
            platypus.debug.warn('Layer: A listed asset should provide the entire file path.');
        }
        
        return a;
    };

export default class AssetManager {
    constructor () {
        this.assets = DataMap.setUp();
        this.counts = Data.setUp();
    }

    delete (id) {
        const assets = this.assets;

        if (assets.has(id)) {
            this.count -= 1;
            if (this.count === 0) {
                const asset = assets.get(id);
                
                if (asset && asset.src) {
                    asset.src = '';
                }
                assets.delete(id);
            }
        }
    }

    get (id) {
        return this.assets.get(id);
    }

    has (id) {
        return this.assets.has(id);
    }

    set (id, value) {
        const
            assets = this.assets,
            counts = this.counts;

        if (assets.has(id)) {
            counts[id] += 1;
        } else {
            assets.set(id, value);
            counts[id] = 1;
        }
    }

    load (list, one, all) {
        const
            counts = this.counts,
            needsLoading = arrayCache.setUp();

        for (let i = 0; i < list.length; i++) {
            const
                item = formatAsset(list[i]),
                id = item.id || item.src || item;

            if (this.has(id)) {
                counts[id] += 1;
            } else {
                needsLoading.push(item);
            }
        }

        if (needsLoading.length) {
            const queue = new Loader(),
                total = needsLoading.length;
            let progress = 0;

            queue.onLoad.add((loader, response) => {
                this.set(response.name, response.data);
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
        } else if (all) {
            all();
        }

        arrayCache.recycle(needsLoading);
    }

    unload (list) {
        var i = list.length;

        while (i--) {
            this.delete(list[i].id || list[i]);
        }
    }
}
