import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getTimeLabel } from '../timeLabel'

const NOW = new Date('2026-06-14T12:00:00.000Z')

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString()
}

function daysAgo(days: number): string {
  return hoursAgo(days * 24)
}

describe('getTimeLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "New" for timestamps less than 24h old', () => {
    expect(getTimeLabel(hoursAgo(1))).toBe('New')
    expect(getTimeLabel(hoursAgo(23))).toBe('New')
  })

  it('returns "1d ago" for timestamps between 24h and 48h old', () => {
    expect(getTimeLabel(hoursAgo(30))).toBe('1d ago')
  })

  it('returns "Xd ago" for timestamps under a week old', () => {
    expect(getTimeLabel(daysAgo(3))).toBe('3d ago')
  })

  it('returns "Xw ago" for timestamps under a month old', () => {
    expect(getTimeLabel(daysAgo(14))).toBe('2w ago')
  })

  it('returns "Xmo ago" for timestamps under a year old', () => {
    expect(getTimeLabel(daysAgo(60))).toBe('2mo ago')
  })

  it('returns "Xy ago" for timestamps a year or more old', () => {
    expect(getTimeLabel(daysAgo(400))).toBe('1y ago')
  })
})
