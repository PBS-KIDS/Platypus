/**
 * Provides button functionality for a RenderSprite component.
 *
 * @namespace platypus.components
 * @class LogicCanvasButton
 * @uses Component
 */
/*global platypus */
(function () {
	"use strict";
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
            this.owner.state.disabled = this.disabled;
            this.owner.state.down = false;
            this.owner.buttonMode = !this.disabled;
            this.cancelled = false;
            this.used = false;
            this.last = null;
		},

		events: {
            "handle-logic": function (tick) {
                if (this.last !== (this.disabled === this.owner.state.disabled)) {
                    this.last = (this.disabled === this.owner.state.disabled);
                }
            },
            "mousedown": function (eventData) {
                this.owner.state.down = true;
                if (!this.owner.state.disabled && !(this.useOnce && this.used)) {
                    if (this.onPress) {
                        this.owner.triggerEvent(this.onPress);
                        this.used = true; //Doing this prevents the Release/Cancel calls from occurring. Need to find a way to let the up and down both call for one use buttons.
                    }
                }
            },
            "pressup": function (eventData) {

                if (!this.owner.state.disabled && !(this.useOnce && this.used)) {
                    if (this.cancelled) {
                        if (this.onCancel) {
                            this.owner.triggerEvent(this.onCancel);
                            this.used = true;
                        }
                    } else {
                        if (this.onRelease) {
                            this.owner.triggerEvent(this.onRelease);
                            this.used = true;
                        }
                    }
                }

                this.owner.state.down = false;
                this.cancelled = false;
            },
            "mouseover": function () {
                if (this.owner.state.down) {
                    this.cancelled = false;
                }
			},
			"mouseout": function () {
                if (this.owner.state.down) {
                    this.cancelled = true;
                }
			},
			"disable": function () {
                this.owner.state.disabled = true;
                this.owner.buttonMode = false;
			},
			"enable": function () {
                this.owner.state.disabled = false;
                this.owner.buttonMode = true;
			},
			"toggle-disabled": function () {
                this.owner.buttonMode = this.owner.state.disabled;
                this.owner.state.disabled = !this.owner.state.disabled;
			}
		}
	});
}());
