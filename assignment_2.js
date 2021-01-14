var canvas;
var gl;


// Color enum 
const COLOR = { 
   RED:0,
   GREEN:1,
   BLUE:2,
   ALPHA:3
};

var NumVertices  = 36; //cube
var NumVertices_1  = 12; //pyramid

var pointsArray = [];
var normalsArray = [];

var projectionMatrix;
var modelViewMatrixLoc;
var projectionMatrixLoc;

var modelView; // cube
var modelViewMatrix; //sphere
var modelViewMatrix_1; //pyramid



// return array of light source 
// value comply to initial 
function init_source_light(){
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

function init_material_coef(){
   var amb_str  = parseFloat(document.getElementById("Ambient_Strength").value);
   return {
      materialAmbient : vec4(amb_str, amb_str, amb_str, 1.0),
      materialDiffuse : vec4( 1.0, 0.8, 0.0, 1.0),
      materialSpecular : vec4( 1.0, 0.8, 0.0, 1.0 ),
      materialShininess : 200
   };

}

// light property 
var lightPosition = vec4();
var lightAmbient = vec4();
var lightDiffuse = vec4();
var lightSpecular = vec4();
var materialAmbient = vec4();
var materialDiffuse = vec4();
var materialSpecular = vec4();
var materialShininess 

var ctm;
var ambientColor, diffuseColor, specularColor;

var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[45.0, 0.0, 0.0]; // to set the initial rotation of object

var speed =3.0; // rotation speed
var flag = true;

//sphere attribute
var numTimesToSubdivide = 4;
var index = 0;


// camera position
var left = -4.0;
var right = 4.0;
var ytop = 3.0;
var bottom = -3.0;
var near = -20;
var far = 30;


var vertices = [
   vec4( -0.5, -0.5,  0.5, 1.0 ),
   vec4( -0.5,  0.5,  0.5, 1.0 ),
   vec4( 0.5,  0.5,  0.5, 1.0 ),
   vec4( 0.5, -0.5,  0.5, 1.0 ),
   vec4( -0.5, -0.5, -0.5, 1.0 ),
   vec4( -0.5,  0.5, -0.5, 1.0 ),
   vec4( 0.5,  0.5, -0.5, 1.0 ),
   vec4( 0.5, -0.5, -0.5, 1.0 ),

   //sphere
    vec4(0.0, 0.0, -1.0,1),
    vec4(0.0, 0.942809, 0.333333, 1),
    vec4(-0.816497, -0.471405, 0.333333, 1),
    vec4(0.816497, -0.471405, 0.333333,1),
    
    //pyramind
    vec4( 0.0, -0.50, -1.00),
    vec4( 0.0,  0.50,  0.00),
    vec4( 1.0, -0.50,  0.50),
    vec4(-1.0, -0.50,  0.50)
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    //light property set to html value 
   light_src_param = init_source_light();
   lightAmbient = light_src_param.lightAmbient;
   lightDiffuse = light_src_param.lightDiffuse;
   lightSpecular = light_src_param.lightSpecular
   lightPosition = light_src_param.lightPosition;
   light_mat_param = init_material_coef();
   materialAmbient = light_mat_param.materialAmbient;
   materialDiffuse = light_mat_param.materialDiffuse;
   materialSpecular = light_mat_param.materialSpecular;
   materialShininess = light_mat_param.materialShininess;

   ambientProduct = mult(lightAmbient, materialAmbient);
   diffuseProduct = mult(lightDiffuse, materialDiffuse);
   specularProduct = mult(lightSpecular, materialSpecular);
   
    //cube attribute
    colorCube();

    // pyramid attribute
    colorPyramid();

    //sphere attribute
    tetrahedron(vertices[8], vertices[9], vertices[10], vertices[11], numTimesToSubdivide);


    

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );


    config_ui();

    render();
}

var render = function(){
            
   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
           
   if(flag) theta[axis] += speed; //speed of the object

   projectionMatrix = ortho(left, right, bottom, ytop, near, far);
   gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

   //create cube 
   modelView = mat4();
   modelView = mult(modelView, translate(-2.8,0,0));
   modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
   modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
   modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
  

   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelView));

   gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
  
   //create sphere
   modelViewMatrix = mat4();
   modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0]));
   modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0]));
   modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1]));

   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );

   for( var i=NumVertices+NumVertices_1; i<index+NumVertices+NumVertices_1; i+=3) 
       gl.drawArrays( gl.TRIANGLES, i, 3 );


   //create pyramid
   modelViewMatrix_1 = mat4();
   modelViewMatrix_1 = mult(modelViewMatrix_1, translate(2.8,0,0));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[xAxis], [1, 0, 0]));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[yAxis], [0, 1, 0]));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[zAxis], [0, 0, 1]));
   
   
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix_1) );

   gl.drawArrays( gl.TRIANGLES, NumVertices, NumVertices_1);

   // pass in the lighting product each time render is called 
   gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
   flatten(ambientProduct));
   gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
   flatten(diffuseProduct) );
   gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
   flatten(specularProduct) );	
   gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
   flatten(lightPosition) );
   
gl.uniform1f(gl.getUniformLocation(program, 
   "shininess"),materialShininess);

   requestAnimFrame( render );       
}

function config_ui(){

      // Set event handler for change axis of rotation 
   document.getElementById("y_axis").onclick = function(){axis = yAxis;};
   document.getElementById("z_axis").onclick = function(){axis = zAxis;};
   document.getElementById("x_axis").onclick = function(){axis = xAxis;};
   document.getElementById("toggle").onclick = function(){flag = !flag;};
     
   // Set event handler to change the speed of rotation 
   document.getElementById("Speed_2").onchange = function(){
      speed = parseInt(document.getElementById("Speed_1").value);
   };
   
   // Set event handler to reset to default value 
   document.getElementById("Reset").onclick = function(){
      theta =[45.0, 0.0, 0.0];
      axis = xAxis;
      speed = 3.0;
      flag = true;
      document.getElementById("Speed_1").value = speed;
      document.getElementById("Speed_2").value = speed;
   };

   // on ambient color change recalculate ambient product 
   var ambient_color_obj = document.getElementById("Ambient_Color");
   ambient_color_obj.oninput = function(){
      var rgb_map  = hexToRgb(this.value.toString());
      lightAmbient[COLOR.RED] = normalColor(parseInt(rgb_map.r)); 
      lightAmbient[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));
      lightAmbient[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
      ambientProduct = mult(lightAmbient,materialAmbient);
   };

   // an ambient strength change recalculate ambient product 
   var ambient_str_obj = document.getElementById("Ambient_Strength");
   ambient_str_obj.oninput = function(){
      document.getElementById("Ambient_1").value = this.value; 
      materialAmbient[COLOR.RED] = parseFloat(this.value);
      materialAmbient[COLOR.GREEN] = parseFloat(this.value);
      materialAmbient[COLOR.BLUE] = parseFloat(this.value); 
      ambientProduct = mult(lightAmbient,materialAmbient);
   };

   // an diffuse color change recalculate diffuse product 
   var diffuse_color_obj = document.getElementById("Diffuse_Color");
   diffuse_color_obj.oninput = function(){
      var rgb_map  = hexToRgb(this.value.toString());
      lightDiffuse[COLOR.RED] = normalColor(parseInt(rgb_map.r));
      lightDiffuse[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));
      lightDiffuse[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
      diffuseProduct = mult(lightDiffuse,materialDiffuse);
   };

   // an diffuse strength change recalculate diffuse product 
   var diffuse_str_obj = document.getElementById("Diffuse_Strength");
   diffuse_str_obj.oninput = function(){
      document.getElementById("Diffuse_1").value = this.value;
      materialDiffuse[COLOR.RED] = parseFloat(this.value);
      materialDiffuse[COLOR.GREEN] = parseFloat(this.value);
      materialDiffuse[COLOR.BLUE] = parseFloat(this.value); 
      diffuseProduct = mult(lightDiffuse,materialDiffuse);
   }
   
}

function hexToRgb(hex) {
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
     r: parseInt(result[1], 16),
     g: parseInt(result[2], 16),
     b: parseInt(result[3], 16)
   } : null;
 }

 function normalColor(byte_value){
   return Math.round(((byte_value/ 255 * 1.0)+Number.EPSILON)* 100 )/100; 
 };

