/**
 * This component is an example template from which a developer can create their own components. Summarize the purpose of this component here.
 * 
 * @class "component-template" Component
 * @uses Component
 */
(function(){
	"use strict";
	
	/*********************************************************************
	 TODO: Place helper functions here that are suitable across all
	       component instances and should never be accessible from
	       outside this component.
	*********************************************************************/

	return platformer.createComponentClass({
		/*********************************************************************
		 "createComponentClass" creates the component class and adds the
		 following methods and properties that can be referenced from your
		 own methods and events:
		 
		 Property this.owner - a reference to the component's Entity
		 Property this.type  - identical to the id provided below
		 Method this.addEventListener(event, callback) - adds an event to
		     listen for
		 Method this.removeEventListener(event, callback) - removes an event
		 Method this.addMethod(name, function) - adds a method function to
		     the entity that is accessible from outside the entity.
		 Method this.removeMethod(name) - removes a method from the entity.
		*********************************************************************/
		
		id: 'name-of-component', //TODO: Change the name of the component!
		
		/********************************************************************
		 Properties are local to the component and are available as
		 `this.propertyName`. By specifying them here, you're setting their
		 default value, but this value will automatically be overwritten by
		 properties passed into the component or properties on the owner of
		 the same name.
		 ********************************************************************/ 
		properties: {
			"propertyName1": "property-value"
		},
		
		/********************************************************************
		 Similar to the above, except that these properties are set on both
		 the component (available as `this.propertyName`) and on the owner
		 (available as `entity.propertyName`. By specifying them here, you're
		 setting their default value, but this value will automatically be
		 overwritten by properties passed into the component or properties
		 on the owner of the same name.
		 ********************************************************************/ 
		publicProperties: {
			"propertyName2": "property-value"
		},
		
		constructor: function(definition){
			/*********************************************************************
			 TODO: Place code here for anything that should happen on component
			       instantiation. Use the "load" event shown below for anything
			       that should happen once all of the entity's components are
			       finished loading.
			*********************************************************************/
		},

		events: {// These are messages that this component listens for
			/*********************************************************************
			 TODO: Add events and their accompanying event handlers that this
			       component is listening for.
				
				   e.g.
				   "load": function(resp){
				       // Handle "load" event here
				   }
			*********************************************************************/
		},
		
		methods: {// These are internal methods that are invoked by this component.
			/*********************************************************************
		     TODO: Methods used internally by this component may be added using
		           the format below.
		           
				   e.g.
				   destroy: function(){
				       // clean up component properties here
				   }
		    *********************************************************************/
			
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
				   whatIsMyFavoriteColor: function(){
				       return '#ffff00';
				   }
				   
				   This method can then be invoked on the entity as
				   entity.whatIsMyFavoriteColor().
		    *********************************************************************/
			
		}
	});
})();
