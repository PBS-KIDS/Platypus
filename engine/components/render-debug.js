/**
# COMPONENT **render-debug**
This component is attached to entities that will appear in the game world. It serves two purposes. First, it displays a rectangle that indicates location of the object. By default it uses the specified position and dimensions of the object (in grey), if the object has a collision component it will display the AABB of the collision shape (in pink). If the entity has a [[Logic-Carrier]] component and is/was carrying an object, a green rectangle will be drawn showing the collision group. The render-debug component also allows the user to click on an object and it will print the object in the debug console. 

## Dependencies
- [[handler-render-createjs]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render** - Repositions the pieces of the component in preparation for rendering
- **handle-render-load** - The visual components are set up and added to the stage. Setting up mouse input stuff. The click-to-print-to-console functionality is set up too. 
  - @param resp.stage ([createjs.Stage][link1]) - This is the stage on which the component will be displayed.

### Local Broadcasts:
- **mousedown** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  

## JSON Definition
    {
      "type": "render-debug",
      "acceptInput": {
      	//Optional - What types of input the object should take.
      	"hover": false;
      	"click": false; 
      }, 
      "regX": 0,
      //Optional - The X offset from X position for the displayed shape. If you're using the AABB this is set automatically.
      "regY": 0
      //Optional - The Y offset from Y position for the displayed shape. If you're using the AABB this is set automatically.
    }
    
[link1]: http://createjs.com/Docs/EaselJS/Stage.html
*/

(function(){
	var types = {
		"aabb":      "255,128,255",
		"render":    "128,128,128",
		"collision": "255,0,255",
		"group":     "0,255,0"
	},
	createShape = function(shape, type, width, height, regX, regY, z){
		var newShape = null;
		
		switch(shape){
		case 'rectangle':
			newShape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(" + types[type] + ",0.1)").setStrokeStyle(3).beginStroke("rgb(" + types[type] + ")").rect(0, 0, width, height));
			regX += width/2;
			regY += height/2;
			break;
		case 'circle':
			regX += width/2;
			regY += width/2;
			newShape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(" + types[type] + ",0.1)").setStrokeStyle(3).beginStroke("rgb(" + types[type] + ")").drawCircle(width/2, width/2, width));
			break;
		}
		newShape.regX  = regX;
		newShape.regY  = regY;
		newShape.z = z;
		
		return newShape;
	};
	
	return platformer.createComponentClass({
		
		id: 'render-debug', 
		
		constructor: function(definition){
			if(definition.acceptInput){
				this.hover = definition.acceptInput.hover || false;
				this.click = definition.acceptInput.click || false;
			} else {
				this.hover = false;
				this.click = false;
			}
			
			this.regX = definition.regX || 0;
			this.regY = definition.regY || 0;
			this.stage = undefined;
			this.shapes = [];
		},
		
		events: {// These are messages that this component listens for
			"handle-render-load": function(resp){
				var self = this,
				z        = (this.owner.z || 0) + 10000,
				i        = 0,
				j        = 0,
				width    = this.owner.width  = this.owner.width  || 300,
				height   = this.owner.height = this.owner.height || 100,
				over     = false,
				shapes   = null,
				aabb     = null;
				
				if(resp && resp.stage){
					this.stage = resp.stage;
					
					if(this.owner.getAABB){
						for(j = 0; j < this.owner.collisionTypes.length; j++){
							aabb   = this.owner.getAABB(this.owner.collisionTypes[j]);
							width  = this.initialWidth  = aabb.width;
							height = this.initialHeight = aabb.height;
							shapes = this.owner.getShapes(this.owner.collisionTypes[j]);
							
							this.shapes.push(createShape('rectangle', 'aabb', width, height, this.owner.x - aabb.x, this.owner.y - aabb.y, z--));
							this.stage.addChild(this.shapes[this.shapes.length - 1]);
							
							for(i = 0; i < shapes.length; i++){
								this.shapes.push(createShape(shapes[i].type, 'collision', shapes[i].radius || shapes[i].width, shapes[i].height, -shapes[i].offsetX, -shapes[i].offsetY, z--));
								this.stage.addChild(this.shapes[this.shapes.length - 1]);
							}
						}
					} else {
						this.shapes.push(createShape('rectangle', 'render', width, height, width/2, height/2, z--));
						this.stage.addChild(this.shapes[0]);
					}
					
					this.addInputs();

					if(!platformer.game.settings.debug){
						this.owner.removeComponent(this);
					}
				}
			},
			
			"handle-render": function(){
				var i = 0;
				
/*				if(this.owner.getAABB){
					var aabb   = this.owner.getAABB();
					this.shapes[0].scaleX = aabb.width / this.initialWidth;
					this.shapes[0].scaleY = aabb.height / this.initialHeight;
				}*/
				
				for(i = 0; i < this.shapes.length; i++){
					this.shapes[i].x = this.owner.x;
					this.shapes[i].y = this.owner.y;
				}
				
				if(this.owner.getCollisionGroupAABB){
					var aabb = this.owner.getCollisionGroupAABB();
					if(!this.groupShape){
						this.groupShape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(255,255,0,0.2)").rect(0, 0, 1, 1));
						this.groupShape.regX  = 0.5;
						this.groupShape.regY  = 0.5;
						this.groupShape.z     = (this.owner.z || 0) + 10000;
						this.stage.addChild(this.groupShape);
						console.log(aabb);
					}
					this.groupShape.scaleX = aabb.width;
					this.groupShape.scaleY = aabb.height;
					this.groupShape.x      = aabb.x;
					this.groupShape.y      = aabb.y;
				}
			}
		},
		
		methods:{
			addInputs: (function(){
				var lastEntityLog = null,
				createHandler = function(self, eventName){
					return function(event) {
						self.owner.trigger(eventName, {
							event: event.nativeEvent,
							cjsEvent: event,
							x: (event.stageX * dpr) / self.stage.scaleX + self.camera.x,
							y: (event.stageY * dpr) / self.stage.scaleY + self.camera.y,
							entity: self.owner
						});
						
						if((lastEntityLog !== self.owner) && (event.nativeEvent.button === 2)){
							lastEntityLog = self.owner;
							console.log('This Entity:', lastEntityLog);
						}
					};
				};
				
				return function(){
					var self = this,
					mousedown = null,
					mouseover = null,
					mouseout  = null,
					rollover  = null,
					rollout   = null,
					pressmove = null,
					pressup   = null,
					click     = null,
					dblclick  = null;
					
					// The following appends necessary information to displayed objects to allow them to receive touches and clicks
					if(this.click || this.touch){
						if(this.touch && !this.stage.__touch){ //__touch check due to this being overridden if we do this multiple times. - DDD
							createjs.Touch.enable(this.stage);
						}
						
						mousedown = createHandler(this, 'mousedown');
						pressmove = createHandler(this, 'pressmove');
						pressup   = createHandler(this, 'pressup'  );
						click     = createHandler(this, 'click'    );
						dblclick  = createHandler(this, 'dblclick' );
						
						this.sprite.addEventListener('mousedown', mousedown);
						this.sprite.addEventListener('pressmove', pressmove);
						this.sprite.addEventListener('pressup',   pressup  );
						this.sprite.addEventListener('click',     click    );
						this.sprite.addEventListener('dblclick',  dblclick );
					}
					if(this.hover){
						this.stage.enableMouseOver();
						mouseover = createHandler(this, 'mouseover');
						mouseout  = createHandler(this, 'mouseout' );
						rollover  = createHandler(this, 'rollover' );
						rollout   = createHandler(this, 'rollout'  );

						this.sprite.addEventListener('mouseover', mouseover);
						this.sprite.addEventListener('mouseout',  mouseout );
						this.container.addEventListener('rollover',  rollover );
						this.container.addEventListener('rollout',   rollout  );
					}

					this.removeInputListeners = function(){
						if(this.click || this.touch){
							this.sprite.removeEventListener('mousedown', mousedown);
							this.sprite.removeEventListener('pressmove', pressmove);
							this.sprite.removeEventListener('pressup',   pressup  );
							this.sprite.removeEventListener('click',     click    );
							this.sprite.removeEventListener('dblclick',  dblclick );
						}
						if(this.hover){
							this.sprite.removeEventListener('mouseover', mouseover);
							this.sprite.removeEventListener('mouseout',  mouseout );
							this.container.removeEventListener('rollover',  rollover );
							this.container.removeEventListener('rollout',   rollout  );
						}
					};
				};
			})(),
			
			destroy: function(){
				var i = 0;
				
				for(i = 0; i < this.shapes.length; i++){
					this.stage.removeChild(this.shapes[i]);
				}
				this.shapes.length = 0;
				this.stage = undefined;
			}
		}
	});
})();
