/**
# COMPONENT **name-of-component**
Summarize the purpose of this component here.

## Dependencies
- [[Required-Component]] - List other components that this component requires to function properly on an entity.

## Messages

### Listens for:
- **received-message-label** - List all messages that this component responds to here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Local Broadcasts:
- **local-message-label** - List all messages that are triggered by this component on this entity here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Peer Broadcasts:
- **peer-message-label** - List all messages that are triggered by this component on other entities here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

## JSON Definition
    {
      "type": "name-of-component"
      // List all additional parameters and their possible values here.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'level-scrambler',
		constructor: function(definition){
			this.levelTemplate = this.owner.levelTemplate || definition.levelTemplate;
			this.useUniques = this.owner.useUniques || definition.useUniques || true;
			
			this.levelPieces = {};
			var piecesToCopy = this.owner.levelPieces || definition.levelPieces;
			if (piecesToCopy) {
				for (var x in piecesToCopy) {
					if (typeof piecesToCopy[x] == "string") {
						this.levelPieces[x] = piecesToCopy[x];
					} else if (piecesToCopy[x].length) {
						this.levelPieces[x] = [];
						for (var y = 0; y < piecesToCopy[x].length; y++) {
							this.levelPieces[x].push(piecesToCopy[x][y]); 
						}
					} else {
						console.warn('Level Scrambler: Level pieces of incorrect type: ' + piecesToCopy[x]);
					}
				}
			}
			this.levelMessage = {level: null, persistentData: null};
		},

		events: {// These are messages that this component listens for
			"scene-loaded": function(persistentData) {
				var templateRow = null;
				
				this.levelMessage.persistentData = persistentData;
				if (this.levelTemplate) {
					if(typeof this.levelTemplate == "string") {
						this.levelMessage.level = [this.getLevelPiece(this.levelTemplate)];
					} else if (this.levelTemplate.length) {
						this.levelMessage.level = [];
						for (var x = 0; x < this.levelTemplate.length; x++){
							templateRow = this.levelTemplate[x];
							if (typeof templateRow == "string") {
								this.levelMessage.level[x] = this.getLevelPiece(templateRow);
							} else if (templateRow.length) {
								this.levelMessage.level[x] = [];
								for (var y = 0; y < templateRow.length; y++){
									this.levelMessage.level[x][y] = this.getLevelPiece(templateRow[y]);
								}
							} else {
								console.warn('Level Scrambler: Template row is neither a string or array. What is it?');
							}
						}
					} else {
						console.warn('Level Scrambler: Template is neither a string or array. What is it?');
					}
				} else {
					console.warn('Level Scrambler: There is no level template.');
				}
				
				this.owner.triggerEvent('load-level', this.levelMessage);
			}
		},
		
		methods: {// These are methods that are called by this component.
			getLevelPiece: function (type) {
				var pieces = this.levelPieces[type];
				var temp = null;
				var random = 0;
				if(pieces){
					if(typeof pieces == "string"){
						if (this.useUniques) {
							temp = pieces;
							this.levelPieces[type] = null;
							return temp;
						} else {
							return pieces;
						}
					} else if (pieces.length) {
						random = Math.floor(Math.random() * pieces.length);
						if (this.useUniques) {
							return (this.levelPieces[type].splice(random, 1))[0];
						} else {
							return pieces[random];
						}
					} else {
						console.warn('Level Scrambler: There are no MORE level pieces of type: ' + type);
					}
					
				} else {
					console.warn('Level Scrambler: There are no level pieces of type: ' + type);
				}
				
				return null;
			},
			destroy: function () {
				this.levelMessage.level = null;
				this.levelMessage.persistentData = null;
				this.levelMessage = null;
			}
			
		},
		
		publicMethods: {// These are methods that are available on the entity.
			
		}
	});
})();
