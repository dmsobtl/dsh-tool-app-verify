/**
 * dsh-tool-app-verify: Browser & Electron UI operation and verification plugin.
 *
 * Provides action tools (launch, click, type, navigate) and assertion tools
 * (verify, screenshot, screenshot_diff, accessibility) powered by Playwright.
 */

import type { Context } from '@deepseek-ai/cordis'
import { AppSession } from './session.ts'
import { launchTool, closeTool } from './tools/launch.ts'
import { clickTool } from './tools/click.ts'
import { typeTool } from './tools/type.ts'
import { navigateTool } from './tools/navigate.ts'
import { verifyTool } from './tools/verify.ts'
import { screenshotTool } from './tools/screenshot.ts'
import { screenshotDiffTool } from './tools/screenshot-diff.ts'
import { accessibilityTool } from './tools/accessibility.ts'

export { AppSession } from './session.ts'
export { parseSelector, resolveLocator } from './utils/selectors.ts'
export { diffImages } from './utils/image-diff.ts'

export const name = 'tool-app-verify'
export const inject = ['tools']

export interface Config {
  mode?: 'browser' | 'electron'
  headless?: boolean
  timeout?: number
  baselinePath?: string
  diffThreshold?: number
  viewport?: { width: number; height: number }
}

export function apply(ctx: Context, config: Config) {
  const session = new AppSession()
  const defaults = {
    headless: config.headless ?? true,
    timeout: config.timeout ?? 30000,
    viewport: config.viewport ?? { width: 1280, height: 720 },
  }
  const baselinePath = config.baselinePath ?? '.app-verify/baselines'
  const diffThreshold = config.diffThreshold ?? 0.1

  ctx.effect(() => async () => { await session.close() })

  const tools = [
    launchTool(session, defaults),
    closeTool(session),
    clickTool(session),
    typeTool(session),
    navigateTool(session),
    verifyTool(session),
    screenshotTool(session),
    screenshotDiffTool(session, baselinePath, diffThreshold),
    accessibilityTool(session),
  ]

  for (const tool of tools) {
    ctx.tools.register(tool as any)
  }
}
