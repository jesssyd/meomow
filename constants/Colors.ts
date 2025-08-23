const Palette = {
  darkbrown: 'rgb(61, 52, 45)',
  lightbrown: 'rgba(61, 52, 45, 0.2)',
  pink: 'rgb(251, 226, 208)',
  tan: 'rgb(253, 248, 228)',
  cream: 'rgb(255, 253, 245)',
  green: 'rgb(203, 223, 189)',
  navy: 'rgb(59, 64, 89)',
};

export const Colors = {
  primary: {
    text: Palette.darkbrown,
    background: Palette.pink, // pink
    backgroundAlt: Palette.tan, // tan
    backgroundGreen: Palette.green, // green
    backgroundCream: Palette.cream,
    splash: 'rgb(48, 43, 38)', // not sure about this
  },
  personality: {
    unselected: {
      background: 'rgb(255, 252, 245)',
      border: 'rgba(61, 51, 46, 0.25)',
      text: 'rgba(56, 48, 41, 0.75)',
    },
    selected: {
      background: 'rgba(242, 156, 120, 0.5)',
      border: 'rgba(242, 156, 120, 0.5)',
      text: 'rgb(143, 54, 18)',
    },
  },
  navigation: {
    background: Palette.cream,
    border: Palette.lightbrown,
  },
  button: {
    primary: Palette.navy,
    primaryText: 'white',
  },
  card: {
    background: Palette.pink,
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  black: '#000000',
  white: '#FFFFFF',
};