
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
        stateWork();

        chrome.storage.local.set({ state: "working", ActiveChats: []}).then(() => {
            console.log("Worker is started!");
        });

    } else {
        stateStop();
        chrome.storage.local.set({ state: "stopped" }).then(() => {
            console.log("Worker is stopped!");
        });

    }
});