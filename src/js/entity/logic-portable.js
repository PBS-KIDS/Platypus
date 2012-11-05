platformer.components['logic-portable'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'collision-postponement-resolved', 'hit-solid']);
		
		this.portableDirections = definition.portableDirections || {
			down: true //default is false, 'true' means as soon as carrier is connected downward
		};

		this.clampTop = null;
		this.clampBottom = null;
		this.clampLeft = null;
		this.clampRight = null;
		this.lastCarrierX = 0;
        this.lastCarrierY = 0;
        this.carrier      = undefined;
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(deltaT){
		if(this.trackMe){
			this.trackMe++;
			console.log('LogicA (' + this.tracking + ': ' + this.trackMe + '): ' + (this.carrier?'{ox:' + this.owner.x + ', oy:' + this.owner.y + ', cx:' + this.carrier.x + ', cy:' + this.carrier.y + ', lastX:' + this.lastCarrierX + ', lastY:' + this.lastCarrierY + ', down:' + this.clampBottom + '}':'No Carrier!'));
		}
		if(this.carrierConnected){
			if(this.carrier.collisionType == 'hero'){
				this.trackMe = 100;
				this.tracking = 'block';
			}
			if(this.owner.collisionType == 'hero'){
				this.trackMe = 200;
				this.tracking = 'hero';
			}
			if(!this.owner.postponeCollisionCheck){
				this.owner.postponeCollisionCheck = [];
			}
			this.owner.postponeCollisionCheck.push(this.carrier);
			this.carrierConnected = false;
		} else {
			if(this.carrier){
				this.carrier = undefined;
			}
		}
		if(this.trackMe){
			this.trackMe++;
			console.log('LogicB (' + this.tracking + ': ' + this.trackMe + '): ' + (this.carrier?'{ox:' + this.owner.x + ', oy:' + this.owner.y + ', cx:' + this.carrier.x + ', cy:' + this.carrier.y + ', lastX:' + this.lastCarrierX + ', lastY:' + this.lastCarrierY + ', down:' + this.clampBottom + '}':'No Carrier!'));
		}
	};
	
	proto['collision-postponement-resolved'] = function(){
		if(this.trackMe){
			this.trackMe++;
			console.log('ResolA (' + this.tracking + ': ' + this.trackMe + '): ' + (this.carrier?'{ox:' + this.owner.x + ', oy:' + this.owner.y + ', cx:' + this.carrier.x + ', cy:' + this.carrier.y + ', lastX:' + this.lastCarrierX + ', lastY:' + this.lastCarrierY + ', down:' + this.clampBottom + '}':'No Carrier!'));
		}
		this.owner.x += this.carrier.x - this.lastCarrierX;
		this.owner.y += this.carrier.y - this.lastCarrierY;
		this.lastCarrierX = this.carrier.x;
		this.lastCarrierY = this.carrier.y;
		
		if((this.clampBottom != null) && (this.owner.y > (this.carrier.y - this.clampBottom))){
			this.owner.y = (this.carrier.y - this.clampBottom);
		}
		if((this.clampTop != null) && (this.owner.y < (this.carrier.y + this.clampTop))){
			this.owner.y = (this.carrier.y + this.clampTop);
		}
		if((this.clampLeft != null) && (this.owner.x < (this.carrier.x + this.clampLeft))){
			this.owner.x = (this.carrier.x + this.clampLeft);
		}
		if((this.clampRight != null) && (this.owner.x > (this.carrier.x - this.clampRight))){
			this.owner.x = (this.carrier.x - this.clampRight);
		}
		this.clampTop = null;
		this.clampBottom = null;
		this.clampLeft = null;
		this.clampRight = null;
		
		this.owner.shape.update(this.owner.x, this.owner.y);
		
		if(this.trackMe){
			this.trackMe++;
			console.log('ResolB (' + this.tracking + ': ' + this.trackMe + '): ' + (this.carrier?'{ox:' + this.owner.x + ', oy:' + this.owner.y + ', cx:' + this.carrier.x + ', cy:' + this.carrier.y + ', lastX:' + this.lastCarrierX + ', lastY:' + this.lastCarrierY + ', down:' + this.clampBottom + '}':'No Carrier!'));
		}
	};
	
	proto['hit-solid'] = function(collisionInfo){
		if(this.trackMe){
			this.trackMe++;
			console.log('ColDeA (' + this.tracking + ': ' + this.trackMe + '): ' + (this.carrier?'{ox:' + this.owner.x + ', oy:' + this.owner.y + ', cx:' + this.carrier.x + ', cy:' + this.carrier.y + ', lastX:' + this.lastCarrierX + ', lastY:' + this.lastCarrierY + ', down:' + this.clampBottom + '}':'No Carrier!'));
		}
		if(collisionInfo.y > 0){
			this.updateCarrier(collisionInfo.entity, 'down',  collisionInfo.shape);
		} else if(collisionInfo.y < 0){
			this.updateCarrier(collisionInfo.entity, 'up',    collisionInfo.shape);
		} else if(collisionInfo.x < 0){
			this.updateCarrier(collisionInfo.entity, 'left',  collisionInfo.shape);
		} else if(collisionInfo.x > 0){
			this.updateCarrier(collisionInfo.entity, 'right', collisionInfo.shape);
		}
		if(this.trackMe){
			this.trackMe++;
			console.log('ColDeB (' + this.tracking + ': ' + this.trackMe + '): ' + (this.carrier?'{ox:' + this.owner.x + ', oy:' + this.owner.y + ', cx:' + this.carrier.x + ', cy:' + this.carrier.y + ', lastX:' + this.lastCarrierX + ', lastY:' + this.lastCarrierY + ', down:' + this.clampBottom + '}':'No Carrier!'));
		}
	};
	
	proto.updateCarrier = function(entity, direction, shape){
		if(this.portableDirections[direction]){
			if(entity !== this.carrier){
				this.carrier = entity;
				this.lastCarrierX = this.carrier.x;
				this.lastCarrierY = this.carrier.y;
			}
			this.carrierConnected = true;
			switch(direction){
			case 'down':
				this.clampBottom = this.owner.shape.getAABB().halfHeight + shape.getAABB().halfHeight; break;
			case 'up':
				this.clampTop    = this.owner.shape.getAABB().halfHeight + shape.getAABB().halfHeight; break;
			case 'left':
				this.clampLeft   = this.owner.shape.getAABB().halfWidth  + shape.getAABB().halfWidth;  break;
			case 'right':
				this.clampRight  = this.owner.shape.getAABB().halfWidth  + shape.getAABB().halfWidth;  break;
			}
		}
	};	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
