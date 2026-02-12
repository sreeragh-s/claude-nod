import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  screen,
  nativeImage,
  globalShortcut
} from 'electron'
import { join } from 'path'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function getIconSvg(): string {
  const iconPath = join(__dirname, '../../resources/icon.svg')
  return readFileSync(iconPath, 'utf-8')
}

const PORT = 19191

type OverlayPosition =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right'

const POSITION_LABELS: Record<OverlayPosition, string> = {
  'top-left': 'Top Left',
  top: 'Top',
  'top-right': 'Top Right',
  left: 'Left',
  right: 'Right',
  'bottom-left': 'Bottom Left',
  bottom: 'Bottom',
  'bottom-right': 'Bottom Right'
}

const WIN_WIDTH = 440
const WIN_HEIGHT = 520
const EDGE_PADDING = 20

interface Settings {
  overlayPosition: OverlayPosition
}

function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function loadSettings(): Settings {
  try {
    const raw = readFileSync(getSettingsPath(), 'utf-8')
    return { overlayPosition: 'top', ...JSON.parse(raw) }
  } catch {
    return { overlayPosition: 'top' }
  }
}

function saveSettings(settings: Settings): void {
  try {
    mkdirSync(app.getPath('userData'), { recursive: true })
    writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2))
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

let settings: Settings = { overlayPosition: 'top' }

function calcWindowPosition(position: OverlayPosition): { x: number; y: number } {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  const centerX = Math.round(sw / 2 - WIN_WIDTH / 2)
  const centerY = Math.round(sh / 2 - WIN_HEIGHT / 2)

  switch (position) {
    case 'top-left':
      return { x: EDGE_PADDING, y: EDGE_PADDING }
    case 'top':
      return { x: centerX, y: EDGE_PADDING }
    case 'top-right':
      return { x: sw - WIN_WIDTH - EDGE_PADDING, y: EDGE_PADDING }
    case 'left':
      return { x: EDGE_PADDING, y: centerY }
    case 'right':
      return { x: sw - WIN_WIDTH - EDGE_PADDING, y: centerY }
    case 'bottom-left':
      return { x: EDGE_PADDING, y: sh - WIN_HEIGHT - EDGE_PADDING }
    case 'bottom':
      return { x: centerX, y: sh - WIN_HEIGHT - EDGE_PADDING }
    case 'bottom-right':
      return { x: sw - WIN_WIDTH - EDGE_PADDING, y: sh - WIN_HEIGHT - EDGE_PADDING }
  }
}

function applyWindowPosition(): void {
  if (!mainWindow) return
  const { x, y } = calcWindowPosition(settings.overlayPosition)
  mainWindow.setPosition(x, y)
}

interface PermissionRequest {
  tool_name: string
  tool_input: Record<string, unknown>
  permission_suggestions?: string[]
}

interface QueuedRequest {
  data: PermissionRequest
  resolve: (decision: { behavior: string; message?: string }) => void
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
const permissionQueue: QueuedRequest[] = []
let currentRequest: QueuedRequest | null = null

function forceQuit(): void {
  globalShortcut.unregisterAll()
  if (mainWindow) {
    mainWindow.destroy()
    mainWindow = null
  }
  if (tray) {
    tray.destroy()
    tray = null
  }
  app.exit(0)
}

function createWindow(): void {
  const { x, y } = calcWindowPosition(settings.overlayPosition)

  mainWindow = new BrowserWindow({
    width: WIN_WIDTH,
    height: WIN_HEIGHT,
    x,
    y,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    hasShadow: false,
    roundedCorners: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  mainWindow.setAlwaysOnTop(true, 'floating', 1)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('blur', () => {
    // Keep window visible when there's an active request
  })
}

function buildPositionSubmenu(): Electron.MenuItemConstructorOptions[] {
  return (Object.keys(POSITION_LABELS) as OverlayPosition[]).map((pos) => ({
    label: POSITION_LABELS[pos],
    type: 'radio' as const,
    checked: settings.overlayPosition === pos,
    click: (): void => {
      settings.overlayPosition = pos
      saveSettings(settings)
      applyWindowPosition()
      updateTrayMenu()
    }
  }))
}

function buildTrayTemplate(): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: 'Position',
      submenu: buildPositionSubmenu()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: (): void => {
        forceQuit()
      }
    }
  ]
}

async function svgToNativeImage(svg: string, size: number): Promise<Electron.NativeImage> {
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  const js = `
    new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = ${size}; c.height = ${size};
        c.getContext('2d').drawImage(img, 0, 0, ${size}, ${size});
        resolve(c.toDataURL('image/png'));
      };
      img.src = '${dataUrl}';
    })
  `
  const pngDataUrl = await mainWindow!.webContents.executeJavaScript(js)
  return nativeImage.createFromDataURL(pngDataUrl)
}

async function createTray(): Promise<void> {
  const trayIcon = await svgToNativeImage(getIconSvg(), 36)
  const resized = trayIcon.resize({ width: 18, height: 18 })
  tray = new Tray(resized)
  tray.setToolTip('claude-nod')
  tray.setContextMenu(Menu.buildFromTemplate(buildTrayTemplate()))
}

function updateTrayMenu(): void {
  if (!tray) return
  tray.setContextMenu(Menu.buildFromTemplate(buildTrayTemplate()))
}

function showPermission(request: QueuedRequest): void {
  currentRequest = request
  if (!mainWindow) return

  mainWindow.webContents.send('permission-request', {
    tool_name: request.data.tool_name,
    tool_input: request.data.tool_input,
    permission_suggestions: request.data.permission_suggestions,
    queueCount: permissionQueue.length
  })

  mainWindow.show()
  mainWindow.focus()
  updateTrayMenu()
}

function processQueue(): void {
  if (currentRequest) return
  if (permissionQueue.length === 0) {
    if (mainWindow) mainWindow.hide()
    updateTrayMenu()
    return
  }

  const next = permissionQueue.shift()!
  showPermission(next)
}

function startHttpServer(): void {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', pending: permissionQueue.length }))
      return
    }

    if (req.method === 'POST' && req.url === '/permission') {
      let body = ''
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })

      req.on('end', () => {
        try {
          const data: PermissionRequest = JSON.parse(body)

          if (!data.tool_name) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Missing tool_name' }))
            return
          }

          const queued: QueuedRequest = {
            data,
            resolve: (decision): void => {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(decision))
            }
          }

          permissionQueue.push(queued)
          processQueue()
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  })

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Permission server listening on http://127.0.0.1:${PORT}`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Is another instance running?`)
      app.quit()
    }
  })
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.claude.permission-overlay')

  // Hide dock icon on macOS — runs as a background agent
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide()
  }

  settings = loadSettings()

  createWindow()

  // Wait for renderer to be ready before converting SVG → PNG for the tray icon
  mainWindow!.webContents.on('did-finish-load', async () => {
    await createTray()
  })

  startHttpServer()

  // Global shortcuts for allow/deny
  globalShortcut.register('CommandOrControl+Return', () => {
    if (currentRequest && mainWindow?.isVisible()) {
      mainWindow.webContents.send('global-shortcut', 'allow')
    }
  })
  globalShortcut.register('CommandOrControl+Escape', () => {
    if (currentRequest && mainWindow?.isVisible()) {
      mainWindow.webContents.send('global-shortcut', 'deny')
    }
  })

  // Handle permission responses from renderer
  ipcMain.on('permission-response', (_event, decision: { behavior: string; message?: string }) => {
    if (currentRequest) {
      currentRequest.resolve(decision)
      currentRequest = null
      processQueue()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
