console.log('gui.js has been launched.');
start();

function start() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('wanted')) {
            const tds = Array.from(e.target.parentElement.getElementsByClassName('td'));
            console.log('tr: ' + e.target.parentElement);
            console.log('tds: ' + tds);
            const [name, value] = [tds[0].textContent, tds[1].textContent];
            
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