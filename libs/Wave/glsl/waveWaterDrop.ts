import { frag } from '@/components/Riveo/ShaderLib';

export const waterDropShader = frag`
    uniform float uTime;
    uniform vec2 uResolution;
    uniform shader image;
    
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
    
    uniform float uDropActive0;
    uniform float uDropActive1;
    uniform float uDropActive2;
    uniform float uDropActive3;
    uniform float uDropActive4;

    half4 main(vec2 fragCoord) {
        vec2 uv = fragCoord / uResolution;
        vec2 totalOffset = vec2(0.0);
        
        float cycleTime = mod(uTime, 12.0 * 3.14159);
        
        // 물방울 데이터 배열 (GLSL에서는 동적 배열 대신 개별 변수 사용)
        vec2 centers[5];
        float startTimes[5];
        float actives[5];
        
        centers[0] = uDropCenter0; startTimes[0] = uDropStart0; actives[0] = uDropActive0;
        centers[1] = uDropCenter1; startTimes[1] = uDropStart1; actives[1] = uDropActive1;
        centers[2] = uDropCenter2; startTimes[2] = uDropStart2; actives[2] = uDropActive2;
        centers[3] = uDropCenter3; startTimes[3] = uDropStart3; actives[3] = uDropActive3;
        centers[4] = uDropCenter4; startTimes[4] = uDropStart4; actives[4] = uDropActive4;
        
        for(int i = 0; i < 5; i++) {
            // 비활성 물방울 스킵
            if(actives[i] < 0.5) continue;
            
            // 시작 시간 체크
            if(cycleTime < startTimes[i]) continue;
            
            // 물방울 생명주기 계산
            float dropAge = (cycleTime - startTimes[i]) / 4.0; // 4초 동안 지속
            if(dropAge > 1.0) continue;
            
            // ripple 계산
            float radius = dropAge * 0.6; // 최대 반지름
            float dist = distance(uv, centers[i]);
            
            if(dist < radius && radius > 0.01) {
                // 여러 개의 동심원 파문
                float wave1 = sin((dist - radius * 0.3) * 25.0);
                float wave2 = sin((dist - radius * 0.6) * 15.0) * 0.5;
                float wave = wave1 + wave2;
                
                float fade = exp(-dist * 3.0) * (1.0 - dropAge) * 0.8;
                float ripple = wave * fade;
                
                vec2 direction = normalize(uv - centers[i]);
                if(dist > 0.001) {
                    totalOffset += direction * ripple * 0.015;
                }
            }
        }
        
        vec2 newCoord = fragCoord + totalOffset * uResolution;
        return image.eval(newCoord);
    }
`;
