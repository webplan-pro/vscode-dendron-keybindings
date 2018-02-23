start();

function start() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('wanted')) {
            const [name, value] = e.target.textContent.split(':');
            sendToExtension({ name, value });
        } 
    }, false);
}

function sendToExtension(...args) {
    const command = encodeURI('command:extension.getResponseFromGUI?' + JSON.stringify(...args));
    var anchor = document.createElement('a');
    anchor.href = command;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}