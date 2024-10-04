import '../../styles/registration.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, updateProfile } from '../../firebase/firebaseConfig';
import { doc, setDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from '../../firebase/firebaseConfig'; 
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import nyanImg from '../../images/cat-nyan-cat.gif';
import galaxy from '../../images/galaxy.png';
import mouse from '../../images/cute-mouse.webp'

const ProfilePic = () => {
  const navigate = useNavigate();
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  const showSwal = (text) => {
    Swal.fire({
      title: `<h1>Oops!</h1><div>${text}</div>`,
      width: 600,
      padding: "3em",
      color: "white",
      background: `#fff url(${galaxy})`,
      backdrop: `
        rgba(0,0,123,0.4)
        url(${nyanImg})
        left top
        no-repeat
      `,
    });
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const defaultProfilePictureUrl = mouse;
    const finalProfilePictureUrl = profilePictureUrl || defaultProfilePictureUrl;

    try {
      const user = auth.currentUser;

      await updateProfile(user, {
        displayName: username,
        photoURL: finalProfilePictureUrl
      });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: username,
        profilePictureUrl: finalProfilePictureUrl,
        status: "online"
      });
      navigate('/home');
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <>
      <main>
        <section className="auth-section">
          <div className="auth-container">
            <h1>Profile Picture</h1>
            <form onSubmit={onSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="userName">Profile Picture</label>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  value={profilePictureUrl}
                  accept="image/*"
                  onChange={(e) => setProfilePictureUrl(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group btn-container">
                <Button type="submit" variant="outline-light" className='light-but pink-but'>
                    Skip
                </Button> 
                <Button type="submit" variant="outline-light" className='light-but pink-but'>
                    Save
                </Button>  
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

export default ProfilePic;
