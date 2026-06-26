const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const { exec } = require("child_process");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: __dirname + "/preload.js",
    },
  });

  mainWindow.loadFile("renderer/index.html");
}

app.whenReady().then(() => {
  createWindow();

  // 🔄 buscar actualizaciones
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-available", () => {
  console.log("Actualización disponible");
});

autoUpdater.on("update-downloaded", () => {
  console.log("Actualización descargada");
});

function detectDistro() {
  try {
    const osRelease = fs.readFileSync("/etc/os-release", "utf8");

    if (osRelease.includes("Arch")) return "arch";
    if (osRelease.includes("Ubuntu") || osRelease.includes("Debian"))
      return "debian";

    return "unknown";
  } catch {
    return "unknown";
  }
}

ipcMain.handle("run-action", async (event, action) => {
  const distro = detectDistro();
  let cmd = "";

  // 🔥 acciones
  if (action === "update") {
    if (distro === "arch") {
      cmd = "pkexec pacman -Syu --noconfirm";
    } else if (distro === "debian") {
      cmd = "pkexec apt update && pkexec apt upgrade -y";
    }
  }

  if (action === "install-basic") {
    if (distro === "arch") {
      cmd = "pkexec pacman -S git neofetch base-devel --noconfirm";
    } else if (distro === "debian") {
      cmd = "pkexec apt install git neofetch build-essential -y";
    }
  }

  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return resolve(stderr);
      resolve(stdout);
    });
  });
});
