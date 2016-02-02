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
        };
    
    platypus.setUpRecycle = function (ClassObject) {
        var cache = [];
        
        ClassObject.setUp = function () {
            var newObject = null;
            
            if (cache.length) {
                newObject = cache.pop();
            } else {
                newObject = Object.create(this.prototype);
            }
            
            newObject.recycled = false;

            this.apply(newObject, arguments);

            return newObject;
        };
        
        ClassObject.recycle = function (instance) {
            if (instance.recycleIndex) {
                instance.recycleIndex += 1;
                instance.recycled = true;
            } else {
                Object.defineProperties(instance, recycleProps);
            }
            cache.push(instance);
        };

        ClassObject.prototype.recycle = function () {
            ClassObject.recycle(this);
        };
    }
}());