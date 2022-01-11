const appTheme = (blkOrWhite, backgroundColor, primaryColor, secondaryColor, appBarColor, appBarBackgroundColor) => {
  return {
     overrides: {
        MuiContainer: {
           root: {
              backgroundcolor: backgroundColor
           }
        },
        MuiSelect: {
           icon: {
              color: blkOrWhite
           }
        },
        MuiInputBase: {
           root: {

           }
        },
        MuiAppBar: {
           colorPrimary: {
              color: appBarColor,
              backgroundColor: appBarBackgroundColor
           }
        },
        PrivateTabIndicator: {

           colorSecondary:
           {
              backgroundColor: appBarColor
           }
        },
        MuiTypography: {
           root: {
              color: blkOrWhite
           }
        },
        MuiInput: {
           underline: {
              '&:before': {
                 borderBottomColor: blkOrWhite,
                 color: blkOrWhite
              }
           }
        },
     },
     palette: {
        common: {
           black: "#000",
           white: "#fff"
        },
        background: {
           paper: backgroundColor,
           default: "rgba(48, 48, 48, 1)"
        },
        primary: {
           main: primaryColor,
           contrastText: "#000"
        },
        secondary: {
           light: "#14eac3",
           main: secondaryColor,
           dark: "#14eac3",
           contrastText: "#fff"
        },
        error: {
           light: "#ea4331",
           main: "red",
           dark: "#2d0d0b",
           contrastText: "rgba(255, 255, 255, 1)"
        },
        text: {
           primary: blkOrWhite,
           secondary: blkOrWhite,
           disabled: "#bdbdbd",
           hint: "#afafaf"
        }
     }
  }
}

export default appTheme