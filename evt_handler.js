function config_ui() {

   // Set event handler for change axis of rotation 
   document.getElementById("y_axis").onclick = function () {
      axis = yAxis;
   };
   document.getElementById("z_axis").onclick = function () {
      axis = zAxis;
   };
   document.getElementById("x_axis").onclick = function () {
      axis = xAxis;
   };
   document.getElementById("toggle").onclick = function () {
      flag = !flag;
   };

   // Set event handler to change the speed of rotation 
   document.getElementById("Speed_2").onchange = function () {
      speed = parseInt(document.getElementById("Speed_1").value);
   };

   // Set event handler to reset to default value 
   document.getElementById("Reset").onclick = function () {
      theta = [45.0, 0.0, 0.0];
      axis = xAxis;
      speed = 3.0;
      flag = true;
      document.getElementById("Speed_1").value = speed;
      document.getElementById("Speed_2").value = speed;
      document.getElementById("Ambient_Color").value = "#ffffff";
      document.getElementById("Ambient_Strength").value = 0.1;
      document.getElementById("Ambient_1").value = 0.1;
      document.getElementById("Diffuse_Color").value = "#00ff00";
      document.getElementById("Diffuse_Strength").value = 0.4;
      document.getElementById("Diffuse_1").value = 0.4;
      document.getElementById("Specular_Color").value = "#ffffff";
      document.getElementById("Specular_Strength").value = 1.0;
      document.getElementById("Specular_1").value = 1.0;
      document.getElementById("Shininess_value").value = 10.0;
      document.getElementById("Shininess_1").value = 10.0;
      document.getElementById("Light_Loc").value = 0.0;
      document.getElementById("Position_1").value = 0.0;

      textureImage = document.getElementById("Image_1");
      configureTexture( textureImage );

      var light_src_param = init_source_light();
      lightAmbient = light_src_param.lightAmbient;
      lightDiffuse = light_src_param.lightDiffuse;
      lightSpecular = light_src_param.lightSpecular
      lightPosition = light_src_param.lightPosition;

      var light_mat_param = init_material_coef();
      materialAmbient = light_mat_param.materialAmbient;
      materialDiffuse = light_mat_param.materialDiffuse;
      materialSpecular = light_mat_param.materialSpecular;
      materialShininess = light_mat_param.materialShininess;

      ambientProduct = mult(lightAmbient, materialAmbient);
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
      specularProduct = mult(lightSpecular, materialSpecular);

   };

   // on ambient color change recalculate ambient product 
   var ambient_color_obj = document.getElementById("Ambient_Color");
   ambient_color_obj.oninput = function () {
      var rgb_map = hexToRgb(this.value.toString());
      lightAmbient[COLOR.RED] = normalColor(parseInt(rgb_map.r));
      lightAmbient[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));
      lightAmbient[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
      ambientProduct = mult(lightAmbient, materialAmbient);
   };

   // an ambient strength change recalculate ambient product 
   var ambient_str_obj = document.getElementById("Ambient_Strength");
   ambient_str_obj.oninput = function () {
      document.getElementById("Ambient_1").value = this.value;
      materialAmbient[COLOR.RED] = parseFloat(this.value);
      materialAmbient[COLOR.GREEN] = parseFloat(this.value);
      materialAmbient[COLOR.BLUE] = parseFloat(this.value);
      ambientProduct = mult(lightAmbient, materialAmbient);
   };

   // an diffuse color change recalculate diffuse product 
   var diffuse_color_obj = document.getElementById("Diffuse_Color");
   diffuse_color_obj.oninput = function () {
      var rgb_map = hexToRgb(this.value.toString());
      lightDiffuse[COLOR.RED] = normalColor(parseInt(rgb_map.r));
      lightDiffuse[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));
      lightDiffuse[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
   };

   // an diffuse strength change recalculate diffuse product 
   var diffuse_str_obj = document.getElementById("Diffuse_Strength");
   diffuse_str_obj.oninput = function () {
      document.getElementById("Diffuse_1").value = this.value;
      materialDiffuse[COLOR.RED] = parseFloat(this.value);
      materialDiffuse[COLOR.GREEN] = parseFloat(this.value);
      materialDiffuse[COLOR.BLUE] = parseFloat(this.value);
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
   };

   var specular_color_obj = document.getElementById("Specular_Color");
   specular_color_obj.oninput = function () {
      var rgb_map = hexToRgb(this.value.toString());
      lightSpecular[COLOR.RED] = normalColor(parseInt(rgb_map.r));
      lightSpecular[COLOR.BLUE] = normalColor(parseInt(rgb_map.b));
      lightSpecular[COLOR.GREEN] = normalColor(parseInt(rgb_map.g));
      specularProduct = mult(lightSpecular, materialSpecular);
   };

   var specular_str_obj = document.getElementById("Specular_Strength");
   specular_str_obj.oninput = function () {
      document.getElementById("Specular_1").value = this.value;
      materialSpecular[COLOR.RED] = parseFloat(this.value);
      materialSpecular[COLOR.GREEN] = parseFloat(this.value);
      materialSpecular[COLOR.BLUE] = parseFloat(this.value);
      specularProduct = mult(lightSpecular, materialSpecular);
   }

   var shininess_obj = document.getElementById("Shininess_value");
   shininess_obj.oninput = function () {
      document.getElementById("Shininess_1").value = this.value;
      materialShininess = this.value;

   }

   var light_loc_obj = document.getElementById("Light_Loc");
   light_loc_obj.oninput = function () {
      document.getElementById("Position_1").value = this.value;
      lightPosition[0] = this.value;
   }

   window.onkeydown = function(e){
      var keyStroke = e.key;
      const keyPress = {
         Up:"ArrowUp",
         Down:"ArrowDown",
         Left:"ArrowLeft",
         Right:"ArrowRight"
      };
      switch(keyStroke){
         case keyPress.Up:
            eyeVector = add(eyeVector, vec3( 0.0,  0.1,  0.0));
            break;
         case keyPress.Down:
            eyeVector = subtract(eyeVector, vec3(  0.0,  0.1,  0.0));
            break;
         case keyPress.Left:
            eyeVector = subtract(eyeVector, vec3( 0.1,  0.0,  0.0));
            break;
         case keyPress.Right:
            eyeVector = add(eyeVector, vec3(  0.1,  0.0,  0.0));
            break;
      }
   }

   // ------------------------------ Image for texture mapping ----------------------------
	document.getElementById("Texture_1").onclick = function(){
		textureImage = document.getElementById("Image_1");
      configureTexture( textureImage );
   };
   
   document.getElementById("Texture_2").onclick = function(){
		textureImage = document.getElementById("Image_2");
      configureTexture( textureImage );
   };

   document.getElementById("Texture_3").onclick = function(){
		textureImage = document.getElementById("Image_3");
      configureTexture( textureImage );
   };
   
   document.getElementById("Texture_4").onclick = function(){
		textureImage = document.getElementById("Image_4");
      configureTexture( textureImage );
   };

   document.getElementById("Texture_5").onclick = function(){
		textureImage = document.getElementById("Image_5");
      configureTexture( textureImage );
   };
   
   document.getElementById("Texture_6").onclick = function(){
		textureImage = document.getElementById("Image_6");
      configureTexture( textureImage );
   };
   
   // ----------------------------------- end --------------------------------------------
}