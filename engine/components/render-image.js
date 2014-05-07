/**
# COMPONENT **render-image**
This component has been deprecated and is retained here for backwards compatibility. Use a [[render-sprite]] component instead.

Requires: ["render-sprite"]
*/
(function(){
	
	console.warn('The "render-image" component has been deprecated. Use a "render-sprite" component instead.');
	
	platformer.components['render-image'] = platformer.components['render-sprite'];

	if(!platformer.components['render-image']){
		//step back and let "render-sprite" load first
		var interval = setInterval(function(){
			if(platformer.components['render-sprite']){
				platformer.components['render-image'] = platformer.components['render-sprite'];
				clearInterval(interval);
			}
		}, 100);
	}
})();
