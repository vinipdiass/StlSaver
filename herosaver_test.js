console.log("HeroSaver - Starting Loading");

function init() {
    (function () {

        // STL Exporter definition
        THREE.STLExporter = function () { };

        THREE.STLExporter.prototype = {

            constructor: THREE.STLExporter,

            parse: function (scene, options) {

                if (options === undefined) options = {};

                var binary = options.binary !== undefined ? options.binary : false;

                var objects = [];
                var triangles = 0;

                scene.traverse(function (object) {

                    if (object.isMesh) {

                        var geometry = object.geometry;

                        if (!geometry.isBufferGeometry) {
                            geometry = new THREE.BufferGeometry().fromGeometry(geometry);
                        }

                        var index = geometry.index;
                        var positionAttribute = geometry.getAttribute('position');

                        triangles += (index !== null) ? (index.count / 3) : (positionAttribute.count / 3);

                        objects.push({
                            object3d: object,
                            geometry: geometry
                        });

                    }

                });

                var output;
                var offset = 80; // skip header

                if (binary === true) {

                    var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
                    var arrayBuffer = new ArrayBuffer(bufferLength);
                    output = new DataView(arrayBuffer);
                    output.setUint32(offset, triangles, true); offset += 4;

                } else {

                    output = '';
                    output += 'solid exported\n';

                }

                var vA = new THREE.Vector3();
                var vB = new THREE.Vector3();
                var vC = new THREE.Vector3();
                var cb = new THREE.Vector3();
                var ab = new THREE.Vector3();
                var normal = new THREE.Vector3();

                for (var i = 0, il = objects.length; i < il; i++) {

                    var object = objects[i].object3d;
                    var geometry = objects[i].geometry;

                    var index = geometry.index;
                    var positionAttribute = geometry.getAttribute('position');

                    if (index !== null) {

                        for (var j = 0; j < index.count; j += 3) {

                            var a = index.getX(j + 0);
                            var b = index.getX(j + 1);
                            var c = index.getX(j + 2);

                            writeFace(a, b, c, positionAttribute, object);

                        }

                    } else {

                        for (var j = 0; j < positionAttribute.count; j += 3) {

                            var a = j + 0;
                            var b = j + 1;
                            var c = j + 2;

                            writeFace(a, b, c, positionAttribute, object);

                        }

                    }

                }

                if (binary === false) {

                    output += 'endsolid exported\n';

                }

                return output;

                function writeFace(a, b, c, positionAttribute, object) {

                    vA.fromBufferAttribute(positionAttribute, a);
                    vB.fromBufferAttribute(positionAttribute, b);
                    vC.fromBufferAttribute(positionAttribute, c);

                    if (object.isSkinnedMesh === true) {

                        object.boneTransform(a, vA);
                        object.boneTransform(b, vB);
                        object.boneTransform(c, vC);

                    }

                    vA.applyMatrix4(object.matrixWorld);
                    vB.applyMatrix4(object.matrixWorld);
                    vC.applyMatrix4(object.matrixWorld);

                    writeNormal(vA, vB, vC);

                    writeVertex(vA);
                    writeVertex(vB);
                    writeVertex(vC);

                    if (binary === true) {

                        output.setUint16(offset, 0, true); offset += 2;

                    } else {

                        output += '\t\tendloop\n';
                        output += '\tendfacet\n';

                    }

                }

                function writeNormal(vA, vB, vC) {

                    cb.subVectors(vC, vB);
                    ab.subVectors(vA, vB);
                    cb.cross(ab).normalize();

                    normal.copy(cb).normalize();

                    if (binary === true) {

                        output.setFloat32(offset, normal.x, true); offset += 4;
                        output.setFloat32(offset, normal.y, true); offset += 4;
                        output.setFloat32(offset, normal.z, true); offset += 4;

                    } else {

                        output += '\tfacet normal ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
                        output += '\t\touter loop\n';

                    }

                }

                function writeVertex(vertex) {

                    if (binary === true) {

                        output.setFloat32(offset, vertex.x, true); offset += 4;
                        output.setFloat32(offset, vertex.y, true); offset += 4;
                        output.setFloat32(offset, vertex.z, true); offset += 4;

                    } else {

                        output += '\t\t\tvertex ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

                    }

                }

            }

        };

        var menu_style = {
            "margin-left": "auto",
            "width": "100px",
            "background-color": "crimson",
            "cursor": "pointer",
            "pointer-events": "auto",
            "text-align": "center",
            "padding": "6px",
            "font-size": "large",
            "color": "white"
        };

        var character_area, stl_base;

        // Ensure that the character area is correctly selected
        character_area = jQuery(".dropdowns-0-2-37").first();
        if (character_area.length === 0) {
            console.error("Character area not found. Selector may need to be updated.");
            return;
        }

        character_area.css({
            "display": "flex",
            "justify-content": "center",
            "align-content": "center",
            "position": "relative",
            "z-index": "1000"
        });

        stl_base = jQuery("<a/>").css(menu_style).text("Export STL");
        character_area.prepend(stl_base);

        stl_base.click(function (e) {
            e.preventDefault();
            var exporter = new THREE.STLExporter();
            var stlString = exporter.parse(CK.character);
            var name = get_name();
            download(stlString, name + '.stl', 'application/sla');
        });

    })();
}

function inject_script(url, callback) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = url;
    script.onload = function () {
        callback();
    };
    head.appendChild(script);
}

console.log("HeroSaver - Injecting Libraries");

// Load scripts in the correct order
inject_script("https://code.jquery.com/jquery-3.6.0.min.js", function () {
    inject_script("https://raw.githubusercontent.com/vinipdiass/StlSaver/master/three.js", function ()
});

function get_name() {
    var timestamp = new Date().getUTCMilliseconds();
    var uqID = timestamp.toString(36);
    var name = "Character " + uqID;
    try {
        var getName = CK.character.data.meta.character_name;
        name = getName === "" ? name : getName;
    } catch (e) {
        console.error("Error retrieving character name:", e);
    }
    return name;
}

console.log("HeroSaver - Finished Loading");
