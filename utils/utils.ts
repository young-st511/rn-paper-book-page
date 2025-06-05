export const glsl = (strings: TemplateStringsArray): string => {
  return strings.reduce((acc, str) => acc + str, '');
};
