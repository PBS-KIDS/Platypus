/* global platypus */
import {Container, Graphics, Point} from 'pixi.js';
import createComponentClass from '../factory.js';

export default createComponentClass(/** @lends platypus.components.RenderProgress.prototype */{
    
    id: 'RenderProgress',
    
    properties: {
        //TODO: Document!
        backgroundColor: 0x000000,
        
        color: 0xffffff,
        
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
    
    /**
     * This component creates a visual progress bar that can be used for loading assets or showing other types of progress changes.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#handle-render
     * @listens platypus.Entity#handle-render-load
     */
    initialize: function () {
        var b   = new Graphics(),
            f   = new Graphics(),
            con = new Container();
        
        this.parentContainer = null;
        this.background = b;
        this.progress   = f;
        this.container  = con;
        
        if (typeof this.backgroundColor === 'string') {
            this.backgroundColor = +this.backgroundColor.replace('#', '0x');
        }
        if (typeof this.color === 'string') {
            this.color = +this.color.replace('#', '0x');
        }
        
        b.f(this.backgroundColor).drawRect(-this.regX, -this.regY, this.width, this.height);
        f.f(this.color).drawRect(-this.regX, -this.regY, this.width, this.height);
        f.scale = new Point(0.0001, 1);
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
            if (!this.container) { // If this component's removal is pending
                return;
            }

            if (!this.parentContainer) {
                if (resp && resp.container) {
                    this.parentContainer = resp.container;
                    this.parentContainer.addChild(this.container);
                } else {
                    platypus.debug.warn('No PIXI Stage, removing ProgressRender component from "' + this.owner.type + '".');
                    this.owner.removeComponent(this);
                }
            }
            
            this.container.x = this.x;
            this.container.y = this.y;
            this.container.z = this.z;
        },
        
        "update-progress": function (progress) {
            if (isNaN(progress)) {
                if (typeof progress.fraction === 'number') {
                    this.progress.scale.x = progress.fraction;
                } else if ((typeof progress.total === 'number') && (typeof progress.progress === 'number')) {
                    this.progress.scale.x = progress.progress / progress.total;
                }
            } else {
                this.progress.scale.x = progress;
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
