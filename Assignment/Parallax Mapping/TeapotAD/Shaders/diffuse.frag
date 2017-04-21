#version 400

in vec3 VertPosition; 
in vec3 Normal;
in vec2 TexCoords; 
in vec3 EyePos;

struct Light
{
	vec3 position;
	vec3 diffuseIntensity;
	vec3 specularIntensity;
	vec3 ambientIntensity;
	vec3 lightDirection;
};

layout( location = 0 ) out vec4 FragColor; 

uniform sampler2D DiffuseTex;
uniform sampler2D SpecularTex;
uniform sampler2D HeightTex;
uniform sampler2D NormalTex;
uniform Light light;

// Diffuse Lighting.
vec3 diffuseModel( vec3 pos, vec3 norm, vec3 diff )
{
    vec3 s = normalize(vec3(light.position) - pos);
    float sDotN = max( dot(s,norm), 0.0 );
    vec3 diffuse = clamp(light.ambientIntensity * diff + light.diffuseIntensity 
	* diff * sDotN,0,1);

    return diffuse;
}

// Specular Lighting.
vec3 specularModel( vec3 pos, vec3 norm, vec4 spec)
{
	vec3 VertexToEye = normalize(EyePos - pos);
	vec3 direction = normalize(light.lightDirection);
	vec3 LightReflect = normalize(reflect(direction, norm));
	float SpecularFactor = dot(VertexToEye, LightReflect);
	SpecularFactor = pow(SpecularFactor, 50 );
	
	if(SpecularFactor > 0)
	{
		return light.diffuseIntensity * spec.rgb * SpecularFactor;
	}	
	else return vec3(0.0,0.0,0.0);
}

void main() 
{   
	//Scale factor. 
	float scale = 0.05;

	//Bias Factor.
	float bias = scale * -0.5;

	//Get the height of the current fragment
	float height = texture2D(HeightTex, TexCoords).r;

	//Create the offset.
	float HSB = height * scale + bias;

	//Normalise the eye position.
	vec3 V = normalize(EyePos);

	//Get adjusted texture position in the view direction,
	vec2 tn = TexCoords + HSB * V.xy;
	
	//apply diffuse and specular lighting.
	FragColor = vec4(diffuseModel(VertPosition, vec3(texture2D(NormalTex, tn)), vec3(texture2D(DiffuseTex, tn))),1);
	FragColor += vec4(specularModel(VertPosition, vec3(texture2D(NormalTex, tn)), texture2D(SpecularTex, tn)),1);
//	FragColor += vec4(light.ambientIntensity,1);
}