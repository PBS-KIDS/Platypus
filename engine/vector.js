/**
# CLASS Vector
This class defines a multi-dimensional vector object and a variety of methods for manipulating the vector.

## Properties
- **x** - The x component of the vector.
- **y** - The y component of the vector.

## Methods
- **constructor** - Creates an object from the vector2D class.
  - @param x (number) - The x component of the vector.
  - @param y (number) - The y component of the vector.
- **set** - Sets the x and y component of the vector.
  - @param x (number) - The x component.
  - @param y (number) - The y component.
- **copyValues** - Sets the x and y component of the vector to values of the parameter vector.
  - @param x (number) - The x component.
  - @param y (number) - The y component.
  - @return vector2D - This.
- **setX** - Sets the x component of the vector.
  - @param x (number) - The x component.
  - @return vector2D - This.
- **setY** - Sets the y component of the vector.
  - @param y (number) - The y component.
  - @return vector2D - This.
- **magnitude** - Returns the magnitude of the vector.
  - @return number - The magnitude of the vector.
- **direction** - Returns the direction of the vector.
  - @return number - The direction of the vector.
- **getUnit** - Returns a normalized copy of the vector.
  - @return vector2D - A normalized vector in the same direction as this vector.
- **normalize** - Normalizes the vector.
  - @return vector2D - This.
- **rotate** - Rotates the vector by the given amount.
  - @param angle (number) - The amount to rotate the vector in radians.
  - @return vector2D - This.
- **add** - Adds the given components to this vector.
  - @param x (number) - The x component to add.
  - @param y (number) - The y component to add.
  - @return vector2D - This.
- **addVector** - Adds the given vector to this vector.
  - @param otherVector (vector2D) - The vector to add.
  - @return vector2D - This.
- **subtractVector** - Subtracts the given vector from this vector.
  - @param otherVector (vector2D) - The vector to subtract.  
  - @return vector2D - This.
- **scaleVector** - Scales the vector by the given factor.
  - @param factor (number) - The factor to scale by. 
  - @return vector2D - This.
- **dot** - Finds the dot product of the two vectors.
  - @param otherVector (vector2D) - The other vector. 
  - @return number - The dot product.
- **shortestAngleTo** - Finds the shortest angle between the two vectors .
  - @param otherVector (vector2D) - The other vector. 
  > return number - The angle between this vector and the received vector.     
- **scalarProjection** - Find the scalar value of projecting this vector onto the parameter vector or onto a vector at the specified angle away.
  - @param vectorOrAngle (vector2D or number) - The other vector or the angle between the vectors. 
  > return number - The magnitude of the projection. 
- **copy** - Returns a copy of this vector.
  - @return vector2D - A copy of this vector.
*/

platformer.Vector = (function(){
	"use strict";
	
	var Vector = function(x, y, z){
		this.matrix = [];
		this.set(x, y, z);
	};
	var proto = Vector.prototype;
	
	// .x
	Object.defineProperty(proto, 'x', {
	    get: function(){
	        return this.matrix[0];
	    },
	    set: function(value){
	    	this.matrix[0] = value;
	    }
	});
	
	// .y
	Object.defineProperty(proto, 'y', {
	    get: function(){
	        return this.matrix[1];
	    },
	    set: function(value){
	    	this.matrix[1] = value;
	    }
	});
	
	// .z
	Object.defineProperty(proto, 'z', {
	    get: function(){
	        return this.matrix[2];
	    },
	    set: function(value){
	    	this.matrix[2] = value;
	    }
	});
	
	proto.forEach = function(func, limit){
		var i = 0,
		l     = limit || this.matrix.length;
		
		for(i = 0; i < l; i++){
			func(this.matrix[i], i, this.matrix);
		}
	};
	
	proto.set = function(x, y, z){
	    if(x && Array.isArray(x)){
	        this.matrix = x.slice(); // Passing in an array.
	    } else if (x && x.matrix){
	        this.matrix = x.matrix.slice(); // Passing in a vector.
	    } else {
            this.matrix = [x || 0, y || 0, z || 0]; // Passing in coordinates.
	    }
		return this;
	};
	
	proto.copyValues = function(otherVector){
		return this.set(otherVector);
	};
	
	proto.magnitude = function(dimensions){
		var squares = 0,
		square = function(coordinate){
			squares += Math.pow(coordinate, 2);
		};
		
		this.forEach(square, dimensions);
		
		return Math.sqrt(squares);
	};
	
	proto.getDirection2D = function(){
		var mag = this.magnitude(2);
        var angle = 0;

        if (mag != 0){
                angle = Math.acos(this.x / mag);
                if (this.y < 0){
                        angle = (Math.PI * 2) - angle;
                }
        }
        return angle; 
	};
	
	proto.getUnit = function(){
		return new Vector(this).normalize();
	};
	
	proto.getInverse = function(){
		return new Vector(this).multiply(-1);
	};
	
	proto.normalize = function(){
		var mag = this.magnitude();
		
		if (mag == 0) {
			return this.multiply(0);
		} else {
			return this.multiply(1 / mag);
		}
	};
	
	proto.cross = (function(){
		var det = function(a, b, c, d){
			return a * d - b * c;
		};
		
		return function(v){
			this.x = det(this.y, this.z, v.y, v.z);
			this.y = -det(this.x, this.z, v.x, v.z);
			this.z = det(this.x, this.y, v.x, v.y);
			
			return this;
		};
	})();
	
	proto.getCrossProduct = function(v){
		return new Vector(this).cross(v);
	};
	
	proto.rotate = function(angle, axis){
		var a = axis,
		cos   = cos(angle),
		sin   = sin(angle),
		icos  = 1 - cos,
		x     = 0,
		y     = 0,
		z     = 0;
		
		if(a){
			if(a === 'x'){
				a = new Vector(1,0,0);
			} else if(a === 'y'){
				a = new Vector(0,1,0);
			} else if(a === 'z'){
				a = new Vector(0,0,1);
			}
		} else {
			a = new Vector(0,0,1);
		}
		
		x     = a.x;
		y     = a.y;
		z     = a.z;
		
		return this.multiply([
            [    cos  + x*x*icos, x*y*icos -   z*sin , x*z*icos +   y*sin ],
            [y*x*icos +   z*sin ,     cos  + y*y*icos, y*z*icos -   x*sin ],
            [z*x*icos -   y*sin , z*y*icos +   x*sin ,     cos  + z*z*icos]
        ]);
	};
	
	proto.multiply = function (multiplier){
		var i = 0,
		j = 0,
		self = null,
		mult = function(coordinate, index, matrix){
			matrix[index] = coordinate * multiplier;
		};
		
		if(Array.isArray(multiplier)){
			self = this.matrix.slice();
			for(i = 0; i < multiplier.length; i++){
				this.matrix[i] = 0;
				for(j = 0; j < multiplier[i].length; j++){
					this.matrix[i] += self[j] * multiplier[i][j];
				}
			}
		} else {
			this.forEach(mult);
		}
		
		return this;
	};
	
	proto.add = function (x, y, z){
		var addMatrix = x,
		add = function(coordinate, index, matrix){
			matrix[index] += addMatrix[index];
		};

		if(!Array.isArray(addMatrix)){
			if(addMatrix.matrix){
				addMatrix = addMatrix.matrix;
			} else {
		        addMatrix = [x, y, z];
			}
	    }
		
		this.forEach(add);
		
		return this;
	};
	
	proto.addVector = function(otherVector){
		return this.add(otherVector);
	};
	
	proto.subtractVector = function(otherVector){
		return this.add(otherVector.getInverse());
	};
	
	proto.scale = function(factor) {
		return this.multiply(factor);
	};
	
	proto.dot = function(otherVector) {
		return this.x * otherVector.x + this.y * otherVector.y;
	};
	
	proto.shortestAngleTo = function(otherVector) {
		return Math.acos(this.dot(otherVector) / (this.magnitude() * otherVector.magnitude()));
	};
	
	proto.scalarProjection = function(vectorOrAngle) {
		var angle = 0;
		var vector = null;
		if (typeof vectorOrAngle == "number") {
			angle = vectorOrAngle;
		} else {
			vector = vectorOrAngle;
			angle = this.shortestAngleTo(vector);
		}
		return this.magnitude(2) * Math.cos(angle);
	};
	
	proto.copy = function() {
		return new Vector(this);
	};
	
	Vector.assign = (function(){
		var createProperty = function(property, obj, vector, index){
			var temp = null,
			propertyInUse = false;
			
			if(typeof property === 'string'){
				if(typeof obj[property] !== 'undefined'){
					temp = obj[property];
					delete obj[property];
					propertyInUse = true;
				}
			}
			
			Object.defineProperty(obj, property, {
			    get: function(){
			        return vector.matrix[index];
			    },
			    set: function(value){
			    	vector.matrix[index] = value;
			    },
			    enumerable: true
			});
			
			if(propertyInUse){
				obj[property] = temp;
			}
		};
		
		return function(){
			var i = 0,
			obj   = arguments[0],
			prop  = arguments[1];
			
			if(obj && prop){
				if(!obj[prop]){
					obj[prop] = new Vector();
					
					for(i = 2; i < arguments.length; i++){
						if(arguments[i] !== prop){
							createProperty(arguments[i], obj, obj[prop], i - 2);
						}
					}
					
					return 
				}
				return obj[prop];
			} else {
				return null;
			}
		};
	})();
	
	return Vector;
})();