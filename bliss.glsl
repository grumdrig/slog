// Most of this was modified from:
// Rolling hills. By David Hoskins, November 2013.
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// https://www.shadertoy.com/view/Xsf3zX

#define ROAM_SPEED 0.1

#define THRESHOLD .003
#define MOD2 vec2(3.07965, 7.4235)
float PI  = 4.0 * atan(1.0);
vec3 sunLight  = normalize(vec3(0.35, 0.2,  0.3));
vec3 cameraPos;
vec3 sunColour = vec3(1.0, .75, .6);
const mat2 rotate2D = mat2(1.932, 1.623, -1.623, 1.952);
float gTime = 0.0;

float Hash( float p ) {
	vec2 p2 = fract(vec2(p) / MOD2);
	p2 += dot(p2.yx, p2.xy+19.19);
	return fract(p2.x * p2.y);
}

float Hash(vec2 p) {
	p  = fract(p / MOD2);
	p += dot(p.xy, p.yx+19.19);
	return fract(p.x * p.y);
}


float Noise( in vec2 x ) {
	vec2 p = floor(x);
	vec2 f = fract(x);
	f = f*f*(3.0-2.0*f);
	float n = p.x + p.y*57.0;
	float res = mix(mix( Hash(n+  0.0), Hash(n+  1.0),f.x),
					mix( Hash(n+ 57.0), Hash(n+ 58.0),f.x),f.y);
	return res;
}

vec2 hash22(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx+33.33);
	return fract((p3.xx+p3.yz)*p3.zy);

}

vec2 Voronoi( in vec2 x ) {
	vec2 p = floor( x );
	vec2 f = fract( x );
	float res=100.0;
	vec2 id;
	for( int j=-1; j<=1; j++ )
	for( int i=-1; i<=1; i++ )
	{
		vec2 b = vec2( float(i), float(j) );
		vec2 r = b - f  + hash22( p + b );
		float d = dot(r,r);
		if( d < res )
		{
			res = d;
			id.x  = Hash(p+b);
		}
	}
	return vec2(max(.4-sqrt(res), 0.0),id.x);
}


vec2 Terrain( in vec2 p) {
	float type = 0.0;
	vec2 pos = p*0.003;
	float w = 50.0;
	float f = .0;
	for (int i = 0; i < 3; i++)
	{
		f += Noise(pos) * w;
		w = w * 0.62;
		pos *= 2.5;
	}

	return vec2(f, type);
}

vec2 Map(in vec3 p) {
	vec2 h = Terrain(p.xz);
	return vec2(p.y - h.x, h.y);
}

float FractalNoise(in vec2 xy) {
	float w = .7;
	float f = 0.0;

	for (int i = 0; i < 3; i++)
	{
		f += Noise(xy) * w;
		w = w*0.6;
		xy = 2.0 * xy;
	}
	return f;
}

//---------------

vec3 Blue = vec3(0.6, 0.67, 0.9);
vec3 White = vec3(1.0);

float fbm(vec3 v);

vec3 GetCloudySky(in vec3 dir) {
	 float value = fbm(dir + iTime / 1000.0  * vec3(10.2982, 11.0593, 12.9892));
	// value = abs(value);

	// value = clamp(value, 0.0, 1.0);
	return mix(White, Blue, value);
}

// Grab all sky information for a given ray from camera
vec3 GetSky(in vec3 rd)
{
	float sunAmount = max( dot( rd, sunLight), 0.0 );
	float v = pow(1.0-max(rd.y,0.0),6.);
	// vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	vec3  sky = mix(GetCloudySky(rd), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	return clamp(sky, 0.0, 1.0);
}


// Merge grass into the sky background for correct fog colouring...
vec3 ApplyFog( in vec3  rgb, in float dis, in vec3 dir)
{
	float fogAmount = clamp(dis*dis* 0.0000012, 0.0, 1.0);
	return mix( rgb, GetSky(dir), fogAmount );
}

vec3 DE(vec3 p)
{
	float base = Terrain(p.xz).x - 1.9;
	float height = Noise(p.xz*2.0)*.75 + Noise(p.xz)*.35 + Noise(p.xz*.5)*.2;
	//p.y += height;
	float y = p.y - base-height;
	y = y*y;
//    vec2 ret = Voronoi((p.xz*2.5+sin(y*2.0+p.zx*12.3)*.12+vec2(sin(iTime*1.3+1.5*p.z),sin(iTime*2.6+1.5*p.x))*y*.5));
	vec2 ret = Voronoi((p.xz*2.5+sin(y*2.0+p.zx*12.3)*.12+vec2(sin(1.5*p.z),sin(1.5*p.x))*y*.5));
	float f = ret.x * .65 + y * .5;
	return vec3( y - f*1.4, clamp(f * 1.1, 0.0, 1.0), ret.y);
}

// eiffie's code for calculating the aperture size for a given distance...
float CircleOfConfusion(float t) {
	return max(t * .04, (2.0 / iResolution.y) * (1.0+t));
}

float Linstep(float a, float b, float t) {
	return clamp((t-a)/(b-a),0.,1.);
}

vec3 GrassBlades(in vec3 rO, in vec3 rD, in vec3 mat, in float dist) {
	float d = 0.0;
	// Only calculate cCoC once is enough here...
	float rCoC = CircleOfConfusion(dist*.3);
	float alpha = 0.0;

	vec4 col = vec4(mat*0.15, 0.0);

	for (int i = 0; i < 15; i++)
	{
		if (col.w > .99) break;
		vec3 p = rO + rD * d;

		vec3 ret = DE(p);
		ret.x += .5 * rCoC;

		if (ret.x < rCoC)
		{
			alpha = (1.0 - col.y) * Linstep(-rCoC, rCoC, -ret.x);//calculate the mix like cloud density
			// Mix material with white tips for grass...
			vec3 gra = mix(mat, vec3(.35, .35, min(pow(ret.z, 4.0)*35.0, .35)), pow(ret.y, 9.0)*.7) * ret.y;
			col += vec4(gra * alpha, alpha);
		}
		d += max(ret.x * .7, .1);
	}
	if(col.w < .2)
		col.xyz = vec3(0.1, .15, 0.05);
	return col.xyz;
}

// Calculate sunlight...
void DoLighting(inout vec3 mat, in vec3 pos, in vec3 normal, in vec3 eyeDir, in float dis) {
	float h = dot(sunLight,normal);
	mat = mat * sunColour*(max(h, 0.0)+.2);
}

vec3 TerrainColour(vec3 pos, vec3 dir,  vec3 normal, float dis, float type) {
	vec3 mat;
	if (type == 0.0)
	{
		// Random colour...
		mat = mix(vec3(.0,.3,.0), vec3(.2,.3,.0), Noise(pos.xz*.025));
		// Random shadows...
		float t = FractalNoise(pos.xz * .1)+.5;
		// Do grass blade tracing...
		mat = GrassBlades(pos, dir, mat, dis) * t;
		DoLighting(mat, pos, normal,dir, dis);
	}
	mat = ApplyFog(mat, dis, dir);
	return mat;
}

// Home in on the surface by dividing by two and split...
// Note, this does a much better job than using 'abs' on the distance march.
float BinarySubdivision(in vec3 rO, in vec3 rD, float t, float oldT) {
	float halfwayT = 0.0;
	for (int n = 0; n < 5; n++)
	{
		halfwayT = (oldT + t ) * .5;
		float h = Map(rO + halfwayT*rD).x;
		(h < THRESHOLD) ? t = halfwayT:oldT = halfwayT;
  }
	return t;
}

bool Scene(in vec3 rO, in vec3 rD, out float resT, out float type ) {
	float t = 5.;
	float oldT = 0.0;
	float delta = 0.;
	float h = 0.0;
	bool hit = false;
	for( int j=0; j < 60; j++ )
	{
		vec3 p = rO + t*rD;
		h = Map(p).x; // ...Get this position's height mapping.

		// Are we inside, and close enough to fudge a hit?...
		if( h < THRESHOLD)
		{
			hit = true;
			break;
		}
		oldT = t;
		t +=  h + (t*0.04);
	}
	type = 0.0;
	resT = BinarySubdivision(rO, rD, t, oldT);
	return hit;
}

vec3 CameraPath( float t ) {
	t *= ROAM_SPEED;
	vec2 p = vec2(200.0 * sin(3.54*t), 200.0 * cos(2.0*t) );
	return vec3(p.x+55.0,  12.0+sin(t*.3)*6.5, -94.0+p.y);
}

vec3 PostEffects(vec3 rgb, vec2 xy) {
	// Gamma first...
	rgb = pow(rgb, vec3(0.45));

	// Then...
	#define CONTRAST 1.1
	#define SATURATION 1.3
	#define BRIGHTNESS 1.3
	rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb*BRIGHTNESS)), rgb*BRIGHTNESS, SATURATION), CONTRAST);
	// Vignette...
	// rgb *= .4+0.5*pow(40.0*xy.x*xy.y*(1.0-xy.x)*(1.0-xy.y), 0.2 );
	return rgb;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	float m = (iMouse.x/iResolution.x)*300.0;
	float gTime = (iTime*5.0+m+2352.0)*.006;
	vec2 xy = fragCoord.xy / iResolution.xy;
	vec2 uv = (-1.0 + 2.0 * xy) * vec2(iResolution.x/iResolution.y,1.0);
	vec3 camTar;

	cameraPos = CameraPath(gTime + 0.0);
	cameraPos.x -= 3.0;
	camTar     = CameraPath(gTime + .009);
	// cameraPos.y += Terrain(CameraPath(gTime + .009).xz).x;
	cameraPos.y = Terrain(cameraPos.xz).x + 10.0;
	camTar.y = cameraPos.y;

	// float roll = .4*sin(gTime+.5);
	vec3 cw = normalize(camTar-cameraPos);
	vec3 cp = vec3(0.0, 1.0, 0.0); //sin(roll), cos(roll),0.0);
	vec3 cu = cross(cw,cp);
	vec3 cv = cross(cu,cw);
	vec3 dir = normalize(uv.x*cu + uv.y*cv + 1.3*cw);
	mat3 camMat = mat3(cu, cv, cw);

	vec3 col;
	float distance;
	float type;
	if( !Scene(cameraPos, dir, distance, type) )
	{
		// Missed scene, now just get the sky...
		col = GetSky(dir);
	}
	else
	{
		// Get world coordinate of landscape...
		vec3 pos = cameraPos + distance * dir;
		// Get normal from sampling the high definition height map
		// Use the distance to sample larger gaps to help stop aliasing...
		vec2 p = vec2(0.1, 0.0);
		vec3 nor      = vec3(0.0,        Terrain(pos.xz).x, 0.0);
		vec3 v2        = nor-vec3(p.x,    Terrain(pos.xz+p).x, 0.0);
		vec3 v3        = nor-vec3(0.0,    Terrain(pos.xz-p.yx).x, -p.x);
		nor = cross(v2, v3);
		nor = normalize(nor);

		// Get the colour using all available data...
		col = TerrainColour(pos, dir, nor, distance, type);
  }

	// bri is the brightness of sun at the centre of the camera direction.
	// Yeah, the lens flares is not exactly subtle, but it was good fun making it.
	float bri = dot(cw, sunLight)*.75;
	// if (false)
		if (bri > 0.0)
	{
		vec2 sunPos = vec2( dot( sunLight, cu ), dot( sunLight, cv ) );
		vec2 uvT = uv-sunPos;
		uvT = uvT*(length(uvT));
		bri = pow(bri, 6.0)*.8;

		// glare = the red shifted blob...
		float glare1 = max(dot(normalize(vec3(dir.x, dir.y+.3, dir.z)),sunLight),0.0)*1.4;
		// glare2 is the yellow ring...
		float glare2 = max(1.0-length(uvT+sunPos*.5)*4.0, 0.0);
		uvT = mix (uvT, uv, -2.3);
		// glare3 is a purple splodge...
		float glare3 = max(1.0-length(uvT+sunPos*5.0)*1.2, 0.0);

		col += bri * vec3(1.0, .0, .0)  * pow(glare1, 12.5)*.05;
		col += bri * vec3(1.0, 1.0, 0.2) * pow(glare2, 2.0)*2.5;
		col += bri * sunColour * pow(glare3, 2.0)*3.0;
	}
   	col = PostEffects(col, xy);
	fragColor=vec4(col,1.0);
}

//--------------------------------------------------------------------------
// Gleaned from this shitty gist: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
//  Classic Perlin 3D Noise
//  by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float noise(vec3 P){
	vec3 Pi0 = floor(P); // Integer part for indexing
	vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
	Pi0 = mod(Pi0, 289.0);
	Pi1 = mod(Pi1, 289.0);
	vec3 Pf0 = fract(P); // Fractional part for interpolation
	vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
	vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
	vec4 iy = vec4(Pi0.yy, Pi1.yy);
	vec4 iz0 = Pi0.zzzz;
	vec4 iz1 = Pi1.zzzz;

	vec4 ixy = permute(permute(ix) + iy);
	vec4 ixy0 = permute(ixy + iz0);
	vec4 ixy1 = permute(ixy + iz1);

	vec4 gx0 = ixy0 / 7.0;
	vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
	gx0 = fract(gx0);
	vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
	vec4 sz0 = step(gz0, vec4(0.0));
	gx0 -= sz0 * (step(0.0, gx0) - 0.5);
	gy0 -= sz0 * (step(0.0, gy0) - 0.5);

	vec4 gx1 = ixy1 / 7.0;
	vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
	gx1 = fract(gx1);
	vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
	vec4 sz1 = step(gz1, vec4(0.0));
	gx1 -= sz1 * (step(0.0, gx1) - 0.5);
	gy1 -= sz1 * (step(0.0, gy1) - 0.5);

	vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
	vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
	vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
	vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
	vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
	vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
	vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
	vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

	vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	g000 *= norm0.x;
	g010 *= norm0.y;
	g100 *= norm0.z;
	g110 *= norm0.w;
	vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
	g001 *= norm1.x;
	g011 *= norm1.y;
	g101 *= norm1.z;
	g111 *= norm1.w;

	float n000 = dot(g000, Pf0);
	float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
	float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
	float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
	float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
	float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
	float n111 = dot(g111, Pf1);

	vec3 fade_xyz = fade(Pf0);
	vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
	return 2.2 * n_xyz;
}

float fbm(vec3 v) {
	float result = 0.0;
	for (float octave = 2.0; octave <6.0; octave += 1.0) {
		result += pow(0.5, octave) * noise(v*pow(2.0, octave) + vec3(11.9019,33.11,19.321)*octave);
	}
	result = result * 2.0 + 2.0;

	return result;
}
