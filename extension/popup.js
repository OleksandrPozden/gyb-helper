
const imageElement = document.getElementById('image');
const buttonElement = document.getElementById('clickButton');
const containerElement = document.getElementById('container');
const checkIsLifetime = document.getElementById('checkIsLifetime');
const checkIsProYearly = document.getElementById('checkIsProYearly');

let stateWork = (is_lifetime, is_pro_yearly) => {
    imageElement.src = 'image2.jpg';
    buttonElement.classList.add('green');
    buttonElement.textContent = 'Working';
    containerElement.classList.add('green');
    checkIsLifetime.disabled = false;
    checkIsLifetime.checked = is_lifetime;
    checkIsLifetime.parentElement.classList.add('active');
    checkIsProYearly.disabled = false;
    checkIsProYearly.checked = is_pro_yearly;
    checkIsProYearly.parentElement.classList.add('active');
}
let stateStop = (is_lifetime, is_pro_yearly) => {
    imageElement.src = 'image1.jpg';
    buttonElement.classList.remove('green');
    buttonElement.textContent = 'START';
    containerElement.classList.remove('green');
    checkIsLifetime.disabled = true;
    checkIsLifetime.checked = is_lifetime;
    checkIsLifetime.parentElement.classList.remove('active');
    checkIsProYearly.disabled = true;
    checkIsProYearly.checked = is_pro_yearly;
    checkIsProYearly.parentElement.classList.remove('active');
}
chrome.storage.local.get(["state","is_lifetime", "is_pro_yearly"]).then((result) => {
    console.debug(result)
    if (result.state == "working"){
        stateWork(result.is_lifetime, result.is_pro_yearly)
    }
    else{
        stateStop(result.is_lifetime, result.is_pro_yearly)
    }
});
buttonElement.addEventListener('click', () => {
    if (!buttonElement.classList.contains('green')) {
        chrome.storage.local.set({ state: "working"}).then(() => {
            console.log("Worker is started!");
            stateWork(checkIsLifetime.checked, checkIsProYearly.checked);
        });

    } else {
        chrome.storage.local.set({ state: "stopped" }).then(() => {
            console.log("Worker is stopped!");
            stateStop(checkIsLifetime.checked, checkIsProYearly.checked);
        });

    }
});

checkIsLifetime.addEventListener('change', () => {
    if (checkIsLifetime.checked) {
        chrome.storage.local.set({ is_lifetime: true }).then(() => {
            console.log("Lifetime is set!");
        });
    }
    else {
        chrome.storage.local.set({ is_lifetime: false }).then(() => {
            console.log("Lifetime is unset.");
        });
    }
});

checkIsProYearly.addEventListener('change', () => {
    if (checkIsProYearly.checked) {
        chrome.storage.local.set({ is_pro_yearly: true }).then(() => {
            console.log("Pro yearly is set!");
        });
    }
    else {
        chrome.storage.local.set({ is_pro_yearly: false }).then(() => {
            console.log("Pro yearly is unset.");
        });
    }
});