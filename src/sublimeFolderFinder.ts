import * as vscode from 'vscode';
import * as fileSystem from './Filesystem';
import * as path from 'path';
import * as os from 'os';

export interface SublimeFolders {
    main: vscode.Uri,
    settings: vscode.Uri
}

const defaultSublimeSettingsPaths: Map<string, string[]> = new Map([
    ['win32', [path.join(os.homedir(), 'AppData', 'Roaming', 'Sublime Text 3')]],
    ['darwin', [path.join(os.homedir(), 'Library', 'Application Support', 'Sublime Text 3')]],
    ['linux', [path.join(os.homedir(), '.config', 'sublime-text-3')]]
]);

const settingsSubfoldersPath = path.join('Packages', 'User', 'Preferences.sublime-settings');

export async function getExistingDefaultPaths(): Promise<SublimeFolders[]> {
    const platform: NodeJS.Platform = os.platform();
    let foundPaths: string[] | undefined = defaultSublimeSettingsPaths.get(platform);
    if (!foundPaths) {
        console.log('OS could not be identified. No default paths provided.');
        return Promise.resolve([]);
    }

    const existingDefaultPaths: SublimeFolders[] = await filterForExistingDirsAsync(foundPaths);
    return existingDefaultPaths;
}

export async function filterForExistingDirsAsync(paths: string[]): Promise<SublimeFolders[]> {
    const existingDirs: SublimeFolders[] = [];
    for (const p of paths) {
        const settingsPath: string = path.resolve(p, settingsSubfoldersPath);
        if (await fileSystem.pathExists(settingsPath)) {
            existingDirs.push({ main: vscode.Uri.file(p), settings: vscode.Uri.file(settingsPath) });
        }
    }

    return existingDirs;
}

export async function folderPicker(): Promise<SublimeFolders | undefined> {
    const folderPaths = await vscode.window.showOpenDialog({ canSelectFolders: true });
    if (!folderPaths) {
        return undefined;
    }
    const paths: SublimeFolders[] = await filterForExistingDirsAsync([folderPaths[0].fsPath]);
    if (!paths.length) {
        return undefined;
    }
    return paths[0];
}