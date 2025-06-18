import React, { useState } from 'react'

export default function Terminal() {
  const [canUseSerial] = useState(() => "serial" in navigator);

  if (!canUseSerial) {
    return (
      <div className="text-red-500 font-source-code-pro text-lg">
        Browser tidak mendukung Web Serial API. Silahkan gunakan browser yang mendukung seperti Google Chrome atau Microsoft Edge.
      </div>
    );
  }

  return (
    <div className="text-red-500 font-source-code-pro text-lg">Terminal</div>
  )
}
