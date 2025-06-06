import { frag } from '@/components/Riveo/ShaderLib';

export const waterDropShader = frag`
    uniform float uTime;
    uniform vec2 uResolution;
    uniform shader image;

    uniform float uDropCycleTime; // 물방울 주기 (초 단위)
    
    // 5개 물방울의 데이터 (JavaScript에서 전달)
    uniform vec2 uDropCenter0;
    uniform vec2 uDropCenter1;
    uniform vec2 uDropCenter2;
    uniform vec2 uDropCenter3;
    uniform vec2 uDropCenter4;
    
    uniform float uDropStart0;
    uniform float uDropStart1;
    uniform float uDropStart2;
    uniform float uDropStart3;
    uniform float uDropStart4;
    
    // 물방울 효과 상수들
    const float MAX_RADIUS = 0.25;              // 최대 반지름
    const float MIN_RADIUS = 0.01;             // 최소 반지름
    const float DROP_LIFETIME = 0.5;           // 물방울 생명주기 (0~1 중 비율)
    const float MIN_DISTANCE_CHECK = 0.001;    // 최소 거리 체크
    
    // 그림자 관련 상수
    const float SHADOW_EXTEND = 0.04;          // 그림자 확장 크기
    const float SHADOW_MIN_RADIUS = 0.02;      // 그림자 최소 반지름
    const float SHADOW_EDGE_START = 0.005;     // 그림자 가장자리 시작점
    const float SHADOW_EDGE_END = 0.04;        // 그림자 가장자리 끝점
    const float SHADOW_DECAY = 2.0;            // 그림자 감쇠율
    const float SHADOW_INTENSITY = 0.04;       // 그림자 강도
    const float SHADOW_MAX_FACTOR = 0.06;      // 최대 그림자 팩터
    
    // 파문 관련 상수
    const float WAVE1_FACTOR = 0.3;            // 첫 번째 파문 팩터
    const float WAVE1_FREQUENCY = 25.0;        // 첫 번째 파문 주파수
    const float WAVE2_FACTOR = 0.6;            // 두 번째 파문 팩터
    const float WAVE2_FREQUENCY = 15.0;        // 두 번째 파문 주파수
    const float WAVE2_AMPLITUDE = 0.5;         // 두 번째 파문 진폭
    const float RIPPLE_DECAY = 3.0;            // 파문 감쇠율
    const float RIPPLE_INTENSITY = 0.6;        // 파문 강도
    const float RIPPLE_OFFSET_SCALE = 0.02;    // 파문 오프셋 스케일

    half4 main(vec2 fragCoord) {
        vec2 uv = fragCoord / uResolution;
        vec2 totalOffset = vec2(0.0);
        float totalShadow = 0.0;
        
        float currentCycleTime = uTime; // 0~1 범위
        
        // 물방울 데이터 배열
        vec2 centers[4];
        float startTimes[4];
        
        centers[0] = uDropCenter0; startTimes[0] = uDropStart0;
        centers[1] = uDropCenter1; startTimes[1] = uDropStart1;
        centers[2] = uDropCenter2; startTimes[2] = uDropStart2;
        centers[3] = uDropCenter3; startTimes[3] = uDropStart3;
        
        for(int i = 0; i < 4; i++) {
            // startTimes도 0~1 범위로 정규화
            float normalizedStartTime = startTimes[i] / uDropCycleTime;
            
            // 시작 시간 체크
            if(currentCycleTime < normalizedStartTime) continue;
            
            // 물방울 생명주기 계산
            float dropAge = (currentCycleTime - normalizedStartTime) / DROP_LIFETIME;
            if(dropAge > 1.0) continue;
            
            // 물방울 반지름 계산
            float radius = dropAge * MAX_RADIUS + MIN_RADIUS;
            float dist = distance(uv, centers[i]);
            
            // 그림자 효과
            float shadowRadius = radius + SHADOW_EXTEND;
            if(dist < shadowRadius && shadowRadius > SHADOW_MIN_RADIUS) {
                float shadowIntensity = smoothstep(radius - SHADOW_EDGE_START, radius + SHADOW_EDGE_END, dist);
                float shadowFade = exp(-dist * SHADOW_DECAY) * (1.0 - dropAge) * SHADOW_INTENSITY;
                totalShadow += shadowFade * shadowIntensity;
            }
            
            // ripple 효과
            if(dist < radius && radius > MIN_RADIUS) {
                float wave1 = sin((dist - radius * WAVE1_FACTOR) * WAVE1_FREQUENCY);
                float wave2 = sin((dist - radius * WAVE2_FACTOR) * WAVE2_FREQUENCY) * WAVE2_AMPLITUDE;
                float wave = wave1 + wave2;
                
                float fade = exp(-dist * RIPPLE_DECAY) * (1.0 - dropAge) * RIPPLE_INTENSITY;
                float ripple = wave * fade;
                
                vec2 direction = normalize(uv - centers[i]);
                if(dist > MIN_DISTANCE_CHECK) {
                    totalOffset += direction * ripple * RIPPLE_OFFSET_SCALE;
                }
            }
        }
        
        vec2 newCoord = fragCoord + totalOffset * uResolution;
        vec4 originalColor = image.eval(newCoord);
        
        float shadowFactor = 1.0 - clamp(totalShadow, 0.0, SHADOW_MAX_FACTOR);
        originalColor.rgb *= shadowFactor;
        
        return originalColor;
    }
`;