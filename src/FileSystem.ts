"use strict";

import * as fs from 'fs';


export async function pathExists(path: string): Promise<boolean> {
    try {
        await fsAccess(path, fs.constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function fsAccess(path: string, checks: number): Promise<any> {
    return nfcall(fs.access, path, checks);
}

// adapted from vs/base/common/async
export function nfcall<T>(fn: Function, ...args: any[]): Promise<T> {
    return new Promise((c, e) => fn(...args, (err, result) => err ? e(err) : c(result)));
}