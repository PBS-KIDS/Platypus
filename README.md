[![Platypus](http://platypus.gopherwoodstudios.com/assets/platypus-title.png)](https://github.com/PBS-KIDS/Platypus)
========

2D tile based game framework in HTML5

The Platypus Engine allows rapid development of 2D orthogonal tile based games for deployment in HTML5 compatible browsers. The engine uses a component based model, and includes many ready to use components to allow users to start adding assets and editing levels right away. The component based model lends itself to community members adding new functionality, we hope you'll share what you've done!

Platypus uses:

 * The [Tiled](http://www.mapeditor.org/) map editor for level creation.
 * [SpringRoll](http://springroll.io) for application management.
 * [Pixi.js](http://www.pixijs.com/) for rendering visuals.

## Key Features

* Deploy on any HTML5 platform supported by SpringRoll
* Multi-platform support
* Automatic scaling
* Touch and keyboard input
* Component-based development model
* [Documentation](https://github.com/PBS-KIDS/Platypus/wiki)

Platypus in action:
Wild Kratts [Monkey Mayhem](http://pbskids.org/wildkratts/games/monkey-mayhem/)

## Building
Platypus uses [Grunt](http://gruntjs.com/) to manage the build process. To export a release build for this library run:

    grunt build

This command will:

* Update the platypus.js file with the current date and version number from config
* Create the {PROJECT_NAME}-{VERSION}.min.js file and move it to ../lib
* Generate the documentation in the docs_out_path from config
* Create a zip file of the documentation and move it to ../docs

### NEXT version

The same process as above, but uses "NEXT" as the version and doesn't generate documentation. This is used to generate minified builds with the latest source between release versions.

	grunt next

### Combined File

The same as the NEXT process, but will not minify the source code. All code formatting and comments are left intact.

	grunt combine


### All commands

* grunt build -  Build everything based on the version in package.json
* grunt next - Build everything using the NEXT version.
* grunt combine - Build a NEXT version, but leave comments and formatting intact.
* grunt docs - Build only the docs
* grunt uglify - Build only the min files. (Will use NEXT as the version)
* npm test - Run tests to verify game engine functionality.

***
[Code](https://github.com/PBS-KIDS/Platypus/) - [Wiki](https://github.com/PBS-KIDS/Platypus/wiki/) - [Docs](http://gopherwood.github.io/Platypus/)

Platypus was developed by PBS KIDS and [Gopherwood Studios](http://gopherwoodstudios.com/). It is free to use (see licenses.txt), all assets in the example games are © Gopherwood Studios and/or © PBS KIDS.
