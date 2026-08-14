import type { AppSession } from '../session.ts'

export const navigateTool = (session: AppSession) => ({
  name: 'app_navigate',
  description: 'Navigate the page: go to a URL, go back, go forward, or reload.',
  parameters: {
    type: 'object' as const,
    properties: {
      action: { type: 'string' as const, enum: ['goto', 'back', 'forward', 'reload'] as const, description: 'Navigation action' },
      url: { type: 'string' as const, description: 'URL (required for goto)' },
    },
    required: ['action'] as const,
  },
  async execute(args: { action: 'goto' | 'back' | 'forward' | 'reload'; url?: string }) {
    const page = await session.getPage()
    switch (args.action) {
      case 'goto':
        if (!args.url) return [{ type: 'text' as const, text: 'Error: url is required for goto' }]
        await page.goto(args.url, { waitUntil: 'domcontentloaded' })
        return [{ type: 'text' as const, text: `Navigated to: ${args.url}` }]
      case 'back':
        await page.goBack()
        return [{ type: 'text' as const, text: `Navigated back. Current: ${page.url()}` }]
      case 'forward':
        await page.goForward()
        return [{ type: 'text' as const, text: `Navigated forward. Current: ${page.url()}` }]
      case 'reload':
        await page.reload()
        return [{ type: 'text' as const, text: `Reloaded. Current: ${page.url()}` }]
    }
  },
})
