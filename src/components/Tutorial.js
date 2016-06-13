/**
 * This component is an example template from which a developer can create their own components. Summarize the purpose of this component here.
 * 
 * @class ComponentExample
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    'use strict';
    var entityAdded = function (entity) {
            var entityType = null;
                
            for (entityType in this.watchedEntities) {
                if (entity.type === entityType) {
                    this.watchedEntities.entityType.push(entity);
                }
            }
        },
        entityRemoved = function (entity) {
            var x = 0,
                entityType = entity.type;

            for (x = this.watchedEntities.entityType.length - 1; x >= 0; x--) {
                if (this.watchedEntities.entityType[x] === entity) {
                    this.watchedEntities.entityType.splice(x, 1);
                    break;
                }
            }
        },
        updateLogic = function (tick) {
            var delta = tick.delta,
                x = 0,
                tut = null,
                toPlay = null,
                toPlayIndex = -1,
                keepChecking = false,
                tutorial = null;
            
            for (x = 0; x < this.tutorials.length; x++) {
                keepChecking = false;
                tut = this.tutorials[x];

                if (!this.playing && this.theQueue.length == 0) {
                    keepChecking = true;
                } else if ((!this.playing && this.theQueue.length > 0) && (tut.priority > this.theQueue[0].priority)) {
                    keepChecking = true;
                } else if (this.playing && (this.playing.priority < tut.priority)) {
                    keepChecking = true;
                } else if (this.queue) {
                    keepChecking = true;
                }

                if (!keepChecking) {
                    continue;
                }

                if (this.checkRequirements(tut.requirements)) {
                    if (tut.replayDelay && tut.replayDelayTimer > 0) {
                        tut.replayDelayTimer -= delta;
                        if (tut.replayDelayTimer > 0) {
                            continue;
                        }
                    }
                    
                    if (!toPlay || toPlay.priority < tut.priority) {
                        //TML - If we only have one item we try to play, then we may prevent certain audio from playing if it's only valid for a single tick.
                        toPlay = tut;
                        toPlayIndex = x;
                    }
                }
            }

            if (toPlay) {
                tutorial = this.tutorials.splice(toPlayIndex, 1)[0];
                if (this.playing) {
                    if (tutorial.priority > this.playing.priority) {
                        this.owner.triggerEvent('stop-audio');
                        this.play(tutorial);
                    } else {
                        this.queue(tutorial);
                    }
                } else if (this.theQueue.length > 0) {
                    if (tutorial.priority > this.theQueue[0].priority) {
                        this.play(tutorial);
                    } else {
                        this.play(this.theQueue.splice(0, 1)[0]);
                        this.queue(tutorial);
                    }
                } else {
                    this.play(tutorial);
                }
            } else if (!this.playing && this.theQueue.length > 0) {
                this.play(this.theQueue.splice(0, 1)[0]);
            }
        };

    return platypus.createComponentClass({
        
        id: 'Tutorial',
        
        properties: {
            
            /*
             * "tutorialDefs": [       //An array of tutorial data definition what, when, and how tutorials play
             *      {
             *          "events": ["example-vo-event"],         //An Array of Strings. Defines the events to fire when all the conditions for this tutorial are met. If there are multiple events, one is chosen at random. All events in the array will play before any repeat.
             *          "priority": 5,                          //The priorioty of the tutorial. Higher numbered tutorials interrupt lower numbered. Default: 0.
             *          "queue": true,                          //Will the tutorial queue up if played while another tutorial is playing? Default: false.
             *          "timesToReplay": 3,                     //The number of times a tutorial will replay. Set to 0 to make a tutorial play only once. Default: Infinity.
             *          "replayDelay": 10000,                   //While the conditions are met, the tutorial will replay at this interval in milliseconds. If set to null, it will not repeat. Default: null.
             *          "level": "example-level",               //Tutorial will only play when this level is the currently loaded level. 
             *          "requirements": {                       //The requirements is a collection of entities types that are watched by the tutorial to determine if the conditions to play this tutorial are true.
             *              "example-entity-type": ["example-entity-state"]     //The requirements is a set of key-value pairs. The keys are entity types that the tutorial will watch. The values are arrays of states of that entity type which must be true for the tutorial to play.
             *          }
             *      }
             * ]
             * 
             */
            "tutorialDefs": []
        },
         
        publicProperties: {
            
        },
        
        constructor: function () {
            var x = 0,
                entityType = null,
                tutDef = null,
                tutorial = null;
                
            this.playing = null;
            this.theQueue = [];
            this.watchedEntities = {};
            this.tutorials = [];

                
            for (x = 0; x < this.tutorialDefs; x++) {
                tutDef = this.tutorialDefs[x];
                tutorial = {};
                if (!tutDef.events) {
                    console.warn("Tutorial definition lacks events.");
                    continue;
                }
                tutorial.events = tutDef.events.greenSlice();
                tutorial.originalEvents = tutDef.events.greenSlice();
                tutorial.priority = tutDef.priority || 0;
                tutorial.queue = tutDef.queue || false;
                tutorial.timesToReplay = tutDef.timesToReplay || Infinity;
                tutorial.replayDelay = tutDef.replayDelay || null;
                tutorial.replayDelayTimer = tutorial.replayDelay;
                tutorial.level = tutDef.level;
                tutorial.requirements = {};
                for (entityType in tutDef.requirements) {
                    tutorial.requirements[entityId] = tutDef.requirements[entityId].greenSlice();
                    if (!this.watchedEntities.entityType) {
                        this.watchedEntities.entityType = [];
                    }
                }
                this.tutorials.push(tutorial);
            }
            
        },

        events: {// These are messages that this component listens for
            "child-entity-added": entityAdded,
            "peer-entity-added": entityAdded,

            "child-entity-removed": entityRemoved,   
            "peer-entity-removed": entityRemoved,
            
            //Using both logic-tick and handle-logic allows this to work at the Scene level or entity level.
            "logic-tick": updateLogic,
            "handle-logic": updateLogic,

            "sequence-complete": function() {
                if (this.playing.timesToReplay >= 0) {
                    this.tutorials.push(this.playing);
                }
                this.playing = null;
            }
        },
        
        methods: {// These are internal methods that are invoked by this component.
            play: function (tutorial) {
                var toCall = null,
                    x = 0;

                this.playing = tutorial;
                if (this.playing.events.length === 0) {
                    this.playing.events = this.playing.originalEvents.greenSlice();
                }

                toCall = this.playing.events.splice(Math.floor(Math.random() * this.playing.events.length), 1)[0];

                this.owner.triggerEvent(toCall);

                tutorial.timesToReplay -= 1;
                tutorial.replayDelayTimer = tutorial.replayDelay;
            },
            queue: function (tutorial) {
                var x = 0,
                    added = false;

                for (x = 0; x < this.theQueue.length; x++) {
                    if (this.theQueue[x].priority < tutorial.priority) {
                        this.theQueue.splice(x, 0, tutorial);
                        added = true;
                        break;
                    }
                }
                
                if (!added) {
                    this.theQueue.push(tutorial);
                }
            },
            checkRequirements: function (requirements) {
                var x = 0,
                    entityType = null,
                    states = null,
                    anEntity = null, 
                    metRequirement = true;

                for (entityType in requirements) { //Going through the types of entities
                    states = requirements.entityType;
                    for (y = this.watchedEntities.entityType.length - 1; y >= 0; y--) {  //Going through the instances of those entities
                        anEntity = this.watchedEntities.entityType[y];
                        
                        metRequirement = true;
                        for (x = 0; x < states.length; x++) {   //Going through the required states of an entity instance
                            if (!anEntity.state.get(states[x])) {
                                metRequirement = false;
                                break;
                            }
                        }
                        if (metRequirement) {
                            break;
                        }
                    }
                    if (!metRequirement) {
                        return false;
                    }
                }
                return true;
            },
            destroy: function () {
                this.watchedEntities = null;
                this.theQueue = null;
                this.playing = null;
                this.tutorials = null;
            }
        },
        
        publicMethods: {// These are methods that are available on the entity.
            /*********************************************************************
             TODO: Additional methods that should be invoked at the entity level,
                   not just the local component level. Only one method of a given
                   name can be used on the entity, so be aware other components
                   may attempt to add an identically named method to the entity.
                   No public method names should match the method names listed
                   above, since they can also be called at the component level.
                   
                   e.g.
                   whatIsMyFavoriteColor: function () {
                       return '#ffff00';
                   }
                   
                   This method can then be invoked on the entity as
                   entity.whatIsMyFavoriteColor().
            *********************************************************************/
            
        }/*,
        
        getAssetList: function (component, props, defaultProps) {
            **********************************************************************
             TODO: This method can be provided to list assets that this
                   component requires. This method is invoked when the list of
                   game scenes is created to determine assets for each scene.
                   
                   e.g.
                   function (component, props, defaultProps) {
                       return ['yellow-sprite'];
                   }
                   
                   If the component doesn't require any assets, this method
                   should not be provided.
            **********************************************************************
        }*/
    });
}());
