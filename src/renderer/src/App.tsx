import { ImageCapture } from 'image-capture'
import { useState } from 'react'
import { io } from 'socket.io-client'

function App(): JSX.Element {
  const [mode, setMode] = useState('')
  const [ip, setIP] = useState('')
  const [port, setPort] = useState('')
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)

  const handleModeChange = (event) => {
    setMode(event.target.value)
    if (event.target.value === 'server') {
      console.log(window.api, window.electron)

      window.api.onScreenSourceId((event, sourceId) => {
        startCapture(sourceId)
      })
    }
  }

  const startCapture = async (sourceId) => {
    const constraints: any = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId
        }
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    const video: any = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = () => video.play()
    const track = stream.getVideoTracks()[0]
    const imageCapture = new ImageCapture(track)
    setInterval(async () => {
      const bitmap = await imageCapture.grabFrame()
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx: any = canvas.getContext('2d')
      ctx.drawImage(bitmap, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      window.api.sendDesktopCapture(dataUrl)
    }, 100)
  }

  const connectToServer = () => {
    const socket = io(`http://${ip}:${port}`)
    socket.on('connect', () => {
      setConnected(true)
      setSocket(socket as any)
      socket.on('desktop-data', (data) => {
        const img = document.getElementById('desktop-image') as any
        img.src = data
      })
    })
  }

  return (
    <div>
      <h1>React Electron Screen Sharing</h1>
      <div>
        <label>
          <input
            type="radio"
            value="server"
            checked={mode === 'server'}
            onChange={handleModeChange}
          />
          Server Mode
        </label>
        <label>
          <input
            type="radio"
            value="client"
            checked={mode === 'client'}
            onChange={handleModeChange}
          />
          Client Mode
        </label>
      </div>
      {mode === 'client' && (
        <div>
          <input
            type="text"
            placeholder="Server IP"
            value={ip}
            onChange={(e) => setIP(e.target.value)}
          />
          <input
            type="text"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <button onClick={connectToServer}>Connect</button>
        </div>
      )}
      {connected && (
        <div>
          <img id="desktop-image" alt="Desktop" />
        </div>
      )}
      <video style={{ display: mode === 'server' ? 'block' : 'none' }}></video>
    </div>
  )
}

export default App
