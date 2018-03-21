import * as vscode from 'vscode';
import * as path from 'path';
import * as fileSystem from './fileSystem';
import * as rjson from "relaxed-json";

export interface PackageEntry {
    name: string,
    filename: string,
    'vscode-extensions': VscodeData[]
}

export interface VscodeData {
    id: string,
    name: string,
    description: string
}

export interface MappedExtensionsAndThemes {
    extensions: PackageEntry[];
    themes: PackageEntry[];
}

export class ExtensionsImporter {
    public async getExtensionsMappingAsync(sublimeSettingsRoot: vscode.Uri): Promise<MappedExtensionsAndThemes> {
        const packagesFolder = path.join(sublimeSettingsRoot.fsPath, 'Installed Packages');
        if (!await fileSystem.pathExists(packagesFolder)) {
            throw new URIError(`${packagesFolder} doesn't exist!`);
        }
        const packageFilenames: string[] = await fileSystem.getFilenamesInFolderAsync(packagesFolder);

        const packageMappingsFilePath = path.resolve(__dirname, "..", "mappings/packages.json");
        const themesMappingsFilePath = path.resolve(__dirname, "..", "mappings/themes.json");

        const mappedExtensions: PackageEntry[] = await this.mapAsync(packageMappingsFilePath, packageFilenames);
        const mappedThemes: PackageEntry[] = await this.mapAsync(themesMappingsFilePath, packageFilenames);

        return { extensions: mappedExtensions, themes: mappedThemes };
    }

    private async mapAsync(mappingJsonFilePath, filenames: string[]): Promise<PackageEntry[]> {
        const mappedPackages: PackageEntry[] = [];

        const packageMappingsJson: string = await fileSystem.readFileAsync(mappingJsonFilePath, 'utf-8');
        const json = rjson.parse(packageMappingsJson.toString());

        Object.keys(json).forEach(packageName => {
            const packageEntry: PackageEntry = json[packageName];
            if (filenames.indexOf(packageEntry.filename) !== -1) {
                mappedPackages.push(packageEntry);
            }
        });

        return mappedPackages;
    }
}