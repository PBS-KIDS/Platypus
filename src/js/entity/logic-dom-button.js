gws.components['logic-dom-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'hide', 'show', 'hide-layer', 'show-layer', 'change-text']);
		
		this.prevState = '';
		this.state = 'visible'; //visible, invisible
		this.layers = [];
		for(var x = 0; x < definition.layers.length; x++)
		{
			var id = definition.layers.id || x.toString();
			this.layers[id] = {state: definition.layers.state || 'visible', 
							   prevState: '',
							   text: definition.layers.text || '',
							   prevText: ''};
		}
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(val)
	{
		var deltaT = val.deltaT;
		
		
		if(this.state != this.prevState)
		{
			if (this.state == 'visible')
			{
				this.owner.trigger('logic:visible');
			} else if (this.state == 'invisible') {
				this.owner.trigger('logic:invisible');
			}
			this.prevState = this.state;
		}
		
		for (var x in this.layers)
		{
			if(this.layers[x].state != this.layers[x].prevState)
			{
				if (this.layers[x].state == 'visible')
				{
					this.owner.trigger('logic:layer-visible', {layerId: this.layers[x].id});
				} else if (this.layers[x].state == 'invisible') {
					this.owner.trigger('logic:layer-invisible', {layerId: this.layers[x].id});
				}
				this.layers[x].prevState = this.layers[x].state;
			}
		}
		
		
		
	};
	
	proto['hide'] = function()
	{
		this.state = 'invisible';
	};
	
	proto['show'] = function()
	{
		this.state = 'visible';
	};
	
	proto['hide-layer'] = function(obj)
	{
		var layerId = obj.layerId;
		if (this.layers[layerId])
		{
			this.layers[layerId].state = 'invisible';
		}
	};
	
	proto['showLayer'] = function(obj)
	{
		var layerId = obj.layerId;
		if (this.layers[layerId])
		{
			this.layers[layerId].state = 'invisible';
		}
	};
	
	proto['changeText'] = function(obj)
	{
		var layerId = obj.layerId;
		if (this.layers[layerId])
		{
			this.layers[layerId].text = obj.text;
		}
		
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
