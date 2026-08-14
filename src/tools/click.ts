import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AppSession } from '../session.ts'
import { resolveLocator } from '../utils/selectors.ts'

export const clickTool = (session: AppSession) => defineTool({
  name: 'app_click',
  description: 'Click an element. Selector formats: "role:button[name=\\"Submit\\"]", "text:Click me", "testid:my-btn", "#css-selector", "//xpath".',
  parameters: {
    selector: { type: 'string', required: true, description: 'Element selector' },
    double: { type: 'boolean', description: 'Double-click instead of single click' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const page = await session.getPage()
    const locator = resolveLocator(page, args.selector)
    if (args.double) await locator.dblclick()
    else await locator.click()
    return `Clicked: ${args.selector}`
  },
})
