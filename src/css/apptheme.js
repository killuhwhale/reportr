let _apptheme = {
    "overrides": {
       "MuiContainer": {
          "root":{
             "background-color": "#212121"
          }
       },
       "MuiSelect": {
          "icon": {
             "color": "white"
          }
       },
       "MuiInputBase":{
          "root": {
 
          }
       },
       "PrivateTabIndicator":{
          "colorSecondary":
           {
             "backgroundColor": "#ec00d9"
          }
       },
       "MuiInput":{
          "underline":{
             '&:before': {
                borderBottomColor: "white"
            }
          }
       },
       "MuiBottomNavigation": {
          "root": {
             "zIndex": 100,
          }
       },
       "MuiBottomNavigationAction" :{
          root: {
             color: "white",
             '&$selected': {
                color: "#004a7b"
             }
          }
       },
       "MuiTableRow": {
          "hover": {
             "&$hover:hover": {
                backgroundColor: '#515151',
             }
          }
       }
    },
    "palette":{
       "common":{
          "black":"#000",
          "white":"#fff"
       },
       "appBackground":{
          "main": "black"
         },
       "background":{
          "paper":"#212121",
          "toolbar": "#333333",
          "tableHeader": "#2e3134",
          "default":"rgba(48, 48, 48, 1)"
       },
       "primary":{
          "main1":"#0072fff7",
          "main":"#4ec5ff",
          "mainGrad": 'linear-gradient(90deg,#0890fd,#01d3fe)',
          "contrastText":"rgba(255, 255, 255, 1)"
       },
       "secondary":{
          "light":"#14eac3",
          "main":"#14eac3",
          "dark":"#14eac3",
          "contrastText":"#fff"
       },
       "error":{
          "light":"#ea4331",
          "main":"red",
          "dark":"#2d0d0b",
          "contrastText":"rgba(255, 255, 255, 1)"
       },
       "text":{
          "primary":"#ffffff",
          "secondary":"#e0dfdf",
          "disabled":"#bdbdbd",
          "hint":"#afafaf"
       }
    }
 };
 
 export default _apptheme