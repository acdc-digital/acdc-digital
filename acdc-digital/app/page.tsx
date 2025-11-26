// Home
// /Users/matthewsimon/Projects/acdc-digital/home/app/page.tsx

'use client'

import { Rubik } from 'next/font/google'

const rubik = Rubik({ subsets: ['latin'] })

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className={`text-9xl font-bold text-foreground ${rubik.className}`}>
        acdc.digital
      </h1>
      <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
        Welcome to ACDC Digital&apos;s Home - where innovation meets excellence.
      </p>
    </div>
  )
}

