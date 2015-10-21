/**
 * A simple component that keeps count of something and sends messages each time the count changes. Can also have a total. When it does it will display 'count / total'.
 * 
 * @namespace platypus.components
 * @class Counter
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    "use strict";
    
    return platypus.createComponentClass({

        id: 'Counter',

        publicProperties: {
            /**
             * A total the counter is incrementing toward.
             * 
             * @property total
             * @type number
             * @default 0
             */
            total: 0
        },

        constructor: function (definition) {
            this.count = 0;
            this.lastTotal = 0;
            this.lastCount = 0;
        },

        events: {
            /**
             * Each step, this component detects whether the count has changed and triggers an 'update-content' event if so.
             * 
             * @method 'handle-logic'
             */
            "handle-logic": function () {
                var txt = '',
                update  = false;
                
                if (this.total !== this.lastTotal) {
                    this.lastTotal = this.total;
                    update = true;
                }
                
                if (this.count !== this.lastCount) {
                    this.lastCount = this.count;
                    update = true;
                }
                
                if (update) {
                    if (this.total) {
                        txt = String(this.count) + "/" + String(this.total);
                    } else {
                        txt = String(this.count);
                    }
                    
                    /**
                     * A call used to notify other components that the count or total has changed.
                     * 
                     * @event 'update-content'
                     * @param update.text {string} String describing the current count.
                     */
                    this.owner.triggerEvent('update-content', {
                        text: txt
                    });
                }
            },

            /**
             * Changes the total to the given value.
             * 
             * @method 'change-total'
             * @param data.total {number} The new total value.
             */
            "change-total": function (total) {
                this.total = total;
            },

            /**
             * Changes the count to the given value.
             * 
             * @method 'change-count'
             * @param data.count {number} The new count value.
             */
            "change-count": function (count) {
                this.count = count;
            },

            /**
             * Increments the count by 1.
             * 
             * @method 'increment-count'
             */
            "increment-count": function () {
                this.count += 1;
            }
        }
    });
}());
