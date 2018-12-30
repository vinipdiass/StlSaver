Herosaver
=========

Save Configuration and STL of https://www.heroforge.com/

Update
------

Now also exports the base and the mount (and if you hide the rider, only the mount) :)

Usage
-----

  1. Go to https://www.heroforge.com/
  2. Open the Javascript Console [F12], then click on Console
  3. Paste the following
  
```
$("<script>").load("https://raw.githubusercontent.com/mrdoob/three.js/dev/build/three.min.js").appendTo($("body"))
$("<script>").load("https://raw.githubusercontent.com/christofsteel/herosaver/master/herosaver.min.js").appendTo($("body"))
```

Limitations
-----------

Some details of the figures are implemented via shaders. These are not exported :( This is also the reason, the exported figures look a bit _blocky_. If you want hight quality exports, consider purchasing the stl files from heroforge :)
