platformer.classes.collisionShape = (function(){
	var collisionShape = function(location, type, points, offset){
		this.offset = offset || [0,0];
		this.x = location[0] + this.offset[0];
		this.y = location[1] + this.offset[1];
		this.prevX = this.x;
		this.prevY = this.y;
		this.type = type || 'rectangle';
		this.subType = '';
		this.points = points; //Points should distributed as if the 0,0 is the focal point of the object.
		this.aABB = undefined;
		
		var width = 0;
		var height = 0; 
		switch (this.type)
		{
		case 'rectangle': //need TL and BR points
		case 'circle': //need TL and BR points
			//this.aABB.left = this.points[0][0];
			//this.aABB.right = this.points[1][0];
			//this.aABB.top = this.points[0][1];
			//this.aABB.bottom = this.points[1][1];
			width = this.points[1][0] - this.points[0][0];
			height = this.points[1][1] - this.points[0][1];
			break;
		case 'triangle': //Need three points, start with the right angle corner and go clockwise.
			if (this.points[0][1] == this.points[1][1] && this.points[0][0] == this.points[2][0])
			{
				if (this.points[0][0] < this.points[1][0])
				{
					//TOP LEFT CORNER IS RIGHT
					this.subType = 'tl';
					//this.aABB.left = this.points[0][0];
					//this.aABB.right = this.points[1][0];
					//this.aABB.top = this.points[0][1];
					//this.aABB.bottom = this.points[2][1];
					width = this.points[1][0] - this.points[0][0];
					height = this.points[2][1] - this.points[0][1];
				} else {
					//BOTTOM RIGHT CORNER IS RIGHT
					this.subType = 'br';
					//this.aABB.left = this.points[1][0];
					//this.aABB.right = this.points[0][0];
					//this.aABB.top = this.points[2][1];
					//this.aABB.bottom = this.points[0][1];
					width = this.points[0][0] - this.points[1][0];
					height = this.points[0][1] - this.points[2][1];
				}
				
			} else if (this.points[0][1] == this.points[2][1] && this.points[0][0] == this.points[1][0]) {
				if (this.points[0][1] < this.points[1][1])
				{
					//TOP RIGHT CORNER IS RIGHT
					this.subType = 'tr';
					//this.aABB.left = this.points[2][0];
					//this.aABB.right = this.points[0][0];
					//this.aABB.top = this.points[0][1];
					//this.aABB.bottom = this.points[1][1];
					width = this.points[0][0] - this.points[2][0];
					height = this.points[1][1] - this.points[0][1];
				} else {
					//BOTTOM LEFT CORNER IS RIGHT
					this.subType = 'bl';
					//this.aABB.left = this.points[0][0];
					//this.aABB.right = this.points[2][0];
					//this.aABB.top = this.points[1][1];
					//this.aABB.bottom = this.points[0][1];
					width = this.points[2][0] - this.points[0][0];
					height = this.points[0][1] - this.points[1][1];
				}
			} 
		}
		
		this.aABB = new platformer.classes.aABB(this.x, this.y, width, height);
		
		/*
		this.aABB.width = this.aABB.right - this.aABB.left;
		this.aABB.height = this.aABB.bottom - this.aABB.top;
		this.aABB.halfWidth = this.aABB.width / 2;
		this.aABB.halfHeight = this.aABB.height / 2;
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
		*/
	};
	var proto = collisionShape.prototype;
	
	proto.update = function(x, y){
		//alert('x: ' + x + ' y: ' + y);
		
		this.prevX = this.x;
		this.prevY = this.y;
		this.x = x + this.offset[0];
		this.y = y + this.offset[1];
		this.aABB.move(this.x, this.y);
		/*
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
		*/
		//alert('this.x: ' + this.x + ' this.y: ' + this.y + ' this.prevX: ' + this.prevX + ' this.prevY: ' + this.prevY);
	};
	
	proto.setXY = function (x, y) {
		this.x = x;
		this.y = y;
	};
	
	proto.getXY = function () {
		return [this.x, this.y];
	};
	
	proto.getX = function () {
		return this.x;
	};
	
	proto.getY = function () {
		return this.y;
	};
	
	proto.getPrevX = function () {
		return this.prevX;
	};
	
	proto.getPrevY = function () {
		return this.prevY;
	};
	
	proto.getPrevLocation = function () {
		return [this.prevX, this.prevY];
	};
	
	proto.getAABB = function(){
		return this.aABB;
	};
	
	proto.getXOffset = function(){
		return this.offset[0];
	};
	
	proto.getYOffset = function(){
		return this.offset[1];
	};
	
	return collisionShape;
})();