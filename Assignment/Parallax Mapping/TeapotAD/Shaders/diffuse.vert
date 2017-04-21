#version 400

//Get vertex data
layout (location = 0) in vec3 VertexPosition; 
layout (location = 1) in vec3 VertexNormal; 
layout (location = 2) in vec2 VertexUV; 
layout (location = 3) in vec4 VertexTangent;
 
out vec3 VertPosition; 
out vec3 Normal;
out vec2 TexCoords; 
out vec3 EyePos;

uniform sampler2D DiffuseTex;
uniform sampler2D SpecularTex;
uniform sampler2D HeightTex;
uniform sampler2D NormalTex;

uniform mat4 ModelViewMatrix; 
uniform mat3 NormalMatrix; 
uniform mat4 ProjectionMatrix; 
uniform mat4 MVP; 
uniform vec3 CameraPos;

void main() 
{     
	TexCoords = VertexUV;

	//Calculate the camera space Normal, Tangent and the Vertex Position.
	vec4 EyeSpacePosition = ModelViewMatrix * vec4(VertexPosition, 1);
	vec3 EyeSpaceNormal = normalize(vec3(NormalMatrix * VertexNormal));
	vec3 EyeSpaceTangent = normalize(vec3(NormalMatrix * vec3(VertexTangent)));

	//Calculate the bitangent and create the TBN matrix.
	vec3 bitangent = normalize(cross(EyeSpaceNormal, EyeSpaceTangent)) * VertexTangent.w;
	mat3 TBN = mat3(EyeSpaceTangent, bitangent, EyeSpaceNormal);

	//Get the transpose.
	TBN = inverse(TBN);

	//Transform the camera into Tangent Space.
	EyePos =  TBN * CameraPos;

	//Calculate the direction from the eye to the Vertex Position in Tangent Space.
	EyePos = EyePos - (TBN* vec3(EyeSpacePosition));

	VertPosition = vec3( ModelViewMatrix * vec4(VertexPosition,1.0));     
	gl_Position = MVP * vec4(VertexPosition,1.0); 
}