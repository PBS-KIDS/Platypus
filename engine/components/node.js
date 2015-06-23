/**
# COMPONENT **node**
This component causes an entity to be a position on a [[node-map]]. This component should not be confused with `node-resident` which should be used on entities that move around on a node-map: `node` simply represents a non-moving location on the node-map.

## Dependencies
- [[node-map]] (on entity's parent) - This component uses the `node-map` to determine its location and navigate to other nodes.
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location and triggers messages regarding its neighbors.
  - @param message.delta (Number) - This component uses the current time to determine its progress along an edge if moving from node to node on the map.
- **on-node** - Sets the entity's position to the sent node, updates its coordinates, and triggers messages regarding its neighbors if any.
  - @param node (Node) - The node that this entity should be located on.
- **leave-node** - Removes the entity from its current node if it's on one.
- **goto-node** - Begins moving the entity along edges to get to sent node.
  - @param node (Node) - The node that this entity should move to.
- **follow** - Causes this entity to follow another entity. The leading entity must also have a `node-resident` component and exist in the node-map.
  - @param entity (Entity) - The entity that this entity should follow.

### Local Broadcasts:
- **next-to-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all neighboring entities, as well as on itself on behalf of neighboring entities.
  - @param entity (Entity) - The entity that is next to the listening entity.
- **with-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all entities residing on the same node, as well as on itself on behalf of all resident entities.
  - @param entity (Entity) - The entity that is with the listening entity.
- **left-node** - Triggered when the entity leaves a node.
  - @param node (Node) - The node that the entity just left.
- **[Messages specified in definition]** - When the entity is placed on a node, it checks out the type of node and triggers a message on the entity if an event is listed for the current node type.

## States
- **on-node** - This state is true when the entity is on a node.
- **moving** - This state is true when the entity is moving from one node to another.
- **going-[direction]** - This state is true when the entity is moving (or has just moved) in a direction (determined by the node-map) from one node to another.
  
## JSON Definition
    {
      "type": "node-resident",
      
      "nodeId": "city-hall",
      // Optional. The id of the node that this entity should start on. Uses the entity's nodeId property if not set here.
      
      "nodes": ['path','sidewalk','road'],
      // Optional. This is a list of node types that this entity can reside on. If not set, entity can reside on any type of node.
      
      "shares": ['friends','neighbors','city-council-members'],
      // Optional. This is a list of entities that this entity can reside with on the same node. If not set, this entity cannot reside with any entities on the same node.
      
      "speed": 5,
      // Optional. Sets the speed with which the entity moves along an edge to an adjacent node. Default is 0 (instantaneous movement).
      
      "updateOrientation": true
      // Optional. Determines whether the entity's orientation is updated by movement across the node-map. Default is false.
    }
*/
(function(){
	return platformer.createComponentClass({
		
		id: 'node',
		
		publicProperties: {
			x: 0,
			y: 0,
			z: 0
		},
		
		constructor: function(definition){
			this.nodeId = definition.nodeId || this.owner.nodeId || this.owner.id || '' + Math.random();
			
			if((typeof this.nodeId !== 'string') && (this.nodeId.length)){
				this.nodeId = definition.nodeId.join('|');
			}
			
			this.owner.nodeId = this.nodeId;
			
			this.owner.isNode = true;
			this.map = this.owner.map = this.owner.map || null;
			this.contains = this.owner.contains = [];
			this.edgesContain = this.owner.edgesContain = [];
			
			platformer.Vector.assign(this.owner, 'position', 'x', 'y', 'z');
			
			this.neighbors = this.owner.neighbors = definition.neighbors || this.owner.neighbors || {};
		},
		
		events: {
			"add-neighbors": function(neighbors){
				var i     = 0,
				direction = null;
				
				for(direction in neighbors){
					this.neighbors[direction] = neighbors[direction];
				}
				
				for(; i < this.contains.length; i++){
					this.contains[i].triggerEvent('set-directions');
				}
			},
			"remove-neighbor": function(nodeOrNodeId){
				var i = null,
				id    = nodeOrNodeId;
				
				if(typeof id !== 'string'){
					id = id.nodeId;
				}

				for(i in this.neighbors){
					if(typeof this.neighbors[i] === 'string'){
						if(this.neighbors[i] === id){
							delete this.neighbors[i];
							break;
						}
					} else {
						if(this.neighbors[i].nodeId === id){
							delete this.neighbors[i];
							break;
						}
					}
				}
			}
		},
		
		publicMethods:{
			getNode: function(desc){
				var neighbor = null;
				
				//map check
				if(!this.map && this.owner.map){
					this.map = this.owner.map;
				}
				
				if(this.neighbors[desc]){
					neighbor = this.neighbors[desc];
					if(neighbor.isNode){
						return neighbor;
					} else if(typeof neighbor === 'string'){
						neighbor = this.map.getNode(neighbor);
						if(neighbor){
							this.neighbors[desc] = neighbor;
							return neighbor;
						}
					} else if (neighbor.length) {
						neighbor = this.map.getNode(neighbor.join('|'));
						if(neighbor){
							this.neighbors[desc] = neighbor;
							return neighbor;
						}
					}
					return null;
				} else {
					return null;
				}
			},
			addToNode: function(entity){
				for(var i = 0; i < this.contains.length; i++){
					if(this.contains[i] === entity){
						return false;
					}
				}
				this.contains.push(entity);
				return entity;
			},
			removeFromNode: function(entity){
				for(var i = 0; i < this.contains.length; i++){
					if(this.contains[i] === entity){
						return this.contains.splice(i,1)[0];
					}
				}
				return false;
			},
			addToEdge: function(entity){
				for(var i = 0; i < this.edgesContain.length; i++){
					if(this.edgesContain[i] === entity){
						return false;
					}
				}
				this.edgesContain.push(entity);
				return entity;
			},
			removeFromEdge: function(entity){
				for(var i = 0; i < this.edgesContain.length; i++){
					if(this.edgesContain[i] === entity){
						return this.edgesContain.splice(i,1)[0];
					}
				}
				return false;
			}
		}
	});
})();
