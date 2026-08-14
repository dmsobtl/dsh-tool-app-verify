import type { Browser, BrowserContext, ElectronApplication, Page } from 'playwright'

export interface LaunchOptions {
  headless?: boolean
  timeout?: number
  viewport?: { width: number; height: number }
}

export type AppMode = 'browser' | 'electron'

export class AppSession {
  private browser: Browser | null = null
  private electronApp: ElectronApplication | null = null
  private context: BrowserContext | null = null
  private _page: Page | null = null
  private _mode: AppMode | null = null

  get mode(): AppMode | null { return this._mode }
  get isActive(): boolean { return this._page !== null }

  async launchBrowser(url: string, options: LaunchOptions = {}): Promise<string> {
    if (this.isActive) await this.close()

    const { chromium } = await import('playwright')
    this.browser = await chromium.launch({
      headless: options.headless ?? true,
    })
    this.context = await this.browser.newContext({
      viewport: options.viewport ?? { width: 1280, height: 720 },
    })
    this._page = await this.context.newPage()
    this._page.setDefaultTimeout(options.timeout ?? 30000)
    await this._page.goto(url, { waitUntil: 'domcontentloaded' })
    this._mode = 'browser'

    return `Browser launched: ${url} (${options.viewport?.width ?? 1280}x${options.viewport?.height ?? 720})`
  }

  async launchElectron(appPath: string, options: LaunchOptions = {}): Promise<string> {
    if (this.isActive) await this.close()

    const { _electron: electron } = await import('playwright')
    this.electronApp = await electron.launch({
      args: [appPath],
      timeout: options.timeout ?? 30000,
    })
    this._page = await this.electronApp.firstWindow()
    this._page.setDefaultTimeout(options.timeout ?? 30000)
    if (options.viewport) {
      await this._page.setViewportSize(options.viewport)
    }
    this._mode = 'electron'

    return `Electron app launched: ${appPath}`
  }

  async getPage(): Promise<Page> {
    if (!this._page) throw new Error('No active session. Call app_launch first.')
    return this._page
  }

  async screenshot(): Promise<Buffer> {
    const page = await this.getPage()
    return await page.screenshot({ type: 'png' }) as Buffer
  }

  async close(): Promise<void> {
    if (this.electronApp) {
      await this.electronApp.close()
      this.electronApp = null
    }
    if (this.context) {
      await this.context.close()
      this.context = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
    this._page = null
    this._mode = null
  }
}
