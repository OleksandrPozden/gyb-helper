let isWorking = false;

let main = async () => {
  while (isWorking==true) {
    try {
      console.log("started main process");

      const result = await chrome.storage.local.get(["ActiveChats"])
      const prevActiveChats = result.ActiveChats;
      let curActiveChats = [];

      const rows = document.querySelectorAll('.css-14wsju2');
      for (let element of rows) {
        const id = element.getAttribute('data-testid');
        const button = element.getElementsByClassName('css-1q1efea')[0];
        const url = element.getElementsByClassName('css-1xicsyo')[0].getAttribute('href');

        if (!button.textContent.toLowerCase().includes("start chat")) {
          console.log("skipped row")
          continue;
        }
        console.log(id)
        curActiveChats.push(id);
        if (!prevActiveChats.includes(id)) {
          console.log("make an request")
          const response = await fetch("http://127.0.0.1:5000", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "url": url })
          });

          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }

          const data = await response.json();
          if (data.message == true) {
            const newText = document.createTextNode("LIFETIME");
            const child = button.firstElementChild
            button.insertBefore(newText, child)
            // button.click()
          }
        }
      }
      console.log(curActiveChats)
      await chrome.storage.local.set({ ActiveChats: curActiveChats })
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}

let runApp = () => {
  if (isWorking == false) {
    isWorking = true
    main()
    
  }
}

let stopApp = () => {
  console.log("stopped")
  isWorking = false
}

chrome.storage.local.get(["state"]).then(result => {
  console.log(result)
  if (result.state == 'working') {
    runApp();
  }
  else {
    stopApp();
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.data == 'start') {
    runApp();
  }
  else {
    stopApp();
  }
  sendResponse({ "response": "nice!" })
}
)
