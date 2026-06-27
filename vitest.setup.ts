import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Vitest doesn't enable test.globals by default, so React Testing Library's
// automatic afterEach cleanup doesn't register itself — do it explicitly.
afterEach(() => {
  cleanup()
})
