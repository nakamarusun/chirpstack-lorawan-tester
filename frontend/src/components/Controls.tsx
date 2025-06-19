import React from 'react'
import useLoRaWAN from '../hooks/useLoRaWAN'

export default function Controls() {
  const lorawan = useLoRaWAN();
  return (
    <div className="p-4">
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
      <p>{lorawan.devEui}</p>
    </div>
  )
}
