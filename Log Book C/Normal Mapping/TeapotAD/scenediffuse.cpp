
#include "scenediffuse.h"

#include <cstdio>
#include <cstdlib>
#include <iostream>
using std::cerr;
using std::endl;

#include "defines.h"

using glm::vec3;


#include <gtc/matrix_transform.hpp>
#include <gtx/transform2.hpp>


namespace imat3111
{
/////////////////////////////////////////////////////////////////////////////////////////////
// Default constructor
/////////////////////////////////////////////////////////////////////////////////////////////
SceneDiffuse::SceneDiffuse()
{
}

/////////////////////////////////////////////////////////////////////////////////////////////
//Initialise the scene
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::initScene(QuatCamera camera)
{
	//|Compile and link the shader  
	compileAndLinkShader();

	gl::Enable(gl::DEPTH_TEST);

	//Set up the lighting
	setLightParams(camera);

	Bitmap diffuse = Bitmap::bitmapFromFile("ogre_diffuse.PNG");
	Bitmap normal = Bitmap::bitmapFromFile("ogre_normalmap.PNG");

	diffuse.flipVertically();
	normal.flipVertically();

	//Load in Ogre.
	ogre = new VBOMesh("bs_ears.obj", false, true, true);

	gTextureDiffuse = new Texture(diffuse);
	gTextureNormal = new Texture(normal);


	gl::ActiveTexture(gl::TEXTURE0 + 0);
	gl::BindTexture(gl::TEXTURE_2D, gTextureNormal->object());
	GLint loc = gl::GetUniformLocation(prog.getHandle(), "NormalMap");
	gl::Uniform1i(loc, 0);

	gl::ActiveTexture(gl::TEXTURE0 + 1);
	gl::BindTexture(gl::TEXTURE_2D, gTextureDiffuse->object());
	loc = gl::GetUniformLocation(prog.getHandle(), "DiffuseMap");
	gl::Uniform1i(loc, 1);


}

/////////////////////////////////////////////////////////////////////////////////////////////
//Update not used at present
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::update( float t )
{

}

/////////////////////////////////////////////////////////////////////////////////////////////
// Set up the lighting variables in the shader
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::setLightParams(QuatCamera camera)
{

	prog.setUniform("intensity", vec3(0.8f, 0.8f, 0.8f));
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Render the scene
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::render(QuatCamera camera)
{
	gl::Clear(gl::COLOR_BUFFER_BIT | gl::DEPTH_BUFFER_BIT);

	//Now set up the teapot 
	model = mat4(1.0f);
	setMatrices(camera);

	prog.setUniform("Shininess", 10.0f);
	ogre->render();
}


/////////////////////////////////////////////////////////////////////////////////////////////
//Send the MVP matrices to the GPU
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::setMatrices(QuatCamera camera)
{

	mat4 mv = camera.view() * mat4(1.0);
	mat3 normalMatrix = mat3(vec3(mv[0]), vec3(mv[1]), vec3(mv[2]));
	vec4 lightPos = vec4(0.0f, 20.0f, 20.0f, 1.0f);
	vec4 Target = vec4(0.0f, 0.0f, 0.0f, 1.0f);



	prog.setUniform("LightDirection", mat3(vec3(mv[0]), vec3(mv[1]), vec3(mv[2])) * vec3(Target - lightPos));
	prog.setUniform("LightPosition", mv * lightPos);;
	prog.setUniform("ModelViewMatrix", mv);
	prog.setUniform("NormalMatrix", normalMatrix);
	prog.setUniform("MVP", camera.projection() * mv);
	prog.setUniform("ProjectionMatrix", camera.projection());
	prog.setUniform("eye", camera.position());
}

/////////////////////////////////////////////////////////////////////////////////////////////
// resize the viewport
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::resize(QuatCamera camera,int w, int h)
{
    gl::Viewport(0,0,w,h);
    width = w;
    height = h;
	camera.setAspectRatio((float)w/h);

}

/////////////////////////////////////////////////////////////////////////////////////////////
// Compile and link the shader
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::compileAndLinkShader()
{
   
	try {
    	prog.compileShader("Shaders/diffuse.vert");
    	prog.compileShader("Shaders/diffuse.frag");
    	prog.link();
    	prog.validate();
    	prog.use();
    } catch(GLSLProgramException & e) {
 		cerr << e.what() << endl;
 		exit( EXIT_FAILURE );
    }
}

}
