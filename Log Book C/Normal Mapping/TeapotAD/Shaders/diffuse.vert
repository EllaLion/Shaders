#version 400

layout (location = 0) in vec3 VertexPosition; 
layout (location = 1) in vec3 VertexNormal; 
layout (location = 3) in vec4 VertexTangent;
layout (location = 2) in vec2 VertexUV; 

out vec3 VertPosition; 
out vec3 Normal; 
out vec3 TangentEye;
out vec3 TangentLightDirection;

out vec2 TexCoord;

uniform sampler2D NormalMap;
uniform sampler2D DiffuseMap;

uniform vec4 LightPosition;
uniform vec3 LightDirection;
uniform vec3 eye;

uniform mat4 ModelViewMatrix; 
uniform mat3 NormalMatrix; 
uniform mat4 ProjectionMatrix; 
uniform mat4 MVP; 


void main() 
{     

    vec3 EyeSpaceNormal = normalize(vec3(NormalMatrix * VertexNormal));
	vec3 EyeSpaceTangent = normalize(vec3(NormalMatrix * vec3(VertexTangent)));

	TexCoord = VertexUV;
    vec3 bitangent = normalize(cross( EyeSpaceNormal, EyeSpaceTangent)) * VertexTangent.w;

	mat3 TBN = mat3(EyeSpaceTangent, bitangent, EyeSpaceNormal);
	
	TangentLightDirection = vec3( normalize(LightDirection) * TBN );
	TangentEye = vec3(normalize( eye) * TBN );

	Normal = EyeSpaceNormal;   
	VertPosition = vec3( ModelViewMatrix * vec4(VertexPosition,1.0));     

	gl_Position = MVP * vec4(VertexPosition,1.0); 
}


