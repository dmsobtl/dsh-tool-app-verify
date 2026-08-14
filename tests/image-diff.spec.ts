import { describe, expect, it } from 'vitest'
import { PNG } from 'pngjs'
import { diffImages } from '../src/utils/image-diff.ts'

function createSolidPng(width: number, height: number, r: number, g: number, b: number): Buffer {
  const png = new PNG({ width, height })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2
      png.data[idx] = r
      png.data[idx + 1] = g
      png.data[idx + 2] = b
      png.data[idx + 3] = 255
    }
  }
  return PNG.sync.write(png)
}

describe('diffImages', () => {
  it('returns 100% match for identical images', () => {
    const img = createSolidPng(100, 100, 255, 0, 0)
    const result = diffImages(img, img)
    expect(result.matchPercent).toBe(100)
    expect(result.diffPixelCount).toBe(0)
    expect(result.totalPixels).toBe(10000)
  })

  it('detects difference between different images', () => {
    const red = createSolidPng(100, 100, 255, 0, 0)
    const blue = createSolidPng(100, 100, 0, 0, 255)
    const result = diffImages(red, blue)
    expect(result.matchPercent).toBeLessThan(100)
    expect(result.diffPixelCount).toBeGreaterThan(0)
  })

  it('returns a diff image buffer', () => {
    const red = createSolidPng(50, 50, 255, 0, 0)
    const green = createSolidPng(50, 50, 0, 255, 0)
    const result = diffImages(red, green)
    expect(result.diffImage).toBeInstanceOf(Buffer)
    expect(result.diffImage.length).toBeGreaterThan(0)
  })

  it('throws on dimension mismatch', () => {
    const small = createSolidPng(50, 50, 0, 0, 0)
    const large = createSolidPng(100, 100, 0, 0, 0)
    expect(() => diffImages(small, large)).toThrow('dimensions mismatch')
  })

  it('respects threshold parameter', () => {
    const img1 = createSolidPng(10, 10, 100, 100, 100)
    const img2 = createSolidPng(10, 10, 105, 100, 100)
    const strictResult = diffImages(img1, img2, 0.01)
    const lenientResult = diffImages(img1, img2, 0.5)
    expect(lenientResult.matchPercent).toBeGreaterThanOrEqual(strictResult.matchPercent)
  })
})
