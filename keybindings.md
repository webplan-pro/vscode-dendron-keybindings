| Name | Description | Command | Mac | Windows | Linux |
| :---------: | :---------: | :---------: | :---------: | :---------: | :----------: |
 | Lookup | Lookup a note | dendron.lookupNote | cmd+l | alt+l | alt+l |
 | Lookup (Direct Child) | By default, unless you are at the root of your workspace, Dendron performs a fuzzy search of all notes that match your current hierarchy prefix. This is useful to see your entire sub-tree in one glance but can be overwhelming if you have a lot of notes. The directChildOnly filter is a toggle that limits lookup depth to one level deeper than the current value. It will also filter out stub notes. This filter is useful when exploring notes one level of depth at a time. | dendron.lookupNote | cmd+l cmd+c | alt+l alt+c | alt+l alt+c |
 | Extract selection | Selection in the active text editor will be extracted to be appended to the note that you looked up. | dendron.lookupNote | cmd+l cmd+e | alt+l alt+e | altl alt+e |
 | Selection to link | Selection in the active text editor will be used to create the note path. The note path will be created with the following pattern: {current-path}.{slug-of-selection} A slug is the human readable portion of an url | dendron.lookupNote | cmd+l cmd+l | alt+l alt+l | alt+l alt+l |
 | Journal lookup | Lookup note path will be determined by the journal configuration in dendron.yml. | dendron.lookupNote | cmd+l cmd+o | alt+l alt+o | alt+l alt+o |
 | Scratch lookup | Lookup note path will be determined by the scratch configuration in dendron.yml. | dendron.lookupNote | cmd+l cmd+s | alt+l alt+s | alt+l alt+s |
 | Lookup (Hotizontal Split) | The result of the lookup will be opened in the column directly right of the active editor. | dendron.lookupNote | cmd+l cmd+t | alt+l alt+t | alt+l alt+t |
 | Copy note link | The result of the lookup will be copied to the clipboard as a markdown link. | dendron.lookupNote | cmd+l cmd+c | alt+l alt+c | alt+l alt+c |
 | Select multiple items | Select multiple items in the lookup bar. This lets you open multiple notes at once. | dendron.lookupNote | cmd+l cmd+w | alt+l alt+w | alt+l alt+w |
 | Select multiple items and copy note link | Select multiple items in the lookup bar. This lets you open multiple notes at once and copy the note link to the clipboard. | dendron.lookupNote | cmd+l cmd+v | alt+l alt+v | alt+l alt+v |
