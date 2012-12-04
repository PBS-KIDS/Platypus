del ..\src\images\compressed\*.* /Q
cscript.exe js/compile-json.js
cscript.exe js/compile-assets.js
del config.json
