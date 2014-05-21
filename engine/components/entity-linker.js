/**
# COMPONENT **entity-linker**
This component allows an entity to communicate directly with one or more entities via the message model, by passing local messages directly to the linked entities as new triggered events.

## Dependencies
- [[entity-linker]] - This component must also be on the other entities to which this entity should link, and use the same linkId.

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
      "type": "entity-linker"
      
      "linkId": "hero",
      // A string setting an id that should match across all connected entities. This serves as a sort of radio channel that multiple entities can be listening on.
      
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
	var broadcast = function(event){
		return function(value, debug){
			var i = 0;
			
			for(; i < this.links.length; i++){
				this.links[i].trigger(event, value, debug);
			}
		};
	};

	return platformer.createComponentClass({
		id: 'entity-linker',
		constructor: function(definition){
			var self = this;

			if(definition.events){
				for(var event in definition.events){
					this.addEventListener(event, broadcast(definition.events[event]));
				}
			}
	
			this.linkId = definition.linkId || this.owner.linkId || 'linked';
			
			if(!this.owner.linkId){
				this.owner.linkId = this.linkId;
			}
			
			this.addEventListener('to-' + this.linkId + '-entities', broadcast('from-' + this.linkId + '-entities'));
			this.addEventListener('from-' + this.linkId + '-entities', function(resp){
				self.owner.trigger(resp.message, resp.value, resp.debug);
			});
			
			this.links = [];
			
			if(this.owner.linkEntities){
				for (var entity in this.owner.linkEntities){
					this.links.push(this.owner.linkEntities[entity]);
				}
			}
			
			this.message = {
				message: '',
				value: null
			};
			this.linkMessage = {
				entity: this.owner,
				linkId: this.linkId,
				reciprocate: false
			};
			
			// In case linker is added after adoption
			if(this.owner.parent){
				this.resolveAdoption();
			}
		},
		
		events: {
			"adopted": function(resp){
				this.resolveAdoption(resp);
			},
			
			"link-entity": function(resp){
				var i   = 0,
				already = false;
				
				if((resp.linkId === this.linkId) && (resp.entity !== this.owner)){
					// Make sure this link is not already in place
					for (; i < this.links.length; i++){
						if(this.links[i] === resp.entity){
							already = true;
							break;
						}
					}
					
					if(!already){
						this.links.push(resp.entity);
						if(resp.reciprocate){
							this.linkMessage.reciprocate = false;
							resp.entity.trigger('link-entity', this.linkMessage);
						}
					}
				}
			},
			
			"unlink-entity": function(resp){
				var i = 0;
				for(; i < this.links.length; i++){
					if(resp.entity === this.links[i]){
						this.links.splice(i, 1);
						break;
					}
				}
			}
		},
		
		methods: {
			resolveAdoption: function(resp){
				var grandparent = this.owner.parent;
				while(grandparent.parent){
					grandparent = grandparent.parent;
				}
				this.linkMessage.reciprocate = true; 
				grandparent.trigger('link-entity', this.linkMessage, true);
			},
			
			destroy: function(){
				var i = 0;
				for (; i < this.links.length; i++){
					this.links[i].trigger('unlink-entity', this.linkMessage);
				}
				this.links.length = 0;
			}
		}
	});
})();
