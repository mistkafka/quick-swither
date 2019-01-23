'use strict'

import child_process from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import {
    app,
    protocol,
    BrowserWindow,
    globalShortcut
} from 'electron'

const HOME_DIR = os.homedir();
const OS_CONFIG_DIR = path.join(HOME_DIR, '.config')
const APP_CONFIG_DIR = path.join(OS_CONFIG_DIR, 'quick-switch')
const CONFIG_PATH = path.join(APP_CONFIG_DIR, 'config.json')

const HOT_KEY_MODIFIER = ["Cmd", "Ctrl", "Alt", "Shift"];

function loadConfig() {
    if (!fs.existsSync(OS_CONFIG_DIR)) {
        fs.mkdirSync(OS_CONFIG_DIR)
    }

    if (!fs.existsSync(APP_CONFIG_DIR)) {
        fs.mkdirSync(APP_CONFIG_DIR)
    }

    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, '{}', { encoding: 'utf-8' })
    }

    const configContent = fs.readFileSync(CONFIG_PATH, {encoding: 'utf8'});

    return JSON.parse(configContent);
}

function registerGlobalKey(hotKey, appName) {
  const script = `osascript -e 'activate application "${appName}"'`;
  const hotKeyDesc = [...HOT_KEY_MODIFIER, hotKey].join('+');

  const result = globalShortcut.register(hotKeyDesc, () => {
    child_process.execSync(script);
  });

  if (!result) {
    console.error(`register hotkey failed. hotkey: ${hotKeyDesc}`);
  }
}

function registerGlobalKeys() {
    const shortcutConfig = loadConfig();
    Object.keys(shortcutConfig)
        .forEach(hotKey => {
            const appName = shortcutConfig[hotKey];
            registerGlobalKey(hotKey, appName);
        });
}

app.on('ready', registerGlobalKeys);

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
});
