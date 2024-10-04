import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import Signup from './components/registration/Signup'
import Login from './components/registration/Login';
import { db, auth } from './firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import ProfilePic from './components/registration/ProfilePic';
import Videos from './components/Videos';

function App() {

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      const updateStatus = async () => {
        if (auth.currentUser) {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userDocRef, {
            status: 'offline',
          });
        }
      };
      updateStatus();
    })

    return () => {
      window.removeEventListener('beforeunload', () => {});
    }; 
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/home" element={<Home />} />
        <Route path='/profilepic' element={<ProfilePic/>} />
        <Route path='/videocall' element={<Videos />} />
      </Routes>
    </>
  )
}

export default App
