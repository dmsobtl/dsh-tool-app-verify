import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { AppSession } from '../session.ts'
import { diffImages } from '../utils/image-diff.ts'

export const screenshotDiffTool = (session: AppSession, baselinePath: string, threshold: number) => ({
  name: 'app_screenshot_diff',
  description: 'Compare current page screenshot against a saved baseline. Returns match percentage and a highlighted diff image.',
  parameters: {
    type: 'object' as const,
    properties: {
      baseline: { type: 'string' as const, description: 'Baseline name (as used in app_screenshot saveAs) or absolute path to PNG file' },
      fullPage: { type: 'boolean' as const, description: 'Capture full scrollable page' },
    },
    required: ['baseline'] as const,
  },
  async execute(args: { baseline: string; fullPage?: boolean }) {
    const page = await session.getPage()
    const currentBuf = await page.screenshot({ type: 'png', fullPage: args.fullPage ?? false }) as Buffer

    let baselineBuf: Buffer
    try {
      const baselineFile = args.baseline.endsWith('.png')
        ? resolve(args.baseline)
        : resolve(process.cwd(), baselinePath, `${args.baseline}.png`)
      baselineBuf = await readFile(baselineFile)
    } catch {
      return [{ type: 'text' as const, text: JSON.stringify({ pass: false, error: `Baseline "${args.baseline}" not found. Use app_screenshot with saveAs first.` }) }]
    }

    try {
      const result = diffImages(currentBuf, baselineBuf, threshold)
      const pass = result.matchPercent >= 99.0

      return [
        { type: 'text' as const, text: JSON.stringify({
          pass,
          matchPercent: result.matchPercent,
          diffPixelCount: result.diffPixelCount,
          totalPixels: result.totalPixels,
          threshold,
        }) },
        { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/png' as const, data: result.diffImage.toString('base64') } },
      ]
    } catch (err: any) {
      return [{ type: 'text' as const, text: JSON.stringify({ pass: false, error: err.message }) }]
    }
  },
})
