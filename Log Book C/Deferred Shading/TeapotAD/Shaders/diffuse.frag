#version 430

// The Light information
struct LightInfo {
  vec4 Position;  // Light position in eye coords.
  vec3 AmbientIntensity; 
  vec3 DiffuseIntensity;
  vec3 Target;
};
uniform LightInfo Light;

// The Material information
struct MaterialInfo {
  vec3 Kd;            // Ambient and Diffuse reflectivity
  vec3 Ks;
  float Shininess;
};
uniform MaterialInfo Material;

subroutine void RenderPassType();
subroutine uniform RenderPassType RenderPass;

// The textures produced by the pass1
uniform sampler2D PositionTex, NormalTex, ColorTex, SpecTex;

in vec3 Position;
in vec3 Normal;
in vec2 TexCoord;
in vec3 Eye;

layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec3 PositionData; //COLOR_ATTACHMENT0
layout (location = 2) out vec3 NormalData; //COLOR_ATTACHMENT1
layout (location = 3) out vec3 ColorData; //COLOR_ATTACHMENT2
layout (location = 4) out vec4 SpecData; //COLOR_ATTACHMENT3


//Calculate the fragment colour under ambient + diffuse light
//using position, normal and diffuse colour information sampled from
//textures
vec3 diffuseModel( vec3 pos, vec3 norm, vec3 diff )
{
    vec3 s = normalize(vec3(Light.Position) - pos);
    float sDotN = max( dot(s,norm), 0.0 );
    vec3 diffuse = clamp(Light.AmbientIntensity * diff + Light.DiffuseIntensity 
* diff * sDotN,0,1);

    return diffuse;
}

vec3 specularModel( vec3 pos, vec3 norm, vec4 spec)
{
		vec3 VertexToEye = normalize(Eye - pos);
		vec3 direction = normalize(Light.Target - vec3(Light.Position));
		vec3 LightReflect = normalize(reflect(direction, norm));
		float SpecularFactor = dot(VertexToEye, LightReflect);
		SpecularFactor = pow(SpecularFactor, spec.a * 255 );
		
		if(SpecularFactor > 0)
		{
			return Light.DiffuseIntensity * spec.rgb * SpecularFactor;
		}	
		else return vec3(0.0,0.0,0.0);
}

//pass1
subroutine (RenderPassType)
void pass1()
{
    // Store position, normal, and diffuse color in textures
    PositionData = Position;
    NormalData = Normal;
    ColorData = Material.Kd;
	SpecData = vec4(Material.Ks, Material.Shininess);	
}

//pass2
subroutine(RenderPassType)
void pass2()
{
	vec3 pos = vec3(texture2D(PositionTex, TexCoord));
	vec3 norm = vec3(texture2D(NormalTex, TexCoord));
	vec3 colour = vec3(texture2D(ColorTex, TexCoord));
	vec4 spec = vec4(texture2D(SpecTex, TexCoord));

	//Ambient lighting included with the diffuse model
	FragColor = vec4(diffuseModel(pos, norm, colour),0.0);
	FragColor += vec4(specularModel(pos, norm, spec),0.0);
	//FragColor += spec;
	}

void main() {
    // This will call either pass1 or pass2
    RenderPass();
}
