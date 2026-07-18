const { app, BrowserWindow, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("path");
const { isSafeExternalUrl } = require("./external-links.cjs");

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function captureFrameSequence(mainWindow, framesDirectory, frameRate, durationSeconds) {
  const totalFrames = frameRate * durationSeconds;
  await fs.mkdir(framesDirectory, { recursive: true });
  const startedAt = Date.now();

  for (let index = 0; index < totalFrames; index += 1) {
    if (mainWindow.isDestroyed()) return;
    const image = await mainWindow.webContents.capturePage();
    const frameName = `frame-${String(index).padStart(6, "0")}.png`;
    await fs.writeFile(path.join(framesDirectory, frameName), image.toPNG());
    const targetElapsed = ((index + 1) / frameRate) * 1000;
    await wait(Math.max(0, targetElapsed - (Date.now() - startedAt)));
  }

  await fs.writeFile(
    path.join(framesDirectory, "capture-complete.json"),
    JSON.stringify({ totalFrames, frameRate, durationSeconds }, null, 2)
  );
}

function resolveStartTarget() {
  if (!app.isPackaged) {
    return {
      mode: "url",
      value: process.env.ZMS_DESKTOP_START_URL || "http://localhost:5173"
    };
  }

  return {
    mode: "file",
    value: path.resolve(__dirname, "..", "..", "ZMS.WebUI", "dist", "index.html")
  };
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#0e1b2d",
    title: "Zettalogix Migration Suite",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const startTarget = resolveStartTarget();

  mainWindow.webContents.on("did-fail-load", (_event, code, description) => {
    console.error(`Renderer load failed (${code}): ${description}`);
  });

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error(`Renderer process exited: ${details.reason}`);
  });

  const capturePath = process.env.ZMS_CAPTURE_PATH;
  if (capturePath) {
    const requestedDelay = Number(process.env.ZMS_CAPTURE_DELAY_MS ?? "3500");
    const captureDelay = Number.isFinite(requestedDelay) ? Math.max(500, requestedDelay) : 3500;
    mainWindow.webContents.once("did-finish-load", () => {
      setTimeout(async () => {
        try {
          await fs.mkdir(path.dirname(capturePath), { recursive: true });
          const image = await mainWindow.webContents.capturePage();
          await fs.writeFile(capturePath, image.toPNG());
        } catch (error) {
          console.error(`Renderer capture failed: ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }, captureDelay);
    });
  }

  const framesDirectory = process.env.ZMS_CAPTURE_FRAMES_DIR;
  if (framesDirectory) {
    const frameRate = Math.max(1, Number(process.env.ZMS_CAPTURE_FRAME_RATE ?? "2"));
    const durationSeconds = Math.max(1, Number(process.env.ZMS_CAPTURE_DURATION_SECONDS ?? "340"));
    mainWindow.webContents.once("did-finish-load", () => {
      setTimeout(() => {
        void captureFrameSequence(mainWindow, framesDirectory, frameRate, durationSeconds).catch((error) => {
          console.error(`Frame sequence failed: ${error instanceof Error ? error.message : "unknown error"}`);
        });
      }, 1200);
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (startTarget.mode === "url") {
    void mainWindow.loadURL(startTarget.value);
  } else {
    void mainWindow.loadFile(startTarget.value);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
