import type { AppSession } from '../session.ts'

export const accessibilityTool = (session: AppSession) => ({
  name: 'app_accessibility',
  description: 'Get the accessibility tree snapshot of the current page. Returns a structured tree of roles, names, and values — useful for understanding page structure without screenshots.',
  parameters: {
    type: 'object' as const,
    properties: {
      selector: { type: 'string' as const, description: 'Optional: scope the tree to a specific element (CSS selector). Omit for full page.' },
    },
  },
  async execute(args: { selector?: string }) {
    const page = await session.getPage()

    let root: any = undefined
    if (args.selector) {
      const el = await page.$(args.selector)
      if (!el) return [{ type: 'text' as const, text: `Element not found: ${args.selector}` }]
      root = el
    }

    const snapshot = await page.accessibility.snapshot({ root })
    if (!snapshot) return [{ type: 'text' as const, text: 'Accessibility tree is empty.' }]

    const formatted = formatAccessibilityNode(snapshot, 0)
    return [{ type: 'text' as const, text: formatted }]
  },
})

function formatAccessibilityNode(node: any, depth: number): string {
  const indent = '  '.repeat(depth)
  let line = `${indent}[${node.role}]`
  if (node.name) line += ` "${node.name}"`
  if (node.value) line += ` value="${node.value}"`
  if (node.checked !== undefined) line += ` checked=${node.checked}`
  if (node.disabled) line += ` disabled`

  const lines = [line]
  if (node.children) {
    for (const child of node.children) {
      lines.push(formatAccessibilityNode(child, depth + 1))
    }
  }
  return lines.join('\n')
}
