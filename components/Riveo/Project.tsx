import type { SkFont } from "@shopify/react-native-skia";
import {
  Canvas,
  Group,
  Image,
  Paint,
  Rect,
  rect,
  RoundedRect,
  RuntimeShader,
  Skia,
  Text,
  useImage,
} from '@shopify/react-native-skia';
import { Dimensions, PixelRatio } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { Trash } from './Icons';
import { Labels } from './Labels';
import { pageCurl } from './pageCurl';

const { width: wWidth } = Dimensions.get('window');
const pd = PixelRatio.get();
const height = 150;
const outer = Skia.XYWHRect(0, 0, wWidth, height);
const pad = 16;
const cornerRadius = 16;

const inner = Skia.RRectXY(Skia.XYWHRect(pad, pad, wWidth - pad * 2, height - pad * 2), cornerRadius, cornerRadius);
const labelHeight = 25;

export interface Project {
  id: string;
  title: string;
  size: string;
  duration: string;
  picture: number;
  color: string;
}

interface ProjectProps {
  project: Project;
  font: SkFont;
  smallFont: SkFont;
}

const DURATION = 450;

export const Project = ({ font, smallFont, project: { picture, title, color, size, duration } }: ProjectProps) => {
  const image = useImage(picture);
  const origin = useSharedValue(outer.width);
  const pointer = useSharedValue(outer.width);

  const gesture = Gesture.Pan()
    .onStart(e => {
      origin.value = e.x;
    })
    .onChange(e => {
      pointer.value = e.x;
    })
    .onEnd(e => {
      pointer.value = withTiming(outer.width, {
        duration: DURATION,
        easing: Easing.inOut(Easing.ease),
      });
      origin.value = withTiming(outer.width, {
        duration: DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    });

  const uniforms = useDerivedValue(() => {
    return {
      pointer: pointer.value * pd,
      origin: origin.value * pd,
      resolution: [outer.width * pd, outer.height * pd],
      container: [inner.rect.x, inner.rect.y, inner.rect.x + inner.rect.width, inner.rect.y + inner.rect.height].map(
        v => v * pd
      ),
      cornerRadius: cornerRadius * pd,
    };
  });

  if (!image) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Canvas
        style={{
          width: outer.width,
          height: outer.height,
        }}
      >
        <RoundedRect rect={inner} color="red" />
        <Group transform={[{ translateX: 310 }, { translateY: (150 - 24 * 1.5) / 2 }, { scale: 1.5 }]}>
          <Trash />
        </Group>
        <Group transform={[{ scale: 1 / pd }]}>
          <Group
            clip={inner}
            transform={[{ scale: pd }]}
            layer={
              <Paint>
                <RuntimeShader source={pageCurl} uniforms={uniforms} />
              </Paint>
            }
          >
            <Image image={image} rect={inner.rect} fit="cover" />
            <Rect
              rect={rect(inner.rect.x, inner.rect.y + inner.rect.height - labelHeight, inner.rect.width, labelHeight)}
              color={color}
            />
            <Labels size={size} font={smallFont} duration={duration} />
            <Text x={32} y={height - 50} text={title} color="white" font={font} />
          </Group>
        </Group>
      </Canvas>
    </GestureDetector>
  );
};
