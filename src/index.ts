/**
 * dsh-tool-app-verify: Browser & Electron UI operation and verification plugin.
 *
 * Provides action tools (launch, click, type, navigate) and assertion tools
 * (verify, screenshot, screenshot_diff, accessibility) powered by Playwright.
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { AppSession } from './session.js'
import { launchTool, closeTool } from './tools/launch.js'
import { clickTool } from './tools/click.js'
import { typeTool } from './tools/type.js'
import { navigateTool } from './tools/navigate.js'
import { verifyTool } from './tools/verify.js'
import { screenshotTool } from './tools/screenshot.js'
import { screenshotDiffTool } from './tools/screenshot-diff.js'
import { accessibilityTool } from './tools/accessibility.js'

export { AppSession } from './session.js'
export { parseSelector, resolveLocator } from './utils/selectors.js'
export { diffImages } from './utils/image-diff.js'

export const name = 'tool-app-verify'
export const inject = ['tools', 'attachments']

export const Config = z.object({
  mode: z.union([z.const('browser'), z.const('electron')]).default('browser'),
  headless: z.boolean().default(true),
  timeout: z.number().default(30000),
  baselinePath: z.string().default('.app-verify/baselines'),
  diffThreshold: z.number().default(0.1),
  viewport: z.object({ width: z.number().default(1280), height: z.number().default(720) }).default({ width: 1280, height: 720 }),
})

interface ResolvedConfig {
  mode: 'browser' | 'electron'
  headless: boolean
  timeout: number
  baselinePath: string
  diffThreshold: number
  viewport: { width: number; height: number }
}

export function apply(ctx: Context, config: ResolvedConfig) {
  const session = new AppSession()
  const defaults = {
    headless: config.headless,
    timeout: config.timeout,
    viewport: config.viewport,
  }

  ctx.effect(() => async () => { await session.close() })

  const tools = [
    launchTool(session, defaults, config.mode),
    closeTool(session),
    clickTool(session),
    typeTool(session),
    navigateTool(session),
    verifyTool(session),
    screenshotTool(session, config.baselinePath, ctx.attachments),
    screenshotDiffTool(session, config.baselinePath, config.diffThreshold, ctx.attachments),
    accessibilityTool(session),
  ]

  for (const tool of tools) {
    ctx.tools.register(tool)
  }
}
