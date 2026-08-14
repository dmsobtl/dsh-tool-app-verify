import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AppSession } from '../session.ts'

export const accessibilityTool = (session: AppSession) => defineTool({
  name: 'app_accessibility',
  description: 'Get the accessibility tree snapshot of the current page. Returns a structured tree of roles, names, and values — useful for understanding page structure without screenshots.',
  parameters: {
    selector: { type: 'string', description: 'Optional: scope the tree to a specific element (CSS selector). Omit for full page.' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const page = await session.getPage()

    let root: unknown = undefined
    if (args.selector) {
      const el = await page.$(args.selector)
      if (!el) return `Element not found: ${args.selector}`
      root = el
    }

    const snapshot = await page.accessibility.snapshot({ root: root as never })
    if (!snapshot) return 'Accessibility tree is empty.'

    return formatAccessibilityNode(snapshot, 0)
  },
})

interface A11yNode {
  role: string
  name?: string
  value?: string | number
  checked?: boolean | 'mixed'
  disabled?: boolean
  children?: A11yNode[]
}

function formatAccessibilityNode(node: A11yNode, depth: number): string {
  const indent = '  '.repeat(depth)
  let line = `${indent}[${node.role}]`
  if (node.name) line += ` "${node.name}"`
  if (node.value !== undefined) line += ` value="${node.value}"`
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
