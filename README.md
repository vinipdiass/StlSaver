Herosaver
=========

Save Configuration and STL of https://www.heroforge.com/

Update
------

Heroforge.com was recently changed. This broke loading the code and a lot of UI code. Exporting is still possible with a workaround (See below).

Usage
-----

  1. Go to https://www.heroforge.com/
  2. Open the Javascript Console [F12], then click on Console
  3. Paste the following
  
```
var script = document.createElement('script');script.src = "https://code.jquery.com/jquery-3.3.1.min.js";document.getElementsByTagName('body')[0].appendChild(script);
```
  
  4. Wait a few seconds, then paste
  
```
$("<script>").load("https://raw.githubusercontent.com/mrdoob/three.js/dev/build/three.min.js").appendTo($("body"))
$("<script>").load("https://raw.githubusercontent.com/christofsteel/herosaver/master/herosaver.min.js").appendTo($("body"))
```

  5. Exporting
  
  - To export the figure with the base
  
```
stl_base.click()
```

  - To export the figure without the base
  
```
stl.click()
```

  - To export the figure as JSON
  
```
sjson.click()
```

  - To import a previously exported JSON (This may require disabling a popup manager)

```
ljson.click()
```

Limitations
-----------

Some details of the figures are implemented via shaders. These are not exported :( This is also the reason, the exported figures look a bit _blocky_. If you want hight quality exports, consider purchasing the stl files from heroforge :)
