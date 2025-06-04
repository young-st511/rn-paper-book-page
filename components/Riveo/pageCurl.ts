import { Core, frag } from "./ShaderLib";

export const pageCurl = frag`
uniform shader image;
uniform float pointer;
uniform float origin;
uniform vec4 container;
uniform float cornerRadius;
uniform vec2 resolution;

const float r = 150.0; // page curl radius
const float scaleFactor = 0.2;

${Core}

vec4 main(float2 xy) {
  Context ctx = Context(image.eval(xy), xy, resolution);
  float2 center = resolution * 0.5;
  float dx = origin - pointer;
  float x= container.z - dx; // x position of the pointer
  float d = xy.x - x; // pointer에서 현재 xy.x까지의 거리 - 음수인 경우 포인터의 왼쪽

  if(d > r) {
    ctx.color = TRANSPARENT;
    
    if(inRRect(xy, container, cornerRadius)) {
      ctx.color.a = mix(0.5, 0, (d-r) / r);
    }
    
  } else if (d > 0.0) {
    float theta = asin(d / r);
    float d1 = r * theta;
    float d2 = r * (PI - theta);

    vec2 s = vec2((1.0 + (1 - sin(PI/2 + theta)) * 0.1));
    mat3 transform = scale(s, center);
    float2 uv = project(xy, transform);
    vec2 p1 = vec2(x + d1, uv.y);

    s = vec2((1.1 + sin(PI/2 + theta) * 0.1));
    transform = scale(s, center);
    uv = project(xy, transform);
    vec2 p2 = vec2(x + d2, uv.y);
    
    
    if (inRRect(p2, container, cornerRadius)) {
      ctx.color = image.eval(p2);
    } else if (inRRect(p1, container, cornerRadius)) {
      ctx.color = image.eval(p1);
      ctx.color.rgb *= pow(saturate((r-d)/r), 0.2);
    } else {
      ctx.color = TRANSPARENT;
      if (inRRect(xy, container, cornerRadius)) {
        ctx.color.a = 0.5;
      }
    }
  } else {
    float d1 = x + abs(d) + PI * r;
    float2 p1 = vec2(d1, xy.y);
    
    float2 s = vec2(1, 1 + scaleFactor);
    mat3 m3 = scale(s, center);
    float2 uv = project(p1 ,m3);
    
    if (inRRect(uv, container, cornerRadius)) {
      ctx.color = image.eval(uv);
    }
  }

  return ctx.color;
}
`;
