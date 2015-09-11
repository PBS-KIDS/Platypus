/**
 * This adds support for a tiny API to PIXI.Graphics similar to the CreateJS Graphics API. This is used for backwards support for RenderSprite masks.
 */
 
(function () {
	"use strict";
	
	var createDebug = function (param) {
			return function () {
				if (platypus.game.settings.debug) {
					console.log('"' + param + '" is not an available PIXI.Graphics method.');
				}
				return this;
			};
		},
		gfx = PIXI.Graphics.prototype;
	
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
	
	gfx.cp = createDebug("cp");
	gfx.lf = createDebug("lf");
	gfx.rf = createDebug("rf");
	gfx.bf = createDebug("bf");
	gfx.ss = createDebug("ss");
	gfx.sd = createDebug("sd");
	gfx.s  = createDebug("s");
	gfx.ls = createDebug("ls");
	gfx.rs = createDebug("rs");
	gfx.bs = createDebug("bs");
	gfx.es = createDebug("es");
	gfx.rc = createDebug("rc");
	gfx.dp = createDebug("dp");
	gfx.p  = createDebug("p");
	
} ());