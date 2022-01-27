import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicTimer.prototype */{
        id: 'LogicTimer',

        properties: {
            /**
             * The starting time for the timer.
             *
             * @property time
             * @type Number
             * @default 0
             */
            time: 0,

            /**
             * The time when the alarm will trigger the alarm message. Defaults to `0``, which never triggers the alarm.
             *
             * @property alarmTime
             * @type Number
             * @default 0
             */
            alarmTime: 0,

            /**
             * Whether or not the alarm fires at intervals of the alarmTime.
             *
             * @property isInterval
             * @type Boolean
             * @default false
             */
            isInterval: false,

            /**
             * The message sent when the alarm goes off.
             *
             * @property alarmMessage
             * @type String
             * @default ''
             */
            alarmMessage: '',

            /**
             * The message sent when the timer updates.
             *
             * @property updateMessage
             * @type String
             * @default ''
             */
            updateMessage: '',

            /**
             * Whether the alarm starts on.
             *
             * @property isOn
             * @type Boolean
             * @default true
             */
            isOn: true,

            /**
             * Whether the timer is incrementing or decrementing. If the value is `false` it is decrementing.
             *
             * @property isIncrementing
             * @type Boolean
             * @default true
             */
            isIncrementing: true,

            /**
             * The max value in MS, positive or negative, that the timer will count to. Once reached, it stops counting. Defaults to one hour.
             *
             * @property maxTime
             * @type Number
             * @default 3600000
             */
            maxTime: 3600000,

            /**
             * Whether this alarm should reset to full initial time if restarted after being stopped.
             *
             * @property resetOnStop
             * @type Boolean
             * @default false
             */
            resetOnStop: false
        },

        /**
         * A timer that can used to trigger events. The timer can increment and decrement. It can be an interval timer, going off over and over. Has a max time which it will not exceed by default this is 1 hour.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#set-timer
         * @listens platypus.Entity#start-timer
         * @listens platypus.Entity#stop-timer
         */
        initialize: function () {
            this.prevTime = this.time;
        },

        events: {
            "handle-logic": function (tick) {
                if (this.isOn) {
                    this.prevTime = this.time;
                    if (this.isIncrementing) {
                        this.time += tick.delta;
                    } else {
                        this.time -= tick.delta;
                    }
                    
                    if (Math.abs(this.time) > this.maxTime) {
                        //If the timer hits the max time we turn it off so we don't overflow anything.
                        if (this.time > 0) {
                            this.time = this.maxTime;
                        } else if (this.time < 0) {
                            this.time = -this.maxTime;
                        }
                        this.triggerEvent('stop-timer');
                    }
                    
                    if (this.alarmTime !== 0) {
                        if (this.isInterval) {
                            if (this.isIncrementing) {
                                if (Math.floor(this.time / this.alarmTime) > Math.floor(this.prevTime / this.alarmTime)) {
                                    this.owner.trigger(this.alarmMessage);
                                }
                            } else if (Math.floor(this.time / this.alarmTime) < Math.floor(this.prevTime / this.alarmTime)) {
                                this.owner.trigger(this.alarmMessage);
                            }
                        } else if (this.isIncrementing) {
                            if (this.time > this.alarmTime && this.prevTime < this.alarmTime) {
                                this.owner.trigger(this.alarmMessage);
                            }
                        } else if (this.time < this.alarmTime && this.prevTime > this.alarmTime) {
                            this.owner.trigger(this.alarmMessage);
                        }
                    }
                }
                this.owner.trigger(this.updateMessage, {time: this.time});
            },

            /**
             * Sets time for alarm.
             *
             * @event platypus.Entity#set-timer
             * @param {Number} data.time Time to set for alarm.
             */
            "set-timer": function (data) {
                this.time = data.time;
            },

            /**
             * Starts the timer's countdown.
             *
             * @event platypus.Entity#start-timer
             */
            "start-timer": function () {
                this.isOn = true;
            },

            /**
             * Stops the timer's countdown. If `resetOnStop` is `true`, resets timer.
             *
             * @event platypus.Entity#stop-timer
             */
            "stop-timer": function () {
                this.isOn = false;
                if (this.resetOnStop) {
                    this.time = 0;
                }
            }
        }
    });
}());
