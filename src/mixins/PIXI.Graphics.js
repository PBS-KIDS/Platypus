/**
 * This adds support for a tiny API to PIXI.Graphics similar to the CreateJS Graphics API. This is used for backwards support for RenderSprite masks.
 */
/* global include, platypus */
(function () {
    'use strict';
    
    var Graphics = include('PIXI.Graphics'),
        debug = function (param) {
            platypus.debug.olive('"' + param + '" is not an available PIXI.Graphics method.');
            return this;
        },
        gfx = Graphics.prototype;
    
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
    
    gfx.cp = debug.bind("cp");
    gfx.lf = debug.bind("lf");
    gfx.rf = debug.bind("rf");
    gfx.bf = debug.bind("bf");
    gfx.ss = debug.bind("ss");
    gfx.sd = debug.bind("sd");
    gfx.s  = debug.bind("s");
    gfx.ls = debug.bind("ls");
    gfx.rs = debug.bind("rs");
    gfx.bs = debug.bind("bs");
    gfx.es = debug.bind("es");
    gfx.rc = debug.bind("rc");
    gfx.dp = debug.bind("dp");
    gfx.p  = debug.bind("p");
    
} ());