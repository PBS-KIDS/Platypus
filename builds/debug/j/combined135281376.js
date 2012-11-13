(function(){
  var platformer = {};

  PBS = this.PBS || {};
  PBS.KIDS = this.PBS.KIDS || {};
  PBS.KIDS.platformer = platformer;

platformer.settings = {"global":{"initialScene":"menu","fps":60,"rootElement":"root","aspectRatio":1.333,"resizeFont":true},"aspects":[{"ogg":["firefox","opera","chrome"],"m4aCombined":["android","silk","ipod","ipad","iphone"],"mp3":["msie","safari"]}],"assets":{"powerup":{"id":"powerup","src":{"ogg":"a/powerup.ogg","mp3":"a/powerup.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":5000,"length":370}}}},"walk":{"id":"walk","src":{"ogg":"a/walk.ogg","mp3":"a/walk.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":3200,"length":330}}}},"jump":{"id":"jump","src":{"ogg":"a/jump.ogg","mp3":"a/jump.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":1500,"length":250}}}},"collect-gem":{"id":"collect-gem","src":{"ogg":"a/collect-gem.ogg","mp3":"a/collect-gem.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":7000,"length":610}}}},"pickaxe-crush":{"id":"pickaxe-crush","src":{"ogg":"a/pickaxe-crush.ogg","mp3":"a/pickaxe-crush.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":9150,"length":500}}}},"pickaxe-other":{"id":"pickaxe-other","src":{"ogg":"a/pickaxe-other.ogg","mp3":"a/pickaxe-other.mp3","m4aCombined":{"assetId":"combined","src":"a/combined.m4a","data":{"offset":11150,"length":300}}}},"buttons":{"id":"buttons","src":"i/buttons.png"},"dirt":{"id":"dirt","src":"i/dirt.png"},"mookie":{"id":"mookie","src":"i/mookie.png"},"tilemap":{"id":"tilemap","src":"i/tile-map.png"},"sprites":{"id":"sprites","src":"i/game-sprites.png"},"test":{"id":"test","src":"i/test.png"},"test-animation":{"id":"test-animation","src":"i/test-animation.png"},"tiles":{"id":"tiles","src":"i/tiles.png"},"gem":{"id":"gem","src":"i/gem.png"},"gem-bar":{"id":"gem-bar","src":"i/gem-bar.png"},"title-screen":{"id":"title-screen","src":"i/title-screen.png"},"objects":{"id":"objects","src":"i/objects.png"},"beetle":{"id":"beetle","src":"i/beetle.png"},"flower":{"id":"flower","src":"i/flower.png"},"briar":{"id":"briar","src":"i/briar.png"}},"classes":{"Game":{"id":"Game","src":"../src/js/game.js"},"Entity":{"id":"Entity","src":"../src/js/entity.js"},"Scene":{"id":"Scene","src":"../src/js/scene.js"},"Collision-Shape":{"id":"Collision-Shape","src":"../src/js/collision-shape.js"},"AABB":{"id":"AABB","src":"../src/js/aabb.js"}},"components":{"enable-ios-audio":{"id":"enable-ios-audio","src":"../src/js/layer/enable-ios-audio.js"},"layer-controller":{"id":"layer-controller","src":"../src/js/layer/layer-controller.js"},"tiled-loader":{"id":"tiled-loader","src":"../src/js/layer/tiled-loader.js"},"render-createjs":{"id":"render-createjs","src":"../src/js/layer/render-createjs.js"},"render-dom":{"id":"render-dom","src":"../src/js/layer/render-dom.js"},"lc-ai":{"id":"lc-ai","src":"../src/js/layer/lc-ai.js"},"lc-logic":{"id":"lc-logic","src":"../src/js/layer/lc-logic.js"},"lc-camera":{"id":"lc-camera","src":"../src/js/layer/lc-camera.js"},"collision-group":{"id":"collision-group","src":"../src/js/layer/collision-group.js"},"audio":{"id":"audio","src":"../src/js/entity/audio.js"},"broadcast-events":{"id":"broadcast-events","src":"../src/js/entity/broadcast-events.js"},"change-scene":{"id":"change-scene","src":"../src/js/entity/change-scene.js"},"destroy-me":{"id":"destroy-me","src":"../src/js/entity/destroy-me.js"},"dom-element":{"id":"dom-element","src":"../src/js/entity/dom-element.js"},"entity-container":{"id":"entity-container","src":"../src/js/entity/entity-container.js"},"entity-controller":{"id":"entity-controller","src":"../src/js/entity/entity-controller.js"},"render-debug":{"id":"render-debug","src":"../src/js/entity/render-debug.js"},"render-tiles":{"id":"render-tiles","src":"../src/js/entity/render-tiles.js"},"render-animation":{"id":"render-animation","src":"../src/js/entity/render-animation.js"},"render-image":{"id":"render-image","src":"../src/js/entity/render-image.js"},"render-gui":{"id":"render-gui","src":"../src/js/entity/render-gui.js"},"render-counter":{"id":"render-counter","src":"../src/js/entity/render-counter.js"},"render-clock":{"id":"render-clock","src":"../src/js/entity/render-clock.js"},"logic-button":{"id":"logic-button","src":"../src/js/entity/logic-button.js"},"logic-collectible-manager":{"id":"logic-collectible-manager","src":"../src/js/entity/logic-collectible-manager.js"},"logic-carrier":{"id":"logic-carrier","src":"../src/js/entity/logic-carrier.js"},"logic-directional-movement":{"id":"logic-directional-movement","src":"../src/js/entity/logic-directional-movement.js"},"logic-hero":{"id":"logic-hero","src":"../src/js/entity/logic-hero.js"},"logic-gem":{"id":"logic-gem","src":"../src/js/entity/logic-gem.js"},"logic-gui":{"id":"logic-gui","src":"../src/js/entity/logic-gui.js"},"logic-gravity":{"id":"logic-gravity","src":"../src/js/entity/logic-gravity.js"},"logic-portable":{"id":"logic-portable","src":"../src/js/entity/logic-portable.js"},"logic-pushable":{"id":"logic-pushable","src":"../src/js/entity/logic-pushable.js"},"logic-counter":{"id":"logic-counter","src":"../src/js/entity/logic-counter.js"},"logic-timer":{"id":"logic-timer","src":"../src/js/entity/logic-timer.js"},"logic-briar":{"id":"logic-briar","src":"../src/js/entity/logic-briar.js"},"collision-basic":{"id":"collision-basic","src":"../src/js/entity/collision-basic.js"},"collision-tiles":{"id":"collision-tiles","src":"../src/js/entity/collision-tiles.js"},"ai-pacer":{"id":"ai-pacer","src":"../src/js/entity/ai-pacer.js"}},"entities":{"tile-layer":{"id":"tile-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"},{"type":"collision-tiles","collisionMap":"import"}]},"render-layer":{"id":"render-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"}]},"collision-layer":{"id":"collision-layer","components":[{"type":"collision-tiles","collisionMap":"import"}]},"button-jump":{"id":"button-jump","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-jump:down","mouseup":"button-jump:up"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":1,"pressed":7}},"scaleX":2.9,"scaleY":2.9,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":10,"y":1090,"width":400,"height":400}},"button-jump-left":{"id":"button-jump-left","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":["button-jump:down","button-left:down"],"mouseup":["button-jump:up","button-left:up"]}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":4,"pressed":10}},"scaleX":2.9,"scaleY":2.9,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":10,"y":1090,"width":400,"height":400}},"button-jump-right":{"id":"button-jump-right","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":["button-jump:down","button-right:down"],"mouseup":["button-jump:up","button-right:up"]}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":5,"pressed":11}},"scaleX":2.9,"scaleY":2.9,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":610,"y":1090,"width":400,"height":400}},"button-left":{"id":"button-left","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-left:down","mouseup":"button-left:up"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":0,"pressed":6}},"scaleX":2.9,"scaleY":2.9,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":1180,"y":1090,"width":400,"height":400}},"button-pickaxe":{"id":"button-pickaxe","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-pickaxe:down","mouseup":"button-pickaxe:up"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":17,"pressed":23}},"scaleX":2.9,"scaleY":2.9,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":420,"y":1090,"width":400,"height":400}},"button-play-game":{"id":"button-play-game","components":[{"type":"dom-element","element":"div","innerHTML":"Play Game","className":"menu-button","onmouseup":"new-scene","ontouchend":"new-scene"},{"type":"change-scene","scene":"scene-level","transition":"fade-to-black","overrides":{"#levelName#":"level-1"}}]},"button-right":{"id":"button-right","components":[{"type":"logic-button"},{"type":"broadcast-events","events":{"mousedown":"button-right:down","mouseup":"button-right:up"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":2,"pressed":8}},"scaleX":2.9,"scaleY":2.9,"state":"released","acceptInput":{"click":true,"touch":true}}],"properties":{"x":1590,"y":1090,"width":400,"height":400}},"button-mute":{"id":"button-mute","components":[{"type":"logic-button","toggle":true,"state":"pressed"},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":138,"height":138},"animations":{"released":3,"pressed":9}},"scaleX":2.9,"scaleY":2.9,"state":"pressed","acceptInput":{"click":true,"touch":true}},{"type":"broadcast-events","renameEvents":{"mouseup":"audio-mute-toggle"}},{"type":"audio"}],"properties":{"x":10,"y":10,"width":400,"height":400}},"hero":{"id":"hero","components":[{"type":"entity-controller","controlMap":{"button-jump":"key-jump","key:z":"key-jump","button-pickaxe":"key-swing","key:x":"key-swing","key:left-arrow":"key-left","button-left":"key-left","key:right-arrow":"key-right","button-right":"key-right","key:up-arrow":"key-up","key:down-arrow":"key-down"}},{"type":"logic-carrier"},{"type":"logic-hero"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-80,-120],[80,120]]},"collisionType":"hero","solidCollisions":{"block":"","dirt":"","tiles":"","beetle":"","briar":""}},{"type":"render-animation","spriteSheet":{"images":["mookie"],"frames":{"width":240,"height":155,"regY":155,"regX":120},"animations":{"standing-right":[2],"standing-left":[5],"walking-right":{"frames":[3,0,1,2],"frequency":4},"walking-left":{"frames":[4,7,6,5],"frequency":4},"jumping-right":[0],"jumping-left":[6],"swing-right":{"frames":[8,9,10,10,2],"next":"standing-right","frequency":4},"swing-left":{"frames":[14,13,12,12,5],"next":"standing-left","frequency":4}}},"scaleX":2,"scaleY":2},{"type":"audio","audioMap":{"pickaxe":{"sound":"pickaxe-other","interrupt":"none"},"walking":{"sound":"walk","interrupt":"none"},"jumping":"jump"}},{"type":"render-debug","regY":260,"regX":130}],"properties":{"x":10,"y":10,"width":160,"height":240,"state":"ground","heading":"right","camera":"bounding"}},"block":{"id":"block","components":[{"type":"logic-gravity"},{"type":"logic-pushable"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-120,-120],[120,120]]},"collisionType":"block","solidCollisions":{"block":"hit-solid","dirt":"hit-solid","hero":["push-entity","hit-solid"],"tiles":"hit-solid","beetle":"hit-solid","briar":"hit-solid"}},{"type":"render-image","image":"sprites","source":{"width":120,"height":120,"y":720,"x":240},"regX":60,"regY":120,"scaleX":2,"scaleY":2},{"type":"render-debug","regX":120,"regY":240}],"properties":{"x":50,"y":50,"width":240,"height":240}},"dirt":{"id":"dirt","components":[{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-120,-120],[120,120]]},"collisionType":"dirt","softCollisions":{"pickaxe":"destroy-me"}},{"type":"destroy-me","delay":250},{"type":"audio","audioMap":{"destroy-me":{"sound":"pickaxe-crush","interrupt":"none"}}},{"type":"render-animation","animationMap":{"destroy-me":"explosion"},"spriteSheet":{"images":["dirt"],"frames":{"width":240,"height":240,"regX":120,"regY":180},"animations":{"stationary":0,"explosion":{"frames":[1,2,3,4,5],"frequency":4}}},"state":"stationary","scaleX":2,"scaleY":2}],"properties":{"x":50,"y":50,"width":240,"height":240}},"gem":{"id":"gem","components":[{"type":"logic-gem"},{"type":"collision-basic","shape":{"offset":[0,-110],"type":"rectangle","points":[[-70,-110],[70,110]]},"collisionType":"gem","softCollisions":{"hero":"collect-gem"}},{"type":"render-animation","spriteSheet":{"images":["gem"],"frames":{"width":14,"height":22,"regY":22,"regX":7},"animations":{"default":{"frames":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],"frequency":4}}}},{"type":"audio","audioMap":{"sound-collect-gem":{"sound":"collect-gem","interrupt":"early"}}},{"type":"render-debug","regY":220,"regX":110}],"properties":{"x":10,"y":10}},"pickaxe":{"id":"pickaxe","components":[{"type":"collision-basic","shape":{"offset":[0,-140],"type":"rectangle","points":[[-100,-140],[100,140]]},"collisionType":"pickaxe"},{"type":"destroy-me","message":"prepare-for-collision","delay":50}]},"gem-counter":{"id":"gem-counter","components":[{"type":"logic-counter","message":"count-gems"},{"type":"render-counter","scaleX":20,"scaleY":20,"color":"#FFF"}],"properties":{"x":3800,"y":175}},"title-screen":{"id":"title-screen","components":[{"type":"dom-element","element":"img","className":"title-screen","src":"i/title-screen.png"}]},"collectible-manager":{"id":"collectible-manager","components":[{"type":"logic-collectible-manager"},{"type":"broadcast-events","events":{"broadcast-gem-collected":"gui-gem-collected"}}],"properties":{"x":10,"y":10}},"gui":{"id":"gui","components":[{"type":"logic-gui"},{"type":"render-animation","spriteSheet":{"images":["gem-bar"],"frames":{"width":229,"height":139,"regY":0,"regX":229},"animations":{"default":[0]}},"scaleX":2.9,"scaleY":2.9},{"type":"entity-container","entities":[{"type":"gem-counter"},{"type":"clock"}],"childEvents":["count-gems","set-time","start-timer","stop-timer","layer:logic","layer:render","layer:render-load","audio-mute-toggle","audio-mute","audio-unmute"]}],"properties":{"x":4000,"y":0}},"beetle":{"id":"beetle","components":[{"type":"ai-pacer"},{"type":"logic-directional-movement"},{"type":"logic-gravity"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-90,-120],[90,120]]},"collisionType":"beetle","solidCollisions":{"beetle":"turn-around","hero":"turn-around","block":"turn-around","dirt":"turn-around","tiles":"turn-around","briar":"turn-around"}},{"type":"render-animation","spriteSheet":{"images":["beetle"],"frames":{"width":24,"height":24,"regY":24,"regX":12},"animations":{"standing":[0],"walking-right":{"frames":[2,3,1],"frequency":4},"walking-left":{"frames":[3,2,1],"frequency":4}}}}],"properties":{"x":10,"y":10}},"clock":{"id":"clock","components":[{"type":"logic-timer"},{"type":"render-clock","scaleX":20,"scaleY":20,"color":"#FFF"},{"type":"audio","audioMap":{"half-minute-timer":{"sound":"collect-gem","interrupt":"early"}}}],"properties":{"x":2000,"y":175,"alarmMessage":"half-minute-timer","updateMessage":"refresh-clock","alarmTime":30000,"isIncrementing":true,"isInterval":true,"time":1000}},"flower":{"id":"flower","components":[{"type":"render-animation","spriteSheet":{"images":["flower"],"frames":{"width":120,"height":120,"regY":120,"regX":60},"animations":{"default":[0]}},"scaleX":2,"scaleY":2}],"properties":{"x":10,"y":10}},"briar":{"id":"briar","components":[{"type":"logic-briar"},{"type":"collision-basic","shape":{"offset":[0,-120],"type":"rectangle","points":[[-120,-120],[120,120]]},"collisionType":"briar","solidCollisions":{"hero":"caught-hero"}},{"type":"render-animation","spriteSheet":{"images":["briar"],"frames":{"width":120,"height":120,"regY":120,"regX":60},"animations":{"bottom":[0],"top":[3],"left":[1],"right":[2]}},"scaleX":2,"scaleY":2}],"properties":{"x":10,"y":10,"linkId":""}}},"includes":{"EaselJS":{"id":"EaselJS","src":"http://code.createjs.com/easeljs-0.5.0.min.js"},"TweenJS":{"id":"TweenJS","src":"http://code.createjs.com/tweenjs-0.3.0.min.js"},"SoundJS":{"id":"SoundJS","src":"http://code.createjs.com/soundjs-0.3.0.min.js"},"PreloadJS":{"id":"PreloadJS","src":"http://code.createjs.com/preloadjs-0.2.0.min.js"},"Browser":{"id":"Browser","src":"../src/js/browser.js"},"iOSAudio":{"id":"iOSAudio","src":"../src/js/HTMLiOSAudioPlugin.js"},"SoundJSm4a":{"id":"SoundJSm4a","src":"../src/js/SoundJSm4aOverride.js"},"Main":{"id":"Main","src":"../src/js/main.js"},"ButtonCSS":{"id":"ButtonCSS","src":"../src/css/button.css"},"MainCSS":{"id":"MainCSS","src":"../src/css/main.css"},"GameCSS":{"id":"GameCSS","src":"../src/css/game.css"}},"scenes":{"menu":{"layers":[{"id":"menu-layer","components":[{"type":"lc-logic"},{"type":"render-dom"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"title-screen"},{"type":"button-play-game"}]}]},{"id":"enable-ios-audio-layer","filter":{"includes":["iOS"]},"components":[{"type":"enable-ios-audio","audioId":"combined"}]}],"id":"menu"},"scene-level":{"layers":[{"id":"action-layer","components":[{"type":"lc-ai"},{"type":"lc-logic"},{"type":"collision-group"},{"type":"lc-camera","width":3200},{"type":"render-createjs"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"collectible-manager"}]},{"type":"tiled-loader","level":"#levelName#","unitsPerPixel":10,"images":["sprites"],"imagesScale":2}]},{"id":"multitouch-interface-layer","filter":{"includes":["multitouch"]},"components":[{"type":"lc-camera","width":2000},{"type":"lc-logic"},{"type":"render-createjs"},{"type":"entity-container","entities":[{"type":"button-jump"},{"type":"button-pickaxe"},{"type":"button-left"},{"type":"button-right"},{"type":"gui","properties":{"y":2000}}],"childEvents":["gui-gem-collected"]}]},{"id":"touch-interface-layer","filter":{"includes":["touch"],"excludes":["multitouch"]},"components":[{"type":"lc-camera","width":2000},{"type":"lc-logic"},{"type":"render-createjs"},{"type":"entity-container","entities":[{"type":"button-jump-left"},{"type":"button-jump-right"},{"type":"button-jump","properties":{"x":310}},{"type":"button-pickaxe","properties":{"x":10,"y":680}},{"type":"button-left"},{"type":"button-right"},{"type":"gui","properties":{"y":2000}}],"childEvents":["gui-gem-collected"]}]},{"id":"desktop-interface-layer","filter":{"excludes":["touch"]},"components":[{"type":"lc-camera","width":4000},{"type":"lc-logic"},{"type":"render-createjs"},{"type":"entity-container","entities":[{"type":"button-mute"},{"type":"button-play"},{"type":"gui"}],"childEvents":["gui-gem-collected"]}]}],"id":"scene-level"}},"levels":{"level-1":{"height":18,"layers":[{"data":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,37,10,10,10,10,10,10,10,1,1,1,1,1,10,10,1,1,1,1,1,1,1,1,1,10,10,10,10,1,1,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,19,19,19,19,19,19,19,19,1,1,1,19,19,19,1,1,1,1,1,1,1,1,19,19,19,19,19,19,1,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,1,1,1,28,28,28,28,28,28,28,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,1,1,1,1,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,29,30,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,38,39,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37],"height":18,"name":"background","opacity":1,"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"data":[6,21,21,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,11,13,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,3,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,11,13,0,0,0,0,0,0,5,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,12,0,0,12,3,3,0,0,0,0,0,0,13,0,3,0,0,0,0,0,11,15,3,3,3,0,3,3,18,0,0,0,0,0,0,3,0,0,0,0,0,12,0,0,12,0,0,12,12,12,3,0,0,0,0,0,12,0,12,3,3,0,3,3,3,13,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,12,0,3,0,0,0,12,0,0,0,0,0,3,3,0,0,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,0,11,0,3,3,3,0,3,3,0,0,0,3,0,0,12,0,0,0,12,0,0,0,3,3,0,0,0,11,0,0,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,3,0,0,0,3,12,0,0,0,0,0,0,0,12,0,3,3,0,0,0,0,0,0,0,0,3,16,0,12,0,0,0,0,0,12,13,0,0,32,3,32,3,32,0,0,0,12,0,12,12,0,0,0,0,0,0,0,11,0,12,0,0,5,0,0,0,0,0,3,0,12,0,12,0,0,0,0,0,12,12,0,0,33,35,36,35,34,3,3,3,12,0,12,12,0,0,0,0,0,0,3,16,0,12,0,0,12,0,0,0,0,0,12,0,12,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,20,12,12,12,12,0,0,0,3,3,3,0,0,0,0,12,0,12,0,0,12,0,0,0,0,3,0,0,12,0,12,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,0,0,0,12,12,12,12,12,12,3,12,0,0,12,0,12,0,0,12,0,0,0,0,12,0,0,12,0,11,0,0,0,0,0,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,12,0,0,3,0,0,12,24,26,25,0,0,0,0,0,12,0,0,0,0,0,12,12,0,0,2,3,3,0,3,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,23,21,23,0,0,0,0,0,12,0,0,0,0,0,12,12,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,12,3,3,3,4,0,2,12,0,11,0,0,0,0,0,0,0,13,0,0,0,0,3,0,3,3,0,3,3,3,0,0,3,0,12,32,3,32,3,32,4,0,2,3,18,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,13,0,0,0,0,12,0,0,0,0,0,0,0,3,0,0,0,12,33,35,36,35,34,13,0,11,12,13,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,3,3,0,0,0,0,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],"height":18,"name":"action","opacity":1,"properties":{"entity":"tile-layer"},"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"height":18,"name":"entities","objects":[{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":480,"y":72},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":48},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":936,"y":168},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":216},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":912,"y":264},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":216},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":264},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":24,"y":144},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":312},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":408},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower0"},"type":"","width":0,"x":288,"y":72},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower1"},"type":"","width":0,"x":264,"y":192},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower2"},"type":"","width":0,"x":24,"y":408},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower3"},"type":"","width":0,"x":240,"y":336},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower4"},"type":"","width":0,"x":408,"y":360},{"gid":47,"height":0,"name":"","properties":{"linkId":"flower5"},"type":"","width":0,"x":672,"y":72},{"gid":47,"height":0,"name":"","properties":{},"type":"","width":0,"x":864,"y":360},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":288},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":408},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":384},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":96},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":72},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":48},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":144},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":120},{"gid":54,"height":0,"name":"","properties":{},"type":"","width":0,"x":264,"y":96},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":168,"y":192},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":360},{"gid":62,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":288},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":192},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":240,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":216},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":312,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":120},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":240},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":264},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":816,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":1008,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":96},{"gid":56,"height":48,"name":"","properties":{},"type":"","width":24,"x":744,"y":72},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":96},{"gid":56,"height":72,"name":"","properties":{},"type":"","width":24,"x":816,"y":336},{"gid":56,"height":48,"name":"","properties":{},"type":"","width":48,"x":984,"y":96},{"gid":56,"height":48,"name":"","properties":{},"type":"","width":24,"x":456,"y":360},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":264},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower2"},"type":"","width":0,"x":120,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower3"},"type":"","width":0,"x":264,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower0"},"type":"","width":0,"x":432,"y":168},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower1"},"type":"","width":0,"x":456,"y":264},{"gid":64,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":48},{"gid":64,"height":0,"name":"","properties":{},"type":"","width":0,"x":840,"y":144},{"gid":65,"height":0,"name":"","properties":{},"type":"","width":0,"x":888,"y":168},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":192},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":216},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":24},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":48},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":48},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":72},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":96},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":120},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":312},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":336},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":360},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":24},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":48},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":72},{"gid":71,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":96},{"gid":75,"height":0,"name":"","properties":{},"type":"","width":0,"x":768,"y":120},{"gid":66,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":120},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":744,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":720,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":144},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":696,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":672,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":528,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":480,"y":408},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":432,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":384,"y":408},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":504,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":456,"y":408},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":408,"y":240},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":384},{"gid":72,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":408},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":384},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":360},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":360},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":336},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":336},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":288},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":264},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":240},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":216},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":192},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":144},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":168},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":168},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":408},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":384},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":624,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":360},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":600,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":336},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":576,"y":312},{"gid":73,"height":0,"name":"","properties":{},"type":"","width":0,"x":648,"y":144},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower5"},"type":"","width":0,"x":648,"y":168},{"gid":55,"height":0,"name":"","properties":{},"type":"","width":0,"x":336,"y":264},{"gid":46,"height":0,"name":"","properties":{},"type":"hero","width":0,"x":24,"y":96},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":72},{"gid":48,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":96},{"gid":56,"height":0,"name":"","properties":{},"type":"","width":0,"x":24,"y":48},{"gid":70,"height":0,"name":"","properties":{},"type":"","width":0,"x":0,"y":24},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower0"},"type":"","width":0,"x":408,"y":168},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower0"},"type":"","width":0,"x":384,"y":168},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower2"},"type":"","width":0,"x":144,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower2"},"type":"","width":0,"x":168,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower2"},"type":"","width":0,"x":192,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower1"},"type":"","width":0,"x":480,"y":264},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower3"},"type":"","width":0,"x":288,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower3"},"type":"","width":0,"x":312,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower3"},"type":"","width":0,"x":336,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower4"},"type":"","width":0,"x":528,"y":432},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower5"},"type":"","width":0,"x":672,"y":168},{"gid":63,"height":0,"name":"","properties":{"linkId":"flower5"},"type":"","width":0,"x":696,"y":168}],"opacity":1,"type":"objectgroup","visible":true,"width":44,"x":0,"y":0}],"orientation":"orthogonal","properties":{},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/tiles.png","imageheight":120,"imagewidth":216,"margin":0,"name":"tiles","properties":{},"spacing":0,"tileheight":24,"tilewidth":24},{"firstgid":46,"image":"../src/images/objects.png","imageheight":96,"imagewidth":192,"margin":0,"name":"objects","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"0":{"entity":"hero"},"1":{"entity":"flower"},"10":{"entity":"block"},"17":{"entity":"briar"},"2":{"entity":"dirt"},"24":{"entity":"timer"},"8":{"entity":"beetle"},"9":{"entity":"gem"}},"tilewidth":24}],"tilewidth":24,"version":1,"width":44,"id":"level-1"},"level-2":{"height":18,"layers":[{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,35,35,35,35,35,35,35,35,35,35,35,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"height":18,"name":"tile-layer","opacity":1,"type":"tilelayer","visible":true,"width":44,"x":0,"y":0},{"height":18,"name":"entities","objects":[{"gid":1,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":48},{"gid":11,"height":0,"name":"","properties":{},"type":"","width":0,"x":552,"y":0}],"opacity":1,"type":"objectgroup","visible":true,"width":44,"x":0,"y":0}],"orientation":"orthogonal","properties":{},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/objects.png","imageheight":96,"imagewidth":192,"margin":0,"name":"objects","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"0":{"entity":"hero"},"10":{"entity":"block"},"2":{"entity":"dirt"},"9":{"entity":"gem"}},"tilewidth":24},{"firstgid":33,"image":"../src/images/tiles.png","imageheight":120,"imagewidth":216,"margin":0,"name":"tiles","properties":{},"spacing":0,"tileheight":24,"tilewidth":24}],"tilewidth":24,"version":1,"width":44,"id":"level-2"}}};
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
	},
	proto = game.prototype;
	
	proto.tick = function(deltaT){
		if(this.currentScene){
			this.currentScene.tick(deltaT);
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
	
	proto.trigger = function(messageId, value){
		var i = 0;
		if(this.debug || (value && value.debug)){
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
		this.loopCheck.push(messageId);
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value);
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
platformer.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers,
		supportedLayer = true;
		this.rootElement = rootElement;
		this.layers = [];
		this.tickContent = {
			deltaT: 0//,
			//debug: true
		};
		for(var layer in layers){
			supportedLayer = true;
			if(layers[layer].filter){
				if(layers[layer].filter.includes){
					supportedLayer = false;
					for(var filter in layers[layer].filter.includes){
						if(platformer.settings.supports[layers[layer].filter.includes[filter]]){
							supportedLayer = true;
						}
					}
				}
				if(layers[layer].filter.excludes){
					for(var filter in layers[layer].filter.excludes){
						if(platformer.settings.supports[layers[layer].filter.excludes[filter]]){
							supportedLayer = false;
						}
					}
				}
			}
			if (supportedLayer){
				this.layers.push(new platformer.classes.entity(layers[layer], {
					properties:{
						rootElement: this.rootElement
					}
				}));
			}
		}
	};
	var proto = scene.prototype;
	
	proto.tick = function(deltaT){
		this.tickContent.deltaT = deltaT;
		
		for(var layer in this.layers){
			this.layers[layer].trigger('tick', this.tickContent);
		}
	};

	proto.destroy = function(){
		for(var layer in this.layers){
			this.layers[layer].destroy();
		}
		this.layers.length = 0;
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
 *   enable-ios-audio - ../src/js/layer/enable-ios-audio.js
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
 *   layer-controller - ../src/js/layer/layer-controller.js
 */
platformer.components['layer-controller'] = (function(){
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
		
		this.addListeners(['tick', 'child-entity-added', 'check-inputs', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel']);
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
			if(!this.entities[x].trigger('controller:tick'))	
			{
				this.entities.splice(x, 1);
			}
		}
	};

	proto['child-entity-added'] = function(entity){
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
								this.addListeners([y, y + ':up', y + ':down']);
								this[y]           = relayUpDown(y,     this);
								this[y + ':up']   = relay(y + ':up',   this);
								this[y + ':down'] = relay(y + ':down', this);
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
		this.images = definition.images || false;
		this.imagesScale = definition.imagesScale || this.unitsPerPixel;
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
		followEntity   = undefined,
		layerCollides  = true;

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
					//Copy properties from Tiled
					properties = {};
					for (x in entity.properties){
						//This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
						var numberProperty = parseFloat(entity.properties[x]);
						if (numberProperty == 0 || (!numberProperty) == false)
						{
							properties[x] = numberProperty;
						} else if(entity.properties[x] == 'true') {
							properties[x] = true;
						} else if(entity.properties[x] == 'false') {
							properties[x] = false;
						}else {
							properties[x] = entity.properties[x];
						}
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
 *   render-createjs - ../src/js/layer/render-createjs.js
 */
platformer.components['render-createjs'] = (function(){
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
		this.canvas.width  = 320; //TODO: figure out where to specify this
		this.canvas.height = 240;
		this.stage = new createjs.Stage(this.canvas);
	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:render')
			{
				this.entities.push(entity);
				entity.trigger('layer:render-load', {
					stage: self.stage,
					parentElement: self.owner.rootElement
					//TODO: send along scaling functions to convert world coordinates to window coordinates // somehow get these from camera?
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('layer:render', resp))
			{
				this.entities.splice(x, 1);
			}
			
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
 *   render-dom - ../src/js/layer/render-dom.js
 */
platformer.components['render-dom'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['tick', 'child-entity-added','render', 'camera-update']);
		
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
			if (messageIds[x] == 'layer:render')
			{
				this.entities.push(entity);
				entity.trigger('layer:render-load', {
					element: self.element
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('layer:render', resp))
			{
				this.entities.splice(x, 1);
			}
			
		}
	};
	
	proto['camera-update'] = function(cameraInfo){
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
 *   lc-ai - ../src/js/layer/lc-ai.js
 */
platformer.components['lc-ai'] = (function(){
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
			if (messageIds[x] == 'layer:ai')
			{
				this.entities.push(entity);
				break;
			}
		}
	};

	proto['tick'] = function(obj){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('layer:ai', obj))
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
		
		this.addListeners(['tick', 'child-entity-added', 'logic']);  
		
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
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

	proto['tick'] = proto['logic'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('layer:logic', resp))
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
		
		this.addListeners(['tick', 'resize', 'orientationchange', 'camera', 'load', 'world-loaded', 'child-entity-added']);  
		
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

		this.aspectRatio              = definition.aspectRatio || 0;
		if(this.world.viewportWidth && this.world.viewportHeight){
			this.aspectRatio = this.aspectRatio || (this.world.viewportHeight      / this.world.viewportWidth); 
		} else {
			this.aspectRatio = this.aspectRatio || (this.window.viewportHeight / this.window.viewportWidth);
			if (this.world.viewportWidth || this.world.viewportHeight){
				this.world.viewportWidth       = this.world.viewportWidth       || (this.world.viewportHeight      / this.aspectRatio); 
				this.world.viewportHeight      = this.world.viewportHeight      || (this.aspectRatio / this.world.viewportWidth); 
			} else {
				this.world.viewportWidth       = this.window.viewportWidth;
				this.world.viewportHeight      = this.aspectRatio * this.world.viewportWidth;
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
		this.bBBorderX = 0;
		this.bBBorderY = 0;
		this.bBInnerWidth = this.world.viewportWidth - (2 * this.bBBorderX);
		this.bBInnerHeight = this.world.viewportHeight - (2 * this.bBBorderY);
		
		
		this.direction = true;  
	};
	var proto = component.prototype; 

	proto['load'] = function(){
		
	};

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
	
	proto['world-loaded'] = function(values){
		this.worldWidth   = this.owner.worldWidth  = values.width;
		this.worldHeight  = this.owner.worldHeight = values.height;
		if(values.camera){
			this.follow(values.camera);
		}
	};
	
	proto['tick'] = proto['camera'] = function(resp){
		var deltaT = resp.deltaT;
		
		switch (this.state)
		{
		case 'following':
			this.followingFunction(this.following);
			break;
		case 'roaming':
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
			break;
		case 'static':
		default:
			break;
		}
		
		this.owner.trigger('camera-update', {
			x:      this.world.viewportLeft   * this.windowPerWorldUnitWidth,
			y:      this.world.viewportTop    * this.windowPerWorldUnitHeight,
			scaleX: this.windowPerWorldUnitWidth,
			scaleY: this.windowPerWorldUnitHeight,
		});
		
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('camera-update', this.world))
			{
				this.entities.splice(x, 1);
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
	
	proto.move = function (newLeft, newTop)
	{
		this.moveLeft(newLeft);
		this.moveTop(newTop);
	};
	
	proto.moveLeft = function (newLeft)
	{
		if (this.worldWidth < this.world.viewportWidth){
			this.world.viewportLeft = (this.worldWidth - this.world.viewportWidth) / 2;
		} else if (this.worldWidth && (newLeft + this.world.viewportWidth > this.worldWidth)) {
			this.world.viewportLeft = this.worldWidth - this.world.viewportWidth;
		} else if (this.worldWidth && (newLeft < 0)) {
			this.world.viewportLeft = 0; 
		} else {
			this.world.viewportLeft = newLeft;
		}
	};
	
	proto.moveTop = function (newTop)
	{
		if (this.worldHeight < this.world.viewportHeight){
			this.world.viewportTop = (this.worldHeight - this.world.viewportHeight) / 2;
		} else if (this.worldHeight && (newTop + this.world.viewportHeight > this.worldHeight)) {
			this.world.viewportTop = this.worldHeight - this.world.viewportHeight;
		} else if (this.worldHeight && (newTop < 0)) {
			this.world.viewportTop = 0; 
		} else {
			this.world.viewportTop = newTop;
		}
	};
	
	
	proto.lockedFollow = function (entity)
	{
		this.move(entity.x - (this.world.viewportWidth / 2), entity.y - (this.world.viewportHeight / 2));
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
			this.moveLeft(newLeft);
		}
		
		if (typeof newTop !== 'undefined')
		{
			this.moveTop(newTop);
		}
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
 *   collision-group - ../src/js/layer/collision-group.js
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
		    'tick',
		    'load',
		    'child-entity-added',   'add-collision-entity',
		    'child-entity-removed', 'remove-collision-entity',
		    'check-collision-group'
		]);  
		//this.toResolve = [];
		
		var self = this;
		this.owner.getCollisionGroup = function(){
			return self.entities;
		};
		this.owner.getCollisionGroupAABB = function(){
			return self.getAABB();
		};
		
		this.entities = [];
		this.collisionGroups = []; //defined here so we aren't continually recreating new arrays
		this.entitiesByType = {};
		this.terrain = undefined;
		this.aabb     = new platformer.classes.aABB();
		this.prevAABB = new platformer.classes.aABB();
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
	
	proto['load'] = function(){
		
	};
	
	proto['tick'] = proto['check-collision-group'] = function(resp){

		var swap = this.prevAABB,
		goalX    = this.owner.x - this.lastX,
		goalY    = this.owner.y - this.lastY;

		this.prevAABB = this.aabb;
		this.aabb     = swap;
		
		this.owner.x = this.lastX;
		this.owner.y = this.lastY;
		
		this.checkGroupCollisions(resp);
		this.checkSolidCollisions(resp);

		this.aabb.reset();
		for (var x = 0; x < this.entities.length; x++){
			this.aabb.include(this.entities[x].getCollisionGroupAABB?this.entities[x].getCollisionGroupAABB():this.entities[x].getAABB());
		}

		this.owner.x += goalX;
		this.owner.y += goalY;
		this.aabb.move(this.aabb.x + goalX, this.aabb.y + goalY);

		this.checkSoftCollisions(resp);
	};
	
	proto.getAABB = function(){
		return this.aabb;
	};

	proto.checkGroupCollisions = function (resp){
		var groups = this.collisionGroups;
		
		groups.length = 0;
		for (var x = 0; x < this.entities.length; x++){
			if(this.entities[x] !== this.owner){
				if(this.entities[x].trigger('check-collision-group', resp)){
					groups.push(this.entities[x]);
				};
			}
		}

		this.resolveCollisionList(groups, true);
	};

	proto.checkSolidCollisions = function (resp){
		var x    = 0,
		y        = 0,
		entities = [];
		
		for (x = this.entities.length - 1; x > -1; x--)
		{
			if(this.owner !== this.entities[x]){
				if(this.entities[x].trigger('prepare-for-collision', resp)){
					if(this.entities[x].solidCollisions.length > 0){
						this.entities[x].collisionUnresolved = true;
						entities.push(this.entities[x]);
					}
				} else { // remove the entity because it no longer has a collision handler
					var typeEntities = this.entitiesByType[this.entities[x].collisionType];
					for (y = typeEntities.length - 1; y > -1; y--)
					{
						if(typeEntities[y] === this.entities[x]){
							typeEntities.splice(y, 1);
							break;
						}
					}
					this.entities.splice(x, 1);
				}
			}
		}
		
		this.resolveCollisionList(entities, false);
	};
	
	proto.resolveCollisionList = function(entities, group){
		for (var x = entities.length - 1; x > -1; x--){
			if(entities[x].collisionUnresolved){
				if(entities[x].postponeCollisionCheck && (entities[x].postponeCollisionCheck.length > 0)){
					this.resolveCollisionList(entities[x].postponeCollisionCheck);
					entities[x].postponeCollisionCheck.length = 0;
					entities[x].trigger('collision-postponement-resolved');
				}
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
		triggerMessages = [];

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

		for (y = 0; y < ent.solidCollisions.length; y++)
		{
			if(this.entitiesByType[ent.solidCollisions[y]]){
				for(z = 0; z < this.entitiesByType[ent.solidCollisions[y]].length; z++){
					otherEntity = this.entitiesByType[ent.solidCollisions[y]][z];
					if((!otherEntity.postponeCollisionCheck || (otherEntity.postponeCollisionCheck.length === 0)) && (otherEntity !== ent) && (this.AABBCollision(sweepAABB, otherEntity.getPreviousAABB()))) {
						potentialsEntities.push(this.entitiesByType[ent.solidCollisions[y]][z]);
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
		var xDir  = (xPos < xGoal) ? 1 : -1;
		var finalX = undefined; 
		var collisionsX = [];
		var tileCollisionX = undefined;
		var aabbOffsetX = previousAABB.x - ent.getPreviousX();//previousAABB.x - initialX;
		
		initialY  = previousAABB.y;//ent.getPreviousY();
		var yPos  = initialY;
		var yGoal = currentAABB.y;//ent.y;
		var yDir  = (yPos < yGoal) ? 1 : -1;
		var finalY = undefined;
		var collisionsY = [];
		var tileCollisionY = undefined;
		var aabbOffsetY = previousAABB.y - ent.getPreviousY();//previousAABB.y - initialY;
		
		//////////////////////////////////////////////////////////////////////
		//MOVE IN THE X DIRECTION
		//////////////////////////////////////////////////////////////////////
		while (xPos != xGoal && (potentialTiles.length || potentialsEntities.length))
		{
			if (Math.abs(xGoal - xPos) < 1)
			{
				xPos = xGoal;
			} else {
				xPos += xDir;
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
					if(this.preciseCollision(ent, potentialTiles[t]))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xDir > 0)
						{
							atX = tileAABB.left - previousAABB.halfWidth;
						} else {
							atX = tileAABB.right + previousAABB.halfWidth;
						}
						
						if ( typeof tilecollisionX === 'undefined') {
							tileCollisionX = {atX: atX, aABB: tileAABB, shape: potentialTiles[t].shapes[0]};
						} else if (xDir > 0) {
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
					if(this.preciseCollision(ent, potentialsEntities[u]))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xDir > 0)
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
						} else if (xDir > 0) {
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
				complete = ent.routeSolidCollision?ent.routeSolidCollision('x', xDir, collisionsX[q]):true;
				if (complete)
				{
					triggerMessages.push({
						entity: collisionsX[q].entity,
						type:   collisionsX[q].entity.collisionType,
						shape:  collisionsX[q].entity.shape,
						x: xDir,
						y: 0
					});
					if(((collisionsX[q].atX > initialX) && (xDir > 0)) || ((collisionsX[q].atX < initialX) && (xDir < 0))){
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
					complete = ent.routeTileCollision('x', xDir, tileCollisionX);
					if (complete)
					{
						triggerMessages.push({
							type:   'tiles',
							shape:  tileCollisionX.shape,
							x: xDir,
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
			if (Math.abs(yGoal - yPos) < 1)
			{
				yPos = yGoal;
			} else {
				yPos += yDir;
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
					if(this.preciseCollision(ent, potentialTiles[t]))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yDir > 0)
						{
							atY = tileAABB.top - previousAABB.halfHeight; 
						} else {
							atY = tileAABB.bottom + previousAABB.halfHeight;
						}
						 
						if ( typeof tilecollisionY === 'undefined') {
							tileCollisionY = {atY: atY, aABB: tileAABB,  shape: potentialTiles[t].shapes[0]};
						} else if (yDir > 0) {
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
					if(this.preciseCollision(ent, potentialsEntities[u]))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yDir > 0)
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
						} else if (yDir > 0) {
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
				complete = ent.routeSolidCollision?ent.routeSolidCollision('y', yDir, collisionsY[q]):true;
				if (complete)
				{
					triggerMessages.push({
						entity: collisionsY[q].entity,
						type:   collisionsY[q].entity.collisionType,
						shape:  collisionsY[q].entity.shape,
						x: 0,
						y: yDir
					});
					if(((collisionsY[q].atY > initialY) && (yDir > 0)) || ((collisionsY[q].atY < initialY) && (yDir < 0))){
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
					complete = ent.routeTileCollision('y', yDir, tileCollisionY);
					if (complete)
					{
						triggerMessages.push({
							type:   'tiles',
							shape:  tileCollisionY.shape,
							x: 0,
							y: yDir
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
			this.relocateGroup(finalX - aabbOffsetX - initialX, finalY - aabbOffsetY - initialY);
		} else {
			ent.trigger('relocate-entity', {x: finalX - aabbOffsetX, y: finalY - aabbOffsetY});
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
		
		for(x = 0; x < this.entities.length; x++){
			ent = this.entities[x];
			for (y = 0; y < ent.softCollisions.length; y++){
				if(this.entitiesByType[ent.softCollisions[y]]){
					for(z = 0; z < this.entitiesByType[ent.softCollisions[y]].length; z++){
						otherEntity = this.entitiesByType[ent.softCollisions[y]][z];
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
	
	proto.relocateGroup = function(dx, dy){
		for (var x = 0; x < this.entities.length; x++){
//			if(this.entities[x] !== this.owner){
				this.entities[x].trigger('relocate-entity', {x:this.entities[x].x + dx, y:this.entities[x].y + dy});
//			}
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
	component = function(owner, definition){
		this.owner = owner;
		this.timedAudioClips = [],
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'audio-mute-toggle', 'audio-mute', 'audio-unmute']);

		if(definition.audioMap){
			for (var key in definition.audioMap){
				this.addListener(key);
				this[key] = playSound(definition.audioMap[key]);
			}
		}
	};
	var proto = component.prototype;
	
	proto['layer:render'] = function(resp){
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
		}
	};
	
	proto['audio-mute-toggle'] = function(sound){
		createjs.SoundJS.setMute(!createjs.SoundJS.muted, sound);
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
/*
 * Component "broadcast-events"
 * 
 * Notes: Make sure that this component is never set up to receive and broadcast matching messages or an infinite loop will result.
 */
platformer.components['broadcast-events'] = (function(){
	var gameBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				platformer.game.currentScene.trigger(event, value);
			};
		} else {
			return function(value){
				for (var e in event){
					platformer.game.currentScene.trigger(event[e], value);
				}
			};
		}
	};
	
	var parentBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				if(this.owner.parent)
				{
					this.owner.parent.trigger(event, value);
				}
				
			};
		} else {
			return function(value){
				for (var e in event){
					this.owner.parent.trigger(event[e], value);
				}
			};
		}
	};
	
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
 *   change-scene - ../src/js/entity/change-scene.js
 */
platformer.components['change-scene'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.scene = definition.scene;
		this.transition = definition.transition || 'instant';
		this.overrides = definition.overrides || false;
		
		this.addListeners(['new-scene']);
	};
	var proto = component.prototype;
	
	proto['new-scene'] = function(response){
		var resp   = response || this,
		scene      = resp.scene || this.scene,
		transition = resp.transition || this.transition;
		overrides  = resp.overrides  || this.overrides;

		platformer.game.loadScene(scene, transition, overrides);
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
 *   destroy-me - ../src/js/entity/destroy-me.js
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
	
	proto['destroy-me'] = function(value){
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
 *   dom-element - ../src/js/entity/dom-element.js
 */
platformer.components['dom-element'] = (function(){
	var component = function(owner, definition){
		var self    = this, 
		elementType = definition.element || 'div',
		innerHTML   = definition.innerHTML || false;
		
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']);
		
		this.element = this.owner.element = document.createElement(elementType);
		for(i in definition){
			if((i !== 'innerHTML') && (i !== 'type') && (i !== 'element')){
				if(i.indexOf('on') === 0){
					this.element[i] = function(e){
						self.owner.trigger(definition[i], e);
					};
				} else {
//					this.element.setAttribute(i, definition[i]);
					this.element[i] = definition[i];
				}
			}
		}
		if(innerHTML){
			this.element.innerHTML = innerHTML;
		}
	};
	var proto = component.prototype;
	
	proto['layer:render-load'] = function(resp){
		if(resp.element){
			this.parentElement = resp.element;
			this.parentElement.appendChild(this.element);
		}
	};
	
	proto['layer:render'] = function(resp){
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
		this.owner.removeEntity = function(entity){return self.removeEntity(entity);};
		
		if(definition.childEvents){
			for(var event in definition.childEvents){
				this[definition.childEvents[event]] = childBroadcast(definition.childEvents[event]);
				this.addListener(definition.childEvents[event]);
			}
		}
		
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
		    	entity.parent = undefined;
		    	this.entities.splice(x, 1);
				this.owner.trigger('child-entity-removed', entity);
		    	entity.destroy();
			    return entity;
		    }
	    }
	    return false;
	};
	
	var childBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				for (var x = 0; x < this.entities.length; x++)
				{
					this.entities[x].trigger(event, value);
				}
			};
		} else {
			return function(value){
				for (var e in event){
					for (var x = 0; x < this.entities.length; x++)
					{
						this.entities[x].trigger(event[e], value);
					}
				}
			};
		}
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
		this.addListeners(['layer:render', 'layer:render-load']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		if(this.owner.getAABB){
			var aabb   = this.owner.getAABB();
			this.shape.scaleX = aabb.width / this.initialWidth;
			this.shape.scaleY = aabb.height / this.initialHeight;
			this.shape.x = aabb.x - aabb.halfWidth;
			this.shape.y = aabb.y - aabb.halfHeight;
			this.txt.x = aabb.x;
			this.txt.y = aabb.y;
		} else {
			this.shape.x = this.owner.x	- this.regX;
			this.shape.y = this.owner.y	- this.regY;
			this.txt.x = this.owner.x	- this.regX + (this.owner.width / 2);
			this.txt.y = this.owner.y 	- this.regY + (this.owner.height / 2);
		}
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
		this.addListeners(['layer:render', 'layer:render-load', 'camera-update']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
	};

	proto['layer:render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage;
		tile  = undefined;
		
		this.tileList = new createjs.Container();
		
		for(x = 0; x < this.imageMap.length; x++){
			for (y = 0; y < this.imageMap[x].length; y++){
				//TODO: Test speed of this - would non-animations perform better?
				tile = new createjs.BitmapAnimation(this.spriteSheet);
				//tile.scaleX = this.scaleX;
				//tile.scaleY = this.scaleY;
				tile.x = x * this.tileWidth;
				tile.y = y * this.tileHeight;
				this.tileList.addChild(tile);
				tile.gotoAndPlay(this.imageMap[x][y]);
			}
		}
		this.tileList.scaleX = this.scaleX;
		this.tileList.scaleY = this.scaleY;
//		tileList.cache(0, 0, x * this.tileWidth, y * this.tileWidth);
		stage.addChild(this.tileList);
	};
	
	proto['camera-update'] = function(camera){
		var buffer = this.camera.buffer / this.scaleX;
		
		if ((Math.abs(this.camera.x - camera.viewportLeft) > this.camera.buffer) || (Math.abs(this.camera.y - camera.viewportTop) > this.camera.buffer)){
			this.camera.x = camera.viewportLeft;
			this.camera.y = camera.viewportTop;
			this.tileList.cache(camera.viewportLeft / this.scaleX - buffer, camera.viewportTop / this.scaleY - buffer, camera.viewportWidth / this.scaleX + buffer * 2, camera.viewportHeight / this.scaleY + buffer * 2);
//			tileList.cache(buffer, buffer, camera.viewportWidth / this.scaleX - buffer, camera.viewportHeight / this.scaleY - buffer);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.tileList.removeAllChildren();
		this.stage.removeChild(this.tileList);
		this.stage = undefined;
		this.tileList = undefined;
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
	var changeState = function(state){
		return function(value){
			if (this.currentAnimation != state)
			{
				this.currentAnimation = state;
				this.anim.gotoAndPlay(state);
			}
		};
	};
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

		this.addListeners(['layer:render-load', 'layer:render', 'logical-state']);

		if(definition.animationMap){
			for(var i in definition.animationMap){
				this.addListener(i);
				this[i] = changeState(definition.animationMap[i]);
			}
		}
		
		this.stage = undefined;
		for (var x = 0; x < spriteSheet.images.length; x++)
		{
			spriteSheet.images[x] = platformer.assets[spriteSheet.images[x]];
		}
		spriteSheet = new createjs.SpriteSheet(spriteSheet);
		this.anim = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = definition.state || this.owner.state || 'default';
		this.anim.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.anim.scaleY = definition.scaleY || this.owner.scaleY || 1;
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
 *   render-image - ../src/js/entity/render-image.js
 */
platformer.components['render-image'] = (function(){
	var component = function(owner, definition){
		var image = definition.image,
		source    = definition.source;
		
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

		this.addListeners(['layer:render-load', 'layer:render']);
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
	
	proto['layer:render-load'] = function(obj){
		var self = this,
		over     = false;
		
		this.stage = obj.stage;
		this.stage.addChild(this.image);
		
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
	
	proto['layer:render'] = function(obj){
		this.image.x = this.owner.x;
		this.image.y = this.owner.y;
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
 *   render-gui - ../src/js/entity/render-gui.js
 */
platformer.components['render-gui'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render', 'layer:render-load', 'logic-gem-added', 'logic-gem-collected']);
		
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
	
	proto['layer:render-load'] = function(resp){
		this.stage = resp.stage;
		this.stage.addChild(this.background);
		this.background.x = 200;
		this.background.y = 200;
	};
	
	proto['layer:render'] = function(resp){
		
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
 *   render-counter - ../src/js/entity/render-counter.js
 */
platformer.components['render-counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render', 'layer:render-load', 'refresh-count']);
		this.currentValue = 0;
		this.targetValue = 0;
		this.txt = new createjs.Text(this.currentValue.toString());
		this.txt.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.txt.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.txt.color = definition.color || '#000';
	};
	var proto = component.prototype;
	
	proto['layer:render-load'] = function(resp){
		//this.stage = resp.stage;
		this.txt.x = this.owner.x;
		this.txt.y = this.owner.y;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		resp.stage.addChild(this.txt);
	};
	
	proto['layer:render'] = function(){
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
 *   render-clock - ../src/js/entity/render-clock.js
 */
platformer.components['render-clock'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render', 'layer:render-load', 'refresh-clock']);
		this.currentValue = 0;
		this.targetValue = 0;
		this.txt = new createjs.Text(this.currentValue.toString());
		this.txt.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.txt.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.txt.color = definition.color || '#000';
	};
	var proto = component.prototype;
	
	proto['layer:render-load'] = function(resp){
		this.txt.x = this.owner.x;
		this.txt.y = this.owner.y;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		resp.stage.addChild(this.txt);
	};
	
	proto['layer:render'] = function(){
		this.txt.text = Math.floor(this.time / 1000).toString() + 'sec.';
	};
	
	proto['refresh-clock'] = function(data){
		this.time = data.time;
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
 *   logic-button - ../src/js/entity/logic-button.js
 */
platformer.components['logic-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		// Create object to send with messages here so it's not recreated each time.
		this.message = {
			state: definition.state || 'released'
		};

		if(definition.toggle){
			this.toggle = true;
			this.addListener('mouseup');
		} else {
			this.addListeners(['mousedown','mouseup']);
		}
		
		this.addListeners(['layer:logic', 'pressed', 'released']);
	};
	var proto = component.prototype;
	
	proto['mousedown'] = proto['pressed'] = function(){
		this.message.state = 'pressed';
	};
	
	proto['mouseup'] = function(){
		if(this.toggle){
			this.message.state = (this.message.state === 'released')?'pressed':'released';
		} else {
			this.message.state = 'released';
		}
	};
	
	proto['released'] = function(){
		this.message.state = 'released';
	};
	
	proto['layer:logic'] = function(resp){
		this.owner.trigger('logical-state', this.message);
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
 *   logic-collectible-manager - ../src/js/entity/logic-collectible-manager.js
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
 *   logic-carrier - ../src/js/entity/logic-carrier.js
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
	
	proto['layer:logic'] = function(resp){
		var vX    = 0,
		vY        = 0,
		upLeft    = this.upLeft    || (this.up   && this.left),
		downLeft  = this.downLeft  || (this.down && this.left),
		downRight = this.downRight || (this.down && this.right),
		upRight   = this.upRight   || (this.up   && this.right);
		
		if (this.up && this.down){
			this.owner.state = 'standing';
		} else if (this.left && this.right) {
			this.owner.state = 'standing';
		} else if (upLeft) {
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
		
		this.owner.x += (vX * resp.deltaT);
		this.owner.y += (vY * resp.deltaT);
		
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
 *   logic-hero - ../src/js/entity/logic-hero.js
 */
platformer.components['logic-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'set-velocity', 'teleport','key-left','key-right','key-up','key-down','key-jump','key-swing']);
		
		this.owner.state   = this.owner.state || 'ground';
		this.owner.heading = this.owner.heading || 'right';
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
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
	
	proto['layer:logic'] = function(resp){
		var deltaT = resp.deltaT;
		
		if (this.teleportDestination)
		{
			this.owner.x = this.teleportDestination.x;
			this.owner.y = this.teleportDestination.y;
			this.teleportDestination = undefined;
			this.justTeleported = true;
		} else {
			if (this.justTeleported)
			{
				this.justTeleported = false;
				this.owner.trigger('collide-on');
			}
			
			if(this.left) {
				this.vX -= this.aX * deltaT;
				if (this.vX < -this.maxVX)
				{
					this.vX = -this.maxVX;
				}
				this.owner.heading = 'left';
			} else if (this.right) {
				this.vX += this.aX * deltaT;
				if (this.vX > this.maxVX)
				{
					this.vX = this.maxVX;
				}
				this.owner.heading = 'right';
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

			if (this.jump && this.owner.state != 'air') {
				this.vY = -this.aJump;
				this.owner.state = 'air';
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
			this.owner.state = 'air';
		}
		this.hitGround = false;
		
		if(this.swing){
			this.owner.trigger('logical-state', {state: 'swing' + '-' + this.owner.heading});
			if(this.swingInstance){
				this.owner.parent.addEntity(new platformer.classes.entity(platformer.settings.entities['pickaxe'], {
					properties: {
						x: this.owner.x + ((this.owner.heading === 'right')?1:-1) * 140,
						y: this.owner.y
					}
				}));
				this.owner.trigger('pickaxe');
			}
		} else if (this.owner.state == 'ground') {
			if (this.vX == 0) {
				this.owner.trigger('logical-state', {state: 'standing' + '-' + this.owner.heading});
			} else {
				this.owner.trigger('logical-state', {state: 'walking' + '-' + this.owner.heading});
				this.owner.trigger('walking'); //This is for audio
			}
		} else if (this.owner.state == 'air') {
			this.owner.trigger('logical-state', {state: 'jumping' + '-' + this.owner.heading});
		}
		
		this.left  = false;
		this.right = false;
		this.up    = false;
		this.down  = false;
		this.jump  = false;
		this.swingInstance = false;		
		
	};
	
	proto['teleport'] = function (posObj)
	{
		this.owner.trigger('collide-off');
		this.teleportDestination = {x: posObj.x, y: posObj.y};
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
		if(state.pressed)
		{
			this.left = true;
		}
	};
	
	proto['key-right'] = function (state)
	{
		if(state.pressed)
		{
			this.right = true;
		}
	};
	
	proto['key-up'] = function (state)
	{
		if(state.pressed)
		{
			this.up = true;
		}
	};
	
	proto['key-down'] = function (state)
	{
		if(state.pressed)
		{
			this.down = true;
		}
	};
	
	proto['key-jump'] = function (state)
	{
		if(state.pressed)
		{
			this.jump = true;
		}
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
			this.owner.state = 'ground';
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
			this.owner.state = 'ground';
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
 *   logic-gem - ../src/js/entity/logic-gem.js
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
 *   logic-gui - ../src/js/entity/logic-gui.js
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
		this.owner.trigger('count-gems', {count: data.count, debug: true});
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
 *   logic-gravity - ../src/js/entity/logic-gravity.js
 */
platformer.components['logic-gravity'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'hit-solid']);
		
		this.vX = definition.velocityX || 0; 
		this.vY = definition.velocityY || 0;
		this.maxVX = definition.maxVelocityX || definition.maxVelocity || 3;
		this.maxVY = definition.maxVelocityY || definition.maxVelocity || 3;
		this.yGravity = definition.gravity || definition.yGravity || .01;
		this.xGravity = definition.xGravity || 0;
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(resp){
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
 *   logic-portable - ../src/js/entity/logic-portable.js
 */
platformer.components['logic-portable'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'collision-postponement-resolved', 'hit-solid']);
		
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
	
	proto['layer:logic'] = function(resp){
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
 *   logic-pushable - ../src/js/entity/logic-pushable.js
 */
platformer.components['logic-pushable'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'push-entity', 'hit-solid']);
		
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
	
	proto['layer:logic'] = function(resp){
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
 *   logic-counter - ../src/js/entity/logic-counter.js
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
 *   logic-timer - ../src/js/entity/logic-timer.js
 */
platformer.components['logic-timer'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:logic']);
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
	
	
	proto['layer:logic'] = function(data){
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
 *   logic-briar - ../src/js/entity/logic-briar.js
 */
platformer.components['logic-briar'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'peer-entity-added', 'caught-hero']);
		
		this.owner.flower = undefined;
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		this.owner.trigger('logical-state', {state: 'bottom'});
	};
	
	proto['peer-entity-added'] = function(entity){
		if(entity.type == 'flower')
		{
			if(entity.linkId == this.owner.linkId)
			{
				this.owner.flower = entity;
			}
		}
	};
	
	
	
	proto['caught-hero'] = function(collisionInfo){
		if(collisionInfo.y < 0)
		{
			collisionInfo.entity.trigger('teleport', {x: this.owner.flower.x, y: this.owner.flower.y});
		} else if (collisionInfo.y > 0) {
			collisionInfo.entity.trigger('set-velocity', {vY: 0});
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.owner.flower = undefined;
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
 *   collision-basic - ../src/js/entity/collision-basic.js
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
		var x  = 0, 
		self   = this,
		shapes = definition.shapes || (definition.shape?[definition.shape]:[]);

		this.owner    = owner;
		this.lastX    = this.owner.x;
		this.lastY    = this.owner.y;
		this.aabb     = new platformer.classes.aABB();
		this.prevAABB = new platformer.classes.aABB();
		this.canCollide = true;

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
		var swap = this.prevAABB; 
		this.prevAABB = this.aabb;
		this.aabb     = swap;

/*		if(!this.entities){
			if(this.owner.getCollisionGroup){
				this.entities = this.owner.getCollisionGroup();
			}
		}
				
		if(this.entities && (this.entities.length > 1)){
			var goalX    = this.owner.x - this.lastX,
			goalY        = this.owner.y - this.lastY;

			this.aabb.reset();
			for (var x = 0; x < this.shapes.length; x++){
				this.aabb.include(this.shapes[x].getAABB());
			}

			this.owner.x = this.lastX;
			this.owner.y = this.lastY;
			this.owner.collisionUnresolved = false;
			this.owner.trigger('check-collision-group', resp);
//			for (var x = 0; x < this.entities.length; x++){
//				this.entities[x].x += goalX;
//				this.entities[x].y += goalY;
//				entities[x].collisionUnresolved = true; // to ensure they are again tested against parent collisions
//			}
			this.owner.collisionUnresolved = true;
			
			this.aabb.reset();
			for (var x = 0; x < this.shapes.length; x++){
				this.shapes[x].update(this.owner.x, this.owner.y);
				this.aabb.include(this.shapes[x].getAABB());
			}
			for (var x = 0; x < this.entities.length; x++){
				this.aabb.include(this.entities[x].getAABB());
			}

			this.owner.x += goalX;
			this.owner.y += goalY;
			this.aabb.move(this.aabb.x + goalX, this.aabb.y + goalY);
		} else {*/
		
		this.aabb.reset();
		for (var x = 0; x < this.shapes.length; x++){
			this.shapes[x].update(this.owner.x, this.owner.y);
			this.aabb.include(this.shapes[x].getAABB());
		}
		//}
	};
	
	
	proto['relocate-entity'] = function(resp){
		this.owner.x = resp.x;// - this.shapes[0].getXOffset();
		this.owner.y = resp.y;// - this.shapes[0].getYOffset();

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
 *   ai-pacer - ../src/js/entity/ai-pacer.js
 */
platformer.components['ai-pacer'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:ai', 'turn-around']);
		
		this.currentDirection = definition.direction || 1;
	};
	var proto = component.prototype;
	
	proto['layer:ai'] = function(obj){
		if(this.currentDirection > 0)
		{
			this.owner.trigger('go-right', {pressed: true});
			this.owner.trigger('go-left',  {pressed: false});
		} else {
			this.owner.trigger('go-right', {pressed: false});
			this.owner.trigger('go-left',  {pressed: true});
		}
	};
	
	proto['turn-around'] = function(collisionInfo){
		if (collisionInfo.x > 0)
		{
			this.currentDirection = -1;
		} else if (collisionInfo.x < 0) {
			this.currentDirection = 1;
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