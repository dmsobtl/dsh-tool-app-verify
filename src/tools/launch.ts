import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AppSession, LaunchOptions } from '../session.js'

export const launchTool = (session: AppSession, defaults: LaunchOptions, defaultMode?: 'browser' | 'electron') => defineTool({
  name: 'app_launch',
  description: 'Launch a browser (navigates to URL) or an Electron app (opens main.js). Only one session at a time; calling again closes the previous.',
  parameters: {
    target: { type: 'string', required: true, description: 'URL for browser mode, or path to main.js / app directory for Electron mode' },
    mode: { type: 'string', enum: ['browser', 'electron'] as const, description: 'Launch mode. Defaults to plugin config, then inferred from target.' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const mode = args.mode ?? defaultMode ?? (args.target.startsWith('http') ? 'browser' : 'electron')
    if (mode === 'browser') return session.launchBrowser(args.target, defaults)
    return session.launchElectron(args.target, defaults)
  },
})

export const closeTool = (session: AppSession) => defineTool({
  name: 'app_close',
  description: 'Close the current browser or Electron session and release resources.',
  parameters: {},
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute() {
    if (!session.isActive) return 'No active session.'
    await session.close()
    return 'Session closed.'
  },
})
