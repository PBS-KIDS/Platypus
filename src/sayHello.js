/* global console, document, platypus */
import {VERSION, utils} from 'pixi.js';
import {arrayCache} from './utils/array.js';
import {greenSplit} from './utils/string.js';

var getPortion = function (num, max) {
        var min = 204;
    
        return Math.floor(min * num / max);
    },
    getStyle = function (title, version) {
        var max = 0,
            min = 0,
            style = 'color: #ffffff; line-height: 1.5em; border-radius: 6px;',
            r = 0,
            g = 0,
            b = 0,
            v = null;
            
        if (version) {
            v = greenSplit(version, '.');
        }
        
        if (version && (v.length === 3)) {
            r = parseInt(v[0], 10);
            g = parseInt(v[1], 10);
            b = parseInt(v[2], 10);
        } else {
            r = title.charCodeAt(0) || 0;
            g = title.charCodeAt(1) || 0;
            b = title.charCodeAt(2) || 0;
            min = Math.min(r, g, b);
            r -= min;
            g -= min;
            b -= min;
        }
        
        if (v) {
            arrayCache.recycle(v);
        }
        
        max = Math.max(r, g, b, 1);

        return style + ' background-color: rgb(' + getPortion(r, max) + ',' + getPortion(g, max) + ',' + getPortion(b, max) + ');';
    },
    getVersions = function (text, title, arr) {
        var i = 0,
            str = '',
            versions = arrayCache.setUp(text);
        
        for (i = 0; i < arr.length; i++) {
            str = arr[i];
            versions.push(getStyle(str, str.substr(str.lastIndexOf(' ') - str.length + 1)), 'line-height: 1.5em;');
        }
        
        return versions;
    };

// Over-riding the pixi.js hello since we're creating our own.
utils.skipHello();

export default function (app) {
    var options = app.options,
        authorTag = document.getElementsByName('author'),
        docAuth = authorTag.length ? authorTag[0].getAttribute('content') || '' : '',
        author  = (docAuth ? 'by ' + docAuth : ''),
        title   = options.name || app.name || document.title || '',
        engine  = 'Platypus ' + platypus.version,
        version = options.version || '(?)',
        using   = arrayCache.setUp(),
        usingV  = arrayCache.setUp(),
        sr      = platypus.springroll, //TODO: Figure out how to detect SR.
        supports = platypus.supports;
    
    if (sr) {
        using.push('SpringRoll ' + sr.version);
    }
    
    using.push('Pixi.js ' + VERSION);
    
    if (version !== '(?)') {
        title += ' ' + version;
    }
    
    if (supports.firefox || supports.chrome) {
        console.log('%c ' + title + ' %c ' + author, getStyle(title, title.substr(title.lastIndexOf(' ') - title.length + 1)), 'line-height: 1.5em;');
        using.push(engine);
        usingV = getVersions('Using %c ' + using.join(' %c %c ') + ' %c ', title, using);
        console.log.apply(console, usingV);
        arrayCache.recycle(usingV);
    } else {
        console.log('--- "' + title + '" ' + author + ' - Using ' + using.join(', ') + ', and ' + engine + ' ---');
    }

    arrayCache.recycle(using);
};
