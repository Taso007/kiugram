import React, { useContext } from 'react';
import { RoomContext } from '../contexts/RoomContext';
import { db } from '../firebase/firebaseConfig';
import { doc, deleteDoc } from "firebase/firestore";
import '../styles/call.css';

function IncomingCallPopup() {
  const { setMode, incomingCall, setIncomingCall } = useContext(RoomContext);

  const handleAcceptCall = () => {
    setMode('join');
    setIncomingCall(null);
  };

  const handleRejectCall = async () => {
    if (incomingCall) {
      await deleteDoc(doc(db, "calls", incomingCall.id));
      setIncomingCall(null);
    }
  };

  return (
    <div className="incoming-call-popup">
      <div className="popup-content">
        <h3>{incomingCall.callerUsername} is calling...</h3>
        <div className="popup-buttons">
          <button className="accept-button" onClick={handleAcceptCall}>Accept</button>
          <button className="reject-button" onClick={handleRejectCall}>Reject</button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallPopup;
