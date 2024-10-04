import '../../styles/registration.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, query, where, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, createUserWithEmailAndPassword, updateProfile } from '../../firebase/firebaseConfig'; 
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import nyanImg from '../../images/cat-nyan-cat.gif';
import galaxy from '../../images/galaxy.png';
import mouse from '../../images/cute-mouse.webp';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

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

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const usernameQuery = query(
        collection(db, 'users'), 
        where('displayName', '==', username)
      );
      const querySnapshot = await getDocs(usernameQuery);
      
      if (!querySnapshot.empty) {
        showSwal('Username is already taken. Please choose another one.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profilePictureUrl = mouse;
      if (profilePicture) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, profilePicture);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      await updateProfile(user, {
        displayName: username,
        photoURL: profilePictureUrl
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: username,
        profilePictureUrl: profilePictureUrl,
        status: "online"
      });

      navigate('/home');
    } catch (error) {
      if (error.code === 'permission-denied') {
        showSwal("You don't have permission to perform this action.");
      } else {
        showSwal("Email or Password is already in use, Please choose another one.");
      }
      console.error('Error:', error.message);
    }
  };

  return (
    <>
      <main>
        <section className="auth-section">
          <div className="auth-container">
            <h1>Sign up</h1>
            <form onSubmit={onSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture</label>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  required
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  required
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="form-control"
                />
              </div>
              <div className="form-group btn-container">
                <Button type="submit" variant="outline-light" className='light-but pink-but'>
                  Sign Up
                </Button>  
              </div>
            </form>
            <p className="text-sm text-center">
              Already have an account? <Link to="/" className='pink-link'>Log in</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Signup;
