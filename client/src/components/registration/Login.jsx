import '../../styles/registration.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, db } from '../../firebase/firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import nyanImg from '../../images/cat-nyan-cat.gif';
import galaxy from '../../images/galaxy.png';

const Login = () => { 
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const showSwal = () => {
    Swal.fire({
      title: "<h1>Oops!</h1><div>Email or Password is incorrect please try again.</div>",
      width: 600,
      padding: "3em",
      color: "white",
      background: `#fff url(${galaxy})`,
      backdrop: `
        rgba(0,0,123,0.4)
        url(${nyanImg})
        left top
        no-repeat
      `
    });
  }
  const onLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password); 
      const updateStatus = async () => {
        if (auth.currentUser) {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userDocRef, {
            status: 'online',
          });
        }
      };
      updateStatus();

      navigate('/home');
    } catch (err) {
      showSwal();
      setError('Failed to log in');
      console.log(error);
    }
  };

  return (
    <>
      <main>
        <section className="auth-section">
          <div className="auth-container">
            <h1>Log in</h1>
            <form onSubmit={onLogin} className="auth-form">
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
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  required
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group btn-container">
                <Button type="submit" variant="outline-light" className='light-but pink-but'>
                  Log In
                </Button>                
              </div>
            </form>
            <p className="text-sm text-center">
              No account yet? <Link to="/signup" className='pink-link'>Sign Up</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Login;
