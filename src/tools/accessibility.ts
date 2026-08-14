import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AppSession } from '../session.js'

export const accessibilityTool = (session: AppSession) => defineTool({
  name: 'app_accessibility',
  description: 'Get the accessibility (ARIA) snapshot of the current page or a specific element. Returns the YAML ARIA tree — useful for understanding page structure without screenshots.',
  parameters: {
    selector: { type: 'string', description: 'Optional: scope the snapshot to a specific element (CSS selector). Omit for the full page.' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const page = await session.getPage()

    let snapshot: string
    if (args.selector) {
      const locator = page.locator(args.selector)
      if ((await locator.count()) === 0) return `Element not found: ${args.selector}`
      snapshot = await locator.first().ariaSnapshot()
    } else {
      snapshot = await page.ariaSnapshot()
    }

    return snapshot ?? 'Accessibility tree is empty.'
  },
})
