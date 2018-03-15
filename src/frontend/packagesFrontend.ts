const buttons = Array.from(document.getElementsByClassName('addExtensionButton') as HTMLCollectionOf<HTMLButtonElement>);

for (const button of buttons) {
    button.addEventListener('click', function () {
        executeCommand('command:workbench.extensions.action.showExtensionsWithId?' + JSON.stringify(this.dataset.extensionid));
    });
}