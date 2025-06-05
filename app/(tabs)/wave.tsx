import { wavePageFlipShader } from '@/libs/Wave/glsl/wavePageShader';
import { waterDropShader } from '@/libs/Wave/glsl/waveWaterDrop';
import {
  Canvas,
  Group,
  Image,
  RuntimeShader,
  Text,
  Uniforms,
  useImage,
  Paint,
  rect,
  useFonts,
  matchFont,
  BackdropBlur,
  Fill,
  Rect,
  LinearGradient,
  vec,
  Line,
} from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { Dimensions, View, Text as RNText } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WaveEffectImage = () => {
  const pretendardFonts = useFonts({
    Pretendard: [
      require('@/assets/fonts/Pretendard-Regular.otf'),
      require('@/assets/fonts/Pretendard-Medium.otf'),
      require('@/assets/fonts/Pretendard-Bold.otf'),
    ],
  });

  const image = useImage(require('../../assets/images/beach-floor.png'));
  const time = useSharedValue(0);

  const cycle = useSharedValue(0); // 사이클 카운터

  // 물방울 데이터를 cycle에 따라 생성
  const dropData = useDerivedValue(() => {
    const drops = [];
    for (let i = 0; i < 5; i++) {
      drops.push({
        center: [0.1 + Math.random() * 0.8, 0.1 + Math.random() * 0.8],
        startTime: Math.random() * 6.0, // 0~6초 사이 시작
        active: 1, // 100% 확률로 활성화
      });
    }
    return drops;
  }, [cycle.value]);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(Math.PI * 12, {
        duration: 60000,
        easing: Easing.bezier(0.63, 0.42, 0.39, 0.64),
      }),
      -1, // 무한 반복
      false // reverse 없이
    );

    setInterval(() => {
      cycle.value += 1; // 사이클 증가
    }, 5000); // 10초마다 사이클 증가
  }, [time]);

  const waveUniforms = useDerivedValue<Uniforms>(() => ({
    uTime: time.value,
    uResolution: [screenWidth, screenHeight],
  }));

  const dropUniforms = useDerivedValue<Uniforms>(() => {
    const data = dropData.value;
    return {
      uTime: time.value,
      uResolution: [screenWidth, screenHeight],

      // 5개 물방울 데이터
      uDropCenter0: data[0].center,
      uDropCenter1: data[1].center,
      uDropCenter2: data[2].center,
      uDropCenter3: data[3].center,
      uDropCenter4: data[4].center,

      uDropStart0: data[0].startTime,
      uDropStart1: data[1].startTime,
      uDropStart2: data[2].startTime,
      uDropStart3: data[3].startTime,
      uDropStart4: data[4].startTime,

      uDropActive0: data[0].active,
      uDropActive1: data[1].active,
      uDropActive2: data[2].active,
      uDropActive3: data[3].active,
      uDropActive4: data[4].active,
    };
  });

  if (!pretendardFonts) return <View style={{ width: 100, height: 100, backgroundColor: '#f99' }} />;

  const font = matchFont({ fontFamily: 'Pretendard', fontWeight: '500', fontSize: 40 }, pretendardFonts);

  if (!image || !wavePageFlipShader) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <RNText style={{ color: '#faa', fontSize: 100, padding: 60 }}>{'느허헉'}</RNText>
      </View>
    );
  }

  const canvasRect = rect(0, 0, screenWidth, screenHeight);

  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Group>
          <Group
            clip={canvasRect}
            layer={
              <Paint>
                <RuntimeShader source={wavePageFlipShader} uniforms={waveUniforms} />
              </Paint>
            }
          >
            <Group
              layer={
                <Paint>
                  <RuntimeShader source={waterDropShader} uniforms={dropUniforms} />
                </Paint>
              }
            >
              <Image
                image={image}
                x={0}
                y={0}
                width={screenWidth + image.width() / 3}
                height={screenHeight}
                fit="cover"
              />
              <Text x={screenWidth / 2 - 100} y={screenHeight / 2} text="안녕하세요" font={font} color="#222" />
              <Text
                x={screenWidth / 2 - 130}
                y={screenHeight / 2 + 50}
                text="여긴 물 속 입니다."
                font={font}
                color="#878"
              />
              {/* 테스트용 줄무늬 */}
              {/* {[...Array(25)].map((_, i) => (
                <Line
                  key={i}
                  p1={vec((i * screenWidth) / 24, 0)}
                  p2={vec((i * screenWidth) / 24, screenHeight)}
                  color={'#000'}
                  strokeWidth={12}
                />
              ))} */}
            </Group>
          </Group>
          <BackdropBlur blur={1.7}>
            <Fill color="rgba(125, 195, 255, 0.2)" />
          </BackdropBlur>
        </Group>
      </Canvas>
    </View>
  );
};

export default WaveEffectImage;
