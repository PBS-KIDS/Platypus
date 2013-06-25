(function(){

	return platformer.createComponentClass({

		id: "logic-hero",
		
		constructor: function(definition){
			var state = this.state = this.owner.state;
			state.swing = false;
			state.swingHit = false;
			
			this.teleportDestination = undefined;
			this.justTeleported = false;
		},
		
		events:{
			"handle-logic": function(){
				if (this.teleportDestination) {
					this.owner.trigger('relocate-entity', this.teleportDestination);
					this.teleportDestination = undefined;
				}
				
				this.state.swingHit = false;
				if(this.swing){
					this.state.swing = true;
					if(this.swingInstance){
						this.state.swingHit = true;
						this.owner.parent.addEntity(new platformer.classes.entity(platformer.settings.entities['pickaxe'], {
							properties: {
								x: this.owner.x + (this.state.right?1:-1) * 140,
								y: this.owner.y
							}
						}));
					}
				} else {
					this.state.swing = false;
				}
		
				this.swingInstance = false;		
			},
	
			"teleport": function (posObj) {
				this.teleportDestination = {x: posObj.x, y: posObj.y};
			},
	
			"portal-waiting": function (portal) {
				portal.trigger('activate-portal');
			},

			"key-swing": function (state) {
				if(state.pressed)
				{
					if(!this.swing){
						this.swing = true;
						this.swingInstance = true;
					}
				} else {
					this.swing = false;
				}
			}
		}
	});
})();
