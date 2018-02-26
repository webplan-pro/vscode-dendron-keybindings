import * as platform from './platform';
import * as vscode from 'vscode';
import * as fileSystem from './Filesystem';
import * as path from 'path';
import * as os from 'os';

const DefaultConfigPaths = {
    'Windows': [path.join(os.homedir() + '\\AppData\\Roaming\\Sublime Text 3')],
    'Macintosh': ['~/Library/Application Support/Sublime Text 3/Packages/User/Preferences.sublime-settings'],
    'Linux': []
}

export const sublimeSettingsPath = path.join('Packages', 'User', 'Preferences.sublime-settings');

export async function findSettingsPathAsync(): Promise<vscode.Uri[]> {
        let foundPaths = [];

    switch (platform.OS) {  // TODO: replace with os.platform
        case platform.OperatingSystem.Windows:
            foundPaths = await filterForExistingDirsAsync(DefaultConfigPaths.Windows);
            return foundPaths;
        case platform.OperatingSystem.Macintosh:
            foundPaths = await filterForExistingDirsAsync(DefaultConfigPaths.Macintosh);
            return foundPaths;
        case platform.OperatingSystem.Linux:
            foundPaths = await filterForExistingDirsAsync(DefaultConfigPaths.Linux);
            return foundPaths;

        default:
            return foundPaths;
    }
}

async function filterForExistingDirsAsync(paths: string[]): Promise<vscode.Uri[]> {
    const existingDirs = await paths.filter(async (p) => {
        const exists = await fileSystem.pathExists(p);
        if (exists) {
            const settingsPath = path.resolve(p, sublimeSettingsPath);
            const containsSettings = await fileSystem.pathExists(settingsPath);
            return containsSettings;
        }
        return false;
    }).map(folder => {
        return vscode.Uri.file(path.resolve(folder, sublimeSettingsPath));
    });

    return existingDirs;
}