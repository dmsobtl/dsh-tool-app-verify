import type { AppSession } from '../session.ts'
import { resolveLocator } from '../utils/selectors.ts'

export const clickTool = (session: AppSession) => ({
  name: 'app_click',
  description: 'Click an element. Selector formats: "role:button[name=\\"Submit\\"]", "text:Click me", "testid:my-btn", "#css-selector", "//xpath".',
  parameters: {
    type: 'object' as const,
    properties: {
      selector: { type: 'string' as const, required: true as const, description: 'Element selector' },
      double: { type: 'boolean' as const, description: 'Double-click instead of single click' },
    },
    required: ['selector'] as const,
  },
  async execute(args: { selector: string; double?: boolean }) {
    const page = await session.getPage()
    const locator = resolveLocator(page, args.selector)
    if (args.double) {
      await locator.dblclick()
    } else {
      await locator.click()
    }
    return [{ type: 'text' as const, text: `Clicked: ${args.selector}` }]
  },
})
