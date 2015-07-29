/**
# COMPONENT **NodeMap**
This component sets up a NodeMap to be used by the [[NodeResident]] component on this entity's child entities.

## Dependencies
- [[EntityContainer]] - This component expects the entity to have an `EntityContainer` component so it knows when `NodeResident` children are added.

## Messages

### Listens for:
- **add-node** - Expects a node definition to create a node in the NodeMap.
  - @param definition.nodeId (string or array) - This value becomes the id of the Node. Arrays are joined using "|" to create the id string.
  - @param definition.type (string) - This determines the type of the node.
  - @param definition.x (number) - Sets the x axis position of the node.
  - @param definition.y (number) - Sets the y axis position of the node.
  - @param definition.z (number) - Sets the z axis position of the node.
  - @param definition.neighbors (object) - A list of key/value pairs where the keys are directions from the node and values are node ids. For example: {"west": "node12"}.
- **child-entity-added** - Checks the child entity for a nodeId and if found adds the child to the corresponding node.
  - @param entity (Entity) - The entity that may be placed on a node.

## JSON Definition
    {
      "type": "NodeMap"
      
      "map": [
      // Optional. An array of node definitions to create the NodeMap.
        
        {
          "NodeId": "Node1",
          // A string or array that becomes the id of the Node. Arrays are joined using "|" to create the id string.
          
          "type": "path",
          // A string that determines the type of the node.
          
          "x": 0,
          // Sets the x axis position of the node.
          
          "y": 0,
          // Sets the y axis position of the node.
          
          "z": 0,
          // Sets the z axis position of the node.

          "neighbors": {
          // A list of key/value pairs where the keys are directions from the node and values are node ids.
            
            "west": "node0",
            "east": "node2"
          }
        }
      ]
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    // This is a basic node object, but can be replaced by entities having a `Node` component if more functionality is needed.
    var Node = function (definition, map) {
            if (definition.id) {
                if (typeof definition.id === 'string') {
                    this.id = definition.id;
                } else if (Array.isArray(definition.id)) {
                    this.id = definition.id.join('|');
                } else {
                    this.id = String(Math.random());
                }
            } else {
                this.id = String(Math.random());
            }

            this.isNode = true;
            this.map = map;
            this.contains = [];
            this.type = definition.type || '';
            this.x = definition.x || 0;
            this.y = definition.y || 0;
            this.z = definition.z || 0;

            this.neighbors = definition.neighbors || {};
        },
        proto = Node.prototype;
	
    proto.getNode = function (desc) {
        var neighbor = null;
        
        if (this.neighbors[desc]) {
            neighbor = this.neighbors[desc];
            if (neighbor.isNode) {
                return neighbor;
            } else if (typeof neighbor === 'string') {
                neighbor = this.map.getNode(neighbor);
                if (neighbor) {
                    this.neighbors[desc] = neighbor;
                    return neighbor;
                }
            } else if (Array.isArray(neighbor)) {
                neighbor = this.map.getNode(neighbor.join('|'));
                if (neighbor) {
                    this.neighbors[desc] = neighbor;
                    return neighbor;
                }
            }
            return null;
        } else {
            return null;
        }
    };

    proto.add = function (entity) {
        var i = 0;
        
        for (i = 0; i < this.contains.length; i++) {
            if (this.contains[i] === entity) {
                return false;
            }
        }
        this.contains.push(entity);
        return entity;
    };
    
    proto.remove = function (entity) {
        var i = 0;
        
        for (i = 0; i < this.contains.length; i++) {
            if (this.contains[i] === entity) {
                return this.contains.splice(i, 1)[0];
            }
        }
        return false;
    };
	
	return platypus.createComponentClass({
		id: 'NodeMap',
		
        constructor: function (definition) {
            var i = 0;
            
            this.owner.map = this.map = [];
            
            this.residentsAwaitingNode = [];
            
            if (definition.map) {
                for (i = 0; i < definition.map.length; i++) {
                    this.map.push(new Node(definition.map[i], this));
                }
            }
        },

        events: {
            "add-node": function (nodeDefinition) {
                var i = 0,
                    entity = null,
                    node   = null;
                
				if(nodeDefinition.isNode){// if it's already a node, put it on the map.
					node = nodeDefinition;
                    nodeDefinition.map = this;
				} else {
                    node = new Node(nodeDefinition, this);
				}

				this.map.push(node);
                
                for (i = this.residentsAwaitingNode.length - 1; i >= 0; i--) {
                    entity = this.residentsAwaitingNode[i];
                    if (node.id === entity.nodeId) {
                        this.residentsAwaitingNode.splice(i, 1);
        				entity.node = this.getNode(entity.nodeId);
       					entity.triggerEvent('on-node', entity.node);
                    }
                }
			},
			"child-entity-added": function (entity) {
				if(entity.isNode){        // a node
					this.owner.triggerEvent('add-node', entity);
				} else if(entity.nodeId){ // a NodeResident
					entity.node = this.getNode(entity.nodeId);
                    if(!entity.node){
                        this.residentsAwaitingNode.push(entity);
                    } else {
    					entity.triggerEvent('on-node', entity.node);
                    }
				}
			}
		},
		
		publicMethods: {
			getNode: function () {
                var i       = 0,
                    id      = '',
                    divider = '',
                    args    = arguments;
                
                if (args.length === 1) {
                    if (args[0].isNode) {
						return args[0];
					} else if (Array.isArray(args[0])) {
						args = args[0];
					}
				}
				
                for (i = 0; i < args.length; i++) {
                    id += divider + args[i];
                    divider = '|';
                }
                for (i = 0; i < this.map.length; i++) {
                    if (this.map[i].id === id) {
                        return this.map[i];
                    }
                }
                return null;
            },
            
            /**
             * Finds the closest node to a given point, with respect to any inclusion or exclusion lists.
             */
            getClosestNode: (function(){
                var v1 = new platypus.Vector(0, 0, 0),
                    v2 = new platypus.Vector(0, 0, 0);

                return function (point, including, excluding) {
                    var i = 0,
                        j = 0,
                        p1 = v1.set(point),
                        p2 = v2,
                        m = 0,
                        list = including || this.map,
                        closest = null,
                        exclude = false,
                        d = Infinity;
                    
                    for (i = 0; i < list.length; i++) {
                        m = p2.set(p1).subtractVector(list[i].position).magnitude();
                        if (m < d) {
                            if (excluding) {
                                exclude = false;
                                for (j = 0; j < excluding.length; j++) {
                                    if (excluding[j] === list[i]) {
                                        exclude = true;
                                        break;
                                    }
                                }
                                if (exclude) {
                                    break;
                                }
                            }
                            
                            d = m;
                            closest = list[i];
                        }
                    }
                    
                    return closest;
                };
            }())
        }
    });
}());
