import Vector from './Vector.js';
import config from 'config';
import recycle from 'recycle';

export default (function () {
    /**
     * CollisionData holds collision data passed to entities during collisions with other entities. This class is primarily used by the ["HandlerCollision"]("HandlerCollision"%20Component.html) Component to trigger messages on child entities as collision occur.
     *
     * @memberof platypus
     * @class CollisionData
     * @param occurredOrData {Boolean|CollisionData} Whether this represents an actual collision between two shapes. If a CollisionData instance is provided, the instance's full set of values are copied.
     * @param direction {Number} 1 or -1 to define the direction of the collision.
     * @param position {Number} A positive number describing position along the line of collision direction.
     * @param deltaMovement {Number} A positive number describing the magnitude of overlap.
     * @param aABB {platypus.AABB} An AABB of the colliding shape.
     * @param thisShape {platypus.Shape} The moving shape.
     * @param thatShape {platypus.Shape} The stationary shape being collided with.
     * @param vector {platypus.Vector} The vector describing the contact point.
     * @param stuck {Number} The amount of unwarranted overlap if shapes start in a collided position before moving.
     * @return {platypus.CollisionData} Returns the new CollisionData object.
     */
    var CollisionData = function (occurredOrData) {
            if (!this.vector) {
                this.vector = Vector.setUp();
            }
            if (occurredOrData instanceof CollisionData) {
                this.copy(occurredOrData);
            } else {
                this.set.apply(this, arguments);
            }
        },
        proto = CollisionData.prototype;
    
    /**
     * Sets all of the properties of the CollisionData.
     *
     * @method platypus.CollisionData#set
     * @param occurred {Boolean} Whether this represents an actual collision between two shapes.
     * @param direction {Number} 1 or -1 to define the direction of the collision.
     * @param position {Number} A positive number describing position along the line of collision direction.
     * @param deltaMovement {Number} A positive number describing the magnitude of overlap.
     * @param aABB {platypus.AABB} An AABB of the colliding shape.
     * @param thisShape {platypus.Shape} The moving shape.
     * @param thatShape {platypus.Shape} The stationary shape being collided with.
     * @param vector {platypus.Vector} The vector describing the contact point.
     * @param stuck {Number} The amount of unwarranted overlap if shapes start in a collided position before moving.
     */
    proto.set = function (occurred, direction, position, deltaMovement, aABB, thisShape, thatShape, vector, stuck) {
        this.occurred = occurred || false;
        this.direction = direction || null;
        this.position = position || null;
        this.deltaMovement = deltaMovement || null;
        this.aABB = aABB || null;
        this.thisShape = thisShape || null;
        this.thatShape = thatShape || null;
        this.vector.set(vector);
        this.stuck  = stuck || 0;
    };

    /**
     * Sets all of the properties of the CollisionData to match those of the provided CollisionData object.
     *
     * @method platypus.CollisionData#copy
     * @param dataToCopy {CollisionData} The object values to copy.
     */
    proto.copy = function (dataToCopy) {
        this.occurred         = dataToCopy.occurred;
        this.direction         = dataToCopy.direction;
        this.position         = dataToCopy.position;
        this.deltaMovement     = dataToCopy.deltaMovement;
        this.aABB             = dataToCopy.aABB;
        this.thisShape      = dataToCopy.thisShape;
        this.thatShape      = dataToCopy.thatShape;
        this.vector.setVector(dataToCopy.vector);
        this.stuck          = dataToCopy.stuck;
    };

    /**
     * Returns an collisionData from cache or creates a new one if none are available.
     *
     * @method platypus.CollisionData.setUp
     * @return {platypus.CollisionData} The instantiated CollisionData.
     */
    /**
     * Returns a collisionData back to the cache.
     *
     * @method platypus.CollisionData.recycle
     * @param collisionData {platypus.CollisionData} The collisionData to be recycled.
     */
    /**
     * Relinquishes properties of the collisionData and recycles it.
     *
     * @method platypus.CollisionData#recycle
     */
    recycle.add(CollisionData, 'CollisionData', CollisionData, null, true, config.dev);
    
    return CollisionData;
}());