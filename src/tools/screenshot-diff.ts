import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AttachmentStore, ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { AppSession } from '../session.js'
import { diffImages } from '../utils/image-diff.js'

interface ScreenshotDiffValue {
  pass: boolean
  matchPercent?: number
  diffPixelCount?: number
  totalPixels?: number
  threshold?: number
  attachment?: ImageAttachmentRef
  error?: string
}

export const screenshotDiffTool = (session: AppSession, baselinePath: string, threshold: number, attachments: AttachmentStore) => defineTool({
  name: 'app_screenshot_diff',
  description: 'Compare current page screenshot against a saved baseline. Returns match percentage and a highlighted diff image.',
  parameters: {
    baseline: { type: 'string', required: true, description: 'Baseline name (as used in app_screenshot saveAs) or absolute path to PNG file' },
    fullPage: { type: 'boolean', description: 'Capture full scrollable page' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => {
      const v = value as unknown as ScreenshotDiffValue
      if (v.error !== undefined || v.attachment === undefined) {
        return [{ type: 'text', text: JSON.stringify(v, null, 2) }]
      }
      const { attachment, ...summary } = v
      return [
        { type: 'text', text: JSON.stringify(summary, null, 2) },
        { type: 'image', attachment },
      ]
    },
  },
  async execute(args) {
    const page = await session.getPage()
    const currentBuf = (await page.screenshot({ type: 'png', fullPage: args.fullPage ?? false })) as Buffer

    let baselineBuf: Buffer
    try {
      const baselineFile = args.baseline.endsWith('.png')
        ? resolve(args.baseline)
        : resolve(process.cwd(), baselinePath, `${args.baseline}.png`)
      baselineBuf = await readFile(baselineFile)
    } catch {
      return JSON.parse(JSON.stringify({ pass: false, error: `Baseline "${args.baseline}" not found. Use app_screenshot with saveAs first.` }))
    }

    try {
      const result = diffImages(currentBuf, baselineBuf, threshold)
      const attachment = await attachments.saveImage({
        data: result.diffImage,
        mediaType: 'image/png',
        name: `diff-${args.baseline}`,
      })
      return JSON.parse(JSON.stringify({
        pass: result.matchPercent >= 99.0,
        matchPercent: result.matchPercent,
        diffPixelCount: result.diffPixelCount,
        totalPixels: result.totalPixels,
        threshold,
        attachment,
      }))
    } catch (err) {
      return JSON.parse(JSON.stringify({ pass: false, error: (err as Error).message }))
    }
  },
})
