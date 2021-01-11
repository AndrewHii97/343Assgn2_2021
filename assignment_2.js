var canvas;
var gl;

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
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

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
function colorPyramid()
{
    quad1( 12, 13, 14 ); 
    quad1( 12, 14, 15 ); 
    quad1( 14, 12, 15 ); 
    quad1( 15, 13, 12 );
}

function quad1(a, b, c) 
{

    var indices = [a, b, c];
    for ( var i = 0; i < indices.length; ++i ) {
        normalsArray.push( vertices[indices[i]] );
        pointsArray.push( vertices[indices[i]] );
    }
}

function triangle(a, b, c) {

   normalsArray.push(a);
   normalsArray.push(b);
   normalsArray.push(c);
   
   pointsArray.push(a);
   pointsArray.push(b);      
   pointsArray.push(c);

   index += 3;
}

function divideTriangle(a, b, c, count) {
   if ( count > 0 ) {
               
       var ab = mix( a, b, 0.5);
       var ac = mix( a, c, 0.5);
       var bc = mix( b, c, 0.5);
               
       ab = normalize(ab, true);
       ac = normalize(ac, true);
       bc = normalize(bc, true);
                               
       divideTriangle( a, ab, ac, count - 1 );
       divideTriangle( ab, b, bc, count - 1 );
       divideTriangle( bc, c, ac, count - 1 );
       divideTriangle( ab, bc, ac, count - 1 );
   }
   else { 
       triangle( a, b, c );
   }
}

function tetrahedron(a, b, c, d, n) {
   divideTriangle(a, b, c, n);
   divideTriangle(d, c, b, n);
   divideTriangle(a, d, b, n);
   divideTriangle(a, c, d, n);
}

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
     normal = normalize(normal);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


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
   
    //cube attrivute
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

    //Function to change rotation
    document.getElementById("x_axis").onclick = function(){axis = xAxis;};
    document.getElementById("y_axis").onclick = function(){axis = yAxis;};
    document.getElementById("z_axis").onclick = function(){axis = zAxis;};
    document.getElementById("toggle").onclick = function(){flag = !flag;};
    
    //Function to get object speed
    document.getElementById("Speed_2").onchange = function(){
        speed = parseInt(document.getElementById("Speed_1").value);
    };

    //Function to reset settings
    document.getElementById("Reset").onclick = function(){
      theta =[45.0, 0.0, 0.0];
      axis = xAxis;
      speed = 3.0;
      flag = true;
      document.getElementById("Speed_1").value = speed;
      document.getElementById("Speed_2").value = speed;
      
      

    };

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
    
    render();
}

var render = function(){
            
   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
           
   if(flag) theta[axis] += speed; //speed of the object

   projectionMatrix = ortho(left, right, bottom, ytop, near, far);
   gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

   //create cube 
   modelView = mat4();
   modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
   modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
   modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
   modelView = mult(modelView, translate(-2.8,0,0));

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
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[xAxis], [1, 0, 0]));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[yAxis], [0, 1, 0]));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[zAxis], [0, 0, 1]));
   modelViewMatrix_1 = mult(modelViewMatrix_1, translate(2.8,0,0));
   
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix_1) );

   gl.drawArrays( gl.TRIANGLES, NumVertices, NumVertices_1);

   requestAnimFrame( render );       
}
