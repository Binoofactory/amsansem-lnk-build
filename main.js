const { app, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetWebSiteUrl = 'https://www.google.com';
const applicationDisplayName = '학습 영상 바로가기';
const iconFileName = 'shortcut-icon.ico'; // Windows: .ico / macOS: .icns

function isGoogleChromeInstalledOnWindows() {
  try {
    execSync('reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"');
    return true;
  } catch {
    return false;
  }
}

function isGoogleChromeInstalledOnMac() {
  return fs.existsSync('/Applications/Google Chrome.app');
}

function promptChromeInstallation() {
  dialog.showMessageBoxSync({
    type: 'info',
    title: 'Google Chrome 필요',
    message: '이 바로가기를 사용하려면 Google Chrome이 필요합니다.',
    buttons: ['Chrome 다운로드 페이지 열기'],
  });

  shell.openExternal('https://www.google.com/chrome/');
}

// ===== 바로가기 생성 =====
function createWindowsDesktopShortcut() {
  const desktopDirectoryPath = app.getPath('desktop');
  const shortcutFilePath = path.join(desktopDirectoryPath, `${applicationDisplayName}.lnk`);
  const chromeExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  shell.writeShortcutLink(shortcutFilePath, {
    target: chromeExecutablePath,
    args: targetWebSiteUrl,
    description: applicationDisplayName,
    icon: path.join(process.resourcesPath, iconFileName),
  });
}

function createMacDesktopShortcut() {
  const desktopDirectoryPath = app.getPath('desktop');
  const shortcutFilePath = path.join(desktopDirectoryPath, `${applicationDisplayName}.command`);

  const scriptContent = `#!/bin/bash
open -a "Google Chrome" "${targetWebSiteUrl}"`;

  fs.writeFileSync(shortcutFilePath, scriptContent, { mode: 0o755 });
}

// ===== 메인 로직 =====
app.whenReady().then(() => {
  const isWindowsPlatform = process.platform === 'win32';
  const isMacPlatform = process.platform === 'darwin';

  if (isWindowsPlatform) {
    if (!isGoogleChromeInstalledOnWindows()) {
      promptChromeInstallation();
      app.quit();
      return;
    }

    createWindowsDesktopShortcut();
  }

  if (isMacPlatform) {
    if (!isGoogleChromeInstalledOnMac()) {
      promptChromeInstallation();
      app.quit();
      return;
    }

    createMacDesktopShortcut();
  }

  dialog.showMessageBoxSync({
    type: 'info',
    title: '설치 완료',
    message: '바탕화면에 바로가기가 생성되었습니다.',
  });

  app.quit();
});
