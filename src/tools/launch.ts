import type { AppSession, LaunchOptions } from '../session.ts'

export const launchTool = (session: AppSession, defaults: LaunchOptions) => ({
  name: 'app_launch',
  description: 'Launch a browser (navigates to URL) or an Electron app (opens main.js). Only one session at a time; calling again closes the previous.',
  parameters: {
    type: 'object' as const,
    properties: {
      target: { type: 'string' as const, description: 'URL for browser mode, or path to main.js / app directory for Electron mode' },
      mode: { type: 'string' as const, enum: ['browser', 'electron'] as const, description: 'Launch mode. Defaults to plugin config.' },
    },
    required: ['target'] as const,
  },
  async execute(args: { target: string; mode?: 'browser' | 'electron' }) {
    const mode = args.mode ?? (args.target.startsWith('http') ? 'browser' : 'electron')
    if (mode === 'browser') {
      const msg = await session.launchBrowser(args.target, defaults)
      return [{ type: 'text' as const, text: msg }]
    } else {
      const msg = await session.launchElectron(args.target, defaults)
      return [{ type: 'text' as const, text: msg }]
    }
  },
})

export const closeTool = (session: AppSession) => ({
  name: 'app_close',
  description: 'Close the current browser or Electron session and release resources.',
  parameters: { type: 'object' as const, properties: {} },
  async execute() {
    if (!session.isActive) return [{ type: 'text' as const, text: 'No active session.' }]
    await session.close()
    return [{ type: 'text' as const, text: 'Session closed.' }]
  },
})
