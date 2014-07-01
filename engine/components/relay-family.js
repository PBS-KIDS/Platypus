/**
# COMPONENT **entity-linker**
This component allows an entity to communicate directly with one or more entities via the message model, by passing local messages directly to entities in the same family as new triggered events. This component is placed on a single entity and all entities created by this entity become part of its "family".

## Messages

### Listens for:
- **adopted** - On receiving this message, this component triggers an `link-entity` message to connect to any peers with a matching `linkId`.
- **link-entity** - On receiving this message, this component checks the linkId and adds it to its list of connections if it matches.
  - @param entity ([[Entity]]) - The entity requesting a link.
  - @param linkId (string) - The linkId of the requesting entity. If it matches this component's linkId, the link is made.
  - @param reciprocate (boolean) - If true, "link-entity" is in-turn called on the sending entity to make the connection both ways.
- **unlink-entity** - This message will remove the requesting entity from this component's list of linked entities and no farther messages will be transmitted.
  - @param entity ([[Entity]]) - The entity requesting an unlink.
- **to-[linkId]-entities** - On receiving this message from the local entity, it is broadcast as "from-[linkId]-entities" to all linked entities.
  - @param message (string) - The message to be triggered on connected entities.
  - @param value (object) - The value to accompany the triggered message.
- **from-[linkId]-entities** - A message received from connected entities: the packaged message and values are triggered on this entity.
  - @param message (string) - The message to be triggered on this entity.
  - @param value (object) - The value to accompany the triggered message.
- **[events listed in JSON definition]** - on receiving these events from linked entities, the messages are re-triggered on this entity according to the JSON mapping.

### Local Broadcasts:
- **from-[linkId]-entities** - This message is broadcast on receiving "to-[linkId]-entities" from the local entity.
  - @param message (string) - The message to be triggered on connected entities.
  - @param value (object) - The value to accompany the triggered message.
- **[events listed in JSON definition]** - on receiving events from linked entities, the messages are re-triggered on this entity according to the JSON mapping.

### Parent Broadcasts:
- **link-entity** - On receiving an "adopted" message, this message is triggered to connect with any peers.
  - @param entity ([[Entity]]) - This entity.
  - @param linkId (string) - The linkId of this component.
  - @param reciprocate (boolean) - Set to true so that peer entities will make a two-way connection.

## JSON Definition
    {
      "type": "relay-family",
      
      "events":{
      // This is a list of messages that this component should be listening for locally to broadcast to its linked entities.
      
        "sleeping": "good-night",
        // When another component on this entity triggers "sleeping", this mapping will broadcast "good-night" to all connected entities.
        
        "awake": ["alarm", "get-up"]
        // This mapping will take a local "awake" message and broadcast "alarm" and then "get-up" messages on all connected entities.
      }
    }
*/
(function(){
	var trigger = function(entities, event, value, debug){
		var i = 0;
		
		for(; i < entities.length; i++){
			entities[i].trigger(event, value, debug);
		}
	},
	broadcast = function(event){
		return function(value, debug){
			trigger(this.owner.familyLinks, event, value, debug);
		};
	};

	return platformer.createComponentClass({
		id: 'relay-family',
		
		constructor: function(definition){
			if(definition.events){
				for(var event in definition.events){
					this.addEventListener(event, broadcast(definition.events[event]));
				}
			}
	
			this.owner.familyLinks = [this.owner];
		},
		
		events: {
			"link-family": function(links){
				var i   = 0,
				oldList = this.owner.familyLinks,
				newList = links.concat(oldList);

				for(; i < newList.length; i++){
					newList[i].familyLinks = newList;
				}
				trigger(links,   'family-members-added', oldList);
				trigger(oldList, 'family-members-added', links);
			},
			
			"entity-created": function(entity){
				if(!entity.triggerEvent('link-family', this.owner.familyLinks)){
					entity.addComponent(new platformer.components['relay-family'](entity, {}));
					entity.triggerEvent('link-family', this.owner.familyLinks);
				}
			}
		},
		
		methods: {
			destroy: function(){
				var i = 0;
				for(; i < this.owner.familyLinks.length; i++){
					if(this.owner === this.owner.familyLinks[i]){
						this.owner.familyLinks.splice(i, 1);
						break;
					}
				}
				trigger(this.owner.familyLinks, 'family-member-removed', this.owner);
			}
		}
	});
})();
