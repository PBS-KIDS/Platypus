/**
# COMPONENT **handler-logic**
A component that handles updating logic components. Each tick it calls all the entities that accept 'handle-logic' messages.

## Dependencies
- **Needs a 'tick' or 'logic' call** - This component doesn't need a specific component, but it does require a 'tick' or 'logic' call to function. It's usually used as a component of an action-layer.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-logic' message id it's added to the list of entities. 
  > @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick, logic** - Sends a 'handle-logic' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
  > @param resp (object) - An object containing deltaT which is the time passed since the last tick. 

### Child Broadcasts:
- **handle-logic** - Sent to entities to run their logic.
  > @param object - An object containing a deltaT variable that is the time that's passed since the last tick.

## JSON Definition
    {
      "type": "handler-logic",
    }
*/

platformer.components['handler-logic'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners(['tick', 'camera-update', 'child-entity-added', 'logic']);  
		
		this.stepLength    = definition.stepLength || 30;//15;
		this.leftoverTime = 0;
		this.maximumStepsPerTick = 10; //Math.ceil(500 / this.stepLength);
		this.camera = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			buffer: definition.buffer || 0
		};
		this.message = {
			deltaT: this.stepLength,
			tick: null,
			camera: this.camera
		};
		this.timeElapsed = {
			name: 'Logic',
			time: 0
		};
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

	proto['camera-update'] = function(camera){
		this.camera.left = camera.viewportLeft;
		this.camera.top = camera.viewportTop;
		this.camera.width = camera.viewportWidth;
		this.camera.height = camera.viewportHeight;
		if(!this.camera.buffer){
			this.camera.buffer = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
		}
	};

	proto['tick'] = proto['logic'] = function(resp){
		var cycles = 0,
		child   = undefined,
		time    = new Date().getTime();
		this.leftoverTime += resp.deltaT;
		cycles = Math.floor(this.leftoverTime / this.stepLength) || 1;

		// This makes the frames smoother, but adds variance into the calculations
		this.message.deltaT = this.leftoverTime / cycles;
		this.leftoverTime = 0;
//		this.leftoverTime -= (cycles * this.stepLength);

		if(!this.message.tick){
			this.message.tick = resp;
		}
		
		//Prevents game lockdown when processing takes longer than time alotted.
		cycles = Math.min(cycles, this.maximumStepsPerTick);
		
		for(var i = 0; i < cycles; i++){
			for (var x = this.entities.length - 1; x > -1; x--)
			{
				child = this.entities[x];
				if(child.alwaysOn || (typeof child.x === 'undefined') || ((child.x >= this.camera.left - this.camera.buffer) && (child.x <= this.camera.left + this.camera.width + this.camera.buffer) && (child.y >= this.camera.top - this.camera.buffer) && (child.y <= this.camera.top + this.camera.height + this.camera.buffer))){
					if(!child.trigger('handle-logic', this.message)){
						this.entities.splice(x, 1);
					}
				}
			}
			this.timeElapsed.name = 'Logic';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;
			
			this.owner.trigger('check-collision-group', this.message); // If a collision group is attached, make sure collision is processed on each logic tick.
			this.timeElapsed.name = 'Collision';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;
		}

		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.owner = undefined;
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
