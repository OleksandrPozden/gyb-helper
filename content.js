let isWorking = false;
let messageList = ["LIFETIME", "LIFETIME__NOT_CLICKED", "MONTHLY", "YEARLY", "NOTHING"];
let limitNumberOfVisits = 8;
let pickUpCountryList = ["united states", "canada", "united kingdom", "australia", "new zealand"]

let main = async () => {
  while (isWorking==true) {
    await new Promise(r => setTimeout(r, 10));
    try {
      const rows = document.querySelectorAll('.css-14wsju2');
      for (let element of rows) {
        const id = element.getAttribute('data-testid');
        const numberOfVisits = element.querySelector(".css-8eaugs .css-plwatf").textContent;
        const country = element.querySelector('.css-f2kktt').textContent;
        const buttonElement = element.querySelector('.css-1q1efea>button');
        const urlElement = element.querySelector('.css-1xicsyo');
        const url = urlElement.getAttribute('href');

        if (!buttonElement || !buttonElement.textContent.toLowerCase().includes("start chat")) {
          continue;
        }
        console.log(urlElement.innerHTML);
        console.log(country.toLocaleLowerCase())
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
          if (numberOfVisits > limitNumberOfVisits || !country.toLowerCase().includes(pickUpCountryList)){
            message += "__NOT_CLICKED";
          }
          else{
            button.click();
          }
        }
        urlElement.innerHTML = message;
        
      }
    } catch (error) {
      console.log("An error occurred:", error);
    }
  }
}
console.log("anythin")
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
  console.log("Get information on state")
  console.log(result)
  if (result.state == 'working') {
    runApp();
  }
  else {
    stopApp();
  }
})

chrome.storage.onChanged.addListener((changes, areaName) =>{
  console.log("Listener on changed is set")
  console.log(changes.state)
  if (changes.state.newValue == 'working'){
    runApp()
  }
  else {
    stopApp();
  }
}
)
