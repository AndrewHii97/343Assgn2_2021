// this is the main program 
// always the last program to load 



window.onload = function init() {
   canvas = document.getElementById("gl-canvas");

   gl = WebGLUtils.setupWebGL(canvas);
   if (!gl) {
      alert("WebGL isn't available");
   }

   gl.viewport(0, 0, canvas.width, canvas.height);
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   gl.enable(gl.DEPTH_TEST);

   //
   //  Load shaders and initialize attribute buffers
   //
   program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);


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
   gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

   var vNormal = gl.getAttribLocation(program, "vNormal");
   gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vNormal);

   var vBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

   var vPosition = gl.getAttribLocation(program, "vPosition");
   gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
   projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

   config_ui();

   render();
}

var render = function () {

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   if (flag) theta[axis] += speed; //speed of the object

   projectionMatrix = ortho(left, right, bottom, ytop, near, far);
   gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

   //create cube 
   modelView = mat4();
   modelView = mult(modelView, translate(-2.8, 0, 0));
   modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0]));
   modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0]));
   modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1]));


   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelView));

   gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

   //create sphere
   modelViewMatrix = mat4();
   modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0]));
   modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0]));
   modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1]));

   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

   for (var i = NumVertices + NumVertices_1; i < index + NumVertices + NumVertices_1; i += 3)
      gl.drawArrays(gl.TRIANGLES, i, 3);


   //create pyramid
   modelViewMatrix_1 = mat4();
   modelViewMatrix_1 = mult(modelViewMatrix_1, translate(2.8, 0, 0));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[xAxis], [1, 0, 0]));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[yAxis], [0, 1, 0]));
   modelViewMatrix_1 = mult(modelViewMatrix_1, rotate(theta[zAxis], [0, 0, 1]));


   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix_1));

   gl.drawArrays(gl.TRIANGLES, NumVertices, NumVertices_1);

   // pass in the lighting product each time render is called 
   gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
      flatten(ambientProduct));
   gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
      flatten(diffuseProduct));
   gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
      flatten(specularProduct));
   gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition));

   gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

   requestAnimFrame(render);
}

/**
 * Dependencies List 
 * - glob_var.js 
 * - evt_handler.js
 * - polygon.js 
 * - assigment_2.js
 * - Assignment_2.html 
 */