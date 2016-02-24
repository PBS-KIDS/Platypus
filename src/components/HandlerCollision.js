/**
 * This component checks for collisions between entities which typically have either a [CollisionTiles](platypus.components.CollisionTiles.html) component for tile maps or a [CollisionBasic](platypus.components.CollisionBasic.html) component for other entities. It uses `EntityContainer` component messages if triggered to add to its collision list and also listens for explicit add/remove messages (useful in the absence of an `EntityContainer` component).
 * 
 * @namespace platypus.components
 * @class HandlerCollision
 * @uses platypus.Component
 */
/*global include, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    //set here to make them reusable objects
    
    /**
     * When an entity collides with an entity of a listed collision-type, this message is triggered on the entity. * is the other entity's collision-type.
     * 
     * @event 'hit-by-*'
     * @param collision {Object}
     * @param collision.entity {Entity} The entity with which the collision occurred.
     * @param collision.type {String} The collision type of the other entity.
     * @param collision.shape {CollisionShape} This is the shape of the other entity that caused the collision.
     * @param collision.x {number} Returns -1, 0, or 1 indicating on which side of this entity the collision occurred: left, neither, or right respectively.
     * @param collision.y {number} Returns -1, 0, or 1 indicating on which side of this entity the collision occurred: top, neither, or bottom respectively.
     */
    var AABB = include('platypus.AABB'),
        CollisionData = include('platypus.CollisionData'),
        CollisionDataContainer = include('platypus.CollisionDataContainer'),
        Vector = include('platypus.Vector'),
        entityCollisionDataContainer = new CollisionDataContainer(),
        triggerMessage = {
            entity: null,
            type:   null,
            x: 0,
            y: 0,
            hitType: null,
            myType: null
        },
        groupSortBySize = function (a, b) {
            return a.collisionGroup.getAllEntities() - b.collisionGroup.getAllEntities();
        };
    
    return platypus.createComponentClass({
        id: 'HandlerCollision',
        
        constructor: function (definition) {
            this.entitiesByType = {};
            this.entitiesByTypeLive = {};
            this.allEntities = Array.setUp();
            this.solidEntitiesLive = Array.setUp();
            this.softEntitiesLive = Array.setUp();
            this.allEntitiesLive = Array.setUp();
            this.groupsLive = Array.setUp();
            this.nonColliders = Array.setUp();
            
            this.terrain = undefined;
            this.owner.previousX = this.owner.previousX || this.owner.x;
            this.owner.previousY = this.owner.previousY || this.owner.y;
            
            this.updateLiveList = true;
            this.cameraLogicAABB = AABB.setUp(0, 0);
            this.cameraCollisionAABB = AABB.setUp(0, 0);
            
            this.relocationMessage = {
                position: Vector.setUp(),
                relative: false
            };
        },
        
        events: {
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             * 
             * @method 'child-entity-added'
             * @param entity {Entity} The entity to be added.
             */
            "child-entity-added": function (entity) {
                if (!entity.collideOff) {
                    this.addCollisionEntity(entity);
                }
            },
            
            /**
             * On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
             * 
             * @method 'add-collision-entity'
             * @param entity {Entity} The entity to be added.
             */
            "add-collision-entity": function (entity) {
                this.addCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             * 
             * @method 'child-entity-removed'
             * @param message {platypus.Entity} The entity to be removed.
             */
            "child-entity-removed": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and removes it.
             * 
             * @method 'remove-collision-entity'
             * @param message {platypus.Entity} The entity to be removed.
             */
            "remove-collision-entity": function (entity) {
                this.removeCollisionEntity(entity);
            },
            
            /**
             * On receiving this message, the component looks for the entity in its collision group and updates it.
             * 
             * @method 'child-entity-updated'
             * @param message {platypus.Entity} The entity to be updated.
             */
            "child-entity-updated": function (entity) {
                this.removeCollisionEntity(entity);
                this.addCollisionEntity(entity);
            },
            
            /**
             * This message causes the component to go through the entities and check for collisions.
             * 
             * @method 'check-collision-group'
             * @param options {Object}
             * @param [options.camera] {Object} Specifies a region in which to check for collisions. Expects the camera object to contain the following properties: top, left, width, height, and buffer.
             */
            "check-collision-group": function (resp) {
                if (resp.camera) {
                    this.checkCamera(resp.camera);
                } else {
                    this.updateLists();
                }
                
                /*
                if (resp.movers) {
                    this.checkMovers(resp.camera, resp.movers);
                }*/
               
                /**
                 * This message is triggered on collision entities to make sure their axis-aligned bounding box is prepared for collision testing.
                 * 
                 * @event 'prepare-for-collision'
                 * @param tick {Object} Object containing information about the current logic step.
                 * @deprecated since 0.7.1
                 */
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('prepare-for-collision', resp);
                }

                this.checkGroupCollisions();
                this.checkSolidCollisions();
                this.resolveNonCollisions();
                this.checkSoftCollisions(resp);
            }
        },
        
        methods: {
            addCollisionEntity: function (entity) {
                var i     = 0,
                    types = entity.collisionTypes;
                
                if ((entity.type === 'tile-layer') || (entity.type === 'collision-layer')) { //TODO: probably should have these reference a required function on the obj, rather than an explicit type list since new collision entity map types could be created - DDD
                    this.terrain = entity;
                    this.updateLiveList = true;
                } else {
                    if (types) {
                        for (i = 0; i < types.length; i++) {
                            if (!this.entitiesByType[types[i]]) {
                                this.entitiesByType[types[i]] = Array.setUp();
                                this.entitiesByTypeLive[types[i]] = Array.setUp();
                            }
                            this.entitiesByType[types[i]][this.entitiesByType[types[i]].length] = entity;
                        }
                        if (!entity.immobile) {
                            this.allEntities[this.allEntities.length] = entity;
                        }
                        this.updateLiveList = true;
                    }
                }
            },

            removeCollisionEntity: function (entity) {
                var x     = 0,
                    i     = 0,
                    types = entity.collisionTypes;

                if (types) {
                    for (i = 0; i < types.length; i++) {
                        if (this.entitiesByType[types[i]]) {
                            x = this.entitiesByType[types[i]].indexOf(entity);
                            if (x >= 0) {
                                this.entitiesByType[types[i]].greenSplice(x);
                            }
                        }
                    }
                    
                    if (!entity.immobile) {
                        i = this.allEntities.indexOf(entity);
                        if (i >= 0) {
                            this.allEntities.greenSplice(i);
                        }
                    }
                    this.updateLiveList = true;
                }
            },
            
            checkCamera: function (camera, movers) {
                var bufferMargin = camera.buffer * 2,
                    i        = 0,
                    j        = 0,
                    key      = '',
                    list     = null,
                    all      = null,
                    allLive  = null,
                    softs    = null,
                    solids   = null,
                    nons     = null,
                    groups   = null,
                    width    = camera.width + bufferMargin,
                    height   = camera.height + bufferMargin,
                    x        = camera.left + width  / 2,
                    y        = camera.top  + height / 2,
                    entities      = null,
                    entity        = null,
                    aabbLogic     = this.cameraLogicAABB,
                    aabbCollision = this.cameraCollisionAABB,
                    types = null,
                    collides = false;
                
                if (this.updateLiveList || !aabbLogic.matches(x, y, width, height)) {
                    
                    aabbLogic.setAll(x, y, width, height);
                    
                    // Removing this line since it allows logic to run without collision turned on. Not certain why, but can turn this back on and trace down the issue if optimization is necessary. - DDD 12/31/2014
                    //if (this.updateLiveList || !aabbCollision.contains(aabbLogic)) { //if the camera has not moved beyond the original buffer, we do not continue these calculations
                    this.updateLiveList = false;
                    
                    all = this.allEntities;

                    allLive = this.allEntitiesLive;
                    allLive.length = 0;

                    solids = this.solidEntitiesLive;
                    solids.length = 0;

                    softs = this.softEntitiesLive;
                    softs.length = 0;

                    nons = this.nonColliders;
                    nons.length = 0;

                    groups = this.groupsLive;
                    groups.length = 0;

                    i = all.length;
                    while (i--) {
                        collides = false;
                        entity = all[i];
                        if (entity.alwaysOn || entity.checkCollision || aabbLogic.collides(entity.getAABB())) {
                            entity.checkCollision = false;
                            allLive[allLive.length] = entity;

                            types = entity.collisionTypes;
                            if (entity !== this.owner) {
                                for (j = 0; j < types.length; j++) {
                                    if (entity.solidCollisionMap[types[j]].length) {
                                        solids[solids.length] = entity;
                                        collides = true;
                                        break;
                                    }
                                }
                            }
                            for (j = 0; j < types.length; j++) {
                                if (entity.softCollisionMap[types[j]].length) {
                                    softs[softs.length] = entity;
                                    break;
                                }
                            }

                            if (!collides) {
                                nons.push(entity);
                            }

                            if (entity.collisionGroup) {
                                groups.push(entity);
                            }
                        }
                    }

                    groups.sort(groupSortBySize);

                    // add buffer again to capture stationary entities along the border that may be collided against 
                    aabbCollision.setAll(x, y, width + bufferMargin, height + bufferMargin);

                    for (key in this.entitiesByType) {
                        if (this.entitiesByType.hasOwnProperty(key)) {
                            entities = this.entitiesByType[key];
                            list = this.entitiesByTypeLive[key];
                            list.length = 0;
                            j = entities.length;
                            while (j--) {
                                entity = entities[j];
                                if (entity.alwaysOn  || aabbCollision.collides(entity.getAABB())) {
                                    list[list.length] = entity;
                                }
                            }
                        }
                    }
                    //}
                }
            },
            
            updateLists: function () {
                var i        = 0,
                    j        = 0,
                    key      = '',
                    list     = null,
                    all      = null,
                    allLive  = null,
                    softs    = null,
                    solids   = null,
                    nons     = null,
                    groups   = null,
                    entities = null,
                    entity   = null,
                    types    = null,
                    collides = false;
                
                if (this.updateLiveList) {
                    this.updateLiveList = false;

                    all = this.allEntities;

                    allLive = this.allEntitiesLive;
                    allLive.length = 0;

                    solids = this.solidEntitiesLive;
                    solids.length = 0;

                    softs = this.softEntitiesLive;
                    softs.length = 0;
                    
                    nons = this.nonColliders;
                    nons.length = 0;

                    groups = this.groupsLive;
                    groups.length = 0;

                    i = all.length;
                    while (i--) {
                        collides = false;
                        entity = all[i];
                        entity.checkCollision = false;
                        allLive[allLive.length] = entity;

                        types = entity.collisionTypes;
                        if (entity !== this.owner) {
                            for (j = 0; j < types.length; j++) {
                                if (entity.solidCollisionMap[types[j]].length) {
                                    solids[solids.length] = entity;
                                    collides = true;
                                    break;
                                }
                            }
                        }
                        for (j = 0; j < types.length; j++) {
                            if (entity.softCollisionMap[types[j]].length) {
                                softs[softs.length] = entity;
                                break;
                            }
                        }
                        
                        if (!collides) {
                            nons.push(entity);
                        }

                        if (entity.collisionGroup) {
                            groups.push(entity);
                        }
                    }

                    groups.sort(groupSortBySize);

                    for (key in this.entitiesByType) {
                        if (this.entitiesByType.hasOwnProperty(key)) {
                            entities = this.entitiesByType[key];
                            list = this.entitiesByTypeLive[key];
                            list.length = 0;
                            j = entities.length;
                            while (j--) {
                                entity = entities[j];
                                list[list.length] = entity;
                            }
                        }
                    }
                }
            },
            
            resolveNonCollisions: function () {
                var entity = null,
                    msg    = this.relocationMessage,
                    nons   = this.nonColliders,
                    i      = nons.length;
                
                msg.relative = false;
                while (i--) {
                    entity = nons[i];
                    msg.position.setVector(entity.position);

                    /**
                     * This message is triggered on an entity that has been repositioned due to a solid collision.
                     * 
                     * @event 'relocate-entity'
                     * @param object {Object}
                     * @param object.position {Vector} The relocated position of the entity.
                     */
                    entity.triggerEvent('relocate-entity', msg);
                }
            },
            
            checkGroupCollisions:  (function () {
                var triggerCollisionMessages = function (entity, otherEntity, thisType, thatType, x, y, hitType, vector) {
                    var msg = triggerMessage;
                    
                    msg.entity    = otherEntity;
                    msg.myType    = thisType;
                    msg.type      = thatType;
                    msg.x         = x;
                    msg.y         = y;
                    msg.direction = vector;
                    msg.hitType   = hitType;
                    entity.triggerEvent('hit-by-' + thatType, msg);
                    
                    if (otherEntity) {
                        msg.entity    = entity;
                        msg.type      = thisType;
                        msg.myType    = thatType;
                        msg.x         = -x;
                        msg.y         = -y;
                        msg.direction = vector.getInverse();
                        msg.hitType   = hitType;
                        otherEntity.triggerEvent('hit-by-' + thisType, msg);
                        
                        msg.direction.recycle();
                    }
                };

                return function () {
                    var i           = 0,
                        entities    = this.groupsLive,
                        x           = entities.length,
                        entity      = null,
                        messageData = null,
                        entityCDC   = entityCollisionDataContainer;
                    
                    while (x--) {
                        entity = entities[x];
                        if (entity.collisionGroup.getSize() > 1) {
                            entityCDC.reset();
                            this.checkSolidEntityCollision(entity, entity.collisionGroup, entityCDC);
                            
                            i = entityCDC.xCount;
                            while (i--) {
                                messageData = entityCDC.getXEntry(i);
                                triggerCollisionMessages(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, messageData.direction, 0, 'solid', messageData.vector);
                            }
                            
                            i = entityCDC.yCount;
                            while (i--) {
                                messageData = entityCDC.getYEntry(i);
                                triggerCollisionMessages(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, 0, messageData.direction, 'solid', messageData.vector);
                            }
                        }
                    }
                };
            }()),
            
            checkSolidCollisions: (function () {
                var triggerCollisionMessages = function (entity, otherEntity, thisType, thatType, x, y, hitType, vector) {
                    var msg = triggerMessage;
                    
                    msg.entity    = otherEntity;
                    msg.myType    = thisType;
                    msg.type      = thatType;
                    msg.x         = x;
                    msg.y         = y;
                    msg.direction = vector;
                    msg.hitType   = hitType;
                    entity.triggerEvent('hit-by-' + thatType, msg);
                    
                    if (otherEntity) {
                        msg.entity    = entity;
                        msg.type      = thisType;
                        msg.myType    = thatType;
                        msg.x         = -x;
                        msg.y         = -y;
                        msg.direction = vector.getInverse();
                        msg.hitType   = hitType;
                        otherEntity.triggerEvent('hit-by-' + thisType, msg);
                        
                        msg.direction.recycle();
                    }
                };

                return function () {
                    var i           = 0,
                        entities    = this.solidEntitiesLive,
                        x           = entities.length,
                        entity      = null,
                        messageData = null,
                        entityCDC   = entityCollisionDataContainer,
                        trigger = triggerCollisionMessages;
                    
                    while (x--) {
                        entity = entities[x];
                        entityCDC.reset();
                        this.checkSolidEntityCollision(entity, entity, entityCDC);
                        
                        i = entityCDC.xCount;
                        while (i--) {
                            messageData = entityCDC.getXEntry(i);
                            trigger(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, messageData.direction, 0, 'solid', messageData.vector);
                        }
                        
                        i = entityCDC.yCount;
                        while (i--) {
                            messageData = entityCDC.getYEntry(i);
                            trigger(messageData.thisShape.owner, messageData.thatShape.owner, messageData.thisShape.collisionType, messageData.thatShape.collisionType, 0, messageData.direction, 'solid', messageData.vector);
                        }
                    }
                };
            }()),
            
            checkSolidEntityCollision: function (ent, entityOrGroup, collisionDataCollection) {
                var step              = 0,
                    finalMovementInfo = null,
                    aabb              = null,
                    dX                = ent.x - ent.previousX,
                    dY                = ent.y - ent.previousY,
                    sW                = Infinity,
                    sH                = Infinity,
                    collisionTypes    = entityOrGroup.getCollisionTypes(),
                    i                 = 0,
                    ignoredEntities   = false,
                    min               = null;
                
                if (entityOrGroup.getSolidEntities) {
                    ignoredEntities = entityOrGroup.getSolidEntities();
                }
                
                finalMovementInfo = Vector.setUp(ent.position);

                if (dX || dY) {
                    
                    if (ent.bullet) {
                        min = Math.min;
                        
                        i = collisionTypes.length;
                        while (i--) {
                            aabb = entityOrGroup.getAABB(collisionTypes[i]);
                            sW = min(sW, aabb.width);
                            sH = min(sH, aabb.height);
                        }

                        //Stepping to catch really fast entities - this is not perfect, but should prevent the majority of fallthrough cases.
                        step = Math.ceil(Math.max(Math.abs(dX) / sW, Math.abs(dY) / sH));
                        step = min(step, 100); //Prevent memory overflow if things move exponentially far.
                        dX   = dX / step;
                        dY   = dY / step;

                        while (step--) {
                            entityOrGroup.prepareCollision(ent.previousX + dX, ent.previousY + dY);

                            finalMovementInfo = this.processCollisionStep(ent, entityOrGroup, ignoredEntities, collisionDataCollection, finalMovementInfo.setVector(ent.position), dX, dY, collisionTypes);
                            
                            if ((finalMovementInfo.x === ent.previousX) && (finalMovementInfo.y === ent.previousY)) {
                                entityOrGroup.relocateEntity(finalMovementInfo, collisionDataCollection);
                                //No more movement so we bail!
                                break;
                            } else {
                                entityOrGroup.relocateEntity(finalMovementInfo, collisionDataCollection);
                            }
                        }
                    } else {
                        entityOrGroup.prepareCollision(ent.previousX + dX, ent.previousY + dY);
                        entityOrGroup.relocateEntity(this.processCollisionStep(ent, entityOrGroup, ignoredEntities, collisionDataCollection, finalMovementInfo, dX, dY, collisionTypes), collisionDataCollection);
                    }
                }
                
                finalMovementInfo.recycle();
            },
            
            processCollisionStep: (function () {
                var sweeper       = AABB.setUp(),
                    includeEntity = function (thisEntity, aabb, otherEntity, otherAABB, ignoredEntities, sweepAABB) {
                        var i = 0;
                        
                        //Chop out all the special case entities we don't want to check against.
                        if (otherEntity === thisEntity) {
                            return false;
                        } else if (otherEntity.jumpThrough && (aabb.bottom > otherAABB.top)) {
                            return false;
                        } else if (thisEntity.jumpThrough  && (otherAABB.bottom > aabb.top)) { // This will allow platforms to hit something solid sideways if it runs into them from the side even though originally they were above the top. - DDD
                            return false;
                        } else if (ignoredEntities) {
                            i = ignoredEntities.length;
                            while (i--) {
                                if (otherEntity === ignoredEntities[i]) {
                                    return false;
                                }
                            }
                        }
                        
                        return sweepAABB.collides(otherAABB);
                    };

                return function (ent, entityOrGroup, ignoredEntities, collisionDataCollection, finalMovementInfo, entityDeltaX, entityDeltaY, collisionTypes) {
                    var i = collisionTypes.length,
                        j = 0,
                        k = 0,
                        l = 0,
                        isIncluded = includeEntity,
                        potentialCollision       = false,
                        potentialCollidingShapes = Array.setUp(),
                        pcsGroup                 = null,
                        previousAABB             = null,
                        currentAABB              = null,
                        collisionType            = null,
                        otherEntity              = null,
                        otherCollisionType       = '',
                        otherAABB                = null,
                        otherShapes              = null,
                        entitiesByTypeLive       = this.entitiesByTypeLive,
                        otherEntities            = null,
                        terrain                  = this.terrain,
                        solidCollisionMap        = entityOrGroup.getSolidCollisions(),
                        collisionSubTypes        = null,
                        sweepAABB                = sweeper;
                    
//                    if (!entityOrGroup.jumpThrough || (entityDeltaY >= 0)) { //TODO: Need to extend jumpthrough to handle different directions and forward motion - DDD
    
                    while (i--) {
                        //Sweep the full movement of each collision type
                        potentialCollidingShapes[i] = pcsGroup = Array.setUp();
                        collisionType = collisionTypes[i];
                        previousAABB = entityOrGroup.getPreviousAABB(collisionType);
                        currentAABB = entityOrGroup.getAABB(collisionType);

                        sweepAABB.set(currentAABB);
                        sweepAABB.include(previousAABB);
                        
                        collisionSubTypes = solidCollisionMap[collisionType];
                        j = collisionSubTypes.length;
                        while (j--) {
                            otherCollisionType = collisionSubTypes[j];
                            otherEntities = entitiesByTypeLive[otherCollisionType];

                            if (otherEntities) {
                                k = otherEntities.length;
                                while (k--) {
                                    otherEntity = otherEntities[k];
                                    otherAABB = otherEntity.getAABB(otherCollisionType);

                                    //Do our sweep check against the AABB of the other object and add potentially colliding shapes to our list.
                                    if (isIncluded(ent, previousAABB, otherEntity, otherAABB, ignoredEntities, sweepAABB)) {
                                        otherShapes = otherEntity.getShapes(otherCollisionType);
                                        
                                        l = otherShapes.length;
                                        while (l--) {
                                            //Push the shapes on the end!
                                            pcsGroup.push(otherShapes[l]);
                                        }
                                        potentialCollision = true;
                                    }
                                }
                            } else if (terrain && (otherCollisionType === 'tiles')) {
                                //Do our sweep check against the tiles and add potentially colliding shapes to our list.
                                otherShapes = terrain.getTileShapes(sweepAABB, previousAABB);
                                k = otherShapes.length;
                                while (k--) {
                                    //Push the shapes on the end!
                                    pcsGroup.push(otherShapes[k]);
                                    potentialCollision = true;
                                }
                            }
                        }
                    }

                    if (potentialCollision) {
                        finalMovementInfo = this.resolveCollisionPosition(ent, entityOrGroup, finalMovementInfo, potentialCollidingShapes, collisionDataCollection, collisionTypes, entityDeltaX, entityDeltaY);
                    }
                    
                    // Array recycling
                    potentialCollidingShapes.recycle(2);
                    
                    return finalMovementInfo;
                };
            }()),
            
            resolveCollisionPosition: (function () {
                var collisionData = new CollisionData();
                
                return function (ent, entityOrGroup, finalMovementInfo, potentialCollidingShapes, collisionDataCollection, collisionTypes, entityDeltaX, entityDeltaY) {
                    var j = 0,
                        cd = collisionData;
                    
                    if (entityDeltaX !== 0) {
                        j = collisionTypes.length
                        while (j--) {
                            //Move each collision type in X to find the min X movement
                            cd.clear();
                            this.findMinAxisMovement(ent, entityOrGroup, collisionTypes[j], 'x', potentialCollidingShapes[j], cd);
                            
                            if (cd.occurred) {
                                collisionDataCollection.tryToAddX(cd);
                            }
                        }
                    }
                    
                    if (collisionDataCollection.xCount > 0) {
                        cd.copy(collisionDataCollection.getXEntry(0));
                        finalMovementInfo.x = ent.previousX + cd.deltaMovement * cd.direction;
                    } else {
                        finalMovementInfo.x = ent.x;
                    }
                    
                    // This moves the previous position of everything so that the check in Y can begin.
                    entityOrGroup.movePreviousX(finalMovementInfo.x);
                    
                    if (entityDeltaY !== 0) {
                        j = collisionTypes.length;
                        while (j--) {
                            //Move each collision type in Y to find the min Y movement
                            cd.clear();
                            this.findMinAxisMovement(ent, entityOrGroup, collisionTypes[j], 'y', potentialCollidingShapes[j], cd);
                            
                            if (cd.occurred) {
                                collisionDataCollection.tryToAddY(cd);
                            }
                        }
                    }
                    
                    if (collisionDataCollection.yCount > 0) {
                        cd.copy(collisionDataCollection.getYEntry(0));
                        finalMovementInfo.y = ent.previousY + cd.deltaMovement * cd.direction;
                    } else {
                        finalMovementInfo.y = ent.y;
                    }
                    
                    return finalMovementInfo;
                };
            }()),
            
            findMinAxisMovement: (function () {
                var shapeCollisionData = new CollisionData();
                
                return function (ent, entityOrGroup, collisionType, axis, potentialCollidingShapes, bestCollisionData) {
                    //Loop through my shapes of this type vs the colliding shapes and do precise collision returning the shortest movement in axis direction
                    var shapes     = entityOrGroup.getShapes(collisionType),
                        prevShapes = entityOrGroup.getPrevShapes(collisionType),
                        cd         = shapeCollisionData,
                        i          = shapes.length;
                    
                    while (i--) {
                        cd.clear();
                        this.findMinShapeMovementCollision(prevShapes[i], shapes[i], axis, potentialCollidingShapes, cd);
                        
                        if (cd.occurred && (!bestCollisionData.occurred //if a collision occurred and we haven't already had a collision.
                            || (cd.deltaMovement < bestCollisionData.deltaMovement))) { //if a collision occurred and the diff is smaller than our best diff.
                            bestCollisionData.copy(cd);
                        }
                    }
                };
            }()),
            
            /**
             * Find the earliest point at which this shape collides with one of the potential colliding shapes along this axis.
             * For example, cycles through shapes a, b, and c to find the earliest position:
             * 
             *    O---->   [b]  [a]     [c]
             *    
             *    Returns collision location for:
             *    
             *            O[b]
             * 
             */
            findMinShapeMovementCollision: (function () {

                var storeCollisionData = function (collisionData, direction, position, initial, thisShape, thatShape, vector) {
                        collisionData.occurred = true;
                        collisionData.direction = direction;
                        collisionData.position = position;
                        collisionData.deltaMovement = Math.abs(position - initial);
                        collisionData.aABB = thatShape.aABB;
                        collisionData.thisShape = thisShape;
                        collisionData.thatShape = thatShape;
                        collisionData.vector.setVector(vector);
                    },
                    returnInfo = {
                        position: 0,
                        contactVector: Vector.setUp()
                    },
                    getMovementDistance = function (currentDistance, minimumDistance) {
                        var pow = Math.pow;
                        
                        return Math.sqrt(pow(minimumDistance, 2) - pow(currentDistance, 2));
                    },
                    getCorner = function (circlePos, rectanglePos, half) {
                        var diff = circlePos - rectanglePos;
                        
                        return diff - (diff / Math.abs(diff)) * half;
                    },
                    getOffsetForCircleVsAABBX = function (circle, rect, moving, direction, v) {
                        var newAxisPosition = 0,
                            aabb = rect.aABB,
                            hw = aabb.halfWidth,
                            x = circle.x,
                            y = circle.y;

                        if (y >= aabb.top && y <= aabb.bottom) {
                            return hw + circle.radius;
                        } else {
                            y = getCorner(y, rect.y, aabb.halfHeight); // reusing y.
                            newAxisPosition = hw + getMovementDistance(y, circle.radius);
                            if (moving === circle) {
                                v.x = -getCorner(x - direction * newAxisPosition, rect.x, hw) / 2;
                                y = -y;
                            } else {
                                v.x = getCorner(x, rect.x - direction * newAxisPosition, hw) / 2;
                            }
                            v.y = y;
                            v.normalize();
                            return newAxisPosition;
                        }
                    },
                    getOffsetForCircleVsAABBY = function (circle, rect, moving, direction, v) {
                        var newAxisPosition = 0,
                            aabb = rect.aABB,
                            hh = aabb.halfHeight,
                            x = circle.x,
                            y = circle.y;

                        if (x >= aabb.left && x <= aabb.right) {
                            return hh + circle.radius;
                        } else {
                            x = getCorner(x, rect.x, aabb.halfWidth); // reusing x.
                            newAxisPosition = hh + getMovementDistance(x, circle.radius);
                            if (moving === circle) {
                                x = -x;
                                v.y = -getCorner(y - direction * newAxisPosition, rect.y, hh) / 2;
                            } else {
                                v.y = getCorner(y, rect.y - direction * newAxisPosition, hh) / 2;
                            }
                            v.x = x;
                            v.normalize();
                            return newAxisPosition;
                        }
                    },
                    findAxisCollisionPosition = { // Decision tree for quicker access, optimized for mobile devices.
                        x: {
                            rectangle: {
                                rectangle: function (direction, thisShape, thatShape) {
                                    var ri = returnInfo;

                                    ri.position = thatShape.x - direction * (thatShape.aABB.halfWidth + thisShape.aABB.halfWidth);
                                    ri.contactVector.setXYZ(direction, 0);

                                    return ri;
                                },
                                circle: function (direction, thisShape, thatShape) {
                                    var ri = returnInfo;

                                    ri.position = thatShape.x - direction * getOffsetForCircleVsAABBX(thatShape, thisShape, thisShape, direction, ri.contactVector.setXYZ(direction, 0));

                                    return ri;
                                }
                            },
                            circle: {
                                rectangle: function (direction, thisShape, thatShape) {
                                    var ri = returnInfo;

                                    ri.position = thatShape.x - direction * getOffsetForCircleVsAABBX(thisShape, thatShape, thisShape, direction, ri.contactVector.setXYZ(direction, 0));

                                    return ri;
                                },
                                circle: function (direction, thisShape, thatShape) {
                                    var y = thatShape.y - thisShape.y,
                                        position = thatShape.x - direction * getMovementDistance(y, thisShape.radius + thatShape.radius),
                                        ri = returnInfo;
                                        
                                    ri.contactVector.setXYZ(thatShape.x - position, y).normalize();
                                    ri.position = position;

                                    return ri;
                                }
                            }
                        },
                        y: {
                            rectangle: {
                                rectangle: function (direction, thisShape, thatShape) {
                                    var ri = returnInfo;

                                    ri.position = thatShape.y - direction * (thatShape.aABB.halfHeight + thisShape.aABB.halfHeight);
                                    ri.contactVector.setXYZ(0, direction);
                                    
                                    return ri;
                                },
                                circle: function (direction, thisShape, thatShape) {
                                    var ri = returnInfo;

                                    ri.position = thatShape.y - direction * getOffsetForCircleVsAABBY(thatShape, thisShape, thisShape, direction, ri.contactVector.setXYZ(0, direction));

                                    return ri;
                                }
                            },
                            circle: {
                                rectangle: function (direction, thisShape, thatShape) {
                                    var ri = returnInfo;

                                    ri.position = thatShape.y - direction * getOffsetForCircleVsAABBY(thisShape, thatShape, thisShape, direction, ri.contactVector.setXYZ(0, direction));

                                    return ri;
                                },
                                circle: function (direction, thisShape, thatShape) {
                                    var x = thatShape.x - thisShape.x,
                                        position = thatShape.y - direction * getMovementDistance(x, thisShape.radius + thatShape.radius),
                                        ri = returnInfo;
                                        
                                    ri.contactVector.setXYZ(x, thatShape.y - position).normalize();
                                    ri.position = position;

                                    return ri;
                                }
                            }
                        }
                    };
                
                return function (prevShape, currentShape, axis, potentialCollidingShapes, collisionData) {
                    var i = 0,
                        initialPoint    = prevShape[axis],
                        goalPoint       = currentShape[axis],
                        translatedShape = prevShape,
                        direction       = ((initialPoint < goalPoint) ? 1 : -1),
                        position        = goalPoint,
                        pcShape         = null,
                        collisionInfo   = null,
                        finalPosition   = goalPoint,
                        findACP         = null;
                    
                    if (initialPoint !== goalPoint) {
                        findACP = findAxisCollisionPosition[axis][translatedShape.type];
                        
                        if (axis === 'x') {
                            translatedShape.moveX(goalPoint);
                        } else if (axis === 'y') {
                            translatedShape.moveY(goalPoint);
                        }
                        
                        i = potentialCollidingShapes.length;
                        while (i--) {
                            pcShape = potentialCollidingShapes[i];
                            position = goalPoint;
                            if (translatedShape.collides(pcShape)) {
                                collisionInfo = findACP[pcShape.type](direction, translatedShape, pcShape);
                                position = collisionInfo.position;
                                if (direction > 0) {
                                    if (position < finalPosition) {
                                        if (position < initialPoint) { // Reality check: I think this is necessary due to floating point inaccuracies. - DDD
                                            position = initialPoint;
                                        }
                                        finalPosition = position;
                                        storeCollisionData(collisionData, direction, finalPosition, initialPoint, currentShape, pcShape, collisionInfo.contactVector);
                                    }
                                } else if (position > finalPosition) {
                                    if (position > initialPoint) { // Reality check: I think this is necessary due to floating point inaccuracies. - DDD
                                        position = initialPoint;
                                    }
                                    finalPosition = position;
                                    storeCollisionData(collisionData, direction, finalPosition, initialPoint, currentShape, pcShape, collisionInfo.contactVector);
                                }
                            }
                        }
                    }
                };
            }()),
            
            checkSoftCollisions: (function () {
                var trigger = function (collision) {
                        this.triggerEvent('hit-by-' + collision.type, collision);
                    };
                
                return function (resp) {
                    var softs = this.softEntitiesLive,
                        entities = this.getWorldEntities(),
                        entity = null,
                        i = softs.length,
                        t = trigger;
                        
                    while (i--) {
                        entity = softs[i];
                        this.checkEntityForSoftCollisions(entity, entities, t.bind(entity));
                    }
                }
            }()),
            
            checkEntityForSoftCollisions: function (ent, entitiesByTypeLive, callback) {
                var otherEntity = null,
                    message = triggerMessage,
                    i   = ent.collisionTypes.length,
                    j   = 0,
                    k   = 0,
                    l   = 0,
                    m   = 0,
                    collisionType = null,
                    softCollisionMap = null,
                    otherEntities  = null,
                    otherCollisionType = null,
                    shapes = null,
                    otherShapes = null,
                    collisionFound = false;

                message.x = 0;
                message.y = 0;

                while (i--) {
                    collisionType = ent.collisionTypes[i];
                    softCollisionMap = ent.softCollisionMap[collisionType];
                    j = softCollisionMap.length;
                    while (j--) {
                        otherCollisionType = softCollisionMap[j];
                        otherEntities = entitiesByTypeLive[otherCollisionType];
                        if (otherEntities) {
                            k = otherEntities.length;
                            while (k--) {
                                otherEntity = otherEntities[k];
                                if ((otherEntity !== ent) && (ent.getAABB(collisionType).collides(otherEntity.getAABB(otherCollisionType)))) {
                                    collisionFound = false;
                                    shapes = ent.getShapes(collisionType);
                                    otherShapes = otherEntity.getShapes(otherCollisionType);
                                    l = shapes.length;
                                    while (l--) {
                                        m = otherShapes.length;
                                        while (m--) {
                                            if (shapes[l].collides(otherShapes[m])) {
                                                //TML - We're only reporting the first shape we hit even though there may be multiple that we could be hitting.
                                                message.entity  = otherEntity;
                                                message.type    = otherCollisionType;
                                                message.myType  = collisionType;
                                                message.shape   = otherShapes[m];
                                                message.hitType = 'soft';
                                                
                                                callback(message);
                                                
                                                collisionFound = true;
                                                break;
                                            }
                                        }
                                        if (collisionFound) {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            
            destroy: function () {
                var key = '';
                
                this.groupsLive.recycle();
                this.nonColliders.recycle();
                this.allEntities.recycle();
                this.allEntitiesLive.recycle();
                this.softEntitiesLive.recycle();
                this.solidEntitiesLive.recycle();
                this.relocationMessage.position.recycle();
                for (key in this.entitiesByType) {
                    if (this.entitiesByType.hasOwnProperty(key)) {
                        this.entitiesByType[key].recycle();
                    }
                }
                for (key in this.entitiesByTypeLive) {
                    if (this.entitiesByTypeLive.hasOwnProperty(key)) {
                        this.entitiesByTypeLive[key].recycle();
                    }
                }

                this.cameraLogicAABB.recycle();
                this.cameraCollisionAABB.recycle();
            }
        },
        
        publicMethods: {
            /**
             * This method returns an object containing world entities grouped by collision type.
             * 
             * @method getWorldEntities
             * @return {Object} A list of key/value pairs where the keys are collision types and the values are arrays of entities of that type.
             */
            getWorldEntities: function () {
                return this.entitiesByTypeLive;
            },
            
            /**
             * This method returns an entity representing the collision map of the world.
             * 
             * @method getWorldTerrain
             * @return {Entity} - An entity describing the collision map of the world. This entity typically includes a `CollisionTiles` component.
             */
            getWorldTerrain: function () {
                return this.terrain;
            },
            
            /**
             * This method returns a list of collision objects describing soft collisions between an entity and a list of other entities.
             * 
             * @method getEntityCollisions
             * @param entity {Entity} The entity to test against the world.
             * @param [entities] {Array} The list of entities to check against. By default this is all the entities in the world.
             * @return collisions {Array} This is a list of collision objects describing the soft collisions.
             */
            getEntityCollisions: function (entity, entities) {
                var collisions = Array.setUp();
                
                this.checkEntityForSoftCollisions(entity, entities || this.entitiesByTypeLive, function (collision) {
                    var i    = '',
                        save = {};
                    
                    for (i in collision) {
                        if (collision.hasOwnProperty(i)) {
                            save[i] = collision[i];
                        }
                    }
                    collisions.push(save);
                });
                
                return collisions;
            }
        }
    });
}());
