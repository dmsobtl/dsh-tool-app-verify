import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AppSession } from '../session.js'

export const navigateTool = (session: AppSession) => defineTool({
  name: 'app_navigate',
  description: 'Navigate the page: go to a URL, go back, go forward, or reload.',
  parameters: {
    action: { type: 'string', required: true, enum: ['goto', 'back', 'forward', 'reload'] as const, description: 'Navigation action' },
    url: { type: 'string', description: 'URL (required for goto)' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const page = await session.getPage()
    switch (args.action) {
      case 'goto': {
        if (!args.url) return 'Error: url is required for goto'
        await page.goto(args.url, { waitUntil: 'domcontentloaded' })
        return `Navigated to: ${args.url}`
      }
      case 'back':
        await page.goBack()
        return `Navigated back. Current: ${page.url()}`
      case 'forward':
        await page.goForward()
        return `Navigated forward. Current: ${page.url()}`
      case 'reload':
        await page.reload()
        return `Reloaded. Current: ${page.url()}`
    }
  },
})
