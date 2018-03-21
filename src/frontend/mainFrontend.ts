(function () {
    /* Useful for extending to other import types like snippets */
    // const navMenu: HTMLElement = document.querySelector('#navigation_menu') as HTMLElement;
    // navMenu.addEventListener('click', function (e: MouseEvent) {
    //     const item = e.target;
    //     if (item instanceof HTMLElement && item.classList.contains('item')) {
    //         this.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    //         item.classList.add('active')

    //         const newPageToShow = item.dataset['navtype'];
    //         document.querySelectorAll('.import-category').forEach((i) => i.classList.add('hidden'));
    //         document.querySelector(`#${newPageToShow}`).classList.remove('hidden');
    //     }
    // });

    // global listener for browse button since dimmer adds one dynamically.
    document.addEventListener('click', function (e) {
        if (e.target && e.target instanceof HTMLElement) {
            if (e.target.classList.contains('browseButton')) {
                executeCommand('command:extension.userClickedOnBrowseButtonFromGUI');
            }
        }
    });
})()



function executeCommand(cmd: string): void {
    const command = encodeURI(cmd);
    console.log(command);
    var anchor = document.createElement('a');
    anchor.href = command;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}