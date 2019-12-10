/**
 *
 * @namespace platypus
 * @class AssetManager
 * @constructor
**/
import Data from './Data.js';
import DataMap from './DataMap.js';
import {Loader} from 'pixi.js';
import {arrayCache} from './utils/array.js';
        
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
                item = list[i],
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
                one(progress / total);
            });

            queue.onComplete.add(all);
            
            for (let i = 0; i < total; i++) {
                const
                    item = needsLoading[i],
                    id = item.id || item.src || item;

                queue.add(id, item.src || item, item);
            }

            queue.load();
        } else {
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
