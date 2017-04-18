#version 430
	
in vec3 Position;
in vec3 N;
in vec2 TexCoord;

uniform sampler2D RenderTex;
uniform sampler2D Texture;

uniform float EdgeThreshold;
uniform int Width;
uniform int Height;
uniform int BinSize;
uniform int Radius;

subroutine vec4 RenderPassType();
subroutine uniform RenderPassType RenderPass;

struct LightInfo {
  vec4 Position;  // Light position in eye coords.
  vec3 Intensity; // A,D,S intensity
};
uniform LightInfo Light;

struct MaterialInfo {
  vec3 Ka;            // Ambient reflectivity
  vec3 Kd;            // Diffuse reflectivity
  vec3 Ks;            // Specular reflectivity
  float Shininess;    // Specular shininess factor
};
uniform MaterialInfo Material;

layout( location = 0 ) out vec4 FragColor;

vec3 phongModel( vec3 pos, vec3 norm )
{
    //Calculate the light vector
   vec3 L = normalize(vec3(Light.Position) - pos); 
 
   //Calculate View vector
   vec3 V = normalize(-pos); 	//We are in eye coords 
						//so camera is at (0,0,0); 
    

   //calculate Diffuse Light Intensity making sure it is not negative 
   //and is clamped 0 to 1  
     
   vec3 Id = Light.Intensity * max(dot(norm,L), 0.0);
   Id = clamp(Id, 0.0, 1.0);     
   
   vec3 Ia = Light.Intensity * Material.Ka;

    return texture2D(Texture, TexCoord).rgb;
    return Ia + Id;
}

subroutine (RenderPassType)
vec4 pass1()
{
   return vec4(phongModel( Position, N ),1.0);
}

float luminance( vec3 color ) {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

subroutine( RenderPassType )
vec4 pass2()
{

	const int BINSIZE = 20;
	vec3 colour;
	int intensityCount[BINSIZE];
	float curMax = 0;
	int maxIndex;

	for(int i = 0; i < BinSize; ++i)
	{
		intensityCount[i] = 0;
	}

	float averageR[BINSIZE];
	float averageG[BINSIZE];
	float averageB[BINSIZE];

	for(int i = 0; i < BinSize; ++i)
	{
		averageR[i] = 0.0f;
		averageG[i]	= 0.0f;
		averageB[i]	= 0.0f;
	}

	for (int j = -Radius; j <= Radius; ++j) 
	 {
        for (int i = -Radius; i <= Radius; ++i)  
		{
			colour = vec3(textureOffset(RenderTex,TexCoord,ivec2(i,j)).rgb);
			int curIntensity = int(((colour.r+colour.g+colour.b)/3.0)*(BinSize-1));
			intensityCount[curIntensity]++;
			averageR[curIntensity] += colour.r;
			averageG[curIntensity] += colour.g;
			averageB[curIntensity] += colour.b;
        }														 
    }

	for(int i = 0;i < BinSize; ++i)
	{
		if(intensityCount[i] > curMax)
		{
			curMax = intensityCount[i];
			maxIndex = i;
		}
	}

	return vec4(averageR[maxIndex] / curMax, averageG[maxIndex] / curMax, averageB[maxIndex] / curMax, 1.0);
}

void main()
{
    // This will call either pass1() or pass2()
    FragColor = RenderPass();
	
}
