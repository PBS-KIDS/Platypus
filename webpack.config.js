const path = require('path');

module.exports = env => {
    const mode = env.dev ? 'development' : 'production';

    return {
        entry: './src/index.js',
        mode: mode,
        resolve: {
            alias: {
                config: path.join(__dirname, 'src', 'config', mode),
                createjs: path.join(__dirname, 'node_modules/createjs/builds/1.0.0/createjs.js')
            }
        },
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: 'platypus.js',
            library: 'platypus'
        }/*, TODO: Should externalize PIXI and SpringRoll at some point.
        externals: {
            PIXI: {
                commonjs: 'PIXI',
                commonjs2: 'PIXI',
                amd: 'PIXI',
                root: 'PIXI'
            }
        }*/
    };
};