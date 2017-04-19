#version 430

in vec3 VertPosition; 
in vec3 Normal;

uniform vec3 eye;
uniform vec4 LightPosition; 
uniform vec3 intensity;   
uniform vec3 ambientintensity;  
uniform vec3 direction;   
uniform float exponent; 
uniform float cutoffO;  
uniform float LightAttentuation;

uniform vec3 Kd;
uniform vec3 Ka;
uniform vec3 Ks;
uniform float Shininess;
layout( location = 0 ) out vec4 FragColor; 

vec3 adsWithSpotlight( ) 
{   
	
    vec3 ReturnColour;
	vec3 s = normalize( vec3( LightPosition) - VertPosition );   
	float angle = degrees(acos(dot(-s, normalize(direction))));   
	float cutoff = clamp(cutoffO, 0.0, 90.0);  
	vec3 ambient = ambientintensity * Ka; 
	
	if( angle < cutoffO ) 
	{     		
		vec3 diffuse;
		vec3 specular;
	   
		float distance = length(vec3(LightPosition) - VertPosition);	 
		float attenuation = 1.0 / (0.1 + 0.01*distance + 0.01*distance*distance);
		
		//diffuse
		float spotFactor = pow(dot(-s, normalize(direction)), exponent);   
		diffuse = spotFactor * intensity * Kd * max(0,dot(normalize(Normal),normalize(-direction)));

		//Specular
		vec3 VertexToEye = normalize(eye - VertPosition);
		vec3 LightReflect = normalize(reflect(direction, Normal));
		float SpecularFactor = dot(VertexToEye, LightReflect);
		SpecularFactor = pow(SpecularFactor, Shininess);

		if(SpecularFactor > 0)
		{
			specular = spotFactor * intensity * Ks * SpecularFactor;
		}

		ReturnColour = attenuation * (diffuse + specular);		 
		ReturnColour += ambient;
	} 
	else 
	{     
		return ambient;     
	} 
		return ReturnColour;
} 

void main() 
{   
	FragColor = vec4(adsWithSpotlight(), 1.0); 
}




