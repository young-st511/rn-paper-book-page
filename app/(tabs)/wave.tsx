import { wavePageFlipShader } from '@/libs/Wave/glsl/wavePageShader';
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

  useEffect(() => {
    time.value = withRepeat(
      withTiming(Math.PI * 12, {
        duration: 60000,
        easing: Easing.bezier(0.63, 0.42, 0.39, 0.64),
      }),
      -1, // 무한 반복
      false // reverse 없이
    );
  }, [time]);

  const uniforms = useDerivedValue<Uniforms>(() => ({
    uTime: time.value,
    uResolution: [screenWidth, screenHeight],
  }));

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
                <RuntimeShader source={wavePageFlipShader} uniforms={uniforms} />
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
