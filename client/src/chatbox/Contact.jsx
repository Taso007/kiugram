import React, { useContext, useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { RoomContext } from '../contexts/RoomContext';


const Contact = ({contactUid, name, imgSrc, status, onRoomChange }) => {
  const { roomID, setRoomID, setprofilepic, setusername, setActivity } = useContext(RoomContext);


  const handleRoomChange = async () => {
    const currentUserUid = auth.currentUser.uid;
    const newRoomID = [currentUserUid, contactUid].sort().join("_");
    setRoomID(newRoomID);
    setprofilepic(imgSrc);
    setusername(handleName());
    setActivity(status);

    await setDoc(doc(db, "rooms", roomID), {
      room: roomID,
      users: [currentUserUid, contactUid]
    });

    onRoomChange(contactUid); 

  };

  const handleName = () => {
    if (name === auth.currentUser.displayName) {
      return "You";
    } else {
      return name;
    }
  };
  

  return (
    <li className={`contact ${status === 'online' ? 'active' : ''}`} onClick={handleRoomChange}>
      <div className="d-flex bd-highlight">
        <div className="img_cont">
          <img src={imgSrc} alt={name} className="rounded-circle user_img" />
          <span className={`online_icon ${status === 'online' ? '' : 'offline'}`}></span>
        </div>
        <div className="user_info">
          <span>{handleName()}</span>
          <p>{status}</p>
        </div>
      </div>
    </li>
  );
};

export default Contact;
