/**
# CLASS vector2D
This class defines a two-dimensional vector object and a variety of methods for manipulating the vector.

## Fields
- **v** (number []) - A array of length two containing the x and y coordinates of the vector in that order.

## Methods
- **constructor** - Creates an object from the vector2D class.
  > @param x (number) - The x component of the vector.
  > @param y (number) - The y component of the vector.
- **set** - Sets the x and y component of the vector.
  > @param x (number) - The x component.
  > @param y (number) - The y component.
- **setX** - Sets the x component of the vector.
  > @param x (number) - The x component.
- **setY** - Sets the y component of the vector.
  > @param y (number) - The y component.
- **x** - Returns the x component of the vector.
  > @return number - The x component of the vector.
- **y** - Returns the y component of the vector.
  > @return number - The y component of the vector.
- **magnitude** - Returns the magnitude of the vector.
  > @return number - The magnitude of the vector.
- **direction** - Returns the direction of the vector.
  > @return number - The direction of the vector.
- **normalize** - Returns a normalized copy of the vector.
  > @return vector2D - A normalized vector in the same direction as this vector.
- **rotate** - Rotates the vector by the given amount.
  > @param angle (number) - The amount to rotate the vector in radians.
- **add** - Adds the given components to this vector.
  > @param x (number) - The x component to add.
  > @param y (number) - The y component to add.
- **addVector** - Adds the given vector to this vector.
  > @param otherVector (vector2D) - The vector to add.
- **subtractVector** - Subtracts the given vector from this vector.
  > @param otherVector (vector2D) - The vector to subtract.  
- **scaleVector** - Scales the vector by the given factor.
  > @param factor (number) - The factor to scale by. 
- **copy** - Returns a copy of this vector.
  > @return vector2D - A copy of this vector.
*/

platformer.classes.vector2D = (function(){
	var vector2D = function(x, y){
		this.v = [x,y];
	};
	var proto = vector2D.prototype;
	
	proto.set = function(x, y){
		this.v[0] = x;
		this.v[1] = y;
	};
	
	proto.setX = function(x){
		this.v[0] = x;
	};
	
	proto.setY = function(y){
		this.v[1] = y;
	};
	
	proto.x = function(){
		return this.v[0];
	};
	
	proto.y = function(){
		return this.v[1];
	};
	
	proto.magnitude = function(){
		return Math.sqrt( Math.pow(this.v[0], 2) + Math.pow(this.v[1], 2));
	};
	
	proto.direction = function(){
		var mag = this.magnitude();
        var angle = 0;

        if (mag != 0){
                angle = Math.acos(this.v[0] / mag);
                if (this.v[1] < 0){
                        angle = (Math.PI * 2) - angle;
                }
        }
        return angle; 
	};
	
	proto.normalize = function(){
		var mag = this.magnitude();
		if (mag == 0)
		{
			return new platformer.classes.vector2D(0, 0);
		} else {
			return new platformer.classes.vector2D(this.v[0] / mag, this.v[1] / mag);
		}
	};
	
	proto.rotate = function(angle){
		var x = this.v[0];
		var y = this.v[1];
		this.v[0] = x * Math.cos(angle) - y * Math.sin(angle);
		this.v[1] = x * Math.sin(angle) + y * Math.cos(angle);
	};
	
	proto.add = function (x, y){
		this.v[0] += x;
		this.v[1] += y;
	};
	
	proto.addVector = function(otherVector){
		this.v[0] += otherVector.x();
		this.v[1] += otherVector.y();
	};
	
	proto.subtractVector = function(otherVector){
		this.v[0] -= otherVector.x();
		this.v[1] -= otherVector.y();
	};
	
	proto.scale = function(factor) {
		this.v[0] *= factor;
		this.v[1] *= factor;
	};
	
	proto.copy = function() {
		return new vector2D(this.v[0], this.v[1]);
	};
	
	return vector2D;
})();