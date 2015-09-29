/*global PIXI */
/*jslint plusplus:true, nomen:true */
(function () {
	"use strict";
	
	var prototype = PIXI.Container.prototype;
	
	prototype.updateTransform = function () {
        var i = 0,
            j = 0;
        
		if (!this.visible) {
			return;
		}
	
		if (this.transformMatrix) {
			// Just copy the current matrix instead of working with properties.
			this.transformMatrix.copy(this.worldTransform).prepend(this.parent.worldTransform);
			
			// multiply the alphas..
			this.worldAlpha = this.alpha * this.parent.worldAlpha;
		
			// reset the bounds each time this is called!
			this._currentBounds = null;
		} else {
			this.displayObjectUpdateTransform();
		}
	
		for (i = 0, j = this.children.length; i < j; ++i) {
			this.children[i].updateTransform();
		}
	};
	
	prototype.containerUpdateTransform = prototype.updateTransform;
}());