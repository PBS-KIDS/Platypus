import {arrayCache} from './utils/array.js';
import config from 'config';
import recycle from 'recycle';

export default (function () {
    /**
     * CollisionDataContainer holds lists of CollisionData passed to entities during collisions with other entities. This class is primarily used by the ["HandlerCollision"]("HandlerCollision"%20Component.html) Component to trigger messages on child entities as collisions occur.
     *
     * @memberof platypus
     * @class CollisionDataContainer
     * @return {platypus.CollisionDataContainer} Returns the new aabb object.
     */
    var CollisionDataContainer = function () {
            if (!this.xData && !this.yData) {
                this.xData = arrayCache.setUp();
                this.yData = arrayCache.setUp();
                this.xDeltaMovement = Infinity;
                this.yDeltaMovement = Infinity;
            } else {
                this.reset();
            }
        },
        proto = CollisionDataContainer.prototype;
    
    /**
     * Adds a CollisionData object to the container's X-axis if the movement distance is less than or equal to collision data collected so far.
     *
     * @method platypus.CollisionDataContainer#tryToAddX
     * @param collisionData {platypus.CollisionData} The collision data to add.
     * @return {Boolean} Whether the collision data was added.
     */
    proto.tryToAddX = function (collisionData) {
        if (collisionData.deltaMovement > this.xDeltaMovement) {
            return false;
        } else if (collisionData.deltaMovement < this.xDeltaMovement) {
            this.resetX(collisionData.deltaMovement);
        }

        this.xData.push(collisionData);

        return true;
    };
    
    /**
     * Adds a CollisionData object to the container's Y-axis if the movement distance is less than or equal to collision data collected so far.
     *
     * @method platypus.CollisionDataContainer#tryToAddY
     * @param collisionData {platypus.CollisionData} The collision data to add.
     * @return {Boolean} Whether the collision data was added.
     */
    proto.tryToAddY = function (collisionData) {
        if (collisionData.deltaMovement > this.yDeltaMovement) {
            return false;
        } else if (collisionData.deltaMovement < this.yDeltaMovement) {
            this.resetY(collisionData.deltaMovement);
        }
        
        this.yData.push(collisionData);
        
        return true;
    };
    
    /**
     * Resets the X and Y axes.
     *
     * @method platypus.CollisionDataContainer#reset
     */
    proto.reset = function () {
        this.resetX(Infinity);
        this.resetY(Infinity);
    };
    
    /**
     * Resets the X axis.
     *
     * @param delta {Number} The delta value of the X-axis.
     * @method platypus.CollisionDataContainer#resetX
     */
    proto.resetX = function (delta) {
        var xData = this.xData,
            i = xData.length;
        
        while (i--) {
            xData[i].recycle();
        }
        xData.length = 0;
        this.xDeltaMovement = delta;
    };
    
    /**
     * Resets the Y axis.
     *
     * @param delta {Number} The delta value of the Y-axis.
     * @method platypus.CollisionDataContainer#resetY
     */
    proto.resetY = function (delta) {
        var yData = this.yData,
            i = yData.length;
        
        while (i--) {
            yData[i].recycle();
        }
        yData.length = 0;
        this.yDeltaMovement = delta;
    };
    
    /**
     * Returns an CollisionDataContainer from cache or creates a new one if none are available.
     *
     * @method platypus.CollisionDataContainer.setUp
     * @return {platypus.CollisionDataContainer} The instantiated CollisionDataContainer.
     */
    /**
     * Returns a CollisionDataContainer back to the cache.
     *
     * @method platypus.CollisionDataContainer.recycle
     * @param CollisionDataContainer {platypus.CollisionDataContainer} The CollisionDataContainer to be recycled.
     */
    /**
     * Relinquishes properties of the CollisionDataContainer and recycles it.
     *
     * @method platypus.CollisionDataContainer#recycle
     */
    recycle.add(CollisionDataContainer, 'CollisionDataContainer', CollisionDataContainer, null, true, config.dev);

    return CollisionDataContainer;
}());