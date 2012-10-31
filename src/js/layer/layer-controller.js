platformer.components['layer-controller'] = (function(){
	var relayUpDown = function(event, self){
		return function(value){
			if (value.released){
				event += ':up';
			} else if (value.pressed){
				event += ':down';
			}
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event, value);
			}
		}; 
	},
	relay = function(event, self){
		return function(value){
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event, value);
			}
		}; 
	},
	
	keyMap = {
		kc0:   'unknown',         
		kc8:   'backspace',
		kc9:   'tab',
		kc12:  'numpad-5-shift',
		kc13:  'enter',
		kc16:  'shift',
		kc17:  'ctrl',
		kc18:  'alt',
		kc19:  'pause',
		kc20:  'caps-lock',
		kc27:  'esc',
		kc32:  'space',
		kc33:  'page-up',
		kc34:  'page-down',
		kc35:  'end',
		kc36:  'home',
		kc37:  'left-arrow',
		kc38:  'up-arrow',
		kc39:  'right-arrow',
		kc40:  'down-arrow',
		kc42:  'numpad-multiply',
		kc43:  'numpad-add',
		kc44:  'print-screen',
		kc45:  'insert',
		kc46:  'delete',
		kc47:  'numpad-division',
		kc48:  '0',
		kc49:  '1',
		kc50:  '2',
		kc51:  '3',
		kc52:  '4',
		kc53:  '5',
		kc54:  '6',
		kc55:  '7',
		kc56:  '8',
		kc57:  '9',
		kc59:  'semicolon',
		kc61:  'equals',
		kc65:  'a',
		kc66:  'b',
		kc67:  'c',
		kc68:  'd',
		kc69:  'e',
		kc70:  'f',
		kc71:  'g',
		kc72:  'h',
		kc73:  'i',
		kc74:  'j',
		kc75:  'k',
		kc76:  'l',
		kc77:  'm',
		kc78:  'n',
		kc79:  'o',
		kc80:  'p',
		kc81:  'q',
		kc82:  'r',
		kc83:  's',
		kc84:  't',
		kc85:  'u',
		kc86:  'v',
		kc87:  'w',
		kc88:  'x',
		kc89:  'y',
		kc90:  'z',
		kc91:  'left-windows-start',
		kc92:  'right-windows-start',
		kc93:  'windows-menu',
		kc96:  'back-quote',
		kc106: 'numpad-multiply',
		kc107: 'numpad-add',
		kc109: 'numpad-minus',
		kc110: 'numpad-period',
		kc111: 'numpad-division',
		kc112: 'f1',
		kc113: 'f2',
		kc114: 'f3',
		kc115: 'f4',
		kc116: 'f5',
		kc117: 'f6',
		kc118: 'f7',
		kc119: 'f8',
		kc120: 'f9',
		kc121: 'f10',
		kc122: 'f11',
		kc123: 'f12',
		kc144: 'num-lock',
		kc145: 'scroll-lock',
		kc186: 'semicolon',
		kc187: 'equals',
		kc188: 'comma',
		kc189: 'hyphen',
		kc190: 'period',
		kc191: 'forward-slash',
		kc192: 'back-quote',
		kc219: 'open-bracket',
		kc220: 'back-slash',
		kc221: 'close-bracket',
		kc222: 'quote'
	},
	component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['check-inputs'];
		this.addListeners(['child-entity-added', 'check-inputs', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel']);
	},
	proto = component.prototype; 

	proto['keydown'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + value.keyCode] || ('key-code-' + value.keyCode)) + ':down', value);
		}
	}; 
		
	proto['keyup'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + value.keyCode] || ('key-code-' + value.keyCode)) + ':up', value);
		}
	};
	
	proto['check-inputs'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('controller:tick'))	
			{
				this.entities.splice(x, 1);
			}
		}
	};

	proto['child-entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'controller')
			{
				// Check for custom input messages that should be relayed from scene.
				if(entity.controlMap){
					for(var y in entity.controlMap){
						if((y.indexOf('key:') < 0) || (y.indexOf('mouse:') < 0)){
							if(!this[y]){
								this.addListeners([y, y + ':up', y + ':down']);
								this[y]           = relayUpDown(y,     this);
								this[y + ':up']   = relay(y + ':up',   this);
								this[y + ':down'] = relay(y + ':down', this);
							}
						}
					}
				}
				
				this.entities.push(entity);
				entity.trigger('controller:load');
				break;
			}
		}
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
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
