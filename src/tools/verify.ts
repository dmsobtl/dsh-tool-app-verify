import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AppSession } from '../session.js'
import { resolveLocator } from '../utils/selectors.js'

export const verifyTool = (session: AppSession) => defineTool({
  name: 'app_verify',
  description: 'Assert element state: exists, visible, hidden, has specific text, or attribute value. Returns pass/fail with details.',
  parameters: {
    selector: { type: 'string', required: true, description: 'Element selector' },
    assertion: {
      type: 'string',
      required: true,
      enum: ['exists', 'visible', 'hidden', 'text_equals', 'text_contains', 'attribute'] as const,
      description: 'What to assert',
    },
    expected: { type: 'string', description: 'Expected value (for text_equals, text_contains, attribute assertions)' },
    attribute: { type: 'string', description: 'Attribute name (for attribute assertion)' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  },
  async execute(args) {
    const page = await session.getPage()
    const locator = resolveLocator(page, args.selector)

    let result: Record<string, unknown>
    try {
      switch (args.assertion) {
        case 'exists': {
          const count = await locator.count()
          result = { pass: count > 0, assertion: 'exists', selector: args.selector, actual: `${count} element(s) found` }
          break
        }
        case 'visible': {
          const visible = await locator.first().isVisible()
          result = { pass: visible, assertion: 'visible', selector: args.selector }
          break
        }
        case 'hidden': {
          const visible = await locator.first().isVisible()
          result = { pass: !visible, assertion: 'hidden', selector: args.selector }
          break
        }
        case 'text_equals': {
          const actual = (await locator.first().textContent()) ?? ''
          result = { pass: actual.trim() === (args.expected ?? ''), assertion: 'text_equals', selector: args.selector, expected: args.expected ?? '', actual: actual.trim() }
          break
        }
        case 'text_contains': {
          const actual = (await locator.first().textContent()) ?? ''
          result = { pass: actual.includes(args.expected ?? ''), assertion: 'text_contains', selector: args.selector, expected: args.expected ?? '', actual: actual.trim().slice(0, 200) }
          break
        }
        case 'attribute': {
          if (!args.attribute) {
            result = { pass: false, error: 'attribute name required' }
          } else {
            const actual = (await locator.first().getAttribute(args.attribute)) ?? ''
            result = { pass: actual === (args.expected ?? ''), assertion: 'attribute', selector: args.selector, attribute: args.attribute, expected: args.expected ?? '', actual }
          }
          break
        }
        default:
          result = { pass: false, error: `Unknown assertion: ${args.assertion}` }
      }
    } catch (err) {
      result = { pass: false, error: (err as Error).message, selector: args.selector, assertion: args.assertion }
    }

    return JSON.parse(JSON.stringify(result))
  },
})
