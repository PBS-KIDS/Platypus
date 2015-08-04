/**
 * 
 */
/*global platypus */
(function (window) {
    "use strict";
    
    // Example of a custom component being created prior to its use by an entity (referenced by its provided id). "createComponentClass" adds the new component to the list of available components.
    (function () {
        return platypus.createComponentClass({
            id: "LogicHero",
            constructor: function (definition) {
                var state = this.state = this.owner.state;
                state.swing = false;
                state.swingHit = false;
                
                this.teleportDestination = undefined;
                this.justTeleported = false;
            },
            events:{
                "handle-logic": function () {            
                },
                "portal-waiting": function (portal) {
                    portal.trigger('activate-portal');
                }
            }
        });
    }())
    
    if (window) {
        window.addEventListener('load', function () {
            window.game = new platypus.Game('config.json');
        }, false);
    }
}(window));
