// global_var.js 
// global variable, enumeration, initialization function & utility function 
// always the first script to load 

var canvas;
var gl;
var program;

// Color enum 
const COLOR = {
   RED: 0,
   GREEN: 1,
   BLUE: 2,
   ALPHA: 3
};

var NumVertices = 36; //cube
var NumVertices_1 = 12; //pyramid

var pointsArray = [];
var normalsArray = [];

var projectionMatrix;
var modelViewMatrixLoc;
var projectionMatrixLoc;

var modelView; // cube
var modelViewMatrix; //sphere
var modelViewMatrix_1; //pyramid

// light property 
var lightPosition = vec4();
var lightAmbient = vec4();
var lightDiffuse = vec4();
var lightSpecular = vec4();
var materialAmbient = vec4();
var materialDiffuse = vec4();
var materialSpecular = vec4();
var materialShininess
var ambientColor, diffuseColor, specularColor;

// transformation property 
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [45.0, 0.0, 0.0]; // to set the initial rotation of object
var speed = 3.0; // rotation speed
var flag = true;

//sphere attribute
var numTimesToSubdivide = 6;
var index = 0;


// camera position
var left = -4.0;
var right = 4.0;
var ytop = 3.0;
var bottom = -3.0;
var near = -20;
var far = 30;

var viewerPos;



var vertices = [
   vec4(-0.5, -0.5, 0.5, 1.0),
   vec4(-0.5, 0.5, 0.5, 1.0),
   vec4(0.5, 0.5, 0.5, 1.0),
   vec4(0.5, -0.5, 0.5, 1.0),
   vec4(-0.5, -0.5, -0.5, 1.0),
   vec4(-0.5, 0.5, -0.5, 1.0),
   vec4(0.5, 0.5, -0.5, 1.0),
   vec4(0.5, -0.5, -0.5, 1.0),

   //sphere
   vec4(0.0, 0.0, -1.0, 1),
   vec4(0.0, 0.942809, 0.333333, 1),
   vec4(-0.816497, -0.471405, 0.333333, 1),
   vec4(0.816497, -0.471405, 0.333333, 1),

   //pyramind
   vec4(0.0, -0.50, -1.00),
   vec4(0.0, 0.50, 0.00),
   vec4(1.0, -0.50, 0.50),
   vec4(-1.0, -0.50, 0.50)
];


// return array of light source 
// value comply to initial 
function init_source_light() {
   var rgb_map;
   var amb = vec4(0.0, 0.0, 0.0, 1.0);
   var diff = vec4(0.0, 0.0, 0.0, 1.0);
   var spec = vec4(0.0, 0.0, 0.0, 1.0);

   rgb_map = hexToRgb(document.getElementById("Ambient_Color").value.toString());
   amb[COLOR.RED] = normalColor(parseInt(rgb_map.r));
   amb[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
   amb[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));

   rgb_map = hexToRgb(document.getElementById("Diffuse_Color").value.toString());
   diff[COLOR.RED] = normalColor(parseInt(rgb_map.r));
   diff[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
   diff[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));

   rgb_map = hexToRgb(document.getElementById("Specular_Color").value.toString());
   spec[COLOR.RED] = normalColor(parseInt(rgb_map.r));
   spec[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
   spec[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));

   return {
      lightPosition: vec4(1.0, 1.0, 1.0, 0.0),
      lightAmbient: amb,
      lightDiffuse: diff,
      lightSpecular: spec
   };
}

function init_material_coef() {
   var amb_str = parseFloat(document.getElementById("Ambient_Strength").value);
   var diff_str = parseFloat(document.getElementById("Diffuse_Strength").value);
   var spec_str = parseFloat(document.getElementById("Specular_Strength").value);
   return {
      materialAmbient: vec4(amb_str, amb_str, amb_str, 1.0),
      materialDiffuse: vec4(diff_str, diff_str, diff_str, 1.0),
      materialSpecular: vec4(spec_str, spec_str, spec_str, 1.0),
      materialShininess: 200
   };

}

// convert hex value to rgb value 
function hexToRgb(hex) {
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
   } : null;
}

// convert the 0-255 rgb to 0.0-1.0 float number 
function normalColor(byte_value) {
   return Math.round(((byte_value / 255 * 1.0) + Number.EPSILON) * 100) / 100;
};