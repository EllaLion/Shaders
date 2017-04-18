#version 400

in vec3 VertPosition; 
in vec3 Normal; 
in vec3 TangentEye;
in vec3 TangentLightDirection;
in vec2 TexCoord;

uniform sampler2D NormalMap;
uniform sampler2D DiffuseMap;
uniform vec3 intensity;

uniform float Shininess;
layout( location = 0 ) out vec4 FragColor; 

void main() 
{  

	vec3 ReturnColour;

	vec3 TextureNormal_tangentspace = 2.0 * texture2D( NormalMap, TexCoord ).rgb  - 1.0;
	TextureNormal_tangentspace = normalize(TextureNormal_tangentspace);

	vec3 diffuse =  intensity * texture2D( DiffuseMap, TexCoord ).rgb * max(0,dot(normalize(TextureNormal_tangentspace), normalize(-TangentLightDirection)));
	vec3 specular;
	

	
	//Specular
	vec3 VertexToEye = normalize(TangentEye - VertPosition);
	vec3 LightReflect = normalize(reflect(normalize(TangentLightDirection), TextureNormal_tangentspace));
	float SpecularFactor = dot(VertexToEye, LightReflect);
	SpecularFactor = pow(SpecularFactor, Shininess);

	if(SpecularFactor > 0)
	{
		specular = intensity * vec3(0.2,0.2,0.2) * SpecularFactor;

	}

	ReturnColour =  diffuse + specular;
	
 
	FragColor = vec4(ReturnColour, 1.0); 
}




