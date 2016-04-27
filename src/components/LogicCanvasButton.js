/**
 * Provides button functionality for a RenderSprite component.
 *
 * @namespace platypus.components
 * @class LogicCanvasButton
 * @uses platypus.Component
 */
/*global platypus */
(function () {
	'use strict';
    
	return platypus.createComponentClass({

		id: 'LogicCanvasButton',

        properties: {
            "onPress": "",
			"onRelease": "",
            "onCancel": "",
            "useOnce": false,
            "disabled": false
		},
		publicProperties: {

		},

		constructor: function (definition) {
            var state = this.owner.state;
            
            this.state = state;
            state.set('disabled', this.disabled);
            state.set('down', false);
            this.owner.buttonMode = !this.disabled;
            this.cancelled = false;
            this.used = false;
            this.last = null;
		},

		events: {
            "handle-logic": function (tick) {
                var eq = (this.disabled === this.state.get('disabled'));
                
                if (this.last !== eq) {
                    this.last = eq;
                }
            },
            "mousedown": function (eventData) {
                this.state.set('down', true);
                if (!this.state.get('disabled') && !(this.useOnce && this.used)) {
                    if (this.onPress) {
                        this.owner.trigger(this.onPress);
                        this.used = true; //Doing this prevents the Release/Cancel calls from occurring. Need to find a way to let the up and down both call for one use buttons.
                    }
                    eventData.pixiEvent.stopPropagation();
                }
            },
            "pressup": function (eventData) {

                if (!this.state.get('disabled') && !(this.useOnce && this.used)) {
                    if (this.cancelled) {
                        if (this.onCancel) {
                            this.owner.trigger(this.onCancel);
                            this.used = true;
                        }
                    } else {
                        if (this.onRelease) {
                            this.owner.trigger(this.onRelease);
                            this.used = true;
                        }
                    }
                    eventData.pixiEvent.stopPropagation();
                }

                this.state.set('down', false);
                this.cancelled = false;
            },
            "mouseover": function () {
                if (this.state.get('down')) {
                    this.cancelled = false;
                }
			},
			"mouseout": function () {
                if (this.state.get('down')) {
                    this.cancelled = true;
                }
			},
			"disable": function () {
                this.state.set('disabled', true);
                this.owner.buttonMode = false;
			},
			"enable": function () {
                this.state.set('disabled', false);
                this.owner.buttonMode = true;
			},
			"toggle-disabled": function () {
                var value = this.state.get('disabled');
                
                this.owner.buttonMode = value;
                this.state.set('disabled', !value);
			}
		},
        
        methods: {
            destroy: function () {
                this.state = null;
            }
        }
	});
}());
