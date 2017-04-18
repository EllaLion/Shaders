
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

	//Create the plane
	Plane = new VBOMesh("Plane.obj", false, true, true);

	//Create the Bitmaps used to load in the image
	Bitmap DiffuseBit = Bitmap::bitmapFromFile("cobblesDiffuse.PNG");
	Bitmap SpecularBit = Bitmap::bitmapFromFile("cobblesSpecular.PNG");
	Bitmap HeightBit = Bitmap::bitmapFromFile("cobblesHeight.PNG");
	Bitmap NormalBit = Bitmap::bitmapFromFile("cobblesNormal.PNG");

	DiffuseBit.flipVertically();
	SpecularBit.flipVertically();
	HeightBit.flipVertically();
	NormalBit.flipVertically();

	//Create the textures
	DiffuseTex = new Texture(DiffuseBit);
	SpecularTex = new Texture(SpecularBit);
	HeightTex = new Texture(HeightBit);
	NormalTex = new Texture(NormalBit);

	// Load in all of the required textures.
	gl::ActiveTexture(gl::TEXTURE0);
	gl::BindTexture(gl::TEXTURE_2D, DiffuseTex->object());
	GLint loc = gl::GetUniformLocation(prog.getHandle(), "DiffuseTex");
	gl::Uniform1i(loc, 0);

	gl::ActiveTexture(gl::TEXTURE1);
	gl::BindTexture(gl::TEXTURE_2D, SpecularTex->object());
	loc = gl::GetUniformLocation(prog.getHandle(), "SpecularTex");
	gl::Uniform1i(loc, 1);

	gl::ActiveTexture(gl::TEXTURE2);
	gl::BindTexture(gl::TEXTURE_2D, HeightTex->object());
	loc = gl::GetUniformLocation(prog.getHandle(), "HeightTex");
	gl::Uniform1i(loc, 2);

	gl::ActiveTexture(gl::TEXTURE3);
	gl::BindTexture(gl::TEXTURE_2D, NormalTex->object());
	loc = gl::GetUniformLocation(prog.getHandle(), "NormalTex");
	gl::Uniform1i(loc, 3);

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

	prog.setUniform("light.position", vec3(10, 10, 10));
	prog.setUniform("light.diffuseIntensity", vec3(0.5, 0.5, 0.5));
	prog.setUniform("light.specularIntensity", vec3(1.0, 1.0, 1.0));
	prog.setUniform("light.ambientIntensity", vec3(0.5, 0.5, 0.5));
	prog.setUniform("light.lightDirection", vec3(-10, -10, -10));
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Render the scene
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::render(QuatCamera camera)
{
	gl::Clear(gl::COLOR_BUFFER_BIT | gl::DEPTH_BUFFER_BIT);

	// Render the plane
	model = mat4(1.0f);
	setMatrices(camera);
	Plane->render();
}


/////////////////////////////////////////////////////////////////////////////////////////////
//Send the MVP matrices to the GPU
/////////////////////////////////////////////////////////////////////////////////////////////
void SceneDiffuse::setMatrices(QuatCamera camera)
{

	mat4 mv = camera.view() * mat4(1.0);
	mat3 normalMatrix = mat3(vec3(mv[0]), vec3(mv[1]), vec3(mv[2]));
	prog.setUniform("ModelViewMatrix", mv);
	prog.setUniform("NormalMatrix", normalMatrix);
	prog.setUniform("MVP", camera.projection() * mv);
	prog.setUniform("ProjectionMatrix", camera.projection());
	prog.setUniform("CameraPos", glm::vec4(camera.position(), 1.0f) * mv);
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
