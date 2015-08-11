/*global platypus */
(function () {
    "use strict";
    
    return platypus.createComponentClass({
        
        id: 'RenderProgress',
        
        properties: {
            backgroundColor: "#000000",
            
            color: "#ffffff",
            
            rotate: false,
            
            mirror: false,
            
            flip: false,
            
            width: 100,
            
            height: 20,
            
            regX: 0,
            
            regY: 0
        },
        
        publicProperties: {
            x: 0,
            
            y: 0,
            
            z: 0
        },
        
        constructor: function (definition) {
            var b   = new createjs.Shape(),
                f   = new createjs.Shape(),
                con = new createjs.Container();
            
            this.parentContainer = null;
            this.background = b;
            this.progress   = f;
            this.container  = con;
            
            b.graphics.f(this.backgroundColor).r(-this.regX, -this.regY, this.width, this.height);
            f.graphics.f(this.color).r(-this.regX, -this.regY, this.width, this.height);
            con.addChild(b);
            con.addChild(f);
        },
        
        events: {
            "handle-render-load": function (resp) {
                if (!this.parentContainer && resp && resp.container) {
                    this.parentContainer = resp.container;
                    this.parentContainer.addChild(this.container);
                }
            },
            
            "handle-render": function (resp) {
                if (!this.parentContainer) {
                    if (resp && resp.container) {
                        this.parentContainer = resp.container;
                        this.parentContainer.addChild(this.container);
                    } else {
                        console.warn('No CreateJS Stage, removing ProgressRender component from "' + this.owner.type + '".');
                        this.owner.removeComponent(this);
                    }
                }
            },
            
            "update-progress": function (progress) {
                if (isNaN(progress)) {
                    if (typeof progress.fraction === 'number') {
                        this.progress.scaleX = progress.fraction;
                    } else if ((typeof progress.total === 'number') && (typeof progress.progress === 'number')) {
                        this.progress.scaleX = progress.progress / progress.total;
                    }
                } else {
                    this.progress.scaleX = progress;
                }
            }
        },
        
        methods: {
            destroy: function () {
                if (this.parentContainer) {
                    this.parentContainer.removeChild(this.container);
                    this.parentContainer = null;
                }
                this.container = null;
            }
        }
    });
}());
