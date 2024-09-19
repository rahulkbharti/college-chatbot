const chatbot_open_button = document.getElementById("chatbot-open-button");
const chatbot_close_button = document.getElementById("chatbot-close-button");
const chatbot = document.getElementById("chatbot")


if(chatbot_open_button){
    chatbot_open_button.onclick = ()=>{
         if(chatbot){
             chatbot.style.display ="block";
             chatbot_open_button.style.display ="none";
         }
    }
  }
  if(chatbot_close_button){
     chatbot_close_button.onclick  = ()=>{
         if(chatbot){
          chatbot.style.display ="none";
          chatbot_open_button.style.display ="block";
         }
     }
  }
  