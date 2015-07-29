/**
 * This component handles audio channels across all [[Audio]] instances.
 * 
 * @namespace platypus.components
 * @class AudioMixer
 * @uses Component
 */
/*global createjs, platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'AudioMixer',
            
        constructor: function (definition) {
            if (!platypus.game.audioMixer) {
                platypus.game.audioMixer = {
                    channels: {},
                    paused: false,
                    getChannel: function (id) {
                        if (!this.channels[id]) {
                            this.channels[id] = {
                                volume: 1,
                                mute: false,
                                paused: false,
                                pan: 0,
                                update: 0
                            };
                        }

                        return this.channels[id];
                    }
                };
            }
            
            this.mixer = platypus.game.audioMixer;
            this.owner.state.muted  = createjs.Sound.getMute();
            this.owner.state.paused = this.mixer.paused;
        },

        events: {
            /**
             * This event toggles mute on a channel if provided. If no channel is provided, all audio is toggled.
             * 
             * @method 'toggle-mute'
             * @param channelId {String} The id of an audio channel to toggle mute on.
             */
            "toggle-mute": function (channelId) {
                var mute    = false,
                    channel = null;
                
                if (channelId) {
                    channel = this.mixer.getChannel(channelId);
                    channel.mute = !channel.mute;
                    channel.update += 1;
                } else {
                    mute = !createjs.Sound.getMute();
                    this.owner.state.muted = mute;
                    createjs.Sound.setMute(mute);
                }
            },
            
            /**
             * This event mutes a channel if provided. If no channel is provided, all audio is muted.
             * 
             * @method 'mute-audio'
             * @param channelId {String} The id of an audio channel to mute.
             */
            "mute-audio": function (channelId) {
                var channel = null;
                
                if (channelId) {
                    channel = this.mixer.getChannel(channelId);
                    if (!channel.mute) {
                        channel.mute = true;
                        channel.update += 1;
                    }
                } else {
                    createjs.Sound.setMute(true);
                    this.owner.state.muted = true;
                }
            },
            
            /**
             * This event unmutes a channel if provided. If no channel is provided, all audio is unmuted.
             * 
             * @method 'unmute-audio'
             * @param channelId {String} The id of an audio channel to unmute.
             */
            "unmute-audio": function (channelId) {
                var channel = null;
                
                if (channelId) {
                    channel = this.mixer.getChannel(channelId);
                    if (channel.mute) {
                        channel.mute = false;
                        channel.update += 1;
                    }
                } else {
                    createjs.Sound.setMute(false);
                    this.owner.state.muted = false;
                }
            },
            
            /**
             * This event pauses a channel if provided. If no channel is provided, all audio is paused.
             * 
             * @method 'pause-audio'
             * @param channelId {String} The id of an audio channel to pause.
             */
            "pause-audio": function (channelId) {
                var channel = null;
                 
                if (channelId) {
                    channel = this.mixer.getChannel(channelId);
                    if (!channel.paused) {
                        channel.paused = true;
                        channel.update += 1;
                    }
                } else {
                    this.mixer.paused = true;
                    this.owner.state.paused = true;
                }
            },
            
            /**
             * This event unpauses a channel if provided. If no channel is provided, all audio is unpaused.
             * 
             * @method 'unpause-audio'
             * @param channelId {String} The id of an audio channel to unpause.
             */
            "unpause-audio": function (channelId) {
                var channel = null;
                
                if (channelId) {
                    channel = this.mixer.getChannel(channelId);
                    if (channel.paused) {
                        channel.paused = false;
                        channel.update += 1;
                    }
                } else {
                    this.mixer.paused = false;
                    this.owner.state.paused = false;
                }
            },
            
            /**
             * This event sets the volume on a channel if provided. If no channel is provided, all audio volume is updated.
             * 
             * @method 'set-volume'
             * @param volumeOptions {number|Object} Volume or an object with volume and channelId properties.
             * @param [volumeOptions.volume] {number} Number between 0 and 1 to set volume.
             * @param [volumeOptions.channelId] {String} Channel ID listing channel to set volume on.
             */
            "set-volume": function (volumeOptions) {
                var channel = null;
                
                if (volumeOptions && volumeOptions.channelId) {
                    channel = this.mixer.getChannel(volumeOptions.channelId);
                    if (channel.volume !== volumeOptions.volume) {
                        channel.volume = volumeOptions.volume;
                        channel.update += 1;
                    }
                } else {
                    createjs.Sound.setVolume(volumeOptions);
                }
            }
        }
    });
}());
