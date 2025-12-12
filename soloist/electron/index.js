// electron/index.js

const { app, BrowserWindow, net, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Production renderer URL - UPDATE THIS TO YOUR VERCEL URL
const PRODUCTION_RENDERER_URL = 'https://soloist-app.acdc.digital'; // Your actual renderer URL

let nextServer = null;
let serverPort = 3002; // Default port for the renderer

// Start Next.js server in production
async function startNextServer() {
  if (isDev) {
    // In development, assume the server is already running
    return;
  }

  return new Promise((resolve, reject) => {
    // Path to the renderer directory in the packaged app
    const rendererPath = path.join(process.resourcesPath, 'app', 'renderer');
    
    // Start the Next.js server
    console.log('Starting Next.js server...');
    
    // Use npx to run next start
    nextServer = spawn('node', [
      path.join(rendererPath, 'node_modules', '.bin', 'next'),
      'start',
      '-p',
      serverPort.toString()
    ], {
      cwd: rendererPath,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'pipe'
    });

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('started server on')) {
        console.log('✅ Next.js server started successfully');
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    // Give the server some time to start
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

// Check if the renderer server is running on a specific port
function isRendererServerRunning(port, callback) {
  const request = net.request({
    method: 'HEAD',
    url: `http://localhost:${port}`
  });
  
  request.on('response', (response) => {
    callback(response.statusCode === 200);
  });
  
  request.on('error', () => {
    callback(false);
  });
  
  request.end();
}

async function createWindow() {
  // Determine the correct icon path based on platform
  let iconPath;
  if (process.platform === 'darwin') {
    // macOS - use ICNS format for window icon
    iconPath = path.join(__dirname, "build", "icon.icns");
  } else if (process.platform === 'win32') {
    // Windows uses ICO format
    iconPath = path.join(__dirname, "build", "icon.ico");
  } else {
    // Linux uses PNG format
    iconPath = path.join(__dirname, "build", "icon.png");
  }

  // Debug: Log the icon path and check if file exists
  console.log('🖼️ Icon path:', iconPath);
  console.log('🖼️ Icon exists:', fs.existsSync(iconPath));
  console.log('🖼️ Platform:', process.platform);
  console.log('🖼️ __dirname:', __dirname);

  const win = new BrowserWindow({
    width: 1260,
    height: 665,
    minWidth: 1260,
    minHeight: 665,
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    trafficLightPosition: process.platform === 'darwin' ? { x: 10, y: 10 } : undefined,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // Development mode: connect to the renderer dev server ONLY on port 3002
    // Port 3003 is for the demo which is embedded in the website
    const rendererPort = 3002;
    
    isRendererServerRunning(rendererPort, (isRunning) => {
      if (isRunning) {
        // Renderer found at the correct port
        win.loadURL(`http://localhost:${rendererPort}`);
        console.log(`✅ Loaded renderer from development server at http://localhost:${rendererPort}`);
      } else {
        // Renderer not running - show instructions
        console.error(`❌ Renderer not found on port ${rendererPort}`);
        console.log('💡 Make sure to start the renderer with: pnpm run dev:renderer');
        loadFallbackHTML(win);
      }
    });
  } else {
    // Production mode: load from deployed Vercel URL
    console.log(`Loading renderer from ${PRODUCTION_RENDERER_URL}`);
    win.loadURL(PRODUCTION_RENDERER_URL);
    
    // Handle loading errors
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load renderer:', errorDescription);
      loadFallbackHTML(win);
    });
    
    win.webContents.on('did-finish-load', () => {
      console.log('✅ Successfully loaded renderer from Vercel');
    });
  }
}

function loadFallbackHTML(win) {
  // Create a simple HTML file for testing
  const htmlPath = path.join(__dirname, "index.html");
  if (!fs.existsSync(htmlPath)) {
    fs.writeFileSync(htmlPath, `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Soloist. | Take control of tomorrow, today.</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              margin: 0; 
              padding: 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            h1 { margin-bottom: 20px; font-size: 2.5em; }
            p { margin-bottom: 15px; font-size: 1.1em; }
            code { 
              background: rgba(255,255,255,0.2); 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-family: 'Monaco', 'Menlo', monospace;
            }
            .warning {
              background: rgba(255,200,0,0.2);
              border: 2px solid rgba(255,200,0,0.5);
              padding: 20px;
              border-radius: 8px;
              margin: 20px auto;
              max-width: 600px;
            }
          </style>
        </head>
        <body>
          <h1>🎵 Soloist Pro</h1>
          <p>Welcome to Soloist Pro!</p>
          <div class="warning">
            <p><strong>⚠️ Renderer Not Found</strong></p>
            <p>The app renderer must be running on port 3002</p>
          </div>
          <p>Start the renderer with:</p>
          <p><code>pnpm run dev:renderer</code></p>
          <p>Or start the full development environment:</p>
          <p><code>pnpm dev</code></p>
          <hr style="margin: 30px auto; max-width: 400px; border: 1px solid rgba(255,255,255,0.3);">
          <p style="font-size: 0.9em; opacity: 0.8;">
            Note: Port 3003 is reserved for the demo (website iframe)<br>
            Port 3002 is for the main app renderer
          </p>
        </body>
      </html>
    `);
  }
  win.loadFile(htmlPath);
  console.log("⚠️ Loaded fallback HTML - renderer not found on port 3002");
}

// IPC handlers for window controls
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.minimize();
  }
});

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
});

// Handle in-app update requests
ipcMain.on('app-update', () => {
  const latestReleaseUrl = 'https://github.com/acdc-digital/acdc-digital/releases/latest';
  shell.openExternal(latestReleaseUrl);
});

// Provide app version to renderer synchronously
ipcMain.on('get-app-version', (event) => {
  event.returnValue = app.getVersion();
});

app.whenReady().then(() => {
  // Set dock icon explicitly for macOS - maintain 56x56 size for consistency
  if (process.platform === 'darwin') {
    const dockIconPath = path.join(__dirname, "dock-icon-padded56.png");
    if (fs.existsSync(dockIconPath)) {
      app.dock.setIcon(dockIconPath);
      console.log('🖼️ Dock icon set to:', dockIconPath);
    } else {
      console.log('❌ Dock icon file not found:', dockIconPath);
    }
  }

  createWindow();
});

app.on("window-all-closed", () => {
  // Stop the Next.js server when closing
  if (nextServer) {
    nextServer.kill();
  }
  
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});