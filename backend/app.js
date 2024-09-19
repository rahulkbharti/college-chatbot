import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from 'path';
import chalk from 'chalk';


const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};


// Middleware to log the client's IP address
app.use((req, res, next) => {
    const clientIP = req.ip;
    console.log(chalk.yellow('Client IP Address:'), chalk.blue(clientIP)); // Colorize console output
    next();
});

// Serve static files from the 'public' folder
app.use(express.static(path.join('public')));

app.get("/", (req, res) => {
    console.log(chalk.green('Client requested the homepage'));
    res.sendFile(path.join('index.html'));
});

app.get("/getusers" ,(req, res) => {
    try{
        const totalusers =  io.sockets.sockets.size;
        console.log(chalk.green('Client requested the homepage'));
        res.status(200).json({totalusers:totalusers?totalusers:0});
    }
    catch(e){
        console.log(chalk.red(`Error: ${e}`));
        res.status(500).json({totalusers:totalusers?totalusers:0});
    }
});
    
const StatusUpdate = ()=>{
    const totalusers =  io.sockets.sockets.size;
    console.log(chalk.green(`Total Users: ${totalusers}`));
    io.emit("status", {totalusers:totalusers});
}


io.on("connection", (socket) => {
    console.log("room", rooms);
    const userAgent = socket.request.headers['user-agent']; // Get user-agent header
    console.log(chalk.green('A new connection:'), chalk.yellow(socket.id));
    console.log('User-Agent:', userAgent); // Log user-agent
    socket.emit("welcome", "Welcome to heyStranger");
    StatusUpdate();
      socket.on("getPartner", (intrests, callback) => {
        // If no interests are provided, set a default interest to "random"
        if (!intrests || intrests.length === 0) {
            intrests = ["random"];
        }
        socket.intrests = intrests;
        let partnerID;
        let partnerIntrests;
        /*
            Getting the Partner Based on the intrest,
            priority is first 
            If the The first intrest partner is matched then
            make handshake
        */
        for (const intrest of intrests) {
            const users = rooms[intrest];
            if (users != undefined && users.length > 0) {
                //console.log(chalk.blue(`Partner Found ${rooms[intrest][0].id}`));
                partnerID = rooms[intrest][0].id;
                partnerIntrests = rooms[intrest][0].intrests;
                if (partnerID) {
                    try {
                        // Getting The Socket of Partner by the partner Id
                        const partnerSocket = io.sockets.sockets.get(partnerID);

                        // removing The Prtner From All rooms 
                        Object.keys(rooms).forEach(room => {
                            console.log(chalk.red(`user ${partnerID} is removed from ${room}`));
                            const user = rooms[room].findIndex(item => item.id === rooms[room][0].id);
                            if (user !== -1) {
                                rooms[room].splice(user, 1);
                            }
                        })
                        // Handshake is handeling 
                        console.log(chalk.cyan(`Sending Socket Id to ${partnerID}`));
                        socket.emit("handshake", {"partner_id":partnerID, "type":"offer",intrests:partnerSocket?.intrests}, partnerID);
                        console.log(chalk.cyan(`Sending Socket Id to ${socket.id}`));
                        partnerSocket.emit("handshake", {"partner_id":partnerID,type:"answer",intrests:socket?.intrests}, socket.id);

                    } catch (e) {
                        console.log(chalk.red(`error: ${e}`));
                    }
                    break;
                }
            }
        }
        // If not geeing any intrest of partner
        if (partnerID == undefined) {
            for (const intrest of intrests) {
                if (!rooms[intrest]) {
                    rooms[intrest] = [];
                }
                rooms[intrest].push({ id: socket.id, name: intrest,intrests: intrests});
            }
        }
        callback 
        if (!partnerID) {
            callback({
                status: "ok",
                type: "answerer"
            })
        } else {
            callback({
                status: "ok",
                type: "offer",
            })
        }
        // callback({
        //    status :"ok"
        // });
        console.log("All Rooms:", rooms);
    });
    
    socket.on("offer", (offer, id, callback) => {
        // sending the offer
        if (io.sockets.sockets.has(id)) {
            socket.to(id).emit("offer", offer);
            console.log(chalk.green(`Offer Sent to ${id}`));
            callback({
                status: "ok"
            });
        } else {
            callback({
                status: "error"
            });
        }

    });
    socket.on("answer", (answer, id, callback) => {
        // sending the answer
        if (io.sockets.sockets.has(id)) {
            socket.to(id).emit("answer", answer);
            console.log(chalk.green(`Answer Sent to ${id}`));
            callback({
                status: "ok"
            });
        } else {
            callback({
                status: "error"
            });
        }

    })
    socket.on("candidate", (candidate, id, callback) => {
        // sending the candidate
        if (io.sockets.sockets.has(id)) {
            socket.to(id).emit("candidate", candidate);
            console.log(chalk.green(`Candidate Sent to ${id}`));
            callback({
                status: "ok"
            });
        } else {
            callback({
                status: "error"
            });
        }
    });
    socket.on("hangup", (message,id, callback) => {
        // sending the hangup
        if (io.sockets.sockets.has(id)) {
            socket.to(id).emit("hangup",message);
            console.log(chalk.green(`Hangup Sent to ${id}`));
            callback({
                status: "ok"
            });
        } else {
            callback({
                status: "error"
            });
        }
    });
    socket.on("disconnect", () => {
        StatusUpdate();
        console.log(chalk.red('A client disconnected:'), chalk.yellow(socket.id));
    
        // Iterate through each room
        Object.keys(rooms).forEach(room => {
            console.log(chalk.red(`Removing user ${socket.id} from room ${room}`));
    
            // Find the index of the user in the room
            const userIndex = rooms[room].findIndex(item => item.id === socket.id);
            
            // If user is found, remove them from the room
            if (userIndex !== -1) {
                rooms[room].splice(userIndex, 1);
                
                // If the room becomes empty after removal, delete the room
                if (rooms[room].length === 0) {
                    delete rooms[room];
                    console.log(chalk.red(`Room ${room} is now empty and has been removed`));
                }
            }
        });
    });
    
});

server.listen(PORT, () => {
    console.log(chalk.green('Server is listening on port:'), chalk.blue(PORT));
});