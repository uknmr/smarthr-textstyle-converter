import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import { createTheme, ThemeProvider as ShrThemeProvider } from 'smarthr-ui'
import App from './App'

const theme = createTheme()

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ShrThemeProvider theme={theme}>
        <App />
      </ShrThemeProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
