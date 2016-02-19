/*global springroll */
(function () {
    var recycleProp = {
            enumerable: false,
            value: false,
            writable: true
        },
        caches = {};
    
    platypus.setUpRecycle = function (ClassObject, name) {
        var cache = [],
            debug = !!springroll.Debug;
        
        caches[name] = cache;
        
        if (debug) {
            ClassObject.setUp = function () {
                var newObject = null;
                
                if (cache.length) {
                    newObject = cache.pop();
                    newObject.recycled = false;
                } else {
                    newObject = Object.create(this.prototype);
                    Object.defineProperty(newObject, 'recycled', recycleProp);
                }

                this.apply(newObject, arguments);

                return newObject;
            };
            
            ClassObject.recycle = function (instance) {
                if (instance.recycled) {
                    console.warn('WHOA! I have already been recycled!', instance);
                } else {
                    instance.recycled = true;
                    cache.push(instance);
                }
            };
        } else {
            ClassObject.setUp = function () {
                var newObject = null;
                
                if (cache.length) {
                    newObject = cache.pop();
                } else {
                    newObject = Object.create(this.prototype);
                }

                this.apply(newObject, arguments);

                return newObject;
            };
            
            ClassObject.recycle = function (instance) {
                cache.push(instance);
            };
        }

        ClassObject.prototype.recycle = function () {
            ClassObject.recycle(this);
        };
        
        return cache;
    }
    
    platypus.getObjectCaches = function () {
        return caches;
    };
}());