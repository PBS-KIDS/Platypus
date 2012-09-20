/*
 * INPUT
 */

gws.classes.input = (function(){
	var bindEvent = function(eventId, callback){return function(event){callback(eventId, event);};},
	input = function (eventCallback){
		this.mouseX = 0;
		this.mouseY = 0;
		
		var element = this.element = window,
		self = this,
//		events = ['keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel'],
		events = ['keydown', 'keyup'],
		bindings = this.bindings = [];
		
		for(eventIndex in events){
			bindings[events[eventIndex]] = bindEvent(events[eventIndex], eventCallback);
			element.addEventListener(events[eventIndex], bindings[events[eventIndex]], true);
		}
	},
	proto = input.prototype;
	
	proto.destroy = function ()
	{
		var element = this.element;
		
		for (binding in this.bindings){
			element.removeEventListener(binding, this.bindings[binding], true);
		}
	};
	
	return input;
})();