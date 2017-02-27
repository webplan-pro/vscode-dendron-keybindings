'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let config = vscode.workspace.getConfiguration('editor');
    config.update('formatOnPaste', true);
    config.update('minimap.enabled', true);
}