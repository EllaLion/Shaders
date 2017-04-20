#version 400

//Get vertex data
layout (location = 0) in vec3 VertexPosition; 
layout (location = 1) in vec3 VertexNormal; 
layout (location = 2) in vec2 VertexUV; 
layout (location = 3) in vec4 VertexTangent;

out VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} vs_out;

uniform sampler2D DiffuseTex;
uniform sampler2D SpecularTex;
uniform sampler2D HeightTex;
uniform sampler2D NormalTex;

uniform mat4 ModelViewMatrix; 
uniform mat3 NormalMatrix; 
uniform mat4 ProjectionMatrix;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
 

uniform mat4 MVP; 
uniform vec3 CameraPos;

uniform vec3 lightPos;
uniform vec3 viewPos;

void main() 
{
    gl_Position = projection * view * model * vec4(position, 1.0f);
    vs_out.FragPos = vec3(model * vec4(VertexPosition, 1.0));   
    vs_out.TexCoords = VertexUV;
    
	//Calculate the bitangent and create the TBN matrix.
	vec3 bitangent = normalize(cross(EyeSpaceNormal, EyeSpaceTangent)) * VertexTangent.w;
    
    vec3 T = normalize(mat3(model) * VertexTangent);
    vec3 B = normalize(mat3(model) * bitangent);
    vec3 N = normalize(mat3(model) * VertexNormal);
    mat3 TBN = transpose(mat3(T, B, N));

    vs_out.TangentLightPos = TBN * lightPos;
    vs_out.TangentViewPos  = TBN * viewPos;
    vs_out.TangentFragPos  = TBN * vs_out.FragPos;
}

