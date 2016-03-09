// Converts sublime key bindings to VS Code key bindings
// TODO this is not complete!! More work to do.. 

const jsonfile = require('jsonfile');
const lodash = require('lodash');
const vscodeToSublimeMap = require('vscode-sublime-mapping');

const SUBLIME_PATH = 'sublime-mac-keybindings.json';
const PACKAGE_PATH = 'package.json';


class VsCodeKeyBindings {

    constructor(vscodeToSublime) {
        this.vscodeToSublime = vscodeToSublime;
        this.bindings = [];
    }
    
    bind(sublimeBinding) {
        // {
        //     "key": "cmd+l",
        //     "command": "commandId",
        //     "when": "editorTextFocus"
        // }
        
        let binding = {};
        

        // look up sublime key binding
        let sublimeKeys = sublime.keys;
        
        // match sublime command to vscode command
        
        // look up vscode to see if it has a "when" context
        
        this.bindings.append(binding);
    }
    
    getCommand(target) {
        // could optimize here be building a reverse lookup table
        
        for (let command in this.vscodeToSublime) {
            let sublimeCommands = this.vscodeToSublime[command];
            for (let sublime in sublimeCommands) {
                if (equals(sublime, target)) {
                    return command;
                }    
            }
        }
    }
}

function equals(sublimeX, sublimeY) {
    if (sublimeX.command != sublimeY.command) {
        return false;
    }
    
    if (!('args' in sublimeX) && !('args' in sublimeY)) {
        return true;
    }
    
    return lodash.isEqual(sublimeX.args, sublimeY.args);   
}

function writeKeyBindings(bindings) {
        var path = PACKAGE_PATH;
        jsonfile.readFile(path, (err, data) => {
            data.contributions = {
                "keybindings": bindings
            };
            jsonfile.writeFile(path, data, { spaces: 2 }, (err) => {
               console.error(err); 
            });
        });
    }
}


const bindings = jsonfile.readFileSync(SUBLIME_PATH);
const vscode = VsCodeKeyBindings(vscodeToSublimeMap);

sublime.bindings.forEach(vscode.bind);
writeKeyBindings(vscode.bindings);

