 import { Server } from "socket.io";
 import { Redis } from "ioredis";
 import 'dotenv/config';

 const pub = new Redis({
    host: process.env.HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.USERNAME,
    password: process.env.PASSWORD
 })

 const sub = new Redis({
    host: process.env.HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.USERNAME,
    password: process.env.PASSWORD
 })

 class SocketService{
    private _io: Server;
    constructor(){
        console.log('Init socker service...');  
        this._io = new Server({
            cors: {
              allowedHeaders: ["*"],
              origin: "*",
            },
        });
        sub.subscribe('MESSAGES');
    }
    public initListeners(){
        const io = this.io;
        console.log("Init Socket Listeners...");
        io.on('connect',(socket)=>{
            console.log('new socket connected',socket.id);
            socket.on('event:message',async ({message}:{message:string})=>{
                console.log('New message rec.',message);

                //publish msg to redis so that other server can get it
                await pub.publish('MESSAGES',JSON.stringify({message}));
            });
        })
        sub.on('message',(channel,message)=>{
            if(channel==='MESSAGES'){
                console.log('msg from redis: ',message);
                io.emit("message",message);
            }
        });
    }
    get io(){
        return this._io;
    }
 }
 export default SocketService;