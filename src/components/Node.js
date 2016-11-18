/**
# COMPONENT **Node**
This component causes an entity to be a position on a [[NodeMap]]. This component should not be confused with `NodeResident` which should be used on entities that move around on a NodeMap: `Node` simply represents a non-moving location on the NodeMap.
  
## JSON Definition
    {
      "type": "NodeResident",
      
      "nodeId": "city-hall",
      // Optional. The id of the node that this entity should start on. Uses the entity's nodeId property if not set here.
      
      "nodes": ['path','sidewalk','road'],
      // Optional. This is a list of node types that this entity can reside on. If not set, entity can reside on any type of node.
      
      "shares": ['friends','neighbors','city-council-members'],
      // Optional. This is a list of entities that this entity can reside with on the same node. If not set, this entity cannot reside with any entities on the same node.
      
      "speed": 5,
      // Optional. Sets the speed with which the entity moves along an edge to an adjacent node. Default is 0 (instantaneous movement).
      
      "updateOrientation": true
      // Optional. Determines whether the entity's orientation is updated by movement across the NodeMap. Default is false.
    }
*/
/* global platypus */
(function () {
    'use strict';
    
    return platypus.createComponentClass({
        
        id: 'Node',
        
        publicProperties: {
            x: 0,
            y: 0,
            z: 0
        },
        
        initialize: function (definition) {
            this.nodeId = definition.nodeId || this.owner.nodeId || this.owner.id || String(Math.random());
            
            if ((typeof this.nodeId !== 'string') && (this.nodeId.length)) {
                this.nodeId = definition.nodeId.join('|');
            }
            
            this.owner.nodeId = this.nodeId;
            
            this.owner.isNode = true;
            this.map = this.owner.map = this.owner.map || null;
            this.contains = this.owner.contains = Array.setUp();
            this.edgesContain = this.owner.edgesContain = Array.setUp();
            
            platypus.Vector.assign(this.owner, 'position', 'x', 'y', 'z');
            
            this.neighbors = this.owner.neighbors = definition.neighbors || this.owner.neighbors || {};
        },
        
        events: {
            "add-neighbors": function (neighbors) {
                var i = 0,
                    direction = null;
                
                for (direction in neighbors) {
                    if (neighbors.hasOwnProperty(direction)) {
                        this.neighbors[direction] = neighbors[direction];
                    }
                }
                
                for (i = 0; i < this.contains.length; i++) {
                    this.contains[i].triggerEvent('set-directions');
                }
            },
            "remove-neighbor": function (nodeOrNodeId) {
                var i  = null,
                    id = nodeOrNodeId;
                
                if (typeof id !== 'string') {
                    id = id.nodeId;
                }

                for (i in this.neighbors) {
                    if (this.neighbors.hasOwnProperty(i)) {
                        if (typeof this.neighbors[i] === 'string') {
                            if (this.neighbors[i] === id) {
                                delete this.neighbors[i];
                                break;
                            }
                        } else if (this.neighbors[i].nodeId === id) {
                            delete this.neighbors[i];
                            break;
                        }
                    }
                }
            }
        },
        
        methods: {
            destroy: function () {
                this.contains.recycle();
                this.edgesContain.recycle();
            }
        },
        
        publicMethods: {
            getNode: function (desc) {
                var neighbor = null;
                
                //map check
                if (!this.map && this.owner.map) {
                    this.map = this.owner.map;
                }
                
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
                    } else if (neighbor.length) {
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
            },
            addToNode: function (entity) {
                var i = 0;
                
                for (i = 0; i < this.contains.length; i++) {
                    if (this.contains[i] === entity) {
                        return false;
                    }
                }
                this.contains.push(entity);
                return entity;
            },
            removeFromNode: function (entity) {
                var i = 0;
                
                for (i = 0; i < this.contains.length; i++) {
                    if (this.contains[i] === entity) {
                        return this.contains.greenSplice(i);
                    }
                }
                return false;
            },
            addToEdge: function (entity) {
                var i = 0;
                
                for (i = 0; i < this.edgesContain.length; i++) {
                    if (this.edgesContain[i] === entity) {
                        return false;
                    }
                }
                this.edgesContain.push(entity);
                return entity;
            },
            removeFromEdge: function (entity) {
                var i = 0;
                
                for (i = 0; i < this.edgesContain.length; i++) {
                    if (this.edgesContain[i] === entity) {
                        return this.edgesContain.greenSplice(i);
                    }
                }
                return false;
            }
        }
    });
}());
