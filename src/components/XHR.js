/* global window */
import createComponentClass from '../factory.js';

const
    XMLHttpRequest = window.XMLHttpRequest;

export default createComponentClass(/** @lends platypus.components.XHR.prototype */{
    id: 'XHR',
    
    properties: {
        /**
         * Sets the XHR method to use.
         *
         * @property method
         * @type String
         * @default "GET"
         */
        method: "GET",
        
        /**
         * Sets the path to connect to the server.
         *
         * @property path
         * @type String
         * @default ""
         */
        path: "",
        
        /**
         * Sets the XHR response type.
         *
         * @property responseType
         * @type String
         * @default "text"
         */
        responseType: "text",
        
        /**
         * Whether cookies should be retained on cross-domain calls.
         *
         * @property withCredentials
         * @type boolean
         * @default false
         */
        withCredentials: false
    },
    
    /**
     * This component provides component-based XHR communication with a server.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @param {*} definition 
     * @listens platypus.Entity#request
     * @fires platypus.Entity#response
     */
    initialize: function (definition) {
        this.setProperties(definition);
    },

    events: {// These are messages that this component listens for
        /**
         * On receiving this message, this component makes a request from the server using the provided information. Note that properties set here will reset the properties set by this component's JSON definition.
         *
         * @event platypus.Entity#request
         * @property {Object} message
         * @property {String} message.method XHR method to use: must be "GET" or "POST".
         * @property {String} message.path The path to the server resource.
         * @property {String} [message.responseType="text"] Response type expected.
         * @property {Object} [message.data] An object of string key/value pairs to be transmitted to the server.
         * @property {Function} message.onload A function that should be run on receiving a response from the server. This defaults to triggering a "response" message containing the responseText value.
         */
        "request": function (resp) {
            this.setProperties(resp);
            
            if (this.method === "GET") {
                this.get();
            } else if (this.method === "POST") {
                this.post();
            } else {
                throw "Method must be GET or POST";
            }
        }
    },
    
    methods: {// These are methods that are called on the component
        setProperties: function (properties) {
            var key     = '',
                divider = '',
                props   = properties || this;
            
            this.method       = props.method       || this.method       || "GET";
            this.path         = props.path         || this.path         || null;
            this.responseType = props.responseType || this.responseType || "text";
            this.withCredentials = props.withCredentials || this.withCredentials || false;
            
            if ((props !== this) && props.data) {
                this.data = '';
                for (key in props.data) {
                    if (props.data.hasOwnProperty(key)) {
                        this.data += divider + key + '=' + props.data[key];
                        divider = '&';
                    }
                }
            } else {
                this.data = '';
            }
            
            this.onload = props.onload || this.onload || function () {
                if (this.status === 200) {
                    /**
                     * This message is triggered on receiving a response from the server (if "onload" is not set by the original "request" message).
                     *
                     * @event platypus.Entity#response
                     * @param message {String} The message contains the responseText returned by the server.
                     */
                    this.owner.triggerEvent('response', this.responseText);
                }
            }.bind(this);
        },
        get: function () {
            var xhr  = new XMLHttpRequest(),
                path = this.path;
            
            if (this.data) {
                path += '?' + this.data;
            }
            
            xhr.open(this.method, path, true);
            xhr.withCredentials = this.withCredentials;
            xhr.responseType = this.responseType;
            xhr.onload = this.onload;
            xhr.send();
        },
        post: function () {
            var xhr = new XMLHttpRequest();
            
            xhr.open(this.method, this.path, true);
            xhr.withCredentials = this.withCredentials;
            xhr.responseType = this.responseType;
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onload = this.onload;
            xhr.send(this.data);
        }
    }
});
