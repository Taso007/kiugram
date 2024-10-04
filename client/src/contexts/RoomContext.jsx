import React, { createContext, useState } from 'react';
import cuteIMG from '../images/strawberry-kawaii.webp'


export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [roomID, setRoomID] = useState('groupchat');
  const [profilepic, setprofilepic] = useState(cuteIMG);
  const [username, setusername] = useState('KIUgram');
  const [activity, setActivity] = useState("online");
  const [mode, setMode] = useState('');
  const [incomingCall, setIncomingCall] = useState(null);

  return (
    <RoomContext.Provider value={{ roomID, setRoomID, profilepic, setprofilepic, username, setusername, activity, setActivity, mode, setMode, incomingCall, setIncomingCall }}>
      {children}
    </RoomContext.Provider>
  );
};
