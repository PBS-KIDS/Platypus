/**
 * This class plays animation sequences of frames and mimics the syntax required for creating CreateJS Sprites, allowing CreateJS Sprite Sheet definitions to be used with pixiJS.
 *
 * @class PIXIAnimation
 * @extends PIXI.Sprite
 */
//TODO: Document!
/*global include, PIXI, platypus */
(function () {
    'use strict';
    
    var BaseTexture = include('PIXI.BaseTexture'),
        Data = include('platypus.Data'),
        Point = include('PIXI.Point'),
        Rectangle = include('PIXI.Rectangle'),
        Sprite = include('PIXI.Sprite'),
        Texture = include('PIXI.Texture'),
        animationCache = {},
        baseTextureCache = {},
        doNothing = function () {},
        emptyFrame = {
            texture: Texture.EMPTY,
            anchor: new Point(0, 0)
        },
        regex = /[\[\]{},-]/g,
        getBaseTextures = function (images) {
            var i = 0,
                bts = Array.setUp(),
                asset = null,
                assetCache = platypus.game.app.assetManager.cache,
                btCache = baseTextureCache,
                path = null;
            
            for (i = 0; i < images.length; i++) {
                path = images[i];
                if (typeof path === 'string') {
                    if (!btCache[path]) {
                        asset = assetCache.read(path);
                        if (!asset) {
                            platypus.debug.warn('"' + path + '" is not a loaded asset.');
                            break;
                        }
                        btCache[path] = new BaseTexture(asset);
                    }
                    bts.push(btCache[path]);
                } else {
                    bts.push(new BaseTexture(path));
                }
            }
            
            return bts;
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
        getDefaultAnimation = function (length, textures) {
            var frames = Array.setUp(),
                i = 0;
            
            for (i = 0; i < length; i++) {
                frames.push(textures[i] || emptyFrame);
            }
            return Data.setUp(
                "id", "default",
                "frames", frames,
                "next", "default",
                "speed", 1
            );
        },
        standardizeAnimations = function (def, textures) {
            var animation = '',
                anims = Data.setUp(),
                i = 0,
                frames = null,
                key = '';
            
            for (key in def) {
                if (def.hasOwnProperty(key)) {
                    animation = def[key];
                    frames = animation.frames.greenSlice();
                    i = frames.length;
                    while (i--) {
                        frames[i] = textures[frames[i]] || emptyFrame;
                    }
                    anims[key] = Data.setUp(
                        "id", key,
                        "frames", frames,
                        "next", animation.next,
                        "speed", animation.speed
                    );
                }
            }

            if (!anims.default) {
                // Set up a default animation that plays through all frames
                anims.default = getDefaultAnimation(textures.length, textures);
            }
            
            return anims;
        },
        getAnimations = function (spriteSheet) {
            var i = 0,
                anims    = null,
                frame    = null,
                frames   = spriteSheet.frames,
                images   = spriteSheet.images,
                texture  = null,
                textures = Array.setUp(),
                bases    = getBaseTextures(images);

            // Set up texture for each frame
            for (i = 0; i < frames.length; i++) {
                frame = frames[i];
                texture = new Texture(bases[frame[4]], new Rectangle(frame[0], frame[1], frame[2], frame[3]));
                textures.push({
                    texture: texture,
                    anchor: new Point((frame[5] || 0) / texture.width, (frame[6] || 0) / texture.height)
                });
            }

            // Set up animations
            anims = standardizeAnimations(spriteSheet.animations, textures);

            // Set up a default animation that plays through all frames
            if (!anims.default) {
                anims.default = getDefaultAnimation(textures.length, textures);
            }
            
            bases.recycle();
            
            return Data.setUp(
                "textures", textures,
                "animations", anims
            );
        },
        cacheAnimations = function (spriteSheet, cacheId) {
            var i = 0,
                anims    = null,
                frame    = null,
                frames   = spriteSheet.frames,
                images   = spriteSheet.images,
                texture  = null,
                textures = Array.setUp(),
                bases    = getBaseTextures(images);

            // Set up texture for each frame
            for (i = 0; i < frames.length; i++) {
                frame = frames[i];
                texture = new Texture(bases[frame[4]], new Rectangle(frame[0], frame[1], frame[2], frame[3]));
                textures.push({
                    texture: texture,
                    anchor: new Point((frame[5] || 0) / texture.width, (frame[6] || 0) / texture.height)
                });
            }

            // Set up animations
            anims = standardizeAnimations(spriteSheet.animations, textures);

            bases.recycle();
            
            return Data.setUp(
                "textures", textures,
                "animations", anims,
                "viable", 1,
                "cacheId", cacheId
            );
        },
        PIXIAnimation = function (spriteSheet, animation) {
            var FR = 60,
                cacheId = getTexturesCacheId(spriteSheet),
                cache = (cacheId ? animationCache[cacheId] : null),
                speed = (spriteSheet.framerate || FR) / FR;
            
            if (!cacheId) {
                cache = getAnimations(spriteSheet);
            } else if (!cache) {
                cache = animationCache[cacheId] = cacheAnimations(spriteSheet, cacheId);
                this.cacheId = cacheId;
            } else {
                cache.viable += 1;
                this.cacheId = cacheId;
            }
            
            Sprite.call(this, cache.textures[0].texture);
        
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
             * The currently playing animation name.
             *
             * @property currentAnimation
             * @default ""
             * @type String
             * @since 0.9.2
             */
            this.currentAnimation = null;
        
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

            /*
            * Updates the object transform for rendering
            * @private
            */
            this.update = doNothing;

            // Set up initial playthrough.
            if (cache.textures.length < 2) {
                this.gotoAndStop(animation);
            } else {
                this.gotoAndPlay(animation);
            }
        },
        prototype = PIXIAnimation.prototype = Object.create(Sprite.prototype);
    
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
            get: function () {
                return !this.playing;
            },
            set: function (value) {
                if ((value && this.playing) || (!value && !this.playing)) {
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
    };
    
    /**
    * Plays the PIXIAnimation
    *
    */
    prototype.play = function () {
        this.paused = false;
    };
    
    prototype._syncUpdate = (function () {
        var
            update = function (deltaTime) {
                var data = null,
                    name = "",
                    floor = 0;
                
                this._currentTime += this.animationSpeed * this._animation.speed * deltaTime * (60 / 1000);
                
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
                    this.emit('complete', name);
                }
            };
        
        return function () {
            var updating = this.playing && this._visible;
            
            if (updating !== this._updating) {
                this._updating = updating;
                
                if (updating) {
                    this.update = update;
                } else {
                    this.update = doNothing;
                }
            }
        };
    }());
    
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
            this._animation = this._animations.default;
        }
        this._texture = this._animation.frames[0].texture;
        this.anchor =  this._animation.frames[0].anchor;
    };
    
    /**
    * Goes to a specific frame and begins playing the PIXIAnimation
    *
    * @method gotoAndPlay
    * @param animation {string} The animation to begin playing.
    * @param [restart = true] {Boolean} Whether to restart the animation if it's currently playing.
    */
    prototype.gotoAndPlay = function (animation, restart) {
        if ((this.currentAnimation !== animation) || (restart !== false)) {
            this._currentTime = 0;
            this._animation = this._animations[animation];
            this.currentAnimation = animation;
            if (!this._animation) {
                this._animation = this._animations.default;
                this.currentAnimation = 'default';
            }
            this._texture = this._animation.frames[0].texture;
            this.anchor = this._animation.frames[0].anchor;
        }
            
        this.play();
    };
    
    /**
    * Returns whether a particular animation is available.
    *
    * @method has
    * @param animation {string} The animation to check.
    * @since 0.9.0
    */
    prototype.has = function (animation) {
        return !!this._animations[animation];
    };
    
    /**
     * Stops the PIXIAnimation and destroys it
     *
     * @method destroy
     */
    prototype.destroy = function () {
        var key = '';
        
        this.stop();
        Sprite.prototype.destroy.call(this);
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
    
    /**
     * This method makes sure that all the base textures are in the gpu to prevent framerate lurches later due to loading base textures as their textures appear.
     *
     * @method PIXIAnimation.preloadBaseTextures
     * @param renderer {PIXI.WebGLRenderer}
     */
    PIXIAnimation.preloadBaseTextures = function (renderer) {
        var btCache = baseTextureCache,
            key = '';
        
        if (renderer.updateTexture) {
            for (key in btCache) {
                if (btCache.hasOwnProperty(key)) {
                    renderer.updateTexture(btCache[key]);
                }
            }
        }
    };
    
    PIXIAnimation.EmptySpriteSheet = {
        framerate: 60,
        frames: [],
        images: [],
        animations: {},
        recycleSpriteSheet: function () {
            // We don't recycle this sprite sheet.
        }
    };
    
    /**
     * This method formats a provided value into a valid PIXIAnimation Sprite Sheet. This includes accepting the EaselJS spec, strings mapping to Platypus sprite sheets, or arrays of either.
     *
     * @method formatSpriteSheet
     * @param spriteSheet {String|Array|Object} The value to cast to a valid Sprite Sheet.
     * @return {Object}
     * @since 0.8.4
     */
    PIXIAnimation.formatSpriteSheet = (function () {
        var imageParts = /([\w-]+)\.(\w+)$/,
            addAnimations = function (source, destination, speedRatio, firstFrameIndex, id) {
                var key = '';
                
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (destination[key]) {
                            destination[key].frames.recycle();
                            destination[key].recycle();
                            platypus.debug.olive('PIXIAnimation "' + id + '": Overwriting duplicate animation for "' + key + '".');
                        }
                        destination[key] = formatAnimation(key, source[key], speedRatio, firstFrameIndex);
                    }
                }
            },
            addFrameObject = function (source, destination, firstImageIndex, bases) {
                var i = 0,
                    fw = source.width,
                    fh = source.height,
                    rx = source.regX || 0,
                    ry = source.regY || 0,
                    w = 0,
                    h = 0,
                    x = 0,
                    y = 0;
                
                for (i = 0; i < bases.length; i++) {
                    
                    // Subtract the size of a frame so that margin slivers aren't returned as frames.
                    w = bases[i].realWidth - fw;
                    h = bases[i].realHeight - fh;
                    
                    for (y = 0; y <= h; y += fh) {
                        for (x = 0; x <= w; x += fw) {
                            destination.push([x, y, fw, fh, i + firstImageIndex, rx, ry]);
                        }
                    }
                }
            },
            addFrameArray = function (source, destination, firstImageIndex) {
                var frame = null,
                    i = 0;
                
                for (i = 0; i < source.length; i++) {
                    frame = source[i];
                    destination.push(Array.setUp(
                        frame[0],
                        frame[1],
                        frame[2],
                        frame[3],
                        frame[4] + firstImageIndex,
                        frame[5],
                        frame[6]
                    ));
                }
            },
            format = function (source, destination) {
                var bases = null,
                    dAnims = destination.animations,
                    dImages = destination.images,
                    dFR = destination.framerate || 60,
                    dFrames = destination.frames,
                    i = 0,
                    images = Array.setUp(),
                    firstImageIndex = dImages.length,
                    firstFrameIndex = dFrames.length,
                    sAnims = source.animations,
                    sImages = source.images,
                    sFR = source.framerate || 60,
                    sFrames = source.frames;
                
                // Set up id
                if (destination.id) {
                    destination.id += ';' + (source.id || source.images.join(','));
                } else {
                    destination.id = source.id || source.images.join(',');
                }
                
                // Set up images array
                for (i = 0; i < sImages.length; i++) {
                    images.push(formatImages(sImages[i]));
                    dImages.push(images[i]);
                }

                // Set up frames array
                if (Array.isArray(sFrames)) {
                    addFrameArray(sFrames, dFrames, firstImageIndex);
                } else {
                    bases = getBaseTextures(images);
                    addFrameObject(sFrames, dFrames, firstImageIndex, bases);
                    bases.recycle();
                }
                
                // Set up animations object
                addAnimations(sAnims, dAnims, sFR / dFR, firstFrameIndex, destination.id);
                
                images.recycle();
                
                return destination;
            },
            formatAnimation = function (key, animation, speedRatio, firstFrameIndex) {
                var i = 0,
                    first = 0,
                    frames = Array.setUp(),
                    last = 0;
                
                if (typeof animation === 'number') {
                    frames.push(animation + firstFrameIndex);
                    return Data.setUp(
                        "frames", frames,
                        "next", key,
                        "speed", speedRatio
                    );
                } else if (Array.isArray(animation)) {
                    first = animation[0] || 0;
                    last = (animation[1] || first) + 1 + firstFrameIndex;
                    first += firstFrameIndex;
                    for (i = first; i < last; i++) {
                        frames.push(i);
                    }
                    return Data.setUp(
                        "frames", frames,
                        "next", animation[2] || key,
                        "speed", (animation[3] || 1) * speedRatio
                    );
                } else {
                    for (i = 0; i < animation.frames.length; i++) {
                        frames.push(animation.frames[i] + firstFrameIndex);
                    }
                    return Data.setUp(
                        "frames", frames,
                        "next", animation.next || key,
                        "speed", (animation.speed || 1) * speedRatio
                    );
                }
            },
            formatImages = function (name) {
                var match = false;
                
                if (typeof name === 'string') {
                    match = name.match(imageParts);

                    if (match) {
                        return match[1];
                    }
                }

                return name;
            },
            recycle = function () {
                var animations = this.animations,
                    key = '';
                
                for (key in animations) {
                    if (animations.hasOwnProperty(key)) {
                        animations[key].frames.recycle();
                    }
                    animations[key].recycle();
                }
                
                this.frames.recycle(2);
                this.images.recycle();
                this.recycle();
            },
            merge = function (spriteSheets, destination) {
                var i = spriteSheets.length,
                    ss = null;
                
                while (i--) {
                    ss = spriteSheets[i];
                    if (typeof ss === 'string') {
                        ss = platypus.game.settings.spriteSheets[ss];
                    }
                    if (ss) {
                        format(ss, destination);
                    }
                }
                
                return destination;
            };
        
        return function (spriteSheet) {
            var response = PIXIAnimation.EmptySpriteSheet,
                ss = spriteSheet;
            
            if (typeof ss === 'string') {
                ss = platypus.game.settings.spriteSheets[spriteSheet];
            }
            
            if (ss) {
                response = Data.setUp(
                    "animations", Data.setUp(),
                    "framerate", 60,
                    "frames", Array.setUp(),
                    "id", '',
                    "images", Array.setUp(),
                    "recycleSpriteSheet", recycle
                );
                    
                if (Array.isArray(ss)) {
                    return merge(ss, response);
                } else if (ss) {
                    return format(ss, response);
                }
            }

            return response;
        };
    }());
}());
