import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from 'path';
import chalk from 'chalk';
import  {model, generationConfig} from "./chatbot.js";
import cors from "cors";
import context from "./collegeinfo.js";
import history from "./context/info.js"

const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*", // Frontend URLs
        methods: ["GET", "POST"]
    }
});


// Middleware to log the client's IP address
app.use((req, res, next) => {
    const clientIP = req.ip;
    console.log(chalk.yellow('Client IP Address:'), chalk.blue(clientIP)); // Colorize console output
    next();
});

async function InitiateChatBot() {
    const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [
           {
            "role":"user",
            "parts":[
                {
                    text: context
                }
            ]
           },
           {
            "role":"model",
            "parts":[
                {
                    "text":"Hello! I am a chatbot, I can help you with your queries. How can I help you today?"
                }
            ]
           }
        ].concat(history)
    });

    // Function to send a message and get a response
    async function sendMessage(message) {
        try{
            const result = await chatSession.sendMessage(message);
            return result.response.text()  // Corrected to return response.text()  
        }
        catch(e){
           return e.statusText;
        }
      
    }

    return { chatSession, sendMessage };
}

io.on("connection", async (socket) => {
    const userAgent = socket.request.headers['user-agent']; // Get user-agent header
    console.log(chalk.green('A new connection:'), chalk.yellow(socket.id));
    console.log('User-Agent:', userAgent); // Log user-agent
    socket.emit("welcome", "Welcome to heyStranger");

    const {chatSession, sendMessage} = await InitiateChatBot();
    
    socket.on("message",async (message)=>{
        const reply = await sendMessage(message);
        // console.log(reply)
        socket.emit("message",reply);
    })

    socket.on("disconnect", () => {
        console.log(chalk.bgRed("Use Disconnected"))
        // chatSession.close();
    });

});

server.listen(PORT, () => {
    console.log(chalk.green('Server is listening on port:'), chalk.blue(PORT));
});