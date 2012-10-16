platformer.classes.aABB = (function(){
	var aABB = function(x, y, width, height){
		this.x = x || 0;
		this.y = y || 0;
		this.width = width; //this.right - this.left;
		this.height = height; //this.bottom - this.top;
		this.halfWidth = this.width / 2;
		this.halfHeight = this.height / 2;
		this.left = -this.halfWidth + this.x;
		this.right = this.halfWidth + this.x;
		this.top = -this.halfHeight + this.y;
		this.bottom = this.halfHeight + this.y;
	};
	var proto = aABB.prototype;
	
	proto.move = function(x, y){
		this.x = x;
		this.y = y;
		this.left = -this.halfWidth + this.x;
		this.right = this.halfWidth + this.x;
		this.top = -this.halfHeight + this.y;
		this.bottom = this.halfHeight + this.y;
		return this;
	};
	
	proto.getCopy = function(){
		return new platformer.classes.aABB(this.x, this.y, this.width, this.height);
	};
	
	return aABB;
})();