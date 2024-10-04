import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import Contact from './Contact';
import { useOnlineStatus } from '../useOnlineStatus';
import { RoomContext } from '../contexts/RoomContext';
import cuteIMG from '../images/strawberry-kawaii.webp'

function ContactsList() {
  const [contacts, setContacts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const isOnline = useOnlineStatus();
  const { roomID, setRoomID, setprofilepic, setusername, setActivity } = useContext(RoomContext);

  useEffect(() => {
    const updateStatus = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          status: isOnline ? 'online' : 'offline',
        });
      }
    };
    updateStatus();
  }, [isOnline]);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(usersList);
      setSearchResults(usersList);
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchInput === '') {
      setSearchResults(contacts);
    } else {
      const filteredResults = contacts.filter(contact =>
        contact.displayName.toLowerCase().includes(searchInput.toLowerCase())
      );
      setSearchResults(filteredResults);
    }
  }, [searchInput, contacts]);

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleGroupRoom = async () => {
    setRoomID('groupchat');
    setprofilepic(cuteIMG);
    setusername("KIUgram");
    setActivity("online");

    await setDoc(doc(db, "rooms", roomID), {
      room: roomID
    });
    await setDoc(doc(db, "messages", roomID), {
      room: roomID
    })
  }
  const handleRoomChange = (contactUid) => {
    const contactIndex = contacts.findIndex(contact => contact.uid === contactUid);
    if (contactIndex > -1) {
      const newContacts = [contacts[contactIndex], ...contacts.filter((_, index) => index !== contactIndex)];
      setContacts(newContacts);
    }
  };

  return (
    <div className="col-md-4 col-xl-3 chat">
      <div className="card mb-sm-3 mb-md-0 contacts_card">
        <div className="card-header">
          <div className="input-group chatbox-inside-container">
            <input 
              type="text" 
              placeholder="Search..." 
              className="form-control search" 
              value={searchInput} 
              onChange={handleInputChange} 
            />
            <div className="input-group-prepend">
              <span className="input-group-text search_btn"><i className="fas fa-search"></i></span>
            </div>
          </div>
        </div>
        <div className="card-body contacts_body" id="style-14">
          <ul className="contacts">
            <li onClick={handleGroupRoom}>
              <div className="d-flex bd-highlight">
                <div className="img_cont">
                  <img src={cuteIMG} className="rounded-circle user_img" />
                </div>
                <div className="user_info">
                  <span>KIUgram</span>
                </div>
              </div>
            </li>
            {searchResults.map((contact, index) => (
              <Contact
                key={index}
                contactUid={contact.uid}
                name={contact.displayName}
                imgSrc={contact.profilePictureUrl}
                status={contact.status}
                onRoomChange={handleRoomChange}
              />
            ))}
          </ul>
        </div>
        <div className="card-footer"></div>
      </div>
    </div>
  );
}

export default ContactsList;
