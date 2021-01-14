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


var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 200.0;

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
   ambient_color_obj.onchange = function (){
      var rgb_map  = hexToRgb(this.value.toString());
      lightAmbient[COLOR.RED] = normalColor(parseInt(rgb_map.r)); 
      lightAmbient[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));
      lightAmbient[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
      ambientProduct = mult(lightAmbient,materialAmbient);
      console.log(ambientProduct);
   };

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

