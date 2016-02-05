/**
 * This class plays animation sequences of frames and mimics the syntax required for creating CreateJS Sprites, allowing CreateJS Sprite Sheet definitions to be used with pixiJS.
 *
 * @class PIXIAnimation
 * @extends PIXI.Sprite
 */
//TODO: Document!
/*global console, include, PIXI, platypus */
/*jslint plusplus:true, nomen:true */
(function () {
    "use strict";
    
    var Application = include('springroll.Application'), // Import SpringRoll classes
        animationCache = {},
        regex = /[\[\]{},-]/g,
        createFramesArray = function (frame, bases) {
            var i = 0,
                fw = frame.width,
                fh = frame.height,
                rx = frame.regX || 0,
                ry = frame.regY || 0,
                w = 0,
                h = 0,
                x = 0,
                y = 0,
                frames = Array.setUp();
            
            for (i = 0; i < bases.length; i++) {
                
                // Subtract the size of a frame so that margin slivers aren't returned as frames.
                w = bases[i].realWidth - fw;
                h = bases[i].realHeight - fh;
                
                for (y = 0; y <= h; y += fh) {
                    for (x = 0; x <= w; x += fw) {
                        frames.push([x, y, fw, fh, i, rx, ry]);
                    }
                }
            }
            
            return frames;
        },
        getBaseTextures = function (images) {
            var i = 0,
                bts = Array.setUp(),
                asset = null,
                assetCache = Application.instance.assetManager.cache;
            
            for (i = 0; i < images.length; i++) {
                if (typeof images[i] === 'string') {
                    asset = assetCache.read(images[i]);
                    if (!asset) {
                        console.warn('"' + images[i] + '" is not a loaded asset.');
                        break;
                    }
                } else {
                    asset = images[i];
                }
                
                bts.push(new PIXI.BaseTexture(asset));
            }
            
            return bts;
        },
        getCacheId = function (images, frame) {
            return images[frame[4]] + '-x' + frame[0] + 'y' + frame[1] + 'w' + frame[2] + 'h' + frame[3];
        },
        getTexturesCacheId = function (spriteSheet) {
            var i = 0;
            
            if (spriteSheet.id) {
                return spriteSheet.id;
            }
            
            for (i = 0; i < spriteSheet.images.length; i++) {
                if (typeof spriteSheet.images[i] !== 'string') {
                    return '';
                }
            }
            
            spriteSheet.id = JSON.stringify(spriteSheet).replace(regex, '');

            return spriteSheet.id;
        },
        formatAnimation = function (key, animation, textures) {
            var i = 0,
                frames = Array.setUp();
            
            if (!isNaN(animation)) {
                frames.push(textures[animation] || PIXI.Texture.EMPTY);
                return {
                    id: key,
                    frames: frames,
                    next: key,
                    speed: 1
                };
            } else if (Array.isArray(animation)) {
                for (i = animation[0]; i < animation[1] + 1; i++) {
                    frames.push(textures[i] || PIXI.Texture.EMPTY);
                }
                return {
                    id: key,
                    frames: frames,
                    next: animation[2] || key,
                    speed: animation[3] || 1
                };
            } else {
                for (i = 0; i < animation.frames.length; i++) {
                    frames.push(textures[animation.frames[i]] || PIXI.Texture.EMPTY);
                }
                return {
                    id: key,
                    frames: frames,
                    next: animation.next || key,
                    speed: animation.speed || 1
                };
            }
        },
        standardizeAnimations = function (def, textures) {
            var key = '',
                anims = {};
            
            for (key in def) {
                if (def.hasOwnProperty(key)) {
                    anims[key] = formatAnimation(key, def[key], textures);
                }
            }
            
            return anims;
        },
        getAnimations = function (spriteSheet) {
            var i = 0,
                anims    = null,
                frame    = null,
                frames   = null,
                images   = spriteSheet.images,
                texture  = null,
                textures = Array.setUp(),
                bases    = getBaseTextures(images);

            // Set up frames array
            if (Array.isArray(spriteSheet.frames)) {
                frames = spriteSheet.frames.greenSlice();
            } else {
                frames = createFramesArray(spriteSheet.frames, bases);
            }
            
            // Set up texture for each frame
            for (i = 0; i < frames.length; i++) {
                frame = frames[i];
                texture = new PIXI.Texture(bases[frame[4]], new PIXI.Rectangle(frame[0], frame[1], frame[2], frame[3]));
                textures.push({
                    texture: texture,
                    anchor: new PIXI.Point((frame[5] || 0) / texture.width, (frame[6] || 0) / texture.height)
                });
            }

            // Set up animations
            anims = standardizeAnimations(spriteSheet.animations || {}, textures);

            // Set up a default animation that plays through all frames
            if (!anims['default']) {
                anims['default'] = formatAnimation('default', [0, textures.length - 1], textures);
            }
            
            frames.recycle();
            bases.recycle();
            
            return {
                textures: textures,
                animations: anims
            };
        },
        cacheAnimations = function (spriteSheet, cacheId) {
            var i = 0,
                id = '',
                anims    = null,
                frame    = null,
                frames   = null,
                images   = spriteSheet.images,
                texture  = null,
                textures = Array.setUp(),
                bases    = getBaseTextures(images);

            // Set up frames array
            if (Array.isArray(spriteSheet.frames)) {
                frames = spriteSheet.frames.greenSlice();
            } else {
                frames = createFramesArray(spriteSheet.frames, bases);
            }
            
            // Set up texture for each frame
            for (i = 0; i < frames.length; i++) {
                frame = frames[i];
                id = getCacheId(images, frame);
                texture = new PIXI.Texture(bases[frame[4]], new PIXI.Rectangle(frame[0], frame[1], frame[2], frame[3]));
                textures.push({
                    texture: texture,
                    anchor: new PIXI.Point((frame[5] || 0) / texture.width, (frame[6] || 0) / texture.height)
                });
            }

            // Set up animations
            anims = standardizeAnimations(spriteSheet.animations || {}, textures);

            // Set up a default animation that plays through all frames
            if (!anims['default']) {
                anims['default'] = formatAnimation('default', [0, textures.length - 1], textures);
            }
            
            frames.recycle();
            bases.recycle();
            
            return {
                textures: textures,
                animations: anims,
                viable: 1,
                cacheId: cacheId
            };
        },
        PIXIAnimation = function (spriteSheet, animation) {
            var cacheId = getTexturesCacheId(spriteSheet),
                cache   = (cacheId ? animationCache[cacheId] : null),
                speed   = (spriteSheet.framerate || 60) / 60;
            
            if (!cacheId) {
                cache = getAnimations(spriteSheet);
            } else if (!cache) {
                cache = animationCache[cacheId] = cacheAnimations(spriteSheet, cacheId);
                this.cacheId = cacheId;
            } else {
                cache.viable += 1;
                this.cacheId = cacheId;
            }
            
            PIXI.Sprite.call(this, cache.textures[0].texture);
        
            /**
            * @private
            */
            this._animations = cache.animations;
            
            this._animation = null;
        
            /**
            * The speed that the PIXIAnimation will play at. Higher is faster, lower is slower
            *
            * @member {number}
            * @default 1
            */
            this.animationSpeed = speed;
        
            /**
            * Function to call when a PIXIAnimation finishes playing
            *
            * @method
            * @memberof PIXIAnimation#
            */
            this.onComplete = null;
        
            /**
            * Elapsed time since animation has been started, used internally to display current texture
            *
            * @member {number}
            * @private
            */
            this._currentTime = 0;
        
            /**
            * Indicates if the PIXIAnimation is currently playing
            *
            * @member {boolean}
            * @readonly
            */
            this.playing = false;
            
            this._visible = true;
            
            this._updating = false;

            // Set up initial playthrough.
            if (cache.textures.length < 2) {
                this.gotoAndStop(animation);
            } else {
                this.gotoAndPlay(animation);
            }
        },
        prototype = PIXIAnimation.prototype = Object.create(PIXI.Sprite.prototype);
    
    PIXIAnimation.prototype.constructor = PIXIAnimation;
    platypus.PIXIAnimation = PIXIAnimation;
    
    Object.defineProperties(prototype, {
        /**
        * The visibility of the sprite.
        *
        * @property visible
        * @memberof PIXI.DisplayObject#
        */
        visible: {
            get: function () {
                return this._visible;
            },
            set: function (value) {
                this._visible = value;
                this._syncUpdate();
            }
        },
        
       /**
        * The PIXIAnimations current frame index
        *
        * @member {number}
        * @memberof platypus.PIXIAnimation#
        * @readonly
        */
        currentFrame: {
            get: function () {
                var frames = this._animation.frames;
                return frames[Math.floor(this._currentTime) % frames.length];
            }
        },
        
        /**
        * The PIXIAnimations paused state. If paused, the animation doesn't update.
        *
        * @property paused
        */
        paused: {
            get: function() {
                return !this.playing;
            },
            set: function(value) {
                if ((value && this.playing) || (!value && !this.playing)){
                    this.playing = !value;
                    this._syncUpdate();
                }
            }
        }
    
    });
    
    /**
    * Stops the PIXIAnimation
    *
    */
    prototype.stop = function () {
        this.paused = true;
        /*
        if (!this.playing) {
            return;
        }
    
        this.playing = false;
        this._syncUpdate();
        */
    };
    
    /**
    * Plays the PIXIAnimation
    *
    */
    prototype.play = function () {
        this.paused = false;
        /*
        if (this.playing) {
            return;
        }
    
        this.playing = true;
        this._syncUpdate();
        */
    };
    
    prototype._syncUpdate = function () {
        var update = this.playing && this._visible;
        
        if (update !== this._updating) {
            this._updating = update;
            
            if (update) {
                PIXI.ticker.shared.add(this.update, this);
            } else {
                PIXI.ticker.shared.remove(this.update, this);
            }
        }
    };
    
    /**
    * Stops the PIXIAnimation and goes to a specific frame
    *
    * @param frameNumber {number} frame index to stop at
    */
    prototype.gotoAndStop = function (animation) {
        this.stop();
    
        this._currentTime = 0;
        this._animation = this._animations[animation];
        if (!this._animation) {
            this._animation = this._animations['default'];
        }
        this._texture = this._animation.frames[0].texture;
        this.anchor =  this._animation.frames[0].anchor;
    };
    
    /**
    * Goes to a specific frame and begins playing the PIXIAnimation
    * 
    * @method gotoAndPlay
    * @param animation {string} The animation to begin playing.
    */
    prototype.gotoAndPlay = function (animation) {
        this._currentTime = 0;
        this._animation = this._animations[animation];
        if (!this._animation) {
            this._animation = this._animations['default'];
        }
        this._texture = this._animation.frames[0].texture;
        this.anchor = this._animation.frames[0].anchor;
        
        this.play();
    };
    
    /*
    * Updates the object transform for rendering
    * @private
    */
    prototype.update = function (deltaTime) {
        var data = null,
            name = "",
            floor = 0;
        
        this._currentTime += this.animationSpeed * this._animation.speed * deltaTime;
        
        floor = Math.floor(this._currentTime);
    
        if (floor < 0) {
            floor = 0;
        }
        
        if (floor < this._animation.frames.length) {
            data = this._animation.frames[floor % this._animation.frames.length];
            this._texture = data.texture;
            this.anchor = data.anchor;
        } else if (floor >= this._animation.frames.length) {
            name = this._animation.id;
            this.gotoAndPlay(this._animation.next);
            if (this.onComplete) {
                this.onComplete(name);
            }
        }
    };
    
    /**
     * Stops the PIXIAnimation and destroys it
     * 
     * @method destroy
     */
    prototype.destroy = function () {
        var key = '';
        
        this.stop();
        PIXI.Sprite.prototype.destroy.call(this);
        if (this.cacheId) {
            animationCache[this.cacheId].viable -= 1;
            if (animationCache[this.cacheId].viable <= 0) {
                animationCache[this.cacheId].textures.recycle();
                for (key in animationCache[this.cacheId].animations) {
                    if (animationCache[this.cacheId].animations.hasOwnProperty(key)) {
                        animationCache[this.cacheId].animations[key].frames.recycle();
                    }
                }
                delete animationCache[this.cacheId];
            }
        }
    };
}());
