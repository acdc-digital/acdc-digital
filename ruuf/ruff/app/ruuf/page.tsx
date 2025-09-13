// RUUF
// /Users/matthewsimon/Projects/ruff/ruff/app/ruuf/page.tsx

'use client'

import { Rubik } from 'next/font/google'

const rubik = Rubik({ subsets: ['latin'] })

export default function RuufPage() {
  return (
    <div className="p-8">
      <h1 className={`text-9xl font-bold text-gray-900 ${rubik.className}`}>
        acdc.digital
      </h1>
    </div>
  )
}

