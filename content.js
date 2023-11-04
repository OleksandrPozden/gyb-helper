let isWorking = false;
let messageList = ["LIFETIME", "LIFETIME__NOT_CLICKED", "MONTHLY", "YEARLY", "NOTHING"];
let limitNumberOfVisits = 8;

let main = async () => {
  while (isWorking==true) {
    await new Promise(r => setTimeout(r, 10));
    try {
      const rows = document.querySelectorAll('.css-14wsju2');
      for (let element of rows) {
        const id = element.getAttribute('data-testid');
        const numberOfVisits = element.querySelector(".css-8eaugs .css-plwatf").textContent;
        const button = element.getElementsByClassName('css-1q1efea')[0].firstElementChild;
        const urlElement = element.getElementsByClassName('css-1xicsyo')[0]
        const url = urlElement.getAttribute('href');

        if (!button.textContent.toLowerCase().includes("start chat")) {
          continue;
        }
        if (messageList.includes(urlElement.innerHTML)){
          continue;
        }
        console.log(url);
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
        let message = data.message;
        if (message === "LIFETIME"){
          if (numberOfVisits > limitNumberOfVisits){
            message += "__NOT_CLICKED";
          }
          else{
            button.click();
          }
        }
        urlElement.innerHTML = message;
        
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}

let runApp = () => {
  if (isWorking == false) {
    console.log("started")
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

chrome.storage.onChanged.addListener((changes, areaName) =>{
  if (changes.state.newValues == 'working'){
    runApp()
  }
  else {
    stopApp();
  }
}
)
