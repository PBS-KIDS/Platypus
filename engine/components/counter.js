/**
# COMPONENT **counter**
A simple component that keeps count of something and sends messages each time the count changes. Can also have a total. When it does it will display 'count / total'.

## Messages

### Listens for:
- **increment-count** - Increments the count by 1.
- **change-count** - Changes the count to the given value.
  - @param data.count (number) - The new count value.
- **change-total** - Changes the total to the given value.
  - @param data.total (number) - The new total value.

### Local Broadcasts:
- **update-content** - A call used to notify other components that the count or total has changed.
  - @param number - The count.
  
## JSON Definition
    {
      "type": "counter"
    }
*/
/*global platformer */
(function () {
    "use strict";
    
    return platformer.createComponentClass({
        id: 'counter',
        constructor: function (definition) {
            this.count = 0;
            this.total = 0;
            this.showTotal = definition.showTotal || false;
            this.output = {
                text: ''
            };
        },
        events: {
            "change-total": function (total) {
                this.total = total;
                this.updateText();
            },
            "change-count": function (count) {
                this.count = count;
                this.updateText();
            },
            "increment-count": function () {
                this.count += 1;
                this.updateText();
            }
        },
        methods: {
            updateText: function () {
                if (this.total) {
                    this.output.text = String(this.count) + "/" + String(this.total);
                } else {
                    this.output.text = String(this.count);
                }
                this.owner.trigger('update-content', this.output);
            }
        }
    });
}());
