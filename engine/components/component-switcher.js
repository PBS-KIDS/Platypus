/**
# COMPONENT **component-switcher**
This component listens for messages and, according to its preset settings, will remove and add components to the entity. This is useful if certain events should modify the behavior of the entity in some way: for example, acquiring a pogo-stick might add a jumping component so the hero can jump.

## Messages

### Listens for:
- **[message(s) listed in the JSON definition componentMap]** - These messages will add or remove components.

### Parent Broadcasts:
- **child-entity-updated** - This message is triggered on the parent when the entity's components change.
  - @param entity ([[Entity]]) - This is the entity itself.

## JSON Definition
    {
      "type": "component-switcher"
      
      "componentMap":{
      // This is the list of messages to listen for (as the keys) with the settings as two arrays of components to add and components to remove.
      
        "found-pogostick":{
          
          "add":[
          // This is a list of components to add when "found-pogostick" is triggered on the entity. If it's adding a single component, "add" can be a reference to the component definition itself rather than an array of one object.
            {"type": "logic-jump"},
            {"type": "head-gear"}
          ]
          
          "remove": ["carseat"]
          // This is a string list of component ids to remove when "found-pogostick" is triggered on the entity. It will ignore listed components that are not connected to the entity.
        
        },
        
        // Multiple events can cause unique components to be added or removed
        "walking-indoors":{
          "remove": ["head-gear"]
        },
        
        "contemplate":{
          "add": {"type": "ai-pacer"}
        }
      
      }
    }
*/
(function(){
	var addRemoveComponents = function(definition, owner){
		return function(){
			var i = 0, j = 0;
			
			if(definition.remove){
				if(typeof definition.remove === 'string'){
					for(i = owner.components.length - 1; i > -1; i--){
						if(owner.components[i].type === definition.remove){
							owner.removeComponent(owner.components[i]);
						}
					}
				} else {
					for (i = 0; i < definition.remove.length; i++){
						for(j = owner.components.length - 1; j > -1; j--){
							if(owner.components[j].type === definition.remove[i]){
								owner.removeComponent(owner.components[j]);
							}
						}
					}
				}
			}

			if(definition.add){
				if(!Array.isArray(definition.add)){
					owner.addComponent(new platformer.components[definition.add.type](owner, definition.add));
				} else {
					for (i = 0; i < definition.add.length; i++){
						owner.addComponent(new platformer.components[definition.add[i].type](owner, definition.add[i]));
					}
				}
			}
			
			owner.parent.trigger('child-entity-updated', owner);
		};
	};
	
	return platformer.createComponentClass({
		id: 'component-switcher',
		constructor: function(definition){
			if(definition.componentMap){
				for(var event in definition.componentMap){
					this.addEventListener(event, addRemoveComponents(definition.componentMap[event], this.owner));
				}
			}
		}
	});
})();
