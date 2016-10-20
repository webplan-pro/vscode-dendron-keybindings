# Sublime Text Keymap for VS Code

This extension ports the most popular Sublime Text keyboard shortcuts to Visual Studio Code. After installing the extension and restarting VS Code your favorite keyboard shortcuts from Sublime Text are now available. 

## What keyboard shortcuts are included?

| Windows / Linux | Mac | Description  | VSC Command |
| --------------- | --- | ------- | ------------ | ----------- |
| f9 | f5 | Sort lines | `editor.action.sortLinesAscending` | 
| ctrl+f9 | ctrl+f5 | Sort lines | `editor.action.sortLinesDescending` | 
| ctrl+w | cmd+w | Close file | `workbench.files.action.closeFile` | 
| ctrl+k ctrl+b | cmd+k cmd+b | Toggle sidebar | `workbench.action.toggleSidebarVisibility` | 
| ctrl+shift+k | ctrl+shift+k | Delete Line | `editor.action.deleteLines` | 
| ctrl+shift+up | cmd+shift+up | Move line up | `editor.action.moveLinesUpAction` | 
| ctrl+shift+down | cmd+shift+down | Move line down | `editor.action.moveLinesDownAction` | 
| ctrl+l | cmd+l | Select line (repeat for next lines) | `expandLineSelection` |  
| ctrl+m | ctrl+m | Jump to bracket | `editor.action.jumpToBracket` | 
| ctrl+shift+d | cmd+shift+d | Duplicate line | `editor.action.copyLinesDownAction` | 
| ctrl+shift+/ | cmd+alt+/ | Block comment | `editor.action.blockComment` | 
| ctrl+r and ctrl+; | cmd+r | Go to Symbol | `workbench.action.gotoSymbol` | 
| alt+shift+2 and ctrl+k ctrl+up | alt+cmd+2 and cmd+k cmd+up | Split editor | `workbench.action.splitEditor` | 
| ctrl+h | cmd+alt+f | Replace | `workbench.action.replaceInFiles` | 
| ctrl+pagedown | shift+cmd+] and alt+cmd+right | Next Tab | `workbench.action.nextEditor` | 
| ctrl+pageup | shift+cmd+[ and alt+cmd+left | Previous Tab | `workbench.action.previousEditor` | 
| ctrl+up | ctrl+alt+up | Scroll line up | `scrollLineUp` | 
| ctrl+down | ctrl+alt+down | Scroll line down | `scrollLineDown` | 
| tab and shift+tab | tab and shift+tab | Tab | `tab` | 
| ctrl+p | cmd+p and cmd+t | Quick open | `workbench.action.quickOpen` |
| f12 | f12 and cmd+alt+down | Go to decleration | `editor.action.goToDeclaration` |
| alt+- | ctrl+- | Navigate back | `workbench.action.navigateBack` | 
| alt+shift+- | ctrl+shift+- | Navigate forward | `workbench.action.navigateForward` | 
| f3 and f4 | cmd+g and f4 | Next find | `editor.action.nextMatchFindAction` | 
| shift+f3 and shift+f4 | shift+cmd+g and shift+f4 | Previous find | `editor.action.previousMatchFindAction` | 
| ctrl+/ and ctrl+shift+/ | cmd+/ and ctrl+cmd+down | Comment line | `editor.action.commentLine` | 
| ctrl+k ctrl+down | cmd+k cmd+down | Close active editor | `workbench.action.closeActiveEditor` | 
| ctrl+shift+[ | alt+cmd+[ | Fold | `editor.fold` | 
| ctrl+shift+] | cmd+alt+] | Unfold | `editor.fold` | 
| ctrl+k ctrl+0 and ctrl+k ctrl+j | cmd+k cmd+0 and cmd+k cmd+j | Fold all | `editor.unfoldAll` | 
| context_menu | atl+f12 | Show context menu | `editor.action.showContextMenu` |
| ctrl++ | cmd++ | Increase font | `workbench.action.zoomIn` |
| ctrl+- | cmd+- | Decrease font | `workbench.action.zoomOut` |

Additionally, you can see all of the keyboard shortcuts in the extension's details page in VS Code. 

![extension contributions](https://github.com/Microsoft/vscode-sublime-keybindings/blob/master/contributions_list.png?raw=true)

## Why doesn't join lines (or another command) work? 

This is likely because VS Code has not implemented this feature. Head on over to this [GitHub issue](https://github.com/Microsoft/vscode/issues/3776) and let the VS Code team know what you'd like to see. 

## How do I contribute a keyboard shortcut?

We may have missed a keyboard shortcut. If we did please help us out! It is very easy to make a PR. 

1. Head over to our Github repository. 
2. Open the `package.json` file. 
3. Add a JSON object to `contributions.keybindings` like below. 
4. Open a PR. 

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

1.4.0 - Added Windows / Linux key bindings and a number of missing commands. Updated the README. 

1.3.0 - Improved README

1.2.0 - Fixes a number of keybinding changes with [PR #9](https://github.com/Microsoft/vscode-sublime-keybindings/pull/9) and [PR #12](https://github.com/Microsoft/vscode-sublime-keybindings/pull/12) (credit to [securingsincity](https://github.com/Microsoft/vscode-sublime-keybindings/issues?q=is%3Apr+author%3Asecuringsincity) and [benmosher](https://github.com/Microsoft/vscode-sublime-keybindings/issues?q=is%3Apr+author%3Abenmosher)).

## License
[MIT](license.txt)
