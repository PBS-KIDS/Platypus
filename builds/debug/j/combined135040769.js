(function(){
  var platformer = {};

  PBS = this.PBS || {};
  PBS.KIDS = this.PBS.KIDS || {};
  PBS.KIDS.platformer = platformer;

platformer.settings = {"global":{"initialScene":"scene-1","fps":60,"rootElement":"root","aspectRatio":1.333},"aspects":[{"ogg":["firefox","chrome","opera"],"m4a":["ipod","ipad","iphone","android"],"mp3":["msie","safari"]}],"assets":[{"id":"powerup","src":{"ogg":"a/powerup.ogg","mp3":"a/powerup.mp3","m4a":"a/powerup.mp3"}},{"id":"walk","src":{"ogg":"a/walk.ogg","mp3":"a/walk.mp3","m4a":"a/walk.mp3"}},{"id":"jump","src":{"ogg":"a/jump.ogg","mp3":"a/jump.mp3","m4a":"a/jump.mp3"}},{"id":"alpha","src":"i/test.png","data":{"rows":2,"columns":2,"ids":[["horizon","sky"],["ground","rock"]]}},{"id":"buttons","src":"i/buttons.png"},{"id":"mookie-walk","src":"i/mookie.png"},{"id":"tilemap","src":"i/tile-map.png"},{"id":"test","src":"i/test.png"},{"id":"test-animation","src":"i/test-animation.png"},{"id":"tiles","src":"i/tiles.png"},{"id":"objects","src":"i/objects.png"}],"classes":{"Game":{"id":"Game","src":"../src/js/game.js"},"Entity":{"id":"Entity","src":"../src/js/entity.js"},"Layer":{"id":"Layer","src":"../src/js/layer.js"},"Scene":{"id":"Scene","src":"../src/js/scene.js"},"Collision-Shape":{"id":"Collision-Shape","src":"../src/js/collision-shape.js"},"AABB":{"id":"AABB","src":"../src/js/aabb.js"}},"components":{"layer-controller":{"id":"layer-controller","src":"../src/js/layer/layer-controller.js"},"tiled-loader":{"id":"tiled-loader","src":"../src/js/layer/tiled-loader.js"},"lc-render":{"id":"lc-render","src":"../src/js/layer/lc-render.js"},"lc-logic":{"id":"lc-logic","src":"../src/js/layer/lc-logic.js"},"lc-camera":{"id":"lc-camera","src":"../src/js/layer/lc-camera.js"},"lc-basic-collision":{"id":"lc-basic-collision","src":"../src/js/layer/lc-basic-collision.js"},"audio":{"id":"audio","src":"../src/js/entity/audio.js"},"broadcast-events":{"id":"broadcast-events","src":"../src/js/entity/broadcast-events.js"},"entity-container":{"id":"entity-container","src":"../src/js/entity/entity-container.js"},"entity-controller":{"id":"entity-controller","src":"../src/js/entity/entity-controller.js"},"render-debug":{"id":"render-debug","src":"../src/js/entity/render-debug.js"},"render-tile":{"id":"render-tile","src":"../src/js/entity/render-tile.js"},"render-tiles":{"id":"render-tiles","src":"../src/js/entity/render-tiles.js"},"render-button":{"id":"render-button","src":"../src/js/entity/render-button.js"},"render-animation":{"id":"render-animation","src":"../src/js/entity/render-animation.js"},"logic-directional-movement":{"id":"logic-directional-movement","src":"../src/js/entity/logic-directional-movement.js"},"collision-hero":{"id":"collision-hero","src":"../src/js/entity/collision-hero.js"},"collision-tiles":{"id":"collision-tiles","src":"../src/js/entity/collision-tiles.js"}},"entities":{"tile":{"id":"tile","components":[{"type":"render-tile","spritesheet":"import"}]},"tile-layer":{"id":"tile-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"},{"type":"collision-tiles","collisionMap":"import"}]},"render-layer":{"id":"render-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"}],"properties":{}},"collision-layer":{"id":"collision-layer","components":[{"type":"collision-tiles","collisionMap":"import"}]},"button-left":{"id":"button-left","components":[{"type":"entity-controller","controlMap":{"mouse:left-button":"pressed"}},{"type":"broadcast-events","events":{"pressed":"button-left"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":46,"height":46},"animations":{"default":0}},"state":"default","acceptInput":{"click":true,"touch":true}}],"properties":{"debug-events":["button-left"],"state":false,"x":17,"y":177,"width":46,"height":46}},"button-right":{"id":"button-right","components":[{"type":"entity-controller","controlMap":{"mouse:left-button":"pressed"}},{"type":"broadcast-events","events":{"pressed":"button-right"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":46,"height":46},"animations":{"default":1}},"state":"default","acceptInput":{"click":true,"touch":true}}],"properties":{"debug-events":["button-right"],"state":false,"x":257,"y":177,"width":46,"height":46}},"hero":{"id":"hero","components":[{"type":"entity-controller","controlMap":{"key:w":"go-up","key:up-arrow":"go-up","key:a":"go-left","key:left-arrow":"go-left","button-left":"go-left","key:s":"go-down","key:down-arrow":"go-down","key:d":"go-right","key:right-arrow":"go-right","button-right":"go-right","key:q":"go-up-left","key:e":"go-up-right","key:z":"go-down-left","key:c":"go-down-right"}},{"type":"logic-directional-movement","speed":1},{"type":"collision-hero","shape":{"offset":[0,-120],"type":"rectangle","points":[[-80,-120],[80,120]]},"collisionType":"hero","collidesWith":["solid"]},{"type":"render-animation","spriteSheet":{"images":["mookie-walk"],"frames":{"width":26,"height":27,"regY":26,"regX":13},"animations":{"standing-up":[2],"standing-up-right":[2],"standing-right":[2],"standing-down-right":[2],"standing-down":[5],"standing-down-left":[5],"standing-left":[5],"standing-up-left":[5],"walking-up":{"frames":[0,1,2,3],"frequency":4},"walking-up-right":{"frames":[0,1,2,3],"frequency":4},"walking-right":{"frames":[0,1,2,3],"frequency":4},"walking-down-right":{"frames":[0,1,2,3],"frequency":4},"walking-down":{"frames":[7,6,5,4],"frequency":4},"walking-down-left":{"frames":[7,6,5,4],"frequency":4},"walking-left":{"frames":[7,6,5,4],"frequency":4},"walking-up-left":{"frames":[7,6,5,4],"frequency":4}}}},{"type":"audio","audioMap":{"walking":{"sound":"walk","interrupt":"none"},"jumping":"jump"}}],"properties":{"x":100,"y":100,"width":160,"height":240,"state":"standing","heading":"left","camera":"locked"}},"block":{"id":"block","components":[{"type":"collision-hero","shape":{"offset":[0,-120],"type":"rectangle","points":[[-120,-120],[120,120]]},"collisionType":"solid"},{"type":"render-animation","spriteSheet":{"images":["tilemap"],"frames":{"width":24,"height":24,"regX":12,"regY":24},"animations":{"tile":9}},"state":"tile"}],"properties":{"x":50,"y":50,"width":240,"height":240}}},"includes":{"EaselJS":{"id":"EaselJS","src":"http://code.createjs.com/easeljs-0.5.0.min.js"},"TweenJS":{"id":"TweenJS","src":"http://code.createjs.com/tweenjs-0.3.0.min.js"},"SoundJS":{"id":"SoundJS","src":"http://code.createjs.com/soundjs-0.3.0.min.js"},"PreloadJS":{"id":"PreloadJS","src":"http://code.createjs.com/preloadjs-0.2.0.min.js"},"Browser":{"id":"Browser","src":"../src/js/browser.js"},"Main":{"id":"Main","src":"../src/js/main.js"},"MainCSS":{"id":"MainCSS","src":"../src/css/main.css"},"GameCSS":{"id":"GameCSS","src":"../src/css/game.css"}},"scenes":{"scene-menu":{"layers":[{"id":"buttons","components":[{"type":"lc-logic"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"button"}]}]}],"id":"scene-menu"},"scene-1":{"layers":[{"id":"action","components":[{"type":"lc-camera","width":3200},{"type":"lc-logic"},{"type":"lc-basic-collision"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container"},{"type":"tiled-loader","level":"level-1","unitsPerPixel":10}]},{"id":"interface","components":[{"type":"lc-camera","width":320},{"type":"lc-logic"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"button-left"},{"type":"button-right"}]}]}],"id":"scene-1"},"scene-2":{"layers":[{"id":"action","components":[{"type":"lc-camera","width":320},{"type":"lc-logic"},{"type":"lc-basic-collision"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container"},{"type":"tiled-loader","level":"level-2"}]},{"id":"interface","components":[{"type":"lc-camera","width":320},{"type":"lc-logic"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"button-left"},{"type":"button-right"}]}]}],"id":"scene-2"}},"levels":{"level-1":{"height":20,"layers":[{"data":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],"height":20,"name":"background","opacity":1,"properties":{"entity":"render-layer"},"type":"tilelayer","visible":true,"width":20,"x":0,"y":0},{"data":[17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,22,16,16,16,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,15,16,16,16,16,16,17,0,15,17,0,0,15,16,16,16,16,22,23,0,0,0,0,0,0,0,0,0,0,23,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,22,17,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,22,17,0,0,0,0,0,21,22,16,16,16,17,0,0,0,0,0,0,0,0,22,16,16,16,17,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,5,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,21,5,0,0,0,0,0,3,3,15,17,3,3,3,0,0,0,0,0,0,4,5,0,0,0,0,0,3,3,21,23,9,9,9,17,0,0,0,0,0,4,23,0,0,0,0,0,3,3,21,23,9,9,15,22,17,9,9,9,9,21,22,16,16,16,16,16,16,16,22,22,16,16,22,22,22,16,16,16,16,22],"height":20,"name":"action","opacity":1,"properties":{"entity":"tile-layer"},"type":"tilelayer","visible":true,"width":20,"x":0,"y":0},{"height":20,"name":"guys","objects":[{"gid":19,"height":0,"name":"","properties":{},"type":"hero","width":0,"x":49,"y":144},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":257,"y":156},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":281,"y":142},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":306,"y":152},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":363,"y":266},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":47,"y":272},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":142,"y":328},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":251,"y":449},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":424,"y":428},{"gid":12,"height":0,"name":"","properties":{},"type":"","width":0,"x":167,"y":192},{"gid":18,"height":0,"name":"","properties":{},"type":"","width":0,"x":409,"y":191},{"gid":18,"height":0,"name":"","properties":{},"type":"","width":0,"x":409,"y":166},{"gid":24,"height":0,"name":"","properties":{},"type":"","width":0,"x":364,"y":193},{"gid":28,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":384},{"height":37,"name":"","properties":{},"type":"","width":35,"x":419,"y":64},{"height":29,"name":"","properties":{},"type":"","width":46,"x":73,"y":402},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":288},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":360},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":360},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":264},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":432},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":408},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":240,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":240},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":216},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":192},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":144},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":72}],"opacity":1,"type":"objectgroup","visible":true,"width":20,"x":0,"y":0}],"orientation":"orthogonal","properties":{"timer":"12"},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/tile-map.png","imageheight":96,"imagewidth":144,"margin":0,"name":"tilemap","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"11":{"entity":"sign"},"17":{"entity":"enemy"},"18":{"entity":"mookie"},"23":{"entity":"flower"},"5":{"entity":"gem"},"9":{"entity":"block"}},"tilewidth":24},{"firstgid":25,"image":"../src/images/test.png","imageheight":48,"imagewidth":48,"margin":0,"name":"test","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"3":{"a":"b"}},"tilewidth":24}],"tilewidth":24,"version":1,"width":20,"id":"level-1"},"level-2":{"height":18,"layers":[{"data":[0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,37,37,37,37,37,37,37,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,37,37,37,37,37,37,37,0,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,0,0,0,1,1,1,1,1,1,0,37,0,37,37,37,37,37,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,0,0,0,0,1,1,1,1,1,0,37,0,0,0,37,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,0,1,37,37,0,37,37,37,37,37,0,0,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,0,1,1,1,0,37,37,37,37,37,37,37,0,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,1,1,1,1,1,1,1,0,1,0,0,1,1,1,1,1,1,1,1,0,0,37,0,37,37,37,37,37,0,0,10,10,0,0,0,0,0,1,1,1,0,10,0,0,1,1,1,1,1,1,1,0,10,0,10,10,0,1,1,1,1,1,0,37,0,37,0,37,37,37,37,37,0,0,19,19,0,0,0,0,0,0,0,0,0,19,0,0,1,1,1,1,1,1,0,0,19,0,19,19,0,1,1,1,1,1,0,37,0,37,0,37,37,37,37,37,0,0,28,28,28,28,28,28,0,0,0,0,0,28,28,28,0,0,0,1,1,1,37,0,28,0,28,28,0,1,1,1,1,0,37,37,0,37,0,37,37,37,37,37,0,0,37,37,37,37,37,37,37,37,37,37,37,0,0,0,0,0,0,0,0,37,37,0,37,0,37,37,0,1,1,1,1,0,37,37,0,37,0,37,37,37,37,37,0,0,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,0,37,37,0,37,37,0,37,37,0,0,0,0,37,37,37,37,37,0,37,37,37,37,37,0,0,37,37,0,0,0,37,0,0,0,37,37,37,37,37,37,37,37,37,37,37,37,37,0,37,37,0,37,37,0,0,0,37,37,37,37,37,0,37,37,37,37,37,0,0,37,0,37,37,37,37,37,37,37,0,37,37,37,37,37,37,37,37,37,37,37,37,37,0,37,37,0,37,37,37,37,37,37,37,37,37,0,0,0,0,0,37,0,0,37,0,37,37,37,37,37,37,37,0,37,37,37,37,0,37,0,0,37,0,0,0,37,37,0,37,0,0,0,0,0,0,0,37,0,0,0,29,30,37,37,37,37,0,37,37,37,37,37,37,37,37,37,0,37,37,37,37,0,37,37,37,37,37,37,37,0,37,37,37,0,0,0,0,0,0,0,37,0,0,0,38,39,37,37,37,37,0,0,0,0,0,37,37,37,37,0,0,37,37,37,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"height":18,"name":"background","opacity":1,"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"data":[6,21,21,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,11,13,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,3,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,11,13,0,0,0,0,0,0,5,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,12,0,0,12,3,3,0,0,0,0,0,0,13,0,3,0,0,0,0,0,11,15,3,3,3,0,3,3,18,0,0,0,0,0,0,3,0,0,0,0,0,12,0,0,12,0,0,12,12,12,3,0,0,0,0,0,12,0,12,3,3,0,3,3,3,13,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,12,0,3,0,0,0,12,0,0,0,0,0,3,3,0,0,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,0,11,0,3,3,3,0,3,3,0,0,0,3,0,0,12,0,0,0,12,0,0,0,3,3,0,0,0,11,0,0,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,3,0,0,0,3,12,0,0,0,0,0,0,0,12,0,3,3,0,0,0,0,0,0,0,0,3,16,0,12,0,0,0,0,0,12,13,0,0,32,3,32,3,32,0,0,0,12,0,12,12,0,0,0,0,0,0,0,11,0,12,0,0,5,0,0,0,0,0,3,0,12,0,12,0,0,0,0,0,12,12,0,0,33,35,36,35,34,3,3,3,12,0,12,12,0,0,0,0,0,0,3,16,0,12,0,0,12,0,0,0,0,0,12,0,12,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,20,12,12,12,12,0,0,0,3,3,3,0,0,0,0,12,0,12,0,0,12,0,0,0,0,3,0,0,12,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,0,0,0,12,12,12,12,12,12,3,12,0,0,12,0,12,0,0,12,0,0,0,0,12,0,0,12,0,11,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,12,0,0,3,0,0,12,24,26,25,0,0,0,0,0,12,0,0,0,0,0,12,12,0,0,2,3,3,0,3,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,23,21,23,0,0,0,0,0,12,0,0,0,0,0,12,12,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,12,3,3,3,4,0,2,12,0,11,0,0,0,0,0,0,0,13,0,0,0,0,3,0,3,3,0,3,3,3,0,0,3,0,12,32,3,32,3,32,4,0,2,3,18,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,13,0,0,0,0,12,0,0,0,0,0,0,0,3,0,0,0,12,33,35,36,35,34,13,0,11,12,13,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],"height":18,"name":"action","opacity":1,"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"height":18,"name":"entities","objects":[{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":480,"y":72},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":48},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":168},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":216},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":264},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":216},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":264},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":24,"y":144},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":312},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":408},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":72},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":192},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":24,"y":408},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":240,"y":336},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":360},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":72},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":360},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":288},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":408},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":384},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":96},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":72},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":48},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":144},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":120},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":96},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":168,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":240,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":72},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":96},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":72},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":96},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":336},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":96},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":360},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":264},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":168,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":336,"y":432},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":432,"y":168},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":168},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":168},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":480,"y":264},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":264},{"gid":64,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":48},{"gid":64,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":144},{"gid":65,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":168},{"gid":70,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":288},{"gid":70,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":168},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":192},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":216},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":24},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":48},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":48},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":72},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":96},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":120},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":312},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":336},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":360},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":24},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":48},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":72},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":96},{"gid":75,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":120},{"gid":66,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":120},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":480,"y":408},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":432,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":408},{"gid":65,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":408},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":408},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":384},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":360},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":360},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":336},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":336},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":288},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":264},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":240},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":216},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":192},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":168},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":168},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":168},{"gid":63,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":168},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":336,"y":264},{"gid":46,"height":0,"name":"","properties":{},"type":"hero","width":0,"x":24,"y":96}],"opacity":1,"type":"objectgroup","visible":true,"width":44,"x":0,"y":0}],"orientation":"orthogonal","properties":{},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/tiles.png","imageheight":120,"imagewidth":216,"margin":0,"name":"tiles","properties":{},"spacing":0,"tileheight":24,"tilewidth":24},{"firstgid":46,"image":"../src/images/objects.png","imageheight":96,"imagewidth":192,"margin":0,"name":"objects","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"0":{"entity":"hero"},"10":{"entity":"block"}},"tilewidth":24}],"tilewidth":24,"version":1,"width":44,"id":"level-2"}}};
platformer.classes = {};

/*--------------------------------------------------
 *   Game - ../src/js/game.js
 */
platformer.classes.game = (function(){
	var bindEvent = function(eventId, callback){return function(event){callback(eventId, event);};},
	game          = function (definition){
		this.currentScene = undefined;
		this.settings = definition;
		this.rootElement = document.createElement('div');
		this.rootElement.id = definition.global.rootElement;
		document.getElementsByTagName('body')[0].appendChild(this.rootElement);
		
		this.loadScene(definition.global.initialScene);
		
		// Send the following events along to the scene to handle as necessary:
		var self = this,
		callback = function(eventId, event){
			self.currentScene.trigger(eventId, event);
		};
		this.bindings = [];
		this.addEventListener(window, 'keydown', callback);
		this.addEventListener(window, 'keyup',   callback);

		// If aspect ratio of game area should be maintained on resizing, create new callback to handle it
		if(definition.global.aspectRatio){
			callback = function(eventId, event){
				var element = self.rootElement;
				var ratio   = definition.global.aspectRatio;
				var newW = window.innerWidth;
				var newH = window.innerHeight;
				var bodyRatio = newW / newH;
				if (bodyRatio > ratio)
				{  //Width is too wide
					element.style.height = newH + 'px';
				    newW = newH * ratio;
				    element.style.width = newW + 'px';
				} else {  //Height is too tall
					element.style.width = newW + 'px';
				    newH = newW / ratio;
				    element.style.height = newH + 'px';
				}
				if(definition.global.resizeFont){
					element.style.fontSize = Math.round(newW / 100) + 'px';
				}
				element.style.marginTop = '-' + Math.round(newH / 2) + 'px';
				element.style.marginLeft = '-' + Math.round(newW / 2) + 'px';
				self.currentScene.trigger(eventId, event);
			};
			callback('resize');
		} else if(definition.global.resizeFont) {
			callback = function(eventId, event){
				self.rootElement.style.fontSize = parseInt(window.innerWidth / 100) + 'px';
				self.currentScene.trigger(eventId, event);
			};
			callback('resize');
		}
		this.addEventListener(window, 'orientationchange', callback);
		this.addEventListener(window, 'resize',            callback);
		
		this.prevTime = 0;
		this.timingFunction = false;
		if (window.performance && window.performance.webkitNow)
		{
			this.timingFunction = function() {return window.performance.webkitNow();};
		} else if (window.performance && window.performance.now) {
			this.timingFunction = function() {return window.performance.now();};
		} else {
			this.date = new Date();
			this.timingFunction = function() {return this.date.getTime();};
		}
		this.prevTime = this.timingFunction();
	},
	proto = game.prototype;
	
	proto.tick = function(){
		var now = this.timingFunction();
		var deltaT = now - this.prevTime; 
		this.prevTime = now;
		if(this.currentScene) this.currentScene.tick(deltaT);
	};
	
	proto.loadScene = function(sceneName){ //TODO: add transitions here!
		this.currentScene = new platformer.classes.scene(this.settings.scenes[sceneName], this.rootElement);
	};
	
	proto.addEventListener = function(element, event, callback){
		this.bindings[event] = {element: element, callback: bindEvent(event, callback)};
		element.addEventListener(event, this.bindings[event].callback, true);
	};
	
	proto.destroy = function ()
	{
		for (var binding in this.bindings){
			element.removeEventListener(this.bindings[binding].element, this.bindings[binding].callback, true);
		}
		this.bindings.length = 0;
	};
	
	return game;
})();

/*--------------------------------------------------
 *   Entity - ../src/js/entity.js
 */
platformer.classes.entity = (function(){
	var entity = function(definition, instanceDefinition){
		var self             = this,
		index                = undefined,
		componentDefinition  = undefined,
		def                  = definition || {},
		componentDefinitions = def.components || [],
		defaultProperties    = def.properties || {},
		instance             = instanceDefinition || {},
		instanceProperties   = instance.properties || {};
		
		self.components = [];
		self.messages   = [];
		self.type = def.id;

		for (index in defaultProperties){ // This takes the list of properties in the JSON definition and appends them directly to the object.
			self[index] = defaultProperties[index];
		}
		for (index in instanceProperties){ // This takes the list of options for this particular instance and appends them directly to the object.
			self[index] = instanceProperties[index];
		}
		
		for (index in componentDefinitions){
			componentDefinition = componentDefinitions[index];
			if(platformer.components[componentDefinition.type]){
				self.addComponent(new platformer.components[componentDefinition.type](self, componentDefinition));
			} else {
				console.warn("Component '" + componentDefinition.type + "' is not defined.", componentDefinition);
			}
		}
		
		self.trigger('load');
	};
	var proto = entity.prototype;
	
	proto.addComponent = function(component){
	    this.components.push(component);
	    return component;
	};

	proto.removeComponent = function(component){
	    for (var index in this.components){
		    if(this.components[index] === component){
		    	this.components.splice(index, 1);
		    	component.destroy();
			    return component;
		    }
	    }
	    return false;
	};
	
	proto.bind = function(messageId, func){
		if(!this.messages[messageId]) this.messages[messageId] = [];
		this.messages[messageId].push(func);
	};
	
	proto.unbind = function(messageId, func){
		if(!this.messages[messageId]) this.messages[messageId] = [];
		for (var x in this.messages[messageId]){
			if(this.messages[messageId][x] === func){
				this.messages[messageId].splice(x,1);
				break;
			}
		}
	};
	
	proto.trigger = function(messageId, value){
		var i = 0;
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value);
			}
		}
		if(this['debug']){
			if(i){
				console.log('Entity "' + this.type + '": Event "' + messageId + '" has ' + i + ' subscriber' + ((i>1)?'s':'') + '.', value);
			} else {
				console.warn('Entity "' + this.type + '": Event "' + messageId + '" has no subscribers.', value);
			}
		}
	};
	
	proto.getMessageIds = function(){
		var messageIds = [];
		for (var messageId in this.messages){
			messageIds.push(messageId);
		}
		return messageIds;
	};
	
	proto.destroy = function(){
		for (var x in this.components)
		{
			this.removeComponent(this.components[x]);
		}
	};
	
	return entity;
})();

/*--------------------------------------------------
 *   Layer - ../src/js/layer.js
 */
platformer.classes.layer = (function(){
	var layer = function(definition, rootElement){
		var componentDefinitions = definition.components,
		componentDefinition = undefined;
		
		this.type = definition.id || 'layer';
		
		this.rootElement = rootElement;
		this.components = [];
		this.tickMessages = [];
		this.messages   = [];
		
		for (var index in componentDefinitions){
			componentDefinition = componentDefinitions[index];
			this.addComponent(new platformer.components[componentDefinition.type || componentDefinition.id](this, componentDefinition));
		}
		
		this.trigger('load');
	},
	proto = layer.prototype;
	
	proto.tick = function(deltaT){
		for(var message in this.tickMessages){
			this.trigger(this.tickMessages[message], deltaT);
		}
	};
	
	proto.addComponent = function(component){
		var alreadyListed = false,
		i = 0,
		j = 0;
		this.components.push(component);
	    if(component.tickMessages){ //component wants to hear these messages every tick
	    	for (i in component.tickMessages){
	    		alreadyListed = false;
	    		for (j in this.tickMessages){
	    			if(component.tickMessages[i] === this.tickMessages[j]){
	    				alreadyListed = true;
	    			}
	    		}
	    		if(!alreadyListed){
	    			this.tickMessages.push(component.tickMessages[i]);
	    		}
	    	}
	    }
	    return component;
	};

	proto.removeComponent = function(component){
	    for (var index in this.components){
		    if(this.components[index] === component){
		    	this.components.splice(index, 1);
		    	component.destroy();
			    return component;
		    }
	    }
	    return false;
	};
	
	proto.bind = function(message, func){
		if(!this.messages[message]) this.messages[message] = [];
		this.messages[message].push(func);
	};
	
	proto.unbind = function(message, func){
		if(!this.messages[message]) this.messages[message] = [];
		for (var messageIndex in this.messages[message]){
			if(this.messages[message][messageIndex] === func){
				this.messages[message].splice(messageIndex,1);
				break;
			}
		}
	};
	
	proto.trigger = function(messageId, value){
		var i = 0;
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value);
			}
		}
		if(this['debug']){
			if(i){
				console.log('Layer "' + this.type + '": Event "' + messageId + '" has ' + i + ' subscriber' + ((i>1)?'s':'') + '.', value);
			} else {
				console.warn('Layer "' + this.type + '": Event "' + messageId + '" has no subscribers.', value);
			}
		}
	};
	
	return layer;
})();

/*--------------------------------------------------
 *   Scene - ../src/js/scene.js
 */
platformer.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers;
		this.rootElement = rootElement;
		this.layers = [];
		for(var layer in layers){
			this.layers.push(new platformer.classes.layer(layers[layer], this.rootElement));
		}
	};
	var proto = scene.prototype;
	
	proto.tick = function(deltaT){
		for(var layer in this.layers){
			this.layers[layer].tick(deltaT);
		}
	};
	
	proto.trigger = function(eventId, event){
		for(var layer in this.layers){
			this.layers[layer].trigger(eventId, event);
		}
	};
	
	return scene;
})();


/*--------------------------------------------------
 *   Collision-Shape - ../src/js/collision-shape.js
 */
platformer.classes.collisionShape = (function(){
	var collisionShape = function(location, type, points, offset){
		this.offset = offset || [0,0];
		this.x = location[0] + this.offset[0];
		this.y = location[1] + this.offset[1];
		this.prevX = this.x;
		this.prevY = this.y;
		this.type = type || 'rectangle';
		this.subType = '';
		this.points = points; //Points should distributed as if the 0,0 is the focal point of the object.
		this.aABB = undefined;
		
		var width = 0;
		var height = 0; 
		switch (this.type)
		{
		case 'rectangle': //need TL and BR points
		case 'circle': //need TL and BR points
			//this.aABB.left = this.points[0][0];
			//this.aABB.right = this.points[1][0];
			//this.aABB.top = this.points[0][1];
			//this.aABB.bottom = this.points[1][1];
			width = this.points[1][0] - this.points[0][0];
			height = this.points[1][1] - this.points[0][1];
			break;
		case 'triangle': //Need three points, start with the right angle corner and go clockwise.
			if (this.points[0][1] == this.points[1][1] && this.points[0][0] == this.points[2][0])
			{
				if (this.points[0][0] < this.points[1][0])
				{
					//TOP LEFT CORNER IS RIGHT
					this.subType = 'tl';
					//this.aABB.left = this.points[0][0];
					//this.aABB.right = this.points[1][0];
					//this.aABB.top = this.points[0][1];
					//this.aABB.bottom = this.points[2][1];
					width = this.points[1][0] - this.points[0][0];
					height = this.points[2][1] - this.points[0][1];
				} else {
					//BOTTOM RIGHT CORNER IS RIGHT
					this.subType = 'br';
					//this.aABB.left = this.points[1][0];
					//this.aABB.right = this.points[0][0];
					//this.aABB.top = this.points[2][1];
					//this.aABB.bottom = this.points[0][1];
					width = this.points[0][0] - this.points[1][0];
					height = this.points[0][1] - this.points[2][1];
				}
				
			} else if (this.points[0][1] == this.points[2][1] && this.points[0][0] == this.points[1][0]) {
				if (this.points[0][1] < this.points[1][1])
				{
					//TOP RIGHT CORNER IS RIGHT
					this.subType = 'tr';
					//this.aABB.left = this.points[2][0];
					//this.aABB.right = this.points[0][0];
					//this.aABB.top = this.points[0][1];
					//this.aABB.bottom = this.points[1][1];
					width = this.points[0][0] - this.points[2][0];
					height = this.points[1][1] - this.points[0][1];
				} else {
					//BOTTOM LEFT CORNER IS RIGHT
					this.subType = 'bl';
					//this.aABB.left = this.points[0][0];
					//this.aABB.right = this.points[2][0];
					//this.aABB.top = this.points[1][1];
					//this.aABB.bottom = this.points[0][1];
					width = this.points[2][0] - this.points[0][0];
					height = this.points[0][1] - this.points[1][1];
				}
			} 
		}
		
		this.aABB = new platformer.classes.aABB(this.x, this.y, width, height);
		
		/*
		this.aABB.width = this.aABB.right - this.aABB.left;
		this.aABB.height = this.aABB.bottom - this.aABB.top;
		this.aABB.halfWidth = this.aABB.width / 2;
		this.aABB.halfHeight = this.aABB.height / 2;
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
		*/
	};
	var proto = collisionShape.prototype;
	
	proto.update = function(x, y){
		//alert('x: ' + x + ' y: ' + y);
		
		this.prevX = this.x;
		this.prevY = this.y;
		this.x = x + this.offset[0];
		this.y = y + this.offset[1];
		this.aABB.move(this.x, this.y);
		/*
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
		*/
		//alert('this.x: ' + this.x + ' this.y: ' + this.y + ' this.prevX: ' + this.prevX + ' this.prevY: ' + this.prevY);
	};
	
	proto.setXY = function (x, y) {
		this.x = x;
		this.y = y;
	};
	
	proto.getXY = function () {
		return [this.x, this.y];
	};
	
	proto.getX = function () {
		return this.x;
	};
	
	proto.getY = function () {
		return this.y;
	};
	
	proto.getPrevX = function () {
		return this.prevX;
	};
	
	proto.getPrevY = function () {
		return this.prevY;
	};
	
	proto.getPrevLocation = function () {
		return [this.prevX, this.prevY];
	};
	
	proto.getAABB = function(){
		return this.aABB;
	};
	
	proto.getXOffset = function(){
		return this.offset[0];
	};
	
	proto.getYOffset = function(){
		return this.offset[1];
	};
	
	return collisionShape;
})();

/*--------------------------------------------------
 *   AABB - ../src/js/aabb.js
 */
platformer.classes.aABB = (function(){
	var aABB = function(x, y, width, height){
		this.x = x || 0;
		this.y = y || 0;
		this.width = width; //this.right - this.left;
		this.height = height; //this.bottom - this.top;
		this.halfWidth = this.width / 2;
		this.halfHeight = this.height / 2;
		this.left = -this.halfWidth + this.x;
		this.right = this.halfWidth + this.x;
		this.top = -this.halfHeight + this.y;
		this.bottom = this.halfHeight + this.y;
	};
	var proto = aABB.prototype;
	
	proto.move = function(x, y){
		this.x = x;
		this.y = y;
		this.left = -this.halfWidth + this.x;
		this.right = this.halfWidth + this.x;
		this.top = -this.halfHeight + this.y;
		this.bottom = this.halfHeight + this.y;
		return this;
	};
	
	proto.getCopy = function(){
		return new platformer.classes.aABB(this.x, this.y, this.width, this.height);
	};
	
	return aABB;
})();
platformer.components = {};

/*--------------------------------------------------
 *   layer-controller - ../src/js/layer/layer-controller.js
 */
platformer.components['layer-controller'] = (function(){
	var relay = function(event, self){
		return function(value){
			var suffix = value.released?':up':':down';
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event + suffix, value);
			}
		}; 
	},
	keyMap = {
		kc0:   'unknown',         
		kc8:   'backspace',
		kc9:   'tab',
		kc12:  'numpad-5-shift',
		kc13:  'enter',
		kc16:  'shift',
		kc17:  'ctrl',
		kc18:  'alt',
		kc19:  'pause',
		kc20:  'caps-lock',
		kc27:  'esc',
		kc32:  'space',
		kc33:  'page-up',
		kc34:  'page-down',
		kc35:  'end',
		kc36:  'home',
		kc37:  'left-arrow',
		kc38:  'up-arrow',
		kc39:  'right-arrow',
		kc40:  'down-arrow',
		kc42:  'numpad-multiply',
		kc43:  'numpad-add',
		kc44:  'print-screen',
		kc45:  'insert',
		kc46:  'delete',
		kc47:  'numpad-division',
		kc48:  '0',
		kc49:  '1',
		kc50:  '2',
		kc51:  '3',
		kc52:  '4',
		kc53:  '5',
		kc54:  '6',
		kc55:  '7',
		kc56:  '8',
		kc57:  '9',
		kc59:  'semicolon',
		kc61:  'equals',
		kc65:  'a',
		kc66:  'b',
		kc67:  'c',
		kc68:  'd',
		kc69:  'e',
		kc70:  'f',
		kc71:  'g',
		kc72:  'h',
		kc73:  'i',
		kc74:  'j',
		kc75:  'k',
		kc76:  'l',
		kc77:  'm',
		kc78:  'n',
		kc79:  'o',
		kc80:  'p',
		kc81:  'q',
		kc82:  'r',
		kc83:  's',
		kc84:  't',
		kc85:  'u',
		kc86:  'v',
		kc87:  'w',
		kc88:  'x',
		kc89:  'y',
		kc90:  'z',
		kc91:  'left-windows-start',
		kc92:  'right-windows-start',
		kc93:  'windows-menu',
		kc96:  'back-quote',
		kc106: 'numpad-multiply',
		kc107: 'numpad-add',
		kc109: 'numpad-minus',
		kc110: 'numpad-period',
		kc111: 'numpad-division',
		kc112: 'f1',
		kc113: 'f2',
		kc114: 'f3',
		kc115: 'f4',
		kc116: 'f5',
		kc117: 'f6',
		kc118: 'f7',
		kc119: 'f8',
		kc120: 'f9',
		kc121: 'f10',
		kc122: 'f11',
		kc123: 'f12',
		kc144: 'num-lock',
		kc145: 'scroll-lock',
		kc186: 'semicolon',
		kc187: 'equals',
		kc188: 'comma',
		kc189: 'hyphen',
		kc190: 'period',
		kc191: 'forward-slash',
		kc192: 'back-quote',
		kc219: 'open-bracket',
		kc220: 'back-slash',
		kc221: 'close-bracket',
		kc222: 'quote'
	},
	component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['check-inputs'];
		this.addListeners(['entity-added', 'check-inputs', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel']);
	},
	proto = component.prototype; 

	proto['keydown'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + value.keyCode] || ('key-code-' + value.keyCode)) + ':down', value);
		}
	}; 
		
	proto['keyup'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + value.keyCode] || ('key-code-' + value.keyCode)) + ':up', value);
		}
	};
	
/* this has been moved to individual entities	
	proto['mousedown'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('mouse:' + mouseMap[value.button] + ':down', value);
		}
	}; 
		
	proto['mouseup'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('mouse:' + mouseMap[value.button] + ':up', value);
		}
	};
	
	proto['touchstart'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('touch:down', value);
		}
	}; 
		
	proto['touchend'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('touch:up', value);
		}
	};
	
	proto['touchmove'] = proto['touchcancel'] = proto['mousemove'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger(value.type, value);
		}
	};
*/
	
	proto['check-inputs'] = function(resp){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('controller:tick');
		}
	};

	proto['entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'controller')
			{
				// Check for custom input messages that should be relayed from scene.
				if(entity.controlMap){
					for(var y in entity.controlMap){
						if((y.indexOf('key:') < 0) || (y.indexOf('mouse:') < 0)){
							if(!this[y]){
								this.addListener(y);
								this[y] = relay(y, this);
							}
						}
					}
				}
				
				this.entities.push(entity);
				entity.trigger('controller:load');
				break;
			}
		}
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   tiled-loader - ../src/js/layer/tiled-loader.js
 */
platformer.components['tiled-loader'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load']);

		this.level = platformer.settings.levels[definition.level];
		this.tileEntityId = definition.tileEntityId || 'tile';
		this.unitsPerPixel = definition.unitsPerPixel || 1;
	},
	proto = component.prototype; 

	proto['load'] = function(){
		var actionLayer = 0;
		
		for(; actionLayer < this.level.layers.length; actionLayer++){
			this.setupLayer(this.level.layers[actionLayer], this.level);
		}
		this.owner.removeComponent(this);
	};
	
	proto.setupLayer = function(layer, level){
		var width      = layer.width,
		height         = layer.height,
		images         = [],
		tilesets       = level.tilesets,
		tileWidth      = level.tilewidth,
		tileHeight     = level.tileheight,
		x              = 0,
		y              = 0,
		obj            = 0,
		entity         = undefined,
		entityType     = '',
		tileset        = undefined,
		properties     = undefined,
		tileDefinition = undefined,
		importAnimation= undefined,
		importCollision= undefined,
		importRender   = undefined,
		followEntity   = undefined;

		for (x = 0; x < tilesets.length; x++){
			if(platformer.assets[tilesets[x].name]){ // Prefer to have name in tiled match image id in game
				images.push(platformer.assets[tilesets[x].name]);
			} else {
				images.push(tilesets[x].image);
			}
		}
		if(layer.type == 'tilelayer'){
			// First determine which type of entity this layer should behave as:
			entity = 'tile-layer'; // default
			if(layer.properties && layer.properties.entity){
				entity = layer.properties.entity;
			} else { // If not explicitly defined, try using the name of the layer
				switch(layer.name){
				case "background":
				case "foreground":
					entity = 'render-layer';
					break;
				case "collision":
					entity = 'collision-layer';
					break;
				}
			}
			
			//TODO: a bit of a hack to copy an object instead of overwrite values
			tileDefinition  = JSON.parse(JSON.stringify(platformer.settings.entities[entity]));

			importAnimation = {};
			importCollision = [];
			importRender    = [];

			tileDefinition.properties            = tileDefinition.properties || {};
			tileDefinition.properties.width      = tileWidth  * width  * this.unitsPerPixel;
			tileDefinition.properties.height     = tileHeight * height * this.unitsPerPixel;
			tileDefinition.properties.columns    = width;
			tileDefinition.properties.rows       = height;
			tileDefinition.properties.tileWidth  = tileWidth  * this.unitsPerPixel;
			tileDefinition.properties.tileHeight = tileHeight * this.unitsPerPixel;
			tileDefinition.properties.scaleX     = this.unitsPerPixel;
			tileDefinition.properties.scaleY     = this.unitsPerPixel;

			for (x = 0; x < width; x++){
				importCollision[x] = [];
				importRender[x]    = [];
				for (y = 0; y < height; y++){
					if(typeof importAnimation['tile' + (+layer.data[x + y * width] - 1)] == 'undefined'){
						importAnimation['tile' + (+layer.data[x + y * width] - 1)] = +layer.data[x + y * width] - 1;
					};
					importCollision[x][y] = +layer.data[x + y * width] - 1;
					importRender[x][y] = 'tile' + (+layer.data[x + y * width] - 1);
				}
			}
			for (x = 0; x < tileDefinition.components.length; x++){
				if(tileDefinition.components[x].spritesheet == 'import'){
					tileDefinition.components[x].spritesheet = {
						images: images,
						frames: {
							width:  tileWidth,
							height: tileHeight
						},
						animations: importAnimation
					};
				}
				if(tileDefinition.components[x].collisionMap == 'import'){
					tileDefinition.components[x].collisionMap = importCollision;
				}
				if(tileDefinition.components[x].imageMap == 'import'){
					tileDefinition.components[x].imageMap = importRender;
				}
			}
			this.owner.addEntity(new platformer.classes.entity(tileDefinition, {properties:{}}));
		} else if(layer.type == 'objectgroup'){
			for (obj = 0; obj < layer.objects.length; obj++){
				entity = layer.objects[obj];
				for (x = 0; x < tilesets.length; x++){
					if(tilesets[x].firstgid > entity.gid){
						break;
					} else {
						tileset = tilesets[x];
					}
				}
				
				// Check Tiled data to find this object's type
				entityType = '';
				if(entity.type !== ''){
					entityType = entity.type;
				} else if(tileset.tileproperties[entity.gid - tileset.firstgid]){
					if(tileset.tileproperties[entity.gid - tileset.firstgid].entity){
						entityType = tileset.tileproperties[entity.gid - tileset.firstgid].entity;
					} else if (tileset.tileproperties[entity.gid - tileset.firstgid].type){
						entityType = tileset.tileproperties[entity.gid - tileset.firstgid].type;
					}
				}
				
				if(entityType !== ''){
					//Copy properties from Tiled
					properties = {};
					for (x in entity.properties){
						properties[x] = entity.properties[x];
					}
					properties.width  = (entity.width  || tileWidth)  * this.unitsPerPixel;
					properties.height = (entity.height || tileHeight) * this.unitsPerPixel;
					properties.x = entity.x * this.unitsPerPixel + (properties.width / 2);
					properties.y = entity.y * this.unitsPerPixel;
					properties.scaleX = this.unitsPerPixel;
					properties.scaleY = this.unitsPerPixel;
					
					entity = this.owner.addEntity(new platformer.classes.entity(platformer.settings.entities[entityType], {properties:properties}));
					if(entity){
						if(entity.camera){
							followEntity = {entity: entity, mode: entity.camera}; //used by camera
						}
					}
				}
			}
		}
		this.owner.trigger('world-loaded', {
			width:  width  * tileWidth  * this.unitsPerPixel,
			height: height * tileHeight * this.unitsPerPixel,
			unitsPerPixel: this.unitsPerPixel,
			camera: followEntity
		});
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here can be left alone. 
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-render - ../src/js/layer/lc-render.js
 */
platformer.components['lc-render'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.tickMessages = ['render'];
		this.addListeners(['entity-added','render', 'camera-update']);
		
		this.canvas = document.createElement('canvas');
		this.owner.rootElement.appendChild(this.canvas);
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.width  = 320; //TODO: figure out where to specify this
		this.canvas.height = 240;
		this.stage = new createjs.Stage(this.canvas);
		
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:render')
			{
				this.entities.push(entity);
				entity.trigger('layer:render-load', {
					stage: this.stage,
					parentElement: this.owner.rootElement
					//TODO: send along scaling functions to convert world coordinates to window coordinates // somehow get these from camera?
				});
				break;
			}
		}
	};
	
	proto['render'] = function(deltaT){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:render', deltaT);
			
		}
		this.stage.update();
	};
	
	proto['camera-update'] = function(cameraInfo){
		this.canvas.width  = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		this.stage.setTransform(-cameraInfo.x, -cameraInfo.y, cameraInfo.scaleX, cameraInfo.scaleY);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.stage = undefined;
		this.owner.rootElement.removeChild(this.canvas);
		this.canvas = undefined;
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here can be left alone. 
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-logic - ../src/js/layer/lc-logic.js
 */
platformer.components['lc-logic'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['logic'];
		this.addListeners(['entity-added', 'logic']);  
		
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:logic')
			{
				this.entities.push(entity);
				break;
			}
		}
	};

	proto['logic'] = function(deltaT){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:logic', deltaT);
		}
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-camera - ../src/js/layer/lc-camera.js
 */
platformer.components['lc-camera'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// on resize should the view be stretched or should the world's initial aspect ratio be maintained?
		this.stretch = definition.stretch || false;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['camera'];
		this.addListeners(['resize', 'orientationchange', 'camera', 'load', 'world-loaded']);  
		
		//The dimensions of the camera in the window
		this.windowViewportTop = this.owner.rootElement.innerTop;
		this.windowViewportLeft = this.owner.rootElement.innerLeft;
		this.windowViewportWidth = this.owner.rootElement.offsetWidth;
		this.windowViewportHeight = this.owner.rootElement.offsetHeight;
		
		//The dimensions of the camera in the game world
		this.worldViewportWidth       = definition.width       || 0; 
		this.worldViewportHeight      = definition.height      || 0;
		this.worldViewportLeft        = definition.left        || 0;
		this.worldViewportTop         = definition.top         || 0;

		this.aspectRatio              = definition.aspectRatio || 0;
		if(this.worldViewportWidth && this.worldViewportHeight){
			this.aspectRatio = this.aspectRatio || (this.worldViewportHeight      / this.worldViewportWidth); 
		} else {
			this.aspectRatio = this.aspectRatio || (this.windowViewportHeight / this.windowViewportWidth);
			if (this.worldViewportWidth || this.worldViewportHeight){
				this.worldViewportWidth       = this.worldViewportWidth       || (this.worldViewportHeight      / this.aspectRatio); 
				this.worldViewportHeight      = this.worldViewportHeight      || (this.aspectRatio / this.worldViewportWidth); 
			} else {
				this.worldViewportWidth       = this.windowViewportWidth;
				this.worldViewportHeight      = this.aspectRatio * this.worldViewportWidth;
			}
		}
		
		// on resize should the game snap to certain sizes or should it be fluid?
		// 0 == fluid scaling
		// set the windowWidth multiple that triggers zooming in
		this.scaleWidth = definition.scaleWidth || 0;
		this.resize();
		
		// The dimensions of the entire world
		this.worldWidth  = 0; //definition.worldWidth;
		this.worldHeight = 0; //definition.worldHeight;
		
		this.following = undefined;
		this.state = 'static';//'roaming';
		
		//FOLLOW MODE VARIABLES
		
		//--Bounding
		this.boundingBoxLeft = 100;
		this.boundingBoxTop = 100;
		this.boundingBoxWidth = this.worldViewportWidth - (2 * this.boundingBoxLeft);
		this.boundingBoxHeight = this.worldViewportHeight - (2 * this.boundingBoxTop);
		
		
		this.direction = true;  
	};
	var proto = component.prototype; 

	proto['load'] = function(){
		
	};

	proto['world-loaded'] = function(values){
		this.worldWidth   = this.owner.worldWidth  = values.width;
		this.worldHeight  = this.owner.worldHeight = values.height;
		if(values.camera){
			this.follow(values.camera);
		}
	};
	
	proto['camera'] = function(deltaT){
		
		switch (this.state)
		{
		case 'following':
			this.followingFunction(this.following);
			break;
		case 'roaming':
			var speed = .3 * deltaT;
			if (this.direction)
			{
				this.move(this.worldViewportLeft + speed, this.worldViewportTop);
				if (this.worldWidth && (this.worldViewportLeft == this.worldWidth - this.worldViewportWidth)) {
					this.direction = !this.direction;
				}
			} else {
				this.move(this.worldViewportLeft - speed, this.worldViewportTop);
				if (this.worldWidth && (this.worldViewportLeft == 0)) {
					this.direction = !this.direction;
				}
			}
			break;
		case 'static':
		default:
			break;
		}
		this.owner.trigger('camera-update', {x: this.worldViewportLeft * this.windowPerWorldUnitWidth, y: this.worldViewportTop * this.windowPerWorldUnitHeight, scaleX: this.windowPerWorldUnitWidth, scaleY: this.windowPerWorldUnitHeight});
	};
	
	proto['resize'] = proto['orientationchange'] = function ()
	{
		//The dimensions of the camera in the window
		this.windowViewportTop = this.owner.rootElement.innerTop;
		this.windowViewportLeft = this.owner.rootElement.innerLeft;
		this.windowViewportWidth = this.owner.rootElement.offsetWidth;
		this.windowViewportHeight = this.owner.rootElement.offsetHeight;

		if(this.scaleWidth){
			this.worldViewportWidth = this.windowViewportWidth / Math.ceil(this.windowViewportWidth / this.scaleWidth);
		}
		
		if(!this.stretch || this.scaleWidth){
			this.worldViewportHeight = this.windowViewportHeight * this.worldViewportWidth / this.windowViewportWidth;
		}
		
		this.worldPerWindowUnitWidth  = this.worldViewportWidth / this.windowViewportWidth;
		this.worldPerWindowUnitHeight = this.worldViewportHeight / this.windowViewportHeight;
		this.windowPerWorldUnitWidth  = this.windowViewportWidth / this.worldViewportWidth;
		this.windowPerWorldUnitHeight = this.windowViewportHeight/ this.worldViewportHeight;
	};
	
	proto['follow'] = function (def)
	{
		switch (def.mode)
		{
		case 'locked':
			this.state = 'following';
			this.following = def.entity;
			this.followingFunction = this.lockedFollow;
			break;
		case 'bounding':
			this.state = 'following';
			this.following = def.entity;
			this.setBoundingArea(def.top, def.left, def.width, def.height);
			this.followingFunction = this.boundingFollow;
			break;
		case 'custom':
			this.state = 'following';
			this.following = def.entity;
			this.followingFunction = def.followingFunction;
			break;
		case 'static':
		default:
			this.state = 'static';
			this.following = undefined;
			this.followingFunction = undefined;
			break;
		}
		
	};
	
	proto.move = function (newleft, newtop)
	{
		if (this.worldWidth < this.worldViewportWidth){
			this.worldViewportLeft = (this.worldWidth - this.worldViewportWidth) / 2;
		} else if (this.worldWidth && (newleft + this.worldViewportWidth > this.worldWidth)) {
			this.worldViewportLeft = this.worldWidth - this.worldViewportWidth;
		} else if (this.worldWidth && (newleft < 0)) {
			this.worldViewportLeft = 0; 
		} else {
			this.worldViewportLeft = newleft;
		}
		
		if (this.worldHeight < this.worldViewportHeight){
			this.worldViewportTop = (this.worldHeight - this.worldViewportHeight) / 2;
		} else if (this.worldHeight && (newtop + this.worldViewportHeight > this.worldHeight)) {
			this.worldViewportTop = this.worldHeight - this.worldViewportHeight;
		} else if (this.worldHeight && (newtop < 0)) {
			this.worldViewportTop = 0; 
		} else {
			this.worldViewportTop = newtop;
		}
		
	};
	
	proto.lockedFollow = function (entity)
	{
		this.move(entity.x - (this.worldViewportWidth / 2), entity.y - (this.worldViewportHeight / 2));
	};
	
	proto.setBoundingArea = function (top, left, width, height)
	{
		this.boundingBoxTop = top || 100;
		this.boundingBoxLeft = left || 100;
		this.boundingBoxWidth = width || this.worldViewportWidth - (2 * this.boundingBoxLeft);
		this.boundingBoxHeight = height || this.worldViewportHeight - (2 * this.boundingBoxTop);
	};
	
	proto.boundingFollow = function (entity)
	{
		var newLeft = 0;
		var newTop = 0;
		
		if (entity.x > this.x + this.boundingBoxLeft + this.BoundingBoxWidth) 
		{
			newLeft = entity.x -(this.boundingBoxLeft + this.BoundingBoxWidth);
		} else if (entity.x < this.x + this.boundingBoxLeft) {
			newLeft = entity.x - this.boundingBoxLeft;
		}
		
		if (entity.y > this.y + this.boundingBoxTop + this.BoundingBoxHeight) 
		{
			newTop = entity.y - this.boundingBoxTop + this.BoundingBoxHeight;
		} else if (entity.y < this.y + this.boundingBoxTop) {
			newTop = entity.y - this.boundingBoxTop;
		}
		
		this.move(newLeft, newTop);
	};
	
	/*
	proto.transition = function (coords, type, def)
	{
		this.state = 'transitioning';
		switch (type)
		{
		case 'linear':
			if (def.entity)
			{
				this.transitionEntity = def.entity;
			} else {
				this.transitionX = def.x;
				this.transitionY = def.y;
			}
			this.transitionFunction = this.linearTransition;
			break;
		case 'custom':
			this.transitionFunction = def.transitionFunction;
			break;
		case 'instant':
		default:
			this.move(coords.x - (this.worldViewportWidth / 2), coords.y - (this.worldViewportHeight / 2));
			break;
		
		
		}
		
	};
	
	proto.linearTransition = function ()
	{
		
		
	};
	*/
	
	proto.windowToWorld = function (sCoords)
	{
		var wCoords = [];
		wCoords[0] = Math.round((sCoords[0] - this.windowViewportLeft) * this.worldPerWindowUnitWidth);
		wCoords[1] = Math.round((sCoords[1] - this.windowViewportTop)  * this.worldPerWindowUnitHeight);
		return wCoords; 
	};
	
	proto.worldToWindow = function (wCoords)
	{
		var sCoords = [];
		sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.windowViewportLeft);
		sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.windowViewportTop);
		return sCoords;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-basic-collision - ../src/js/layer/lc-basic-collision.js
 */
platformer.components['lc-basic-collision'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['collision'];
		this.addListeners(['load','entity-added','collision']);  
		//this.toResolve = [];
		
		this.entities = [];
		this.solidEntities = [];
		this.terrain = undefined;
		this.collisionMatrix = {};
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this;
		var messageIds = entity.getMessageIds(); 
		
		if (entity.type == 'tile-layer')
		{
			this.terrain = entity;
		} else {
			for (var x = 0; x < messageIds.length; x++){
				if (messageIds[x] == 'layer:resolve-collision'){
					this.entities.push(entity);
					if(!this.collisionMatrix[entity.type]){
						this.collisionMatrix[entity.type] = {};
						for (var x = 0; x < entity.collidesWith.length; x++){
							this.collisionMatrix[entity.type][entity.collidesWith[x]] = true;
						}
					}
					break;
				}
			}
		}
	};
	
	proto['load'] = function(){
		
	};
	
	proto['collision'] = function(deltaT){
		var toResolve = [];
		
		this.prepareCollision();
		
		//toResolve = this.checkSolidCollision();
		//this.resolveSolidCollision(toResolve); 
		this.checkStupidCollision();
		
		toResolve = this.checkCollision();
		this.resolveCollision(toResolve);
	};
	
	proto.prepareCollision = function ()
	{
		for(var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:prep-collision');
		}
	};
	
	/*
	 * Collision Matrix is set up so that [x,y] is a check to see if X cares about Y
	 */
	
	proto.checkStupidCollision = function ()
	{
		//TODO: Is this just for Solid collision? What happens with moveable solid collision????????????
		for(var x = 0; x < this.entities.length - 1; x++)
		{
			var ent = this.entities[x];
			
			var currentAABB = ent.shape.getAABB();
			var prevPos = ent.shape.getPrevLocation();
			var previousAABB = (currentAABB.getCopy()).move(prevPos[0], prevPos[1]);
			
			var sweepTop = Math.min(currentAABB.top, previousAABB.top);
			var sweepBottom = Math.max(currentAABB.bottom, previousAABB.bottom);
			var sweepHeight = sweepBottom - sweepTop;
			var sweepLeft = Math.min(currentAABB.left, previousAABB.left);
			var sweepRight = Math.max(currentAABB.right, previousAABB.right);
			var sweepWidth = sweepRight - sweepLeft;
			var sweepX = sweepLeft + (sweepWidth / 2);
			var sweepY = sweepTop + (sweepHeight / 2); 
			var sweepAABB = new platformer.classes.aABB(sweepX, sweepY, sweepWidth, sweepHeight);
			
			var potentialTiles = [];
			var potentialsEntities = [];
			if (this.collisionMatrix[ent.type]['solid'])
			{
				potentialTiles = this.terrain.getTiles(sweepAABB);
			}
			
			for (var y = x + 1; y < this.entities.length; y++)
			{
				//TODO: Do we need a list of solid objects???? What are we doing here checking the collision Matrix?????? 
				if(this.collisionMatrix[ent.type][this.entities[y].collisionType] && this.AABBCollision(sweepAABB, this.entities[y].shape.getAABB()))
				{
					potentialsEntities.push(this.entities[y]);
				}
			}
			
			var xDir = (ent.shape.getPrevX() < ent.shape.getX()) ? 1 : -1;
			var xPos = ent.shape.getPrevX();
			var xGoal = ent.shape.getX();
			var yDir = (ent.shape.getPrevY() < ent.shape.getY()) ? 1 : -1;
			var yPos = ent.shape.getPrevY();
			var yGoal = ent.shape.getY();
			
			var finalY = undefined;
			var finalX = undefined; 
			
			
			//Move in the x direction
			while (xPos != xGoal && (potentialTiles.length || potentialsEntities.length))
			{
				//alert('xGoal: ' + xGoal + ' xPos: ' + xPos + ' xDir: ' + xDir);
				if (Math.abs(xGoal - xPos) <= 1)
				{
					xPos = xGoal;
				} else {
					xPos += xDir;
				}
				previousAABB.move(xPos, yPos);
				
				var tileAABB = undefined;
				for (var t = 0; t < potentialTiles.length; t++)
				{
					tileAABB = potentialTiles[t].shape.getAABB();
					if(this.AABBCollision(previousAABB, tileAABB))
					{
						//var atX = tileAAB.left + previousAABB.halfWidth;
						var atX = undefined;
						if (xDir > 0)
						{
							atX = tileAABB.left - previousAABB.halfWidth;
						} else {
							atX = tileAABB.right + previousAABB.halfWidth;
						}
						
						
						if (typeof finalX === 'undefined') {
							finalX = atX;
						} else if (xDir > 0) {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} else {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} 
					}
				}
				
				var entityAABB = undefined;
				for (var u = 0; u < potentialsEntities.length; u++)
				{
					entityAABB = potentialsEntities[u].shape.getAABB();
					if(this.AABBCollision(previousAABB, entityAABB))
					{
						var atX = undefined;
						if (xDir > 0)
						{
							atX = entityAABB.left - previousAABB.halfWidth;
						} else {
							atX = entityAABB.right + previousAABB.halfWidth;
						}
						
						
						if (typeof finalX === 'undefined') {
							finalX = atX;
						} else if (xDir > 0) {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} else {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} 
					}
				}
				
				if(typeof finalX !== 'undefined')
				{
					break;
				}
			}
			
			if(typeof finalX === 'undefined')
			{
				
				finalX = xGoal;
			}
			
			//Move in the y direction
			while (yPos != yGoal && (potentialTiles.length || potentialsEntities.length))
			{
				if (Math.abs(yGoal - yPos) < 1)
				{
					yPos = yGoal;
				} else {
					yPos += yDir;
				}
				previousAABB.move(finalX, yPos);
				
				var tileAABB = undefined;
				for (var t = 0; t < potentialTiles.length; t++)
				{
					tileAABB = potentialTiles[t].shape.getAABB();
					if(this.AABBCollision(previousAABB, tileAABB))
					{
						var atY = undefined;
						if (yDir > 0)
						{
							atY = tileAABB.top - previousAABB.halfHeight; 
						} else {
							atY = tileAABB.bottom + previousAABB.halfHeight;
						}
						 
						
						if (typeof finalY === 'undefined') {
							finalY = atY;
						} else if (yDir > 0) {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} else {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} 
					}
				}
				
				var entityAABB = undefined;
				for (var u = 0; u < potentialsEntities.length; u++)
				{
					entityAABB = potentialsEntities[u].shape.getAABB();
					if(this.AABBCollision(previousAABB, entityAABB))
					{
						//var atY = entityAABB.left + previousAABB.halfWidth;
						var atY = undefined;
						if (yDir > 0)
						{
							atY = entityAABB.top - previousAABB.halfHeight; 
						} else {
							atY = entityAABB.bottom + previousAABB.halfHeight;
						}						
						
						if (typeof finalY === 'undefined') {
							finalY = atY;
						} else if (yDir > 0) {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} else {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} 
					}
				}
				
				if(typeof finalY !== 'undefined')
				{
					break;
				}
			}
			
			
			if(typeof finalY === 'undefined')
			{
				finalY = yGoal;
			}
			
			//TODO: Figure out how this is actually going to work. 
			
			//alert('Relocate: x: ' + finalX);			
			ent.trigger('layer:relocate', [finalX, finalY]);
		}
	};
	
	
	proto.checkSolidCollision = function ()
	{
		var toResolve = [];
		for(var x = 0; x < this.entities.length - 1; x++) //TODO: There may be an error in the for loops for this function.
		{
			var tileCollisions = [];
			var otherCollisions = [];
			if (this.collisionMatrix[this.entities[x].type]['solid'])
			{
				if (this.terrain)
				{
					tileCollisions = this.terrain.getTiles(this.entities[x].getAABB());
					/*
					for (var y = 0; y < tileShapes.length; y++)
					{
						tileCollisions.push({
												tiles:  tiles[y]
											});
					}	
					*/
				}
				
				for (var y = x + 1; y < this.solidEntities.length; y++)
				{
					if(this.AABBCollision(this.entities[x].shape.getAABB(), this.entities[y].shape.getAABB()))
					{
						if (this.preciseCollision(this.entities[x].shape, this.solidEntities[y].shape))
						{
							//TODO: WHY IS THE MESSAGE CONSTRUCTED AS SUCH?
							otherCollisions.push({
												entity: this.solidEntities[y],
												shape:  this.solidEntities[y].shape
											});
						}	
					}
				}
			}
			
			toResolve.push({
				entity:  this.entities[x],
				tileCollisions: tileCollisions,
				otherCollisions: otherCollisions
			});
			
		}
		return toResolve;
	};
	
	proto.checkCollision = function ()
	{
		var toResolve = [];
		for(var x = 0; x < this.entities.length - 1; x++)
		{
			for (var y = x + 1; y < this.entities.length; y++)
			{
				if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType] || this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
				{
					if(this.AABBCollision(this.entities[x].shape.getAABB(), this.entities[y].shape.getAABB()))
					{
						if (this.preciseCollision(this.entities[x].shape, this.entities[y].shape))
						{
							if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType])
							{
								//TODO: WHY IS THE MESSAGE CONSTRUCTED AS SUCH?
								
								toResolve.push({
									entity:  this.entities[x],
									message:{
										entity: this.entities[y],
										type:   this.entities[y].collisionType,
										shape:  this.entities[y].shape
									}
								});
							}
							
							if (this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
							{
								//TODO: WHY IS THE MESSAGE CONSTRUCTED AS SUCH?
								
								toResolve.push({
									entity:  this.entities[y],
									message:{
										entity: this.entities[x],
										type:   this.entities[x].collisionType,
										shape:  this.entities[x].shape
									}
								});
							}
						}
					}
				}
			}
		}
		return toResolve;
	};
	
	proto.AABBCollision = function (boxX, boxY)
	{
		
		if(boxX.left   >=  boxY.right)  return false;
		if(boxX.right  <=  boxY.left)   return false;
		if(boxX.top    >=  boxY.bottom) return false;
		if(boxX.bottom <=  boxY.top)    return false;
		return true;
		
		/*
		var i   = 0;
		var j   = 0;
		var shapeA  = undefined;
		var shapeB  = undefined;
		var shapesA = entityA.getShapes?entityA.getShapes(entityB.getAABB()):[entityA.shape];
		var shapesB = entityB.getShapes?entityB.getShapes(entityA.getAABB()):[entityB.shape];
		
		for (i = 0; i < shapesA.length; i++){
			shapeA = shapesA[i].getAABB();
			for (j = 0; j < shapesB.length; j++){
				shapeB = shapesB[j].getAABB();
				if(shapeA.left   >=  shapeB.right)  break;
				if(shapeA.right  <=  shapeB.left)   break;
				if(shapeA.top    >=  shapeB.bottom) break;
				if(shapeA.bottom <=  shapeB.top)    break;
				return {
					shapeA: shapesA[i],
					shapeB: shapesB[j]
				};
			}
		}
		
		return false;
		*/	
	};
	
	proto.preciseCollision = function (shapeX, shapeY)
	{
		return true;
	};
	
	
	proto.resolveSolidCollision = function (toResolve)
	{
		for (var x = 0; x < toResolve.length; x++)
		{
			toResolve[x].entity.trigger('layer:resolve-solid-collision', {terrain: this.terrain, tileCollisions: toResolve[x].tileCollisions, otherCollisions: toResolve[x].otherCollisions});
		}
	};
	
	proto.resolveCollision = function (toResolve)
	{
		for (var x = 0; x < toResolve.length; x++)
		{
			toResolve[x].entity.trigger('layer:resolve-collision', toResolve[x].message);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   audio - ../src/js/entity/audio.js
 */
platformer.components['audio'] = (function(){
	var defaultSettings = {
		interrupt: createjs.SoundJS.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
		delay:     0,
		offset:    0,
		loop:      0,
		volume:    1,
		pan:       0,
		length:    0
	},
	playSound = function(soundDefinition){
		var sound = '',
		attributes = undefined;
		if(typeof soundDefinition === 'string'){
			sound      = soundDefinition;
		} else {
			attributes = soundDefinition;
			sound      = soundDefinition.sound;
		}
		return function(value){
			var audio = undefined,
			length    = 0;
			value = value || attributes;
			if(value){
				var interrupt = value.interrupt || attributes.interrupt || defaultSettings.interrupt,
				delay         = value.delay     || attributes.delay  || defaultSettings.delay,
				offset        = value.offset    || attributes.offset || defaultSettings.offset,
				loop          = value.loop      || attributes.loop   || defaultSettings.loop,
				volume        = (typeof value.volume !== 'undefined')? value.volume: ((typeof attributes.volume !== 'undefined')? attributes.volume: defaultSettings.volume),
				pan           = value.pan       || attributes.pan    || defaultSettings.pan;
				length        = value.length    || attributes.length || defaultSettings.length;
				
				audio = createjs.SoundJS.play(sound, interrupt, delay, offset, loop, volume, pan);
			} else {
				audio = createjs.SoundJS.play(sound, defaultSettings.interrupt, defaultSettings.delay, defaultSettings.offset, defaultSettings.loop, defaultSettings.volume, defaultSettings.pan);
			}

			if(audio.playState === 'playFailed'){
				if(this.owner.debug){
					console.warn('Unable to play "' + sound + '".', audio);
				}
			} else {
				if(length){ // Length is specified so we need to turn off the sound at some point.
					this.timedAudioClips.push({length: length, progress: 0, audio: audio});
				}
			}
		};
	},
	component = function(owner, definition){
		this.owner = owner;
		this.timedAudioClips = [],
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListener('layer:render');

		if(definition.audioMap){
			for (var key in definition.audioMap){
				this.addListener(key);
				this[key] = playSound(definition.audioMap[key]);
			}
		}
	};
	var proto = component.prototype;
	
	proto['layer:render'] = function(deltaT){
		var i     = 0,
		audioClip = undefined;
		newArray  = undefined;
		if(this.timedAudioClips.length){
			newArray = [];
			for (i in this.timedAudioClips){
				audioClip = this.timedAudioClips[i];
				audioClip.progress += deltaT;
				if(audioClip.progress >= audioClip.length){
					audioClip.audio.stop();
				} else {
					newArray.push(audioClip);
				}
			}
			this.timedAudioClips = newArray;
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   broadcast-events - ../src/js/entity/broadcast-events.js
 */
platformer.components['broadcast-events'] = (function(){
	var broadcast = function(event){
		return function(value){
			platformer.game.currentScene.trigger(event, value);
		};
	}, 
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for and then broadcasts to all layers.
		// Make sure it does not receive and broadcast matching messages or an infinite loop will result.
		this.listeners = [];
		if(definition.events){
			for(var event in definition.events){
				this[event] = broadcast(definition.events[event]);
				this.addListener(event);
			}
		}
		
	},
	proto = component.prototype;
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   entity-container - ../src/js/entity/entity-container.js
 */
platformer.components['entity-container'] = (function(){
	var component = function(owner, definition){
		var self = this,
		x        = 0;

		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.entities = [];
		this.definedEntities = definition.entities; //saving for load message
		
		this.owner.entities     = self.entities;
		this.owner.addEntity    = function(entity){return self.addEntity(entity);};
		this.owner.removeEntity = function(){return self.removeEntity();};
		
		this.addListeners(['load', 'add-entity', 'remove-entity']);
	};
	var proto = component.prototype;
	
	proto['load'] = function(){
		// putting this here so all other components will have been loaded and can listen for "entity-added" calls.
		var x    = 0,
		entities = this.definedEntities;
		
		this.definedEntities = false;
		
		if(entities){
			for (x = 0; x < entities.length; x++)
			{
				 this.addEntity(new platformer.classes.entity(platformer.settings.entities[entities[x].type], entities[x]));
			}
		}
	};
	
	proto.addEntity = proto['add-entity'] = function (entity) {
		this.entities.push(entity);
		this.owner.trigger('entity-added', entity);
		return entity;
	};
	
	proto.removeEntity = proto['remove-entity'] = function (entity) {
		for (var x = 0; x < this.entities.length; x++){
		    if(this.entities[x] === entity){
		    	this.entities.splice(x, 1);
		    	entity.destroy();
			    return entity;
		    }
	    }
	    return false;
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		for (var i in this.entities){
			entity.destroy();
		}
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   entity-controller - ../src/js/entity/entity-controller.js
 */
platformer.components['entity-controller'] = (function(){
	var state = function(){
		this.current = false;
		this.last    = false;
		this.state   = false;
	},
	mouseMap = ['left-button', 'middle-button', 'right-button'],
	createUpHandler = function(state){
		return function(value){
			state.state = false;
		};
	},
	createDownHandler = function(state){
		return function(value){
			state.current = true;
			state.state   = true;
			if(value && (typeof (value.over) !== 'undefined')) state.over = value.over;
		};
	},
	component = function(owner, definition){
		var key     = '',
		actionState = undefined;
		this.owner  = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load', 'controller', 'controller:load', 'controller:tick', 'mousedown', 'mouseup', 'mousemove']);
		
		if(definition && definition.controlMap){
			this.owner.controlMap = definition.controlMap;
			this.actions  = {};
			for(key in definition.controlMap){
				actionState = this.actions[definition.controlMap[key]]; // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
				if(!actionState){                                // Otherwise create a new state storage object
					actionState = this.actions[definition.controlMap[key]] = new state();
				}
				this[key + ':up']   = createUpHandler(actionState);
				this[key + ':down'] = createDownHandler(actionState);
				this.addListener(key + ':up');
				this.addListener(key + ':down');
			}
		}
	},
	stateProto = state.prototype,
	proto      = component.prototype;
	
	stateProto.update = function(){
		this.last    = this.current;
		this.current = this.state;
	};

	stateProto.isPressed = function(){
		return this.current;
	};
	
	stateProto.isTriggered = function(){
		return this.current && !this.last;
	};

	stateProto.isReleased = function(){
		return !this.current && this.last;
	};
	
	proto['load'] = function(){
	};
	
	proto['mouse:move'] = function(value){
		if(this.actions['mouse:left-button'] && (this.actions['mouse:left-button'].over !== value.over))     this.actions['mouse:left-button'].over = value.over;
		if(this.actions['mouse:middle-button'] && (this.actions['mouse:middle-button'].over !== value.over)) this.actions['mouse:middle-button'].over = value.over;
		if(this.actions['mouse:right-button'] && (this.actions['mouse:right-button'].over !== value.over))   this.actions['mouse:right-button'].over = value.over;
	};
	
//	proto['touch:move'] = function(value){
//		if(this.actions['touch'] && (this.actions['touch'].over !== value.over))  this.actions['touch'].over = value.over;
//	};

	proto['controller'] = function(){
		
	};

	proto['controller:load'] = function(){

	};

	proto['controller:tick'] = function(resp){
		var state = undefined,
		action    = '';
		
		if(this.actions){
			for (action in this.actions){
				state = this.actions[action];
				if(state.current || state.last){
					this.owner.trigger(action, {
						pressed:   state.current,
						released: !state.current && state.last,
						triggered: state.current && !state.last,
						over:      state.over
					});
				}
				state.update();
			}
		}
	};
	
	// The following translate CreateJS mouse and touch events into messages that this controller can handle in a systematic way
	
	proto['mousedown'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':down', value.event);
	}; 
		
	proto['mouseup'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':up', value.event);
	};
	
	proto['mousemove'] = function(value){
		this.owner.trigger('mouse:move', value);
	};
/*
	proto['mouseover'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button] + ':over', value.event);
	};

	proto['mouseout'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button] + ':out', value.event);
	};
*/
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-debug - ../src/js/entity/render-debug.js
 */
platformer.components['render-debug'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		//this.controllerEvents = undefined;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
			this.touch = definition.acceptInput.touch || false;
		} else {
			this.hover = false;
			this.click = false;
			this.touch = false;
		}
		
		this.regX = definition.regX || 0;
		this.regY = definition.regY || 0;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']); ///TODO: removing input event for now because it's confusing this way, 'controller:input-handler']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		this.shape.x = this.owner.x	- this.regX;
		this.shape.y = this.owner.y	- this.regY;
		this.txt.x = this.owner.x	- this.regX + (this.owner.width / 2);
		this.txt.y = this.owner.y 	- this.regY + (this.owner.height / 2);
		
	};

	proto['layer:render-load'] = function(resp){
		var self = this,
		x        = this.owner.x      = this.owner.x || 0,
		y        = this.owner.y      = this.owner.y || 0,
		width    = this.owner.width  = this.owner.width  || 300,
		height   = this.owner.height = this.owner.height || 100,
		comps    = platformer.settings.entities[this.owner.type]?(platformer.settings.entities[this.owner.type].components || []):[],
		components = [],
		over     = false;
		
		for (var i in comps) components[i] = comps[i].type;
		
		this.stage = resp.stage;
		
		this.txt   = new createjs.Text(this.owner.type + '\n(' + components.join(', ') + ')');
		this.txt.x = x + width / 2;
		this.txt.y = y + height / 2;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		
/*		this.mookieImg   = new createjs.Bitmap('i/mookie.png');
		this.mookieImg.x = this.owner.x;
		this.mookieImg.y = this.owner.y;*/
		
		this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,0,0,0.1)").beginStroke("#880").rect(0, 0, width, height));

		this.stage.addChild(this.shape);
		this.stage.addChild(this.txt);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.touch && createjs.Touch.isSupported()){
			createjs.Touch.enable(this.stage);
		}

		this.shape.onPress     = function(event) {
			if(this.click || this.touch){
				self.owner.trigger('mousedown', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
				event.onMouseMove = function(event){
					self.owner.trigger('mousemove', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
			}
			if(event.nativeEvent.button == 2){
				console.log('This Entity:', self.owner);
			}
		};
		if(this.click || this.touch){
			this.shape.onMouseOut  = function(){over = false;};
			this.shape.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.shape.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.shape.onMouseOver = function(event){
				over = true;
				self.owner.trigger('mouseover', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-tile - ../src/js/entity/render-tile.js
 */
platformer.components['render-tile'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.spriteSheet = new createjs.SpriteSheet(definition.spritesheet);
		
		this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		this.shape.x = this.owner.x;
		this.shape.y = this.owner.y;
	};

	proto['layer:render-load'] = function(resp){
		this.stage = resp.stage;
		
		this.shape = new createjs.BitmapAnimation(this.spriteSheet);
		this.stage.addChild(this.shape);
		this.shape.gotoAndPlay(this.state);
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-tiles - ../src/js/entity/render-tiles.js
 */
platformer.components['render-tiles'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.controllerEvents = undefined;
		this.spriteSheet = new createjs.SpriteSheet(definition.spritesheet);
		this.imageMap    = definition.imageMap   || [];
		this.tileWidth   = definition.tileWidth  || this.owner.tileWidth  || 10;
		this.tileHeight  = definition.tileHeight || this.owner.tileHeight || 10;
		this.scaleX      = definition.scaleX || this.owner.scaleX || 1;
		this.scaleY      = definition.scaleY || this.owner.scaleY || 1;
		
		this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
	};

	proto['layer:render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage;
		tile  = undefined;
		
		
		for(x = 0; x < this.imageMap.length; x++){
			for (y = 0; y < this.imageMap[x].length; y++){
				//TODO: Test speed of this - would non-animations perform better?
				tile = new createjs.BitmapAnimation(this.spriteSheet);
				tile.scaleX = this.scaleX;
				tile.scaleY = this.scaleY;
				tile.x = x * this.tileWidth;
				tile.y = y * this.tileHeight;
				stage.addChild(tile);
				tile.gotoAndPlay(this.imageMap[x][y]);
			}
		}
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-button - ../src/js/entity/render-button.js
 */
platformer.components['render-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render-load', 'layer:render', 'controller:input']);
		this.stage = undefined;
		this.upBitmap = new createjs.Bitmap(platformer.assets[definition.upImg]);
		this.downBitmap = new createjs.Bitmap(platformer.assets[definition.downImg]);
		//this.shape = new createjs.Shape();;
	};
	var proto = component.prototype;
	
	proto['controller:input-handler'] = function (settings){
		
	};
	
	proto['layer:render-load'] = function (obj) {
		this.stage = obj.stage;
		this.stage.addChild(this.upBitmap);
		this.stage.addChild(this.downBitmap);
		
		this.upBitmap.x = this.owner.x;
		this.downBitmap.x = this.owner.x;
		this.upBitmap.y = this.owner.y;
		this.downBitmap.y = this.owner.y;
		
		
		/*
		var g = this.shape.graphics;
		if(this.owner.state)
		{
			g.beginFill('#333');
		} else {
			g.beginFill('#888');
		}
		g.rect(this.owner.x, this.owner.y, this.owner.width, this.owner.height);
		g.endFill();
		
		this.stage.addChild(this.shape);
		*/
	};
	
	proto['layer:render'] = function () {
		/*
		this.shape.x = this.owner.x;
		*/
		this.upBitmap.x = this.owner.x;
		this.downBitmap.x = this.owner.x;
		if(this.owner.state)
		{
			this.downBitmap.alpha = 0;
		} else {
			this.downBitmap.alpha = 1;
		}
		
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.stage.removeChild(this.shape);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-animation - ../src/js/entity/render-animation.js
 */
platformer.components['render-animation'] = (function(){
	var component = function(owner, definition){
		var spriteSheet = {
			images: definition.spriteSheet.images.slice(),
			frames: definition.spriteSheet.frames,
			animations: definition.spriteSheet.animations
		};
		this.owner = owner;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
			this.touch = definition.acceptInput.touch || false;
		} else {
			this.hover = false;
			this.click = false;
			this.touch = false;
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render-load','layer:render', 'logical-state']);
		this.stage = undefined;
		for (var x = 0; x < spriteSheet.images.length; x++)
		{
			spriteSheet.images[x] = platformer.assets[spriteSheet.images[x]];
		}
		spriteSheet = new createjs.SpriteSheet(spriteSheet);
		this.anim = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = definition.state || this.owner.state || '';
		this.anim.scaleX = this.scaleX || this.owner.scaleX || 1;
		this.anim.scaleY = this.scaleY || this.owner.scaleY || 1;
		if(this.currentAnimation){
			this.anim.gotoAndPlay(this.currentAnimation);
		}
	};
	var proto = component.prototype;
	
	proto['layer:render-load'] = function(obj){
		var self = this,
		over     = false;
		
		this.stage = obj.stage;
		this.stage.addChild(this.anim);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.click || this.touch){
			if(this.touch && createjs.Touch.isSupported()){
				createjs.Touch.enable(this.stage);
			}

			this.anim.onPress     = function(event) {
				self.owner.trigger('mousedown', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
				event.onMouseMove = function(event){
					self.owner.trigger('mousemove', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
			};
			this.anim.onMouseOut  = function(){over = false;};
			this.anim.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.anim.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.anim.onMouseOver = function(event){
				over = true;
				self.owner.trigger('mouseover', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
		}
	};
	
	proto['layer:render'] = function(obj){
		this.anim.x = this.owner.x;
		this.anim.y = this.owner.y;
	};
	
	proto['logical-state'] = function(obj){
		if (this.currentAnimation != obj.state)
		{
			this.currentAnimation = obj.state;
			this.anim.gotoAndPlay(obj.state);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   logic-directional-movement - ../src/js/entity/logic-directional-movement.js
 */
platformer.components['logic-directional-movement'] = (function(){
	var processDirection = function(direction){
		return function (state){
			if(state){
				if(state.pressed)
				{
					this[direction] = true;
				} else {
					this[direction] = false;
				}
			} else {
				this[direction] = true;
			}
		};
	},
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic',
   		    'go-down',       'go-south',
   		    'go-down-left',  'go-southwest',
		    'go-left',       'go-west',
		    'go-up-left',    'go-northwest',
		    'go-up',         'go-north',
		    'go-up-right',   'go-northeast',
		    'go-right',      'go-east',
		    'go-down-right', 'go-southeast',
		    'stop'
		]);
		
		this.owner.state = 'standing';
		this.owner.heading = 'right';
		this.speed = definition.speed || .3;
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.upLeft = false;
		this.upRight = false;
		this.downLeft = false;
		this.downRight = false;
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(deltaT){
		var vX    = 0,
		vY        = 0,
		upLeft    = this.upLeft    || (this.up   && this.left),
		downLeft  = this.downLeft  || (this.down && this.left),
		downRight = this.downRight || (this.down && this.right),
		upRight   = this.upRight   || (this.up   && this.right);
		
		if (upLeft) {
			vX = -this.speed / 1.414;
			vY = -this.speed / 1.414;
			this.owner.heading = 'up-left';
			this.owner.state = 'walking';
		} else if (upRight) {
			vY = -this.speed / 1.414;
			vX =  this.speed / 1.414;
			this.owner.heading = 'up-right';
			this.owner.state = 'walking';
		} else if (downLeft) {
			vY =  this.speed / 1.414;
			vX = -this.speed / 1.414;
			this.owner.heading = 'down-left';
			this.owner.state = 'walking';
		} else if (downRight) {
			vY =  this.speed / 1.414;
			vX =  this.speed / 1.414;
			this.owner.heading = 'down-right';
			this.owner.state = 'walking';
		} else if(this.left)	{
			vX = -this.speed;
			this.owner.heading = 'left';
			this.owner.state = 'walking';
		} else if (this.right) {
			vX =  this.speed;
			this.owner.heading = 'right';
			this.owner.state = 'walking';
		} else if (this.up) {
			vY = -this.speed;
			this.owner.heading = 'up';
			this.owner.state = 'walking';
		} else if (this.down) {
			vY =  this.speed;
			this.owner.heading = 'down';
			this.owner.state = 'walking';
		} else {
			this.owner.state = 'standing';
		}
		
		this.owner.x += (vX * deltaT);
		this.owner.y += (vY * deltaT);
		
		this.owner.trigger('logical-state', {state: this.owner.state + '-' + this.owner.heading});
		this.owner.trigger(this.owner.state);
	};
	
	proto['go-down']       = proto['go-south']     = processDirection('down');
	proto['go-down-left']  = proto['go-southwest'] = processDirection('downLeft');
	proto['go-left']       = proto['go-west']      = processDirection('left');
	proto['go-up-left']    = proto['go-northwest'] = processDirection('upLeft');
	proto['go-up']         = proto['go-north']     = processDirection('up');
	proto['go-up-right']   = proto['go-northeast'] = processDirection('upRight');
	proto['go-right']      = proto['go-east']      = processDirection('right');
	proto['go-down-right'] = proto['go-southeast'] = processDirection('downRight');

	proto['stop'] = function(state){
		if(!state || state.pressed)
		{
			this.down = false;
			this.downLeft = false;
			this.left = false;
			this.upLeft = false;
			this.up = false;
			this.upRight = false;
			this.right = false;
			this.downRight = false;
		}
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   collision-hero - ../src/js/entity/collision-hero.js
 */
platformer.components['collision-hero'] = (function(){
	var component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load',
		                   'layer:prep-collision', 
		                   'layer:resolve-collision', 
		                   'layer:resolve-solid-collision', 
		                   'layer:relocate']);
		
		//this.owner.AABB = definition.AABB || [0, 0, 16, 16]; //offsetX, offsetY, width, height

		this.owner.shape = new platformer.classes.collisionShape([this.owner.x, this.owner.y],definition.shape.type, definition.shape.points, definition.shape.offset, definition.shape.radius); 
		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.collisionType = definition.collisionType || 'solid';
		this.owner.collidesWith = definition.collidesWith || [];
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		
	};
	
	proto['layer:prep-collision'] = function(){
		//alert('prep-collision: x: ' + this.owner.x + ' y: ' + this.owner.x);
		this.owner.shape.update(this.owner.x, this.owner.y);
		//var prevLocation = this.owner.shape.getPrevLocation();
		//this.pX = prevLocation[0];
		//this.pY = prevLocation[1];
	};
	
	proto['layer:relocate'] = function(positionXY){
		this.owner.x = positionXY[0] - this.owner.shape.getXOffset();
		//this.owner.shape.x = positionXY[0];
		this.owner.y = positionXY[1] - this.owner.shape.getYOffset();
		//this.owner.shape.y = positionXY[1];
		this.owner.shape.setXY(positionXY[0], positionXY[1]);
	};
	
	
	proto['layer:resolve-solid-collision'] = function(collisionInfo){
		var terrain = collisionInfo.terrain;
		var tileCollisions = collisionInfo.tileCollisions;
		var otherCollisions = collisionInfo.otherCollisions;
		
		var x = this.owner.shape.x;
		var y = this.owner.shape.y;
		var pX = this.owner.shape.prevX;
		var pY = this.owner.shape.prevY;
		
		var deltaX = x - pX; 
		var deltaY = y - pY;
		var m = deltaY / deltaX; 
		var b = y - x * m;
		
		var displaceX = undefined;
		var displaceY = undefined;
		
		for (var c = 0; c < tileCollisions.length; c++)
		{
			var tile = tileCollisions[c];
			var tileX = tile.shape.x;
			var tileY = tile.shape.y;
		
			var targetX = undefined; 
			var targetY = undefined; 
			var yAtTargetX = undefined;
			var xAtTargetY = undefined;
			var thisAABB = this.owner.shape.aABB;
			var tileAABB = tile.shape.aABB;
			
			var leftPlane = tileX - tileAABB.halfWidth - thisAABB.halfWidth;
			var rightPlane = tileX + tileAABB.halfWidth + thisAABB.halfWidth;
			var topPlane = tileY - tileAABB.halfHeight - thisAABB.halfHeight;
			var bottomPlane = tileY + tileAABB.halfHeight + thisAABB.halfHeight;
			
			
			
			if (m !== Infinity && m !== -Infinity)
			{
				if (pX <= leftPlane)
				{
					targetX = leftPlane;
				} else if (pX >= rightPlane) {
					targetX = rightPlane;
				}
			}
			
			if (pY <= topPlane)
			{
				targetY = topPlane;
			} else if (pY >= bottomPlane) {
				targetY = bottomPlane;
			}	
			
			
			if (typeof targetX !== 'undefined')
			{
				yAtTargetX = m * targetX + b;
			}
			
			if (typeof targetY !== 'undefined')
			{
				if (m === Infinity || m === -Infinity)
				{
					xAtTargetY = x;
				} else {
					xAtTargetY = (targetY - b) / m ;
				}
			}
			
			if (targetX && yAtTargetX >= topPlane && yAtTargetX <= bottomPlane)
			{
				
				if (deltaX > 0)
				{
					if (!terrain.isTile(tile.gridX - 1, tile.gridY))
					{
						var displacement = targetX - x;
						if (typeof displaceX === 'undefined' || displacement < displaceX)
						{
							displaceX = displacement;
						}
					}
					
				} else if (deltaX < 0) {
					if (!terrain.isTile(tile.gridX + 1, tile.gridY))
					{
						var displacement = targetX - x;
						if (typeof displaceX === 'undefined' || displacement > displaceX)
						{
							displaceX = displacement;
						}
					}
				}
				
				/*
				console.warn('Collide on Side');
				this.owner.x = targetX - this.owner.shape.getXOffset();
				this.owner.shape.x = targetX;
				this.owner.y = yAtTargetX - this.owner.shape.getYOffset();
				this.owner.shape.y = yAtTargetX;
				*/
			} else if (targetY && xAtTargetY >= leftPlane && xAtTargetY <= rightPlane){
				if (deltaY > 0)
				{
					if (!terrain.isTile(tile.gridX, tile.gridY - 1))
					{
						var displacement = targetY - y;
						if (typeof displaceY === 'undefined' || displacement < displaceY)
						{
							displaceY = displacement;
						}
					}
					
				} else if (deltaY < 0) {
					if (!terrain.isTile(tile.gridX, tile.gridY + 1))
					{
						var displacement = targetY - y;
						if (typeof displaceY === 'undefined' || displacement > displaceY)
						{
							displaceY = displacement;
						}
					}
				}
				
				/*
				console.warn('Collide on Top/Bottom');
				this.owner.x = xAtTargetY - this.owner.shape.getXOffset();
				this.owner.shape.x = xAtTargetY;
				this.owner.y = targetY - this.owner.shape.getYOffset();
				this.owner.shape.y = targetY;
				*/
			}
		}
		
		if (typeof displaceX !== 'undefined')
		{
			this.owner.x = x + displaceX - this.owner.shape.getXOffset();
			this.owner.shape.x = x + displaceX;
		}
		if (typeof displaceY !== 'undefined')
		{
			this.owner.y = y + displaceY - this.owner.shape.getYOffset();
			this.owner.shape.y = y + displaceY;	
		}
		
		//TODO: Handle the other solid collisions!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		
	};
	
	
	proto['layer:resolve-collision'] = function(other){
		var x = this.owner.shape.x;
		var y = this.owner.shape.y;
		var pX = this.owner.shape.prevX;
		var pY = this.owner.shape.prevY;
		
		var otherX = other.shape.x;
		var otherY = other.shape.y;
		
		switch (other.type)
		{
		/*
		case 'solid':
			var deltaX = x - pX; 
			var deltaY = y - pY;
			var m = deltaY / deltaX; 
			var b = y - x * m;
			var targetX = undefined; 
			var targetY = undefined; 
			var yAtTargetX = undefined;
			var xAtTargetY = undefined;
			var thisAABB = this.owner.shape.aABB;
			var otherAABB = other.shape.aABB;
			
			var leftPlane = otherX - otherAABB.halfWidth - thisAABB.halfWidth;
			var rightPlane = otherX + otherAABB.halfWidth + thisAABB.halfWidth;
			var topPlane = otherY - otherAABB.halfHeight - thisAABB.halfHeight;
			var bottomPlane = otherY + otherAABB.halfHeight + thisAABB.halfHeight;
			
			if (m !== Infinity && m !== -Infinity)
			{
				if (pX <= leftPlane)
				{
					targetX = leftPlane;
				} else if (pX >= rightPlane) {
					targetX = rightPlane;
				}
			}
			
			if (pY <= topPlane)
			{
				targetY = topPlane;
			} else if (pY >= bottomPlane) {
				targetY = bottomPlane;
			}	
			
			
			if (typeof targetX !== 'undefined')
			{
				yAtTargetX = m * targetX + b;
			}
			
			if (typeof targetY !== 'undefined')
			{
				if (m === Infinity || m === -Infinity)
				{
					xAtTargetY = x;
				} else {
					xAtTargetY = (targetY - b) / m ;
				}
			}
			
			if (targetX && yAtTargetX >= topPlane && yAtTargetX <= bottomPlane)
			{
				console.warn('Collide on Side');
				this.owner.x = targetX - this.owner.shape.getXOffset();
				this.owner.shape.x = targetX;
				this.owner.y = yAtTargetX - this.owner.shape.getYOffset();
				this.owner.shape.y = yAtTargetX;
			} else if (targetY && xAtTargetY >= leftPlane && xAtTargetY <= rightPlane){
				console.warn('Collide on Top/Bottom');
				this.owner.x = xAtTargetY - this.owner.shape.getXOffset();
				this.owner.shape.x = xAtTargetY;
				this.owner.y = targetY - this.owner.shape.getYOffset();
				this.owner.shape.y = targetY;
			} else {
				console.warn('Hero is inside the block.');
			}
			
			break;
		*/
		}
	};
	
	proto.getAABB = function(){
		return this.owner.shape.getAABB();
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   collision-tiles - ../src/js/entity/collision-tiles.js
 */
platformer.components['collision-tiles'] = (function(){
	var component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		this.collisionMap   = definition.collisionMap   || [];
		this.tileWidth      = definition.tileWidth  || this.owner.tileWidth  || 10;
		this.tileHeight     = definition.tileHeight || this.owner.tileHeight || 10;
		this.tileHalfWidth  = this.tileWidth  / 2;
		this.tileHalfHeight = this.tileHeight / 2;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:prep-collision']);
		
		this.owner.collisionType = definition.collisionType || 'solid';
		this.owner.collidesWith = definition.collidesWith || [];
		this.owner.getTiles = function(aabb){
			return self.getTiles(aabb);
		};
		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.isTile = function(x, y){
			return self.isTile(x, y);
		};
	};
	var proto = component.prototype;

	proto['layer:prep-collision'] = function(){
		
	};
	
	proto.getAABB = function(){
		return {
			left: 0,
			top:  0,
			right: this.tileWidth * this.collisionMap.length,
			bottom: this.tileHeight * this.collisionMap.length[0]
		};
	};
	
	proto.isTile = function (x, y) {
		if (x >=0 && x < this.collisionMap.length && y >=0 && y < this.collisionMap[0].length && this.collisionMap[x][y] != -1) 
		{
			return true;
		} else {
			//If there's not a tile or we're outside the map.
			return false;
		}
	};
	
	proto.getTiles = function(aabb){
		var left = Math.max(Math.floor(aabb.left   / this.tileWidth),  0),
		top      = Math.max(Math.floor(aabb.top    / this.tileHeight), 0),
		right    = Math.min(Math.ceil(aabb.right   / this.tileWidth),  this.collisionMap.length),
		bottom   = Math.min(Math.ceil(aabb.bottom  / this.tileHeight), this.collisionMap[0].length),
		x        = 0,
		y        = 0,
		tiles   = [];
		
		for (x = left; x < right; x++){
			for (y = top; y < bottom; y++){
				if (this.collisionMap[x][y] != -1) {
					tiles.push({
								gridX: x,
								gridY: y,
								//type: this.collisionMap[x][y],
								shape: new platformer.classes.collisionShape([x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight], 'rectangle', [[-this.tileHalfWidth, -this.tileHalfHeight],[this.tileHalfWidth, this.tileHalfHeight]])	
								});
					
					//shapes.push(new platformer.classes.collisionShape([x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight], 'rectangle', [[-this.tileHalfWidth, -this.tileHalfHeight],[this.tileHalfWidth, this.tileHalfHeight]]));
				}
			}
		}
		
		return tiles;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   Browser - ../src/js/browser.js
 */
(function(){
	var uagent   = navigator.userAgent.toLowerCase(),
	    
	    myAudio  = document.createElement('audio'),
	    
	    supports = {
			canvas:      false, // determined below
			touch:       TouchEvent in window,

			// specific browsers as determined above
			iPod:      (uagent.search('ipod')    > -1),
			iPhone:    (uagent.search('iphone')  > -1),
			iPad:      (uagent.search('ipad')    > -1),
			safari:    (uagent.search('safari')  > -1),
			ie:        (uagent.search('msie')    > -1),
		    firefox:   (uagent.search('firefox') > -1),
			android:   (uagent.search('android') > -1),
			silk:      (uagent.search('silk')    > -1),
			iOS:       false, //determined below
			mobile:    false, //determined below
			desktop:   false, //determined below
			
			// audio support as determined below
			ogg:         true,
			m4a:         true,
			mp3:         true
		},
	    aspects = platformer.settings.aspects,
	    supportsAspects = {},
	    i = 0,
	    j = 0,
	    k = 0,
	    foundAspect = false,
	    listAspects = '';
	
	supports.iOS     = supports.iPod || supports.iPhone  || supports.iPad;
	supports.mobile  = supports.iOS  || supports.android || supports.silk;
	supports.desktop = !supports.mobile;
	
	// Determine audio support
	if ((myAudio.canPlayType) && !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"'))){
	    supports.ogg = false;
	    if(supports.ie || !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mp4'))){
	    	supports.m4a = false; //make IE use mp3's since it doesn't like the version of m4a made for mobiles
	    }
	}

	// Does the browser support canvas?
	var canvas = document.createElement('canvas');
	try	{
		supports.canvas = !!(canvas.getContext('2d')); // S60
	} catch(e) {
		supports.canvas = !!(canvas.getContext); // IE
	}
	delete canvas;

		//replace settings aspects build array with actual support of aspects
		platformer.settings.aspects = supportsAspects;
	platformer.settings.aspects = {};
	for (i in aspects){
		foundAspect = false;
		listAspects = '';
		for (j in aspects[i]){
			listAspects += ' ' + j;
			for (k in aspects[i][j]){
				if (uagent.search(aspects[i][j][k]) > -1){
					platformer.settings.aspects[j] = true;
					foundAspect = true;
					break;
				}
			}
			if(foundAspect) break;
		}
		if(!foundAspect){
			console.warn('This browser doesn\'t support any of the following: ' + listAspects);
		}
	}

})();


/*--------------------------------------------------
 *   Main - ../src/js/main.js
 */
window.addEventListener('load', function(){
	var loader = new createjs.PreloadJS();
	loader.onProgress = function (event) {
		console.log('Progress:', event);	
	};
	
	loader.onFileLoad = function (event) {
		var i  = 0,
		j      = 0,
		data   = event.data,
		result = event.result,
		ss     = undefined;
		
		console.log('Load:', event);
		
		if((event.type == "image") && data){
			//split up image if it's a sprite sheet
			if(data.rows && data.columns){
				ss = new createjs.SpriteSheet({
					images: [result],
					frames: {width: result.width / data.columns, height: result.height / data.rows}
				});
				for (j = 0; j < data.rows; j++) for (i = 0; i < data.columns; i++){
					if(data.ids && data.ids[i] && data.ids[i][j]){
						platformer.assets[data.ids[i][j]] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					} else {
						platformer.assets[event.id + '-' + i + '_' + j] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					}
				}
				return ;
			}
		}
		
		platformer.assets[event.id] = result;
	};
	
	loader.onError = function (event) {
		console.log('Your stuff broke!');
	};
	
	loader.onComplete = function (event) {
		platformer.game = new platformer.classes.game(platformer.settings);
		createjs.Ticker.setFPS(platformer.settings.global.fps);
		createjs.Ticker.addListener(platformer.game);
	};
	
	
	for(var i in platformer.settings.assets){
		if(typeof platformer.settings.assets[i].src !== 'string'){
			for(var j in platformer.settings.assets[i].src){
				if(platformer.settings.aspects[j] && platformer.settings.assets[i].src[j]){
					platformer.settings.assets[i].src = platformer.settings.assets[i].src[j];
					break;
				}
			}
			if(typeof platformer.settings.assets[i].src !== 'string'){
				if(platformer.settings.assets[i].src['default']){
					platformer.settings.assets[i].src = platformer.settings.assets[i].src['default'];
				} else {
					console.warn('Asset has no valid source for this browser.', platformer.settings.assets[i]);
				}
			}
		}
	}
	
	loader.installPlugin(createjs.SoundJS);
	loader.loadManifest(platformer.settings.assets);
	platformer.assets = [];

}, false);
})();