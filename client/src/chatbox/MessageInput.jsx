import React, { useState, useContext, useRef } from 'react';
import { db, auth, storage } from '../firebase/firebaseConfig';
import { addDoc, serverTimestamp, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RoomContext } from '../contexts/RoomContext';

function MessageInput({ newMessage, setNewMessage }) {
  const [attachment, setAttachment] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const messagesRef = collection(db, "messages");
  const { roomID } = useContext(RoomContext);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (newMessage === "" && !attachment) return;

    let fileURL = null;
    if (attachment) {
      const fileRef = ref(storage, `attachments/${attachment.name}`);
      await uploadBytes(fileRef, attachment);
      fileURL = await getDownloadURL(fileRef);
      setAttachment(null);
      setFileName('');
    }

    const message = {
      text: newMessage,
      createdAt: serverTimestamp(),
      room: roomID,
      user: {
        username: auth.currentUser.displayName,
        userpfp: auth.currentUser.photoURL
      },
      fileURL: fileURL
    };

    await addDoc(messagesRef, message);
    setNewMessage("");
    fileInputRef.current.value = '';
  }; 

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setAttachment(file);
    setFileName(file ? file.name : '');
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }; 

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        return;
      }
      event.preventDefault();
      handleSendMessage(event); 
    }
    if (event.key === 'Backspace') {
      if (fileName && newMessage.includes(`Attachment: ${fileName}`)) {
        event.preventDefault(); 
        setAttachment(null);
        setFileName('');
        setNewMessage(newMessage.replace(`\n\nAttachment: ${fileName}`, ''));
      }
    }
  };

  return (
    <div className="card-footer">
      <div className="input-group">
        <div className="input-group-append">
          <span className="input-group-text attach_btn" onClick={handleAttachmentClick}>
            <i className="fas fa-paperclip"></i>
          </span>
          <input 
            type='file'
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        <textarea
          style={{ resize: "none" }}
          className="form-control type_msg"
          placeholder="Type your message..."
          value={fileName ? `${newMessage}\n\nAttachment: ${fileName}` : newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          id="style-14"
        ></textarea>
        <div className="input-group-append">
          <span className="input-group-text send_btn" onClick={handleSendMessage}><i className="fas fa-location-arrow"></i></span>
        </div>
      </div>
    </div>
  );
}

export default MessageInput;
