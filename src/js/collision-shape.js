platformer.classes.collisionShape = (function(){
	var collisionShape = function(location, type, points, offset, radius){
		this.x = location[0];
		this.y = location[1];
		this.prevX = location[0];
		this.prevY = location[1];
		this.offset = offset || [0,0];
		this.type = type || 'rectangle';
		this.subType = '';
		this.points = points; //Points should distributed as if the 0,0 is the focal point of the object.
		this.radius = radius || 0;
		this.aABB = {};
		this.aABBPos = {};
		switch (this.type)
		{
		case 'rectangle': //need TL and BR points
			this.aABB.left = this.points[0][0];
			this.aABB.right = this.points[1][0];
			this.aABB.top = this.points[0][1];
			this.aABB.bottom = this.points[1][1];
			break;
		case 'circle': //need Center point
			this.aABB.left = this.points[0][0] - this.radius;
			this.aABB.top = this.points[0][1] - this.radius;
			this.aABB.bottom = this.points[0][0] + this.radius;
			this.aABB.right = this.points[0][1] + this.radius;
			break;
		case 'triangle': //Need three points, start with the right angle corner and go clockwise.
			if (this.points[0][1] == this.points[1][1] && this.points[0][0] == this.points[2][0])
			{
				if (this.points[0][0] < this.points[1][0])
				{
					//TOP LEFT CORNER IS RIGHT
					this.subType = 'tl';
					this.aABB.left = this.points[0][0];
					this.aABB.right = this.points[1][0];
					this.aABB.top = this.points[0][1];
					this.aABB.bottom = this.points[2][1];
				} else {
					//BOTTOM RIGHT CORNER IS RIGHT
					this.subType = 'br';
					this.aABB.left = this.points[1][0];
					this.aABB.right = this.points[0][0];
					this.aABB.top = this.points[2][1];
					this.aABB.bottom = this.points[0][1];
				}
				
			} else if (this.points[0][1] == this.points[2][1] && this.points[0][0] == this.points[1][0]) {
				if (this.points[0][1] < this.points[1][1])
				{
					//TOP RIGHT CORNER IS RIGHT
					this.subType = 'tr';
					this.aABB.left = this.points[2][0];
					this.aABB.right = this.points[0][0];
					this.aABB.top = this.points[0][1];
					this.aABB.bottom = this.points[1][1];
				} else {
					//BOTTOM LEFT CORNER IS RIGHT
					this.subType = 'bl';
					this.aABB.left = this.points[0][0];
					this.aABB.right = this.points[2][0];
					this.aABB.top = this.points[1][1];
					this.aABB.bottom = this.points[0][1];
				}
			} 
		}
		this.aABB.width = (this.aABB.right - this.aABB.left);
		this.aABB.height = (this.aABB.bottom - this.aABB.top);
		this.aABB.halfWidth = (this.aABB.right - this.aABB.left) / 2;
		this.aABB.halfHeight = (this.aABB.bottom - this.aABB.top) / 2;
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
	};
	var proto = collisionShape.prototype;
	
	proto.update = function(x, y){
		this.prevX = this.x;
		this.prevY = this.y;
		this.x = x + this.offset[0];
		this.y = y + this.offset[1];
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
	};
	
	proto.getPrevLocation = function () {
		return [this.prevX, this.prevY];
	};
	
	proto.getAABB = function(){
		return this.aABBPos;
	};
	
	proto.getXOffset = function(){
		return this.offset[0];
	};
	
	proto.getYOffset = function(){
		return this.offset[1];
	};
	
	return collisionShape;
})();