/**
 * CollisionDataContainer holds lists of CollisionData passed to entities during collisions with other entities. This class is primarily used by the ["HandlerCollision"]("HandlerCollision"%20Component.html) Component to trigger messages on child entities as collisions occur.
 *
 * @namespace platypus
 * @class CollisionDataContainer
 * @constructor
 * @return {platypus.CollisionDataContainer} Returns the new aabb object.
 */
import config from 'config';
import recycle from 'recycle';

export default (function () {
    var CollisionDataContainer = function () {
            if (!this.xData && !this.yData) {
                this.xData = Array.setUp();
                this.yData = Array.setUp();
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
     * @method tryToAddX
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
     * @method tryToAddY
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
     * @method reset
     */
    proto.reset = function () {
        this.resetX(Infinity);
        this.resetY(Infinity);
    };
    
    /**
     * Resets the X axis.
     *
     * @param delta {Number} The delta value of the X-axis.
     * @method resetX
     * @since 0.8.7
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
     * @method resetY
     * @since 0.8.7
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
     * @method CollisionDataContainer.setUp
     * @return {platypus.CollisionDataContainer} The instantiated CollisionDataContainer.
     * @since 0.8.7
     */
    /**
     * Returns a CollisionDataContainer back to the cache.
     *
     * @method CollisionDataContainer.recycle
     * @param CollisionDataContainer {platypus.CollisionDataContainer} The CollisionDataContainer to be recycled.
     * @since 0.8.7
     */
    /**
     * Relinquishes properties of the CollisionDataContainer and recycles it.
     *
     * @method recycle
     * @since 0.8.7
     */
    recycle.add(CollisionDataContainer, 'CollisionDataContainer', CollisionDataContainer, null, true, config.dev);

    return CollisionDataContainer;
}());