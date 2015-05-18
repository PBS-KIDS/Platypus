/**
 * 
 * 
 * @class "logic-gravity" Component
 * @deprecated
 */

(function(){
	console.warn('The "logic-gravity" component has been deprecated. Use a "mover" component instead.');
	
	platformer.components['logic-gravity'] = platformer.components['mover'];

	if(!platformer.components['mover']){
		//step back and let "mover" load first
		var interval = setInterval(function(){
			if(platformer.components['mover']){
				platformer.components['logic-gravity'] = platformer.components['mover'];
				clearInterval(interval);
			}
		}, 100);
	}
})();
