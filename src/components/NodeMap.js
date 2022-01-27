import {arrayCache, greenSplice} from '../utils/array.js';
import Entity from '../Entity.js';
import Vector from '../Vector.js';
import config from 'config';
import createComponentClass from '../factory.js';
import recycle from 'recycle';

export default (function () {
    var Node = function (definition, map) { // This is a basic node object, but can be replaced by entities having a `Node` component if more functionality is needed.
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
            this.contains = arrayCache.setUp();
            this.type = definition.type || '';

            if (!this.position) {
                Vector.assign(this, 'position', 'x', 'y', 'z');
            }
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
                return greenSplice(this.contains, i);
            }
        }
        return false;
    };
    
    recycle.add(Node, 'Node', Node, function () {
        arrayCache.recycle(this.contains);
    }, true, config.dev);
    
    return createComponentClass(/** @lends platypus.components.NodeMap.prototype */{
        id: 'NodeMap',
        
        publicProperties: {
            /**
             * An array of node definitions to create the NodeMap. A node definition can take the following form:
             *
             *         {
             *           "NodeId": "Node1",
             *           // A string or array that becomes the id of the Node. Arrays are joined using "|" to create the id string.
             *           "type": "path",
             *           // A string that determines the type of the node.
             *           "x": 0,
             *           // Sets the x axis position of the node.
             *           "y": 0,
             *           // Sets the y axis position of the node.
             *           "z": 0,
             *           // Sets the z axis position of the node.
             *           "neighbors": {
             *           // A list of key/value pairs where the keys are directions from the node and values are node ids.
             *             "west": "node0",
             *             "east": "node2"
             *           }
             *         }
             *
             * @property map
             * @type Array
             * @default []
             */
            map: []
        },
        
        /**
         * This component sets up a NodeMap to be used by the [NodeResident](platypus.components.NodeResident.html) component on this entity's child entities.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#add-node
         * @listens platypus.Entity#child-entity-added
         * @fires platypus.Entity#add-node
         */
        initialize: function () {
            var i   = 0,
                map = this.map;
            
            this.map   = arrayCache.setUp(); // Original map is node definitions, so we replace it with actual nodes.
            this.nodes = {};
            this.residentsAwaitingNode = arrayCache.setUp();
            
            for (i = 0; i < map.length; i++) {
                this.addNode(Node.setUp(map[i], this));
            }
        },

        events: {
            "add-node": function (nodeDefinition) {
                var i = 0,
                    entity = null,
                    node   = null;
                
                if (nodeDefinition.isNode) {// if it's already a node, put it on the map.
                    node = nodeDefinition;
                    nodeDefinition.map = this;
                } else {
                    node = Node.setUp(nodeDefinition, this);
                }
                
                this.addNode(node);
                
                for (i = this.residentsAwaitingNode.length - 1; i >= 0; i--) {
                    entity = this.residentsAwaitingNode[i];
                    if (node.id === entity.nodeId) {
                        greenSplice(this.residentsAwaitingNode, i);
                        entity.node = this.getNode(entity.nodeId);
                    }
                }
            },

            "child-entity-added": function (entity) {
                if (entity.isNode) {        // a node
                    /**
                     * Expects a node definition to create a node in the NodeMap.
                     *
                     * @event platypus.Entity#add-node
                     * @param definition {Object} Key/value pairs.
                     * @param definition.nodeId {String|Array} This value becomes the id of the Node. Arrays are joined using "|" to create the id string.
                     * @param definition.type {String} This determines the type of the node.
                     * @param definition.x {String} Sets the x axis position of the node.
                     * @param definition.y {String} Sets the y axis position of the node.
                     * @param definition.z {String} Sets the z axis position of the node.
                     * @param definition.neighbors {Object} A list of key/value pairs where the keys are directions from the node and values are node ids. For example: {"west": "node12"}.
                     */
                    this.owner.triggerEvent('add-node', entity);
                } else if (entity.nodeId) { // a NodeResident
                    entity.node = this.getNode(entity.nodeId);
                    if (!entity.node) {
                        this.residentsAwaitingNode.push(entity);
                    }
                }
            }
        },
        
        methods: {
            addNode: function (node) {
                this.map.push(node);
                this.nodes[node.id] = node;
            },
            
            destroy: function () {
                var i = 0;
                
                // Destroy simple node objects.
                for (i = 0; i < this.map.length; i++) {
                    if (!(this.map[i] instanceof Entity)) {
                        this.map[i].recycle();
                    }
                }
                
                arrayCache.recycle(this.map);
                arrayCache.recycle(this.residentsAwaitingNode);
            }
        },
        
        publicMethods: {
            /**
             * Gets a node by node id.
             *
             * @method platypus.components.NodeMap#getNode
             * @param id {String|Array|Node} This id of the node to retrieve. If an array or more than one parameter is supplied, values are concatenated with "|" to create a single string id. Supplying a node returns the same node (useful for processing a mixed list of nodes and node ids).
             */
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

                return this.nodes[id] || null;
            },
            
            /**
             * Finds the closest node to a given point, with respect to any inclusion or exclusion lists.
             *
             * @method platypus.components.NodeMap#getClosestNode
             * @param point {platypus.Vector} A location for which a closest node is being found.
             * @param [including] {Array} A list of nodes to include in the search. If not set, the entire map is searched.
             * @param [excluding] {Array} A list of nodes to exclude from the search.
             */
            getClosestNode: function (point, including, excluding) {
                var i = 0,
                    j = 0,
                    p1 = Vector.setUp(point),
                    p2 = Vector.setUp(),
                    m = 0,
                    list = including || this.map,
                    closest = null,
                    d = Infinity;
                
                for (i = 0; i < list.length; i++) {
                    m = p2.setVector(p1).subtractVector(list[i].position).magnitude();
                    if (m < d) {
                        if (excluding) {
                            j = excluding.indexOf(list[i]);
                            if (j >= 0) {
                                break;
                            }
                        }
                        
                        d = m;
                        closest = list[i];
                    }
                }
                
                p1.recycle();
                p2.recycle();
                
                return closest;
            }
        }
    });
}());
