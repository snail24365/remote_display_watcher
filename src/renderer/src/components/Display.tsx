// src/App.tsx
import React, { useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { Socket } from 'socket.io-client'

const Display: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const socket = useRef<Socket>()

  useEffect(() => {
    socket.current = io('http://localhost:3001')

    socket.current.on('connect', () => {
      console.log('Connected to server')
    })

    socket.current.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [])

  return (
    <div>
      <video ref={videoRef} autoPlay></video>
    </div>
  )
}

export default Display
