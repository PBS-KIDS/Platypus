/*
 * This is a simple helper function that creates a button to allow the game to be toggled
 * to full-screen and back. This is not part of the core game engine, but serves as an
 * example for making the game full-screen. This toggle button relies on styles defined in
 * css/fullscreen.css to make full-screen function.
 * 
 * Method platformer.loadFullScreenButton(element, touchEnabled, onResize)
 * @param element (DOM Element) - The DOM element to make full-screen.
 * @param touchEnabled (boolean) - Whether toggle button should use a touch or click event.
 * @param onResize (function) - Function to run when the toggle happens.
 */ 
(function(ns){
	var fullScreen = document.createElement('div'),
	enabled = false,
	createFunction = function(element, onResize){
		var turnOffFullScreen = function(){
			enabled = false;
			fullScreen.innerHTML = 'Go full-screen';
			element.className = element.className.replace(/ full-screen/g, '');
			onResize();
		};
		document.addEventListener('fullscreenchange', function(e){
			if(!document.fullscreenElement){
				turnOffFullScreen();
			}
		});
		document.addEventListener('webkitfullscreenchange', function(e){
			if(!document.webkitFullscreenElement){
				turnOffFullScreen();
			}
		});
		document.addEventListener('mozfullscreenchange', function(e){
			if(!document.mozFullscreenElement){
				turnOffFullScreen();
			}
		});
		return function(e){
			if(enabled){
				if(document.webkitExitFullscreen){
					document.webkitExitFullscreen();
				} else if (document.mozCancelFullscreen) {
					document.mozCancelFullscreen();
				} else if (document.exitFullscreen) {
					document.exitFullscreen();
				}
				turnOffFullScreen();
			} else {
				enabled = true;
				fullScreen.innerHTML = 'Close full-screen';
				element.className += ' full-screen';
				if(element.webkitRequestFullscreen){
					element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if (element.requestFullscreen) {
					element.requestFullscreen(); // Opera
				}
				onResize();
			}
		};
	};
	
	fullScreen.innerHTML = 'Go full-screen';
	fullScreen.className = 'toggle-full-screen';
	
	ns.loadFullScreenButton = function(element, touchEnabled, onResize){
		if(touchEnabled){
			fullScreen.ontouchstart = createFunction(element, onResize);
		} else {
			fullScreen.onclick = createFunction(element, onResize);
		}

		document.getElementsByTagName('body')[0].appendChild(fullScreen);
		
	};
})(platformer);
