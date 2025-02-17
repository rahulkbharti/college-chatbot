
const message_box = document.getElementById("message-box");
const text_input = document.getElementById("text-input");
const send_button = document.getElementById("send-button");
const chatbot_open_button = document.getElementById("chatbot-open-button");
const chatbot_close_button = document.getElementById("chatbot-close-button");
const chatbot = document.getElementById("chatbot")

const socket = io("$SOCKET_SERVER_URL");


function formatResponse(response) {
  // Replace special characters and newlines for better HTML formatting
  let formattedResponse = response
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\* ([^\n]+)/g, '<li>$1</li>') // List items
    .replace(/\n/g, '<br>'); // New lines

  // Wrap the list items with <ul> tags
  formattedResponse = formattedResponse.replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>');

  // Wrap the entire response in a <div> for styling or further manipulation
  formattedResponse = `<div class="formatted-response">${formattedResponse}</div>`;

  return formattedResponse;
}

socket.on("welcome", (e) => {
  console.log(e);
  message_box.innerHTML = ` <div class="message-recieve">
            Hello I Am Collage chatbot. How I can help you today?
          </div>;`
})
socket.on("message", (message) => {
  console.log(message);
  message_box.innerHTML += `<div class="message-recieve">
                            ${formatResponse(message)}
                           </div>`
  message_box.scrollTop = message_box.scrollHeight;
})
if (send_button) {
  send_button.onclick = () => {
    if (text_input && (text_input.value != null && text_input.value != "")) {
      message_box.innerHTML += `<div class="message-send">
                                 ${text_input.value}
                               </div>`
      message_box.scrollTop = message_box.scrollHeight;
      socket.emit("message", text_input.value);
      text_input.value = ""
    }
  }
}
if (text_input) {
  text_input.addEventListener('keydown', function (event) {
    const tagText = event.target.value.trim();
    if (event.key === 'Enter' && tagText !== '') {
      message_box.innerHTML += `<div class="message-send">
        ${text_input.value}
      </div>`
      message_box.scrollTop = message_box.scrollHeight;
      socket.emit("message", text_input.value);
      text_input.value = ""
    }
  })
}


if (chatbot_open_button) {
  chatbot_open_button.onclick = () => {
    if (chatbot) {
      chatbot.style.display = "block";
      chatbot_open_button.style.display = "none";
    }
  }
}
if (chatbot_close_button) {
  chatbot_close_button.onclick = () => {
    if (chatbot) {
      chatbot.style.display = "none";
      chatbot_open_button.style.display = "block";
    }
  }
}


