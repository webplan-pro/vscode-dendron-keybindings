# Sublime Text Keymap for VS Code

This extension ports the most popular Sublime Text keyboard shortcuts to Visual Studio Code. After installing the extension and restarting VS Code your favorite keyboard shortcuts from Sublime Text are now available. 

## What keyboard shortcuts are included?

| Windows / Linux | Mac | Description  | VSC Command |
| --------------- | --- | ------- | ------------ | ----------- |
| <kbd>f9</kbd> | <kbd>f5</kbd> | Sort lines | `editor.action.sortLinesAscending` | 
| <kbd>ctrl</kbd>+<kbd>f9</kbd> | <kbd>ctrl</kbd>+<kbd>f5</kbd> | Sort lines | `editor.action.sortLinesDescending` | 
| <kbd>ctrl</kbd>+<kbd>w</kbd> | <kbd>cmd</kbd>+<kbd>w</kbd> | Close file | `workbench.files.action.closeFile` | 
| <kbd>ctrl</kbd>+k <kbd>ctrl</kbd>+<kbd>b</kbd> | <kbd>cmd</kbd>+<kbd>k</kbd> <kbd>cmd</kbd>+<kbd>b</kbd> | Toggle sidebar | `workbench.action.toggleSidebarVisibility` | 
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>k</kbd> | <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>k</kbd> | Delete Line | `editor.action.deleteLines` | 
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>up</kbd> | <kbd>cmd</kbd>+<kbd>shift</kbd>+<kbd>up</kbd> | Move line <kbd>up</kbd> | `editor.action.moveLinesUpAction` | 
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>down</kbd> | <kbd>cmd</kbd>+<kbd>shift</kbd>+<kbd>down</kbd> | Move line down | `editor.action.moveLinesDownAction` | 
| <kbd>ctrl</kbd>+<kbd>l</kbd> | <kbd>cmd</kbd>+<kbd>l</kbd> | Select line (repeat for next lines) | `expandLineSelection` |  
| <kbd>ctrl</kbd>+<kbd>m</kbd> | <kbd>ctrl</kbd>+<kbd>m</kbd> | Jump to bracket | `editor.action.jumpToBracket` | 
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>d</kbd> | <kbd>cmd</kbd>+<kbd>shift</kbd>+<kbd>d</kbd> | Duplicate line | `editor.action.copyLinesDownAction` | 
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>/</kbd> | <kbd>cmd</kbd>+<kbd>alt</kbd>+<kbd>/</kbd> | Block comment | `editor.action.blockComment` | 
| <kbd>ctrl</kbd>+<kbd>r</kbd> and <kbd>ctrl</kbd>+<kbd>;</kbd> | <kbd>cmd</kbd>+<kbd>r</kbd> | Go to Symbol | `workbench.action.gotoSymbol` | 
| <kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>2</kbd> and <kbd>ctrl</kbd>+<kbd>k</kbd> <kbd>ctrl</kbd>+<kbd>up</kbd> | <kbd>alt</kbd>+<kbd>cmd</kbd>+<kbd>2</kbd> and <kbd>cmd</kbd>+<kbd>k</kbd> <kbd>cmd</kbd>+<kbd>up</kbd> | Split editor | `workbench.action.splitEditor` | 
| <kbd>ctrl</kbd>+<kbd>h</kbd>| <kbd>cmd</kbd>+<kbd>alt</kbd>+<kbd>f</kbd> | Replace | `workbench.action.replaceInFiles` | 
| <kbd>ctrl</kbd>+<kbd>pagedown</kbd> | <kbd>shift</kbd>+<kbd>cmd</kbd>+<kbd>]</kbd> and <kbd>alt</kbd>+<kbd>cmd</kbd>+<kbd>right</kbd> | Next Tab | `workbench.action.nextEditor` | 
| <kbd>ctrl</kbd>+<kbd>pageup</kbd> | <kbd>shift</kbd>+<kbd>cmd</kbd>+<kbd>[</kbd> and <kbd>alt</kbd>+<kbd>cmd</kbd>+left | Previous Tab | `workbench.action.previousEditor` | 
| <kbd>ctrl</kbd>+<kbd>up</kbd> | <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>up</kbd> | Scroll line up | `scrollLineUp` | 
| <kbd>ctrl</kbd>+<kbd>down</kbd> | <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>down</kbd> | Scroll line down | `scrollLineDown` | 
| <kbd>tab</kbd> and <kbd>shift</kbd>+<kbd>tab</kbd> | <kbd>tab</kbd> and <kbd>shift</kbd>+<kbd>tab</kbd> | Tab | `tab` | 
| <kbd>ctrl</kbd>+<kbd>p</kbd> | <kbd>cmd</kbd>+<kbd>p</kbd> and <kbd>cmd</kbd>+<kbd>t</kbd> | Quick open | `workbench.action.quickOpen` |
| <kbd>f12</kbd> | <kbd>f12</kbd> and <kbd>cmd</kbd>+<kbd>alt</kbd>+<kbd>down</kbd> | Go to declaration | `editor.action.goToDeclaration` |
| <kbd>alt</kbd>+<kbd>-</kbd> | <kbd>ctrl</kbd>+<kbd>-</kbd> | Navigate back | `workbench.action.navigateBack` | 
| <kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>-</kbd> | <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>-</kbd> | Navigate forward | `workbench.action.navigateForward` | 
| <kbd>f3</kbd> and <kbd>f4</kbd> | <kbd>cmd</kbd>+<kbd>g</kbd> and <kbd>f4</kbd> | Next find | `editor.action.nextMatchFindAction` | 
| <kbd>shift</kbd>+<kbd>f3</kbd> and <kbd>shift</kbd>+<kbd>f4</kbd> | <kbd>shift</kbd>+<kbd>cmd</kbd>+<kbd>g</kbd> and <kbd>shift</kbd>+<kbd>f4</kbd> | Previous find | `editor.action.previousMatchFindAction` | 
| <kbd>ctrl</kbd>+/ and <kbd>ctrl</kbd>+<kbd>shift</kbd>+/ | <kbd>cmd</kbd>+/ and <kbd>ctrl</kbd>+<kbd>cmd</kbd>+<kbd>down</kbd> | Comment line | `editor.action.commentLine` | 
| <kbd>ctrl</kbd>+k <kbd>ctrl</kbd>+<kbd>down</kbd> | <kbd>cmd</kbd>+<kbd>k</kbd> <kbd>cmd</kbd>+<kbd>down</kbd> | Close active editor | `workbench.action.closeActiveEditor` | 
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>[</kbd> | <kbd>alt</kbd>+<kbd>cmd</kbd>+<kbd>[</kbd> | Fold | `editor.fold` | 
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>]</kbd> | <kbd>cmd</kbd>+<kbd>alt</kbd>+<kbd>]</kbd> | Unfold | `editor.fold` | 
| <kbd>ctrl</kbd>+<kbd>k</kbd> <kbd>ctrl</kbd>+<kbd>0</kbd> and <kbd>ctrl</kbd>+<kbd>k</kbd> <kbd>ctrl</kbd>+<kbd>j</kbd> | <kbd>cmd</kbd>+<kbd>k</kbd> <kbd>cmd</kbd>+<kbd>0</kbd> and <kbd>cmd</kbd>+<kbd>k</kbd> <kbd>cmd</kbd>+<kbd>j</kbd> | Fold all | `editor.unfoldAll` | 
| <kbd>context_menu</kbd> | <kbd>alt</kbd>+<kbd>f12</kbd> | Show context menu | `editor.action.showContextMenu` |
| <kbd>ctrl</kbd>+<kbd>+</kbd> | <kbd>cmd</kbd>+<kbd>+</kbd> | Increase font | `workbench.action.zoomIn` |
| <kbd>ctrl</kbd>+<kbd>-</kbd> | <kbd>cmd</kbd>+<kbd>-</kbd> | Decrease font | `workbench.action.zoomOut` |
| <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>down</kbd> / <kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>down</kbd> | <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>down</kbd>  | Vertical / Column Select down | `cursorColumnSelectDown` |
| <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>up</kbd> / <kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>up</kbd> | <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>up</kbd>  | Vertical / Column Select up | `cursorColumnSelectUp` |
| <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>pageup</kbd> / <kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>pageup</kbd> | <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>pageup</kbd> | Vertical / Column Select page up | `cursorColumnSelectPageUp` |
| <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>pagedown</kbd> / <kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>pagedown</kbd> | <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>pagedown</kbd> | Vertical / Column Select page down | `cursorColumnSelectPageDown` |
| <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>l</kbd> | <kbd>cmd</kbd>+<kbd>shift</kbd>+<kbd>l</kbd> | Split selection into lines | `editor.action.insertCursorAtEndOfEachLineSelected` |

Additionally, you can see all of the keyboard shortcuts in the extension's details page in VS Code. 

![extension contributions](https://github.com/Microsoft/vscode-sublime-keybindings/blob/master/contributions_list.png?raw=true)

## Why doesn't join lines (or another command) work? 

This is likely because VS Code has not implemented this feature. Head on over to this [GitHub issue](https://github.com/Microsoft/vscode/issues/3776) and let the VS Code team know what you'd like to see. 

## How do I contribute a keyboard shortcut?

We may have missed a keyboard shortcut. If we did please help us out! It is very easy to make a PR. 

1. Head over to our [GitHub repository](https://github.com/Microsoft/vscode-sublime-keybindings). 
2. Open the [`package.json` file](https://github.com/Microsoft/vscode-sublime-keybindings/blob/master/package.json). 
3. Add a JSON object to [`contributions.keybindings`](https://github.com/Microsoft/vscode-sublime-keybindings/blob/master/package.json#L25) as seen below. 
4. Open a pull request. 

```json
{
    "mac": "<keyboard shortcut for mac>",
    "linux": "<keyboard shortcut for linux",
    "win": "<keyboard shortcut for windows",
    "key": "<default keyboard shortcut>",
    "command": "<name of the command in VS Code"
}
```

You can read more about how to contribute keybindings in extensions in the [official documentation](http://code.visualstudio.com/docs/extensionAPI/extension-points#_contributeskeybindings). 

## Releases

1.5.0 - New keybindings and nit fixes per [@bhancock8](https://github.com/bhancock8)

1.4.0 - Added Windows / Linux key bindings and a number of missing commands. Updated the README. 

1.3.0 - Improved README

1.2.0 - Fixes a number of keybinding changes with [PR #9](https://github.com/Microsoft/vscode-sublime-keybindings/pull/9) and [PR #12](https://github.com/Microsoft/vscode-sublime-keybindings/pull/12) (credit to [securingsincity](https://github.com/Microsoft/vscode-sublime-keybindings/issues?q=is%3Apr+author%3Asecuringsincity) and [benmosher](https://github.com/Microsoft/vscode-sublime-keybindings/issues?q=is%3Apr+author%3Abenmosher)).

## License
[MIT](license.txt)
