"use strict";

import * as fs from 'fs';
import * as path from 'path';


export async function pathExists(path: string): Promise<boolean> {
    try {
        await fsAccess(path, fs.constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function fsAccess(path: string, checks: number): Promise<any> {
    return promisifier(fs.access, path, checks);
}

// adapted from vs/base/common/async
export function promisifier<T>(fn: Function, ...args: any[]): Promise<T> {
    return new Promise((c, e) => fn(...args, (err, result) => err ? e(err) : c(result)));
}

export async function getFilenamesInFolderAsync(folderPath: string): Promise<string[]> {
    const filenames: string[] = await promisifier<string[]>(fs.readdir, folderPath);
    const validFilenames: string[] = [];
    for (const filename of filenames) {
        if (await isFileAsync(path.join(folderPath, filename))) {
            validFilenames.push(filename);
        }
    }
    return validFilenames;
}

async function isFileAsync(p: string) {
    const stats = await promisifier<fs.Stats>(fs.lstat, p);
    return stats.isFile();
}

export async function readFileAsync(filePath: string, encoding?: string) {
    return await promisifier<string>(fs.readFile, filePath, encoding);
}