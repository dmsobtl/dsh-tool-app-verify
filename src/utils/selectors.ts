import type { Locator, Page } from 'playwright'

export type SelectorKind = 'role' | 'text' | 'css' | 'xpath' | 'testid'

export interface ParsedSelector {
  kind: SelectorKind
  value: string
  options?: { name?: string }
}

export function parseSelector(input: string): ParsedSelector {
  if (input.startsWith('role:')) {
    const raw = input.slice(5)
    const match = raw.match(/^(\w+)\[name="(.+)"\]$/)
    if (match) return { kind: 'role', value: match[1], options: { name: match[2] } }
    return { kind: 'role', value: raw }
  }
  if (input.startsWith('text:')) {
    return { kind: 'text', value: input.slice(5) }
  }
  if (input.startsWith('testid:')) {
    return { kind: 'testid', value: input.slice(7) }
  }
  if (input.startsWith('//') || input.startsWith('xpath:')) {
    const value = input.startsWith('xpath:') ? input.slice(6) : input
    return { kind: 'xpath', value }
  }
  return { kind: 'css', value: input }
}

export function resolveLocator(page: Page, selector: string): Locator {
  const parsed = parseSelector(selector)
  switch (parsed.kind) {
    case 'role':
      return page.getByRole(parsed.value as any, parsed.options?.name ? { name: parsed.options.name } : undefined)
    case 'text':
      return page.getByText(parsed.value)
    case 'testid':
      return page.getByTestId(parsed.value)
    case 'xpath':
      return page.locator(`xpath=${parsed.value}`)
    case 'css':
      return page.locator(parsed.value)
  }
}
