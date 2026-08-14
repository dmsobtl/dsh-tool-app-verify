import type { AppSession } from '../session.ts'
import { resolveLocator } from '../utils/selectors.ts'

export const verifyTool = (session: AppSession) => ({
  name: 'app_verify',
  description: 'Assert element state: exists, visible, hidden, has specific text, or attribute value. Returns pass/fail with details.',
  parameters: {
    type: 'object' as const,
    properties: {
      selector: { type: 'string' as const, description: 'Element selector' },
      assertion: {
        type: 'string' as const,
        enum: ['exists', 'visible', 'hidden', 'text_equals', 'text_contains', 'attribute'] as const,
        description: 'What to assert',
      },
      expected: { type: 'string' as const, description: 'Expected value (for text_equals, text_contains, attribute assertions)' },
      attribute: { type: 'string' as const, description: 'Attribute name (for attribute assertion)' },
    },
    required: ['selector', 'assertion'] as const,
  },
  async execute(args: { selector: string; assertion: string; expected?: string; attribute?: string }) {
    const page = await session.getPage()
    const locator = resolveLocator(page, args.selector)

    try {
      switch (args.assertion) {
        case 'exists': {
          const count = await locator.count()
          const pass = count > 0
          return [{ type: 'text' as const, text: JSON.stringify({ pass, assertion: 'exists', selector: args.selector, actual: `${count} element(s) found` }) }]
        }
        case 'visible': {
          const visible = await locator.first().isVisible()
          return [{ type: 'text' as const, text: JSON.stringify({ pass: visible, assertion: 'visible', selector: args.selector }) }]
        }
        case 'hidden': {
          const visible = await locator.first().isVisible()
          return [{ type: 'text' as const, text: JSON.stringify({ pass: !visible, assertion: 'hidden', selector: args.selector }) }]
        }
        case 'text_equals': {
          const actual = await locator.first().textContent() ?? ''
          const pass = actual.trim() === (args.expected ?? '')
          return [{ type: 'text' as const, text: JSON.stringify({ pass, assertion: 'text_equals', selector: args.selector, expected: args.expected, actual: actual.trim() }) }]
        }
        case 'text_contains': {
          const actual = await locator.first().textContent() ?? ''
          const pass = actual.includes(args.expected ?? '')
          return [{ type: 'text' as const, text: JSON.stringify({ pass, assertion: 'text_contains', selector: args.selector, expected: args.expected, actual: actual.trim().slice(0, 200) }) }]
        }
        case 'attribute': {
          if (!args.attribute) return [{ type: 'text' as const, text: JSON.stringify({ pass: false, error: 'attribute name required' }) }]
          const actual = await locator.first().getAttribute(args.attribute) ?? ''
          const pass = actual === (args.expected ?? '')
          return [{ type: 'text' as const, text: JSON.stringify({ pass, assertion: 'attribute', selector: args.selector, attribute: args.attribute, expected: args.expected, actual }) }]
        }
        default:
          return [{ type: 'text' as const, text: JSON.stringify({ pass: false, error: `Unknown assertion: ${args.assertion}` }) }]
      }
    } catch (err: any) {
      return [{ type: 'text' as const, text: JSON.stringify({ pass: false, error: err.message, selector: args.selector, assertion: args.assertion }) }]
    }
  },
})
