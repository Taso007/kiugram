import React, { useState, useEffect, useContext } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import { collection, orderBy, query, onSnapshot, where } from "firebase/firestore";
import { auth, db } from '../firebase/firebaseConfig';
import { RoomContext } from '../contexts/RoomContext';
import Videos from '../components/Videos';
import IncomingCall from '../components/IncomingCall';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { roomID, profilepic, username, activity, mode, setMode, incomingCall, setIncomingCall } = useContext(RoomContext);

  useEffect(() => {
    if (!roomID) return;

    const queryMessages = query(
      collection(db, "messages"),
      where("room", "==", roomID),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(messages);
    });

    const callQuery = query(collection(db, "calls"), where("room", "==", roomID));
    const unsubscribeCalls = onSnapshot(callQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const callData = change.doc.data();
          if (callData && callData.offer) {
            setIncomingCall({ id: change.doc.id, ...callData, callerUsername: callData.username });
          }
        }
      });
    });

    return () => {
      unsubscribe();
      unsubscribeCalls();
    };
  }, [roomID]);

  const handleVideoClick = () => {
    const url = new URL('/videocall', window.location.origin);
    url.searchParams.set('callId', roomID);
    url.searchParams.set('mode', 'create');
    window.open(url.toString(), '_blank');
  };
  
  return (
    <div className="col-md-8 col-xl-6 chat">
      <div className="card">
        <div className="card-header msg_head">
          <div className="d-flex bd-highlight name-container">
            <div className="img_cont">
              <img src={profilepic} className="rounded-circle user_img" alt="user" />
              <span className={`online_icon ${activity === 'online' ? '' : 'offline'}`}></span>
            </div>
            <div className="user_info">
              <span>{username}</span>
            </div>
            <div className="video_cam">
              <span><i className="fas fa-video" onClick={handleVideoClick}></i></span>
              <span><i className="fas fa-phone"></i></span>
            </div>
          </div>
        </div>
        <div className="card-body msg_card_body" id="style-14">
          {messages.map((message) => (
            <Message 
              key={message.id} 
              text={message.text} 
              fileURL={message.fileURL}
              time={message.createdAt} 
              username={message.user.username} 
              pfp={message.user.userpfp} 
              currentUser={auth.currentUser} 
            />
          ))}
        </div>
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
        />
      </div>
      {mode && <Videos callId={incomingCall ? incomingCall.id : roomID} />}
      {incomingCall && <IncomingCall />} 
    </div>
  );
}

export default ChatWindow;
