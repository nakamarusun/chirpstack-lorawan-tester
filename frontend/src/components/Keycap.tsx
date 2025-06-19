import React from 'react'

// I want the props to inherit everything from the HTMLButtonElement
export default function Keycap(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <div className="bg-neutral-950 rounded-lg p-1">
      <div className="bg-stone-400 rounded-md p-2 pt-0.5 overflow-hidden">
        <button className="bg-stone-300 rounded-sm py-1 px-3 font-source-code-pro tracking-tighter text-lg font-semibold inset-shadow-[0px_3px_0px_rgba(255,255,255,1.0)]" {...props}>
          {props.children}
        </button>
      </div>
    </div>
  )
}
