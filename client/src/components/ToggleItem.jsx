import React, { useState, useContext } from 'react';
import sadCatIMG from '../images/PikPng.com_sad-cat-png_4810149.png';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { RoomContext } from '../contexts/RoomContext';
import cuteIMG from '../images/strawberry-kawaii.webp';
import { auth, db, deleteUser } from '../firebase/firebaseConfig'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ToggleItem() {
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const navigate = useNavigate();
  const { setRoomID, setprofilepic, setusername, setActivity } = useContext(RoomContext);
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      const updateStatus = async () => {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            status: 'offline',
          });
        }
      };
      updateStatus();

      setRoomID('groupchat');
      setprofilepic(cuteIMG);
      setusername("KIUgram");
      setActivity("online");

      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleActionMenu = () => {
    setActionMenuVisible(!actionMenuVisible);
  };

  const handleDeleteUser = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(user);
      navigate('/');
    } catch (error) {
      console.error('Error deleting user and their data:', error);
    }
  };

  const handleProfile = () => {
    Swal.fire({
      title: user.displayName,
      text: `My bio...`,
      imageUrl: user.photoURL || cuteIMG,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Custom image"
    });
  };


  return (
    <>
      <span id="action_menu_btn" onClick={toggleActionMenu}>
        <i className="fas fa-ellipsis-v"></i>
      </span>
      <div className="action_menu" style={{ display: actionMenuVisible ? 'block' : 'none' }}>
        <ul>
          <li onClick={handleProfile}>
            <i className="fas fa-user-circle"></i>
            Profile
          </li>
          <li onClick={handleLogout}>
            <i className="fas fa-ban"></i>
            Log Out
          </li>
          <li className='sign-out' onClick={handleDeleteUser}>
            <img src={sadCatIMG} className='fas sad-cat-toggle' alt="Sad Cat" />
            LEAVE!
          </li>
        </ul>
      </div>
    </>
  );
}

export default ToggleItem;
