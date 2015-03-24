#! /usr/bin/env bash
rm ../game/images/compressed/*.*
java -jar rhino/js.jar -f js/compile-game.js