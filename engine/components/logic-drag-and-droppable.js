/**
# COMPONENT **logic-drag-and-droppable**
A component that allows an object to be dragged and dropped. Can use collision to prevent dropping the objects in certain locations.
NOTE: handler-render-createjs and the render-sprite used by this entity need to have their 'touch' or 'click' inputs set to true.

## Dependencies
- [[handler-logic]] - Listens for the handle-logic and handle-post-collision-logic calls.
- [[render-sprite]] - Listens for 'mouseup', 'mousedown', and 'pressmove' calls.

## Messages

### Listens for:
- **handle-logic** - Updates the object's location on the handle-logic tick.
  - @param resp (object) - The tick coming from the scene.
- **handle-post-collision-logic** - Resolves whether the object state after we check if there are any collisions. If the object was dropped and can be dropped, it is.
  - @param resp (object) - The tick coming from the scene.
- **mousedown** - The mousedown event passed from the render component. Fired when we're grabbing the object. Starts the drag.
  - @param eventData (object) - The event data.
- **mouseup** - The mouseup event passed from the render component. Fired when we're trying to drop the object. 
  - @param eventData (object) - The event data.
- **pressmove** - The pressmove event passed from the render component. Tells us when we're dragging the object.
  - @param eventData (object) - The event data.
- **no-drop** - The message passed from the collision system letting us know the object is currently in a location that it cannot be dropped. 
  - @param collisionData (object) - The event data.  
  
## JSON Definition
    {
		"type": "logic-drag-and-droppable"
	}
*/
(function(){
	return platformer.createComponentClass({
		/*********************************************************************
		 "createComponentClass" creates the component class and adds the
		 following methods and properties that can be referenced from your
		 own methods and events:
		 
		 Property this.owner - a reference to the component's Entity
		 Property this.type  - identical to the id provided below
		 Method addListener(event, callback) - adds an event to listen for
		 Method removeListener(event, callback) - removes an event
		*********************************************************************/
		
		id: 'logic-drag-and-droppable',
		
		constructor: function(definition){
			this.nextX = this.owner.x;
			this.nextY = this.owner.y;
			this.grabOffsetX = 0;
			this.grabOffsetY = 0;
			this.owner.state.dragging = false;
			this.owner.state.noDrop = false;
			
			this.tryDrop = false;
			this.hitSomething = false;
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(resp){
				this.owner.x = this.nextX;
				this.owner.y = this.nextY;
				
				this.owner.state.noDrop = false;
				
			},
			"handle-post-collision-logic": function(resp){
				if (this.tryDrop) {
					this.tryDrop = false;
					if(this.hitSomething) {
						this.dropFailed = false;
						this.owner.state.noDrop = true;
						this.owner.state.dragging = true;
					} else {
						this.owner.state.noDrop = false;
						this.owner.state.dragging = false;
					}
					
				} else if (this.hitSomething) {
					this.owner.state.noDrop = true;
				}
				this.hitSomething = false;
			},
			"mousedown": function(eventData) {
				this.grabOffsetX = eventData.x - this.owner.x;
				this.grabOffsetY = eventData.y - this.owner.y;
				this.owner.state.dragging = true;
			},
			"mouseup": function(eventData) {
				this.tryDrop = true;
			},
			"pressmove": function(eventData) {
				this.nextX = eventData.x - this.grabOffsetX;
				this.nextY = eventData.y - this.grabOffsetY;
			},
			"no-drop": function(collisionData) {
				this.hitSomething = true;
			}
		},
		
		methods: {// These are methods that are called by this component.
			destroy: function() {
				this.owner.state.dragging = null;
				this.owner.state.noDrop = null;
			}
			
		},
		
		publicMethods: {// These are methods that are available on the entity.
			
			
		}
	});
})();
