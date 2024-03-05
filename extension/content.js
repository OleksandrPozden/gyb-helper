let isWorking = false;
let isLifetime = false;
let isProYearly = false;
let messageList = ["LIFETIME", "LIFETIME__NOT_CLICKED", "MONTHLY", "YEARLY", "PRO_YEARLY", "NOTHING"];
let limitNumberOfVisits = 8;
let pickUpCountryList = ["united states", "canada", "united kingdom", "australia", "new zealand"];
let pickUpEmailList = ["bigpond.com", "aol.com", "att.net", "verizon.net", "comcast.net"]
let pickUpStateList = ["FL", "CA", "CO", "NY", "MA", "WA"]

let isCountryAllowed = (country) => {
  country = country.toLowerCase().trim();
  if (pickUpCountryList.includes(country)
    || country.includes("zealand")
    || (country.includes("united") 
      && (country.includes("states")
        || country.includes("kingdom")
        )
      )
    ){
    return true;
  }
}

let main = async () => {
  console.log("main() was invoked")
  while (isWorking==true) {
    await new Promise(r => setTimeout(r, 10));
    try {
      const rows = document.querySelectorAll('.css-14wsju2');
      // const nameElements = document.getElementsByClassName("css-1nv9oho");
      // const names = Array.from(nameElements).filter(el => el.innerHTML === 'Oscar').map(el => el.innerHTML);
      // const activeSessions = names.length
      for (let element of rows) {
        const id = element.getAttribute('data-testid');
        const numberOfVisits = element.querySelector(".css-1eh3oew .css-plwatf").textContent;
        const country = element.querySelector('.css-f2kktt').textContent;
        const buttonElement = element.querySelector('.css-1hb5p1j>div button');
        const urlElement = element.querySelector('.css-1xicsyo');
        const url = urlElement.getAttribute('href');

        
        if (!buttonElement || !buttonElement.textContent.toLowerCase().includes("start chat")) {
          continue;
        }
        if (messageList.includes(urlElement.innerHTML)){
          continue;
        }
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
        console.log(url);
        console.log(data);
        let message = data.message;
        let customerEmail = data.customer_email;
        let customerAddress = data.address;
        urlElement.innerHTML = message;

        if (message === "LIFETIME" && isLifetime==true){
          if (numberOfVisits > limitNumberOfVisits || !isCountryAllowed(country)){
            message += "__NOT_CLICKED";
          }
          else{
            await new Promise(r => setTimeout(r, 400));
            buttonElement.click();
          }
        }
        if (message === "PRO_YEARLY" && isProYearly==true){
          if (customerAddress.toLowerCase().includes("united states") &&
              pickUpStateList.includes(customerAddress.substring(0, 2)) &&
              pickUpEmailList.includes(customerEmail.split("@")[1]) &&
              numberOfVisits < limitNumberOfVisits
            ){
              await new Promise(r => setTimeout(r, 400));
              buttonElement.click();
          }
        }
        
      }
    } catch (error) {
      console.log("An error occurred:", error);
    }
  }
}

let runApp = (is_lifetime, is_pro_yearly) => {
  if (isWorking == false) {
    console.log("started")
    isWorking = true
    isLifetime = is_lifetime
    isProYearly = is_pro_yearly
    main()
    
  }
}

let stopApp = () => {
  console.log("stopped")
  isWorking = false
}

chrome.storage.local.get(["state", "is_lifetime", "is_pro_yearly"]).then(result => {
  console.log("Get information on state")
  console.log(result)
  if (result.state == 'working') {
    runApp(result.is_lifetime, result.is_pro_yearly);
  }
  else {
    stopApp();
  }
})

chrome.storage.onChanged.addListener((changes, areaName) =>{
  if (changes.is_lifetime != undefined){
    console.log(`IsLifetime is ${changes.is_lifetime.newValue}`)
    isLifetime = changes.is_lifetime.newValue;
  }
  else if (changes.is_pro_yearly != undefined){
    console.log(`IsProYearly is ${changes.is_pro_yearly.newValue}`)
    isProYearly = changes.is_pro_yearly.newValue;
  }
  else { 
    if (changes.state.newValue == 'working'){
      runApp()
    }
    else {
      stopApp();
    }
  }
});
