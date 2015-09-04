(function () {
	"use strict";
	
	var prototype = PIXI.DisplayObject.prototype;
	
	prototype.__updateTransform = prototype.updateTransform;
	
	prototype.updateTransform = function () {
		if (this.transformMatrix) {
			// Just copy the current matrix instead of working with properties.
			this.worldTransform.copy(this.transformMatrix).prepend(this.parent.worldTransform);
			
			// multiply the alphas..
			this.worldAlpha = this.alpha * this.parent.worldAlpha;
		
			// reset the bounds each time this is called!
			this._currentBounds = null;
		} else {
			this.__updateTransform();
		}
	};
} ());