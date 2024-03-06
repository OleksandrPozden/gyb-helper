
const imageElement = document.getElementById('image');
const buttonElement = document.getElementById('clickButton');
const containerElement = document.getElementById('container');
const checkIsLifetime = document.getElementById('checkIsLifetime');
const checkIsProYearly = document.getElementById('checkIsProYearly');
const inputLimitChats = document.getElementById('limitChats');
const buttonSubmitLimitChats = document.getElementById('submitLimitChats');
const infoBanner = document.getElementById('info-banner');

let stateWork = (is_lifetime, is_pro_yearly, limit_chats) => {
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
    inputLimitChats.disabled = false;
    inputLimitChats.value = limit_chats;
    buttonSubmitLimitChats.disabled = false;
    buttonSubmitLimitChats.classList.add('active');
    inputLimitChats.parentElement.classList.add('active');

}
let stateStop = (is_lifetime, is_pro_yearly, limit_chats) => {
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
    inputLimitChats.disabled = true;
    inputLimitChats.value = limit_chats;
    buttonSubmitLimitChats.disabled = true;
    buttonSubmitLimitChats.classList.remove('active');
    inputLimitChats.parentElement.classList.remove('active');
}
chrome.storage.local.get(["state","is_lifetime", "is_pro_yearly", "limit_chats"]).then((result) => {
    result.limit_chats = result.limit_chats || 4;
    console.debug(result)
    if (result.state == "working"){
        stateWork(result.is_lifetime, result.is_pro_yearly, result.limit_chats)
    }
    else{
        stateStop(result.is_lifetime, result.is_pro_yearly, result.limit_chats)
    }
});
buttonElement.addEventListener('click', () => {
    if (!buttonElement.classList.contains('green')) {
        chrome.storage.local.set({ state: "working"}).then(() => {
            console.log("Worker is started!");
            stateWork(checkIsLifetime.checked, checkIsProYearly.checked, inputLimitChats.value);
        });

    } else {
        chrome.storage.local.set({ state: "stopped" }).then(() => {
            console.log("Worker is stopped!");
            stateStop(checkIsLifetime.checked, checkIsProYearly.checked, inputLimitChats.value);
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

buttonSubmitLimitChats.addEventListener('click', () => {
    chrome.storage.local.set({ limit_chats: parseInt(inputLimitChats.value) }).then(() => {
        console.log("Limit chats is set!");
    });
    infoBanner.style.display = 'block';
    setTimeout(() => {
        infoBanner.style.display = 'none'; // Hide the element after 3000ms
    }, 2000);
});