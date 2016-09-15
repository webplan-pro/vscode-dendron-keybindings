module.exports = {
    "workbench.action.newWindow": [
        { "command": "new_window" }
    ],
    "workbench.action.closeWindow": [
        { "command": "close_window" }
    ],
    "workbench.action.files.openFileFolder": [
        { "command": "prompt_open" }
    ],
    "workbench.action.previousEditor": [
        { "command": "reopen_last_file" },
        { "keys": ["super+shift+["], "command": "prev_view" },
        { "keys": ["super+alt+left"], "command": "prev_view" },
    ],
    "workbench.action.nextEditor": [
        { "keys": ["super+shift+]"], "command": "next_view" },
        { "keys": ["super+alt+right"], "command": "next_view" },
    ],
    "workbench.action.files.newUntitledFile": [
        { "keys": ["super+n"], "command": "new_file" }
    ],
    "workbench.action.files.save": [
        { "keys": ["super+s"], "command": "save" }
    ],
    "workbench.action.files.saveAs": [
        { "keys": ["super+shift+s"], "command": "prompt_save_as" }
    ],
    "workbench.action.files.saveAll": [
        { "keys": ["super+alt+s"], "command": "save_all" }
    ],
    "workbench.action.closeActiveEditor": [
        { "keys": ["super+w"], "command": "close" },
        { "keys": ["super+k", "super+down"], "command": "close_pane" },
    ],
    "workbench.action.closeAllEditors": [],
    "workbench.action.toggleSidebarVisibility": [
        { "keys": ["super+k", "super+b"], "command": "toggle_side_bar" }
    ],
    "workbench.action.toggleFullScreen": [
        { "keys": ["super+ctrl+f"], "command": "toggle_full_screen" }
    ],
    "cursorUndo": [
        { "keys": ["super+u"], "command": "soft_undo" }
    ],
    "scrollLineUp": [
        { "keys": ["ctrl+alt+up"], "command": "scroll_lines", "args": {"amount": 1.0} }
    ],
    "scrollLineDown": [
        { "keys": ["ctrl+alt+up"], "command": "scroll_lines", "args": {"amount": -1.0} }
    ],
    "hideSuggestWidget": [
        { "command": "hide_auto_complete", "context":
            [
                { "key": "auto_complete_visible", "operator": "equal", "operand": true }
            ]
	    }
    ],
    "editor.action.indentLines": [
        { "command": "indent" }
    ],
    "editor.action.outdentLines": [
        { "command": "unindent" }
    ],
    "tab": [
        { "command": "insert_best_completion", "args": {"default": "\t", "exact": true} },
        { "command": "indent", "context": [
			    { "key": "text", "operator": "regex_contains", "operand": "\n" }
		    ]
        },
        { "keys": ["shift+tab"], "command": "insert", "args": {"characters": "\t"} },
    ],
    "jumpToNextSnippetPlaceholder": [
        { "command": "next_field", "context":
            [
                { "key": "has_next_field", "operator": "equal", "operand": true }
            ]
	    }
    ],
    "acceptSelectedSuggestion": [
        { "command": "commit_completion", "context":
            [
                { "key": "auto_complete_visible" },
                { "key": "setting.auto_complete_commit_on_tab" }
            ]
        },
        { "command": "commit_completion", "context":
            [
                { "key": "auto_complete_visible" },
                { "key": "setting.auto_complete_commit_on_tab", "operand": false }
            ]
        },
    ],
    "outdent": [
        	{ "command": "unindent", "context":
		[
			{ "key": "setting.shift_tab_unindent", "operator": "equal", "operand": true }
		]
	},
    ],
    "jumpToPrevSnippetPlaceholder": [
        	{ "command": "prev_field", "context":
		[
			{ "operator": "equal", "operand": true }
		]
	},
    ],
    "workbench.action.gotoLine": [
        { "command": "show_overlay", "args": {"overlay": "goto", "text": ":"} },
    ],
    "workbench.action.quickOpen": [
        { "command": "show_overlay", "args": {"overlay": "goto", "show_files": true} },
        { "command": "show_overlay", "args": {"overlay": "goto", "show_files": true} },
    ],
    "workbench.action.showCommands": [
        { "command": "show_overlay", "args": {"overlay": "command_palette"} },
    ],
    "workbench.action.gotoSymbol": [
        { "command": "show_overlay", "args": {"overlay": "goto", "text": "@"} },
    ],
    "editor.action.goToDeclaration": [
        { "command": "goto_definition" },
	    { "command": "goto_definition" },
    ],
    "workbench.action.navigateBack": [
        { "command": "jump_back" },
    ],
    "workbench.action.navigateForward": [
        { "command": "jump_forward" },
    ],
    "actions.find": [
        { "command": "show_panel", "args": {"panel": "find", "reverse": false} },
    ],
    "editor.action.nextMatchFindAction": [
        { "command": "find_next" },
        { "command": "next_result" },
    ],
    "editor.action.previousMatchFindAction": [
        { "keys": ["super+shift+g"], "command": "find_prev" },
        { "keys": ["shift+f4"], "command": "prev_result" },
    ],
    "workbench.view.search": [
        { "command": "show_panel", "args": {"panel": "find_in_files"} },
    ],
    "editor.action.moveLinesUpAction": [
        { "command": "swap_line_up" },
    ], 
    "editor.action.moveLinesDownAction": [
        { "command": "swap_line_down" },
    ],
    "editor.action.commentLine": [
        { "command": "toggle_comment", "args": { "block": false } },
	    { "command": "toggle_comment", "args": { "block": true } },
    ],
    "editor.action.copyLinesUpAction": [
        // this isn't a perfect port - duplicate_line will not add \n, copyLinesUpAction will
        { "command": "duplicate_line" },
    ],
    "editor.action.triggerSuggest": [
        { "command": "auto_complete" },
    ],
    "workbench.action.splitEditor": [
        { "command": "new_pane" },
    ],
    "editor.fold": [
        	{ "command": "fold" },
    ],
    "editor.unfold": [
        	{ "command": "unfold" },
    ],
    "editor.foldLevel1": [
        { "command": "fold_by_level", "args": {"level": 1} },
    ],
    "editor.foldLevel2": [
        { "command": "fold_by_level", "args": {"level": 2} },
    ],
    "editor.foldLevel3": [
        { "command": "fold_by_level", "args": {"level": 3} },
    ],
    "editor.foldLevel4": [
        { "command": "fold_by_level", "args": {"level": 4} },
    ],
    "editor.foldLevel5": [
        { "command": "fold_by_level", "args": {"level": 5} },
    ],
    "editor.unfoldAll": [
        { "command": "unfold_all" },
	    { "command": "unfold_all" },
    ],
    "toggleFindRegex": [
        { "command": "toggle_regex", "context":
            [
                { "key": "setting.is_widget", "operator": "equal", "operand": true }
            ]
        },
    ],
    "toggleFindCaseSensitive": [
        { "command": "toggle_case_sensitive", "context":
            [
                { "key": "setting.is_widget", "operator": "equal", "operand": true }
            ]
        },
    ],
    "toggleFindWholeWord": [
        { "command": "toggle_whole_word", "context":
            [
                { "key": "setting.is_widget", "operator": "equal", "operand": true }
            ]
        },
    ],
    "editor.action.showContextMenu": [
        { "command": "context_menu" },
    ],
    "editor.action.insertCursorAtEndOfEachLineSelected" : [
        { "keys": ["shift+ctrl+l"], "command": "split_selection_into_lines" }        
    ]    
};