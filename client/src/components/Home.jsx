import React from 'react';
import ContactsList from '../chatbox/ContactsList';
import ChatWindow from '../chatbox/ChatWindow';
import '../styles/chatroom.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ToggleItem from './ToggleItem';

function Home() {


  return (
    <div className="container-fluid h-100 chatbox-container">
      <div>
        <ToggleItem></ToggleItem>
      </div>
      <div className="row justify-content-center h-100">
        <ContactsList /> 
        <ChatWindow />
      </div>
      <div className='logout-btn'>
      </div>
    </div>
  );
}

export default Home;
