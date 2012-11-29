(function(){
  var platformer = {};

  PBS = this.PBS || {};
  PBS.KIDS = this.PBS.KIDS || {};
  PBS.KIDS.platformer = platformer;

platformer.settings = {"global":{"initialScene":"menu","fps":60,"rootElement":"root","aspectRatio":1.333,"resizeFont":true},"aspects":[{"ogg":["firefox","opera","chrome"],"m4aCombined":["android","silk","ipod","ipad","iphone"],"mp3":["msie","safari"]}],"assets":{"powerup":{"id":"powerup","src":{"ogg":"a/powerup.ogg","mp3":"a/powerup.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":5000,"length":370}}}},"walk":{"id":"walk","src":{"ogg":"a/walk.ogg","mp3":"a/walk.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":3200,"length":330}}}},"jump":{"id":"jump","src":{"ogg":"a/jump.ogg","mp3":"a/jump.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":1500,"length":250}}}},"collect-gem":{"id":"collect-gem","src":{"ogg":"a/collect-gem.ogg","mp3":"a/collect-gem.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":7000,"length":610}}}},"pickaxe-crush":{"id":"pickaxe-crush","src":{"ogg":"a/pickaxe-crush.ogg","mp3":"a/pickaxe-crush.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":9150,"length":500}}}},"pickaxe-other":{"id":"pickaxe-other","src":{"ogg":"a/pickaxe-other.ogg","mp3":"a/pickaxe-other.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":11150,"length":300}}}},"buttons":{"id":"buttons","src":"i/buttons.png"},"dirt":{"id":"dirt","src":"i/dirt.png"},"mookie":{"id":"mookie","src":"i/mookie.png"},"tilemap":{"id":"tilemap","src":"i/tile-map.png"},"sprites":{"id":"sprites","src":"i/game-sprites.png"},"test":{"id":"test","src":"i/test.png"},"test-animation":{"id":"test-animation","src":"i/test-animation.png"},"tiles":{"id":"tiles","src":"i/tiles.png"},"gem":{"id":"gem","src":"i/gem.png"},"gem-bar":{"id":"gem-bar","src":"i/gem-bar.png"},"title-screen":{"id":"title-screen","src":"i/title-screen.png"},"objects":{"id":"objects","src":"i/objects.png"},"beetle":{"id":"beetle","src":"i/beetle.png"},"flower":{"id":"flower","src":"i/flower.png"},"briar":{"id":"briar","src":"i/briar.png"}},"classes":{"Game":{"id":"Game","src":"../src/js/game.js"},"Entity":{"id":"Entity","src":"../src/js/entity.js"},"Scene":{"id":"Scene","src":"../src/js/scene.js"},"Collision-Shape":{"id":"Collision-Shape","src":"../src/js/collision-shape.js"},"AABB":{"id":"AABB","src":"../src/js/aabb.js"}},"components":{"enable-ios-audio":{"id":"enable-ios-audio","src":"../src/js/standard-components/enable-ios-audio.js"},"handler-controller":{"id":"handler-controller","src":"../src/js/standard-components/handler-controller.js"},"tiled-loader":{"id":"tiled-loader","src":"../src/js/standard-components/tiled-loader.js"},"handler-render-createjs":{"id":"handler-render-createjs","src":"../src/js/standard-components/handler-render-createjs.js"},"handler-render-dom":{"id":"handler-render-dom","src":"../src/js/standard-components/handler-render-dom.js"},"handler-ai":{"id":"handler-ai","src":"../src/js/standard-components/handler-ai.js"},"handler-logic":{"id":"handler-logic","src":"../src/js/standard-components/handler-logic.js"},"camera":{"id":"camera","src":"../src/js/standard-components/camera.js"},"collision-group":{"id":"collision-group","src":"../src/js/standard-components/collision-group.js"},"audio":{"id":"audio","src":"../src/js/standard-components/audio.js"},"broadcast-events":{"id":"broadcast-events","src":"../src/js/standard-components/broadcast-events.js"},"change-scene":{"id":"change-scene","src":"../src/js/standard-components/change-scene.js"},"destroy-me":{"id":"destroy-me","src":"../src/js/standard-components/destroy-me.js"},"dom-element":{"id":"dom-element","src":"../src/js/standard-components/dom-element.js"},"entity-container":{"id":"entity-container","src":"../src/js/standard-components/entity-container.js"},"entity-controller":{"id":"entity-controller","src":"../src/js/standard-components/entity-controller.js"},"render-debug":{"id":"render-debug","src":"../src/js/standard-components/render-debug.js"},"render-tiles":{"id":"render-tiles","src":"../src/js/standard-components/render-tiles.js"},"render-animation":{"id":"render-animation","src":"../src/js/standard-components/render-animation.js"},"render-image":{"id":"render-image","src":"../src/js/standard-components/render-image.js"},"logic-button":{"id":"logic-button","src":"../src/js/standard-components/logic-button.js"},"logic-carrier":{"id":"logic-carrier","src":"../src/js/standard-components/logic-carrier.js"},"logic-directional-movement":{"id":"logic-directional-movement","src":"../src/js/standard-components/logic-directional-movement.js"},"logic-gravity":{"id":"logic-gravity","src":"../src/js/standard-components/logic-gravity.js"},"logic-portable":{"id":"logic-portable","src":"../src/js/standard-components/logic-portable.js"},"logic-pushable":{"id":"logic-pushable","src":"../src/js/standard-components/logic-pushable.js"},"logic-counter":{"id":"logic-counter","src":"../src/js/standard-components/logic-counter.js"},"logic-timer":{"id":"logic-timer","src":"../src/js/standard-components/logic-timer.js"},"logic-teleporter":{"id":"logic-teleporter","src":"../src/js/standard-components/logic-teleporter.js"},"logic-portal":{"id":"logic-portal","src":"../src/js/standard-components/logic-portal.js"},"collision-basic":{"id":"collision-basic","src":"../src/js/standard-components/collision-basic.js"},"collision-tiles":{"id":"collision-tiles","src":"../src/js/standard-components/collision-tiles.js"},"ai-pacer":{"id":"ai-pacer","src":"../src/js/standard-components/ai-pacer.js"},"render-gui":{"id":"render-gui","src":"../src/js/example-components/render-gui.js"},"render-counter":{"id":"render-counter","src":"../src/js/example-components/render-counter.js"},"render-clock":{"id":"render-clock","src":"../src/js/example-components/render-clock.js"},"logic-collectible-manager":{"id":"logic-collectible-manager","src":"../src/js/example-components/logic-collectible-manager.js"},"logic-hero":{"id":"logic-hero","src":"../src/js/example-components/logic-hero.js"},"logic-gem":{"id":"logic-gem","src":"../src/js/example-components/logic-gem.js"},"logic-gui":{"id":"logic-gui","src":"../src/js/example-components/logic-gui.js"},"render-fps-counter":{"id":"render-fps-counter","src":"../src/js/example-components/render-fps-counter.js"}},"entities":{"action-layer":{"id":"action-layer","components":[{"type":"handler-ai"},{"type":"handler-logic"},{"type":"collision-group"},{"type":"camera","width":3200},{"type":"handler-render-createjs"},{"type":"handler-controller"},{"type":"entity-container","entities":[{"type":"collectible-manager"}]},{"type":"tiled-loader","unitsPerPixel":10,"images":["sprites"],"imagesScale":2}]},"desktop-interface-layer":{"id":"desktop-interface-layer","filter":{"excludes":["touch"]},"components":[{"type":"camera","width":4000},{"type":"handler-logic"},{"type":"handler-render-createjs","showFPS":true},{"type":"entity-container","entities":[{"type":"button-mute"},{"type":"button-play"},{"type":"gui"},{"type":"fps-counter"}],"childEvents":["gui-gem-collected","time-elapsed"]}]},"multitouch-interface-layer":{"id":"multitouch-interface-layer","filter":{"includes":["multitouch"]},"components":[{"type":"camera","width":4000},{"type":"handler-logic"},{"type":"handler-render-createjs"},{"type":"entity-container","entities":[{"type":"button-jump"},{"type":"button-pickaxe"},{"type":"button-left"},{"type":"button-right"},{"type":"gui"},{"type":"fps-counter"}],"childEvents":["gui-gem-collected","time-elapsed"]}]},"touch-interface-layer":{"id":"touch-interface-layer","filter":{"includes":["touch"],"excludes":["multitouch"]},"components":[{"type":"camera","width":4000},{"type":"handler-logic"},{"type":"handler-render-createjs"},{"type":"entity-container","entities":[{"type":"button-jump-left"},{"type":"button-jump-right"},{"type":"button-jump","properties":{"x":310}},{"type":"button-pickaxe","properties":{"x":10,"y":680}},{"type":"button-left"},{"type":"button-right"},{"type":"gui"},{"type":"fps-counter"}],"childEvents":["gui-gem-collected","time-elapsed"]}]},"tile-layer":{"id":"tile-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"},{"type":"collision-tiles","collisionMap":"import"}]},"render-layer":{"id":"render-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"}]},"collision-layer":{"id":"collision-layer","components":[{"type":"collision-tiles","collisionMap":"import"}]},"button-jump":{"id":"button-jump","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-jump:down","mouseup":"button-jump:up"}},{"type":"render-animation","animationMap":{"pressed":"pressed","released":"released"},"spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":1,"pressed":7}},"scaleX":5,"scaleY":5,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":20,"y":2300,"z":400}},"button-jump-left":{"id":"button-jump-left","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":["button-jump:down","button-left:down"],"mouseup":["button-jump:up","button-left:up"]}},{"type":"render-animation","animationMap":{"pressed":"pressed","released":"released"},"spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":4,"pressed":10}},"scaleX":5,"scaleY":5,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":10,"y":1090,"z":400}},"button-jump-right":{"id":"button-jump-right","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":["button-jump:down","button-right:down"],"mouseup":["button-jump:up","button-right:up"]}},{"type":"render-animation","animationMap":{"pressed":"pressed","released":"released"},"spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":5,"pressed":11}},"scaleX":5,"scaleY":5,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":610,"y":1090,"z":400}},"button-left":{"id":"button-left","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-left:down","mouseup":"button-left:up"}},{"type":"render-animation","animationMap":{"pressed":"pressed","released":"released"},"spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":0,"pressed":6}},"scaleX":5,"scaleY":5,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":2460,"y":2300,"z":400}},"button-pickaxe":{"id":"button-pickaxe","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-pickaxe:down","mouseup":"button-pickaxe:up"}},{"type":"render-animation","animationMap":{"pressed":"pressed","released":"released"},"spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":17,"pressed":23}},"scaleX":5,"scaleY":5,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":840,"y":2300,"z":400}},"button-play-game":{"id":"button-play-game","components":[{"type":"dom-element","element":"div","innerHTML":"Play Game","className":"menu-button","onmouseup":"new-scene","ontouchend":"new-scene"},{"type":"change-scene","scene":"scene-level-1","transition":"fade-to-black"}]},"button-right":{"id":"button-right","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-right:down","mouseup":"button-right:up"}},{"type":"render-animation","animationMap":{"pressed":"pressed","released":"released"},"spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":2,"pressed":8}},"scaleX":5,"scaleY":5,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":3280,"y":2300,"z":400}},"button-mute":{"id":"button-mute","components":[{"type":"logic-button","toggle":true,"state":"pressed"},{"type":"render-animation","animationMap":{"pressed":"pressed","released":"released"},"spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":3,"pressed":9}},"scaleX":2.9,"scaleY":2.9,"state":"pressed","acceptInput":{"click":true,"touch":true}},{"type":"broadcast-events","renameEvents":{"mouseup":"audio-mute-toggle"}},{"type":"audio"}],"properties":{"x":10,"y":10,"z":400,"width":400,"height":400}},"hero":{"id":"hero","components":[{"type":"entity-controller","controlMap":{"button-jump":"key-jump","key:z":"key-jump","button-pickaxe":"key-swing","key:x":"key-swing","key:left-arrow":"key-left","button-left":"key-left","key:right-arrow":"key-right","button-right":"key-right"}},{"type":"logic-carrier"},{"type":"logic-hero"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-80,-120],[80,120]]},"collisionType":"hero","solidCollisions":{"block":"","dirt":"","tiles":"","beetle":"","briar":""}},{"type":"render-animation","animationMap":{"swing,left":"swing-left","swing,right":"swing-right","air,left":"jumping-left","air,right":"jumping-right","moving,left":"walking-left","moving,right":"walking-right","left":"standing-left","right":"standing-right","default":"standing-right"},"spriteSheet":{"images":["mookie"],"frames":{"width":240,"height":155,"regY":155,"regX":120},"animations":{"standing-right":[2],"standing-left":[5],"walking-right":{"frames":[3,0,1,2],"frequency":4},"walking-left":{"frames":[4,7,6,5],"frequency":4},"jumping-right":{"frames":[0]},"jumping-left":{"frames":[6]},"swing-right":{"frames":[8,9,10,10,2],"next":"standing-right","frequency":4},"swing-left":{"frames":[14,13,12,12,5],"next":"standing-left","frequency":4}}},"scaleX":2,"scaleY":2},{"type":"audio","audioMap":{"swingHit":{"sound":"pickaxe-other","interrupt":"none"},"ground, moving":{"sound":"walk","interrupt":"none"},"jumping":"jump"}},{"type":"render-debug","regY":260,"regX":130}],"properties":{"x":10,"y":10,"z":200,"width":160,"height":240,"state":"ground","heading":"right","camera":"bounding"}},"block":{"id":"block","components":[{"type":"logic-gravity"},{"type":"logic-pushable"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-110,-120],[110,120]]},"collisionType":"block","solidCollisions":{"block":"hit-solid","dirt":"hit-solid","hero":["push-entity","hit-solid"],"tiles":"hit-solid","beetle":"hit-solid","briar":"hit-solid"}},{"type":"render-image","image":"sprites","source":{"width":120,"height":120,"y":720,"x":240},"regX":60,"regY":120,"scaleX":2,"scaleY":2},{"type":"render-debug","regX":120,"regY":240}],"properties":{"x":50,"y":50,"z":50,"width":240,"height":240}},"dirt":{"id":"dirt","components":[{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-120,-120],[120,120]]},"collisionType":"dirt","softCollisions":{"pickaxe":"destroy-me"}},{"type":"destroy-me","delay":250},{"type":"audio","audioMap":{"destroy-me":{"sound":"pickaxe-crush","interrupt":"none"}}},{"type":"render-animation","animationMap":{"destroy-me":"explosion"},"spriteSheet":{"images":["dirt"],"frames":{"width":240,"height":240,"regX":120,"regY":180},"animations":{"stationary":0,"explosion":{"frames":[1,2,3,4,5],"frequency":4}}},"state":"stationary","scaleX":2,"scaleY":2}],"properties":{"x":50,"y":50,"z":50,"width":240,"height":240}},"gem":{"id":"gem","components":[{"type":"logic-gem"},{"type":"collision-basic","shape":{"offset":[0,-110],"type":"rectangle","points":[[-70,-110],[70,110]]},"collisionType":"gem","softCollisions":{"hero":"collect-gem"}},{"type":"render-animation","spriteSheet":{"images":["gem"],"frames":{"width":14,"height":22,"regY":22,"regX":7},"animations":{"default":{"frames":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],"frequency":4}}}},{"type":"audio","audioMap":{"sound-collect-gem":{"sound":"collect-gem","interrupt":"early"}}},{"type":"render-debug","regY":220,"regX":110}],"properties":{"x":10,"y":10,"z":100}},"pickaxe":{"id":"pickaxe","components":[{"type":"collision-basic","shape":{"offset":[0,-140],"type":"rectangle","points":[[-100,-140],[100,140]]},"collisionType":"pickaxe"},{"type":"destroy-me","message":"prepare-for-collision","delay":50}]},"level-portal":{"id":"level-portal","components":[{"type":"logic-portal"},{"type":"collision-basic","collisionType":"portal","softCollisions":{"hero":"occupied"}},{"type":"render-debug","regX":120,"regY":240},{"type":"change-scene","transition":"fade-to-black"}],"properties":{"x":50,"y":50,"z":0}},"gem-counter":{"id":"gem-counter","components":[{"type":"logic-counter","message":"count-gems"},{"type":"render-counter","scaleX":20,"scaleY":20,"color":"#FFF"}],"properties":{"x":3800,"y":175,"z":400}},"title-screen":{"id":"title-screen","components":[{"type":"dom-element","element":"img","className":"title-screen","src":"i/title-screen.png"}]},"collectible-manager":{"id":"collectible-manager","components":[{"type":"logic-collectible-manager"},{"type":"broadcast-events","events":{"broadcast-gem-collected":"gui-gem-collected"}}],"properties":{"x":10,"y":10}},"gui":{"id":"gui","components":[{"type":"logic-gui"},{"type":"render-animation","spriteSheet":{"images":["gem-bar"],"frames":{"width":229,"height":139,"regY":0,"regX":229},"animations":{"default":[0]}},"scaleX":2.9,"scaleY":2.9},{"type":"entity-container","entities":[{"type":"gem-counter"},{"type":"clock"}],"childEvents":["count-gems","set-time","start-timer","stop-timer","handle-logic","handle-render","handle-render-load","audio-mute-toggle","audio-mute","audio-unmute"]}],"properties":{"x":4000,"y":0,"z":350}},"beetle":{"id":"beetle","components":[{"type":"ai-pacer","movement":"horizontal"},{"type":"logic-directional-movement"},{"type":"logic-gravity"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-90,-120],[90,120]]},"collisionType":"beetle","solidCollisions":{"beetle":"turn-around","hero":"turn-around","block":"turn-around","dirt":"turn-around","tiles":"turn-around","briar":"turn-around"}},{"type":"render-animation","animationMap":{"moving,left":"walking-left","moving,right":"walking-right","default":"standing"},"spriteSheet":{"images":["beetle"],"frames":{"width":24,"height":24,"regY":24,"regX":12},"animations":{"standing":[0],"walking-right":{"frames":[2,3,1],"frequency":4},"walking-left":{"frames":[3,2,1],"frequency":4}}}}],"properties":{"x":10,"y":10,"z":150}},"clock":{"id":"clock","components":[{"type":"logic-timer"},{"type":"render-clock","scaleX":20,"scaleY":20,"color":"#FFF"},{"type":"audio","audioMap":{}}],"properties":{"x":2000,"y":175,"z":400,"alarmMessage":"half-minute-timer","updateMessage":"refresh-clock","alarmTime":30000,"isIncrementing":true,"isInterval":true,"time":1000}},"flower":{"id":"flower","components":[{"type":"render-animation","spriteSheet":{"images":["flower"],"frames":{"width":120,"height":120,"regY":120,"regX":60},"animations":{"default":[0]}},"scaleX":2,"scaleY":2}],"properties":{"x":10,"y":10,"z":50}},"briar":{"id":"briar","components":[{"type":"logic-teleporter","facing":"up"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-120,-120],[120,120]]},"collisionType":"briar","solidCollisions":{"hero":"teleport-entity"}},{"type":"render-animation","animationMap":{"facing-up":"up","facing-down":"down","facing-left":"left","facing-right":"right"},"spriteSheet":{"images":["briar"],"frames":{"width":120,"height":120,"regY":120,"regX":60},"animations":{"up":[0],"down":[3],"right":[1],"left":[2]}},"state":"up","scaleX":2,"scaleY":2},{"type":"render-debug","regX":60,"regY":120}],"properties":{"x":10,"y":10,"z":250,"linkId":""}},"fps-counter":{"id":"fps-counter","components":[{"type":"render-fps-counter","scaleX":1,"scaleY":1,"x":200,"y":60,"z":1000,"color":"#FFF","font":"bold 80px Arial"}],"properties":{}}},"includes":{"EaselJS":{"id":"EaselJS","src":"http://code.createjs.com/easeljs-0.5.0.min.js"},"TweenJS":{"id":"TweenJS","src":"http://code.createjs.com/tweenjs-0.3.0.min.js"},"SoundJS":{"id":"SoundJS","src":"http://code.createjs.com/soundjs-0.3.0.min.js"},"PreloadJS":{"id":"PreloadJS","src":"http://code.createjs.com/preloadjs-0.2.0.min.js"},"Browser":{"id":"Browser","src":"../src/js/browser.js"},"iOSAudio":{"id":"iOSAudio","src":"../src/js/HTMLiOSAudioPlugin.js"},"SoundJSm4a":{"id":"SoundJSm4a","src":"../src/js/SoundJSm4aOverride.js"},"Main":{"id":"Main","src":"../src/js/main.js"},"ButtonCSS":{"id":"ButtonCSS","src":"../src/css/button.css"},"MainCSS":{"id":"MainCSS","src":"../src/css/main.css"},"GameCSS":{"id":"GameCSS","src":"../src/css/game.css"}},"scenes":{"menu":{"layers":[{"id":"menu-layer","components":[{"type":"handler-logic"},{"type":"handler-render-dom"},{"type":"handler-controller"},{"type":"entity-container","entities":[{"type":"title-screen"},{"type":"button-play-game"}]}]},{"id":"enable-ios-audio-layer","filter":{"includes":["iOS"]},"components":[{"type":"enable-ios-audio","audioId":"combined"}]}],"id":"menu"},"scene-level-1":{"layers":[{"type":"action-layer","properties":{"level":"level-1"}},{"type":"multitouch-interface-layer"},{"type":"touch-interface-layer"},{"type":"desktop-interface-layer"}],"id":"scene-level-1"},"scene-level-2":{"layers":[{"type":"action-layer","properties":{"level":"level-2"}},{"type":"multitouch-interface-layer"},{"type":"touch-interface-layer"},{"type":"desktop-interface-layer"}],"id":"scene-level-2"},"scene-level-3":{"layers":[{"type":"action-layer","properties":{"level":"level-3"}},{"type":"multitouch-interface-layer"},{"type":"touch-interface-layer"},{"type":"desktop-interface-layer"}],"id":"scene-level-3"}},"levels":{"level-1":{"height":18,"layers":[{"data":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,37,10,10,10,10,10,10,10,1,1,1,1,1,10,10,1,1,1,1,1,1,1,1,1,10,10,10,10,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,19,19,19,19,19,19,19,19,1,1,1,19,19,19,1,1,1,1,1,1,1,1,19,19,19,19,19,19,1,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,1,1,1,28,28,28,28,28,28,28,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,29,30,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,38,39,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37],"height":18,"name":"background","opacity":1,"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"data":[6,21,21,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,11,13,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,3,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,11,13,0,0,0,0,0,0,5,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,12,0,0,12,3,3,0,0,0,0,0,0,13,0,3,0,0,0,0,0,11,15,3,3,3,0,3,3,18,0,0,0,0,0,0,3,0,0,0,0,0,12,0,0,12,0,0,12,12,12,3,0,0,0,0,0,12,0,12,3,3,0,3,3,3,13,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,12,0,3,0,0,0,12,0,0,0,0,0,3,3,0,0,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,0,11,0,3,3,3,0,3,3,0,0,0,3,0,0,12,0,0,0,12,0,0,0,3,3,0,0,0,11,0,0,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,3,0,0,0,3,12,0,0,0,0,0,0,0,12,0,3,3,0,0,0,0,0,0,0,0,3,16,0,12,0,0,0,0,0,12,13,0,0,32,3,32,3,32,0,0,0,12,0,12,12,0,0,0,0,0,0,0,11,0,12,0,0,5,0,0,0,0,0,3,0,12,0,12,0,0,0,0,0,12,12,0,0,33,35,36,35,34,3,3,3,12,0,12,12,0,0,0,0,0,0,3,16,0,12,0,0,12,0,0,0,0,0,12,0,12,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,20,12,12,12,12,0,0,0,3,3,3,0,0,0,0,12,0,12,0,0,12,0,0,0,0,3,0,0,12,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,0,0,0,12,12,12,12,12,12,3,12,0,0,12,0,12,0,0,12,0,0,0,0,12,0,0,12,0,11,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,12,0,0,3,0,0,12,24,26,25,0,0,0,0,0,12,0,0,0,0,0,12,12,0,0,2,3,3,0,3,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,23,21,23,0,0,0,0,0,12,0,0,0,0,0,12,12,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,12,3,3,3,4,0,2,12,0,11,0,0,0,0,0,0,0,13,0,0,0,0,3,0,3,3,0,3,3,3,0,0,3,0,12,32,3,32,3,32,4,0,2,3,18,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,13,0,0,0,0,12,0,0,0,0,0,0,0,3,0,0,0,12,33,35,36,35,34,13,0,11,12,13,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,3,3,0,0,0,0,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],"height":18,"name":"action","opacity":1,"properties":{"entity":"tile-layer"},"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"height":18,"name":"entities","objects":[{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":480,"y":72},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":48},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":168},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":216},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":264},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":216},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":264},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":24,"y":144},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":312},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":408},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower0"},"type":"","width":0,"x":288,"y":72},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower1"},"type":"","width":0,"x":264,"y":192},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower2"},"type":"","width":0,"x":24,"y":408},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower3"},"type":"","width":0,"x":240,"y":336},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower4"},"type":"","width":0,"x":408,"y":360},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower5"},"type":"","width":0,"x":672,"y":72},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower6"},"type":"","width":0,"x":864,"y":360},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":288},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":408},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":384},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":96},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":72},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":48},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":144},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":120},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":96},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":168,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":240,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":96},{"gid":56,"height":48,"name":"","properties":{},"type":"","width":24,"x":744,"y":72},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":96},{"gid":56,"height":72,"name":"","properties":{},"type":"","width":24,"x":816,"y":336},{"gid":56,"height":48,"name":"","properties":{},"type":"","width":48,"x":984,"y":96},{"gid":56,"height":48,"name":"","properties":{},"type":"","width":24,"x":456,"y":360},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":264},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower2"},"type":"","width":0,"x":120,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower3"},"type":"","width":0,"x":264,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower0"},"type":"","width":0,"x":432,"y":168},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower1"},"type":"","width":0,"x":456,"y":264},{"gid":64,"height":0,"name":"","properties":{"":"","teleportId":"flower6"},"type":"","width":0,"x":840,"y":48},{"gid":64,"height":0,"name":"","properties":{"facing":"right","teleportId":"flower6"},"type":"","width":0,"x":840,"y":144},{"gid":65,"height":0,"name":"","properties":{"facing":"left","teleportId":"flower6"},"type":"","width":0,"x":888,"y":168},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":192},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":216},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":24},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":48},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":48},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":72},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":96},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":120},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":312},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":336},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":360},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":24},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":48},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":72},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":96},{"gid":75,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":120},{"gid":66,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":120},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":480,"y":408},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":432,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":408},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":408},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":384},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":360},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":360},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":336},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":336},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":288},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":264},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":240},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":216},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":192},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":144},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower5"},"type":"","width":0,"x":648,"y":168},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":336,"y":264},{"gid":46,"height":0,"name":"","properties":{},"type":"hero","width":0,"x":24,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":72},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":96},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":24,"y":48},{"gid":70,"height":0,"name":"","properties":{},"type":"","width":0,"x":0,"y":24},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower0"},"type":"","width":0,"x":408,"y":168},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower0"},"type":"","width":0,"x":384,"y":168},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower2"},"type":"","width":0,"x":144,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower2"},"type":"","width":0,"x":168,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower2"},"type":"","width":0,"x":192,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower1"},"type":"","width":0,"x":480,"y":264},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower3"},"type":"","width":0,"x":288,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower3"},"type":"","width":0,"x":312,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower3"},"type":"","width":0,"x":336,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower4"},"type":"","width":0,"x":528,"y":432},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower5"},"type":"","width":0,"x":672,"y":168},{"gid":63,"height":0,"name":"","properties":{"teleportId":"flower5"},"type":"","width":0,"x":696,"y":168},{"height":48,"name":"","properties":{"destination":"scene-level-3"},"type":"level-portal","width":48,"x":912,"y":360}],"opacity":1,"type":"objectgroup","visible":true,"width":44,"x":0,"y":0}],"orientation":"orthogonal","properties":{},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/tiles.png","imageheight":120,"imagewidth":216,"margin":0,"name":"tiles","properties":{},"spacing":0,"tileheight":24,"tilewidth":24},{"firstgid":46,"image":"../src/images/objects.png","imageheight":96,"imagewidth":192,"margin":0,"name":"objects","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"0":{"entity":"hero"},"1":{"entity":"flower"},"10":{"entity":"block"},"17":{"entity":"briar"},"18":{"entity":"briar","facing":"right"},"19":{"entity":"briar","facing":"left"},"2":{"entity":"dirt"},"24":{"entity":"timer"},"8":{"entity":"beetle"},"9":{"entity":"gem"}},"tilewidth":24}],"tilewidth":24,"version":1,"width":44,"id":"level-1"},"level-2":{"height":18,"layers":[{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,35,35,35,35,35,35,35,35,35,35,35,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"height":18,"name":"tile-layer","opacity":1,"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"height":18,"name":"entities","objects":[{"gid":1,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":48},{"gid":11,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":0}],"opacity":1,"type":"objectgroup","visible":true,"width":44,"x":0,"y":0}],"orientation":"orthogonal","properties":{},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/objects.png","imageheight":96,"imagewidth":192,"margin":0,"name":"objects","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"0":{"entity":"hero"},"10":{"entity":"block"},"2":{"entity":"dirt"},"9":{"entity":"gem"}},"tilewidth":24},{"firstgid":33,"image":"../src/images/tiles.png","imageheight":120,"imagewidth":216,"margin":0,"name":"tiles","properties":{},"spacing":0,"tileheight":24,"tilewidth":24}],"tilewidth":24,"version":1,"width":44,"id":"level-2"},"level-3":{"height":60,"layers":[{"data":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,32,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,32,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,32,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,32,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,13,32,32,32,32,32,32,32,32,32,32,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,23,1,23,1,23,1,23,1,29,30,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,38,39,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,10,10,10,10,10,37,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,19,19,19,19,37,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,1,1,1,1,1,1,1,1,1,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37],"height":60,"name":"background","opacity":1,"type":"tilelayer","visible":true,"width":60,"x":0,"y":0},{"data":[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,3,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,12,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,12,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,12,3,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,12,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,12,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,3,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,6,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,7,12,0,12,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,13,23,0,23,0,23,0,0,0,0,0,0,0,0,0,0,0,11,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,16,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,13,0,0,0,0,0,0,0,0,0,0,0,0,0,2,16,12,12,12,0,12,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,13,0,0,0,0,0,0,0,0,0,0,0,0,2,16,12,12,12,12,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,13,0,0,0,0,0,0,0,0,0,0,0,2,16,0,0,0,0,0,12,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,12,12,12,12,12,15,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,12,12,3,3,3,3,3,3,3,3,3,15,3,3,3,3,3,3,3,3,3,15,3,3,3,3,3,3,3,3,3,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,3,12,12,12,12,12,12,12,12,12,3,12,12,12,12,12,12,12,12,12,3,12,12,12,12,12,12,12],"height":60,"name":"action","opacity":1,"properties":{"entity":"tile-layer"},"type":"tilelayer","visible":true,"width":60,"x":0,"y":0},{"height":60,"name":"entities","objects":[{"gid":46,"height":0,"name":"","properties":{},"type":"hero","width":0,"x":24,"y":1296},{"gid":70,"height":0,"name":"","properties":{},"type":"","width":0,"x":0,"y":1224},{"height":48,"name":"","properties":{"destination":"scene-level-1"},"type":"level-portal","width":48,"x":360,"y":1224},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":744},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":888},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":816},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":912},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":696},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":720},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":840},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":792},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":864},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":768},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":792},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1392},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1368},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1296},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1320},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1344},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1320},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":432},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":312},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":240},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1248},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1224},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1272},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1176},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1200},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1008},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1104},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1032},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1056},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":984},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":1128},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":1080},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":936},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":1152},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":960},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":984},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1056},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":936},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":1008},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1032},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":960},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1152},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":1128},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":1080},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":1104},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1128,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1200,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1152,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1224,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":648},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1176,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":576},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":600},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":528},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1104,"y":504},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":624},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1080,"y":456},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":672},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1248,"y":552},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":480},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1056,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1032,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":144},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":168},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":840},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":600},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":528},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":816},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":648},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":624},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":720},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":672},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":480},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":864},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":768},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":552},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":792,"y":504},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":912},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":888},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":744},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":456},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":984,"y":576},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":792},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":696},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":960,"y":576}],"opacity":1,"type":"objectgroup","visible":true,"width":60,"x":0,"y":0}],"orientation":"orthogonal","properties":{},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/data/src/images/tiles.png","imageheight":120,"imagewidth":216,"margin":0,"name":"tiles","properties":{},"spacing":0,"tileheight":24,"tilewidth":24},{"firstgid":46,"image":"../src/data/src/images/objects.png","imageheight":96,"imagewidth":192,"margin":0,"name":"objects","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"0":{"entity":"hero"},"1":{"entity":"flower"},"2":{"entity":"dirt"},"8":{"entity":"beetle"},"9":{"entity":"gem"},"10":{"entity":"block"},"17":{"entity":"briar"},"18":{"entity":"briar","facing":"right"},"19":{"entity":"briar","facing":"left"},"24":{"entity":"timer"}},"tilewidth":24}],"tilewidth":24,"version":1,"width":60,"id":"level-3"}}};
platformer.classes = {};

/*--------------------------------------------------
 *   Game - ../src/js/game.js
 */
platformer.classes.game = (function(){
	var bindEvent = function(eventId, callback){return function(event){callback(eventId, event);};},
	game          = function (definition){
		this.currentScene = undefined;
		this.tickContent = {deltaT: 0};
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
	},
	proto = game.prototype;
	
	proto.tick = function(deltaT){
		this.tickContent.deltaT = deltaT;
		
		if(this.currentScene){
			this.currentScene.trigger('tick', this.tickContent);
		}
	};
	
	proto.loadScene = function(sceneId, transition, overrides){
		var self = this;
		this.inTransition = true;
		this.leavingScene = this.currentScene;
		switch(transition){
		case 'fade-to-black':
			var element = document.createElement('div');
			this.rootElement.appendChild(element);
			element.style.width = '100%';
			element.style.height = '100%';
			element.style.position = 'absolute';
			element.style.zIndex = '12';
			element.style.opacity = '0';
			element.style.background = '#000';
			new createjs.Tween(element.style).to({opacity:0}, 500).to({opacity:1}, 500).call(function(t){
				self.loadNextScene(sceneId, overrides);
			}).wait(500).to({opacity:0}, 500).call(function(t){
				self.rootElement.removeChild(element);
				element = undefined;
				self.completeSceneTransition();
			});
			break;
		case 'instant':
		default:
			this.loadNextScene(sceneId, overrides);
			this.completeSceneTransition();
		}
	};
	
	proto.loadNextScene = function(sceneId, overrides){
		if(overrides){
			var scene = JSON.stringify(this.settings.scenes[sceneId]);
			for (var i in overrides){
				while(scene.indexOf(i) > -1){
					scene = scene.replace(i, overrides[i]);
				}
			}
			this.currentScene = new platformer.classes.scene(JSON.parse(scene), this.rootElement);
		} else {
			this.currentScene = new platformer.classes.scene(this.settings.scenes[sceneId], this.rootElement);
		}
	};
	
	proto.completeSceneTransition = function(){
		this.inTransition = false;
		if(this.leavingScene){
			this.leavingScene.destroy();
			this.leavingScene = false;
		}
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
/**
# CLASS entity
This class comprises the core structure of every object in the [[Game]]. Starting with an entity, various components are added to it to build a specific object. As such, there is very little functionality in the entity itself apart from functions and pieces allowing for addition and removal of components and communication between components.

## Messages

### Local Broadcasts:
- **load** - The entity triggers `load` on itself once all the properties and components have been attached, notifying the components that all their peer components are ready for messages.

## Methods
- **[constructor]** - Creates an object from the entity class and attaches both properties and components as provided by the parameters.
  > @param definition (object) - Base definition for the entity, including both properties and components as shown below under "JSON definition".
  > @param instanceDefinition (object) - Specific instance definition including properties that override the base definition properties.
  > @return entity - returns the new entity made up of the provided components. 
- **addComponent** - Attaches the provided component to the entity.
  > @param component (object) - Must be an object that functions as a [[Component]].
  > @return component - Returns the same object that was submitted.
- **removeComponent** - Removes the mentioned component from the entity.
  > @param component (object) - Must be a [[Component]] attached to the entity.
  > @return component|false - Returns the same object that was submitted if removal was successful; otherwise returns false (the component was not found attached to the entity).
- **bind** - Used by components' to bind handler functions to triggered events on the entity. 
  > @param messageId (string) - This is the message for which the component is listening.
  > @param func (function) - This is the function that will be run when the message is triggered.
- **unbind** - Used by components' to unbind handler functions on the entity, typically called when a component is removed from the entity.
  > @param messageId (string) - This is the message the component is currently listening to.
  > @param func (function) - This is the function that was attached to the message.
- **trigger** - This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run component functions as appropriate.
  > @param messageId (string) - This is the message to process.
  > @param value (variant) - This is a message object or other value to pass along to component functions.
  > @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  > @return integer - The number of handlers for the triggered message: this is useful for determining whether the entity cares about a given message.
- **getMessageIds** - This method returns all the messages that this entity is concerned about.
  > @return Array - An array of strings listing all the messages for which this entity has handlers.
- **destroy** - This method removes all components from the entity.

## JSON Definition:
    {
      "id": "entity-id",
      // "entity-id" becomes `entity.type` once the entity is created.
      
      "components": [
      // This array lists one or more component definition objects
      
        {"type": "example-component"}
        // The component objects must include a "type" property corresponding to a component to load, but may also include additional properties to customize the component in a particular way for this entity.
      ],
      
      "properties": [
      // This array lists properties that will be attached directly to this entity.
      
        "x": 240
        // For example, `x` becomes `entity.x` on the new entity.
      ],
      
      "filters": {
      // Filters are only used by top level entities loaded by the scene and are not used by the entity directly. They determine whether an entity should be loaded on a particular browser according to browser settings.
      
        "includes": ["touch"],
        // Optional. This filter specifies that this entity should be loaded on browsers/devices that support a touch interface. More than one setting can be added to the array.

        "excludes": ["multitouch"]
        // Optional. This filter specifies that this entity should not be loaded on browsers/devices that do not support a multitouch interface. More than one setting can be added to the array.
      }
    }
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
		self.loopCheck  = [];
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
	
	proto.trigger = function(messageId, value, debug){
		var i = 0;
		if(this.debug || debug || (value && value.debug)){
			if(this.messages[messageId] && this.messages[messageId].length){
				console.log('Entity "' + this.type + '": Event "' + messageId + '" has ' + this.messages[messageId].length + ' subscriber' + ((this.messages[messageId].length>1)?'s':'') + '.', value);
			} else {
				console.warn('Entity "' + this.type + '": Event "' + messageId + '" has no subscribers.', value);
			}
		}
		for (i = 0; i < this.loopCheck.length; i++){
			if(this.loopCheck[i] === messageId){
				throw "Endless loop detected for '" + messageId + "'.";
			}
		}
		i = 0;
		this.loopCheck.push(messageId);
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value, debug);
			}
		}
		this.loopCheck.length = this.loopCheck.length - 1; 
		return i;
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
			this.components[x].destroy();
		}
		this.components.length = 0;
	};
	
	return entity;
})();

/*--------------------------------------------------
 *   Scene - ../src/js/scene.js
 */
/**
# CLASS scene
This class is instantiated by [[Game]] and contains one or more entities as layers. Each layer [[Entity]] handles a unique aspect of the scene. For example, one layer might contain the game world, while another layer contains the game interface. Generally there is only a single scene loaded at any given moment.

## Messages

### Child Broadcasts:
- **[Messages specified in definition]** - Listens for messages and on receiving them, re-triggers them on each entity layer.
  > @param message (object) - sends the message object received by the original message.

## Methods
- **[constructor]** - Creates an object from the scene class and passes in a scene definition containing a list of layers to load and a DOM element where the scene will take place.
  > @param definition (object) - Base definition for the scene, including one or more layers with both properties, filters, and components as shown below under "JSON definition".
  > @param rootElement (DOM element) - DOM element where scene displays layers.
  > @return scene - returns the new scene composed of the provided layers.
- **trigger** - This method is used by external objects to trigger messages on the layers as well as internal entities broadcasting messages across the scope of the scene.
  > @param messageId (string) - This is the message to process.
  > @param value (variant) - This is a message object or other value to pass along to component functions.
- **destroy** - This method destroys all the layers in the scene.

## JSON Definition:
    {
      "layers":[
      // Required array listing the entities that should be loaded as scene layers. These can be actual entity JSON definitions as shown in [[Entity]] or references to entities by using the following specification.

        {
          "type": "entity-id",
          // This value maps to an entity definition with a matching "id" value as shown in [[Entity]] and will load that definition.
          
          "properties":{"x": 400}
          // Optional. If properties are passed in this reference, they override the entity definition's properties of the same name.
        }
      ]
    }
*/
platformer.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers,
		supportedLayer = true,
		layerDefinition = false,
		properties = false;
		this.rootElement = rootElement;
		this.layers = [];
		for(var layer in layers){
			layerDefinition = layers[layer];
			properties = {rootElement: this.rootElement};
			if (layerDefinition.properties){
				for(i in layerDefinition.properties){
					properties[i] = layerDefinition.properties[i];
				}
			}

			if(layerDefinition.type){ // this layer should be loaded from an entity definition rather than this instance
				layerDefinition = platformer.settings.entities[layerDefinition.type];
			}
			
			supportedLayer = true;
			if(layerDefinition.filter){
				if(layerDefinition.filter.includes){
					supportedLayer = false;
					for(var filter in layerDefinition.filter.includes){
						if(platformer.settings.supports[layerDefinition.filter.includes[filter]]){
							supportedLayer = true;
						}
					}
				}
				if(layerDefinition.filter.excludes){
					for(var filter in layerDefinition.filter.excludes){
						if(platformer.settings.supports[layerDefinition.filter.excludes[filter]]){
							supportedLayer = false;
						}
					}
				}
			}
			if (supportedLayer){
				this.layers.push(new platformer.classes.entity(layerDefinition, {
					properties: properties
				}));
			}
		}
		
		this.time = new Date().getTime();
		this.timeElapsed = {
			name: '',
			time: 0
		};
	};
	var proto = scene.prototype;
	
	proto.trigger = function(eventId, event){
		var time = 0;
		if(eventId === 'tick'){
			time = new Date().getTime();
			this.timeElapsed.name = 'Non-Engine';
			this.timeElapsed.time = time - this.time;
			this.trigger('time-elapsed', this.timeElapsed);
			this.time = time;
		}
		for(var layer in this.layers){
			this.layers[layer].trigger(eventId, event);
		}
		if(eventId === 'tick'){
			time = new Date().getTime();
			this.timeElapsed.name = 'Engine Total';
			this.timeElapsed.time = time - this.time;
			this.trigger('time-elapsed', this.timeElapsed);
			this.time = time;
		}
	};
	
	proto.destroy = function(){
		for(var layer in this.layers){
			this.layers[layer].destroy();
		}
		this.layers.length = 0;
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
		this.prevAABB = undefined;
		
		var width = 0;
		var height = 0; 
		switch (this.type)
		{
		case 'rectangle': //need TL and BR points
		case 'circle': //need TL and BR points
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
					width = this.points[1][0] - this.points[0][0];
					height = this.points[2][1] - this.points[0][1];
				} else {
					//BOTTOM RIGHT CORNER IS RIGHT
					this.subType = 'br';
					width = this.points[0][0] - this.points[1][0];
					height = this.points[0][1] - this.points[2][1];
				}
				
			} else if (this.points[0][1] == this.points[2][1] && this.points[0][0] == this.points[1][0]) {
				if (this.points[0][1] < this.points[1][1])
				{
					//TOP RIGHT CORNER IS RIGHT
					this.subType = 'tr';
					width = this.points[0][0] - this.points[2][0];
					height = this.points[1][1] - this.points[0][1];
				} else {
					//BOTTOM LEFT CORNER IS RIGHT
					this.subType = 'bl';
					width = this.points[2][0] - this.points[0][0];
					height = this.points[0][1] - this.points[1][1];
				}
			} 
		}
		
		this.aABB     = new platformer.classes.aABB(this.x, this.y, width, height);
		this.prevAABB = new platformer.classes.aABB(this.x, this.y, width, height);
	};
	var proto = collisionShape.prototype;
	
	proto.update = function(x, y){
		var swap = this.prevAABB; 
		this.prevAABB = this.aABB;
		this.aABB     = swap;
		this.prevX = this.x;
		this.prevY = this.y;
		this.x = x + this.offset[0];
		this.y = y + this.offset[1];
		this.aABB.move(this.x, this.y);
	};
	
	proto.reset = function (x, y) {
		this.prevX = x + this.offset[0];
		this.prevY = y + this.offset[1];
		this.x = x + this.offset[0];
		this.y = y + this.offset[1];
		this.prevAABB.move(this.x, this.y);
		this.aABB.move(this.x, this.y);
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
	
	proto.getPreviousAABB = function(){
		return this.prevAABB;
	};
	
	proto.getXOffset = function(){
		return this.offset[0];
	};
	
	proto.getYOffset = function(){
		return this.offset[1];
	};
	
	proto.destroy = function(){
		this.aABB = undefined;
		this.points = undefined;
	};
	
	return collisionShape;
})();

/*--------------------------------------------------
 *   AABB - ../src/js/aabb.js
 */
platformer.classes.aABB = (function(){
	var aABB = function(x, y, width, height){
		this.setAll(x, y, width, height);
	};
	var proto = aABB.prototype;
	
	proto.setAll = function(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width  = width || 0;
		this.height = height || 0;
		this.halfWidth = this.width / 2;
		this.halfHeight = this.height / 2;
		if(typeof x === 'undefined'){
			this.left = undefined;
			this.right = undefined;
		} else {
			this.left = -this.halfWidth + this.x;
			this.right = this.halfWidth + this.x;
		}
		if(typeof y === 'undefined'){
			this.top = undefined;
			this.bottom = undefined;
		} else {
			this.top = -this.halfHeight + this.y;
			this.bottom = this.halfHeight + this.y;
		}
	};
	
	proto.reset = function(){
		this.setAll(undefined, undefined, 0, 0);
	};
	
	proto.include = function(aabb){
		if((this.left > aabb.left)     || (typeof this.left === 'undefined')){
			this.left = aabb.left;
		}
		if((this.right < aabb.right)   || (typeof this.right === 'undefined')){
			this.right = aabb.right;
		}
		if((this.top > aabb.top)       || (typeof this.top === 'undefined')){
			this.top = aabb.top;
		}
		if((this.bottom < aabb.bottom) || (typeof this.bottom === 'undefined')){
			this.bottom = aabb.bottom;
		}
		
		this.width      = this.right  - this.left;
		this.height     = this.bottom - this.top;
		this.halfWidth  = this.width / 2;
		this.halfHeight = this.height / 2;
		this.x          = this.left + this.halfWidth;
		this.y          = this.top  + this.halfHeight;
	};
	
	proto.move = function(x, y){
		if(!x){
			var s = 56;
		}
		
		this.x = x;
		this.y = y;
		this.left   = -this.halfWidth + this.x;
		this.right  = this.halfWidth + this.x;
		this.top    = -this.halfHeight + this.y;
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
 *   enable-ios-audio - ../src/js/standard-components/enable-ios-audio.js
 */
/**
# COMPONENT **enable-ios-audio**
This component enables JavaScript-triggered audio play-back on iOS devices by overlaying an invisible `div` across the game area that, when touched, causes the audio track to play, giving it necessary permissions for further programmatic play-back. Once touched, it removes itself as a component from the entity as well as removes the layer `div` DOM element.

## Dependencies:
- [createjs.SoundJS] [link1] - This component requires the SoundJS library to be included for audio functionality.
- **rootElement** property (on entity) - This component requires a DOM element which it uses to overlay the touchable audio-instantiation layer `div`.

## JSON Definition:
    {
      "type": "enable-ios-audio",
      
      "audioId": "combined"
      // Required. The SoundJS audio id for the audio clip to be enabled for future play-back.
    }

[link1]: http://www.createjs.com/Docs/SoundJS/module_SoundJS.html
*/
platformer.components['enable-ios-audio'] = (function(){
	var iOSAudioEnabled = false,
	component = function(owner, definition){
		var self = this;
		
		this.owner = owner;
		
		if(!iOSAudioEnabled){
			this.touchOverlay = document.createElement('div');
			this.touchOverlay.style.width    = '100%';
			this.touchOverlay.style.height   = '100%';
			this.touchOverlay.style.position = 'absolute';
			this.touchOverlay.style.zIndex   = '20';
			this.owner.rootElement.appendChild(this.touchOverlay);
			enableIOSAudio(this.touchOverlay, definition.audioId, function(){
				self.removeComponent();
			});
		} else {
			this.removeComponent();
		}
	},
	enableIOSAudio  = function(element, audioId, functionCallback){
		var callback = false,
	    click        = false;
		
		iOSAudioEnabled = true;
		click = function(e){
			var cjsAudio = createjs.SoundJS.play(audioId),
			audio        = cjsAudio.tag,
			forceStop    = function () {
			    audio.removeEventListener('play', forceStop, false);
			    audio.pause();
			},
			progress  = function () {
			    audio.removeEventListener('canplaythrough', progress, false);
			    if (callback) callback();
			};
			
			if(cjsAudio.playState === 'playSucceeded'){
				cjsAudio.stop();
			} else {
				audio.addEventListener('play', forceStop, false);
			    audio.addEventListener('canplaythrough', progress, false);

			    try {
					audio.play();
			    } catch (e) {
			    	callback = function () {
			    		callback = false;
			    		audio.play();
			    	};
			    }
			}
			element.removeEventListener('touchstart', click, false);
			if(functionCallback){
				functionCallback();
			}
		};
		element.addEventListener('touchstart', click, false);
	},
	proto = component.prototype;
	
	proto.removeComponent = function(){
		this.owner.removeComponent(this);
	};
	
	proto.destroy = function(){
		this.owner.rootElement.removeChild(this.touchOverlay);
		this.touchOverlay = undefined;
	};
	
	return component;
})();


/*--------------------------------------------------
 *   handler-controller - ../src/js/standard-components/handler-controller.js
 */
platformer.components['handler-controller'] = (function(){
	var relayUpDown = function(event, self){
		return function(value){
			if (value.released){
				event += ':up';
			} else if (value.pressed){
				event += ':down';
			}
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event, value);
			}
		}; 
	},
	relay = function(event, self){
		return function(value){
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event, value);
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
		
		this.addListeners(['tick', 'child-entity-added', 'check-inputs', 'keydown', 'keyup']);
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
	
	proto['tick'] = proto['check-inputs'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('handle-controller'))	
			{
				this.entities.splice(x, 1);
			}
		}
	};

	proto['child-entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'handle-controller')
			{
				// Check for custom input messages that should be relayed from scene.
				if(entity.controlMap){
					for(var y in entity.controlMap){
						if((y.indexOf('key:') < 0) || (y.indexOf('mouse:') < 0)){
							if(!this[y]){
								this.addListeners([y, y + ':up', y + ':down']);
								this[y]           = relayUpDown(y,     this);
								this[y + ':up']   = relay(y + ':up',   this);
								this[y + ':down'] = relay(y + ':down', this);
							}
						}
					}
				}
				
				this.entities.push(entity);
				entity.trigger('controller-load');
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   tiled-loader - ../src/js/standard-components/tiled-loader.js
 */
/**
# COMPONENT **tiled-loader**
This component is attached to a top-level entity (loaded by the [[Scene]]) and, once its peer components are loaded, ingests a JSON file exported from the [Tiled map editor] [link1] and creates the tile maps and entities. Once it has finished loading the map, it removes itself from the list of components on the entity.

## Dependencies:
- Component [[Entity-Container]] (on entity's parent) - This component uses `entity.addEntity()` on the entity, provided by `entity-container`.
- Entity **collision-layer** - Used to create map entities corresponding with Tiled collision layers.
- Entity **render-layer** - Used to create map entities corresponding with Tiled render layers.
- Entity **tile-layer** - Used to create map entities corresponding with Tiled collision and render layers.

## Messages

### Listens for:
- **load** - On receiving this message, the component commences loading the Tiled map JSON definition. Once finished, it removes itself from the entity's list of components.

### Local Broadcasts:
- **world-loaded** - Once finished loading the map, this message is triggered on the entity to notify other components of completion.
  > @param message.width (number) - The width of the world in world units.
  > @param message.height (number) - The height of the world in world units.
  > @param message.camera ([[Entity]]) - If a camera property is found on one of the loaded entities, this property will point to the entity on load that a world camera should focus on.

## JSON Definition:
    {
      "type": "tiled-loader",
      
      "level": "level-4",
      // Required. Specifies the JSON level to load.
      
      "unitsPerPixel": 10,
      // Optional. Sets how many world units in width and height correspond to a single pixel in the Tiled map. Default is 1: One pixel is one world unit.
      
      "images": ["spritesheet-1", "spritesheet-2"],
      // Optional. If specified, the referenced images are used as the game spritesheets instead of the images referenced in the Tiled map. This is useful for using different or better quality art from the art used in creating the Tiled map.
      
      "imagesScale": 5,
      // Optional. If images are set above, this property sets the scale of the art relative to world coordinates. Defaults to the value set in "unitsPerPixel".
      
      "zStep": 500
      // Optional. Adds step number to each additional Tiled layer to maintain z-order. Defaults to 1000.
    }

[link1]: http://www.mapeditor.org/
*/
platformer.components['tiled-loader'] = (function(){
	var component = function(owner, definition){
		this.owner        = owner;
		this.entities     = [];
		this.layerZ       = 0;
		this.followEntity = false;
		this.listeners    = [];

		this.level = platformer.settings.levels[this.owner.level || definition.level];

		this.unitsPerPixel = this.owner.unitsPerPixel || definition.unitsPerPixel || 1;
		this.images        = this.owner.images        || definition.images        || false;
		this.imagesScale   = this.owner.imagesScale   || definition.imagesScale   || this.unitsPerPixel;
		this.layerZStep    = this.owner.zStep         || definition.zStep         || 1000;

		// Messages that this component listens for
		this.addListeners(['load']);
	},
	proto = component.prototype; 

	proto['load'] = function(){
		var actionLayer = 0;
		
		for(; actionLayer < this.level.layers.length; actionLayer++){
			this.setupLayer(this.level.layers[actionLayer], this.level);
		}
		this.owner.trigger('world-loaded', {
			width:  this.level.width  * this.level.tilewidth  * this.unitsPerPixel,
			height: this.level.height * this.level.tileheight * this.unitsPerPixel,
			camera: this.followEntity
		});
		this.owner.removeComponent(this);
	};
	
	proto.setupLayer = function(layer, level){
		var width      = layer.width,
		height         = layer.height,
		images         = this.images || [],
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
		layerCollides  = true,
		numberProperty = false;

		if(images.length == 0){
			for (x = 0; x < tilesets.length; x++){
				if(platformer.assets[tilesets[x].name]){ // Prefer to have name in tiled match image id in game
					images.push(platformer.assets[tilesets[x].name]);
				} else {
					images.push(tilesets[x].image);
				}
			}
		} else {
			images = images.slice(); //so we do not overwrite settings array
			for (x = 0; x < images.length; x++){
				if(platformer.assets[images[x]]){
					images[x] = platformer.assets[images[x]];
				}
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
					entity = 'render-layer';
					break;
				case "foreground":
					entity = 'render-layer';
					break;
				case "collision":
					entity = 'collision-layer';
					break;
				case "action":
					for (x = 0; x < level.layers.length; x++){
						if(level.layers[x].name === 'collision'){
							layerCollides = false;
						}
					}
					if(!layerCollides){
						entity = 'render-layer';
					}
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
			tileDefinition.properties.scaleX     = this.imagesScale;
			tileDefinition.properties.scaleY     = this.imagesScale;
			tileDefinition.properties.layerZ     = this.layerZ;
			tileDefinition.properties.z    		 = this.layerZ;
			
			
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
							width:  tileWidth * this.unitsPerPixel / this.imagesScale,
							height: tileHeight * this.unitsPerPixel / this.imagesScale
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
					properties = {};
					//Copy properties from Tiled

					if(tileset.tileproperties[entity.gid - tileset.firstgid]){
						for (x in tileset.tileproperties[entity.gid - tileset.firstgid]){
							//This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
							numberProperty = parseFloat(tileset.tileproperties[entity.gid - tileset.firstgid][x]);
							if (numberProperty == 0 || (!!numberProperty))
							{
								properties[x] = numberProperty;
							} else if(tileset.tileproperties[entity.gid - tileset.firstgid][x] == 'true') {
								properties[x] = true;
							} else if(tileset.tileproperties[entity.gid - tileset.firstgid][x] == 'false') {
								properties[x] = false;
							} else {
								properties[x] = tileset.tileproperties[entity.gid - tileset.firstgid][x];
							}
						}
					}
					
					for (x in entity.properties){
						//This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
					    numberProperty = parseFloat(entity.properties[x]);
						if (numberProperty == 0 || (!!numberProperty))
						{
							properties[x] = numberProperty;
						} else if(entity.properties[x] == 'true') {
							properties[x] = true;
						} else if(entity.properties[x] == 'false') {
							properties[x] = false;
						} else {
							properties[x] = entity.properties[x];
						}
					}
					properties.width  = (entity.width  || tileWidth)  * this.unitsPerPixel;
					properties.height = (entity.height || tileHeight) * this.unitsPerPixel;
					properties.x = entity.x * this.unitsPerPixel + (properties.width / 2);
					properties.y = entity.y * this.unitsPerPixel;
					properties.scaleX = this.unitsPerPixel;
					properties.scaleY = this.unitsPerPixel;
					properties.layerZ = this.layerZ;
					//Setting the z value. All values are getting added to the layerZ value.
					if (properties.z) {
						properties.z += this.layerZ;
					} else if (entityType && platformer.settings.entities[entityType] && platformer.settings.entities[entityType].properties.z) {
						properties.z = this.layerZ + platformer.settings.entities[entityType].properties.z;
					} else {
						properties.z = this.layerZ;
					}
					
					entity = this.owner.addEntity(new platformer.classes.entity(platformer.settings.entities[entityType], {properties:properties}));
					if(entity){
						if(entity.camera){
							this.followEntity = {entity: entity, mode: entity.camera}; //used by camera
						}
					}
				}
			}
		}
		this.layerZ += this.layerZStep;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   handler-render-createjs - ../src/js/standard-components/handler-render-createjs.js
 */
platformer.components['handler-render-createjs'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['tick', 'child-entity-added', 'render', 'camera-update']);
		
		this.canvas = this.owner.canvas = document.createElement('canvas');
		this.owner.rootElement.appendChild(this.canvas);
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.width  = 320;
		this.canvas.height = 240;
		
		this.stage = new createjs.Stage(this.canvas);
		
		this.camera = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			buffer: definition.buffer || 0
		};
		this.firstChild = undefined;
	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if ((messageIds[x] == 'handle-render') || (messageIds[x] == 'handle-render-load')){
				this.entities.push(entity);
				entity.trigger('handle-render-load', {
					stage: self.stage,
					parentElement: self.owner.rootElement
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		var child = undefined;
		
		for (var x = this.entities.length - 1; x > -1; x--){
			if(!this.entities[x].trigger('handle-render', resp))
			{
				this.entities.splice(x, 1);
			}
		}
		for (var x = this.stage.children.length - 1; x > -1; x--){
			child = this.stage.children[x];
			if(child.name !== 'entity-managed'){
				if((child.x >= this.camera.x - this.camera.buffer) && (child.x <= this.camera.x + this.camera.width + this.camera.buffer) && (child.y >= this.camera.y - this.camera.buffer) && (child.y <= this.camera.y + this.camera.height + this.camera.buffer)){
					if(!child.visible) child.visible = true;
				} else {
					if(child.visible) child.visible = false;
				}
			}
		}
		
		if (this.stage.getChildAt(0) !== this.firstChild)
		{
			this.stage.sortChildren(function(a, b) {
				return a.z - b.z;
			});
			this.firstChild = this.stage.getChildAt(0);
		}
		this.stage.update();
	};
	
	proto['camera-update'] = function(cameraInfo){
		this.camera.x = cameraInfo.viewportLeft;
		this.camera.y = cameraInfo.viewportTop;
		this.camera.width = cameraInfo.viewportWidth;
		this.camera.height = cameraInfo.viewportHeight;
		if(!this.camera.buffer){
			this.camera.buffer = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
		}
		
		this.canvas.width  = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		this.stage.setTransform(-cameraInfo.viewportLeft * cameraInfo.scaleX, -cameraInfo.viewportTop * cameraInfo.scaleY, cameraInfo.scaleX, cameraInfo.scaleY);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   handler-render-dom - ../src/js/standard-components/handler-render-dom.js
 */
platformer.components['handler-render-dom'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['tick', 'child-entity-added', 'render']);
		
		this.element = this.owner.element = document.createElement('div');
		this.owner.rootElement.appendChild(this.element);
		this.element.style.position = 'absolute';
		this.element.style.width = '100%';
		this.element.style.height = '100%';
	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if ((messageIds[x] == 'handle-render') || (messageIds[x] == 'handle-render-load')){
				this.entities.push(entity);
				entity.trigger('handle-render-load', {
					element: self.element
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('handle-render', resp))
			{
				this.entities.splice(x, 1);
			}
			
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.owner.rootElement.removeChild(this.element);
		this.element = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   handler-ai - ../src/js/standard-components/handler-ai.js
 */
platformer.components['handler-ai'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['child-entity-added', 'tick']);  
		
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'handle-ai')
			{
				this.entities.push(entity);
				break;
			}
		}
	};

	proto['tick'] = function(obj){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('handle-ai', obj))
			{
				this.entities.splice(x, 1);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   handler-logic - ../src/js/standard-components/handler-logic.js
 */
platformer.components['handler-logic'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners(['tick', 'camera-update', 'child-entity-added', 'logic']);  
		
		this.stepLength    = definition.stepLength || 15;
		this.leftoverTime = 0;
		this.maximumStepsPerTick = 10; //Math.ceil(500 / this.stepLength);
		this.camera = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			buffer: definition.buffer || 0
		};
		this.message = {
			deltaT: this.stepLength,
			camera: this.camera
		};
		this.timeElapsed = {
			name: 'Logic',
			time: 0
		};
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'handle-logic')
			{
				this.entities.push(entity);
				break;
			}
		}
	};

	proto['camera-update'] = function(camera){
		this.camera.left = camera.viewportLeft;
		this.camera.top = camera.viewportTop;
		this.camera.width = camera.viewportWidth;
		this.camera.height = camera.viewportHeight;
		if(!this.camera.buffer){
			this.camera.buffer = this.camera.width / 4; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
		}
	};

	proto['tick'] = proto['logic'] = function(resp){
		var cycles = 0,
		child   = undefined,
		time    = new Date().getTime();
		this.leftoverTime += resp.deltaT;
		cycles = Math.floor(this.leftoverTime / this.stepLength);

		// This makes the frames smoother, but adds variance into the calculations
		this.message.deltaT = this.leftoverTime / cycles;
		this.leftoverTime = 0;
//		this.leftoverTime -= (cycles * this.stepLength);

		//Prevents game lockdown when processing takes longer than time alotted.
		cycles = Math.min(cycles, this.maximumStepsPerTick);
		
		for(var i = 0; i < cycles; i++){
			for (var x = this.entities.length - 1; x > -1; x--)
			{
				child = this.entities[x];
				if((typeof child.x === 'undefined') || ((child.x >= this.camera.left - this.camera.buffer) && (child.x <= this.camera.left + this.camera.width + this.camera.buffer) && (child.y >= this.camera.top - this.camera.buffer) && (child.y <= this.camera.top + this.camera.height + this.camera.buffer))){
					if(!child.trigger('handle-logic', this.message)){
						this.entities.splice(x, 1);
					}
				}
			}
			this.timeElapsed.name = 'Logic';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;
			
			this.owner.trigger('check-collision-group', this.message); // If a collision group is attached, make sure collision is processed on each logic tick.
			this.timeElapsed.name = 'Collision';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;
		}

		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   camera - ../src/js/standard-components/camera.js
 */
/**
# COMPONENT **camera**
This component maintains the current viewport location and size with regards to both the game world coordinates and the screen coordinates.

## Dependencies:
- **rootElement** property (on entity) - This component requires a DOM element which it uses as the "window" determining the camera's aspect ratio and size.

## Messages

### Listens for:
- **tick, camera** - On a `tick` or `camera` step message, the camera updates its location according to its current state.
  > @param message.deltaT - If necessary, the current camera update function may require the length of the tick to adjust movement rate.
- **follow** - On receiving this message, the camera begins following the requested object.
  > @param message.mode (string) - Required. Can be "locked", "bounding", or "static". "static" suspends following, but the other two settings require that the entity parameter be defined. Also set the bounding area parameters if sending "bounding" as the following method.
  > @param message.entity ([[Entity]]) - The entity that the camera should commence following.
  > @param message.top (number) - The top of a bounding box following an entity.
  > @param message.left (number) - The left of a bounding box following an entity.
  > @param message.width (number) - The width of a bounding box following an entity.
  > @param message.height (number) - The height of a bounding box following an entity.
- **resize, orientationchange** - The camera listens for these events passed along from [[Game]] (who receives them from `window`). It adjusts the camera viewport according to the new size and position of the window.
- **world-loaded** - On receiving this message, the camera updates its world location and size as necessary. An example of this message is triggered by the [[Tiled-Loader]] component.
  > @param message.width (number) - Optional. The width of the loaded world.
  > @param message.height (number) - Optional. The height of the loaded world.
  > @param message.camera ([[Entity]]) - Optional. An entity that the camera should follow in the loaded world.
- **child-entity-added** - If children entities are listening for a `camera-update` message, they are added to an internal list.
  > @param message ([[Entity]]} - Expects an entity as the message object to determine whether to trigger `camera-update` on it.
- **child-entity-removed** - If children are removed from the entity, they are also removed from this component.
  > @param message ([[Entity]]} - Expects an entity as the message object to determine the entity to remove from its list.

### Child Broadcasts:
- **camera-update** - This component fires this message when the position of the camera in the world has changed.
  > @param message.viewportTop (number) - The top of the camera viewport in world coordinates.
  > @param message.viewportLeft (number) - The left of the camera viewport in world coordinates.
  > @param message.viewportWidth (number) - The width of the camera viewport in world coordinates.
  > @param message.viewportHeight (number) - The height of the camera viewport in world coordinates.
  > @param message.scaleX (number) - Number of window pixels that comprise a single world coordinate on the x-axis.
  > @param message.scaleY (number) - Number of window pixels that comprise a single world coordinate on the y-axis.

### Local Broadcasts:
- **camera-update** - This component fires this message when the position of the camera in the world has changed or if the window has been resized.
  > @param message.viewportTop (number) - The top of the camera viewport in world coordinates.
  > @param message.viewportLeft (number) - The left of the camera viewport in world coordinates.
  > @param message.viewportWidth (number) - The width of the camera viewport in world coordinates.
  > @param message.viewportHeight (number) - The height of the camera viewport in world coordinates.
  > @param message.scaleX (number) - Number of window pixels that comprise a single world coordinate on the x-axis.
  > @param message.scaleY (number) - Number of window pixels that comprise a single world coordinate on the y-axis.

## JSON Definition:
    {
      "type": "camera",
      
      "top": 100,
      // Optional number specifying top of viewport in world coordinates
      
      "left": 100,
      // Optional number specifying left of viewport in world coordinates
      
      "width": 100,
      // Optional number specifying width of viewport in world coordinates
      
      "height": 100,
      // Optional number specifying height of viewport in world coordinates
      
      "stretch": true,
      // Optional boolean value that determines whether the camera should stretch the world viewport when window is resized. Defaults to false which maintains the proper aspect ratio.
      
      "scaleWidth": 480
      // Optional. Sets the size in window coordinates at which the world zoom should snap to a larger multiple of pixel size (1,2, 3, etc). This is useful for maintaining a specific game pixel viewport width on pixel art games so pixels use multiples rather than smooth scaling. Default is 0 which causes smooth scaling of the game world in a resizing viewport.
    }
*/
platformer.components['camera'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// on resize should the view be stretched or should the world's initial aspect ratio be maintained?
		this.stretch = definition.stretch || false;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners(['tick', 'camera', 'follow', 'resize', 'orientationchange', 'world-loaded', 'child-entity-added', 'child-entity-removed']);
		
		//The dimensions of the camera in the window
		this.window = {
			viewportTop: this.owner.rootElement.innerTop,
			viewportLeft: this.owner.rootElement.innerLeft,
			viewportWidth: this.owner.rootElement.offsetWidth,
			viewportHeight: this.owner.rootElement.offsetHeight
		};
		
		//The dimensions of the camera in the game world
		this.world = {
			viewportWidth:       definition.width       || 0,
			viewportHeight:      definition.height      || 0,
			viewportLeft:        definition.left        || 0,
			viewportTop:         definition.top         || 0
		};
		
		this.message = { //defined here so it can be reused
			viewportWidth:  0,
			viewportHeight: 0,
			viewportLeft:   0,
			viewportTop:    0,
			scaleX: 0,
			scaleY: 0
		};

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
		this.bBBorderX = 0;
		this.bBBorderY = 0;
		this.bBInnerWidth = this.world.viewportWidth - (2 * this.bBBorderX);
		this.bBInnerHeight = this.world.viewportHeight - (2 * this.bBBorderY);
		
		
		this.direction = true;  
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'camera-update')
			{
				this.entities.push(entity);
				break;
			}
		}
	};
	
	proto['child-entity-removed'] = function(entity){
		var x = 0;

		for (x in this.entities) {
			if(this.entities[x] === entity){
				this.entities.splice(x, 1);
				break;
			}
		}
	};
	
	proto['world-loaded'] = function(values){
		this.worldWidth   = this.owner.worldWidth  = values.width;
		this.worldHeight  = this.owner.worldHeight = values.height;
		if(values.camera){
			this.follow(values.camera);
		}
	};
	
	proto['tick'] = proto['camera'] = function(resp){
		var deltaT = resp.deltaT,
		broadcastUpdate = false;
		
		switch (this.state)
		{
		case 'following':
			broadcastUpdate = this.followingFunction(this.following);
			break;
		case 'roaming': //TODO: remove or change this test code, since it currently just goes left to right - DDD
			var speed = .3 * deltaT;
			if (this.direction)
			{
				this.move(this.world.viewportLeft + speed, this.world.viewportTop);
				if (this.worldWidth && (this.world.viewportLeft == this.worldWidth - this.world.viewportWidth)) {
					this.direction = !this.direction;
				}
			} else {
				this.move(this.world.viewportLeft - speed, this.world.viewportTop);
				if (this.worldWidth && (this.world.viewportLeft == 0)) {
					this.direction = !this.direction;
				}
			}
			broadcastUpdate = true;
			break;
		case 'static':
		default:
			break;
		}
		
		if(broadcastUpdate || this.windowResized){
			this.message.viewportLeft   = this.world.viewportLeft;
			this.message.viewportTop    = this.world.viewportTop;
			this.message.viewportWidth  = this.world.viewportWidth;
			this.message.viewportHeight = this.world.viewportHeight;
			this.message.scaleX         = this.windowPerWorldUnitWidth;
			this.message.scaleY         = this.windowPerWorldUnitHeight;

			this.windowResized = false;
			this.owner.trigger('camera-update', this.message);

			if(broadcastUpdate){
				for (var x = this.entities.length - 1; x > -1; x--)
				{
					if(!this.entities[x].trigger('camera-update', this.message)){
						this.entities.splice(x, 1);
					}
				}
			}
		}
	};
	
	proto['resize'] = proto['orientationchange'] = function ()
	{
		//The dimensions of the camera in the window
		this.window.viewportTop = this.owner.rootElement.innerTop;
		this.window.viewportLeft = this.owner.rootElement.innerLeft;
		this.window.viewportWidth = this.owner.rootElement.offsetWidth;
		this.window.viewportHeight = this.owner.rootElement.offsetHeight;

		if(this.scaleWidth){
			this.world.viewportWidth = this.window.viewportWidth / Math.ceil(this.window.viewportWidth / this.scaleWidth);
		}
		
		if(!this.stretch || this.scaleWidth){
			this.world.viewportHeight = this.window.viewportHeight * this.world.viewportWidth / this.window.viewportWidth;
		}
		
		this.worldPerWindowUnitWidth  = this.world.viewportWidth / this.window.viewportWidth;
		this.worldPerWindowUnitHeight = this.world.viewportHeight / this.window.viewportHeight;
		this.windowPerWorldUnitWidth  = this.window.viewportWidth / this.world.viewportWidth;
		this.windowPerWorldUnitHeight = this.window.viewportHeight/ this.world.viewportHeight;
		
		this.windowResized = true;
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
		case 'static':
		default:
			this.state = 'static';
			this.following = undefined;
			this.followingFunction = undefined;
			break;
		}
		
	};
	
	proto.move = function (newLeft, newTop){
		var moved = this.moveLeft(newLeft);
		moved = this.moveTop(newTop) || moved;
		return moved;
	};
	
	proto.moveLeft = function (newLeft)	{
		if(this.world.viewportLeft !== newLeft){
			if (this.worldWidth < this.world.viewportWidth){
				this.world.viewportLeft = (this.worldWidth - this.world.viewportWidth) / 2;
			} else if (this.worldWidth && (newLeft + this.world.viewportWidth > this.worldWidth)) {
				this.world.viewportLeft = this.worldWidth - this.world.viewportWidth;
			} else if (this.worldWidth && (newLeft < 0)) {
				this.world.viewportLeft = 0; 
			} else {
				this.world.viewportLeft = newLeft;
			}
			return true;
		}
		return false;
	};
	
	proto.moveTop = function (newTop) {
		if(this.world.viewportTop !== newTop){
			if (this.worldHeight < this.world.viewportHeight){
				this.world.viewportTop = (this.worldHeight - this.world.viewportHeight) / 2;
			} else if (this.worldHeight && (newTop + this.world.viewportHeight > this.worldHeight)) {
				this.world.viewportTop = this.worldHeight - this.world.viewportHeight;
			} else if (this.worldHeight && (newTop < 0)) {
				this.world.viewportTop = 0; 
			} else {
				this.world.viewportTop = newTop;
			}
			return true;
		}
		return false;
	};
	
	
	proto.lockedFollow = function (entity)
	{
		return this.move(entity.x - (this.world.viewportWidth / 2), entity.y - (this.world.viewportHeight / 2));
	};
	
	proto.setBoundingArea = function (top, left, width, height)
	{
		this.bBBorderY = (typeof top !== 'undefined') ? top : 500;
		this.bBBorderX = (typeof left !== 'undefined') ? left : 500;
		this.bBInnerWidth = (typeof width !== 'undefined') ? width : this.world.viewportWidth - (2 * this.bBBorderX);
		this.bBInnerHeight = (typeof height !== 'undefined') ? height : this.world.viewportHeight - (2 * this.bBBorderY);
	};
	
	proto.boundingFollow = function (entity)
	{
		var newLeft = undefined;
		var newTop = undefined;
		
		if (entity.x > this.world.viewportLeft + this.bBBorderX + this.bBInnerWidth) 
		{
			newLeft = entity.x -(this.bBBorderX + this.bBInnerWidth);
		} else if (entity.x < this.world.viewportLeft + this.bBBorderX) {
			newLeft = entity.x - this.bBBorderX;
		}
		
		if (entity.y > this.world.viewportTop + this.bBBorderY + this.bBInnerHeight) 
		{
			newTop = entity.y - (this.bBBorderY + this.bBInnerHeight);
		} else if (entity.y < this.world.viewportTop + this.bBBorderY) {
			newTop = entity.y - this.bBBorderY;
		}
		
		if (typeof newLeft !== 'undefined')
		{
			newLeft = this.moveLeft(newLeft);
		}
		
		if (typeof newTop !== 'undefined')
		{
			newTop = this.moveTop(newTop);
		}
		
		return newLeft || newTop;
	};
	
	proto.windowToWorld = function (sCoords)
	{
		var wCoords = [];
		wCoords[0] = Math.round((sCoords[0] - this.window.viewportLeft) * this.worldPerWindowUnitWidth);
		wCoords[1] = Math.round((sCoords[1] - this.window.viewportTop)  * this.worldPerWindowUnitHeight);
		return wCoords; 
	};
	
	proto.worldToWindow = function (wCoords)
	{
		var sCoords = [];
		sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.window.viewportLeft);
		sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.window.viewportTop);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   collision-group - ../src/js/standard-components/collision-group.js
 */
/**
 * Uses 'entity-container' component messages if triggered to add to its collision list;
 * also listens for explicit add/remove messages (useful in the absence of 'entity-container'). - DDD
 */
platformer.components['collision-group'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners([
		    'child-entity-added',   'add-collision-entity',
		    'child-entity-removed', 'remove-collision-entity',
		    'check-collision-group','relocate-group'
		]);  
		//this.toResolve = [];
		
		var self = this;
		this.owner.getCollisionGroup = function(){
			return self.entities;
		};
		this.owner.getCollisionGroupAABB = function(){
			return self.getAABB();
		};
		this.owner.getPreviousCollisionGroupAABB = function(){
			return self.getPreviousAABB();
		};
		
		this.entities = [];
		this.entitiesByType = {};
		this.entitiesLive = [];
		this.entitiesByTypeLive = {};
		this.terrain = undefined;
		this.aabb     = new platformer.classes.aABB(this.owner.x, this.owner.y);
		this.prevAABB = new platformer.classes.aABB(this.owner.x, this.owner.y);
		this.lastX = this.owner.x;
		this.lastY = this.owner.y;
		
		this.cameraLogicAABB = new platformer.classes.aABB(0, 0);
		this.cameraCollisionAABB = new platformer.classes.aABB(0, 0);
		
		this.unitStepSize = 1;

		//defined here so we aren't continually recreating new arrays
		this.collisionGroups = [];
		this.triggerMessages = [];
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = proto['add-collision-entity'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		if ((entity.type == 'tile-layer') || (entity.type == 'collision-layer')) { //TODO: probably should have these reference a required function on the obj, rather than an explicit type list since new collision entity map types could be created - DDD
			this.terrain = entity;
		} else {
			for (var x = 0; x < messageIds.length; x++){
				if (messageIds[x] == 'prepare-for-collision'){
					if(!this.entitiesByType[entity.collisionType]){
						this.entitiesByType[entity.collisionType] = [];
						this.entitiesByTypeLive[entity.collisionType] = [];
					}
					this.entities.push(entity);
					this.entitiesByType[entity.collisionType].push(entity);
					break;
				}
			}
		}
	};
	
	proto['child-entity-removed'] = proto['remove-collision-entity'] = function(entity){
		var x = 0;

		for (x in this.entitiesByType[entity.collisionType]) {
			if(this.entitiesByType[entity.collisionType][x] === entity){
				this.entitiesByType[entity.collisionType].splice(x, 1);
				break;
			}
		}
		for (x in this.entities) {
			if(this.entities[x] === entity){
				this.entities.splice(x, 1);
				break;
			}
		}
	};
	
	proto['check-collision-group'] = function(resp){

		if(resp.camera){
			this.cameraLogicAABB.setAll(resp.camera.left + resp.camera.width / 2, resp.camera.top + resp.camera.height / 2, resp.camera.width + resp.camera.buffer * 2, resp.camera.height + resp.camera.buffer * 2);
			this.entitiesLive.length = 0;
			for (var i in this.entities){
				if(this.AABBCollision(this.entities[i].getAABB(), this.cameraLogicAABB)){
					this.entitiesLive.push(this.entities[i]);
				}
			}
			
			this.cameraCollisionAABB.setAll(resp.camera.left + resp.camera.width / 2, resp.camera.top + resp.camera.height / 2, resp.camera.width + resp.camera.buffer * 4, resp.camera.height + resp.camera.buffer * 4);
			for (var i in this.entitiesByType){
				this.entitiesByTypeLive[i].length = 0;
				for (var j in this.entitiesByType[i]){
					if(this.AABBCollision(this.entitiesByType[i][j].getAABB(), this.cameraCollisionAABB)){
						this.entitiesByTypeLive[i].push(this.entitiesByType[i][j]);
					}
				}
			}
		}
		
		if(this.owner.x && this.owner.y){ // is this collision group attached to a collision entity?
			var goalX = this.owner.x - this.lastX,
			goalY     = this.owner.y - this.lastY;
			
			console.log('goalY = ' + goalY + ' = ' + this.owner.y + ' - ' + this.lastY + ' = this.owner.y - this.lastY:');

			this.owner.x = this.lastX;
			this.owner.y = this.lastY;
			this.owner.trigger('prepare-for-collision');
			this.owner.trigger('prepare-for-collision');
		
			this.checkGroupCollisions(resp);
			this.checkSolidCollisions(resp);
	
//			this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);;
			this.aabb.reset();
			for (var x = 0; x < this.entities.length; x++){
				this.aabb.include(((this.entities[x] !== this.owner) && this.entities[x].getCollisionGroupAABB)?this.entities[x].getCollisionGroupAABB():this.entities[x].getAABB());
//				this.entities[x].x += goalX;
//				this.entities[x].y += goalY;
			}
	
			this.owner.x += goalX;
			this.owner.y += goalY;
			
			this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
			this.aabb.move(this.aabb.x + goalX, this.aabb.y + goalY);
	
			this.checkSoftCollisions(resp);
		} else {
			this.checkGroupCollisions(resp);
			this.checkSolidCollisions(resp);
			this.checkSoftCollisions(resp);
		}
	};
	
	proto.getAABB = function(){
		return this.aabb;
	};

	proto.getPreviousAABB = function(){
		return this.prevAABB;
	};

	proto.checkGroupCollisions = function (resp){
		var groups = this.collisionGroups;
		
		groups.length = 0;
		for (var x = 0; x < this.entitiesLive.length; x++){
			if(this.entitiesLive[x] !== this.owner){
				if(this.entitiesLive[x].trigger('check-collision-group', resp)){
					this.entitiesLive[x].collisionUnresolved = true;
					groups.push(this.entitiesLive[x]);
				};
			}
		}

		if(groups.length > 0){
			this.resolveCollisionList(groups, true);
		}
	};

	proto.checkSolidCollisions = function (resp){
		var x    = 0,
		y        = 0,
		entities = this.collisionGroups;
		entities.length = 0;
		
		for (x = this.entitiesLive.length - 1; x > -1; x--)
		{
			if(this.owner !== this.entitiesLive[x]){
				if(this.entitiesLive[x].trigger('prepare-for-collision', resp)){
					if(this.entitiesLive[x].solidCollisions.length > 0){
						this.entitiesLive[x].collisionUnresolved = true;
						entities.push(this.entitiesLive[x]);
					}
/*				} else { // remove the entity because it no longer has a collision handler
					var typeEntities = this.entitiesByType[this.entities[x].collisionType];
					for (y = typeEntities.length - 1; y > -1; y--)
					{
						if(typeEntities[y] === this.entities[x]){
							typeEntities.splice(y, 1);
							break;
						}
					}
					this.entities.splice(x, 1);*/ //temp removed since this line must now find the actual listed entity, not the live entity index
				}
			}
		}
		
		this.resolveCollisionList(entities, false);
	};
	
	proto.resolveCollisionList = function(entities, group){
		for (var x = entities.length - 1; x > -1; x--){
			if(entities[x].collisionUnresolved){
				this.checkSolidEntityCollision(entities[x], group);
				entities[x].collisionUnresolved = false;
			}
		}
	};
	
	proto.checkSolidEntityCollision = function(ent, groupCheck){
		var y = 0,
		z = 0,
		initialX = 0,
		initialY = 0,
		triggerMessages = this.triggerMessages,
		unitStepSize = this.unitStepSize;

		
		/******/
		
		var currentAABB = groupCheck?ent.getCollisionGroupAABB():ent.getAABB();
		var previousAABB = groupCheck?ent.getPreviousCollisionGroupAABB():ent.getPreviousAABB();//ent.getAABB().getCopy().move(ent.getPreviousX() + ent.getShapes()[0].getXOffset(), ent.getPreviousY() + ent.getShapes()[0].getYOffset());
		
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
		var otherEntity = undefined;
		var include = false;
		var entityCollisionGroup = (groupCheck && ent.getCollisionGroup)?ent.getCollisionGroup():false; 

		for (y = 0; y < ent.solidCollisions.length; y++)
		{
			if(this.entitiesByTypeLive[ent.solidCollisions[y]]){
				for(z = 0; z < this.entitiesByTypeLive[ent.solidCollisions[y]].length; z++){
					include = true;
					otherEntity = this.entitiesByTypeLive[ent.solidCollisions[y]][z];
					if(entityCollisionGroup){
						for(var i in entityCollisionGroup){
							if(otherEntity === entityCollisionGroup[i]){
								include = false;
							}
						}
					} else if (otherEntity === ent){
						include = false;
					}
					if(include && (this.AABBCollision(sweepAABB, otherEntity.collisionUnresolved?otherEntity.getPreviousAABB():otherEntity.getAABB()))) {
						potentialsEntities.push(this.entitiesByTypeLive[ent.solidCollisions[y]][z]);
					}
				}
			} else if (this.terrain && (ent.solidCollisions[y] === 'tiles')){
				potentialTiles = this.terrain.getTiles(sweepAABB);
			}
		}
		
		triggerMessages.length = 0;
		
		initialX  = previousAABB.x;//ent.getPreviousX();
		var xPos  = initialX;
		var xGoal = currentAABB.x;//ent.x;
		var xStep  = (xPos < xGoal) ? unitStepSize : -unitStepSize;
		var finalX = undefined; 
		var collisionsX = [];
		var tileCollisionX = undefined;
		var aabbOffsetX = groupCheck?0:(previousAABB.x - ent.getPreviousX());//previousAABB.x - initialX;
		
		initialY  = previousAABB.y;//ent.getPreviousY();
		var yPos  = initialY;
		var yGoal = currentAABB.y;//ent.y;
		var yStep  = (yPos < yGoal) ? unitStepSize : -unitStepSize;
		var finalY = undefined;
		var collisionsY = [];
		var tileCollisionY = undefined;
		var aabbOffsetY = groupCheck?0:(previousAABB.y - ent.getPreviousY());//previousAABB.y - initialY;
		
		//////////////////////////////////////////////////////////////////////
		//MOVE IN THE X DIRECTION
		//////////////////////////////////////////////////////////////////////
		while (xPos != xGoal && (potentialTiles.length || potentialsEntities.length)){
			if (Math.abs(xGoal - xPos) < unitStepSize)
			{
				xPos = xGoal;
			} else {
				xPos += xStep;
			}
//			previousAABB.move(xPos + aabbOffsetX, yPos + aabbOffsetY);
			previousAABB.move(xPos, yPos);
			
			//CHECK AGAINST TILES
			var tileAABB = undefined;
			for (var t = 0; t < potentialTiles.length; t++)
			{
				tileAABB = potentialTiles[t].shapes[0].getAABB();
				if(this.AABBCollision(previousAABB, tileAABB))
				{
					if(groupCheck || this.preciseCollision(ent, potentialTiles[t]))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xStep > 0)
						{
							atX = tileAABB.left - previousAABB.halfWidth;
						} else {
							atX = tileAABB.right + previousAABB.halfWidth;
						}
						
						if ( typeof tilecollisionX === 'undefined') {
							tileCollisionX = {atX: atX, aABB: tileAABB, shape: potentialTiles[t].shapes[0]};
						} else if (xStep > 0) {
							if (atX < tileCollisionX.atX)
							{
								tileCollisionX = {atX: atX, aABB: tileAABB, shape: potentialTiles[t].shapes[0]};
							}
						} else {
							if (atX > tileCollisionX.atX)
							{
								tileCollisionX = {atX: atX, aABB: tileAABB, shape: potentialTiles[t].shapes[0]};
							}
						}
					}
				}
			}
			
			//CHECK AGAINST SOLID ENTITIES
			var entityAABB = undefined;
			for (var u = 0; u < potentialsEntities.length; u++)
			{
				entityAABB = potentialsEntities[u].collisionUnresolved?potentialsEntities[u].getPreviousAABB():potentialsEntities[u].getAABB();
				if(this.AABBCollision(previousAABB, entityAABB))
				{
					if(groupCheck || this.preciseCollision(ent, potentialsEntities[u]))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xStep > 0)
						{
							atX = entityAABB.left - previousAABB.halfWidth;
							if (tileCollisionX && atX > tileCollisionX.atX)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						} else {
							atX = entityAABB.right + previousAABB.halfWidth;
							if (tileCollisionX && atX < tileCollisionX.atX)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						}
						
						if (collisionsX.length == 0) {
							//finalX = atX;
							collisionsX.push({atX: atX, entity: potentialsEntities[u]});
						} else if (xStep > 0) {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsX.length; c++)
							{
								if (atX < collisionsX[c].atX)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsX.splice(insertIndex, 0, {atX: atX, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
						} else {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsX.length; c++)
							{
								if (atX > collisionsX[c].atX)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsX.splice(insertIndex, 0, {atX: atX, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
							
						} 
					}
				}
					
			}
			
			var complete = false;
			for(var q = 0; q < collisionsX.length; q++)
			{
				complete = ent.routeSolidCollision?ent.routeSolidCollision('x', xStep, collisionsX[q]):true;
				if (complete)
				{
					triggerMessages.push({
						entity: collisionsX[q].entity,
						type:   collisionsX[q].entity.collisionType,
						shape:  collisionsX[q].entity.shape,
						x: xStep / Math.abs(xStep),
						y: 0
					});
					if(((collisionsX[q].atX > initialX) && (xStep > 0)) || ((collisionsX[q].atX < initialX) && (xStep < 0))){
						finalX = collisionsX[q].atX;
					} else {
						finalX = initialX;
					}
					break;
				}
			}	
			
			if (ent.routeTileCollision)
			{
				var complete = false;
				if(typeof finalX === 'undefined' && tileCollisionX)
				{
					complete = ent.routeTileCollision('x', xStep, tileCollisionX);
					if (complete)
					{
						triggerMessages.push({
							type:   'tiles',
							shape:  tileCollisionX.shape,
							x: xStep / Math.abs(xStep),
							y: 0
						});
						finalX = tileCollisionX.atX;
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
		
		//////////////////////////////////////////////////////////////////////
		//MOVE IN THE Y DIRECTION
		//////////////////////////////////////////////////////////////////////

		while (yPos != yGoal && (potentialTiles.length || potentialsEntities.length))
		{
			if (Math.abs(yGoal - yPos) < unitStepSize)
			{
				yPos = yGoal;
			} else {
				yPos += yStep;
			}
//			previousAABB.move(finalX + aabbOffsetX, yPos + aabbOffsetY);
			previousAABB.move(finalX, yPos);
			
			//CHECK AGAINST TILES
			var tileAABB = undefined;
			for (var t = 0; t < potentialTiles.length; t++)
			{
				tileAABB = potentialTiles[t].shapes[0].getAABB();
				if(this.AABBCollision(previousAABB, tileAABB))
				{
					if(groupCheck || this.preciseCollision(ent, potentialTiles[t]))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yStep > 0)
						{
							atY = tileAABB.top - previousAABB.halfHeight; 
						} else {
							atY = tileAABB.bottom + previousAABB.halfHeight;
						}
						 
						if ( typeof tilecollisionY === 'undefined') {
							tileCollisionY = {atY: atY, aABB: tileAABB,  shape: potentialTiles[t].shapes[0]};
						} else if (yStep > 0) {
							if (atY < tileCollisionY.atY)
							{
								tileCollisionY = {atY: atY, aABB: tileAABB,  shape: potentialTiles[t].shapes[0]};
							}
						} else {
							if (atY > tileCollisionY.atY)
							{
								tileCollisionY = {atY: atY, aABB: tileAABB,  shape: potentialTiles[t].shapes[0]};
							}
						} 
					}
				}
			}
			
			//CHECK AGAINST SOLID ENTITIES
			var entityAABB = undefined;
			for (var u = 0; u < potentialsEntities.length; u++)
			{
				entityAABB = potentialsEntities[u].collisionUnresolved?potentialsEntities[u].getPreviousAABB():potentialsEntities[u].getAABB();
				if(this.AABBCollision(previousAABB, entityAABB))
				{
					if(groupCheck || this.preciseCollision(ent, potentialsEntities[u]))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yStep > 0)
						{
							atY = entityAABB.top - previousAABB.halfHeight;
							if (tileCollisionY && atY > tileCollisionY.atY)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						} else {
							atY = entityAABB.bottom + previousAABB.halfHeight;
							if (tileCollisionY && atY < tileCollisionY.atY)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						}
																						
						if (collisionsY.length == 0) {
							//finalX = atX;
							collisionsY.push({atY: atY, entity: potentialsEntities[u]});
						} else if (yStep > 0) {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsY.length; c++)
							{
								if (atY < collisionsY[c].atY)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsY.splice(insertIndex, 0, {atY: atY, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
						} else {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsY.length; c++)
							{
								if (atY > collisionsY[c].atY)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsY.splice(insertIndex, 0, {atY: atY, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
						} 
					}
				}
			}
			
			var complete = false;
			for(var q = 0; q < collisionsY.length; q++)
			{
				complete = ent.routeSolidCollision?ent.routeSolidCollision('y', yStep, collisionsY[q]):true;
				if (complete)
				{
					triggerMessages.push({
						entity: collisionsY[q].entity,
						type:   collisionsY[q].entity.collisionType,
						shape:  collisionsY[q].entity.shape,
						x: 0,
						y: yStep / Math.abs(yStep)
					});
					if(((collisionsY[q].atY > initialY) && (yStep > 0)) || ((collisionsY[q].atY < initialY) && (yStep < 0))){
						finalY = collisionsY[q].atY;
					} else {
						finalY = initialY;
					}
					break;
				}
			}
			
			if (ent.routeTileCollision)
			{
				var complete = false;
				if(typeof finalY === 'undefined' && tileCollisionY)
				{
					complete = ent.routeTileCollision('y', yStep, tileCollisionY);
					if (complete)
					{
						triggerMessages.push({
							type:   'tiles',
							shape:  tileCollisionY.shape,
							x: 0,
							y: yStep / Math.abs(yStep)
						});
						finalY = tileCollisionY.atY;
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

		if(groupCheck){
			ent.trigger('relocate-group', {x: finalX - initialX, y: finalY - initialY, debug:true});
		} else {
			if(this.owner.type == 'hero'){
				ent.trigger('relocate-entity', {x: finalX - aabbOffsetX, y: finalY - aabbOffsetY, debug: true});
			} else {
				ent.trigger('relocate-entity', {x: finalX - aabbOffsetX, y: finalY - aabbOffsetY});
			}
		}

		for (var i in triggerMessages){
			ent.trigger('hit-by-' + triggerMessages[i].type, triggerMessages[i]);
			if(triggerMessages[i].entity){ //have to go both ways because the alternate direction may not be checked if the alternate entity is not moving toward this entity
				triggerMessages[i].entity.trigger('hit-by-' + ent.collisionType, {
					entity: ent,
					type:   ent.collisionType,
					shape:  ent.shape,
					x: -triggerMessages[i].x,
					y: -triggerMessages[i].y
				});
			}
		}
	};
	
	proto.checkSoftCollisions = function (resp)
	{
		var otherEntity = undefined,
		ent = undefined,
		x   = 0,
		y   = 0,
		z   = 0;
		
		for(x = 0; x < this.entitiesLive.length; x++){
			ent = this.entitiesLive[x];
			for (y = 0; y < ent.softCollisions.length; y++){
				if(this.entitiesByTypeLive[ent.softCollisions[y]]){
					for(z = 0; z < this.entitiesByTypeLive[ent.softCollisions[y]].length; z++){
						otherEntity = this.entitiesByTypeLive[ent.softCollisions[y]][z];
						if((otherEntity !== ent) && (this.AABBCollision(ent.getAABB(), otherEntity.getAABB()))) {
							if (this.preciseCollision(ent, otherEntity))
							{
								ent.trigger('hit-by-' + otherEntity.collisionType, {
									entity: otherEntity,
									type:   otherEntity.collisionType,
									shape:  otherEntity.shape
								});
							}
						}
					}
				}
			}
		}
	};
	
	proto.AABBCollision = function (boxX, boxY)
	{
		if(boxX.left   >=  boxY.right)  return false;
		if(boxX.right  <=  boxY.left)   return false;
		if(boxX.top    >=  boxY.bottom) return false;
		if(boxX.bottom <=  boxY.top)    return false;
		return true;
	};
	
	proto.preciseCollision = function (entityA, entityB){
		var i = 0,
		j     = 0,
		aabb  = undefined,
		shapesA = entityA.shapes || entityA.getShapes(),
		shapesB = entityB.shapes || entityB.getShapes();
		
		if((shapesA.length > 1) || (shapesB.length > 1)){
			for (i = 0; i < shapesA.length; i++){
				aabb = shapesA[i].getAABB();
				for (j = 0; j < shapesB.length; j++){
					if((this.AABBCollision(aabb, shapesB[j].getAABB())) && (this.shapeCollision(shapesA[i], shapesB[j]))){
						return true; //TODO: return all true instances instead of just the first one in case they need to be resolved in unique ways - DDD
					}
				}
			}
			return false;
		} else {
			return this.shapeCollision(shapesA[0], shapesB[0]);
		}
	};
	
	proto.shapeCollision = function(shapeA, shapeB){
		return true;
	};
	
	proto['relocate-group'] = function(resp){
		for (var x = 0; x < this.entities.length; x++){
			if(this.entities[x] !== this.owner){
				this.entities[x].trigger('relocate-entity', {x:this.entities[x].x + resp.x, y:this.entities[x].y + resp.y});
			} else {
				this.entities[x].trigger('relocate-entity', {x:resp.x, y:resp.y, relative: true});
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
		for (var i in this.entitiesByType){
			this.entitiesByType[i].length = 0;
		}
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   audio - ../src/js/standard-components/audio.js
 */
/**
# COMPONENT **audio**
This component listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding audio clip.

## Dependencies:
- [createjs.SoundJS] [link1] - This component requires the SoundJS library to be included for audio functionality.
- [[Handler-Render]] (on entity's parent) - This component listens for a render "tick" message in order to stop audio clips that have a play length set.

## Messages

### Listens for:
- **handle-render** - On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
  > @param message.deltaT (number) - uses the value of deltaT (time since last `handle-render`) to track progess of the audio clip and stop clip if play length has been reached.
- **audio-mute-toggle** - On receiving this message, the audio will mute if unmuted, and unmute if muted.
  > @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is toggled. Otherwise all audio is toggled from mute to unmute or vice versa.
- **audio-mute** - On receiving this message all audio will mute, or a particular sound instance will mute if an id is specified.
  > @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is muted.
- **audio-unmute** - On receiving this message all audio will unmute, or a particular sound instance will unmute if an id is specified.
  > @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is unmuted.
- **logical-state** - This component listens for logical state changes and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
  > @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, begins playing corresponding audio clips. Audio play message can optionally include several parameters, many of which correspond with [SoundJS play parameters] [link2].
  > @param message.interrupt (string) - Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
  > @param message.delay (integer) - Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
  > @param message.offset (integer) - Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
  > @param message.length (integer) - Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
  > @param message.loop (integer) - Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
  > @param message.volume (float) - Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
  > @param message.pan (float) - Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.

## JSON Definition:
    {
      "type": "audio",
      
      "audioMap":{
      // Required. Use the audioMap property object to map messages triggered with audio clips to play. At least one audio mapping should be included for audio to play.
      
        "message-triggered": "audio-id",
        // This simple form is useful to listen for "message-triggered" and play "audio-id" using default audio properties.
        
        "another-message": {
        // To specify audio properties, instead of mapping the message to an audio id string, map it to an object with one or more of the properties shown below. Many of these properties directly correspond to [SoundJS play parameters] (http://www.createjs.com/Docs/SoundJS/SoundJS.html#method_play).
        
          "sound": "another-audio-id",
          // Required. This is the audio clip to play when "another-message" is triggered.
          
          "interrupt": "none",
          // Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
          
          "delay": 500,
          // Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
          
          "offset": 1500,
          // Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
          
          "length": 2500,
          // Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.

          "loop": 4,
          // Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
          
          "volume": 0.75,
          // Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
          
          "pan": -0.25
          // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
        }
      }
    }

[link1]: http://www.createjs.com/Docs/SoundJS/module_SoundJS.html
[link2]: http://www.createjs.com/Docs/SoundJS/SoundJS.html#method_play
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
			attributes = {};
		} else {
			sound      = soundDefinition.sound;
			attributes = soundDefinition;
		}
		if(platformer.settings.assets[sound].data){
			for(var item in platformer.settings.assets[sound].data){
				attributes[item] = attributes[item] || platformer.settings.assets[sound].data[item];
			}
		}
		if(platformer.settings.assets[sound].assetId){
			sound = platformer.settings.assets[sound].assetId;
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
	createTest = function(testStates, audio){
		var states = testStates.replace(/ /g, '').split(',');
		if(testStates === 'default'){
			return function(state){
				return testStates;
			};
		} else {
			return function(state){
				for(var i = 0; i < states.length; i++){
					if(!state[states[i]]){
						return false;
					}
				}
				return testStates;
			};
		}
	},
	component = function(owner, definition){
		this.owner = owner;
		this.timedAudioClips = [],
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render', 'audio-mute-toggle', 'audio-mute', 'audio-unmute', 'logical-state']);

		this.state = {};
		this.stateChange = false;
		this.currentState = false;

		if(definition.audioMap){
			this.checkStates = [];
			for (var key in definition.audioMap){
				this.addListener(key);
				this[key] = playSound(definition.audioMap[key]);
				this.checkStates.push(createTest(key, definition.audioMap[key]));
			}
		}
	};
	var proto = component.prototype;
	
	proto['handle-render'] = function(resp){
		if (this.destroyMe && this.timedAudioClips.length == 0)
		{
			this.timedAudioClips = undefined;
			this.removeListeners(this.listeners);
		} else {
			var i     = 0,
			audioClip = undefined;
			newArray  = undefined;
			if(this.timedAudioClips.length){
				newArray = [];
				for (i in this.timedAudioClips){
					audioClip = this.timedAudioClips[i];
					audioClip.progress += resp.deltaT;
					if(audioClip.progress >= audioClip.length){
						audioClip.audio.stop();
					} else {
						newArray.push(audioClip);
					}
				}
				this.timedAudioClips = newArray;
			}

			i = 0;
			if(this.stateChange){
				if(this.checkStates){
					this.currentState = false;
					for(; i < this.checkStates.length; i++){
						audioClip = this.checkStates[i](this.state);
						if(audioClip){
							this.currentState = audioClip;
							break;
						}
					}
				}
				this.stateChange = false;
			}
			
			if(this.currentState){
				this[this.currentState]();
			}
		}
	};

	proto['logical-state'] = function(state){
		for(var i in state){
			if(this.state[i] !== state[i]){
				this.stateChange = true;
				this.state[i] = state[i];
			}
		}
	};
	
	proto['audio-mute-toggle'] = function(sound){
		if(sound && (typeof sound === 'string')){
			if(createjs.SoundJS.getInstanceById(sound)){
				createjs.SoundJS.setMute(!createjs.SoundJS.getInstanceById(sound).muted, sound);
			}
		} else {
			createjs.SoundJS.setMute(!createjs.SoundJS.muted);
		}
	};
	
	proto['audio-mute'] = function(sound){
		createjs.SoundJS.setMute(true, sound);
	};
	
	proto['audio-unmute'] = function(sound){
		createjs.SoundJS.setMute(false, sound);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		//Handling things in 'render'
		this.destroyMe = true;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   broadcast-events - ../src/js/standard-components/broadcast-events.js
 */
/**
# COMPONENT **broadcast-events**
This component listens for local entity messages and re-broadcasts as alternate messages on itself, its parent entity, or at the game level.
> **Note:** Make sure that this component is never set up to receive and broadcast identical messages or an infinite loop will result, since it will receive the same message it sent.

## Dependencies:
- [[Entity-Container]] (on entity's parent) - This component can broadcast messages to its parent; `this.parent` is commonly specified by being a member of an entity container.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages.
  > @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Local Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages on the entity.
  > @param message (object) - sends the message object received by the original message.

### Parent Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages on the entity's parent if one exists.
  > @param message (object) - sends the message object received by the original message.

### Game Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages at the top game level.
  > @param message (object) - sends the message object received by the original message.

## JSON Definition:
    {
      "type": "broadcast-events",
      
      // One of the following event mappings must be specified: "events", "parentEvents", or "renameEvents".
      
      "events": {
      // Optional: Maps local messages to trigger global game messages. At least one of the following mappings should be included.
        
        "local-message-1": "global-game-message",
        // On receiving "local-message-1", triggers "global-game-message" at the game level.
        
        "local-message-2": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-2", triggers each message in the array in sequence at the game level.
      }
      
      "parentEvents": {
      // Optional: Maps local messages to trigger messages on the entity's parent. At least one of the following mappings should be included.
        
        "local-message-3": "parent-message",
        // On receiving "local-message-3", triggers "parent-message" on the entity's parent.
        
        "local-message-4": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-4", triggers each message in the array in sequence on the entity's parent.
      }
      
      "renameEvents": {
      // Optional: Maps local messages to trigger alternative messages on the entity itself. This can be useful as a basic fill-in for a logic component to translate an outgoing message from one component into an incoming message for another. At least one of the following mappings should be included.
        
        "local-message-5": "another-local-message",
        // On receiving "local-message-5", triggers "another-local-message" on the entity itself.
        
        "local-message-6": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-6", triggers each message in the array in sequence on the entity itself.
      }
    }
*/
platformer.components['broadcast-events'] = (function(){
	var gameBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				platformer.game.currentScene.trigger(event, value, debug);
			};
		} else {
			return function(value){
				for (var e in event){
					platformer.game.currentScene.trigger(event[e], value, debug);
				}
			};
		}
	};
	
	var parentBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				if(this.owner.parent)
				{
					this.owner.parent.trigger(event, value, debug);
				}
				
			};
		} else {
			return function(value, debug){
				for (var e in event){
					this.owner.parent.trigger(event[e], value, debug);
				}
			};
		}
	};
	
	var entityBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				this.owner.trigger(event, value, debug);
			};
		} else {
			return function(value, debug){
				for (var e in event){
					this.owner.trigger(event[e], value, debug);
				}
			};
		}
	};
	
	var component = function(owner, definition){
		this.owner = owner;

		// Messages that this component listens for and then broadcasts to all layers.
		this.listeners = [];
		if(definition.events){
			for(var event in definition.events){
				this[event] = gameBroadcast(definition.events[event]);
				this.addListener(event);
			}
		}
		
		if(definition.parentEvents){
			for(var event in definition.parentEvents){
				this[event] = parentBroadcast(definition.parentEvents[event]);
				this.addListener(event);
			}
		}
		
		// Messages that this component listens for and then triggers on itself as a renamed message - useful as a logic place-holder for simple entities.
		if(definition.renameEvents){
			for(var event in definition.renameEvents){
				this[event] = entityBroadcast(definition.renameEvents[event]);
				this.addListener(event);
			}
		}
	};
	var proto = component.prototype;
	
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   change-scene - ../src/js/standard-components/change-scene.js
 */
/**
# COMPONENT **change-scene**
This component allows the entity to initiate a change from the current scene to another scene.

## Messages

### Listens for:
- **new-scene** - On receiving this message, a new scene is loaded according to provided parameters or previously determined component settings.
  > @param message.scene (string) - This is a label corresponding with a predefined scene.
  > @param message.transition (string) - This can be "instant" or "fade-to-black". Defaults to an instant transition.

## JSON Definition:
    {
      "type": "change-scene",
      
      "scene": "scene-menu",
      // Optional (but must be provided by a "change-scene" parameter if not defined here). This causes the "new-scene" trigger to load this scene.
      
      "transition": "fade-to-black",
      // Optional. This can be "instant" or "fade-to-black". Defaults to an "instant" transition.
    }
*/
platformer.components['change-scene'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.scene = definition.scene;
		this.transition = definition.transition || 'instant';
		
		this.addListeners(['new-scene']);
	};
	var proto = component.prototype;
	
	proto['new-scene'] = function(response){
		var resp   = response || this,
		scene      = resp.scene || this.scene,
		transition = resp.transition || this.transition;

		platformer.game.loadScene(scene, transition);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   destroy-me - ../src/js/standard-components/destroy-me.js
 */
/**
# COMPONENT **destroy-me**
This component will cause the entity to remove itself from its parent upon receiving a given message.

## Dependencies:
- [[Entity-Container]] (on entity's parent) - This component requires the entity to have `entity.parent` defined as the entity containing this entity. This is commonly provided by an [[Entity-Container]] on the parent entity.

## Messages

### Listens for:
- **destroy-me** - On receiving this message, the component removes this entity from the parent, which typically destroys the entity.
- **[Message specified in definition]** - An alternative message can be specified in the JSON definition that will also cause the entity's removal.

## JSON Definition:
    {
      "type": "destroy-me",
      
      "message": "hit-by-wrench",
      // Optional: If specified, this message will cause the entity to be removed in addition to a "destroy-me" message.
      
      "delay": 250
      // Optional: Time in milliseconds before entity should be destroyed. If not defined, it is instantaneous.
    }
*/
platformer.components['destroy-me'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['destroy-me']);
		
		if(definition.message){
			this.addListener(definition.message);
			this[definition.message] = this['destroy-me'];
		}
		
		this.destroyed = false;
		this.delay = definition.delay || 0;
	};
	var proto = component.prototype;
	
	proto['destroy-me'] = function(){
		var self = this;
		if(!this.destroyed){
			setTimeout(function(){
				self.owner.parent.removeEntity(self.owner);
			}, this.delay);
		}
		this.destroyed = true;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   dom-element - ../src/js/standard-components/dom-element.js
 */
/**
# COMPONENT **dom-element**
This component creates a DOM element associated with the entity. In addition to allowing for CSS styling, the element can also perform as a controller accepting click and touch inputs and triggering associated messages on the entity.

## Dependencies:
- [[Handler-Render-Dom]] (on entity's parent) - This component listens for a render "handle-render-load" message with a DOM element to setup and display the element.

## Messages

### Listens for:
- **handle-render-load** - This event provides the parent DOM element that this component will require for displaying its DOM element.
  > @param message.element (DOM element) - Required. Provides the render component with the necessary DOM element parent.

### Local Broadcasts:
- **[Messages specified in definition]** - Element event handlers will trigger messages as defined in the JSON definition.
  > @param message (DOM Event object) - When messages are triggered on the entity, the associated message object is the DOM Event object that was provided to the originating DOM Event handler.

## JSON Definition
    {
      "type": "dom-element",

      "element": "div",
      //Required. Sets what type of DOM element should be created.
      
      "innerHTML": "Hi!",
      //Optional. Sets the DOM element's inner text or HTML.
      
      "className": "top-band",
      //Optional. Any standard properties of the element can be set by listing property names and their values. "className" is one example, but other element properties can be specified in the same way.
      
      "onmousedown": "turn-green"
      //Optional. If specified properties begin with "on", it is assumed that the property is an event handler and the listed value is broadcast as a message on the entity where the message object is the event handler's event object.
    }
*/
platformer.components['dom-element'] = (function(){
	var createFunction = function(message, entity){
		return function(e){
			entity.trigger(message, e);
		};
	},
	component = function(owner, definition){
		var elementType = definition.element   || 'div',
		innerHTML       = definition.innerHTML || false;
		
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListener('handle-render-load');
		
		this.element = this.owner.element = document.createElement(elementType);
		for(var i in definition){
			if((i !== 'innerHTML') && (i !== 'type') && (i !== 'element')){
				if(i.indexOf('on') === 0){
					this.element[i] = createFunction(definition[i], this.owner);
				} else {
					this.element[i] = definition[i];
				}
			}
		}
		if(innerHTML){
			this.element.innerHTML = innerHTML;
		}
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		if(resp.element){
			this.parentElement = resp.element;
			this.parentElement.appendChild(this.element);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		if(this.parentElement){
			this.parentElement.removeChild(this.element);
			this.parentElement = undefined;
		}
		if(this.owner.element === this.element){
			this.owner.element = undefined;
		}
		this.element = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   entity-container - ../src/js/standard-components/entity-container.js
 */
/**
# COMPONENT **entity-container**
This component allows the entity to contain child entities. It will add several methods to the entity to manage adding and removing entities.

## Messages

### Listens for:
- **load** - This component waits until all other entity components are loaded before it begins adding children entities. This allows other entity components to listen to entity-added messages and handle them if necessary.
- **add-entity** - This message will added the given entity to this component's list of entities.
  > @param message ([[Entity]] object) - Required. This is the entity to be added as a child.
- **remove-entity** - On receiving this message, the provided entity will be removed from the list of child entities.
  > @param message ([[Entity]] object) - Required. The entity to remove.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  > @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Local Broadcasts:
- **child-entity-added** - This message is triggered when a new entity has been added to the list of children entities.
  > @param message ([[Entity]] object) - The entity that was just added.
- **child-entity-removed** - This message is triggered when an entity has been removed from the list of children entities.
  > @param message ([[Entity]] object) - The entity that was just removed.

### Child Broadcasts:
- **peer-entity-added** - This message is triggered when a new entity has been added to the parent's list of children entities.
  > @param message ([[Entity]] object) - The entity that was just added.
- **peer-entity-removed** - This message is triggered when an entity has been removed from the parent's list of children entities.
  > @param message ([[Entity]] object) - The entity that was just removed.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  > @param message (object) - sends the message object received by the original message.

## Methods:
- **AddEntity** -  This method will add the provided entity to this component's list of entities.
  > @param entity ([[Entity]] object) - Required. This is the entity to be added as a child.
  > @return entity ([[Entity]] object) - Returns the entity that was just added.
- **removeEntity** - This method will remove the provided entity from the list of child entities.
  > @param message ([[Entity]] object) - Required. The entity to remove.
  > @return entity ([[Entity]] object | false) - Returns the entity that was just removed. If the entity was not foudn as a child, `false` is returned, indicated that the provided entity was not a child of this entity.

## JSON Definition:
    {
      "type": "entity-container",
      
      "entities": [{"type": "hero"}, {"type": "tile"}],
      // Optional. "entities" is an Array listing entity definitions to specify entities that should be added as children when this component loads.
      
      "childEvents": ["tokens-flying", "rules-updated"]
      // Optional. "childEvents" lists messages that are triggered on the entity and should be triggered on the children as well.
    }
*/
platformer.components['entity-container'] = (function(){
	var childBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				for (var x = 0; x < this.entities.length; x++)
				{
					this.entities[x].trigger(event, value, debug);
				}
			};
		} else {
			return function(value, debug){
				for (var e in event){
					for (var x = 0; x < this.entities.length; x++)
					{
						this.entities[x].trigger(event[e], value, debug);
					}
				}
			};
		}
	},
	component = function(owner, definition){
		var self = this;

		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load', 'add-entity', 'remove-entity']);

		this.entities = [];
		this.definedEntities = definition.entities; //saving for load message
		
		this.owner.entities     = self.entities;
		this.owner.addEntity    = function(entity){return self.addEntity(entity);};
		this.owner.removeEntity = function(entity){return self.removeEntity(entity);};
		
		if(definition.childEvents){
			for(var event in definition.childEvents){
				this[definition.childEvents[event]] = childBroadcast(definition.childEvents[event]);
				this.addListener(definition.childEvents[event]);
			}
		}
	},
	proto = component.prototype;
	
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
		for (var x = 0; x < this.entities.length; x++)
		{
			entity.trigger('peer-entity-added', this.entities[x]);
		}
		
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('peer-entity-added', entity);
		}
		this.entities.push(entity);
		this.owner.trigger('child-entity-added', entity);
		entity.parent = this.owner;
		return entity;
	};
	
	proto.removeEntity = proto['remove-entity'] = function (entity) {
		for (var x = 0; x < this.entities.length; x++){
		    if(this.entities[x] === entity){
				for (var y = 0; y < this.entities.length; y++){
					if(x !== y){
						this.entities[y].trigger('peer-entity-removed', entity);
					}
				}
		    	entity.parent = undefined;
		    	this.entities.splice(x, 1);
				this.owner.trigger('child-entity-removed', entity);
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
			this.entities[i].destroy();
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   entity-controller - ../src/js/standard-components/entity-controller.js
 */
/**
# COMPONENT **entity-controller**
This component listens for input messages triggered on the entity and updates the state of any controller inputs it is listening for. It then broadcasts messages on the entity corresponding to the input it received.

## Dependencies:
- [[Handler-Controller]] (on entity's parent) - This component listens for a controller "tick" message in order to trigger messages regarding the state of its inputs.

## Messages

### Listens for:
- **handle-controller** - On each `handle-controller` message, this component checks its list of actions and if any of their states are currently true or were true on the last call, that action message is triggered.
- **mousedown** - This message is re-triggered on the entity as a new message including the button that was pressed: "mouse:left-button:down", "mouse:middle-button:down", or "mouse:right-button:down".
  > @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mouseup** - This message is re-triggered on the entity as a new message including the button that was released: "mouse:left-button:up", "mouse:middle-button:up", or "mouse:right-button:up".
  > @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mousemove** - Updates mouse action states with whether the mouse is currently over the entity.
  > @param message.over (boolean) - Whether the mouse is over the input entity.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, sets the appropriate state and broadcasts the associated message on the next `handle-controller` message. These messages come in pairs and typically have the form of "keyname:up" and "keyname:down" specifying the current state of the input.
  
### Local Broadcasts:
- **mouse:mouse-left:down, mouse:mouse-left:up, mouse:mouse-middle:down, mouse:mouse-middle:up, mouse:mouse-right:down, mouse:mouse-right:up** - This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
  > @param message (DOM Event object) - The original mouse event object is passed along with the control message.
- **[Messages specified in definition]** - Broadcasts active states using the JSON-defined message on each `handle-controller` message. Active states include `pressed` being true or `released` being true. If both of these states are false, the message is not broadcasted.
  > @param message.pressed (boolean) - Whether the current input is active.
  > @param message.released (boolean) - Whether the current input was active last tick but is no longer active.
  > @param message.triggered (boolean) - Whether the current input is active but was not active last tick.
  > @param message.over (boolean) - Whether the mouse was over the entity when pressed, released, or triggered. This value is always false for non-mouse input messages.

## JSON Definition:
    {
      "type": "entity-controller",
      
      "controlMap":{
      // Required. Use the controlMap property object to map inputs to messages that should be triggered. At least one control mapping should be included. The following are a few examples:
      
        "key:x": "run-left",
        // This causes an "x" keypress to fire "run-left" on the entity. For a full listing of key names, check out the `handler-controller` component.
        
        "button-pressed": "throw-block",
        // custom input messages can be fired on this entity from other entities, allowing for on-screen input buttons to run through the same controller channel as other inputs.
        
        "mouse:left-button"
        // The controller can also handle mouse events on the entity if the entity's render component triggers mouse events on the entity (for example, the `render-animation` component).
      }
    }
*/
platformer.components['entity-controller'] = (function(){
	var state = function(){
		this.current = false;
		this.last    = false;
		this.state   = false;
		this.stateSummary = {
			pressed:   false,
			released:  false,
			triggered: false,
			over:      false
		};
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
		this.addListeners(['handle-controller', 'mousedown', 'mouseup', 'mousemove']);
		
		if(definition && definition.controlMap){
			this.owner.controlMap = definition.controlMap; // this is used and expected by the handler-controller to handle messages not covered by key and mouse inputs.
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
	
	stateProto.getState = function(){
		this.stateSummary.pressed   = this.current;
		this.stateSummary.released  = !this.current && this.last;
		this.stateSummary.triggered = this.current && !this.last;
		this.stateSummary.over      = this.over;
		return this.stateSummary;
	};
	
	proto['handle-controller'] = function(){
		var state = undefined,
		action    = '';
		
		if(this.actions){
			for (action in this.actions){
				state = this.actions[action];
				if(state.current || state.last){
					this.owner.trigger(action, state.getState());
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
		if(this.actions['mouse:left-button'] && (this.actions['mouse:left-button'].over !== value.over))     this.actions['mouse:left-button'].over = value.over;
		if(this.actions['mouse:middle-button'] && (this.actions['mouse:middle-button'].over !== value.over)) this.actions['mouse:middle-button'].over = value.over;
		if(this.actions['mouse:right-button'] && (this.actions['mouse:right-button'].over !== value.over))   this.actions['mouse:right-button'].over = value.over;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-debug - ../src/js/standard-components/render-debug.js
 */
/**
# COMPONENT **render-debug**
This component is attached to entities that will appear in the game world. It serves two purposes. First, it displays a rectangle that indicates location of the object. By default it uses the specified position and dimensions of the object (in green), if the object has a collision component it will display the AABB of the collision shape (in pink). The render-debug component also allows the user to click on an object and it will print the object in the debug console. 

## Dependencies
- [[Handler-Render]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render** - Repositions the pieces of the component in preparation for rendering
- **handle-render-load** - The visual components are set up and added to the stage. Setting up mouse input stuff. The click-to-print-to-console functionality is set up too. 
  > @param resp.stage ([createjs.Stage][link1]) - This is the stage on which the component will be displayed.

### Local Broadcasts:
- **mousedown** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  

## JSON Definition
    {
      "type": "render-debug",
      "acceptInput": {
      	//Optional - What types of input the object should take.
      	"hover": false;
      	"click": false; 
      }, 
      "regX": 0,
      //Optional - The X offset from X position for the displayed shape. If you're using the AABB this is set automatically.
      "regY": 0
      //Optional - The Y offset from Y position for the displayed shape. If you're using the AABB this is set automatically.
    }
    
[link1]: http://createjs.com/Docs/EaselJS/Stage.html
*/


platformer.components['render-debug'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		//this.controllerEvents = undefined;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
		} else {
			this.hover = false;
			this.click = false;
		}
		
		this.regX = definition.regX || 0;
		this.regY = definition.regY || 0;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render', 'handle-render-load']);
	};
	var proto = component.prototype;

	proto['handle-render'] = function(){
		if(this.owner.getAABB){
			var aabb   = this.owner.getAABB();
			this.shape.scaleX = aabb.width / this.initialWidth;
			this.shape.scaleY = aabb.height / this.initialHeight;
			this.shape.x = aabb.x - aabb.halfWidth;
			this.shape.y = aabb.y - aabb.halfHeight;
			this.shape.z = this.owner.z;
			this.txt.x = aabb.x;
			this.txt.y = aabb.y;
			this.txt.z = this.owner.z;
		} else {
			this.shape.x = this.owner.x	- this.regX;
			this.shape.y = this.owner.y	- this.regY;
			this.shape.z = this.owner.z;
			this.txt.x = this.owner.x	- this.regX + (this.owner.width / 2);
			this.txt.y = this.owner.y 	- this.regY + (this.owner.height / 2);
			this.txt.z = this.owner.z;
		}
		if(this.owner.getCollisionGroupAABB){
			var aabb = this.owner.getCollisionGroupAABB();
			if(!this.groupShape){
				this.groupShape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,255,0,0.1)").setStrokeStyle(3).beginStroke("#0f0").rect(0, 0, aabb.width, aabb.height));
				this.groupShapeInitialWidth  = aabb.width;
				this.groupShapeInitialHeight = aabb.height;
				this.stage.addChild(this.groupShape);
			}
			this.groupShape.scaleX = aabb.width  / this.groupShapeInitialWidth;
			this.groupShape.scaleY = aabb.height / this.groupShapeInitialHeight;
			this.groupShape.x      = aabb.x      - aabb.halfWidth;
			this.groupShape.y      = aabb.y      - aabb.halfHeight;
		}
	};

	proto['handle-render-load'] = function(resp){
		var self = this,
		x        = this.owner.x      = this.owner.x || 0,
		y        = this.owner.y      = this.owner.y || 0,
		z        = this.owner.z      = this.owner.z || 0,
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
		this.txt.z = z;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		
/*		this.mookieImg   = new createjs.Bitmap('i/mookie.png');
		this.mookieImg.x = this.owner.x;
		this.mookieImg.y = this.owner.y;*/
		
		if(this.owner.getAABB){
			var aabb   = this.owner.getAABB();
			width      = this.initialWidth  = aabb.width;
			height     = this.initialHeight = aabb.height;
			this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(255,0,255,0.1)").setStrokeStyle(3).beginStroke("#f0f").rect(0, 0, width, height));
			this.regX  = width  / 2;
			this.regY  = height / 2;
		} else {
			this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,0,0,0.1)").beginStroke("#880").rect(0, 0, width, height));
		}
		this.shape.z = z;
		this.stage.addChild(this.shape);
		this.stage.addChild(this.txt);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.click && createjs.Touch.isSupported()){
			createjs.Touch.enable(this.stage);
		}

		this.shape.onPress     = function(event) {
			if(this.click){
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
		if(this.click){
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
		this.stage.removeChild(this.shape);
		this.stage.removeChild(this.txt);
		this.shape = undefined;
		this.txt = undefined;
		this.stage = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-tiles - ../src/js/standard-components/render-tiles.js
 */
platformer.components['render-tiles'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.controllerEvents = undefined;
		this.spriteSheet = new createjs.SpriteSheet(definition.spritesheet);
		this.imageMap    = definition.imageMap   || [];
		this.tiles       = [];
		this.tilesToRender = undefined;
		this.scaleX      = definition.scaleX || this.owner.scaleX || 1;
		this.scaleY      = definition.scaleY || this.owner.scaleY || 1;
		this.tileWidth   = definition.tileWidth  || (this.owner.tileWidth / this.scaleX)  || 10;
		this.tileHeight  = definition.tileHeight || (this.owner.tileHeight / this.scaleY) || 10;
		
		var buffer = (definition.buffer || this.tileWidth) * this.scaleX;
		this.camera = {
			x: -buffer - 1, //to force camera update
			y: -buffer - 1,
			buffer: buffer
		};
		
		this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render-load', 'camera-update']);
	};
	var proto = component.prototype;

	proto['handle-render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage;
		tile  = undefined;
		
		this.tilesToRender = new createjs.Container();
		this.tilesToRender.name = 'entity-managed'; //its visibility is self-managed
		
		for(x = 0; x < this.imageMap.length; x++){
			this.tiles[x] = [];
			for (y = 0; y < this.imageMap[x].length; y++){
				//TODO: Test speed of this - would non-animations perform better?
				tile = new createjs.BitmapAnimation(this.spriteSheet);
				tile.x = x * this.tileWidth;
				tile.y = y * this.tileHeight;
				//this.tilesToRender.addChild(tile);
				this.tiles[x][y] = tile;
				tile.gotoAndPlay(this.imageMap[x][y]);
			}
		}
		this.tilesToRender.scaleX = this.scaleX;
		this.tilesToRender.scaleY = this.scaleY;
		this.tilesToRender.z = this.owner.z;
		stage.addChild(this.tilesToRender);
	};
	
	proto['camera-update'] = function(camera){
		var x  = 0,
		y      = 0,
		buffer = this.camera.buffer / this.scaleX,
		maxX   = 0,
		maxY   = 0,
		minX   = 0,
		minY   = 0;
				
		if (((Math.abs(this.camera.x - camera.viewportLeft) > this.camera.buffer) || (Math.abs(this.camera.y - camera.viewportTop) > this.camera.buffer)) && (this.tiles.length > 0)){
			this.camera.x = camera.viewportLeft;
			this.camera.y = camera.viewportTop;
			
			//only attempt to draw children that are relevant
			maxX = Math.min(Math.ceil((camera.viewportLeft + camera.viewportWidth + this.camera.buffer) / (this.tileWidth * this.scaleX)), this.tiles.length - 1),
			minX = Math.max(Math.floor((camera.viewportLeft - this.camera.buffer) / (this.tileWidth * this.scaleX)), 0),
			maxY = Math.min(Math.ceil((camera.viewportTop + camera.viewportHeight + this.camera.buffer) / (this.tileHeight * this.scaleY)), this.tiles[0].length - 1),
			minY = Math.max(Math.floor((camera.viewportTop - this.camera.buffer) / (this.tileHeight * this.scaleY)), 0);
			this.tilesToRender.removeAllChildren();
			for(x = minX; x <= maxX; x++){
				for (y = minY; y <= maxY; y++){
					this.tilesToRender.addChild(this.tiles[x][y]);
				}
			}

			this.tilesToRender.cache(camera.viewportLeft / this.scaleX - buffer, camera.viewportTop / this.scaleY - buffer, camera.viewportWidth / this.scaleX + buffer * 2, camera.viewportHeight / this.scaleY + buffer * 2);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.tilesToRender.removeAllChildren();
		this.stage.removeChild(this.tilesToRender);
		this.stage = undefined;
		this.tilesToRender = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-animation - ../src/js/standard-components/render-animation.js
 */
/**
# COMPONENT **render-animation**
This component is attached to entities that will appear in the game world. It renders an animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.

## Dependencies:
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas animation functionality.
- [[Handler-Render-Createjs]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render-load** - This event is triggered before `handle-render` and provides the CreateJS stage that this component will require for displaying animations.
  > @param message.stage ([createjs.Stage][link2]) - Required. Provides the render component with the CreateJS drawing [Stage][link2].
- **handle-render** - On each `handle-render` message, this component checks to see if there has been a change in the state of the entity. If so, it updates its animation play-back accordingly.
- **logical-state** - This component listens for logical state changes and tests the current state of the entity against the animation map. If a match is found, the matching animation is played.
  > @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, begins playing the corresponding animations.

### Local Broadcasts:
- **mousedown** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  

## JSON Definition
    {
      "type": "render-animation",

      "animationMap":{
      //Optional. If the animation sequence will change, this is required. This defines a mapping from either triggered messages or one or more states for which to choose a new animation to play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation).
      
          "standing": "default-animation"
          // On receiving a "standing" message, or a "logical-state" where message.standing == true, the "default" animation will begin playing.
          
          "ground,moving": "walking",
          // comma separated values have a special meaning when evaluating "logical-state" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
          
          "default": "default-animation",
          // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
      }  

      "spriteSheet": {
      //Required. Defines an EaselJS sprite sheet to use for rendering. See http://www.createjs.com/Docs/EaselJS/SpriteSheet.html for the full specification.

	      "images": ["example0", "example1"],
	      //Required: An array of ids of the images from the asset list in config.js.
	      
	      "frames": {
	      //Required: The dimensions of the frames on the image and how to offset them around the entity position. The image is automatically cut up into pieces based on the dimensions. 
	      	"width":  100,
			"height": 100,
			"regY":   100,
			"regX":   50
	      },
	      
	      "animations":{
	      //Required: The list of animation ids and the frames that make up that animation. The frequency determines how long each frame plays. There are other possible parameters. Additional parameters and formatting info can be found in createJS.
			"default-animation":[2],
			"walking": {"frames": [0, 1, 2], "frequency": 4}
		  }
      }
      
      "state": "default",
      //Optional: The starting animation. This defaults to "default".
      
      "acceptInput": {
      	//Optional - What types of input the object should take.
      	"hover": false;
      	"click": false; 
      }, 
      
      "scaleX": 1,
      //Optional - The X scaling factor for the image. Will default to 1.
      
      "scaleY": 1
      //Optional - The Y scaling factor for the image. Will default to 1.
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
*/
platformer.components['render-animation'] = (function(){
	var changeState = function(state){
		return function(value){
			if(this.currentAnimation !== state){
				if(this.animationFinished || (this.lastState >= -1)){
					this.currentAnimation = state;
					this.lastState = -1;
					this.animationFinished = false;
					this.anim.gotoAndPlay(state);
				} else {
					this.waitingAnimation = state;
					this.waitingState = -1;
				}
			}
		};
	},
	createTest = function(testStates, animation){
		var states = testStates.replace(/ /g, '').split(',');
		if(testStates === 'default'){
			return function(state){
				return animation;
			};
		} else {
			return function(state){
				for(var i = 0; i < states.length; i++){
					if(!state[states[i]]){
						return false;
					}
				}
				return animation;
			};
		}
	},
	component = function(owner, definition){
		var spriteSheet = {
			images: definition.spriteSheet.images.slice(),
			frames: definition.spriteSheet.frames,
			animations: definition.spriteSheet.animations
		},
		self = this,
		x = 0,
		lastAnimation = '';
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

		this.addListeners(['handle-render-load', 'handle-render', 'logical-state']);

		if(definition.animationMap){
			this.checkStates = [];
			for(var i in definition.animationMap){
				this.addListener(i);
				this[i] = changeState(definition.animationMap[i]);
				this.checkStates.push(createTest(i, definition.animationMap[i]));
				lastAnimation = definition.animationMap[i];
			}
		}
		
		this.stage = undefined;
		for (x = 0; x < spriteSheet.images.length; x++){
			spriteSheet.images[x] = platformer.assets[spriteSheet.images[x]];
		}
		spriteSheet = new createjs.SpriteSheet(spriteSheet);
		this.anim = new createjs.BitmapAnimation(spriteSheet);
		this.anim.onAnimationEnd = function(animationInstance, lastAnimation){
			if(self.waitingAnimation){
				self.currentAnimation = self.waitingAnimation;
				self.waitingAnimation = false;
				self.lastState = self.waitingState;
				
				self.animationFinished = false;
				self.anim.gotoAndPlay(self.currentAnimation);
			} else {
				self.animationFinished = true;
			}
		};
		this.currentAnimation = this.owner.state || definition.state || lastAnimation || 'default';
		this.anim.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.anim.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.state = {};
		this.stateChange = false;
		this.waitingAnimation = false;
		this.waitingState = 0;
		this.playWaiting = false;
		this.animationFinished = false;
		if(this.currentAnimation){
			this.anim.gotoAndPlay(this.currentAnimation);
		}
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(obj){
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
					//debug: true,
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						//debug: true,
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
	
	proto['handle-render'] = function(){
		var testCase = false, i = 0;
		this.anim.x = this.owner.x;
		this.anim.y = this.owner.y;
		this.anim.z = this.owner.z;
		
		if(this.stateChange){
			if(this.checkStates){
				for(; i < this.checkStates.length; i++){
					testCase = this.checkStates[i](this.state);
					if(testCase){
						if(this.currentAnimation !== testCase){
							if(this.animationFinished || (this.lastState >= +i)){
								this.currentAnimation = testCase;
								this.lastState = +i;
								this.animationFinished = false;
								this.anim.gotoAndPlay(testCase);
							} else {
								this.waitingAnimation = testCase;
								this.waitingState = +i;
							}
						}
						break;
					}
				}
			}
			this.stateChange = false;
		}
	};
	
	proto['logical-state'] = function(state){
		for(var i in state){
			if(this.state[i] !== state[i]){
				this.stateChange = true;
				this.state[i] = state[i];
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.anim);
		this.anim = undefined;
		this.stage = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-image - ../src/js/standard-components/render-image.js
 */
/**
# COMPONENT **render-image**
This component is attached to entities that will appear in the game world. It renders a static image. It can render a whole image or a portion of a larger images depending on the definition.

## Dependencies
- [[Handler-Render]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render** - Repositions the image in preparation for rendering
- **handle-render-load** - The image added to the stage. Setting up the mouse input stuff.
  > @param obj.stage ([createjs.Stage][link1]) - This is the stage on which the component will be displayed.

### Local Broadcasts:
- **mousedown** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  

## JSON Definition
    {
      "type": "render-image",
      "image": "example",
      //Required: The id of the image from the asset list in config.js.
      "source": {
      //Optional - The portion of the image you are going to use.
		"width":  100,
		"height": 100,
		"y": 100,
		"x": 100   
      },
      "acceptInput": {
      	//Optional - What types of input the object should take.
      	"hover": false;
      	"click": false; 
      }, 
      "regX": 0,
      //Optional - The X offset from X position for the image.
      "regY": 0,
      //Optional - The Y offset from Y position for the image.
      "scaleX": 1,
      //Optional - The X scaling factor for the image.  Will default to 1.
      "scaleY": 1
      //Optional - The Y scaling factor for the image.  Will default to 1.
    }
    
[link1]: http://createjs.com/Docs/EaselJS/Stage.html
*/

platformer.components['render-image'] = (function(){
	var component = function(owner, definition){
		var image = definition.image,
		source    = definition.source;
		
		this.owner = owner;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
		} else {
			this.hover = false;
			this.click = false;
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render-load', 'handle-render']);
		this.stage = undefined;
		this.image = new createjs.Bitmap(platformer.assets[image]);
		if(source){
			this.image.sourceRect = new createjs.Rectangle(source.x, source.y, source.width, source.height);
		}
		this.image.regX   = definition.regX || 0;
		this.image.regY   = definition.regY || 0;
		this.image.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.image.scaleY = definition.scaleY || this.owner.scaleY || 1;
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(obj){
		var self = this,
		over     = false;
		
		this.stage = obj.stage;
		this.stage.addChild(this.image);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.click){
			if(createjs.Touch.isSupported()){
				createjs.Touch.enable(this.stage);
			}

			this.image.onPress     = function(event) {
				self.owner.trigger('mousedown', {
					//debug: true,
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						//debug: true,
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
			this.image.onMouseOut  = function(){over = false;};
			this.image.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.image.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.image.onMouseOver = function(event){
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
	
	proto['handle-render'] = function(obj){
		this.image.x = this.owner.x;
		this.image.y = this.owner.y;
		this.image.z = this.owner.z;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.image);
		this.stage = undefined;
		this.image = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-button - ../src/js/standard-components/logic-button.js
 */
/**
# COMPONENT **logic-button**
This component handles the pressed/released state of a button according to input. It can be set as a toggle button or a simple press-and-release button.

## Dependencies:
- [[Handler-Logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its state.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its current state and broadcasts its logical state to the entity.
- **pressed** - on receiving this message, the state of the button is set to "pressed".
- **released** - on receiving this message, the state of the button is set to "released".
- **mousedown** - on receiving this message, the state of the button is set to "pressed". Note that this component will not listen for "mousedown" if the component is in toggle mode.
- **mouseup** - on receiving this message, the state of the button is set to "released" unless in toggle mode, in which case it toggles between "pressed" and "released".

### Local Broadcasts:
- **logical-state** - this component will trigger this message with both "pressed" and "released" properties denoting its state. Both of these work in tandem and never equal each other.
  > @param message.pressed (boolean) - whether the button is in a pressed state.
  > @param message.released (boolean) - whether the button is in a released state.

## JSON Definition:
    {
      "type": "logic-button",
      
      "toggle": true,
      // Optional. Determines whether this button should behave as a toggle. Defaults to "false".
      
      "state": "pressed",
      // Optional. Specifies starting state of button; typically only useful for toggle buttons. Defaults to "released".
    }
*/
platformer.components['logic-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		// Create state object to send with messages here so it's not recreated each time.
		this.state = {
			released: true,
			pressed: false
		};
		this.stateChange = true;

		if(definition.state === 'pressed'){
			this.pressed();
		}

		if(definition.toggle){
			this.toggle = true;
			this.addListener('mouseup');
		} else {
			this.addListeners(['mousedown','mouseup']);
		}
		
		this.addListeners(['handle-logic', 'pressed', 'released']);
	};
	var proto = component.prototype;
	
	proto['mousedown'] = proto['pressed'] = function(){
		if(this.state.released){
			this.stateChange = true;
			this.state.pressed = true;
			this.state.released = false;
		}
	};
	
	proto['mouseup'] = function(){
		if(this.toggle){
			if(this.state.pressed){
				this.released();
			} else {
				this.pressed();
			}
		} else {
			this.released();
		}
	};
	
	proto['released'] = function(){
		if(this.state.pressed){
			this.stateChange = true;
			this.state.pressed = false;
			this.state.released = true;
		}
	};
	
	proto['handle-logic'] = function(){
		if(this.stateChange){
			this.stateChange = false;
			this.owner.trigger('logical-state', this.state);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-carrier - ../src/js/standard-components/logic-carrier.js
 */
platformer.components['logic-carrier'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['carry-me', 'release-me']);
	};
	var proto = component.prototype;
	
	proto['carry-me'] = function(resp){
		if(!this.owner.trigger('add-collision-entity', resp.entity)){
			// This message wasn't handled, so add a collision-group component and try again!
			this.owner.addComponent(new platformer.components['collision-group'](this.owner, {}));
			this.owner.trigger('add-collision-entity', this.owner);
			this.owner.trigger('add-collision-entity', resp.entity);
		}
		this.owner.parent.trigger('remove-collision-entity', resp.entity);
	};
	
	proto['release-me'] = function(resp){
		this.owner.trigger('remove-collision-entity', resp.entity);
		this.owner.parent.trigger('add-collision-entity', resp.entity);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-directional-movement - ../src/js/standard-components/logic-directional-movement.js
 */
/**
# COMPONENT **logic-directional-movement**
This component changes the (x, y) position of an object according to its current speed and heading. It maintains its own heading information independent of other components allowing it to be used simultaneously with other logic components like [[Logic-Pushable]] and [[Logic-Gravity]]. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course accordingly.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
  > @param message.deltaT - To determine how far to move the entity, the component checks the length of the tick.
- **[directional message]** - Directional messages include `go-down`, `go-south`, `go-down-left`, `go-southwest`, `go-left`, `go-west`, `go-up-left`, `go-northwest`, `go-up`, `go-north`, `go-up-right`, `go-northeast`, `go-right`, `go-east`, `go-down-right`, and `go-southeast`. On receiving one of these messages, the entity adjusts its movement orientation.
  > @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new orientation. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
- **stop** - Stops motion in all directions until movement messages are again received.
  > @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.

### Local Broadcasts:
- **logical-state** - this component will trigger this message when its movement or direction changes. Note that directions are not mutually exclusive: adjacent directions can both be true, establishing that the entity is facing a diagonal direction.
  > @param message.moving (boolean) - whether the entity is in motion.
  > @param message.left (boolean)   - whether the entity is facing left.
  > @param message.right (boolean)  - whether the entity is facing right.
  > @param message.up (boolean)     - whether the entity is facing up.
  > @param message.down (boolean)   - whether the entity is facing down.

## JSON Definition:
    {
      "type": "logic-directional-movement",
      
      "speed": 4.5
      // Optional. Defines the distance in world units that the entity should be moved per millisecond. Defaults to 0.3.
    }
*/
platformer.components['logic-directional-movement'] = (function(){
	var processDirection = function(direction){
		return function (state){
			if(state){
				this[direction] = state.pressed;
			} else {
				this[direction] = true;
			}
		};
	},
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic',
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
		
		this.speed = definition.speed || .3;

		this.state = {
			moving: false,
			left: false,
			right: false,
			up: false,
			down: false
		};
		
		this.moving = false;
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
	
	proto['handle-logic'] = function(resp){
		var vX    = 0,
		vY        = 0,
		up        = this.up        || this.upLeft || this.downLeft,
		upLeft    = this.upLeft    || (this.up   && this.left),
		left      = this.left      || this.upLeft || this.downLeft,
		downLeft  = this.downLeft  || (this.down && this.left),
		down      = this.down      || this.downLeft || this.downRight,
		downRight = this.downRight || (this.down && this.right),
		right     = this.right     || this.upRight || this.downRight,
		upRight   = this.upRight   || (this.up   && this.right),
		stateChanged = false;
		
		if (this.up && this.down){
			this.moving = false;
		} else if (this.left && this.right) {
			this.moving = false;
		} else if (upLeft) {
			vX = -this.speed / 1.414;
			vY = -this.speed / 1.414;
			this.moving = true;
		} else if (upRight) {
			vY = -this.speed / 1.414;
			vX =  this.speed / 1.414;
			this.moving = true;
		} else if (downLeft) {
			vY =  this.speed / 1.414;
			vX = -this.speed / 1.414;
			this.moving = true;
		} else if (downRight) {
			vY =  this.speed / 1.414;
			vX =  this.speed / 1.414;
			this.moving = true;
		} else if(this.left)	{
			vX = -this.speed;
			this.moving = true;
		} else if (this.right) {
			vX =  this.speed;
			this.moving = true;
		} else if (this.up) {
			vY = -this.speed;
			this.moving = true;
		} else if (this.down) {
			vY =  this.speed;
			this.moving = true;
		} else {
			this.moving = false;
		}

		this.owner.x += (vX * resp.deltaT);
		this.owner.y += (vY * resp.deltaT);
		
		if(this.state.moving !== this.moving){
			this.state.moving = this.moving;
			stateChanged = true;
		}
		if(this.state.up !== up){
			this.state.up = up;
			stateChanged = true;
		}
		if(this.state.right !== right){
			this.state.right = right;
			stateChanged = true;
		}
		if(this.state.down !== down){
			this.state.down = down;
			stateChanged = true;
		}
		if(this.state.left !== left){
			this.state.left = left;
			stateChanged = true;
		}
		
		if(stateChanged){
			this.owner.trigger('logical-state', this.state);
		}
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-gravity - ../src/js/standard-components/logic-gravity.js
 */
platformer.components['logic-gravity'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'hit-solid']);
		
		this.vX = definition.velocityX || 0; 
		this.vY = definition.velocityY || 0;
		this.maxVX = definition.maxVelocityX || definition.maxVelocity || 3;
		this.maxVY = definition.maxVelocityY || definition.maxVelocity || 3;
		this.yGravity = definition.gravity || definition.yGravity || .01;
		this.xGravity = definition.xGravity || 0;
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(resp){
		var deltaT = resp.deltaT;
		
		this.vY += this.yGravity * deltaT;
		if (this.vY > this.maxVY)
		{
			this.vY = this.maxVY;
		}
		this.vX += this.xGravity * deltaT;
		if (this.vX > this.maxVX)
		{
			this.vX = this.maxVX;
		}
		
		this.owner.x += (this.vX * deltaT);
		this.owner.y += (this.vY * deltaT);
	};
	
	proto['hit-solid'] = function(collisionInfo){
		if(((collisionInfo.y > 0) && (this.vY > 0)) || ((collisionInfo.y < 0) && (this.vY < 0))){
			this.vY = 0;
		} else if(((collisionInfo.y < 0) && (this.vX < 0)) || ((collisionInfo.x > 0) && (this.vX > 0))){
			this.vX = 0;
		}
		return true;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-portable - ../src/js/standard-components/logic-portable.js
 */
platformer.components['logic-portable'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'collision-postponement-resolved', 'hit-solid']);
		
		this.portableDirections = definition.portableDirections || {
			down: true //default is false, 'true' means as soon as carrier is connected downward
		};

        this.carrier      = this.lastCarrier = undefined;
        this.message      = {
        	entity: this.owner,
        	debug: true
        };
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(resp){
		if(this.carrierConnected){
			if(this.carrier != this.lastCarrier){
				if(this.lastCarrier){
					this.lastCarrier.trigger('release-me', this.message);
				}
				this.carrier.trigger('carry-me', this.message);
			}
			
//			this.carrierConnected = false;
		} else {
			if(this.carrier){
				this.carrier.trigger('release-me', this.message);
				this.carrier = undefined;
			}
		}
		this.lastCarrier = this.carrier;
	};
	
	proto['hit-solid'] = function(collisionInfo){
		if(collisionInfo.y > 0){
			this.updateCarrier(collisionInfo.entity, 'down',  collisionInfo.shape);
		} else if(collisionInfo.y < 0){
			this.updateCarrier(collisionInfo.entity, 'up',    collisionInfo.shape);
		} else if(collisionInfo.x < 0){
			this.updateCarrier(collisionInfo.entity, 'left',  collisionInfo.shape);
		} else if(collisionInfo.x > 0){
			this.updateCarrier(collisionInfo.entity, 'right', collisionInfo.shape);
		}
	};
	
	proto.updateCarrier = function(entity, direction, shape){
		if(this.portableDirections[direction]){
			if(entity){
				if (entity !== this.carrier){
					this.carrier = entity;
				}
				this.carrierConnected = true;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-pushable - ../src/js/standard-components/logic-pushable.js
 */
platformer.components['logic-pushable'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'push-entity', 'hit-solid']);
		
		this.vX = definition.velocityX || 0; 
		this.vY = definition.velocityY || 0;
		this.maxVX = definition.maxVelocityX || definition.maxVelocity || 3;
		this.maxVY = definition.maxVelocityY || definition.maxVelocity || 3;
		this.yPush = definition.push || definition.yPush || .01;
		this.xPush = definition.push || definition.xPush || .01;
		this.currentPushX = 0;
		this.currentPushY = 0;
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(resp){
		var deltaT = resp.deltaT;
		if(this.currentPushY){
			this.vY += (this.currentPushY / Math.abs(this.currentPushY)) * this.yPush * deltaT;
			if (this.vY > this.maxVY)
			{
				this.vY = this.maxVY;
			}
		}
		if(this.currentPushX){
			this.vX += (this.currentPushX / Math.abs(this.currentPushX)) * this.xPush * deltaT;
			if (this.vX > this.maxVX)
			{
				this.vX = this.maxVX;
			}
		}
		
		this.owner.x += (this.vX * deltaT);
		this.owner.y += (this.vY * deltaT);
		
		this.currentPushX = 0;
		this.currentPushY = 0;
		this.vX = 0;
		this.vY = 0;
	};
	
	proto['push-entity'] = function(collisionInfo){
		this.currentPushX -= (collisionInfo.x || 0);
		this.currentPushY -= (collisionInfo.y || 0);
	};
	
	proto['hit-solid'] = function(collisionInfo){
		if(((collisionInfo.y > 0) && (this.vY > 0)) || ((collisionInfo.y < 0) && (this.vY < 0))){
			this.vY = 0;
		} else if(((collisionInfo.y < 0) && (this.vX < 0)) || ((collisionInfo.x > 0) && (this.vX > 0))){
			this.vX = 0;
		}
		return true;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-counter - ../src/js/standard-components/logic-counter.js
 */
platformer.components['logic-counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.count = 0;
		if(definition.message)
		{
			this.addListener(definition.message);
			this[definition.message] = this['change-count'];
		}
		this.addListeners(['change-count']);
	};
	var proto = component.prototype;
	
	proto['change-count'] = function(data){
		this.count = data.count;
		this.owner.trigger('refresh-count', this.count);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-timer - ../src/js/standard-components/logic-timer.js
 */
platformer.components['logic-timer'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-logic']);
		this.owner.time = this.owner.time || definition.time ||  0;
		this.prevTime = this.owner.time;
		this.owner.alarmTime = this.owner.alarmTime || definition.alarmTime || false;
		this.owner.isInterval = this.owner.isInterval || definition.isInterval || false;
		this.owner.alarmMessage =  this.owner.alarmMessage || definition.alarmMessage || '';
		this.owner.updateMessage = this.owner.updateMessage || definition.updateMessage || '';
		this.owner.isOn = this.owner.on || definition.on || true;
		this.owner.isIncrementing = this.owner.isIncrementing || definition.isIncrementing || true;
		this.maxTime = 3600000; //Max time is 1hr.
	};
	var proto = component.prototype;
	
	
	proto['handle-logic'] = function(data){
		if (this.owner.isOn)
		{
			this.prevTime = this.owner.time;
			this.owner.isIncrementing ? this.owner.time += data.deltaT : this.owner.time -= data.deltaT;
			if (Math.abs(this.owner.time) > this.maxTime)
			{
				//If the timer hits the max time we turn it off so we don't overflow anything.
				if (this.owner.time > 0)
				{
					this.owner.time = this.maxTime;
				} else if (this.owner.time < 0) {
					this.owner.time = -this.maxTime;
				}
				this.owner.isOn = false;
			}
			
			if (this.owner.isInterval)
			{
				if (this.owner.isIncrementing)
				{
					if ( Math.floor(this.owner.time / this.owner.alarmTime) > Math.floor(this.prevTime / this.owner.alarmTime))
					{
						this.owner.trigger(this.owner.alarmMessage);
					}
				} else {
					if ( Math.floor(this.owner.time / this.owner.alarmTime) < Math.floor(this.prevTime / this.owner.alarmTime))
					{
						this.owner.trigger(this.owner.alarmMessage);
					}
				}
			} else {
				if (this.owner.time > this.owner.alarmTime && this.prevTime < this.owner.alarmTime)
				{
					this.owner.trigger(this.owner.alarmMessage);
				}
			}
		}
		this.owner.trigger(this.owner.updateMessage, {time: this.owner.time});
	};
	
	proto['set-time'] = function(data){
		this.owner.time = data.time;
	};
	
	proto['start-timer'] = function(){
		this.owner.isOn = true;
	};
	
	proto['stop-timer'] = function(){
		this.owner.isOn = false;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-teleporter - ../src/js/standard-components/logic-teleporter.js
 */
/**
# COMPONENT **logic-teleporter**
This component listens for redirected collision messages and fires a message on the colliding entity to specify where the colliding entity should relocate itself.

## Dependencies:
- [[Collision-Basic]] (on entity) - This component listens for collision messages on the entity.
- [[Entity-Container]] (on entity's parent) - This component listens for new peer entities being added on its parent to find its teleport destination.

## Messages

### Listens for:
- **load** - If the owner only teleports entities colliding from a certain side, this message fires `logical-state` to notify entity of current facing direction
- **peer-entity-added** - This teleporter listens as other entities are added so it can recognize the entity it should teleport colliding objects to.
  > @param message (object) - expects an entity as the message object in order to determine whether it is the requested teleportation destination.
- **teleport-entity** - On receiving this message, the component will fire `teleport` on the colliding entity, sending this.destination. The colliding entity must handle the `teleport` message and relocate itself.
  > @param message.x (integer) - uses `x` to determine if collision occurred on the left (-1) or right (1) of this entity.
  > @param message.y (integer) - uses `y` to determine if collision occurred on the top (-1) or bottom (1) of this entity.
  > @param message.entity (object) - triggers a `teleport` message on `entity`.

### Local Broadcasts:
- **logical-state** - On load, this component will send the state as the this.facing value if it exists.
  > @param message (object) - the current `this.facing` value is passed as a property of the message object: "facing-up", "facing-down", "facing-left", or "facing-right" set to `true`.

### Peer Broadcasts:
- **teleport** - On receiving a `teleport-entity` message, if the colliding entity is colliding on the teleporter's facing side, this message is triggered on the colliding entity.
  > @param message (object) - sends the destination entity as the message object, the x and y coordinates being the most important information for the listening entity.

## JSON Definition:
    {
      "type": "logic-teleporter",
      
      "facing": "up",
      // Optional: "up", "down", "left", or "right". Will only trigger "teleport" if colliding entity collides on the facing side of this entity. If nothing is specified, all collisions fire a "teleport" message on the colliding entity.
      
      "teleportId": "Destination entity's linkId property"
      // Required: String that matches the "linkId" property of the destination entity. This destination entity is passed on a "teleport" message so teleporting entity knows where to relocate.
    }
*/
platformer.components['logic-teleporter'] = (function(){

	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'peer-entity-added', 'teleport-entity']);
		
		this.destination = undefined;
		this.linkId = this.owner.teleportId || definition.teleportId;
		this.facing = this.owner.facing || definition.facing || false;
	};
	var proto = component.prototype;
	
	proto['load'] = function(resp){
		var state = {};
		if(this.facing){
			state['facing-' + this.facing] = true;
			this.owner.trigger('logical-state', state);
		}
	};
	
	proto['peer-entity-added'] = function(entity){
		if(!this.destination && (entity.linkId === this.linkId)){
			this.destination = entity;
		}
	};
	
	proto['teleport-entity'] = function(collisionInfo){
		switch(this.facing){
		case 'up':
			if(collisionInfo.y < 0) {
				collisionInfo.entity.trigger('teleport', this.destination);
			}
			break;
		case 'right':
			if(collisionInfo.x > 0) {
				collisionInfo.entity.trigger('teleport', this.destination);
			}
			break;
		case 'down':
			if(collisionInfo.y > 0) {
				collisionInfo.entity.trigger('teleport', this.destination);
			}
			break;
		case 'left':
			if(collisionInfo.x < 0) {
				collisionInfo.entity.trigger('teleport', this.destination);
			}
			break;
		default:
			collisionInfo.entity.trigger('teleport', this.destination);
			break;
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.destination = undefined;
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
 *   logic-portal - ../src/js/standard-components/logic-portal.js
 */
/**
# COMPONENT **name-of-component**
Summarize the purpose of this component here.

## Dependencies
- [[Required-Component]] - List other components that this component requires to function properly on an entity.

## Messages

### Listens for:
- **received-message-label** - List all messages that this component responds to here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Local Broadcasts:
- **local-message-label** - List all messages that are triggered by this component on this entity here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Peer Broadcasts:
- **peer-message-label** - List all messages that are triggered by this component on other entities here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

## JSON Definition
    {
      "type": "name-of-component"
      // List all additional parameters and their possible values here.
    }
*/
platformer.components['logic-portal'] = (function(){ //TODO: Change the name of the component!
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'occupied', 'activate']);
		this.destination = this.owner.destination || definition.destination;
		this.activateOn = definition.activateOn || 'collide';
		this.override = definition.override;
		this.activated = false;
		this.used = false; 
	};
	var proto = component.prototype;
	
	
	proto['handle-logic'] = function(resp){
		if (!this.used && this.activated)
		{
			this.owner.trigger("new-scene", {scene: this.destination});
			this.used = true;
		}
	};
	
	proto['occupied'] = function(collisionInfo){
		var entity = collisionInfo.entity; 
		entity.trigger('portal-waiting', this.owner);
	};
	
	proto['activate'] = function()
	{
		this.activated = true;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   collision-basic - ../src/js/standard-components/collision-basic.js
 */
platformer.components['collision-basic'] = (function(){
	var entityBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				this.owner.trigger(event, value);
			};
		} else {
			return function(value){
				for (var e in event){
					this.owner.trigger(event[e], value);
				}
			};
		}
	};
	var component = function(owner, definition){
		var x  = 0; 
		var self   = this;
		
		this.owner    = owner;
		this.lastX    = this.owner.x;
		this.lastY    = this.owner.y;
		this.aabb     = new platformer.classes.aABB();
		this.prevAABB = new platformer.classes.aABB();

		var shapes = [];
		if(definition.shapes)
		{
			shapes = definition.shapes;
		} else if (definition.shape) {
			shapes = [definition.shape];
		} else {
			var halfWidth = this.owner.width/2;
			var halfHeight = this.owner.height/2;
			var points = [[-halfWidth, -halfHeight],[halfWidth, halfHeight]];
			var offset = [0, halfHeight];
			shapes = [{offset: offset, points: points, shape: 'rectangle'}];
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load',
		                   'collide-on',
		                   'collide-off',
		                   'prepare-for-collision', 
		                   'layer:resolve-collision', 
		                   'layer:resolve-solid-collision', 
		                   'relocate-entity']);
		this.shapes = [];
		this.entities = undefined;
		for (x in shapes){
			this.shapes.push(new platformer.classes.collisionShape([this.owner.x, this.owner.y], shapes[x].type, shapes[x].points, shapes[x].offset, shapes[x].radius));
			this.prevAABB.include(this.shapes[x].getAABB());
			this.aabb.include(this.shapes[x].getAABB());
		}

		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.getPreviousAABB = function(){
			return self.getPreviousAABB();
		};
		this.owner.getShapes = function(){
			return self.getShapes();
		};
		this.owner.getPreviousX = function(){
			return self.lastX;
		};
		this.owner.getPreviousY = function(){
			return self.lastY;
		};
		
		this.owner.collisionType = definition.collisionType || 'none';
		//this.prevCollisionType = 'none';

		this.owner.solidCollisions = [];
		if(definition.solidCollisions){
			for(var i in definition.solidCollisions){
				this.owner.solidCollisions.push(i);
				if(definition.solidCollisions[i]){
					this.addListener('hit-by-' + i);
					this['hit-by-' + i] = entityBroadcast(definition.solidCollisions[i]);
				}
			}
		}

		this.owner.softCollisions = [];
		if(definition.softCollisions){
			for(var i in definition.softCollisions){
				this.owner.softCollisions.push(i);
				if(definition.softCollisions[i]){
					this.addListener('hit-by-' + i);
					this['hit-by-' + i] = entityBroadcast(definition.softCollisions[i]);
				}
			}
		}
		
		this.owner.routeTileCollision = function(axis, dir, collisionInfo){
			return self.routeTileCollision(axis, dir, collisionInfo);
		};
		
		this.owner.routeSolidCollision = function(axis, dir, collisionInfo){
			return self.routeSolidCollision(axis, dir, collisionInfo);
		};
		
		this.owner.routeSoftCollision = function(collisionInfo){
			return self.routeSoftCollision(collisionInfo);
		};
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
	};
	
	proto['collide-on'] = function(resp){
		//this.owner.collisionType = this.prevCollisionType;
		this.owner.parent.trigger('add-collision-entity', this.owner);
	};
	
	proto['collide-off'] = function(resp){
		this.owner.parent.trigger('remove-collision-entity', this.owner);
		//this.prevCollisionType = this.owner.collisionType;
		//this.owner.collisionType = 'none';
	};
	
	proto['prepare-for-collision'] = function(resp){
		this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
		this.aabb.reset();
		for (var x = 0; x < this.shapes.length; x++){
			this.shapes[x].update(this.owner.x, this.owner.y);
			this.aabb.include(this.shapes[x].getAABB());
		}
	};
	
	
	proto['relocate-entity'] = function(resp){
		if(resp.relative){
			this.owner.x = this.lastX + resp.x;// - this.shapes[0].getXOffset();
			this.owner.y = this.lastY + resp.y;// - this.shapes[0].getYOffset();
		} else {
			this.owner.x = resp.x;// - this.shapes[0].getXOffset();
			this.owner.y = resp.y;// - this.shapes[0].getYOffset();
		}

		this.aabb.reset();
		for (var x in this.shapes){
			this.shapes[x].reset(this.owner.x, this.owner.y);
			this.aabb.include(this.shapes[x].getAABB());
		}

		this.lastX = this.owner.x;
		this.lastY = this.owner.y;
//		this.aabb.move(positionXY[0], positionXY[1]);
//		this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
	};
	
	proto.getAABB = function(){
		return this.aabb;
	};
	
	proto.getPreviousAABB = function(){
		return this.prevAABB;
	};
	
	proto.getShapes = function(){
		var shapes = this.shapes.slice();
		
/*		if(this.entities && (this.entities.length > 1)){
			for (var x = 0; x < this.entities.length; x++){
				if(this.entities[x] !== this.owner){
					shapes = shapes.concat(this.entities[x].shapes || this.entities[x].getShapes());
				}
			}
		}*/
		return shapes;
	};
	
	proto.routeTileCollision = function(axis, dir, collisionInfo){
		if (this.owner.resolveTileCollision)
		{
			if (axis == 'x' && dir > 0)
			{
				return this.owner.resolveTileCollision('right', collisionInfo);
			} else if (axis == 'x' && dir < 0)
			{
				return this.owner.resolveTileCollision('left', collisionInfo);
			} else if (axis == 'y' && dir > 0)
			{
				return this.owner.resolveTileCollision('down', collisionInfo);
			} else if (axis == 'y' && dir < 0)
			{
				return this.owner.resolveTileCollision('up', collisionInfo);
			}
		}
		return true;
	};
	
	proto.routeSolidCollision = function(axis, dir, collisionInfo)
	{
		if (this.owner.resolveSolidCollision)
		{
			if (axis == 'x' && dir > 0)
			{
				return this.owner.resolveSolidCollision('right', collisionInfo);
			} else if (axis == 'x' && dir < 0)
			{
				return this.owner.resolveSolidCollision('left', collisionInfo);
			} else if (axis == 'y' && dir > 0)
			{
				return this.owner.resolveSolidCollision('down', collisionInfo);
			} else if (axis == 'y' && dir < 0)
			{
				return this.owner.resolveSolidCollision('up', collisionInfo);
			}
		}
		return true;
	};
	
	proto.routeSoftCollision = function(collisionInfo){
		if (this.owner.resolveSoftCollision)
		{
			this.owner.resolveSoftCollision(collisionInfo);
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   collision-tiles - ../src/js/standard-components/collision-tiles.js
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
		this.addListeners(['prepare-for-collision']);
		
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

	proto['prepare-for-collision'] = function(){
		
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
								shapes: [new platformer.classes.collisionShape([x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight], 'rectangle', [[-this.tileHalfWidth, -this.tileHalfHeight],[this.tileHalfWidth, this.tileHalfHeight]])]
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   ai-pacer - ../src/js/standard-components/ai-pacer.js
 */
/**
# COMPONENT **ai-pacer**
This component listens for collision messages and fires a message on itself to change its movement direction.

## Dependencies:
- [[Collision-Basic]] (on entity) - This component listens for collision messages on the entity.
- [[Logic-Directional-Movement]] (on entity) - This component receives triggered messages from this component and moves the entity accordingly.
- [[Handler-Ai]] (on entity's parent) - This component listens for an ai "tick" message to orderly perform its control logic.

## Messages

### Listens for:
- **handle-ai** - This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
- **turn-around** - On receiving this message, the component will check the collision side and re-orient itself accordingly.
  > @param message.x (integer) - uses `x` to determine if collision occurred on the left (-1) or right (1) of this entity.
  > @param message.y (integer) - uses `y` to determine if collision occurred on the top (-1) or bottom (1) of this entity.

### Local Broadcasts:
- **stop** - Triggered by this component before triggering another direction.
- **go-down**, **go-left**, **go-up**, **go-right** - Triggered in response to an entity colliding from the opposing side.

## JSON Definition:
    {
      "type": "ai-pacer",
      
      "movement": "horizontal",
      // Optional: "vertical", "horizontal", or "both". If nothing is specified, entity changes direction when colliding from any direction ("both").
      
      "direction": "up"
      // Optional: "up", "right", "down", or "left". This specifies the initial direction of movement. Defaults to "up", or "left" if `movement` is horizontal.
    }
*/
platformer.components['ai-pacer'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-ai', 'turn-around']);
		
		this.movement         = definition.movement  || 'both';
		this.lastDirection    = '';
		this.currentDirection = definition.direction || ((this.movement === 'horizontal')?'left':'up');
	};
	var proto = component.prototype;
	
	proto['handle-ai'] = function(obj){
		if(this.currentDirection !== this.lastDirection){
			this.lastDirection = this.currentDirection;
			this.owner.trigger('stop');
			this.owner.trigger('go-' + this.currentDirection);
		}
	};
	
	proto['turn-around'] = function(collisionInfo){
		if ((this.movement === 'both') || (this.movement === 'horizontal')){
			if(collisionInfo.x > 0){
				this.currentDirection = 'left';
			} else if (collisionInfo.x < 0) {
				this.currentDirection = 'right';
			}
		} 
		if ((this.movement === 'both') || (this.movement === 'vertical')){
			if(collisionInfo.y > 0){
				this.currentDirection = 'up';
			} else if (collisionInfo.y < 0) {
				this.currentDirection = 'down';
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-gui - ../src/js/example-components/render-gui.js
 */
platformer.components['render-gui'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render', 'handle-render-load', 'logic-gem-added', 'logic-gem-collected']);
		
		this.background = undefined;
		this.stage = undefined;
		
		var spriteSheetSpec = {
			images: definition.spriteSheet.images.slice(),
			frames: definition.spriteSheet.frames,
			animations: definition.spriteSheet.animations
		};
		for (var x = 0; x < spriteSheetSpec.images.length; x++)
		{
			spriteSheetSpec.images[x] = platformer.assets[spriteSheetSpec.images[x]];
		}
		var spriteSheet = new createjs.SpriteSheet(spriteSheetSpec);
		this.background = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = 'default';
		this.background.scaleX = this.owner.scaleX || 1;
		this.background.scaleY = this.owner.scaleY || 1;
		if(this.currentAnimation){
			this.background.gotoAndPlay(this.currentAnimation);
		}
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		this.stage = resp.stage;
		this.stage.addChild(this.background);
		this.background.x = 200;
		this.background.y = 200;
		this.background.z = this.owner.z;
	};
	
	proto['handle-render'] = function(resp){
		
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-counter - ../src/js/example-components/render-counter.js
 */
platformer.components['render-counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render', 'handle-render-load', 'refresh-count']);
		this.currentValue = 0;
		this.targetValue = 0;
		this.txt = new createjs.Text(this.currentValue.toString());
		this.txt.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.txt.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.txt.color = definition.color || '#000';
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		//this.stage = resp.stage;
		this.txt.x = this.owner.x;
		this.txt.y = this.owner.y;
		this.txt.z = this.owner.z;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		resp.stage.addChild(this.txt);
	};
	
	proto['handle-render'] = function(){
		// Run loading code here
		if (this.currentValue != this.targetValue)
		{
			if (this.currentValue < this.targetValue)
			{
				this.currentValue++;
			}
			if (this.currentValue > this.targetValue)
			{
				this.currentValue--;
			}
			this.txt.text = this.currentValue;
		}
	};
	
	proto['refresh-count'] = function(data){
		this.targetValue = data;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-clock - ../src/js/example-components/render-clock.js
 */
platformer.components['render-clock'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render', 'handle-render-load', 'refresh-clock']);
		this.stage = undefined;
		this.currentValue = 0;
		this.targetValue = 0;
		this.txt = new createjs.Text(this.currentValue.toString());
		this.txt.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.txt.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.txt.color = definition.color || '#000';
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		this.stage = resp.stage;
		this.txt.x = this.owner.x;
		this.txt.y = this.owner.y;
		this.txt.z = this.owner.z;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		this.stage.addChild(this.txt);
	};
	
	proto['handle-render'] = function(){
		this.txt.text = Math.floor(this.time / 1000).toString() + 'sec.';
	};
	
	proto['refresh-clock'] = function(data){
		this.time = data.time;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.txt);
		this.stage = undefined;
		this.txt = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-collectible-manager - ../src/js/example-components/logic-collectible-manager.js
 */
platformer.components['logic-collectible-manager'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'peer-entity-added', 'gem-collected']);
		
		this.gemsCollected = 0;
		this.gemTotal = 0;
	};
	var proto = component.prototype;
	
	proto['load'] = function(resp){
		
	};
	
	proto['peer-entity-added'] = function(entity){
		if(entity.type == 'gem')
		{
			this.gemTotal++;
			//this.owner.trigger('logic-gem-added', {total: this.gemTotal});
		}
	};
	
	proto['gem-collected'] = function(resp){
		this.gemsCollected++;
		this.owner.trigger("broadcast-gem-collected", {count:this.gemsCollected});
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-hero - ../src/js/example-components/logic-hero.js
 */
platformer.components['logic-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'set-velocity', 'teleport', 'portal-waiting', 'key-left','key-right','key-up','key-down','key-jump','key-swing']);
		
		this.state = {
			air: false,
			ground: true,
			left: false,
			moving: false,
			right: true,
			swing: false,
			swingHit: false
		};
		
		this.left = false;
		this.right = false;
		this.jump = false;
		
		this.vX = 0; 
		this.vY = 0;
		this.aX = .25;
		this.fX = .4;
		this.maxVX = 2;
		this.maxVY = 3;
		this.aJump = 4;
		this.aGravity = .01;
		
		this.teleportDestination = undefined;
		this.justTeleported = false;
		
		this.hitGround = false;
		
		//Handle Tile Collisions
		this.owner.resolveTileCollision = function(heading, collisionInfo){
			return self.resolveTileCollision(heading, collisionInfo);
		};
		
		//Handle Solid Collisions
		this.owner.resolveSolidCollision = function(heading, collisionInfo){
			return self.resolveSolidCollision(heading, collisionInfo);
		};
		
		//Handle Soft Collisions
		this.owner.resolveSoftCollision = function(collisionInfo){
			return self.resolveSoftCollision(collisionInfo);
		};
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(resp){
		var deltaT = resp.deltaT;
		
		if (this.teleportDestination)
		{
			this.owner.trigger('relocate-entity', this.teleportDestination);
			this.teleportDestination = undefined;
		} else {
			if(this.left) {
				this.vX -= this.aX * deltaT;
				if (this.vX < -this.maxVX) {
					this.vX = -this.maxVX;
				}
				this.state.left  = true;
				this.state.right = false;
			} else if (this.right) {
				this.vX += this.aX * deltaT;
				if (this.vX > this.maxVX)
				{
					this.vX = this.maxVX;
				}
				this.state.left  = false;
				this.state.right = true;
			} else {
				if (this.vX > 0)
				{
					this.vX -= this.fX * deltaT;
					if (this.vX < 0) {
						this.vX = 0;
					} 
				} else if (this.vX < 0)
				{
					this.vX += this.fX * deltaT;
					if (this.vX > 0) {
						this.vX = 0;
					} 
				} 
			}

			if (this.jump && this.state.ground) {
				this.vY = -this.aJump;
				this.state.air = true;
				this.state.ground = false;
				this.owner.trigger('jumping'); //This is for audio
			}
			
			this.vY += this.aGravity * deltaT;

			if (this.vY > this.maxVY) {
				this.vY = this.maxVY;
			//	} else if (this.vY < - this.maxVY) {
			//		this.vY = -this.maxVY;
			}
			
			this.owner.x += (this.vX * deltaT);
			this.owner.y += (this.vY * deltaT);
		}
		
		if (!this.hitGround)
		{
			this.state.air = true;
			this.state.ground = false;
		}
		this.hitGround = false;
		
		this.state.swingHit = false;
		if(this.swing){
			this.state.swing = true;
//			this.state.debug = true;
			if(this.swingInstance){
				this.state.swingHit = true;
				this.owner.parent.addEntity(new platformer.classes.entity(platformer.settings.entities['pickaxe'], {
					properties: {
						x: this.owner.x + (this.state.right?1:-1) * 140,
						y: this.owner.y
					}
				}));
			}
		} else {
			this.state.swing = false;
//			this.state.debug = false;
			if (this.state.ground) {
				if (this.vX == 0) {
					this.state.moving = false;
				} else {
					this.state.moving = true;
//					this.owner.trigger('walking'); //This is for audio
				}
			}
		}

		this.owner.trigger('logical-state', this.state);
		
		this.swingInstance = false;		
		
	};
	
	proto['teleport'] = function (posObj)
	{
//		this.owner.trigger('collide-off');
		this.teleportDestination = {x: posObj.x, y: posObj.y};
	};
	
	proto['portal-waiting'] = function (portal)
	{
		portal.trigger('activate');
	};
	
	proto['set-velocity'] = function (velocityObj)
	{
		if (typeof velocityObj.vX !== "undefined")
		{
			this.vX = velocityObj.vX;
		}
		if (typeof velocityObj.vY !== "undefined")
		{
			this.vY = velocityObj.vY;
		}
	};
	
	proto['key-left'] = function (state)
	{
		this.left = state.pressed;
	};
	
	proto['key-right'] = function (state)
	{
		this.right = state.pressed;
	};
	
	proto['key-jump'] = function (state)
	{
		this.jump = state.pressed;
	};

	proto['key-swing'] = function (state)
	{
		if(state.pressed)
		{
			if(!this.swing){
				this.swing = true;
				this.swingInstance = true;
			}
		} else {
			this.swing = false;
		}
	};

	proto.resolveTileCollision = function(heading, collisionInfo){
		switch (heading)
		{
		case 'down':
			this.state.ground = true;
			this.state.air = false;
			this.hitGround = true;
			this.vY = 0; 
			break;
		case 'up':
			this.vY = 0;
			break;
		}
		return true;
	};
	
	proto.resolveSolidCollision = function(heading, collisionInfo){
		switch (heading)
		{
		case 'down':
			this.state.ground = true;
			this.state.air = false;
			this.hitGround = true;
			this.vY = 0; 
			break;
		} 
		return true;
	};
	
	proto.resolveSoftCollision = function(collisionInfo){
		return false;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-gem - ../src/js/example-components/logic-gem.js
 */
platformer.components['logic-gem'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'collect-gem', 'peer-entity-added']);
		
		//Handle Tile Collisions
		this.owner.resolveTileCollision = function(heading, collisionInfo){
			return self.resolveTileCollision(heading, collisionInfo);
		};
		
		//Handle Solid Collisions
		this.owner.resolveSolidCollision = function(heading, collisionInfo){
			return self.resolveSolidCollision(heading, collisionInfo);
		};
		
		this.manager = undefined;
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		this.owner.trigger('logical-state', {state: 'default'});
	};
	
	proto['peer-entity-added'] = function(entity){
		if(entity.type == 'collectible-manager')
		{
			this.manager = entity;
		}
	};
	
	proto.resolveTileCollision = function(heading, collisionInfo){
		return false;
	};
	
	proto.resolveSolidCollision = function(heading, collisionInfo){
		return false;
	};
	
	proto['collect-gem'] = function(collisionInfo){
		if(this.manager)
		{
			this.manager.trigger('gem-collected');
		}
		this.owner.trigger('sound-collect-gem');
		this.owner.parent.removeEntity(this.owner);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.owner.resolveTileCollision = undefined;
		this.owner.resolveSolidCollision = undefined;
		this.owner.resolveSoftCollision = undefined;
		this.manager = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   logic-gui - ../src/js/example-components/logic-gui.js
 */
platformer.components['logic-gui'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'gui-gem-collected']);
	};
	var proto = component.prototype;
	
	proto['load'] = function(resp){
		this.owner.trigger('logical-state', {state: 'default'});
	};
	
	proto['gui-gem-collected'] = function(data){
		this.owner.trigger('count-gems', {count: data.count});
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
 *   render-fps-counter - ../src/js/example-components/render-fps-counter.js
 */
platformer.components['render-fps-counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render', 'handle-render-load', 'toggle-visible', 'time-elapsed']);
		this.stage = undefined;
		
		var font = definition.font || "12px Arial";
		this.counter = new createjs.Text('SOON TO BE FPS', font);
		this.counter.x = definition.x || this.owner.x || 20;
		this.counter.y = definition.y || this.owner.y || 20;
		this.counter.z = definition.z || this.owner.z || 1000;
		this.counter.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.counter.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.counter.color = definition.color || '#000';
		this.counter.textAlign = "left";
		this.counter.textBaseline = "middle";
		
		this.times = {};
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		this.stage = resp.stage;
		this.stage.addChild(this.counter);
	};
	
	proto['handle-render'] = function(){
		var text = Math.floor(createjs.Ticker.getMeasuredFPS()) + " FPS\n";
		for(var name in this.times){
			text += '\n' + name + ': ' + this.times[name] + 'ms';
			this.times[name] = 0;
		}
		this.counter.text = text;
	};
	
	proto['toggle-visible'] = function(){
		this.counter.visible = !this.counter.visible;  
	};
	
	proto['time-elapsed'] = function(value){
		if(value){
			if(value.name){
				this.times[value.name] += value.time;
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.counter);
		this.stage = undefined;
		this.counter = undefined;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
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
			touch:       !!('ontouchstart' in window),

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
			multitouch:false, //determined below
			
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
	
	//Determine multitouch:
	if(supports.touch){
		if (supports.android){
			if(parseInt(uagent.slice(uagent.indexOf("android") + 8)) > 2){
				supports.multitouch = true;
			}
		} else {
			supports.multitouch = true;
		}
	}
	
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

	platformer.settings.supports = supports;

})();


/*--------------------------------------------------
 *   iOSAudio - ../src/js/HTMLiOSAudioPlugin.js
 */
/*
* HTMLiOSAudioPlugin for SoundJS
* 
* HTMLiOSAudioPlugin borrows heavily from HTMLAudioPlugin, with the
* sole goal of introducing a SoundJS plugin that works on iOS devices.
* The edits to enable this were written by Derek Detweiler.
*
* HTMLAudioPlugin for SoundJS
*
* Copyright (c) 2012 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @module SoundJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {

	/**
	 * Play sounds using HTML <audio> tags in the browser.
	 * @class HTMLiOSAudioPlugin
	 * @constructor
	 */
	function HTMLiOSAudioPlugin() {
		this.init();
	}

	var s = HTMLiOSAudioPlugin;

	/**
	 * The maximum number of instances that can be played. This is a browser limitation.
	 * @property MAX_INSTANCES
	 * @type Number
	 * @default 30
	 * @static
	 */
	s.MAX_INSTANCES = 30;

	/**
	 * The capabilities of the plugin.
	 * @property capabilities
	 * @type Object
	 * @default null
	 * @static
	 */
	s.capabilities = null;

	s.lastId = 0;

	// Event constants
	s.AUDIO_READY = "canplaythrough";
	s.AUDIO_ENDED = "ended";
	s.AUDIO_ERROR = "error"; //TODO: Handle error cases
	s.AUDIO_STALLED = "stalled";

	//TODO: Not used. Chrome can not do this when loading audio from a server.
	s.fillChannels = false;

	/**
	 * Determine if the plugin can be used.
	 * @method isSupported
	 * @return {Boolean} If the plugin can be initialized.
	 * @static
	 */
	s.isSupported = function() {
		s.generateCapabilities();
		var t = s.tag;
		if (t == null) { return false; }
		return true;
	};

	/**
	 * Determine the capabilities of the plugin.
	 * @method generateCapabiities
	 * @static
	 */
	s.generateCapabilities = function() {
		if (s.capabilities != null) { return; }
		var t = s.tag = document.createElement("audio");
		if (t.canPlayType == null) { return null; }
		var c = s.capabilities = {
			panning: false,
			volume: true,
			mp4: t.canPlayType("audio/mp4") != "no" && t.canPlayType("audio/mp4") != "",
			channels: s.MAX_INSTANCES
		};
	}

	var p = s.prototype = {

		capabilities: null,
		FT: 0.001,
		channels: null,

		init: function() {
			this.capabilities = s.capabilities;
			this.channels = {};
		},

		/**
		 * Pre-register a sound instance when preloading/setup.
		 * @method register
		 * @param {String} src The source of the audio
		 * @param {Number} instances The number of concurrently playing instances to allow for the channel at any time.
		 * @return {Object} A result object, containing a tag for preloading purposes.
		 */
		register: function(src, instances) {
			var channel = TagChannel.get(src);
			var tag;
			for (var i=0, l=instances||1; i<l; i++) {
				tag = this.createTag(src);
				channel.add(tag);
			}
			return {
				tag: tag // Return one instance for preloading purposes
			};
		},

		createTag: function(src) {
			var tag = document.createElement("audio");
			tag.preload = false;
			tag.src = src;
			//tag.type = "audio/ogg"; //LM: Need to set properly
			return tag;
		},

		/**
		 * Create a sound instance.
		 * @method create
		 * @param {String} src The source to use.
		 * @return {SoundInstance} A sound instance for playback and control.
		 */
		create: function(src) {
			var instance = new SoundInstance(src);
			instance.owner = this;
			return instance;
		},

		toString: function() {
			return "[HTMLiOSAudioPlugin]";
		}

	}

	createjs.HTMLiOSAudioPlugin = HTMLiOSAudioPlugin;


	/**
	 * Sound Instances are created when any calls to SoundJS.play() are made.
	 * The instances are returned by the active plugin for control by the user.
	 * Users can control audio directly through the instance.
	 * @class SoundInstance
	 * @param {String} src The path to the sound
	 * @constructor
	 */
	function SoundInstance(src) {
		this.init(src);
	}

	var p = SoundInstance.prototype = {

		//TODO: Fading out when paused/stopped?

		/**
		 * The source of the sound.
		 * @property src
		 * @type String
		 * @default null
		 */
		src: null,

		/**
		 * The unique ID of the instance
		 * @property uniqueId
		 * @type String | Number
		 * @default -1
		 */
		uniqueId:-1,

		/**
		 * The play state of the sound. Play states are defined as constants on SoundJS
		 * @property playState
		 * @type String
		 * @default null
		 */
		playState: null,

		/**
		 * The plugin that created the instance
		 * @property owner
		 * @type HTMLiOSAudioPlugin
		 * @default null
		 */
		owner: null,

		loaded: false,
		lastInterrupt: createjs.SoundJS.INTERRUPT_NONE,
		offset: 0,
		delay: 0,
		volume: 1,
		pan: 0,

		remainingLoops: 0,
		delayTimeout: -1,
		tag: null,


		/**
		 * Determines if the audio is currently muted.
		 * @property muted
		 * @type Boolean
		 * @default false
		 */
		muted: false,

		/**
		 * Determines if the audio is currently paused. If the audio has not yet started playing,
		 * it will be true, unless the user pauses it.
		 * @property paused
		 * @type Boolean
		 * @default false
		 */
		paused: false,


		/**
		 * The callback that is fired when a sound has completed playback
		 * @event onComplete
		 */
		onComplete: null,

		/**
		 * The callback that is fired when a sound has completed playback, but has loops remaining.
		 * @event onLoop
		 */
		onLoop: null,

		/**
		 * The callback that is fired when a sound is ready to play.
		 * @event onReady
		 */
		onReady: null,

		/**
		 * The callback that is fired when a sound has failed to start.
		 * @event onPlayFailed
		 */
		onPlayFailed: null,

		/**
		 * The callback that is fired when a sound has been interrupted.
		 * @event onPlayInterrupted
		 */
		onPlayInterrupted: null,

		// Proxies, make removing listeners easier.
		endedHandler: null,
		readyHandler: null,
		stalledHandler:null,

		// Constructor
		init: function(src) {
			this.uniqueId = createjs.HTMLiOSAudioPlugin.lastId++;
			this.src = src;
			this.endedHandler = createjs.SoundJS.proxy(this.handleSoundComplete, this);
			this.readyHandler = createjs.SoundJS.proxy(this.handleSoundReady, this);
			this.stalledHandler = createjs.SoundJS.proxy(this.handleSoundStalled, this);
		},

		cleanUp: function() {
			var tag = this.tag;
			if (tag != null) {
				tag.pause();
				try { tag.currentTime = 0; } catch (e) {} // Reset Position
				tag.removeEventListener(createjs.HTMLiOSAudioPlugin.AUDIO_ENDED, this.endedHandler, false);
				tag.removeEventListener(createjs.HTMLiOSAudioPlugin.AUDIO_READY, this.readyHandler, false);
				TagChannel.setInstance(this.src, tag);
				this.tag = null;
			}

			if (window.createjs == null) { return; }
			createjs.SoundJS.playFinished(this);
		},

		interrupt: function () {
			if (this.tag == null) { return; }
			this.playState = createjs.SoundJS.PLAY_INTERRUPTED;
			if (this.onPlayInterrupted) { this.onPlayInterrupted(this); }
			this.cleanUp();
			this.paused = false;
		},

	// Public API
		/**
		 * Play an instance. This API is only used to play an instance after it has been stopped
		 * or interrupted.`
		 * @method play
		 * @param {String} interrupt How this sound interrupts other instances with the same source. Interrupt values are defined as constants on SoundJS.
		 * @param {Number} delay The delay in milliseconds before the sound starts
		 * @param {Number} offset How far into the sound to begin playback.
		 * @param {Number} loop The number of times to loop the audio. Use -1 for infinite loops.
		 * @param {Number} volume The volume of the sound between 0 and 1.
		 * @param {Number} pan The pan of the sound between -1 and 1. Note that pan does not work for HTML Audio.
		 */
		play: function(interrupt, delay, offset, loop, volume, pan) {
			this.cleanUp();
			createjs.SoundJS.playInstance(this, interrupt, delay, offset, loop, volume, pan);
		},

		// Called by SoundJS when ready
		beginPlaying: function(offset, loop, volume, pan) {
			if (window.createjs == null) { return; }
			var tag = this.tag = TagChannel.getInstance(this.src);
			if (tag == null) { this.playFailed(); return -1; }

			tag.addEventListener(createjs.HTMLiOSAudioPlugin.AUDIO_ENDED, this.endedHandler, false);

			this.offset = offset;
			this.volume = volume;
			this.updateVolume();
			this.remainingLoops = loop;

			if (tag.readyState !== 4) {
				tag.addEventListener(createjs.HTMLiOSAudioPlugin.AUDIO_READY, this.readyHandler, false);
				tag.addEventListener(createjs.HTMLiOSAudioPlugin.AUDIO_STALLED, this.stalledHandler, false);
				tag.load();
			} else {
				this.handleSoundReady(null);
			}

			return 1;
		},

		handleSoundStalled: function(event) {
			if (this.onPlayFailed != null) { this.onPlayFailed(this); }
			this.cleanUp();
		},

		handleSoundReady: function(event) {
			if (window.createjs == null) { return; }
			this.playState = createjs.SoundJS.PLAY_SUCCEEDED;
			this.paused = false;
			this.tag.removeEventListener(createjs.HTMLiOSAudioPlugin.AUDIO_READY, this.readyHandler, false);

			if(this.offset >= this.getDuration()) {
				this.playFailed();
				return;
			} else if (this.offset > 0) {
				this.tag.currentTime = this.offset * 0.001;
			}
			if (this.remainingLoops == -1) { this.tag.loop = true; }
			this.tag.play();
		},

		/**
		 * Pause the instance.
		 * @method pause
		 * @return {Boolean} If the pause call succeeds.
		 */
		pause: function() {
			this.paused = true;
			// Note: when paused by user, we hold a reference to our tag. We do not release it until stopped.
			if (this.tag != null) {
				this.tag.pause();
				return false;
			}
			return true;
		},

		/**
		 * Resume a sound instance that has been paused.
		 * @method resume
		 * @return {Boolean} If the resume call succeeds.
		 */
		resume: function() {
			this.paused = false;
			if (this.tag != null) {
				this.tag.play();
				return false;
			}
			return true;
		},

		/**
		 * Stop a sound instance.
		 * @method stop
		 * @return {Boolean} If the stop call succeeds.
		 */
		stop: function() {
			this.pause();
			this.playState = createjs.SoundJS.PLAY_FINISHED;
			this.cleanUp();
			return true;
		},

		// Called by SoundJS
		setMasterVolume: function(value) {
			this.updateVolume();
			return true;
		},

		/**
		 * Set the volume of the sound instance.
		 * @method setVolume
		 * @param value
		 * @return {Boolean} If the setVolume call succeeds.
		 */
		setVolume: function(value) {
			this.volume = value;
			this.updateVolume();
			return true;
		},

		updateVolume: function() {
			if (this.tag != null) {
				this.tag.volume = this.muted ? 0 : this.volume * createjs.SoundJS.masterVolume;
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Get the volume of the sound, not including how the master volume has affected it.
		 * @method getVolume
		 * @param value
		 * @return The volume of the sound.
		 */
		getVolume: function(value) {
			return this.volume;
		},

		/**
		 * Mute the sound.
		 * @method mute
		 * @param {Boolean} isMuted If the sound should be muted or not.
		 * @return {Boolean} If the mute call succeeds.
		 */
		mute: function(isMuted) {
			this.muted = isMuted;
			this.updateVolume();
			return true;
		},

		/**
		 * Set the pan of a sound instance. Note that this does not work in HTML audio.
		 * @method setPan
		 * @param {Number} value The pan value between -1 (left) and 1 (right).
		 * @return {Number} If the setPan call succeeds.
		 */
		setPan: function(value) { return false; }, // Can not set pan in HTML

		/**
		 * Get the pan of a sound instance. Note that this does not work in HTML audio.
		 * @method getPan
		 * @return {Number} The value of the pan between -1 (left) and 1 (right).
		 */
		getPan: function() { return 0; },

		/**
		 * Get the position of the playhead in the sound instance.
		 * @method getPosition
		 * @return {Number} The position of the playhead in milliseconds.
		 */
		getPosition: function() {
			if (this.tag == null) { return 0; }
			return this.tag.currentTime * 1000;
		},

		/**
		 * Set the position of the playhead in the sound instance.
		 * @method setPosition
		 * @param {Number} value The position of the playhead in milliseconds.
		 */
		setPosition: function(value) {
			if (this.tag == null) { return false; }
			try {
				this.tag.currentTime = value * 0.001;
			} catch(error) { // Out of range
				return false;
			}
			return true;
		},

		/**
		 * Get the duration of the sound instance.
		 * @method getDuration
		 * @return {Number} The duration of the sound instance in milliseconds.
		 */
        getDuration: function() {
            if (this.tag == null) { return 0; }
            return this.tag.duration * 1000;
        },

		handleSoundComplete: function(event) {
			if (this.remainingLoops != 0) {
				this.remainingLoops--;
				//try { this.tag.currentTime = 0; } catch(error) {}
				this.tag.play();
				if (this.onLoop != null) { this.onLoop(this); }
				return;
			}

			if (window.createjs == null) { return; }
			this.playState = createjs.SoundJS.PLAY_FINISHED;
			if (this.onComplete != null) { this.onComplete(this); }
			this.cleanUp();
		},

		// Play has failed
		playFailed: function() {
			if (window.createjs == null) { return; }
			this.playState = createjs.SoundJS.PLAY_FAILED;
			if (this.onPlayFailed != null) { this.onPlayFailed(this); }
			this.cleanUp();
		},

		toString: function() {
			return "[HTMLiOSAudioPlugin SoundInstance]";
		}

	};

	// Do not add to namespace.


	/**
	 * The TagChannel is an object pool for HTML tag instances.
	 * In Chrome, we have to pre-create the number of tag instances that we are going to play
	 * before we load the data, otherwise the audio stalls. (Note: This seems to be a bug in Chrome)
	 * @class TagChannel
	 * @param src The source of the channel.
	 * @private
	 */
	function TagChannel(src) {
		this.init(src);
	}

	/**
	 * Contains each sound channel, indexed by src.
	 * @private
	 */
	TagChannel.channels = {};
	/**
	 * Get a tag channel.
	 * @private
	 */
	TagChannel.get = function(src) {
		var channel = TagChannel.channels[src];
		if (channel == null) {
			channel = TagChannel.channels[src] = new TagChannel(src);
		}
		return channel;
	};

	/**
	 * Get a tag instance. This is a shortcut method.
	 * @private
	 */
	TagChannel.getInstance = function(src) {
		var channel = TagChannel.channels[src];
		if (channel == null) { return null; }
		return channel.get();
	};

	/** Return a tag instance. This is a shortcut method.
	 * @private
	 */
	TagChannel.setInstance = function(src, tag) {
		var channel = TagChannel.channels[src];
		if (channel == null) { return null; }
		return channel.set(tag);
	};

	TagChannel.prototype = {

		src: null,
		length: 0,
		available: 0,
		tags: null,

		init: function(src) {
			this.src = src;
			this.tags = [];
		},

		add: function(tag) {
			this.tags.push(tag);
			this.length++;
			this.available = this.tags.length;
		},

		get: function() {
			if (this.tags.length == 0) { return null; }
			this.available = this.tags.length;
			var tag = this.tags.pop();
			if(!tag.parentNode){
				document.body.appendChild(tag);
			}
			return tag;
		},

		set: function(tag) {
			var index = this.tags.indexOf(tag);
			if (index == -1) {
				this.tags.push(tag);
			}

//				document.body.removeChild(tag);

			this.available = this.tags.length;
		},

		toString: function() {
			return "[HTMLiOSAudioPlugin TagChannel]";
		}

		// do not add to namespace

	};

}());


/*--------------------------------------------------
 *   SoundJSm4a - ../src/js/SoundJSm4aOverride.js
 */
/*
* SoundJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* The edits to enable m4a were written by Derek Detweiler.
*
* Copyright (c) 2012 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/


// namespace:
this.createjs = this.createjs||{};

/**
 * The SoundJS library manages the playback of audio in HTML, via plugins which
 * abstract the actual implementation, and allow multiple playback modes depending
 * on the environment.
 *
 * For example, a developer could specify:
 *   [WebAudioPlugin, HTML5AudioPlugin, FlashAudioPlugin]
 * In the latest browsers with webaudio support, a WebAudio plugin would be used,
 * other modern browsers could use HTML5 audio, and older browsers with no HTML5
 * audio support would use the Flash Plugin.
 *
 * Note that there is not currently a supported WebAudio plugin.
 *
 * @module SoundJS
 */

(function() {

	//TODO: Interface to validate plugins and throw warnings
	//TODO: Determine if methods exist on a plugin before calling
	//TODO: Interface to validate instances and throw warnings
	//TODO: Surface errors on audio from all plugins

	//TODO: Timeouts
	//TODO: Put Plugins on SoundJS.lib?

	/**
	 * The public API for creating sounds, and controlling the overall sound levels,
	 * and affecting multiple sounds at once. All SoundJS APIs are static.
	 *
	 * SoundJS can also be used as a PreloadJS plugin to help preload audio properly.
	 * @class SoundJS
	 * @constructor
	 */
	function SoundJS() {
		throw "SoundJS cannot be instantiated";
	}

	var s = SoundJS;

	/**
	 * Determine how audio is split, when multiple paths are specified in a source.
	 * @property DELIMITER
	 * @type String
	 * @default |
	 * @static
	 */
	s.DELIMITER = "|";

	/**
	 * The duration in milliseconds to determine a timeout.
	 * @property AUDIO_TIMEOUT
	 * @static
	 * @type Number
	 * @default 8000
	 */
	s.AUDIO_TIMEOUT = 8000; //TODO: Not fully implemented

	/**
	 * The interrupt value to use to interrupt any currently playing instance with the same source.
	 * @property INTERRUPT_ANY
	 * @type String
	 * @default any
	 * @static
	 */
	s.INTERRUPT_ANY = "any";

	/**
	 * The interrupt value to use to interrupt the earliest currently playing instance with the same source.
	 * @property INTERRUPT_EARLY
	 * @type String
	 * @default early
	 * @static
	 */
	s.INTERRUPT_EARLY = "early";

	/**
	 * The interrupt value to use to interrupt the latest currently playing instance with the same source.
	 * @property INTERRUPT_LATE
	 * @type String
	 * @default late
	 * @static
	 */
	s.INTERRUPT_LATE = "late";

	/**
	 * The interrupt value to use to interrupt no currently playing instances with the same source.
	 * @property INTERRUPT_NONE
	 * @type String
	 * @default none
	 * @static
	 */
	s.INTERRUPT_NONE = "none";

	// Important, implement playState in plugins with these values.

	/**
	 * Defines the playState of an instance that is still initializing.
	 * @property PLAY_INITED
	 * @type String
	 * @default playInited
	 * @static
	 */
	s.PLAY_INITED = "playInited";

	/**
	 * Defines the playState of an instance that is currently playing or paused.
	 * @property PLAY_SUCCEEDED
	 * @type String
	 * @default playSucceeded
	 * @static
	 */
	s.PLAY_SUCCEEDED = "playSucceeded";

	/**
	 * Defines the playState of an instance that was interrupted by another instance.
	 * @property PLAY_INTERRUPTED
	 * @type String
	 * @default playInterrupted
	 * @static
	 */
	s.PLAY_INTERRUPTED = "playInterrupted";

	/**
	 * Defines the playState of an instance that completed playback.
	 * @property PLAY_FINISHED
	 * @type String
	 * @default playFinished
	 * @static
	 */
	s.PLAY_FINISHED = "playFinished";

	/**
	 * Defines the playState of an instance that failed to play. This is usually caused by a lack of available channels
	 * when the interrupt mode was "INTERRUPT_NONE", the playback stalled, or the sound could not be found.
	 * @property PLAY_FAILED
	 * @type String
	 * @default playFailed
	 * @static
	 */
	s.PLAY_FAILED = "playFailed";

	/**
	 * The currently active plugin. If this is null, then no plugin could be initialized.
	 * If no plugin was specified, only the HTMLAudioPlugin is tested.
	 * @property activePlugin
	 * @type Object
	 * @default null
	 * @static
	 */
	s.activePlugin = null;

	/**
	 * SoundJS is currently muted. No audio will play, unless existing instances are unmuted. This property
	 * is read-only.
	 * @property muted
	 * @type {Boolean}
	 * @default false
	 */
	s.muted = false;


// Private
	s.pluginsRegistered = false;
	s.masterVolume = 1;
	s.instances = [];
	s.instanceHash = {};
	s.idHash = null;
	s.defaultSoundInstance = null;

	/**
	 * Get the preload rules to be used by PreloadJS. This function should not be called, except by PreloadJS.
	 * @method getPreloadHandlers
	 * @return {Object} The callback, file types, and file extensions to use for preloading.
	 * @static
	 * @private
	 */
	s.getPreloadHandlers = function() {
		return {
			callback: s.proxy(s.initLoad, s),
			types: ["sound"],
			extensions: ["mp3", "m4a", "ogg", "wav"]
		}
	}

	/**
	 * Register a list of plugins, in order of precedence.
	 * @method registerPlugins
	 * @param {Array} plugins An array of plugins to install.
	 * @return {Boolean} Whether a plugin was successfully initialized.
	 * @static
	 */
	s.registerPlugins = function(plugins) {
		s.pluginsRegistered = true;
		for (var i=0, l=plugins.length; i<l; i++) {
			var plugin = plugins[i];
			if (plugin == null) { continue; } // In case a plugin is not defined.
			// Note: Each plugin is passed in as a class reference, but we store the activePlugin as an instances
			if (plugin.isSupported()) {
				s.activePlugin = new plugin();
				//TODO: Check error on initialization?
				return true;
			}
		}
		return false;
	}

	/**
	 * Register a SoundJS plugin. Plugins handle the actual playing
	 * of audio. By default the HTMLAudio plugin will be installed if
	 * no other plugins are present when the user starts playback.
	 * @method registerPlugin
	 * @param {Object} plugin The plugin class to install.
	 * @return {Boolean} Whether the plugin was successfully initialized.
	 * @static
	 */
	s.registerPlugin = function(plugin) {
		s.pluginsRegistered = true;
		if (plugin == null) { return false; }
		if (plugin.isSupported()) {
			s.activePlugin = new plugin();
			return true;
		}
		return false;
	}

	/**
	 * Determines if SoundJS has been initialized, and a plugin has been activated.
	 * @method isReady
	 * @return {Boolean} If SoundJS has initialized a plugin.
	 * @static
	 */
	s.isReady = function() {
		return (s.activePlugin != null);
	}

	/**
	 * Get the active plugin's capabilities, which help determine if a plugin can be
	 * used in the current environment, or if the plugin supports a specific feature.
	 * Capabilities include:
	 * <ul>
	 *     <li><b>panning:</b> If the plugin can pan audio from left to right</li>
	 *     <li><b>volume;</b> If the plugin can control audio volume.</li>
	 *     <li><b>mp3:</b> If MP3 audio is supported.</li>
	 *     <li><b>ogg:</b> If OGG audio is supported.</li>
	 *     <li><b>wav:</b> If WAV audio is supported.</li>
	 *     <li><b>mpeg:</b> If MPEG audio is supported.</li>
	 *     <li><b>channels:</b> The maximum number of audio channels that can be created.</li>
	 * @method getCapabilities
	 * @return {Object} An object containing the capabilities of the active plugin.
	 * @static
	 */
	s.getCapabilities = function() {
		if (s.activePlugin == null) { return null; }
		return s.activePlugin.capabilities;
	}

	/**
	 * Get a specific capability of the active plugin. See the <b>getCapabilities</b> for a full list
	 * of capabilities.
	 * @method getCapability
	 * @param {String} key The capability to retrieve
	 * @return {String | Number | Boolean} The capability value.
	 * @static
	 */
	s.getCapability = function(key) {
		if (s.activePlugin == null) { return null; }
		return s.activePlugin.capabilities[key];
	}

	/**
	 * Process manifest items from PreloadJS.
	 * @method initLoad
	 * @param {String | Object} value The src or object to load
	 * @param {String} type The optional type of object. Will likely be "sound".
	 * @param {String} id An optional id
	 * @param {Number | String | Boolean | Object} data Optional data associated with the item
	 * @return {Object} An object with the modified values that were passed in.
	 * @private
	 */
	s.initLoad = function(src, type, id, data) {
		if (!s.checkPlugin(true)) { return false; }

		var details = s.parsePath(src, type, id, data);
		if (details == null) { return false; }

		if (id != null) {
			if (s.idHash == null) { s.idHash = {}; }
			s.idHash[id] = details.src;
		}

		var ok = SoundChannel.create(details.src, data);
		var instance = s.activePlugin.register(details.src, data);
		if (instance != null) {
			// If the instance returns a tag, return it instead for preloading.
			if (instance.tag != null) { details.tag = instance.tag; }
			else if (instance.src) { details.src = instance.src; }
			// If the instance returns a complete handler, pass it on to the prelaoder.
			if (instance.completeHandler != null) { details.handler = instance.completeHandler; }
		}
		return details;
	}

	/**
	 * Parse the path of a manifest item
	 * @method parsePath
	 * @param {String | Object} value
	 * @param {String} type
	 * @param {String} id
	 * @param {Number | String | Boolean | Object} data
	 * @return {Object} A formatted object to load.
	 * @private
	 */
	s.parsePath = function(value, type, id, data) {
		// Assume value is string.
		var sounds = value.split(s.DELIMITER);
		var ret = {type:type||"sound", id:id, data:data, handler:s.handleSoundReady};
		var found = false;
		var c = s.getCapabilities();
		for (var i=0, l=sounds.length; i<l; i++) {
			var sound = sounds[i];
			var point = sound.lastIndexOf(".");
			var ext = sound.substr(point+1).toLowerCase();
			var name = sound.substr(0, point).split("/").pop();
			switch (ext) {
				case "mp3":
					if (c.mp3) { found = true; }
					break;
				case "m4a":
					if (c.mp4) { found = true; }
					break;
				case "ogg":
					if (c.ogg) { found = true; }
					break;
				case "wav":
					if (c.wav) { found = true; }
					break;
				// TODO: Other cases.
			}

			if (found) {
				ret.name = name;
				ret.src = sound;
				ret.extension = ext;
				return ret;
			}
		}
		return null;
	}


	/* ---------------
	 Static API.
	--------------- */
	/**
	 * Play a sound, receive an instance to control. If the sound failed to play, the soundInstance
	 * will still be returned, and have a playState of SoundJS.PLAY_FAILED. Note that even on sounds with
	 * failed playback, you may still be able to call play(), since the failure could be due to lack of available
	 * channels.
	 * @method play
	 * @param {String} value The src or ID of the audio.
	 * @param {String} interrupt How to interrupt other instances of audio. Values are defined as constants on SoundJS.
	 * @param {Number} delay The amount of time to delay the start of the audio. Delay is in milliseconds.
	 * @param {Number} offset The point to start the audio. Offset is in milliseconds.
	 * @param {Number} loop Determines how many times the audio loops when it reaches the end of a sound. Default is 0 (no loops). Set to -1 for infinite.
	 * @param {Number} volume The volume of the sound, between 0 and 1
	 * @param {Number} pan The left-right pan of the sound (if supported), between -1 (left) and 1 (right)
	 * @return {SoundInstance} A SoundInstance that can be controlled after it is created.
	 * @static
	 */
	s.play = function (src, interrupt, delay, offset, loop, volume, pan) {
		if (!s.checkPlugin(true)) { return s.defaultSoundInstance; }
		src = s.getSrcFromId(src);
		var instance = s.activePlugin.create(src);
		try { instance.mute(s.muted); } catch(error) { } // Sometimes, plugin isn't ready!
		var ok = s.playInstance(instance, interrupt, delay, offset, loop, volume, pan);
		if (!ok) { instance.playFailed(); }
		return instance;
	}

	/**
	 * Play an instance. This is called by the static API, as well as from plugins. This allows the
	 * core class to control delays.
	 * @method playInstance
	 * @return {Boolean} If the sound can start playing.
	 * @protected
	 */
	s.playInstance = function(instance, interrupt, delay, offset, loop, volume, pan) {
		interrupt = interrupt || s.INTERRUPT_NONE;
		if (delay == null) { delay = 0; }
		if (offset == null) { offset = 0; }
		if (loop == null) { loop = 0; }
		if (volume == null) { volume = 1; }
		if (pan == null) { pan = 0; }

		if (delay == 0) {
			var ok = s.beginPlaying(instance, interrupt, offset, loop, volume, pan);
			if (!ok) { return false; }
		} else {
			//Note that we can't pass arguments to proxy OR setTimeout (IE), so just wrap the function call.
			setTimeout(function() {
					s.beginPlaying(instance, interrupt, offset, loop, volume, pan);
				}, delay); //LM: Can not stop before timeout elapses. Maybe add timeout interval to instance?
		}

		this.instances.push(instance);
		this.instanceHash[instance.uniqueId] = instance;

		return true;
	}

	/**
	 * Begin playback. This is called immediately, or after delay by SoundJS.beginPlaying
	 * @method beginPlaying
	 * @protected
	 */
	s.beginPlaying = function(instance, interrupt, offset, loop, volume, pan) {
		if (!SoundChannel.add(instance, interrupt)) { return false; }
		var result = instance.beginPlaying(offset, loop, volume, pan);
		if (!result) {
			var index = this.instances.indexOf(instance);
			if (index > -1) {
				this.instances.splice(index, 1);
			}
			delete this.instanceHash[instance.uniqueId];
			return false;
		}
		return true;
	}

	/**
	 * Determine if a plugin has been initialized. Optionally initialize the default plugin, which enables
	 * SoundJS to work without manually setting up the plugins.
	 * @method checkPlugin
	 * @param {Boolean} initializeDefault Determines if the default plugin should be initialized if there
	 * is not yet a plugin when this is checked.
	 * @returns If a plugin is initialized. If the browser does not have the capabilities to initialize
	 * an available plugin, this will be false.
	 */
	s.checkPlugin = function(initializeDefault) {
		if (s.activePlugin == null) {
			if (initializeDefault && !s.pluginsRegistered) {
				s.registerPlugin(createjs.HTMLAudioPlugin);
			}
			if (s.activePlugin == null) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Get the source of a sound via the ID passed in with the manifest. If no ID is found
	 * the value is passed back.
	 * @method getSrcFromId
	 * @param value The name or src of a sound.
	 * @return {String} The source of the sound.
	 * @static
	 */
	s.getSrcFromId = function(value) {
		if (s.idHash == null || s.idHash[value] == null) { return value; }
		return s.idHash[value];
	}


/* ---------------
 Global controls
--------------- */
	/**
	 * Set the volume of all sounds. This sets the volume value of all audio, and
	 * is not a "master volume". Use setMasterVolume() instead.
	 * @method setVolume
	 * @param {Number} The volume to set on all sounds. The acceptable range is 0-1.
	 * @param {String} id Optional, the specific sound ID to target.
	 * @return {Boolean} If the volume was set.
	 * @static
	 */
	s.setVolume = function(value, id) {
		// don't deal with null volume
		if (Number(value) == null) { return false; }
		value = Math.max(0, Math.min(1, value));

		return s.tellAllInstances("setVolume", id, value);
		/*SoundJS.activePlugin.setVolume(value, SoundJS.getSrcFromId(id));*/
		//return true;
	}

	/**
	 * Get the master volume. All sounds multiply their current volume against the master volume.
	 * @method getMasterVolume
	 * @return {Number} The master volume
	 * @static
	 */
	s.getMasterVolume = function() { return s.masterVolume; }
	/**
	 * To set the volume of all instances at once, use the setVolume() method.
	 * @method setMasterVolume
	 * @param {Number} value The master volume to set.
	 * @return {Boolean} If the master volume was set.
	 * @static
	 */
	s.setMasterVolume = function(value) {
		s.masterVolume = value;
		return s.tellAllInstances("setMasterVolume", null, value);
	}

	/**
	 * Mute/Unmute all audio. Note that muted audio still plays at 0 volume,
	 * and that individually muted audio will be affected by setting the global mute.
	 * @method setMute
	 * @param {Boolean} isMuted Whether the audio should be muted or not.
	 * @param {String} id The specific sound ID (set) to target.
	 * @return {Boolean} If the mute was set.
	 * @static
	 */
	s.setMute = function(isMuted) {
		this.muted = isMuted;
		return s.tellAllInstances("mute", null, isMuted);
	}

	/**
	 * Pause all instances.
	 * @method pause
	 * @param id The specific sound ID (set) to target.
	 * @return If the audio was paused or not.
	 * @static
	 */
	s.pause = function(id) {
		return s.tellAllInstances("pause", id);
	}

	/**
	 * Resume all instances. Note that the pause/resume methods do not work independantly
	 * of each instance's paused state. If one instance is already paused when the SoundJS.pause
	 * method is called, then it will resume when this method is called.
	 * @method resume
	 * @param id The specific sound ID (set) to target.
	 * @return If the audio was resumed or not
	 * @static
	 */
	s.resume = function(id) {
		return s.tellAllInstances("resume", id);
	}

	/**
	 * Stop all audio (Global stop).
	 * @method stop
	 * @param id The specific sound ID (set) to target.
	 * @return If the audio was stopped or not.
	 * @static
	 */
	s.stop = function(id) {
		return s.tellAllInstances("stop", id);
	}

	/**
	 * Get a SoundInstance by a unique id. It is often useful to store audio
	 * instances by id (in form elements for example), so this method provides
	 * a useful way to access the instances via their IDs.
	 * @method getInstanceById
	 * @param uniqueId The id to use as lookup.
	 * @return {SoundInstance} The sound instance with the specified ID.
	 * @static
	 */
	s.getInstanceById = function(uniqueId) {
		return this.instanceHash[uniqueId];
	}

	/**
	 * A sound has completed playback, been interrupted, failed, or been stopped.
	 * Remove instance management. It will be added again, if the sound re-plays.
	 * Note that this method is called from the instances.
	 * @method playFinished
	 * @param {SoundInstance} instance The instance that finished playback.
	 * @private
	 */
	s.playFinished = function(instance) {
		SoundChannel.remove(instance);
		var index = this.instances.indexOf(instance);
		if (index > -1) {
			this.instances.splice(index, 1);
		}
		// Note: Keep in instance hash.
	}

	/**
	 * Call a method on all instances. Passing an optional ID will filter the event
	 * to only sounds matching that id (or source).
	 * @method tellAllInstances
	 * @param {String} command The command to call on each instance.
	 * @param {String} id A specific sound ID to call. If omitted, the command will be applied
	 *      to all sound instances.
	 * @param {Object} value A value to pass on to each sound instance the command is applied to.
	 * @private
	 */
	s.tellAllInstances = function(command, id, value) {
		if (this.activePlugin == null) { return false; }
		var src = this.getSrcFromId(id);
		for (var i=this.instances.length-1; i>=0; i--) {
			var instance = this.instances[i];
			if (src != null && instance.src != src) { continue; }
			switch (command) {
				case "pause":
					instance.pause(); break;
				case "resume":
					instance.resume(); break;
				case "setVolume":
					instance.setVolume(value); break;
				case "setMasterVolume":
					instance.setMasterVolume(value); break;
				case "mute":
					instance.mute(value); break;
				case "stop":
					instance.stop(); break;
				case "setPan":
					instance.setPan(value); break;
			}
		}
		return true;
	}

	/**
	 * A function proxy for SoundJS methods. By default, JavaScript methods do not maintain scope, so passing a
	 * method as a callback will result in the method getting called in the scope of the caller. Using a proxy
	 * ensures that the method gets called in the correct scope. All internal callbacks in SoundJS use this approach.
	 * @method proxy
	 * @param {Function} method The function to call
	 * @param {Object} scope The scope to call the method name on
	 * @static
	 * @private
	 */
	s.proxy = function(method, scope) {
		return function() {
			return method.apply(scope, arguments);
		}
	}

	createjs.SoundJS = SoundJS;



	/**
	 * SoundChannel manages the number of active instances
	 * @class SoundChannel
	 * @param src The source of the instances
	 * @param max The number of instances allowed
	 * @private
	 */
	function SoundChannel(src, max) {
		this.init(src, max);
	}

/* ------------
   Static API
------------ */
	/**
	 * A hash of channel instances by src.
	 * @property channels
	 * @static
	 * @private
	 */
	SoundChannel.channels = {};
	/**
	 * Create a sound channel.
	 * @method create
	 * @static
	 * @param {String} src The source for the channel
	 * @param {Number} max The maximum amount this channel holds.
	 * @private
	 */
	SoundChannel.create = function(src, max) {
		var channel = SoundChannel.get(src);
		if (channel == null) {
			SoundChannel.channels[src] = new SoundChannel(src, max);
		} else {
			channel.max += max;
		}
	}
	/**
	 * Add an instance to a sound channel.
	 * method add
	 * @param {SoundInstance} instance The instance to add to the channel
	 * @param {String} interrupt The interrupt value to use
	 * @static
	 * @private
	 */
	SoundChannel.add = function(instance, interrupt) {
		var channel = SoundChannel.get(instance.src);
		if (channel == null) { return false; }
		return channel.add(instance, interrupt);
	}
	/**
	 * Remove an instace from its channel.
	 * method remove
	 * @param {SoundInstance} instance The instance to remove from the channel
	 * @static
	 * @private
	 */
	SoundChannel.remove = function(instance) {
		var channel = SoundChannel.get(instance.src);
		if (channel == null) { return false; }
		channel.remove(instance);
		return true;
	}
	/**
	 * Get a channel instance by its src.
	 * method get
	 * @param {String} src The src to use to look up the channel
	 * @static
	 * @private
	 */
	SoundChannel.get = function(src) {
		return SoundChannel.channels[src];
	}

	var p = SoundChannel.prototype = {

		/**
		 * The src of the channel
		 * @property src
		 * @private
		 */
		src: null,

		/**
		 * The maximum number of instances in this channel
		 * @property max
		 * @private
		 */
		max: null,
		/**
		 * The current number of active instances.
		 * @property length
		 * @private
		 */
		length: 0,

		/**
		 * Initialize the channel
		 * @method init
		 * @param {String} src The source of the channel
		 * @param {Number} max The maximum number of instances in the channel
		 * @private
		 */
		init: function(src, max) {
			this.src = src;
			this.max = max || 1;
			this.instances = [];
		},

		/**
		 * Get an instance by index
		 * @method get
		 * @param {Number} index The index to return.
		 * @private
		 */
		get: function(index) {
			return this.instances[index];
		},

		/**
		 * Add a new instance
		 * @method add
		 * @param {SoundInstance} instance The instance to add.
		 * @private
		 */
		add: function(instance, interrupt) {
			if (!this.getSlot(interrupt, instance)) {
				return false;
			};
			this.instances.push(instance);
			this.length++;
			return true;
		},

		/**
		 * Remove an instance
		 * @method remove
		 * @param {SoundInstance} instance The instance to remove
		 * @private
		 */
		remove: function(instance) {
			var index = this.instances.indexOf(instance);
			if (index == -1) { return false; }
			this.instances.splice(index, 1);
			this.length--;
			return true;
		},

		/**
		 * Get an available slot
		 * @method getSlot
		 * @param {String} interrupt The interrupt value to use.
		 * @param {SoundInstance} instance The sound instance the will go in the channel if successful.
		 * @private
		 */
		getSlot: function(interrupt, instance) {
			var target, replacement;

			var margin = SoundJS.activePlugin.FT || 0;

			for (var i=0, l=this.max||100; i<l; i++) {
				target = this.get(i);

				// Available Space
				if (target == null) {
					return true;
				} else if (interrupt == SoundJS.INTERRUPT_NONE) {
					continue;
				}

				// First replacement candidate
				if (i == 0) {
					replacement = target;
					continue;
				}

				// Audio is complete or not playing
				if (target.playState == SoundJS.PLAY_FINISHED ||
						target == SoundJS.PLAY_INTERRUPTED ||
						target == SoundJS.PLAY_FAILED) {
					replacement = target;

				// Audio is a better candidate than the current target, according to playhead
				} else if (
						(interrupt == SoundJS.INTERRUPT_EARLY && target.getPosition() < replacement.getPosition()) ||
						(interrupt == SoundJS.INTERRUPT_LATE && target.getPosition() > replacement.getPosition())) {
					replacement = target;
				}
			}

			if (replacement != null) {
				replacement.interrupt();
				this.remove(replacement);
				return true;
			}
			return false;
		},

		toString: function() {
			return "[SoundJS SoundChannel]";
		}

	}

	// do not add to namespace

	// This is a dummy sound instance, which allows SoundJS to return something so
	// developers don't need to check nulls.
	function SoundInstance() {
		this.isDefault = true;
		this.pause = this.resume = this.play = this.beginPlaying = this.cleanUp = this.interrupt = this.stop = this.setMasterVolume = this.setVolume = this.mute = this.setPan = this.getPosition = this.setPosition = this.playFailed = function() { return false; };
		this.getVolume = this.getPan = this.getDuration = function() { return 0; }
		this.playState = SoundJS.PLAY_FAILED;
		this.toString = function() { return "[SoundJS Default Sound Instance]"; }
	}
	SoundJS.defaultSoundInstance = new SoundInstance();


	// An additional module to determine the current browser, version, operating system, and other environment variables.
	function BrowserDetect() {}

	BrowserDetect.init = function() {
		var agent = navigator.userAgent;
		BrowserDetect.isFirefox = (agent.indexOf("Firefox")> -1);
		BrowserDetect.isOpera = (window.opera != null);
		BrowserDetect.isIOS = agent.indexOf("iPod") > -1 || agent.indexOf("iPhone") > -1 || agent.indexOf("iPad") > -1;
	}

	BrowserDetect.init();

	createjs.SoundJS.BrowserDetect = BrowserDetect;

}());

/*--------------------------------------------------
 *   Main - ../src/js/main.js
 */
window.addEventListener('load', function(){
	var checkPush = function(asset, list){
		var i = 0,
		found = false;
		for(i in list){
			if(list[i].id === asset.id){
				found = true;
				break;
			}
		}
		if(!found){
			list.push(asset);
		}
	},
	loader     = new createjs.PreloadJS(),
	loadAssets = [];
	
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
		if(typeof platformer.settings.assets[i].src === 'string'){
			checkPush(platformer.settings.assets[i], loadAssets);
		} else {
			for(var j in platformer.settings.assets[i].src){
				if(platformer.settings.aspects[j] && platformer.settings.assets[i].src[j]){
					if(typeof platformer.settings.assets[i].src[j] === 'string'){
						platformer.settings.assets[i].src  = platformer.settings.assets[i].src[j];
						checkPush(platformer.settings.assets[i], loadAssets);
					} else {
						platformer.settings.assets[i].data    = platformer.settings.assets[i].src[j].data || platformer.settings.assets[i].data;
						platformer.settings.assets[i].assetId = platformer.settings.assets[i].src[j].assetId;
						platformer.settings.assets[i].src     = platformer.settings.assets[i].src[j].src;
						checkPush({
							id:  platformer.settings.assets[i].assetId || platformer.settings.assets[i].id,
							src: platformer.settings.assets[i].src
						}, loadAssets);
					}
					break;
				}
			}
			if(typeof platformer.settings.assets[i].src !== 'string'){
				if(platformer.settings.assets[i].src['default']){
					if(typeof platformer.settings.assets[i].src['default'] === 'string'){
						platformer.settings.assets[i].src  = platformer.settings.assets[i].src['default'];
						checkPush(platformer.settings.assets[i], loadAssets);
					} else {
						platformer.settings.assets[i].data    = platformer.settings.assets[i].src['default'].data || platformer.settings.assets[i].data;
						platformer.settings.assets[i].assetId = platformer.settings.assets[i].src['default'].assetId;
						platformer.settings.assets[i].src     = platformer.settings.assets[i].src['default'].src;
						checkPush({
							id:  platformer.settings.assets[i].assetId || platformer.settings.assets[i].id,
							src: platformer.settings.assets[i].src
						}, loadAssets);
					}
				} else {
					console.warn('Asset has no valid source for this browser.', platformer.settings.assets[i]);
				}
			}
		}
	}
	if(platformer.settings.supports.android){ //Android thinks HTMLAudioPlugin works, so we avoid that misconception here
		createjs.SoundJS.registerPlugin(createjs.HTMLiOSAudioPlugin);
	} else {
		createjs.SoundJS.registerPlugins([createjs.HTMLAudioPlugin, createjs.HTMLiOSAudioPlugin]);
	}
	loader.installPlugin(createjs.SoundJS);
	loader.loadManifest(loadAssets);
	platformer.assets = [];

}, false);
})();