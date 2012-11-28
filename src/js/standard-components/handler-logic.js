platformer.components['handler-logic'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners(['tick', 'child-entity-added', 'logic']);  
		
		this.stepLength    = definition.stepLength || 15;
		this.message       = {
			deltaT: this.stepLength
		};
		this.leftoverTime = 0;
		this.maximumStepsPerTick = Math.ceil(500 / this.stepLength);
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'handle-logic')
			{
				this.entities.push(entity);
				break;
			}
		}
	};

	proto['tick'] = proto['logic'] = function(resp){
		var cycles = 0;
		this.leftoverTime += resp.deltaT;
		cycles = Math.floor(this.leftoverTime / this.stepLength);

		// This makes the frames smoother, but adds variance into the calculations
		this.message.deltaT = this.leftoverTime / cycles;
		this.leftoverTime = 0;
//		this.leftoverTime -= (cycles * this.stepLength);

		//Prevents game lockdown when processing takes longer than time alotted.
		cycles = Math.min(cycles, this.maximumStepsPerTick);
		
		for(var i = 0; i < cycles; i++){
			for (var x = this.entities.length - 1; x > -1; x--)
			{
				if(!this.entities[x].trigger('handle-logic', this.message))
				{
					this.entities.splice(x, 1);
				}
			}
			this.owner.trigger('check-collision-group', this.message); // If a collision group is attached, make sure collision is processed on each logic tick.
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
