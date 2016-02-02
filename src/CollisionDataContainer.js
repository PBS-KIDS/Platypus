/**
 * CollisionData holds collision data passed to entities during collisions with other entities. This class is primarily used by the ["HandlerCollision"]("HandlerCollision"%20Component.html) Component to trigger messages on child entities as collision occur.
 * 
 * @namespace platypus
 * @class CollisionData
 */
/*global platypus */
/*jslint plusplus:true */
platypus.CollisionData = (function () {
    "use strict";
    
    var collisionData = function (occurred, direction, position, deltaMovement, aABB, thisShape, thatShape, vector, stuck) {
            this.occurred = occurred || false;
            this.direction = direction || null;
            this.position = position || null;
            this.deltaMovement = deltaMovement || null;
            this.aABB = aABB || null;
            this.thisShape = thisShape || null;
            this.thatShape = thatShape || null;
            this.vector = vector || null;
            this.stuck  = stuck || 0;
        },
        proto = collisionData.prototype;
    
    proto.copy = function (dataToCopy) {
        this.occurred         = dataToCopy.occurred;
        this.direction         = dataToCopy.direction;
        this.position         = dataToCopy.position;
        this.deltaMovement     = dataToCopy.deltaMovement;
        this.aABB             = dataToCopy.aABB;
        this.thisShape      = dataToCopy.thisShape;
        this.thatShape      = dataToCopy.thatShape;
        this.vector         = dataToCopy.vector;
        this.stuck          = dataToCopy.stuck;
    };
    proto.clear = function () {
        this.occurred            = false;
        this.direction            = null;
        this.position            = null;
        this.deltaMovement        = null;
        this.aABB                = null;
        this.thisShape         = null;
        this.thatShape         = null;
        this.vector            = null;
        this.stuck             = 0;
    };
    return collisionData;
}());

platypus.CollisionDataContainer = (function () {
    "use strict";
    
    var collisionDataContainer = function () {
            this.xData = Array.setUp(new platypus.CollisionData(), new platypus.CollisionData());
            this.yData = Array.setUp(new platypus.CollisionData(), new platypus.CollisionData());
            this.xCount = 0;
            this.yCount = 0;
            this.xDeltaMovement = Infinity;
            this.yDeltaMovement = Infinity;
        },
        proto = collisionDataContainer.prototype;
    
    proto.getXEntry = function (index) {
        return this.xData[index];
    };
    
    proto.getYEntry = function (index) {
        return this.yData[index];
    };
    
    proto.tryToAddX = function (dataToCopy) {
        if (dataToCopy.deltaMovement < this.xDeltaMovement) {
            this.xDeltaMovement = dataToCopy.deltaMovement;
            this.xData[0].copy(dataToCopy);
            this.xCount = 1;
            return true;
        } else if (dataToCopy.deltaMovement === this.xDeltaMovement) {
            this.ensureRoomX();
            this.xData[this.xCount].copy(dataToCopy);
            this.xCount += 1;
            return true;
        }
        return false;
    };
    
    proto.tryToAddY = function (dataToCopy) {
        if (dataToCopy.deltaMovement < this.yDeltaMovement) {
            this.yDeltaMovement = dataToCopy.deltaMovement;
            this.yData[0].copy(dataToCopy);
            this.yCount = 1;
            return true;
        } else if (dataToCopy.deltaMovement === this.yDeltaMovement) {
            this.ensureRoomY();
            this.yData[this.yCount].copy(dataToCopy);
            this.yCount += 1;
            return true;
        }
        return false;
    };
    
    proto.ensureRoomX = function () {
        var j = 0,
            goalLength = this.xData.length * 2;
        
        if (this.xData.length <= this.xCount) {
            for (j = this.xData.length; j < goalLength; j++) {
                this.xData[j] = new platypus.CollisionData();
            }
        }
    };
    
    proto.ensureRoomY = function () {
        var j = 0,
            goalLength = this.yData.length * 2;
        
        if (this.yData.length <= this.yCount) {
            for (j = this.yData.length; j < goalLength; j++) {
                this.yData[j] = new platypus.CollisionData();
            }
        }
    };
    
    proto.reset = function () {
        this.xCount = 0;
        this.yCount = 0;
        this.xDeltaMovement = Infinity;
        this.yDeltaMovement = Infinity;
    };
    
    return collisionDataContainer;
}());