'use client';
import { KeyboardEvent, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import classes from './page.module.css';

export default function Page(){
  const {sendMessage,messages} = useSocket();
  const [message,setMessage] = useState("");

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage(message);
    }
  };
  return (
    <div>
      <div>
        <input 
          onKeyUp={handleKeyPress} 
          onChange={(e)=>setMessage(e.target.value)} 
          className={classes['chat-input']} 
          placeholder="Message..."
        />
        <button 
          onClick={(e)=>sendMessage(message)} 
          className={classes['button']}
        >
          Send
        </button>
      </div>    
      <div>
        {messages.map((msg)=>(
          <li>{msg}</li>
        ))}
      </div> 
    </div>
  )
}