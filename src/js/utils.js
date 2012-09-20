gws.utils = {
		
	createElement : function (parent, tag, className, id) {
						var element = document.createElement(tag);
						className? element.className = className: false;
						id? element.id = id: false;
						parent? parent.appendChild(element): false;
						return element;
					},
					
	createImage : function (parent, className, id, img, alt) {
						var element = gws.createElement(parent, 'img', className, id);
						element.src = img;
						if(title) element.setAttribute('alt', title);
						return element;
					},
					
	createTextBlock : function (parent, className, id, text) {
						var element = gws.createElement(parent, 'div', className, id);
						element.innerHTML = text;
						return element;
					},
					
	createTextSpan : function (parent, className, id, text) {
						var element = gws.createElement(parent, 'span', className, id);
						element.innerHTML = text;
						return element;
					}	
};