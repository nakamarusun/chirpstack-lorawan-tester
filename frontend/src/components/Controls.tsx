import React from 'react'

export default function Controls() {
  return (
    <div>
      <h1
        className='text-4xl mb-4 font-orbitron font-black w-1/3 rl'
        style={{
          writingMode: 'sideways-lr',
        }}
        >
        ChirpyRF
      </h1>
      <p>
        Frequency
      </p>
      <p>
        SF
      </p>
      <p>
        TX Power
      </p>
      <p>
        Reset Keys
      </p>
      <p>
        Send
      </p>
      <p>
        Payload Size
      </p>
    </div>
  )
}
