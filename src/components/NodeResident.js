/**
# COMPONENT **NodeResident**

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
- **going-[direction]** - This state is true when the entity is moving (or has just moved) in a direction (determined by the NodeMap) from one node to another.
  
## JSON Definition
    {
      "type": "NodeResident",
      
      "nodeId": "city-hall",
      // Optional. The id of the node that this entity should start on. Uses the entity's nodeId property if not set here.
      
      "nodes": {"path": "walking", "sidewalk": "walking", "road": "driving"],
      // Optional. This is a list of node types that this entity can reside on. If not set, entity can reside on any type of node.
      
      "shares": ['friends','neighbors','city-council-members'],
      // Optional. This is a list of entities that this entity can reside with on the same node. If not set, this entity can reside with any entities on the same node.
      
      "speed": 5,
      // Optional. Sets the speed with which the entity moves along an edge to an adjacent node. Default is 0 (instantaneous movement).
      
      "updateOrientation": true
      // Optional. Determines whether the entity's orientation is updated by movement across the NodeMap. Default is false.
    }
*/
import {arrayCache, greenSlice} from '../utils/array.js';
import createComponentClass from '../factory.js';

export default (function () {
    var createGateway = function (nodeDefinition, map, gateway) {
            return function () {
                // ensure it's a node if one is available at this gateway
                var node = map.getNode(nodeDefinition);

                if (this.isPassable(node)) {
                    this.destinationNodes.length = 0;
                    this.destinationNodes.push(node);

                    if (this.node) {
                        this.onEdge(node);
                    } else {
                        this.distance = 0;
                    }
                    this.progress = 0;

                    this.setState('going-' + gateway);
                    return true;
                }

                return false;
            };
        },
        distance = function (origin, destination) {
            var x = destination.x - origin.x,
                y = destination.y - origin.y,
                z = destination.z - origin.z;

            return Math.sqrt(x * x + y * y + z * z);
        },
        angle = function (origin, destination, distance, ratio) {
            var x = destination.x - origin.x,
                y = destination.y - origin.y,
                a = 0;

            if (origin.rotation && destination.rotation) {
                x = (origin.rotation + 180) % 360;
                y = (destination.rotation + 180) % 360;
                return (x * (1 - ratio) + y * ratio + 180) % 360;
            } else {
                if (!distance) {
                    return a;
                }

                a = Math.acos(x / distance);
                if (y < 0) {
                    a = (Math.PI * 2) - a;
                }
                return a * 180 / Math.PI;
            }
        },
        axisProgress = function (r, o, d, f) {
            return o * (1 - r) + d * r + f;
        },
        isFriendly = function (entities, kinds) {
            var x = 0,
                y = 0,
                found = false;

            if (kinds === null) {
                return true;
            }

            for (x = 0; x < entities.length; x++) {
                for (y = 0; y < kinds.length; y++) {
                    if (entities[x].type === kinds[y]) {
                        found = true;
                    }
                }
                if (!found) {
                    return false;
                } else {
                    found = false;
                }
            }

            return true;
        };

    return createComponentClass(/** @lends platypus.components.NodeResident.prototype */{
        
        id: 'NodeResident',

        properties: {
            /**
             * This sets the resident's initial node.
             *
             * @property node
             * @type Object
             * @default null
             */
            node: null
        },
        
        publicProperties: {
            /**
             * This describes the rate at which a node resident should progress along an edge to another node. This property is set on the entity itself and can be manipulated in real-time.
             *
             * @property speed
             * @type Number
             * @default 0
             */
            speed: 0
        },
        
        /**
         * This component connects an entity to its parent's [[NodeMap]]. It manages navigating the NodeMap and triggering events on the entity related to its position.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-logic
         * @fires platypus.Entity#in-location
         */
        initialize: function (definition) {
            const
                offset = definition.offset || this.owner.nodeOffset || {},
                startingNode = this.node;
            
            this.nodeId = this.owner.nodeId = definition.nodeId || this.owner.nodeId;
            
            this.neighbors = {};
            this.friendlyNodes = definition.nodes || null;
            this.friendlyEntities = definition.shares || null;
            this.snapToNodes = definition.snapToNodes || false;
            this.updateOrientation = definition.updateOrientation || false;
            this.distance = 0;
            this.buffer   = definition.buffer || 0;
            this.progress = 0;
            this.offset = {
                x: offset.x || 0,
                y: offset.y || 0,
                z: offset.z || 0
            };
            this.destinationNodes = arrayCache.setUp();
            this.algorithm = definition.algorithm || distance;
            
            this.state = this.owner.state;
            this.state.set('moving', false);
            this.state.set('on-node', false);
            this.currentState = '';

            Object.defineProperty(this.owner, 'node', {
                get: () => this.node,
                set: (value) => {
                    if (value) {
                        this.getOnNode(value);
                    } else {
                        this.getOffNode();
                    }
                }
            });
            this.owner.node = startingNode;
        },
        
        events: {
            "set-algorithm": function (algorithm) {
                this.algorithm = algorithm || distance;
            },
            "handle-logic": function (resp) {
                var i = 0,
                    ratio    = 0,
                    momentum = 0,
                    node     = null,
                    arr = null;
                
                if (!this.owner.node) {
                    arr = arrayCache.setUp(this.owner.x, this.owner.y);
                    this.owner.node = this.owner.parent.getClosestNode(arr);
                    arrayCache.recycle(arr);
                    
                    /**
                     * This event is triggered if the entity is placed on the map but not assigned a node. It is moved to the nearest node and "in-location" is triggered.
                     *
                     * @event platypus.Entity#in-location
                     * @param entity {platypus.Entity} The entity that is in location.
                     */
                    this.owner.triggerEvent('in-location', this.owner);
                }

                if (this.followEntity) {
                    node = this.followEntity.node || this.followEntity;
                    if (node && node.isNode && (node !== this.node)) {
                        this.lag = 0;
                        this.state.set('moving', this.gotoNode());
                        if (this.followDistance) {
                            momentum = this.lag;
                        }
                    } else {
                        this.followEntity = null;
                    }
                } else {
                    momentum = this.speed * resp.delta;
                }

                // if goto-node was blocked, try again.
                if (this.blocked) {
                    this.blocked = false;
                    if (this.goingToNode) {
                        this.owner.triggerEvent('goto-closest-node', this.goingToNode);
                    }
                }
                
                if (this.destinationNodes.length) {
                    this.state.set('moving', (this.speed !== 0));
                    if (this.node) {
                        this.onEdge(this.destinationNodes[0]);
                    } else if (!this.lastNode) {
                        this.owner.node = this.destinationNodes[0];
                        this.destinationNodes.shift();
                        if (!this.destinationNodes.length) {
                            this.state.set('moving', false);
                            return;
                        }
                    }
                    
                    if (this.snapToNodes) {
                        for (i = 0; i < this.destinationNodes.length; i++) {
                            this.owner.node = this.destinationNodes[i];
                        }
                        this.destinationNodes.length = 0;
                    } else {
                        while (this.destinationNodes.length && momentum) {
                            if ((this.progress + momentum) >= this.distance) {
                                node = this.destinationNodes[0];
                                momentum -= (this.distance - this.progress);
                                this.progress = 0;
                                this.destinationNodes.shift();
                                this.owner.node = node;
                                if (this.destinationNodes.length && momentum) {
                                    this.onEdge(this.destinationNodes[0]);
                                }
                            } else {
                                this.progress += momentum;
                                ratio = this.progress / this.distance;
                                this.owner.x = axisProgress(ratio, this.lastNode.x, this.destinationNodes[0].x, this.offset.x);
                                this.owner.y = axisProgress(ratio, this.lastNode.y, this.destinationNodes[0].y, this.offset.y);
                                this.owner.z = axisProgress(ratio, this.lastNode.z, this.destinationNodes[0].z, this.offset.z);
                                if (this.updateOrientation) {
                                    this.owner.rotation = angle(this.lastNode, this.destinationNodes[0], this.distance, ratio);
                                }
                                momentum = 0;
                            }
                        }
                    }
                } else {
                    this.state.set('moving', false);
                }
            },
            "goto-node": function (node) {
                this.gotoNode(node);
            },
            "follow": function (entityOrNode) {
                if (entityOrNode.entity) {
                    this.followDistance = entityOrNode.distance;
                    this.followEntity = entityOrNode.entity;
                } else {
                    this.followDistance = 0;
                    this.followEntity = entityOrNode;
                }
            },
            "goto-closest-node": (function () {
                var checkList = function (here, list) {
                        var i = 0;

                        for (i = 0; i < list.length; i++) {
                            if (list[i] === here) {
                                return true;
                            }
                        }

                        return false;
                    },
                    checkType = function (here, type) {
                        return (here.type === type);
                    },
                    checkObjectType = function (here, node) {
                        return (here.type === node.type);
                    };
                
                return function (nodesOrNodeType) {
                    var travResp = null,
                        depth    = 20, //arbitrary limit
                        origin   = this.node || this.lastNode,
                        test     = null,
                        steps    = nodesOrNodeType.steps || 0,
                        nodes    = null;

                    this.goingToNode = nodesOrNodeType;
                    
                    if (typeof nodesOrNodeType === 'string') {
                        test = checkType;
                    } else if (typeof nodesOrNodeType.type === 'string') {
                        test = checkObjectType;
                    } else {
                        test = checkList;
                    }
                    
                    if (origin && nodesOrNodeType && !test(origin, nodesOrNodeType)) {
                        nodes = arrayCache.setUp();
                        travResp = this.traverseNode({
                            depth: depth,
                            origin: origin,
                            position: origin,
                            test: test,
                            destination: nodesOrNodeType,
                            nodes: nodes,
                            shortestPath: Infinity,
                            distance: 0,
                            found: false,
                            algorithm: this.algorithm,
                            blocked: false
                        });
                        
                        travResp.distance -= this.progress;
                        
                        if (travResp.found) {
                            //TODO: should probably set this up apart from this containing function
                            if (this.followEntity) {
                                if (!this.followDistance) {
                                    this.setPath(travResp, steps);
                                } else if ((travResp.distance + (this.followEntity.progress || 0)) > this.followDistance) {
                                    this.lag = travResp.distance + (this.followEntity.progress || 0) - this.followDistance;
                                    this.setPath(travResp, steps);
                                } else {
                                    this.lag = 0;
                                }
                            } else {
                                this.setPath(travResp, steps);
                            }
                        } else if (travResp.blocked) {
                            this.blocked = true;
                        }
                        
                        arrayCache.recycle(nodes);
                    }
                };
            }()),
            "set-directions": function () {
                var i = '',
                    j = 0,
                    entities = null,
                    node     = this.node,
                    nextNode = null;
                
                this.owner.triggerEvent('remove-directions');
                
                for (i in node.neighbors) {
                    if (node.neighbors.hasOwnProperty(i)) {
                        this.neighbors[i] = createGateway(node.neighbors[i], node.map, i);
                        this.addEventListener(i, this.neighbors[i]);

                        //trigger "next-to" events
                        nextNode = node.map.getNode(node.neighbors[i]);
                        if (nextNode) {
                            entities = nextNode.contains;
                            for (j = 0; j < entities.length; j++) {
                                entities[j].triggerEvent("next-to-" + this.owner.type, this.owner);
                                this.owner.triggerEvent("next-to-" + entities[j].type, entities[j]);
                            }
                        }
                    }
                }
            },
            "remove-directions": function () {
                var i = '';
                
                for (i in this.neighbors) {
                    if (this.neighbors.hasOwnProperty(i)) {
                        this.removeEventListener(i, this.neighbors[i]);
                        delete this.neighbors[i];
                    }
                }
            }
        },
        
        methods: {
            gotoNode: (function () {
                var test = function (here, there) {
                    return (here === there);
                };
                
                return function (node) {
                    var travResp = null,
                        depth = 20, //arbitrary limit
                        origin = this.node || this.lastNode,
                        nodes = null,
                        moving = false;
                    
                    if (!node && this.followEntity) {
                        node = this.followEntity.node || this.followEntity.lastNode || this.followEntity;
                    }
                    
                    if (origin && node && (this.node !== node)) {
                        nodes = arrayCache.setUp();
                        
                        travResp = this.traverseNode({
                            depth: depth,
                            origin: origin,
                            position: origin,
                            test: test,
                            destination: node,
                            nodes: nodes,
                            shortestPath: Infinity,
                            distance: 0,
                            found: false,
                            algorithm: this.algorithm,
                            blocked: false
                        });
                        
                        travResp.distance -= this.progress;
                        
                        if (travResp.found) {
                            //TODO: should probably set this up apart from this containing function
                            if (this.followEntity) {
                                if (!this.followDistance) {
                                    this.setPath(travResp);
                                    moving = true;
                                } else if ((travResp.distance + (this.followEntity.progress || 0)) > this.followDistance) {
                                    this.lag = travResp.distance + (this.followEntity.progress || 0) - this.followDistance;
                                    this.setPath(travResp);
                                    moving = true;
                                } else {
                                    this.lag = 0;
                                }
                            } else {
                                this.setPath(travResp);
                                moving = true;
                            }
                        } else if (travResp.blocked) {
                            this.blocked = true;
                        }
                        
                        arrayCache.recycle(nodes);
                    }
                    
                    return moving;
                };
            }()),

            getOnNode: function (node) {
                var j = 0,
                    entities = null;
                
                this.node = node;
                this.node.removeFromEdge(this.owner);
                if (this.lastNode) {
                    this.lastNode.removeFromEdge(this.owner);
                }
                this.node.addToNode(this.owner);
                
                this.setState('on-node');
                
                this.owner.x = this.node.x + this.offset.x;
                this.owner.y = this.node.y + this.offset.y;
                this.owner.z = this.node.z + this.offset.z;
                if (this.updateOrientation && this.node.rotation) {
                    this.owner.rotation = this.node.rotation;
                }
                
                //add listeners for directions
                this.owner.triggerEvent('set-directions');
                
                //trigger mapped messages for node types
                if (this.friendlyNodes && this.friendlyNodes[node.type]) {
                    this.owner.trigger(this.friendlyNodes[node.type], node);
                }

                //trigger "with" events
                entities = node.contains;
                for (j = 0; j < entities.length; j++) {
                    if (this.owner !== entities[j]) {
                        entities[j].triggerEvent("with-" + this.owner.type, this.owner);
                        this.owner.triggerEvent("with-" + entities[j].type, entities[j]);
                    }
                }

                this.owner.triggerEvent('on-node', node);
            },

            getOffNode: function () {
                if (this.node) {
                    this.node.removeFromNode(this.owner);
                    this.owner.triggerEvent('left-node', this.node);
                    this.owner.triggerEvent('remove-directions');
                }
                this.lastNode = this.node;
                this.node = null;
            },

            isPassable: function (node) {
                return node && (this.node !== node) && (!this.friendlyNodes || (typeof this.friendlyNodes[node.type] !== 'undefined')) && (!node.contains.length || isFriendly(node.contains, this.friendlyEntities));
            },
            traverseNode: function (record) {
                //TODO: may want to make this use A*. Currently node traversal order is arbitrary and essentially searches entire graph, but does clip out paths that are too long.
                
                var i         = 1,
                    j         = '',
                    map       = record.position.map,
                    neighbors = null,
                    node      = null,
                    nodeList  = null,
                    resp      = null,
                    algorithm = record.algorithm || distance,
                    savedResp = {
                        shortestPath: Infinity,
                        found: false,
                        blocked: false
                    },
                    blocked   = true,
                    hasNeighbor = false;

                if ((record.depth === 0) || (record.distance > record.shortestPath)) {
                    // if we've reached our search depth or are following a path longer than our recorded successful distance, bail
                    return record;
                } else if (record.test(record.position, record.destination)) {
                    // if we've reached our destination, set shortest path information and bail.
                    record.found = true;
                    record.shortestPath = record.distance;
                    return record;
                } else {
                    //Make sure we do not trace an infinite node loop.
                    nodeList = record.nodes;
                    for (i = 1; i < nodeList.length - 1; i++) {
                        if (nodeList[i] === record.position) {
                            return record;
                        }
                    }
                        
                    neighbors = record.position.neighbors;
                    for (j in neighbors) {
                        if (neighbors.hasOwnProperty(j)) {
                            node = map.getNode(neighbors[j]);
                            hasNeighbor = true;
                            if (this.isPassable(node)) {
                                nodeList = greenSlice(record.nodes);
                                nodeList.push(node);
                                resp = this.traverseNode({
                                    depth: record.depth - 1,
                                    origin: record.origin,
                                    position: node,
                                    destination: record.destination,
                                    test: record.test,
                                    algorithm: algorithm,
                                    nodes: nodeList,
                                    shortestPath: record.shortestPath,
                                    distance: record.distance + algorithm(record.position, node),
                                    gateway: record.gateway || j,
                                    found: false,
                                    blocked: false
                                });
                                arrayCache.recycle(nodeList);
                                if (resp.found && (savedResp.shortestPath > resp.shortestPath)) {
                                    savedResp = resp;
                                }
                                blocked = false;
                            }
                        }
                    }
                    savedResp.blocked = (hasNeighbor && blocked);
                    return savedResp;
                }
            },
            setPath: function (resp, steps) {
                if (resp.nodes[0] === this.node) {
                    resp.nodes.shift();
                }
                arrayCache.recycle(this.destinationNodes);
                this.destinationNodes = greenSlice(resp.nodes);
                if (steps) {
                    this.destinationNodes.length = Math.min(steps, this.destinationNodes.length);
                }
            },
            setState: function (state) {
                if (state === 'on-node') {
                    this.state.set('on-node', true);
                } else {
                    this.state.set('on-node', false);
                    if (this.currentState) {
                        this.state.set(this.currentState, false);
                    }
                    this.currentState = state;
                    this.state.set(state, true);
                }
            },
            onEdge: function (toNode) {
                this.distance = distance(this.node, toNode);
                if (this.updateOrientation) {
                    this.owner.rotation = angle(this.node, toNode, this.distance, this.progress / this.distance);
                }
                this.node.addToEdge(this.owner);
                toNode.addToEdge(this.owner);
                this.owner.node = null;
            },
            destroy: function () {
                arrayCache.recycle(this.destinationNodes);
                this.destinationNodes = null;
                this.state = null;
            }
        }
    });
}());
