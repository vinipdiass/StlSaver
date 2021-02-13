//cycle.js, by douglascrockford; 2018-05-15 [Public Domain] see https://github.com/douglascrockford/JSON-js for usage
if (typeof JSON.decycle !== "function") {JSON.decycle = function decycle(object, replacer) {"use strict"; var objects = new WeakMap(); return (function derez(value, path) {var old_path; var nu; if (replacer !== undefined) {value = replacer(value)} if (typeof value === "object" && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {old_path = objects.get(value); if (old_path !== undefined) {return {$ref: old_path}} objects.set(value, path); if (Array.isArray(value)) {nu = []; value.forEach(function (element, i) {nu[i] = derez(element, path + "[" + i + "]")})} else {nu = {}; Object.keys(value).forEach(function (name) {nu[name] = derez(value[name], path + "[" + JSON.stringify(name) + "]")})} return nu} return value}(object, "$"))}} if (typeof JSON.retrocycle !== "function") {JSON.retrocycle = function retrocycle($) {"use strict"; var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/; (function rez(value) {if (value && typeof value === "object") {if (Array.isArray(value)) {value.forEach(function (element, i) {if (typeof element === "object" && element !== null) {var path = element.$ref; if (typeof path === "string" && px.test(path)) {value[i] = eval(path)} else {rez(element)} } })} else {Object.keys(value).forEach(function (name) {var item = value[name]; if (typeof item === "object" && item !== null) {var path = item.$ref; if (typeof path === "string" && px.test(path)) {value[name] = eval(path)} else {rez(item)} } })} } }($)); return $}}

import {OBJExporter} from 'https://cdn.jsdelivr.net/gh/carlalldis/StlSaver@latest/OBJexporter5.js';
import {ColladaExporter} from 'https://cdn.jsdelivr.net/gh/burndaflame/three.js@dev/examples/jsm/exporters/ColladaExporter.js';
import {GLTFExporter} from 'https://cdn.jsdelivr.net/gh/burndaflame/three.js@dev/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'https://cdn.jsdelivr.net/gh/burndaflame/three.js@dev/build/three.module.js';

console.log("HeroSaver - Starting Loading");

function init() {

	//download.js v4.2, by dandavis; 2008-2017. [MIT] see http://danml.com/download.html for tests/usage
	function download(data, strFileName, strMimeType) {

		var self = window, // this script is only for browsers anyway...
			defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
			mimeType = strMimeType || defaultMime,
			payload = data,
			url = !strFileName && !strMimeType && payload,
			anchor = document.createElement("a"),
			toString = function(a){return String(a);},
			myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
			fileName = strFileName || "download",
			blob,
			reader;
			myBlob= myBlob.call ? myBlob.bind(self) : Blob ;
	  
		if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
			payload=[payload, mimeType];
			mimeType=payload[0];
			payload=payload[1];
		}


		if(url && url.length< 2048){ // if no filename and no mime, assume a url was passed as the only argument
			fileName = url.split("/").pop().split("?")[0];
			anchor.href = url; // assign href prop to temp anchor
		  	if(anchor.href.indexOf(url) !== -1){ // if the browser determines that it's a potentially valid url path:
        		var ajax=new XMLHttpRequest();
        		ajax.open( "GET", url, true);
        		ajax.responseType = 'blob';
        		ajax.onload= function(e){ 
				  download(e.target.response, fileName, defaultMime);
				};
        		setTimeout(function(){ ajax.send();}, 0); // allows setting custom ajax headers using the return:
			    return ajax;
			} // end if valid url?
		} // end if url?


		//go ahead and download dataURLs right away
		if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)){
		
			if(payload.length > (1024*1024*1.999) && myBlob !== toString ){
				payload=dataUrlToBlob(payload);
				mimeType=payload.type || defaultMime;
			}else{			
				return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
					navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
					saver(payload) ; // everyone else can save dataURLs un-processed
			}
			
		}//end if dataURL passed?

		blob = payload instanceof myBlob ?
			payload :
			new myBlob([payload], {type: mimeType}) ;


		function dataUrlToBlob(strUrl) {
			var parts= strUrl.split(/[:;,]/),
			type= parts[1],
			decoder= parts[2] == "base64" ? atob : decodeURIComponent,
			binData= decoder( parts.pop() ),
			mx= binData.length,
			i= 0,
			uiArr= new Uint8Array(mx);

			for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);

			return new myBlob([uiArr], {type: type});
		 }

		function saver(url, winMode){

			if ('download' in anchor) { //html5 A[download]
				anchor.href = url;
				anchor.setAttribute("download", fileName);
				anchor.className = "download-js-link";
				anchor.innerHTML = "downloading...";
				anchor.style.display = "none";
				document.body.appendChild(anchor);
				setTimeout(function() {
					anchor.click();
					document.body.removeChild(anchor);
					if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(anchor.href);}, 250 );}
				}, 66);
				return true;
			}

			// handle non-a[download] safari as best we can:
			if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
				url=url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
				if(!window.open(url)){ // popup blocked, offer direct download:
					if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
				}
				return true;
			}

			//do iframe dataURL download (old ch+FF):
			var f = document.createElement("iframe");
			document.body.appendChild(f);

			if(!winMode){ // force a mime that will download:
				url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
			}
			f.src=url;
			setTimeout(function(){ document.body.removeChild(f); }, 333);

		}//end saver




		if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
			return navigator.msSaveBlob(blob, fileName);
		}

		if(self.URL){ // simple fast and modern way using Blob and URL:
			saver(self.URL.createObjectURL(blob), true);
		}else{
			// handle non-Blob()+non-URL browsers:
			if(typeof blob === "string" || blob.constructor===toString ){
				try{
					return saver( "data:" +  mimeType   + ";base64,"  +  self.btoa(blob)  );
				}catch(y){
					return saver( "data:" +  mimeType   + "," + encodeURIComponent(blob)  );
				}
			}

			// Blob but not URL support:
			reader=new FileReader();
			reader.onload=function(e){
				saver(this.result);
			};
			reader.readAsDataURL(blob);
		}
		return true;
	}; /* end download() */
	
  (function () {

    RK.STLExporter = function () {};

    RK.STLExporter.prototype = {

      constructor: THREE.STLExporter,

      parse: (function () {

        var vector = new THREE.Vector3();
        var normalMatrixWorld = new THREE.Matrix3();

        return function (scenes) {
          console.log(scenes);
          var output = '';
          output += 'solid exported\n';
          for (var scene_nr in scenes) {
            scenes[scene_nr].traverse(function (object) {
              if (object instanceof RK.Mesh) {
                // if object is hidden - exit
                if (object.visible == false) return;
                var geometry = object.geometry;
                var matrixWorld = object.matrixWorld;
                var skeleton = object.skeleton;
                var mesh = object;
                console.log('Found Mesh' + mesh.name);
                if (typeof onlyExportThisMesh !== 'undefined' && mesh.name != onlyExportThisMesh) {
                  console.log('Looking for :' + onlyExportThisMesh + ' therefore ignoring ' + mesh.name);
                  return;
                }
                console.log('exporting: ' + mesh.name);
                if (geometry instanceof RK.BufferGeometry) {
                  var oldgeometry = geometry.clone();
                  geometry = new RK.Geometry().fromBufferGeometry(geometry);
                  var skinIndex0 = oldgeometry.getAttribute('skinIndex0');
                  var skinWeight0 = oldgeometry.getAttribute('skinWeight0');
                  var morphTarget = oldgeometry.getAttribute('morphTarget0');
                  var mtcount = 0;

                  // TODO: find out what skinIndex1 and skinWeight1 are supposed to acomplish
                  // var skinIndex1 = oldgeometry.getAttribute('skinIndex0');
                  // var skinWeight1 = oldgeometry.getAttribute('skinWeight0');

                  while (typeof morphTarget !== 'undefined') {
                    mtcount++;
                    morphTarget = oldgeometry.getAttribute('morphTarget' + mtcount);
                  }
                  if (typeof skinIndex0 !== 'undefined') {
                    geometry.skinIndices = [];
                    geometry.skinWeights = [];
                    geometry.morphTargets = [];
                    for (var j = 0; j < mtcount; j++) {
                      geometry.morphTargets[j] = {};
                      geometry.morphTargets[j].vertices = [];
                    }
                    for (var i = 0; i < geometry.vertices.length; i++) {
                      geometry.skinIndices.push((new THREE.Vector4()).fromBufferAttribute(skinIndex0, i));
                      geometry.skinWeights.push((new THREE.Vector4()).fromBufferAttribute(skinWeight0, i));
                      // if( typeof skinIndex1 !== 'undefined') {
                      //   geometry.skinIndices.push((new THREE.Vector4()).fromBufferAttribute(skinIndex1, i));
                      //   geometry.skinWeights.push((new THREE.Vector4()).fromBufferAttribute(skinWeight1, i));
                      // }
                      for (var j = 0; j < mtcount; j++) {
                        geometry.morphTargets[j].vertices.push((new THREE.Vector3()).fromBufferAttribute(oldgeometry.getAttribute('morphTarget' + j)));
                      }
                    }
                  }
                }

                if (geometry instanceof RK.Geometry) {

                  var vertices = geometry.vertices;
                  var faces = geometry.faces;
                  normalMatrixWorld.getNormalMatrix(matrixWorld);

                  if (typeof faces != 'undefined') {
                    for (var i = 0, l = faces.length; i < l; i++) {
                      var face = faces[i];

                      vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

                      output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                      output += '\t\touter loop\n';

                      var indices = [face.a, face.b, face.c];

                      for (var j = 0; j < 3; j++) {
                        var vertexIndex = indices[j];
                        if (typeof geometry.skinIndices !== 'undefined' && geometry.skinIndices.length == 0) {
                          vector.copy(vertices[vertexIndex]).applyMatrix4(matrixWorld);
                          output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                        } else {
                          vector.copy(vertices[vertexIndex]); //.applyMatrix4( matrixWorld );

                          // see https://github.com/mrdoob/three.js/issues/3187
                          var boneIndices = [
                            geometry.skinIndices[vertexIndex].x,
                            geometry.skinIndices[vertexIndex].y,
                            geometry.skinIndices[vertexIndex].z,
                            geometry.skinIndices[vertexIndex].w
                          ];

                          var weights = [
                            geometry.skinWeights[vertexIndex].x,
                            geometry.skinWeights[vertexIndex].y,
                            geometry.skinWeights[vertexIndex].z,
                            geometry.skinWeights[vertexIndex].w
                          ];

                          var inverses = [
                            skeleton.boneInverses[boneIndices[0]],
                            skeleton.boneInverses[boneIndices[1]],
                            skeleton.boneInverses[boneIndices[2]],
                            skeleton.boneInverses[boneIndices[3]]
                          ];

                          var skinMatrices = [
                            skeleton.bones[boneIndices[0]].matrixWorld,
                            skeleton.bones[boneIndices[1]].matrixWorld,
                            skeleton.bones[boneIndices[2]].matrixWorld,
                            skeleton.bones[boneIndices[3]].matrixWorld
                          ];

                          //this checks to see if the mesh has any morphTargets - jc
                          if (geometry.morphTargets !== 'undefined') {
                            var morphMatricesX = [];
                            var morphMatricesY = [];
                            var morphMatricesZ = [];
                            var morphMatricesInfluence = [];

                            for (var mt = 0; mt < geometry.morphTargets.length; mt++) {
                              //collect the needed vertex info - jc
                              morphMatricesX[mt] = geometry.morphTargets[mt].vertices[vertexIndex].x;
                              morphMatricesY[mt] = geometry.morphTargets[mt].vertices[vertexIndex].y;
                              morphMatricesZ[mt] = geometry.morphTargets[mt].vertices[vertexIndex].z;
                              morphMatricesInfluence[mt] = mesh.morphTargetInfluences[mt];
                            }
                          }

                          var finalVector = new THREE.Vector4();

                          if (mesh.geometry.morphTargets !== 'undefined') {

                            var morphVector = new THREE.Vector4(vector.x, vector.y, vector.z);

                            for (var mt = 0; mt < geometry.morphTargets.length; mt++) {
                              //not pretty, but it gets the job done - jc
                              morphVector.lerp(new THREE.Vector4(morphMatricesX[mt], morphMatricesY[mt], morphMatricesZ[mt], 1), morphMatricesInfluence[mt]);
                            }

                          }

                          for (var k = 0; k < 4; k++) {

                            var tempVector = new THREE.Vector4(vector.x, vector.y, vector.z);
                            tempVector.multiplyScalar(weights[k]);
                            //the inverse takes the vector into local bone space
                            tempVector.applyMatrix4(inverses[k])
                              //which is then transformed to the appropriate world space
                              .applyMatrix4(skinMatrices[k]);
                            finalVector.add(tempVector);

                          }

                          output += '\t\t\tvertex ' + finalVector.x + ' ' + finalVector.y + ' ' + finalVector.z + '\n';
                        }
                      }
                      output += '\t\tendloop\n';
                      output += '\tendfacet\n';
                    }
                  }
                }
              }
            });
          }
          output += 'endsolid exported\n';

          return output;
        };
      }())
    };

    if (typeof module !== "undefined" && module.exports) {
      module.exports = RK.STLExporter
    }
    else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
      define([], function () {
        return saveAs;
      });
    }

    var menu_style = { "width": "150px", "background-color": "crimson", "cursor": "pointer", "pointer-events": "auto", "text-align": "center", "padding": "6px", "font-size": "large" };

    var character_area, stl_base, gltf_base, collada_base, obj_base;

    stl_base = jQuery("<a/>").css(menu_style).text("Export STL");
    gltf_base = jQuery("<a/>").css(menu_style).text("Export GLTF");
    collada_base = jQuery("<a/>").css(menu_style).text("Export Collada");
    obj_base = jQuery("<a/>").css(menu_style).text("Export OBJ");

    character_area = jQuery(".dropdowns-0-1-31").first();
    //character_area.css({"display": "flex", "justify-content": "center", "align-content": "center"});

    character_area.prepend(stl_base);
    character_area.prepend(gltf_base);
    character_area.prepend(collada_base);
    character_area.prepend(obj_base);

    stl_base.click(function (e) {
      e.preventDefault();
      var exporter = new RK.STLExporter();
      var stlString = exporter.parse([CK.character])
      var name = get_name();
      download(stlString, name + '.stl', 'application/sla');
    });

    gltf_base.click(function (e) {
      e.preventDefault();
      // Instantiate a exporter
      var exporter = new GLTFExporter();

      // Parse the input and generate the glTF output
      exporter.parse(CK.scene, function (gltf) {
        console.log(gltf);
        var name = get_name();
        download(JSON.stringify(gltf), name + '.gltf', "text/plain");
      }/*, options*/);
    });

    collada_base.click(function (e) {
      e.preventDefault();
      // Instantiate a exporter
      var exporter = new ColladaExporter();

      // Parse the input and generate the glTF output
      exporter.parse(CK.scene, function (data) {
        console.log(data);
        var name = get_name();
        download(JSON.stringify(data), name + '.collada', "text/plain");
      }/*, options*/);
    });
	
    obj_base.click(function (e) {
      e.preventDefault();
      var exporter = new OBJExporter();
      var objString = exporter.parse(CK.character)
      var name = get_name();
      download(objString, name + '.obj', 'application/sla');
    });

  })()
};

function inject_script(url, callback) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.src = url;
  script.onload = function (e) {
    callback()
  };
  head.appendChild(script);
}

inject_script("//code.jquery.com/jquery-3.3.1.min.js", function () {init()});

function get_name() {
  var timestamp = new Date().getUTCMilliseconds();
  var uqID = timestamp.toString(36);
  var name = "Character " + uqID;
  try {
    var getName = CK.character.data.meta.character_name
    name = getName === "" ? name : getName;
  } catch (e) {
    if (e instanceof ReferenceError) {
      console.log("Name of character data location has changed");
      console.log(e);
    } else {
      console.log("Other Error");
      console.log(e);
    }
  }
  return name;
}