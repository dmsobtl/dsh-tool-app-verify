import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AppSession } from '../session.ts'
import { resolveLocator } from '../utils/selectors.ts'

export const typeTool = (session: AppSession) => defineTool({
  name: 'app_type',
  description: 'Type text into an element. Optionally clear the field first.',
  parameters: {
    selector: { type: 'string', required: true, description: 'Element selector' },
    text: { type: 'string', required: true, description: 'Text to type' },
    clear: { type: 'boolean', description: 'Clear existing content before typing' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const page = await session.getPage()
    const locator = resolveLocator(page, args.selector)
    if (args.clear) await locator.clear()
    await locator.fill(args.text)
    return `Typed "${args.text}" into ${args.selector}`
  },
})
