import type { AppSession } from '../session.ts'
import { resolveLocator } from '../utils/selectors.ts'

export const typeTool = (session: AppSession) => ({
  name: 'app_type',
  description: 'Type text into an element. Optionally clear the field first.',
  parameters: {
    type: 'object' as const,
    properties: {
      selector: { type: 'string' as const, description: 'Element selector' },
      text: { type: 'string' as const, description: 'Text to type' },
      clear: { type: 'boolean' as const, description: 'Clear existing content before typing' },
    },
    required: ['selector', 'text'] as const,
  },
  async execute(args: { selector: string; text: string; clear?: boolean }) {
    const page = await session.getPage()
    const locator = resolveLocator(page, args.selector)
    if (args.clear) await locator.clear()
    await locator.fill(args.text)
    return [{ type: 'text' as const, text: `Typed "${args.text}" into ${args.selector}` }]
  },
})
