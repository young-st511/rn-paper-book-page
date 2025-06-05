import { frag } from '@/components/Riveo/ShaderLib';

const SCALING_FACTOR = 1.05; // 중앙에서 확대 비율

export const wavePageFlipShader = frag`
    uniform float uTime;
    uniform vec2 uResolution;
    uniform shader image;

    half4 main(vec2 fragCoord) {
        vec2 uv = fragCoord / uResolution;
        
        // 파도 효과를 위한 사인파 계산
        float wave1 = sin(uv.x * 10.0 + uTime * 2.0) * 0.01;
        float wave2 = sin(uv.y * 8.0 + uTime * 1.5) * 0.008;
        float wave3 = sin((uv.x + uv.y) * 6.0 + uTime * 2.5) * 0.006;
        
        // 복합 파도 효과로 새로운 좌표 계산
        vec2 waveOffset = vec2(wave1 + wave2, wave2 + wave3);

        float scale = 1. / ${SCALING_FACTOR};
        
        // 중앙에서 확대 (1.05배)
        vec2 center = uResolution * 0.5;
        vec2 scaledCoord = (fragCoord - center) * scale + center;
        vec2 newCoord = scaledCoord + waveOffset * uResolution;
        
        // 왜곡된 좌표에서 원본 콘텐츠 샘플링
        return image.eval(newCoord);
    }
`;

// 불규칙한 물결 페이지 넘김 셰이더
export const wavePageFlipShader2 = frag`
uniform float progress;     // 0.0 ~ 1.0 넘김 진행도
uniform float time;         // 시간 (애니메이션용)
uniform vec2 resolution;    // 화면 해상도
uniform shader currentPage; // 현재 페이지 텍스처
uniform shader nextPage;    // 다음 페이지 텍스처

// 노이즈 함수 (불규칙성을 위해)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 부드러운 노이즈
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 다중 옥타브 노이즈 (자연스러운 불규칙성)
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// 물결 변형 함수
vec2 waveDistortion(vec2 uv, float progress, float time) {
    // 기본 물결 패턴
    float wave1 = sin(uv.y * 10.0 + time * 2.0) * 0.02;
    float wave2 = sin(uv.y * 15.0 + time * 3.0) * 0.015;
    float wave3 = sin(uv.y * 25.0 + time * 1.5) * 0.01;
    
    // 불규칙한 노이즈 기반 변형
    float noiseValue = fbm(uv * 8.0 + time * 0.5) * 0.03;
    
    // 진행도에 따른 강도 조절
    float intensity = sin(progress * 3.14159) * 2.0;
    
    // 페이지 가장자리에서 더 강한 효과
    float edgeEffect = smoothstep(0.8, 1.0, progress) * 0.05;
    
    return vec2(
        (wave1 + wave2 + wave3 + noiseValue + edgeEffect) * intensity,
        0.0
    );
}

// 페이지 컬링(말림) 효과
float pagecurl(vec2 uv, float progress) {
    // 페이지가 말리는 부분 계산
    float curlLine = progress * 1.2 - 0.1;
    float curlWidth = 0.1;
    
    // 말림 영역에서의 그라데이션
    float curlFactor = smoothstep(curlLine - curlWidth, curlLine, uv.x);
    
    return curlFactor;
}

vec4 main(vec2 coord) {
    vec2 uv = coord / resolution;
    
    // 물결 변형 적용
    vec2 distortedUV = uv + waveDistortion(uv, progress, time);
    
    // 페이지 컬링 계산
    float curl = pagecurl(uv, progress);
    
    // 현재 페이지와 다음 페이지 색상 샘플링
    vec4 currentColor = currentPage.eval(distortedUV * resolution);
    vec4 nextColor = nextPage.eval(uv * resolution);
    
    // 페이지 전환 경계선
    float boundary = step(progress, uv.x + noise(uv * 20.0 + time) * 0.1);
    
    // 그림자 효과
    float shadow = (1.0 - curl) * 0.3;
    vec4 shadowColor = vec4(0.0, 0.0, 0.0, shadow);
    
    // 말림 부분의 하이라이트
    float highlight = curl * 0.2;
    vec4 highlightColor = vec4(1.0, 1.0, 1.0, highlight);
    
    // 최종 색상 조합
    vec4 finalColor = mix(nextColor, currentColor, boundary);
    
    // 그림자와 하이라이트 적용
    finalColor = mix(finalColor, shadowColor, shadow);
    finalColor = mix(finalColor, highlightColor, highlight);
    
    return finalColor;
}
`;
