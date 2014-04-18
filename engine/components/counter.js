/**
# COMPONENT **counter**
A simple component that keeps count of something and sends messages each time the count changes. Can also have a total. When it does it will display 'count / total'.

## Messages

### Listens for:
- **increment-count** - Increments the count by 1.
- **change-count** - Changes the count to the given value.
  - @param data.count (number) - The new count value.
- **change-total** - Changes the total to the given value.
  - @param data.total (number) - The new total value.

### Local Broadcasts:
- **update-content** - A call used to notify other components that the count or total has changed.
  - @param number - The count.
  
## JSON Definition
    {
      "type": "counter"
    }
*/

(function(){
	return platformer.createComponentClass({
		id: 'counter',
		constructor: function(definition){
			this.count = 0;
			this.total = 0;
			this.showTotal = definition.showTotal || false;
			this.output = {
			    text: ''
			};

			// Notes definition changes from older versions of this component.
			if(definition.countMessage){
				console.warn('"' + this.type + '" components no longer accept "countMessage": "' + definition.countMessage + '" as a definition parameter. Use "aliases": {"' + definition.countMessage + '": "change-count"} instead.');
			}
			if(definition.incrementMessage){
				console.warn('"' + this.type + '" components no longer accept "incrementMessage": "' + definition.incrementMessage + '" as a definition parameter. Use "aliases": {"' + definition.incrementMessage + '": "increment-count"} instead.');
			}
			if(definition.totalMessage){
				console.warn('"' + this.type + '" components no longer accept "totalMessage": "' + definition.totalMessage + '" as a definition parameter. Use "aliases": {"' + definition.totalMessage + '": "change-total"} instead.');
			}
		},
		events: {
			"change-total": function(total){
				this.total = total;
				if(this.total){
					this.output.text = this.count + "/" + this.total;
				} else {
					this.output.text = '' + this.count;
				}
				this.owner.trigger('update-content', this.output);
			},
			"change-count": function(count){
				this.count = count;
				if(this.total){
					this.output.text = this.count + "/" + this.total;
				} else {
					this.output.text = '' + this.count;
				}
				this.owner.trigger('update-content', this.output);
			},
			"increment-count": function(){
				this.count++;
				if(this.total){
					this.output.text = this.count + "/" + this.total;
				} else {
					this.output.text = '' + this.count;
				}
				this.owner.trigger('update-content', this.output);
			}
		}
	});
})();
