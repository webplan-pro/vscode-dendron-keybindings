import * as vscode from 'vscode';
import * as fileSystem from './Filesystem';
import * as path from 'path';
import * as os from 'os';

const defaultSublimePaths: Map<string, string[]> = new Map([
    ['win32', [path.join(os.homedir(), 'AppData', 'Roaming', 'Sublime Text 3')]],
    ['darwin', [path.join(os.homedir(), 'Library', 'Application Support', 'Sublime Text 3')]],
    ['linux', [path.join(os.homedir(), '.config', 'sublime-text-3')]]
]);

const sublimeSettingsPath = path.join('Packages', 'User', 'Preferences.sublime-settings');

export async function findSettingsPathAsync(): Promise<vscode.Uri[]> {
    const platform: NodeJS.Platform = os.platform();
    let foundPaths: string[] | undefined = defaultSublimePaths.get(platform);
    if (!foundPaths) {
        console.log('OS could not be identified. No default paths provided.');
        return Promise.resolve([]);
    }

    const existingDefaultPaths: vscode.Uri[] = await filterForExistingDirsAsync(foundPaths);
    return existingDefaultPaths;
}

export async function filterForExistingDirsAsync(paths: string[]): Promise<vscode.Uri[]> {
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