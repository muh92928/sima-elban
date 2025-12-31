import { ImageResponse } from 'next/og'
import { join } from 'path'
import { readFileSync } from 'fs'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Generate the image
export default function Icon() {
  // Read the logo from public folder
  try {
      const logoPath = join(process.cwd(), 'public', 'logo_kemenhub.png')
      const logoData = readFileSync(logoPath)
      const base64Logo = `data:image/png;base64,${logoData.toString('base64')}`
    
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}
          >
            <img 
                src={base64Logo} 
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                }}
            />
          </div>
        ),
        {
          ...size,
        }
      )
  } catch (e) {
      // Fallback if file not found
      return new ImageResponse(
          (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: '#003399',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: 20,
                    fontWeight: 800
                }}
            >
                S
            </div>
          ),
          { ...size }
      )
  }
}
