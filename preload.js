const { app, BrowserWindow, ipcMain } = require("electron");
const { exec } = require("child_process");
const fs = require("fs");

let mainWindow;

contextBridge.exposeInMainWorld("api", {
  runAction: (action) => ipcRenderer.invoke("run-action", action),
  checkUpdates: () => ipcRenderer.invoke("check-updates")
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: __dirname + "/preload.js"
    }
  });

  mainWindow.loadFile("renderer/index.html");
}

app.whenReady().then(createWindow);

function detectDistro() {
  try {
    const osRelease = fs.readFileSync("/etc/os-release", "utf8");

    if (osRelease.includes("Arch")) return "arch";
    if (osRelease.includes("Ubuntu") || osRelease.includes("Debian")) return "debian";

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