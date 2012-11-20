platformer.components['logic-portable'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'collision-postponement-resolved', 'hit-solid']);
		
		this.portableDirections = definition.portableDirections || {
			down: true //default is false, 'true' means as soon as carrier is connected downward
		};

        this.carrier      = this.lastCarrier = undefined;
        this.message      = {
        	entity: this.owner,
        	debug: true
        };
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(resp){
		if(this.carrierConnected){
			if(this.carrier != this.lastCarrier){
				if(this.lastCarrier){
					this.lastCarrier.trigger('release-me', this.message);
				}
				this.carrier.trigger('carry-me', this.message);
			}
			
//			this.carrierConnected = false;
		} else {
			if(this.carrier){
				this.carrier.trigger('release-me', this.message);
				this.carrier = undefined;
			}
		}
		this.lastCarrier = this.carrier;
	};
	
	proto['hit-solid'] = function(collisionInfo){
		if(collisionInfo.y > 0){
			this.updateCarrier(collisionInfo.entity, 'down',  collisionInfo.shape);
		} else if(collisionInfo.y < 0){
			this.updateCarrier(collisionInfo.entity, 'up',    collisionInfo.shape);
		} else if(collisionInfo.x < 0){
			this.updateCarrier(collisionInfo.entity, 'left',  collisionInfo.shape);
		} else if(collisionInfo.x > 0){
			this.updateCarrier(collisionInfo.entity, 'right', collisionInfo.shape);
		}
	};
	
	proto.updateCarrier = function(entity, direction, shape){
		if(this.portableDirections[direction]){
			if(entity){
				if (entity !== this.carrier){
					this.carrier = entity;
				}
				this.carrierConnected = true;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
