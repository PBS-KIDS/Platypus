/*
# COMPONENT **logic-fps-counter**
This component renders the avg FPS and other developer defined debug data to the screen. The developer defined values can be used to keep track of how long portions of code are taking to process on average. To do this, send messages to 'time-elapsed' with a 'name' and 'time' value. The name value is the label that you want displayed. The time value should be the time in ms that was spent performing that operation. These values are averaged over a number of ticks. 

## Dependencies:
- [[Handler-Logic]] (on entity) - This component listens for the 'handle-logic' message to update itself.
- [[Dom-Element]] (on entity's) - This component requires a dom element to render the text.
- [[Scene]] - This component receives 'time-elapsed' message from the Scene which are necessary for its functionality.

## Messages

### Listens for:
- **handle-logic** - A call from the [[Handler-Logic]]. This updates the information we're displaying including the FPS counter.
- **time-elapsed** - Called to give the counter the time spent doing a certain operation. The Scene sends a value named 'Engine Total' when a tick has occurs.

### Local Broadcasts:
- **update-content** - Calls the dom element to update the information that should be displayed.
  - @param counter (object) - An object with a 'text' field which contains the html for the names and times that are to be displayed.

## JSON Definition:
    {
		"type": "logic-fps-counter",
		"ticks": 45
		//Optional - The number of ticks across which we average the values. Defaults to 30.
	}
*/

(function(){
	return platformer.createComponentClass({
		id: 'logic-fps-counter',
        constructor: function(definition){
			this.counter = {
				text: ''
			};
			this.times = {};
			this.timeElapsed = false;
			this.ticks = definition.ticks || 30; //number of ticks for which to take an average
			this.count = this.ticks;
		},
		events:{
			"handle-logic": function(){
				if(!platformer.game.settings.debug && this.owner.parent){
					this.owner.parent.removeEntity(this.owner);
				}
		
				if(this.timeElapsed){ //to make sure we're not including 0's from multiple logic calls between time elapsing.
					this.timeElapsed = false;
					this.count--;
					if(!this.count){
						this.count = this.ticks;
						var text = Math.floor(createjs.Ticker.getMeasuredFPS()) + " FPS<br />";
						for(var name in this.times){
							text += '<br />' + name + ': ' + Math.round(this.times[name] / this.ticks) + 'ms';
							this.times[name] = 0;
						}
						this.counter.text = text;
						this.owner.trigger('update-content', this.counter);
					}
				}
			},
			"time-elapsed": function(value){
				if(value){
					if(value.name){
						if((value.name === 'Engine Total') && !this.timeElapsed){
							this.timeElapsed = true;
						}
						if (!this.times[value.name]){
							this.times[value.name] = 0;
						}
						this.times[value.name] += value.time;
					}
				}
			}
		},
		methods:{
			destroy: function(){
				this.counter = null;
				this.times   = null;
			}
		}
	});
})();
