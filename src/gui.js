class WebSockets {
    constructor() {
        this.ws = this.__setupWebsocket();
    }

    __setupWebsocket() {
        let ws = new WebSocket(`ws://localhost:${WS_PORT}`);
        ws.onopen = function () {
            ws.onmessage = (arg) => {
                let msgObj = JSON.parse(arg.data);
                onIncomingMsg(msgObj, this)
            };
        }.bind(this);
        return ws;
    }

    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }
}

start();

function start() {
    let websockets = new WebSockets();
    addEventListeners(websockets);
}

function addEventListeners(websockets) {
    const classes = document.querySelectorAll('.wanted');
    for (let cls of classes) {
        cls.addEventListener('click', function () {
            websockets.send(this.textContent + ' has been clicked!');
        });
    }
}

function onIncomingMsg(msgObj, websockets) {
    let settingsUL = document.querySelector('#submlime-settings');
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(`${msgObj.name}:${msgObj.value}`));
    li.addEventListener('click', function () {
        const [name, value] = this.textContent.split(':');
        websockets.send({ name, value });
    });
    settingsUL.appendChild(li);
}

// TODO: use or remove
// runCommand('workbench.action.showCommands')
function runCommand(command) {
    var anchor = document.createElement('a');
    anchor.href = `command:${command}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    console.log(`tried to run '${command}'`);
}