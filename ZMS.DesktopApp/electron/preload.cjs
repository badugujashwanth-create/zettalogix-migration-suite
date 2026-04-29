const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("zmsDesktop", {
  platform: process.platform,
  versions: process.versions,
  appName: "ZMS Desktop"
});
