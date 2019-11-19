const
    path = require('path'),
    webpack = require('webpack');
    
module.exports = env => {
    const mode = env.dev ? 'development' : 'production';

    return {
        entry: './src/index.js',
        mode: mode,
        resolve: {
            alias: {
                config: path.join(__dirname, 'src', 'config', mode)
            }
        },
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: 'platypus.js',
            library: 'platypus'
        },
        plugins: [
            new webpack.ProvidePlugin({ // Needed to import pixi-spine correctly.
                PIXI: 'pixi.js'
            })
        ],
        externals: {
            "@tweenjs/tween.js": "@tweenjs/tween.js",
            "pixi-sound": "pixi-sound",
            "pixi-spine": "pixi-spine",
            "pixi.js": "pixi.js",
            "springroll": "springroll"
        }
    };
};