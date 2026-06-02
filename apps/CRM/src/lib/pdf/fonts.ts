import { Font } from '@react-pdf/renderer'

const FONT_BASE = 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-ext'

let fontsRegistered = false

export function registerFonts() {
  if (fontsRegistered) return
  fontsRegistered = true

  Font.register({
    family: 'Roboto',
    fonts: [
      {
        src: `${FONT_BASE}/400-normal.ttf`,
        fontWeight: 400,
      },
      {
        src: `${FONT_BASE}/700-normal.ttf`,
        fontWeight: 700,
      },
    ],
  })
}
