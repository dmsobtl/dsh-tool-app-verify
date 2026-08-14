import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { AppSession } from '../session.ts'

export const screenshotTool = (session: AppSession) => ({
  name: 'app_screenshot',
  description: 'Take a screenshot of the current page. Optionally save as a named baseline for future comparison.',
  parameters: {
    type: 'object' as const,
    properties: {
      saveAs: { type: 'string' as const, description: 'Save as baseline with this name (e.g. "homepage"). Stored in the configured baselinePath.' },
      fullPage: { type: 'boolean' as const, description: 'Capture full scrollable page instead of just viewport' },
    },
  },
  baselinePath: '.app-verify/baselines',
  async execute(args: { saveAs?: string; fullPage?: boolean }) {
    const page = await session.getPage()
    const buf = await page.screenshot({ type: 'png', fullPage: args.fullPage ?? false }) as Buffer

    if (args.saveAs) {
      const dir = resolve(process.cwd(), screenshotTool(session).baselinePath)
      await mkdir(dir, { recursive: true })
      const filePath = resolve(dir, `${args.saveAs}.png`)
      await writeFile(filePath, buf)
      return [
        { type: 'text' as const, text: `Screenshot saved as baseline: ${filePath}` },
        { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/png' as const, data: buf.toString('base64') } },
      ]
    }

    return [
      { type: 'text' as const, text: `Screenshot taken (${buf.length} bytes)` },
      { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/png' as const, data: buf.toString('base64') } },
    ]
  },
})
