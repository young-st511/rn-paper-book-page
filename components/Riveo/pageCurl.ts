import { Core, frag } from "./ShaderLib";

export const pageCurl = frag`
uniform shader image;
uniform float pointer;
uniform float origin;
// uniform vec4 container;
// uniform float cornerRadius;
uniform vec2 resolution;

const float r = 150.0;
const float scaleFactor = 0.2;

${Core}

vec4 main(float2 xy) {
  Context ctx = Context(image.eval(xy), xy, resolution);
  float2 center = resolution * 0.5;
  float dx = origin - pointer;
  float d = xy.x - pointer;

  if(d > 0.0) {
    return TRANSPARENT;
  }

  return ctx.color;
}
`;
