
const imageElement = document.getElementById('image');
const buttonElement = document.getElementById('clickButton');

let stateWork = () => {
    imageElement.src = 'image2.jpg';
    buttonElement.classList.add('green');
    buttonElement.textContent = 'Working';
}
let stateStop = () => {
    imageElement.src = 'image1.jpg';
    buttonElement.classList.remove('green');
    buttonElement.textContent = 'Click Me';
}
chrome.storage.local.get(["state"]).then((result) => {
    console.debug(result)
    if (result.state == "working"){
        stateWork()
    }
    else{
        stateStop()
    }
});
buttonElement.addEventListener('click', () => {
    if (!buttonElement.classList.contains('green')) {
        // Button is not green, so turn it green
        stateWork();

        chrome.storage.local.set({ state: "working", ActiveChats: []}).then(() => {
            console.log("Worker is started!");
          });
        // Send a message to the content script in the active tab to start the action
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { "data": "start" }, function (response) {
                console.log(response);
            });
        });
    } else {
        // Button is green, so turn it gray
        stateStop();

        chrome.storage.local.set({ state: "stopped" }).then(() => {
            console.log("Worker is stopped!");
          });

        // Send a message to the content script in the active tab to stop the action (if needed)
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { "data": "stop" }, function (response) {
                console.log(response);
            });
        });
    }
});