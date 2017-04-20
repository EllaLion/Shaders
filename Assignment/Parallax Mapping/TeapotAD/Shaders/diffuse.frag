#version 400

in vec3 VertPosition; 
in vec3 Normal;
in vec2 TexCoords; 
in vec3 EyePos;

in VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} fs_in;

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

uniform bool parallax;
uniform float height_scale;

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{ 
    float height =  texture(HeightTex, texCoords).r;     
    return texCoords - viewDir.xy / viewDir.z * (height * height_scale);            
}



void main() 
{   

    // Offset texture coordinates with Parallax Mapping
    vec3 viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
    vec2 texCoords = fs_in.TexCoords;
    if(parallax)
        texCoords = ParallaxMapping(fs_in.TexCoords,  viewDir);
        
    // Obtain normal from normal map
    vec3 normal = texture(NormalTex, texCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);   
   
    // Get diffuse color
    vec3 color = texture(DiffuseTex, texCoords).rgb;
    // Ambient
    vec3 ambient = 0.1 * color;
    // Diffuse
    vec3 lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * color;
    // Specular    
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    vec3 specular = vec3(0.2) * spec;
    FragColor = vec4(ambient + diffuse + specular, 1.0f);
}

