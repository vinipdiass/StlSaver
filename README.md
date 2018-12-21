Herosaver
=========

Save Configuration and STL of https://www.heroforge.com/

Usage
-----

  1. Go to https://www.heroforge.com/
  2. Open the Javascript Console [F12], then click on Console
  3. Paste the following
  
```
$("<script>").load("https://raw.githubusercontent.com/mrdoob/three.js/dev/build/three.min.js").appendTo($("body"))
$("<script>").load("https://raw.githubusercontent.com/christofsteel/herosaver/master/herosaver.min.js").appendTo($("body"))
```

## Exporting the mount

Exporting the mount is not **officially** supportet, but with a bit of work, you can export the mount.

  1. Go to https://www.heroforge.com/ and design a Character with mount.
  2. Open the Javascript Console [F12], then click on Console
  3. Paste the following
  
```
$("<script>").load("https://raw.githubusercontent.com/mrdoob/three.js/dev/build/three.min.js").appendTo($("body"))
```

  4. Open a new tab and go to https://raw.githubusercontent.com/christofsteel/herosaver/master/herosaver.js
  5. Copy the whole content
  6. Paste it in the javascript console in the HeroForge tab, but do NOT press ENTER
  7. Find the line
```
    var stlString = exporter.parse(CK.activeCharacter.threeObj.children[max_obj])
```
  8. Replace `max_obj` with `2`, so that it reads
```
    var stlString = exporter.parse(CK.activeCharacter.threeObj.children[2])
```    
  9. Now the stl export only exports the mount.

Limitations
-----------

  - Some details of the figures are implemented via shaders. These are not exported :(
  - The base of the character is not exported, only the character. This made printing more easy.
