import {arrayCache, greenSplice} from './utils/array';
import Data from './Data';
import DataMap from './DataMap';
import config from 'config';
import recycle from 'recycle';

export default (function () {
    var
        /**
         * This class defines a linker for TiledLoader to connect entity pointer properties as soon as both entities are created.
         *
         * @memberof platypus
         * @class EntityLinker
         * @return {EntityLinker} Returns the new EntityLinker object.
         */
        EntityLinker = function () {
            this.ids = this.ids || arrayCache.setUp();
            this.entities = this.entities || DataMap.setUp();
            this.currentId = 0;
            this.count = 1;
        },
        proto = EntityLinker.prototype;
    
    proto.attemptRecycle = function () {
        this.count -= 1;
        if (this.count === 0) {
            this.recycle();
        }
    };

    proto.linkObject = function (id) {
        this.currentId = id;
        this.count += 1;
    };

    proto.linkEntity = function (entity) {
        const
            id = entity.tiledId,
            list = this.ids;
        let i = list.length;

        while (i--) {
            const
                item = list[i];
            let updated = false;

            if (item.onEntity === entity.tiledId) {
                item.onEntity = entity;
                updated = true;
            }
            if (item.toEntity === entity.tiledId) {
                item.toEntity = entity;
                updated = true;
            }
            if (updated && typeof item.onEntity === 'object' && typeof item.toEntity === 'object') {
                item.onEntity[item.property] = item.toEntity;
                item.recycle();
                greenSplice(list, i);
            }
        }

        this.entities[id] = entity;
        this.attemptRecycle();
    };

    proto.getEntity = function (id, property) {
        const entity = this.entities[id];

        if (entity) {
            return entity;
        } else {
            this.ids.push(Data.setUp(
                'onEntity', this.currentId,
                'toEntity', id,
                'property', property
            ));
            return null;
        }
    };
    
    /**
     * Returns EntityLinker from cache or creates a new one if none are available.
     *
     * @method platypus.EntityLinker.setUp
     * @return {platypus.EntityLinker} The instantiated EntityLinker.
     */
    /**
     * Returns EntityLinker back to the cache. Prefer the EntityLinker's recycle method since it recycles property objects as well.
     *
     * @method platypus.EntityLinker.recycle
     * @param {platypus.EntityLinker} The EntityLinker to be recycled.
     */
    /**
     * Relinquishes EntityLinker properties and recycles it.
     *
     * @method platypus.EntityLinker#recycle
     */
    recycle.add(EntityLinker, 'EntityLinker', EntityLinker, function () {
        const
            entities = this.entities,
            ids = this.ids;

        for (const key in entities) {
            if (entities.hasOwnProperty(key)) {
                delete entities[key];
            }
        }
        for (let i = 0; i < ids.length; i++) {
            ids[i].recycle();
        }
        ids.length = 0;
    }, true, config.dev);
    
    return EntityLinker;
}());