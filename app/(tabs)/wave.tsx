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
} from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { Dimensions, View, Text as RNText } from 'react-native';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WaveEffectImage = () => {
  const pretendardFonts = useFonts({
    Pretendard: [
      require('@/assets/fonts/Pretendard-Regular.otf'),
      require('@/assets/fonts/Pretendard-Medium.otf'),
      require('@/assets/fonts/Pretendard-Bold.otf'),
    ],
  });

  const image = useImage(require('../../assets/images/forest.png'));
  const time = useSharedValue(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      time.value = (Date.now() - startTime) / 1000;
      requestAnimationFrame(animate);
    };
    animate();
  }, [time]);

  const uniforms = useDerivedValue<Uniforms>(() => ({
    uTime: time.value,
    uResolution: [screenWidth, screenHeight],
  }));

  if (!pretendardFonts) return <View style={{ width: 100, height: 100, backgroundColor: '#f99' }} />;

  const font = matchFont({ fontFamily: 'Pretendard', fontWeight: '500', fontStyle: 'normal' }, pretendardFonts);

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
        <Group
          clip={canvasRect}
          layer={
            <Paint>
              <RuntimeShader source={wavePageFlipShader} uniforms={uniforms} />
            </Paint>
          }
        >
          <Image image={image} x={0} y={0} width={screenWidth} height={screenHeight} fit="cover" />
          <Text x={screenWidth / 2 - 50} y={screenHeight / 2} text="Forest Dreams" font={font} color="#222" />
          <Text x={screenWidth / 2 - 80} y={screenHeight / 2 + 50} text="with Wave Effect" font={font} color="#222" />
        </Group>
      </Canvas>
    </View>
  );
};

export default WaveEffectImage;
