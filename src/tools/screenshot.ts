import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AttachmentStore, ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { AppSession } from '../session.js'

interface ScreenshotValue {
  attachment: ImageAttachmentRef
  size: number
  savedPath?: string
}

export const screenshotTool = (session: AppSession, baselinePath: string, attachments: AttachmentStore) => defineTool({
  name: 'app_screenshot',
  description: 'Take a screenshot of the current page. Optionally save as a named baseline for future comparison.',
  parameters: {
    saveAs: { type: 'string', description: 'Save as baseline with this name (e.g. "homepage"). Stored in the configured baselinePath.' },
    fullPage: { type: 'boolean', description: 'Capture full scrollable page instead of just viewport' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => {
      const v = value as unknown as ScreenshotValue
      return [
        { type: 'text', text: v.savedPath ? `Screenshot saved as baseline: ${v.savedPath}` : `Screenshot taken (${v.size} bytes)` },
        { type: 'image', attachment: v.attachment },
      ]
    },
  },
  async execute(args) {
    const page = await session.getPage()
    const buf = (await page.screenshot({ type: 'png', fullPage: args.fullPage ?? false })) as Buffer

    const attachment = await attachments.saveImage({
      data: buf,
      mediaType: 'image/png',
      ...(args.saveAs !== undefined ? { name: args.saveAs } : {}),
    })

    let savedPath: string | undefined
    if (args.saveAs) {
      const dir = resolve(process.cwd(), baselinePath)
      await mkdir(dir, { recursive: true })
      savedPath = resolve(dir, `${args.saveAs}.png`)
      await writeFile(savedPath, buf)
    }

    const value: ScreenshotValue = { attachment, size: buf.length, ...(savedPath !== undefined ? { savedPath } : {}) }
    return JSON.parse(JSON.stringify(value))
  },
})
