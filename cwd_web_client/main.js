function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sendBluetoothPower(state) {
    let debug = document.querySelector('.debug');

    fetch('http://127.0.0.1:8181/bluetooth/power', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state: state })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        debug.innerText = data;
    })
    .catch(error => {
        console.error('Error:', error);
        debug.innerText = `Error: ${error}`;
    });
}

function setBluetoothAgent() {
    let debug = document.querySelector('.debug');

    debug.innerText = 'Setting Bluetooth agent';

    const url = 'http://localhost:8181/bluetooth/agent';
    const dataToSend = {
        mode: 'NoInputNoOutput'
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        debug.innerText = `Got Data: ${JSON.stringify(data, null, 2)}`;
    })
    .catch(error => {
        console.error('Error:', error);
        debug.innerText = `Error: ${error}`;
    });
}

function setDiscoverable() {
    let debug = document.querySelector('.debug');

    debug.innerText = 'Setting Bluetooth as discoverable';

    const url = 'http://127.0.0.1:8181/bluetooth/discoverable';
    const dataToSend = {
        state: 'on'
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        debug.innerText = `Got Data: ${JSON.stringify(data, null, 2)}`;
        checkBluetoothUpdates();
    })
    .catch(error => {
        console.error('Error:', error);
        debug.innerText = `Error: ${error}`;
    });
}

function checkBluetoothUpdates() {
    let debug = document.querySelector('.debug');

    fetch('http://127.0.0.1:8181/bluetooth/check-updates')
    .then(response => response.json())
    .then(data => {
        debug.innerText = `Update: ${JSON.stringify(data, null, 2)}`;
        if (data.output.includes('(yes/no)')) {
            displayPairingPrompt();
        } else {
            setTimeout(checkBluetoothUpdates, 1000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        debug.innerText = `Error: ${error}`;
    });
}

function displayPairingPrompt() {
    let debug = document.querySelector('.debug');
    debug.innerHTML = 'Pairing request detected. <button onclick="respondToPairing(\'yes\')">Yes</button> <button onclick="respondToPairing(\'no\')">No</button>';
}

function respondToPairing(response) {
    let debug = document.querySelector('.debug');

    fetch('http://127.0.0.1:8181/bluetooth/pairing-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ response: response })
    })
    .then(response => response.json())
    .then(data => {
        debug.innerText = `Pairing response sent: ${JSON.stringify(data, null, 2)}`;
        checkBluetoothUpdates();
    })
    .catch(error => {
        console.error('Error:', error);
        debug.innerText = `Error: ${error}`;
    });
}

function getActiveMedia() {
    let debug = document.querySelector('.debug');

    fetch('http://127.0.0.1:8181/bluetooth/active-media')
    .then(response => response.json())
    .then(data => {
        debug.innerText = `Active Media: ${JSON.stringify(data, null, 2)}`;
    })
    .catch(error => {
        console.error('Error:', error);
        debug.innerText = `Error: ${error}`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    let iframe = document.querySelector("#main");

    iframe.src = 'branding/index.html';
});

document.addEventListener('keydown', function(event) {
    let debug = document.querySelector('.debug');
    let iframe = document.querySelector("#main");

    if (iframe) {
        iframe.parentElement.removeChild(iframe);
    }

    debug.innerText = `Clicked: ${event.key}`;

    switch (event.key) {
        case '1':
            console.log('You pressed 1');
            setBluetoothAgent();
            break;
        case '2':
            console.log('You pressed 2');
            setDiscoverable();
            break;
        case '3':
            console.log('You pressed 3');
            getActiveMedia();
            break;
        case '4':
            console.log('You pressed 4');
            break;
        case 'M':
        case 'm':
            console.log('You pressed M');
            break;
        case 'Escape':  // Escape key
            console.log('You pressed ESC');
            checkBluetoothUpdates();
            break;
        case '\r':  // Enter key
            console.log('You pressed ENTER');
            break;
        default:
            // Handle other keys if necessary
            break;
    }
});

document.addEventListener('wheel', function(event) {
    let debug = document.querySelector('.debug');
    let iframe = document.querySelector("#main");

    iframe.src = '';
    
    if (event.deltaY < 0) {
        debug.innerText = 'You scrolled UP';
    } else if (event.deltaY > 0) {
        debug.innerText = 'You scrolled DOWN';
    }
});