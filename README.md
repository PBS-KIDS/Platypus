Kindle HD and Kindle HDX Resize Fix
===================================

This branch is a fix to game.js so that the minimum font size on mobile devices does not cause DOM elements using em's to be locked at a larger size than originally intended.

The Problem
-----------
This issue happens when config.json includes a global "resizeFont" property set to `true`, which causes the game's font-size to scale depending on window size. On certain mobile devices like Kindle HD and Kindle HDX, sizes that go below 8px are locked at 8px, which causes all elements using em's to lock at 8px == 1em regardless of the size actually needed to maintain the desired interface element sizes. Internally, the game engine causes the font-size to be the width of the game divided by 100, so a game of width 1024px uses a font-size of 10px. When the game is scaled to 480px in width, the font-size becomes 5px. The problem arises when this font-size is clamped by the mobile browser to 8px.

The Solution
------------
To solve this issue, this branch causes the game engine to make the font-size the width of the game divided by 20. So if the game is scaled to a very small size, such as 240, its font-size becomes 12px rather than 2px (clamped to 8px).

The Integration
---------------
Using the latest version of the engine resolves this issue altogether, but for games based on an engine version in which this is not already incorporated, the following steps are required to implement the fix:
  1. Merge this branch into your game (or simply replace the game's engine/game.js with this branch's engine/game.js)
  2. For CSS styles of any DOM element within the #root `div` that use `em` as a unit of measurement, that `em` value must be replaced with its value divided by 5. This is due to, for example, the old version's `1em = 6px` the new one now is `1em = 30px`, so to have the element once again at 6px, it will now be `0.2em`.
  3. Likewise, for any JavaScript code changing a DOM element's properties using `em` as a unit of measurement, the values will need to be divided by 5.
