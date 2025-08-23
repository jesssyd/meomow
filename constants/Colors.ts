const Palette = {
  darkbrown: 'rgb(61, 52, 45)',
  darkbrowninactive: 'rgba(61, 52, 45, 0.75)',
  medbrown: 'rgba(61, 52, 45, 0.25)',
  lightbrown: 'rgba(61, 52, 45, 0.1)',
  pink: 'rgb(251, 226, 208)',
  tan: 'rgb(253, 248, 228)',
  cream: 'rgb(255, 253, 245)',
  green: 'rgb(203, 223, 189)',
  navy: 'rgb(58, 64, 90)',
  navygrey: 'rgb(112, 118, 143)',
  darkorange: 'rgb(143, 54, 17)',
  lightorange: 'rgba(241, 156, 121, 0.5)',
};

export const Colors = {
  primary: {
    text: Palette.darkbrown,
    textInactive: Palette.darkbrowninactive,
    background: Palette.pink, // pink
    backgroundAlt: Palette.tan, // tan
    backgroundGreen: Palette.green, // green
    backgroundCream: Palette.cream,
    splash: 'rgb(48, 43, 38)', // not sure about this
  },
  personality: {
    unselected: {
      background: Palette.cream,
      border: Palette.lightbrown,
      text: Palette.darkbrowninactive,
    },
    selected: {
      background: Palette.lightorange,
      border: Palette.lightorange,
      text: Palette.darkorange,
    },
  },
  navigation: {
    background: Palette.cream,
    border: Palette.lightbrown,
  },
  button: {
    primary: Palette.navy,
    disabled: Palette.navygrey,
    primaryText: 'white',
  },
  card: {
    background: Palette.pink,
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    background: Palette.cream,
    border: Palette.lightbrown,
  }, 
  inputAlt: {
    background: Palette.lightbrown,
    border: Palette.medbrown,
  },
   error: {
    primary: Palette.darkorange,
  },
  black: '#000000',
  white: '#FFFFFF',
  
};