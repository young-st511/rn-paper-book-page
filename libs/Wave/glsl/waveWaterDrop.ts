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
    
    half4 main(vec2 fragCoord) {
        vec2 uv = fragCoord / uResolution;
        vec2 totalOffset = vec2(0.0);
        float totalShadow = 0.0;
        
        float currentCycleTime = uTime; // 0~1 범위
        
        // 물방울 데이터 배열
        vec2 centers[5];
        float startTimes[5];
        float actives[5];
        
        centers[0] = uDropCenter0; startTimes[0] = uDropStart0;
        centers[1] = uDropCenter1; startTimes[1] = uDropStart1;
        centers[2] = uDropCenter2; startTimes[2] = uDropStart2;
        centers[3] = uDropCenter3; startTimes[3] = uDropStart3;
        centers[4] = uDropCenter4; startTimes[4] = uDropStart4;
        
        for(int i = 0; i < 5; i++) {
            // startTimes도 0~1 범위로 정규화 (uDropCycleTime → 1)
            float normalizedStartTime = startTimes[i] / uDropCycleTime;
            
            // 시작 시간 체크
            if(currentCycleTime < normalizedStartTime) continue;
            
            // 물방울 생명주기 계산
            float dropAge = (currentCycleTime - normalizedStartTime) / 0.5;
            if(dropAge > 1.0) continue;
            
            float radius = dropAge * 0.4 + 0.01; // 물방울 반지름 (0.01 ~ 0.41)
            float dist = distance(uv, centers[i]); // Drop 중심과 현재 픽셀 간 거리
            
            // 그림자 효과
            float shadowRadius = radius + 0.04;
            if(dist < shadowRadius && shadowRadius > 0.02) {
                float shadowIntensity = smoothstep(radius - 0.005, radius + 0.04, dist);
                float shadowFade = exp(-dist * 2.0) * (1.0 - dropAge) * 0.04;
                totalShadow += shadowFade * shadowIntensity;
            }
            
            // ripple 효과
            if(dist < radius && radius > 0.01) {
                float wave1 = sin((dist - radius * 0.3) * 25.0);
                float wave2 = sin((dist - radius * 0.6) * 15.0) * 0.5;
                float wave = wave1 + wave2;
                
                float fade = exp(-dist * 3.0) * (1.0 - dropAge) * 0.6;
                float ripple = wave * fade;
                
                vec2 direction = normalize(uv - centers[i]);
                if(dist > 0.001) {
                    totalOffset += direction * ripple * 0.02;
                }
            }
        }
        
        vec2 newCoord = fragCoord + totalOffset * uResolution;
        vec4 originalColor = image.eval(newCoord);
        
        float shadowFactor = 1.0 - clamp(totalShadow, 0.0, 0.06);
        originalColor.rgb *= shadowFactor;
        
        return originalColor;
    }
`;
