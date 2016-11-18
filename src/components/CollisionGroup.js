/**
 * This component groups other entities with this entity for collision checking. This is useful for carrying and moving platforms. It uses `EntityContainer` component messages if triggered to add to its collision list and also listens for explicit add/remove messages (useful in the absence of an `EntityContainer` component).
 *
 * @namespace platypus.components
 * @class CollisionGroup
 * @uses platypus.Component
 */
/* global include, platypus */
(function () {
    'use strict';

    var AABB = include('platypus.AABB'),
        DataMap = include('platypus.DataMap'),
        Vector = include('platypus.Vector');
    
    return platypus.createComponentClass({
        id: 'CollisionGroup',
        
        initialize: function () {
            this.solidEntities = Array.setUp();
            
            // These are used as return values for methods, but are instantiated here for recycling later.
            this.collisionTypes = Array.setUp();
            this.shapes = Array.setUp();
            this.prevShapes = Array.setUp();
            
            this.terrain  = null;
            this.aabb     = AABB.setUp(this.owner.x, this.owner.y);
            this.prevAABB = AABB.setUp(this.owner.x, this.owner.y);
            this.filteredAABB = AABB.setUp();

            Vector.assign(this.owner, 'position', 'x', 'y', 'z');
            Vector.assign(this.owner, 'previousPosition', 'previousX', 'previousY', 'previousZ');
            this.owner.previousX = this.owner.previousX || this.owner.x;
            this.owner.previousY = this.owner.previousY || this.owner.y;
            
            this.collisionGroup = this.owner.collisionGroup = {
                getAllEntities: function () {
                    var x           = 0,
                        count       = 0,
                        childEntity = null;
                    
                    for (x = 0; x < this.solidEntities.length; x++) {
                        childEntity = this.solidEntities[x];
                        if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                            count += childEntity.collisionGroup.getAllEntities();
                        } else {
                            count += 1;
                        }
                    }

                    return count;
                }.bind(this),
                getSize: function () {
                    return this.solidEntities.length;
                }.bind(this),
                getCollisionTypes: function () {
                    return this.getCollisionTypes();
                }.bind(this),
                getSolidCollisions: function () {
                    return this.getSolidCollisions();
                }.bind(this),
                getAABB: function (collisionType) {
                    return this.getAABB(collisionType);
                }.bind(this),
                getPreviousAABB: function (collisionType) {
                    return this.getPreviousAABB(collisionType);
                }.bind(this),
                getShapes: function (collisionType) {
                    return this.getShapes(collisionType);
                }.bind(this),
                getPrevShapes: function (collisionType) {
                    return this.getPrevShapes(collisionType);
                }.bind(this),
                prepareCollision: function (x, y) {
                    return this.prepareCollision(x, y);
                }.bind(this),
                relocateEntity: function (vector, collisionData) {
                    return this.relocateEntity(vector, collisionData);
                }.bind(this),
                movePreviousX: function (x) {
                    return this.movePreviousX(x);
                }.bind(this),
                getSolidEntities: function () {
                    return this.solidEntities;
                }.bind(this),
                jumpThrough: false //TODO: this introduces odd behavior - not sure how to resolve yet. - DDD
            };
        },
        
        events: {
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             *
             * @method 'child-entity-added'
             * @param entity {platypus.Entity} The entity to be added.
             */
            "child-entity-added": function (entity) {
                this.addCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             *
             * @method 'add-collision-entity'
             * @param entity {platypus.Entity} The entity to be added.
             */
            "add-collision-entity": function (entity) {
                this.addCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             *
             * @method 'child-entity-removed'
             * @param entity {platypus.Entity} The entity to be removed.
             */
            "child-entity-removed": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             *
             * @method 'remove-collision-entity'
             * @param entity {platypus.Entity} The entity to be removed.
             */
            "remove-collision-entity": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * When this message is triggered, the collision group updates its record of the owner's last (x, y) coordinate.
             *
             * @method 'relocate-entity'
             */
            "relocate-entity": function () {
                this.owner.previousPosition.setVector(this.owner.position);
                this.updateAABB();
            }
        },
        
        methods: {
            addCollisionEntity: function (entity) {
                var i     = 0,
                    types = entity.collisionTypes;
                
                if (types) {
                    i = types.length;
                    while (i--) {
                        if (entity.solidCollisionMap.get(types[i]).length && !entity.immobile) {
                            this.solidEntities[this.solidEntities.length] = entity;
                        }
                    }
                    this.updateAABB();
                }
            },
            
            removeCollisionEntity: function (entity) {
                var x     = 0,
                    i     = 0,
                    types = entity.collisionTypes;

                if (types) {
                    i = types.length;
                    while (i--) {
                        if (entity.solidCollisionMap.get(types[i]).length) {
                            x = this.solidEntities.indexOf(entity);
                            if (x >= 0) {
                                this.solidEntities.greenSplice(x);
                            }
                        }
                    }
                    this.updateAABB();
                }
            },
            
            getCollisionTypes: function () {
                var childEntity  = null,
                    compiledList = this.collisionTypes,
                    se = this.solidEntities,
                    i = se.length;
                
                compiledList.length = 0;
                
                while (i--) {
                    childEntity = se[i];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    compiledList.union(childEntity.getCollisionTypes());
                }
                
                return compiledList;
            },

            getSolidCollisions: function () {
                var x            = 0,
                    key          = '',
                    keys = null,
                    childEntity  = null,
                    compiledList = DataMap.setUp(),
                    entityList   = null,
                    i = 0,
                    toList = null,
                    fromList = null,
                    recycle = false;
                
                for (x = 0; x < this.solidEntities.length; x++) {
                    recycle = false;
                    childEntity = this.solidEntities[x];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                        recycle = true;
                    }
                    entityList = childEntity.getSolidCollisions();
                    keys = entityList.keys;
                    i = keys.length;
                    while (i--) {
                        key = keys[i];
                        toList = compiledList.get(key);
                        fromList = entityList.get(key);
                        if (!toList) {
                            toList = compiledList.set(key, Array.setUp());
                        }
                        toList.union(fromList);
                        if (recycle) {
                            fromList.recycle();
                        }
                    }
                    if (recycle) {
                        entityList.recycle();
                    }
                }
                
                return compiledList; // TODO: Track down where this is used and make sure the arrays are recycled. - DDD 2/1/2016
            },
            
            getAABB: function (collisionType) {
                var i = 0,
                    aabb        = this.filteredAABB,
                    childEntity = null,
                    incAABB = null,
                    sE = this.solidEntities;
                
                if (!collisionType) {
                    return this.aabb;
                } else {
                    aabb.reset();
                    i = sE.length;
                    while (i--) {
                        childEntity = sE[i];
                        if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                            childEntity = childEntity.collisionGroup;
                        }
                        incAABB = childEntity.getAABB(collisionType);
                        if (incAABB) {
                            aabb.include(incAABB);
                        }
                    }
                    return aabb;
                }
            },

            getPreviousAABB: function (collisionType) {
                var i = 0,
                    aabb        = this.filteredAABB,
                    childEntity = null,
                    incAABB = null,
                    sE = this.solidEntities;
                
                if (!collisionType) {
                    return this.prevAABB;
                } else {
                    aabb.reset();
                    i = sE.length;
                    while (i--) {
                        childEntity = sE[i];
                        if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                            childEntity = childEntity.collisionGroup;
                        }

                        incAABB = childEntity.getPreviousAABB(collisionType);
                        if (incAABB) {
                            aabb.include(incAABB);
                        }
                    }
                    return aabb;
                }
            },
            
            updateAABB: function () {
                var aabb = this.aabb,
                    sE = this.solidEntities,
                    entity = null,
                    x = sE.length,
                    owner = this.owner;
                
                aabb.reset();
                while (x--) {
                    entity = sE[x];
                    aabb.include(((entity !== owner) && entity.getCollisionGroupAABB) ? entity.getCollisionGroupAABB() : entity.getAABB());
                }
            },
            
            getShapes: function (collisionType) {
                var x           = 0,
                    childEntity = null,
                    shapes      = this.shapes,
                    newShapes   = null;
                    
                shapes.length = 0;
                
                for (x = 0; x < this.solidEntities.length; x++) {
                    childEntity = this.solidEntities[x];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    newShapes = childEntity.getShapes(collisionType);
                    if (newShapes) {
                        shapes.union(newShapes);
                    }
                }
                return shapes;
            },

            getPrevShapes: function (collisionType) {
                var x           = 0,
                    childEntity = null,
                    newShapes   = null,
                    shapes      = this.prevShapes;
                    
                shapes.length = 0;
                
                for (x = 0; x < this.solidEntities.length; x++) {
                    childEntity = this.solidEntities[x];
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    newShapes = childEntity.getPrevShapes(collisionType);
                    if (newShapes) {
                        shapes.union(newShapes);
                    }
                }
                return shapes;
            },
            
            prepareCollision: function (x, y) {
                var i           = 0,
                    childEntity = null,
                    oX          = 0,
                    oY          = 0;
                
                for (i = 0; i < this.solidEntities.length; i++) {
                    childEntity = this.solidEntities[i];
                    childEntity.saveDX = childEntity.x - childEntity.previousX;
                    childEntity.saveDY = childEntity.y - childEntity.previousY;
                    oX = childEntity.saveOX = this.owner.previousX - childEntity.previousX;
                    oY = childEntity.saveOY = this.owner.previousY - childEntity.previousY;
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    childEntity.prepareCollision(x - oX, y - oY);
                }
            },
            
            movePreviousX: function (x) {
                var childEntity = null,
                    offset      = 0,
                    i           = 0;
                
                for (i = 0; i < this.solidEntities.length; i++) {
                    childEntity = this.solidEntities[i];
                    offset = childEntity.saveOX;
                    if ((childEntity !== this.owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    childEntity.movePreviousX(x - offset);
                }
            },
            
            relocateEntity: function (vector, collisionData) {
                var childEntity = null,
                    entity      = null,
                    i           = 0,
                    list        = null,
                    owner       = this.owner,
                    solids      = this.solidEntities,
                    v           = null;
                
                owner.saveDX -= vector.x - owner.previousX;
                owner.saveDY -= vector.y - owner.previousY;

                list = collisionData.xData;
                i = list.length;
                while (i--) {
                    if (list[i].thisShape.owner === owner) {
                        owner.saveDX = 0;
                        break;
                    }
                }
                
                list = collisionData.yData;
                i = list.length;
                while (i--) {
                    if (list[i].thisShape.owner === owner) {
                        owner.saveDY = 0;
                        break;
                    }
                }
                
                for (i = 0; i < solids.length; i++) {
                    childEntity = entity = solids[i];
                    if ((childEntity !== owner) && childEntity.collisionGroup) {
                        childEntity = childEntity.collisionGroup;
                    }
                    v = Vector.setUp(vector.x - entity.saveOX, vector.y - entity.saveOY, childEntity.z);
                    childEntity.relocateEntity(v, collisionData);
                    v.recycle();
                    entity.x += entity.saveDX;
                    entity.y += entity.saveDY;
                    if (entity !== owner) {
                        entity.x += owner.saveDX;
                        entity.y += owner.saveDY;
                    }
                }
            },

            destroy: function () {
                this.solidEntities.recycle();
                this.collisionTypes.recycle();
                this.shapes.recycle();
                this.prevShapes.recycle();
                this.aabb.recycle();
                this.prevAABB.recycle();
                this.filteredAABB.recycle();
            }
        },
        
        publicMethods: {
            /**
             * Gets the bounding box of the group of entities.
             *
             * @method getCollisionGroupAABB
             * @return platypus.AABB
             */
            getCollisionGroupAABB: function () {
                return this.getAABB();
            },
            
            /**
             * Gets a list of all the entities in the world.
             *
             * @method getWorldEntities
             * @return Array
             */
            getWorldEntities: function () {
                return this.owner.parent.getWorldEntities();
            },
            
            /**
             * Gets the collision entity representing the world's terrain.
             *
             * @method getWorldTerrain
             * @return platypus.Entity
             */
            getWorldTerrain: function () {
                return this.owner.parent.getWorldTerrain();
            }
        }
    });
}());
