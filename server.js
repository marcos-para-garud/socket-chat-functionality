import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { connect } from "http2";
import { chatModel } from "./chat.schema.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server , {
    cors:{
        origin:'*',
        methods:['GET' , 'POST']
    }
})

io.on('connection', (socket)=>{
    console.log("connection is established");
    socket.on("join" , (data)=>{
        socket.username = data;
        chatModel.find().sort({timestamp:1}).limit(50)
        .then(messages=>{
            socket.emit('load_messages' , messages);

        }).catch(error){
            console.log(error);
        }
    })
    socket.on('new_message' , (message)=>{
        let userMessage = {
            username : socket.username,
            message : message
        }
        const newChat = new chatModel({
            username: socket.username,
            message: message,
            timestamp: new Date()
        })
        newChat.save();
        socket.broadcast.emit('broadcast_message' , userMessage);
    })
    socket.on('disconnect' , ()=>{
        console.log("connection is disconnected");
    });
})

server.listen(3000 , ()=>{
    
    console.log("App is listening on 3000");
    connect();
})