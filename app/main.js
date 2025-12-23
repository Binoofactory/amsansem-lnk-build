import { app, dialog, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const targetWebSiteUrl = 'https://amsansem.com/';
const applicationDisplayName = '학습 영상 바로가기';
const iconFileName = '/assets/icon'; // Windows: .ico / macOS: .icns
console.log(1);
function isGoogleChromeInstalledOnWindows() {
    try {
        execSync('reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"');
        return true;
    }
    catch {
        try {
            execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"');
            return true;
        }
        catch {
            return false;
        }
    }
}
function isGoogleChromeInstalledOnMac() {
    if (fs.existsSync('/Applications/Google Chrome.app'))
        return true;
    try {
        const result = execSync('mdfind "kMDItemCFBundleIdentifier == com.google.Chrome"');
        return result.toString().trim().length > 0;
    }
    catch {
        return false;
    }
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
function createWindowsDesktopShortcut() {
    const desktopDirectoryPath = app.getPath('desktop');
    const shortcutFilePath = path.join(desktopDirectoryPath, `${applicationDisplayName}.lnk`);
    const windowsIconFileName = path.join(process.resourcesPath, iconFileName + '.ico');
    // 아이콘 복사
    fs.mkdirSync(app.getPath('appData') + '/amsansem.lnk', { recursive: true });
    fs.copyFileSync(windowsIconFileName, path.join(app.getPath('appData') + '/amsansem.lnk', 'icon.ico'));
    shell.writeShortcutLink(shortcutFilePath, {
        target: 'cmd.exe',
        args: `/c start chrome "${targetWebSiteUrl}"`,
        description: applicationDisplayName,
        icon: app.getPath('appData') + '/amsansem.lnk/icon.ico',
        iconIndex: 0,
    });
}
function createMacDesktopShortcut() {
    const desktopDirectoryPath = app.getPath('desktop');
    const applicationBundlePath = path.join(desktopDirectoryPath, `${applicationDisplayName}.app`);
    const contentsPath = path.join(applicationBundlePath, 'Contents');
    const macOsPath = path.join(contentsPath, 'MacOS');
    const resourcesPath = path.join(contentsPath, 'Resources');
    fs.mkdirSync(macOsPath, { recursive: true });
    fs.mkdirSync(resourcesPath, { recursive: true });
    const executableScriptPath = path.join(macOsPath, applicationDisplayName);
    const executableScriptContent = `#!/bin/bash
    open -a "Google Chrome" "${targetWebSiteUrl}"`;
    fs.writeFileSync(executableScriptPath, executableScriptContent, { mode: 0o755 });
    const macIconFileName = path.join(process.resourcesPath, iconFileName + '.icns');
    const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
    <key>CFBundleName</key>
    <string>${applicationDisplayName}</string>
    <key>CFBundleDisplayName</key>
    <string>${applicationDisplayName}</string>
    <key>CFBundleExecutable</key>
    <string>${applicationDisplayName}</string>
    <key>CFBundleIconFile</key>
    <string>${macIconFileName}</string>
    <key>CFBundleIdentifier</key>
    <string>com.customer.learning.shortcut</string>
    </dict>
    </plist>`;
    fs.writeFileSync(path.join(contentsPath, 'Info.plist'), infoPlistContent);
    // 아이콘 복사
    fs.copyFileSync(macIconFileName, path.join(resourcesPath, 'icon.icns'));
}
app.whenReady().then(() => {
    const isWindowsPlatform = process.platform === 'win32';
    const isMacPlatform = process.platform === 'darwin';
    console.log(process.platform);
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
//# sourceMappingURL=main.js.map