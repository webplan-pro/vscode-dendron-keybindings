// Converts sublime key bindings to VS Code key bindings


var CommandToSublimeMap = {
    "workbench.action.newWindow": { "command": "new_window" },
    "workbench.action.closeWindow": { "command": "close_window" },
    "workbench.action.files.openFile": { "command": "prompt_open" },
    "workbench.files.action.openPreviousWorkingFile": [
        { "command": "reopen_last_file" },
        { "keys": ["super+shift+["], "command": "prev_view" },
        { "keys": ["super+alt+left"], "command": "prev_view" },
    ],
    "workbench.files.action.openNextWorkingFile": [
        { "keys": ["super+shift+]"], "command": "next_view" },
        { "keys": ["super+alt+right"], "command": "next_view" },
    ],
    "workbench.files.action.newUntitledFile": { "keys": ["super+n"], "command": "new_file" },
    "workbench.action.files.save": { "keys": ["super+s"], "command": "save" },
    "workbench.action.files.saveAs": { "keys": ["super+shift+s"], "command": "prompt_save_as" },
    "workbench.action.files.saveAll": { "keys": ["super+alt+s"], "command": "save_all" },
    "workbench.action.files.closeFile": { "keys": ["super+w"], "command": "close" },
    "workbench.action.files.closeAllFiles": {},
    "workbench.action.toggleSidebarVisibility": { "keys": ["super+k", "super+b"], "command": "toggle_side_bar" },
    "workbench.action.toggleFullScreen": { "keys": ["super+ctrl+f"], "command": "toggle_full_screen" },
    "cursorUndo": { "keys": ["super+u"], "command": "soft_undo" },
    "scrollLineUp": { "keys": ["ctrl+alt+up"], "command": "scroll_lines", "args": {"amount": 1.0} },
    "scrollLineDown": { "keys": ["ctrl+alt+up"], "command": "scroll_lines", "args": {"amount": -1.0} },
    "hideSuggestWidget": { "keys": ["escape"], "command": "hide_auto_complete", "context":
		[
			{ "key": "auto_complete_visible", "operator": "equal", "operand": true }
		]
	},
    "editor.action.indentLines": { "keys": ["super+]"], "command": "indent" },
    "editor.action.outdentLines": { "keys": ["super+["], "command": "unindent" },
    "tab": [
        { "keys": ["tab"], "command": "insert_best_completion", "args": {"default": "\t", "exact": true} },
        { "keys": ["tab"], "command": "indent", "context": [
			    { "key": "text", "operator": "regex_contains", "operand": "\n" }
		    ]
        },
        { "keys": ["shift+tab"], "command": "insert", "args": {"characters": "\t"} },
    ],
    "jumpToNextSnippetPlaceholder": { "keys": ["tab"], "command": "next_field", "context":
		[
			{ "key": "has_next_field", "operator": "equal", "operand": true }
		]
	},
    "acceptSelectedSuggestion": [
        { "keys": ["tab"], "command": "commit_completion", "context":
            [
                { "key": "auto_complete_visible" },
                { "key": "setting.auto_complete_commit_on_tab" }
            ]
        },
        { "keys": ["enter"], "command": "commit_completion", "context":
            [
                { "key": "auto_complete_visible" },
                { "key": "setting.auto_complete_commit_on_tab", "operand": false }
            ]
        },
    ],
    "outdent": [
        	{ "keys": ["shift+tab"], "command": "unindent", "context":
		[
			{ "key": "setting.shift_tab_unindent", "operator": "equal", "operand": true }
		]
	},
    ],
    "jumpToPrevSnippetPlaceholder": [
        	{ "keys": ["shift+tab"], "command": "prev_field", "context":
		[
			{ "key": "has_prev_field", "operator": "equal", "operand": true }
		]
	},
    ],
    "workbench.action.gotoLine": [
        { "keys": ["ctrl+g"], "command": "show_overlay", "args": {"overlay": "goto", "text": ":"} },
    ],
    "workbench.action.quickOpen": [
        { "keys": ["super+t"], "command": "show_overlay", "args": {"overlay": "goto", "show_files": true} },
        { "keys": ["super+p"], "command": "show_overlay", "args": {"overlay": "goto", "show_files": true} },
    ],
    "workbench.action.showCommands": [
        { "keys": ["super+shift+p"], "command": "show_overlay", "args": {"overlay": "command_palette"} },
    ],
    "workbench.action.gotoSymbol": [
        { "keys": ["super+r"], "command": "show_overlay", "args": {"overlay": "goto", "text": "@"} },
    ],
    "editor.action.goToDeclaration": [
        { "keys": ["f12"], "command": "goto_definition" },
	{ "keys": ["super+alt+down"], "command": "goto_definition" },
    ],
    "workbench.action.navigateBack": [
        { "keys": ["ctrl+minus"], "command": "jump_back" },
    ],
    "workbench.action.navigateForward": [
        { "keys": ["ctrl+shift+minus"], "command": "jump_forward" },
    ],
    "actions.find": [
        { "keys": ["super+f"], "command": "show_panel", "args": {"panel": "find", "reverse": false} },
    ],
    "editor.action.nextMatchFindAction": [
        { "keys": ["super+g"], "command": "find_next" },
        { "keys": ["f4"], "command": "next_result" },
    ],
    "editor.action.previousMatchFindAction": [
        { "keys": ["super+shift+g"], "command": "find_prev" },
        { "keys": ["shift+f4"], "command": "prev_result" },
    ],
    "workbench.view.search": [
        { "keys": ["super+shift+f"], "command": "show_panel", "args": {"panel": "find_in_files"} },
    ],
    "editor.action.moveLinesUpAction": [
        { "keys": ["ctrl+super+up"], "command": "swap_line_up" },
    ], 
    "editor.action.moveLinesDownAction": [
        { "keys": ["ctrl+super+down"], "command": "swap_line_down" },
    ]

    
};


// read sublime key bindings


// convert to VS Code key bindings


// write to package.json contribution.keybindings