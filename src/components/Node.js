/**
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
import {arrayCache, greenSplice} from '../utils/array.js';
import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

export default createComponentClass(/** @lends platypus.components.Node.prototype */{
    
    id: 'Node',

    properties: {
        /**
         * If provided, treats these property names as neighbors, assigning them to the neighbors object. For example, ["east", "west"] creates `entity.east` and `entity.west` entity properties that are pointers to those neighbors.
         *
         * @property neighborProperties
         * @type Array
         * @default null
         */
        neighborProperties: null
    },
    
    publicProperties: {
        x: 0,
        y: 0,
        z: 0
    },
    
    /**
     * This component causes an entity to be a position on a [[NodeMap]]. This component should not be confused with `NodeResident` which should be used on entities that move around on a NodeMap: `Node` simply represents a non-moving location on the NodeMap.
     * 
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @param {*} definition 
     */
    initialize: function (definition) {
        const owner = this.owner;

        this.nodeId = definition.nodeId || owner.nodeId || owner.id || String(Math.random());
        
        if ((typeof this.nodeId !== 'string') && (this.nodeId.length)) {
            this.nodeId = definition.nodeId.join('|');
        }
        
        owner.nodeId = this.nodeId;
        
        owner.isNode = true;
        this.map = owner.map = owner.map || owner.parent || null;
        this.contains = owner.contains = arrayCache.setUp();
        this.edgesContain = owner.edgesContain = arrayCache.setUp();
        
        Vector.assign(owner, 'position', 'x', 'y', 'z');
        
        this.neighbors = owner.neighbors = definition.neighbors || owner.neighbors || {};
        
        if (this.neighborProperties) {
            const properties = this.neighborProperties;

            for (let i = 0; i < properties.length; i++) {
                const
                    propertyName = properties[i],
                    value = owner[propertyName];

                if (value) {
                    this.neighbors[propertyName] = value;
                }
                Object.defineProperty(owner, propertyName, {
                    get: () => this.neighbors[propertyName],
                    set: (value) => {
                        if (value !== this.neighbors[propertyName]) {
                            this.neighbors[propertyName] = value;
                            for (let i = 0; i < this.contains.length; i++) {
                                this.contains[i].triggerEvent('set-directions');
                            }
                        }
                    }
                });
            }
        }
    },
    
    events: {
        "add-neighbors": function (neighbors) {
            for (const direction in neighbors) {
                if (neighbors.hasOwnProperty(direction)) {
                    this.neighbors[direction] = neighbors[direction];
                }
            }
            
            for (let i = 0; i < this.contains.length; i++) {
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
            arrayCache.recycle(this.contains);
            this.contains = this.owner.contains = null;
            arrayCache.recycle(this.edgesContain);
            this.edgesContain = this.owner.edgesContain = null;
        }
    },
    
    publicMethods: {
        /**
         * Gets a neighboring node Entity.
         * 
         * @memberof Node.prototype
         * @param {String} desc Describes the direction to check.
         * @returns {platypus.Entity}
         */
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

        /**
         * Puts an entity on this node.
         * 
         * @memberof Node.prototype
         * @param {platypus.Entity} entity
         * @returns {platypus.Entity}
         */
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

        /**
         * Removes an entity from this node.
         * 
         * @memberof Node.prototype
         * @param {platypus.Entity} entity
         * @returns {platypus.Entity}
         */
        removeFromNode: function (entity) {
            var i = 0;
            
            for (i = 0; i < this.contains.length; i++) {
                if (this.contains[i] === entity) {
                    return greenSplice(this.contains, i);
                }
            }
            return false;
        },

        /**
         * Adds an entity to this node's edges.
         * 
         * @memberof Node.prototype
         * @param {platypus.Entity} entity
         * @returns {platypus.Entity}
         */
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

        /**
         * Removes an entity from this node's edges.
         * 
         * @memberof Node.prototype
         * @param {platypus.Entity} entity
         * @returns {platypus.Entity}
         */
        removeFromEdge: function (entity) {
            var i = 0;
            
            for (i = 0; i < this.edgesContain.length; i++) {
                if (this.edgesContain[i] === entity) {
                    return greenSplice(this.edgesContain, i);
                }
            }
            return false;
        }
    }
});
