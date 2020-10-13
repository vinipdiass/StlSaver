//cycle.js, by douglascrockford; 2018-05-15 [Public Domain] see https://github.com/douglascrockford/JSON-js for usage
if (typeof JSON.decycle !== "function") {JSON.decycle = function decycle(object, replacer) {"use strict"; var objects = new WeakMap(); return (function derez(value, path) {var old_path; var nu; if (replacer !== undefined) {value = replacer(value)} if (typeof value === "object" && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {old_path = objects.get(value); if (old_path !== undefined) {return {$ref: old_path}} objects.set(value, path); if (Array.isArray(value)) {nu = []; value.forEach(function (element, i) {nu[i] = derez(element, path + "[" + i + "]")})} else {nu = {}; Object.keys(value).forEach(function (name) {nu[name] = derez(value[name], path + "[" + JSON.stringify(name) + "]")})} return nu} return value}(object, "$"))}} if (typeof JSON.retrocycle !== "function") {JSON.retrocycle = function retrocycle($) {"use strict"; var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/; (function rez(value) {if (value && typeof value === "object") {if (Array.isArray(value)) {value.forEach(function (element, i) {if (typeof element === "object" && element !== null) {var path = element.$ref; if (typeof path === "string" && px.test(path)) {value[i] = eval(path)} else {rez(element)} } })} else {Object.keys(value).forEach(function (name) {var item = value[name]; if (typeof item === "object" && item !== null) {var path = item.$ref; if (typeof path === "string" && px.test(path)) {value[name] = eval(path)} else {rez(item)} } })} } }($)); return $}}

import {ColladaExporter} from 'https://raw.githubusercontent.com/burndaflame/three.js/dev/examples/jsm/exporters/ColladaExporter.js';
import {GLTFExporter} from 'https://raw.githubusercontent.com/burndaflame/three.js/dev/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'https://raw.githubusercontent.com/burndaflame/three.js/dev/build/three.module.js';

function init() {
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

    var menu_style = {"margin-left": "20px", "width": "80px"};

    var character_area, stl_base, sjson, ljson, labeljson, sscene, gltf_base, collada_base;

    stl_base = jQuery("<a class='jss7 jss9 jss10' />").css(menu_style).text("Export STL");
    gltf_base = jQuery("<a class='jss7 jss9 jss10' />").css(menu_style).text("Export GLTF");
    collada_base = jQuery("<a class='jss7 jss9 jss10' />").css(menu_style).text("Export Collada");
    sscene = jQuery("<a class='jss7 jss9 jss10' />").css(menu_style).text("Export Scene as JSON");
    sjson = jQuery("<a class='jss7 jss9 jss10' />").css(menu_style).text("Export JSON");
    ljson = jQuery("<input/>").attr({"type": "file", "id": "ljson"}).css({"display": "none"}).text("Import (JSON)");
    labeljson = jQuery("<label class='jss7 jss9 jss10' />").attr({"for": "ljson"}).css(menu_style).text("Import (JSON)");

    character_area = jQuery(".headerMenu-container").first();
    character_area.css({"display": "flex", "justify-content": "center", "align-content": "center"});

    character_area.append(stl_base);
    character_area.append(gltf_base);
    character_area.append(collada_base);
    character_area.append(sscene);
    character_area.append(sjson);
    character_area.append(ljson);
    character_area.append(labeljson);

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

    sscene.click(function (e) {
      e.preventDefault();
      var char_json = JSON.stringify(JSON.decycle(CK.scene));
      var name = get_name() + "_scene";
      download(char_json, name + ".json", "text/plain");
    });

    sjson.click(function (e) {
      e.preventDefault();
      var char_json = JSON.stringify(JSON.decycle(CK.data));
      var name = get_name();
      download(char_json, name + ".json", "text/plain");
    });

    ljson.on('change', function (e) {
      e.preventDefault();
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = (function (theFile) {
        return function (e) {
          e.preventDefault();
          CK.change(JSON.retrocycle(JSON.parse(e.target.result)));
        };
      })(file);
      reader.readAsText(file);
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