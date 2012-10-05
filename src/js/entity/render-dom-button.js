/*
 	For generalStyles look at button.css
 	
 	exampleLayer = [{
			     	 id: 'id',
			     	 generalStyle: 'generalStyle',
			     	 specificStyle: 'specificStyle',
			     	 image: gws.assets.copyTile('resource-buy-buttons', 0,0),
			     	  altText: 'altText',
			     	 text: 'text',
			     	 textStyle: 'textStyle',
			     	 onClick: 'onClick',
			     	 onMouseOver: 'onMouseOver',
			     	 onMouseOut: 'onMouseOut'
			      }];
 */


platformer.components['render-dom-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.definition = definition; 
		this.parent = undefined;
		this.base = undefined;
		this.layers = [];
		
		this.addListeners(['render:load','render', 'logic:visible', 'logic:invisible', 'logic:layer-visible', 'logic:layer-invisible', 'logic:layer-text-change']);
	};
	var proto = component.prototype; 
	
	proto['render:load'] = function(resp){
		this.parent = resp.parentElement;
		var layerDefs = this.definition.layerDefs;
		var buttonId = this.definition.buttonId || '';
		var buttonClass = this.definition.buttonClass + ' button' || 'button'; //add in the default button class allows us to do onHover effects generically.
		
		this.base = platformer.createElement(this.parent, 'div', buttonClass, buttonId);
		
		for (var x = 0; x < layerDefs.length; x++)
		{
			var def = layerDefs[x];
			def.id = def.id || x;
			def.generalStyle = def.generalStyle || 'button-default';
			def.specificStyle = def.specificStyle || '';
			def.textStyle = def.textStyle || 'button-text';
			
			this.layers[def.id] = platformer.utils.createElement(this.base, 'div', def.generalStyle, def.specificStyle);
			if(def.image) {
				var img = def.image;
				img.style.width = '100%';
				img.style.height = '100%';
				this.layers[def.id].appendChild(img);
			}
			if(def.altText) this.layers[def.id].setAttribute('title', def.altText);
			if(def.text) this.layers[def.id].textElement = platformer.utils.createTextBlock(this.layers[def.id], def.textStyle, false, def.text); 
			if(def.onClick) this.layers[def.id].onclick = def.onClick;
			if(def.onMouseOver) this.layers[def.id].onmouseover = def.onMouseOver;
			if(def.onMouseOut) this.layers[def.id].onmouseout = def.onMouseOut;
		}
		
	};
	
	proto['layer:render'] = function(){
		
		
	};
	
	proto['logic:invisible'] = function()
	{
		this.base.style.display = 'none';
	};
	
	proto['logic:visible'] = function()
	{
		this.base.style.display = 'block';
	};
	
	proto['logic:layer-invisible'] = function(resp)
	{
		this.layers[resp.layer].style.display = 'none';
	};
	
	proto['logic:layer-visible'] = function(resp)
	{
		this.layers[resp.layer].style.display = 'block';
	};
	
	proto['logic:layer-text-change'] = function(resp)
	{
		if (this.layers[resp.layer].textElement)
		{
			this.layers[resp.layer].textElement.innerHTML = resp.text;
		} else {
			this.layers[resp.layer].textElement = platformer.createTextBlock(this.layers[resp.layer], 'div', false, false, resp.text);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.parent.removeChild(this.base);
		delete this.parent;
		delete this.base;
		delete this.layers;
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
