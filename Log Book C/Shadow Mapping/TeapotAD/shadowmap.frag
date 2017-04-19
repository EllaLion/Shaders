#version 430

uniform struct MaterialInfo {
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;
} Material;

uniform sampler2DShadow ShadowMap;
uniform  vec3 LightIntensity;

in vec3 Position;
in vec3 Normal;
in vec4 ShadowCoord;
in vec3 LightPos;

layout (location = 0) out vec4 FragColor;

vec3 phongModelDiffAndSpec()
{
    vec3 n = Normal;
   if( !gl_FrontFacing ) n = -n;
    vec3 s = normalize(vec3(LightPos) - Position);
    vec3 v = normalize(-Position.xyz);
    vec3 r = reflect( -s, n );
    float sDotN = max( dot(s,n), 0.0 );
    vec3 diffuse = LightIntensity * Material.Kd * sDotN;
    vec3 spec = vec3(0.0);
    if( sDotN > 0.0 )
        spec = LightIntensity * Material.Ks *
            pow( max( dot(r,v), 0.0 ), Material.Shininess );

    return diffuse + spec;
}

subroutine void RenderPassType();
subroutine uniform RenderPassType RenderPass;

subroutine (RenderPassType)
void shadeWithShadow()
{
   vec3 ambient = Material.Ka * LightIntensity;
   vec3 diffandspec = phongModelDiffAndSpec();
  
   float sum = 0;

   // Reduce the radius for sharper edges.
   int RADIUS = 10;
   float count = 0.0;

   for(int i = -RADIUS; i != RADIUS; ++i)
   {
        for(int j = RADIUS; j != -RADIUS; --j)
        {
         sum += textureProjOffset(ShadowMap, ShadowCoord, ivec2(i,j));
         count += 1.0;
        }
   }

   float temp = 1.0 / count;
   float visibility = sum * temp;
   FragColor = vec4(diffandspec * visibility + ambient, 1.0);
}

subroutine (RenderPassType)
void recordDepth()
{
   
}

void main() {
    // This will call either shadeWithShadow or recordDepth
    RenderPass();
}
