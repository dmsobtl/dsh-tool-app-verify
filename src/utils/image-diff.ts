import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

export interface DiffResult {
  matchPercent: number
  diffPixelCount: number
  totalPixels: number
  diffImage: Buffer
}

export function diffImages(currentBuf: Buffer, baselineBuf: Buffer, threshold = 0.1): DiffResult {
  const current = PNG.sync.read(currentBuf)
  const baseline = PNG.sync.read(baselineBuf)

  if (current.width !== baseline.width || current.height !== baseline.height) {
    throw new Error(
      `Image dimensions mismatch: current ${current.width}x${current.height} vs baseline ${baseline.width}x${baseline.height}`
    )
  }

  const { width, height } = current
  const diff = new PNG({ width, height })
  const totalPixels = width * height

  const diffPixelCount = pixelmatch(
    current.data,
    baseline.data,
    diff.data,
    width,
    height,
    { threshold }
  )

  const matchPercent = Math.round((1 - diffPixelCount / totalPixels) * 10000) / 100

  return {
    matchPercent,
    diffPixelCount,
    totalPixels,
    diffImage: PNG.sync.write(diff),
  }
}
