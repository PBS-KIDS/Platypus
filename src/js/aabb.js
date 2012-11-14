platformer.classes.aABB = (function(){
	var aABB = function(x, y, width, height){
		this.setAll(x, y, width, height);
	};
	var proto = aABB.prototype;
	
	proto.setAll = function(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width  = width || 0;
		this.height = height || 0;
		this.halfWidth = this.width / 2;
		this.halfHeight = this.height / 2;
		if(typeof x === 'undefined'){
			this.left = undefined;
			this.right = undefined;
		} else {
			this.left = -this.halfWidth + this.x;
			this.right = this.halfWidth + this.x;
		}
		if(typeof y === 'undefined'){
			this.top = undefined;
			this.bottom = undefined;
		} else {
			this.top = -this.halfHeight + this.y;
			this.bottom = this.halfHeight + this.y;
		}
	};
	
	proto.reset = function(){
		this.setAll(undefined, undefined, 0, 0);
	};
	
	proto.include = function(aabb){
		if((this.left > aabb.left)     || (typeof this.left === 'undefined')){
			this.left = aabb.left;
		}
		if((this.right < aabb.right)   || (typeof this.right === 'undefined')){
			this.right = aabb.right;
		}
		if((this.top > aabb.top)       || (typeof this.top === 'undefined')){
			this.top = aabb.top;
		}
		if((this.bottom < aabb.bottom) || (typeof this.bottom === 'undefined')){
			this.bottom = aabb.bottom;
		}
		
		this.width      = this.right  - this.left;
		this.height     = this.bottom - this.top;
		this.halfWidth  = this.width / 2;
		this.halfHeight = this.height / 2;
		this.x          = this.left + this.halfWidth;
		this.y          = this.top  + this.halfHeight;
	};
	
	proto.move = function(x, y){
		if(!x){
			var s = 56;
		}
		
		this.x = x;
		this.y = y;
		this.left   = -this.halfWidth + this.x;
		this.right  = this.halfWidth + this.x;
		this.top    = -this.halfHeight + this.y;
		this.bottom = this.halfHeight + this.y;
		return this;
	};

	proto.getCopy = function(){
		return new platformer.classes.aABB(this.x, this.y, this.width, this.height);
	};
	
	return aABB;
})();