/**
 * This adds support for a tiny API to PIXI.Graphics similar to the CreateJS Graphics API. This is used for backwards support for RenderSprite masks.
 */
 
 (function () {
	 "use strict";
	 
	 var gfx = PIXI.Graphics.prototype;
	 
	 gfx.a  = gfx.arc;
	 gfx.at = gfx.arcTo;
	 gfx.bt = gfx.bezierCurveTo;
	 gfx.c  = gfx.clear;
	 gfx.dc = gfx.drawCircle;
	 gfx.de = gfx.drawEllipse;
	 gfx.dr = gfx.drawRect;
	 gfx.ef = gfx.endFill;
	 gfx.f  = gfx.beginFill;
	 gfx.lt = gfx.lineTo;
	 gfx.mt = gfx.moveTo;
	 gfx.qt = gfx.quadraticCurveTo;
	 gfx.r  = gfx.drawRect;
	 gfx.rr = gfx.drawRoundedRect;
	 
 } ());