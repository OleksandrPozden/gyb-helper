let isWorking = false;
let isLifetime = false;
let isProYearly = false;
let isJpLifetime = false;
let IsProOCRPromo = false;
let limitChats = 4;
let messageList = ["LIFETIME", "LIFETIME__NOT_CLICKED", "MONTHLY", "YEARLY", "PRO_YEARLY", "JP-LIFETIME", "NOTHING","PRO+OCR_PROMO"];
let limitNumberOfVisits = 3;
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
      const rows = document.querySelectorAll('.css-1vd7r1n');
      const nameElements = document.getElementsByClassName("css-1nv9oho");
      const names = Array.from(nameElements).filter(el => el.innerHTML === 'Oscar' || el.innerHTML === 'Anna').map(el => el.innerHTML);
      let activeSessions = names.length

      for (let element of rows) {
        const id = element.getAttribute('data-testid');
        const numberOfVisits = element.querySelector(".css-1eh3oew .css-plwatf").textContent;
        const country = element.querySelector('.css-f2kktt').textContent;
        const buttonElement = element.querySelector('.css-1hb5p1j>div button');
        const urlElement = element.querySelector('.css-1xicsyo');
        const url = urlElement.getAttribute('href');
        const placeForOrderId = element.querySelector('.css-yuv2pa');
        
        if (!buttonElement || !buttonElement.textContent.toLowerCase().includes("start chat")) {
          continue;
        }
        if (messageList.includes(urlElement.innerHTML)){
          continue;
        }
        console.log(buttonElement.textContent.toLowerCase());
        console.log(urlElement.innerHTML);
        console.log(activeSessions);
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
        let customerEmail = data.customer_email;
        let customerAddress = data.address;
        let orderID = data.order_id;
        urlElement.innerHTML = message;
        placeForOrderId.parentElement.innerHTML = orderID;

        if (activeSessions >= limitChats){
          console.log("activeSessions >= limitChats")
          continue;
        }
        chatting = element.querySelector(".css-1nv9oho");
        if (message === "LIFETIME" && isLifetime==true){
          if (numberOfVisits > limitNumberOfVisits || !isCountryAllowed(country)){
            message += "__NOT_CLICKED";
          }
          else{
            console.log("clicked");
            await new Promise(r => setTimeout(r, 400));
            activeSessions += 1;
            element.parentElement.style.backgroundColor = "#6cf8a2";
            //chatting.innerHTML = 'Oscar'
            buttonElement.click();
          }
        }
        if (message === "PRO_YEARLY" && isProYearly==true){
          if (customerAddress.toLowerCase().includes("united states") &&
              pickUpStateList.includes(customerAddress.substring(0, 2)) &&
              pickUpEmailList.includes(customerEmail.split("@")[1]) &&
              numberOfVisits < limitNumberOfVisits
            ){
              console.log("clicked");
              await new Promise(r => setTimeout(r, 400));
              activeSessions += 1;
              element.parentElement.style.backgroundColor = "#6cf8a2";
              //chatting.innerHTML = 'Oscar'
              buttonElement.click();
          }
        }
        if (message === "JP-LIFETIME" && isJpLifetime==true){
          if (numberOfVisits < limitNumberOfVisits){
              console.log("clicked jp-lifetime");
              await new Promise(r => setTimeout(r, 400));
              activeSessions += 1;
              element.parentElement.style.backgroundColor = "#6cf8a2";
              //chatting.innerHTML = 'Oscar'
              buttonElement.click();
          }
        }
        if (message === "PRO+OCR_PROMO" && IsProOCRPromo==true){
          if (numberOfVisits < limitNumberOfVisits){
              console.log("clicked pro+ocr (promo)");
              await new Promise(r => setTimeout(r, 400));
              activeSessions += 1;
              element.parentElement.style.backgroundColor = "#6cf8a2";
              buttonElement.click();
          }
        }
        
      }
    } catch (error) {
      console.log("An error occurred:", error);
    }
  }
}

let runApp = (is_lifetime, is_pro_yearly, is_jp_lifetime, is_pro_ocr, limit_chats) => {
  if (isWorking == false) {
    console.log("started")
    isWorking = true
    isLifetime = is_lifetime
    isJpLifetime = is_jp_lifetime
    isProYearly = is_pro_yearly
    IsProOCRPromo = is_pro_ocr
    limitChats = limit_chats || 4
    main()
    
  }
}

let stopApp = () => {
  console.log("stopped")
  isWorking = false
}

chrome.storage.local.get(["state", "is_lifetime", "is_jp_lifetime", "is_pro_ocr", "is_pro_yearly"]).then(result => {
  console.log("Get information on state")
  console.log(result)
  if (result.state == 'working') {
    runApp(result.is_lifetime, result.is_pro_yearly, result.is_jp_lifetime, result.is_pro_ocr, result.limit_chats);
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
  else if (changes.is_jp_lifetime != undefined){
    console.log(`IsJpLifetime is ${changes.is_jp_lifetime.newValue}`)
    isJpLifetime = changes.is_jp_lifetime.newValue;
  }
  else if (changes.is_pro_ocr != undefined){
    console.log(`IsProOCRPromo is ${changes.is_pro_ocr.newValue}`)
    IsProOCRPromo = changes.is_pro_ocr.newValue;
  }
  else if (changes.limit_chats != undefined){
    console.log(`LimitChats is ${changes.limit_chats.newValue}`)
    limitChats = changes.limit_chats.newValue;
  }
  else { 
    if (changes.state.newValue == 'working'){
      chrome.storage.local.get(["is_lifetime", "is_pro_yearly", "is_jp_lifetime", "is_pro_ocr", "limit_chats"]).then(result => {
        runApp(result.is_lifetime, result.is_pro_yearly, result.is_jp_lifetime, result.is_pro_ocr, result.limit_chats);
      });
    }
    else {
      stopApp();
    }
  }
});
