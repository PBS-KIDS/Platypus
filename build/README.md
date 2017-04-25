## Platypus uses [Grunt](http://gruntjs.com/) to manage the build process.

### Building
To export a release build for this library run:

    grunt build

This command will:

* Update the platypus.js file with the current date and version number from config
* Create the {PROJECT_NAME}-{VERSION}.min.js file and move it to ../lib
* Generate the documentation in the docs_out_path from config
* Create a zip file of the documentation and move it to ../docs

**NEXT version**

The same process as above, but uses "NEXT" as the version and doesn't generate documentation. This is used to generate minified builds with the latest source between release versions.

	grunt next

**Combined File**

The same as the NEXT process, but will not minify the source code. All code formatting and comments are left intact.

	grunt combine


### All commands

* grunt build -  Build everything based on the version in package.json
* grunt next - Build everything using the NEXT version.
* grunt combine - Build a NEXT version, but leave comments and formatting intact.
* grunt docs - Build only the docs
* grunt uglify - Build only the min files. (Will use NEXT as the version)
* npm test - Run tests to verify game engine functionality.

### Credit

The Platypus build tools originate from the [CreateJS](https://github.com/CreateJS) build tool model.