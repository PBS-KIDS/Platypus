(function () {
    var recycleProps = {
            recycleIndex: {
                enumerable: false,
                value: 1,
                writable: true
            },
            recycled: {
                enumerable: false,
                value: true,
                writable: true
            }
        },
        caches = {};
    
    platypus.setUpRecycle = function (ClassObject, name) {
        var cache = [];
        
        caches[name] = cache;
        
        ClassObject.setUp = function () {
            var newObject = null;
            
            if (cache.length) {
                newObject = cache.pop();
                newObject.recycled = false;
            } else {
                newObject = Object.create(this.prototype);
            }

            this.apply(newObject, arguments);

            return newObject;
        };
        
        ClassObject.recycle = function (instance) {
            if (instance.recycleIndex) {
                if (instance.recycled) {
                    console.warn('WHOA! I have already been recycled!', instance);
                } else {
                    instance.recycleIndex += 1;
                    instance.recycled = true;
                    cache.push(instance);
                }
            } else {
                Object.defineProperties(instance, recycleProps);
                cache.push(instance);
            }
        };

        ClassObject.prototype.recycle = function () {
            ClassObject.recycle(this);
        };
    }
    
    platypus.getObjectCaches = function () {
        return caches;
    };
}());