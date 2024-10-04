import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomContext } from '../contexts/RoomContext';
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, setDoc, onSnapshot, getDocs } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import '../styles/call.css';

function Videos({ callId }) {
  const [webcamActive, setWebcamActive] = useState(false);
  const navigate = useNavigate();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const { roomID, setRoomID, mode } = useContext(RoomContext);

  useEffect(() => {
    const setupSources = async () => {
      try {
        console.log('Local Ref:', localRef.current);
        console.log('Remote Ref:', remoteRef.current); 

        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        const remoteStream = new MediaStream();

        if (localRef.current) {
          localRef.current.srcObject = localStream;
        }

        if (remoteRef.current) {
          remoteRef.current.srcObject = remoteStream;
        } 

        setWebcamActive(true);

        const pc = new RTCPeerConnection();
        const setupConnection = async () => {
          try {
            if (mode === "create") {
              const callDocRef = doc(collection(db, "calls"));
              const offerCandidates = collection(callDocRef, "offerCandidates");
              const answerCandidates = collection(callDocRef, "answerCandidates");

              setRoomID(callDocRef.id);

              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  addDoc(offerCandidates, event.candidate.toJSON());
                }
              };

              const offerDescription = await pc.createOffer();
              await pc.setLocalDescription(offerDescription);

              const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type,
              };

              await setDoc(callDocRef, { offer });

              onSnapshot(callDocRef, (snapshot) => {
                const data = snapshot.data();
                if (data?.answer) {
                  const answerDescription = new RTCSessionDescription(data.answer);
                  pc.setRemoteDescription(answerDescription);
                }
              });

              onSnapshot(answerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                  if (change.type === "added") {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                  }
                });
              });
            } else if (mode === "join") {
              const callDocRef = doc(db, "calls", callId);
              const answerCandidates = collection(callDocRef, "answerCandidates");
              const offerCandidates = collection(callDocRef, "offerCandidates");

              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  addDoc(answerCandidates, event.candidate.toJSON());
                }
              };

              const callData = (await getDoc(callDocRef)).data();

              const offerDescription = callData.offer;
              await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

              const answerDescription = await pc.createAnswer();
              await pc.setLocalDescription(answerDescription);

              const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
              };

              await updateDoc(callDocRef, { answer });

              onSnapshot(offerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                  if (change.type === "added") {
                    let data = change.doc.data();
                    pc.addIceCandidate(new RTCIceCandidate(data));
                  }
                });
              });
            }

            pc.ontrack = (event) => {
              event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
              });
            };

            pc.onconnectionstatechange = () => {
              if (pc.connectionState === "disconnected") {
                hangUp();
              }
            };

          } catch (error) {
            console.error('Error setting up connection: ', error);
          }
        };

        setupConnection();

      } catch (error) {
        console.error('Error setting up sources: ', error);
        alert('Could not access webcam or microphone. Please check your permissions.');
      }
    };

    setupSources();
  }, [mode]);

  const hangUp = async () => {
    const pc = new RTCPeerConnection();

    pc.close();

    if (roomID) {
      const roomRef = doc(db, "calls", roomID);
      const answerCandidates = collection(roomRef, "answerCandidates");
      const offerCandidates = collection(roomRef, "offerCandidates");

      const deleteCandidates = async (candidates) => {
        const snapshot = await getDocs(candidates);
        snapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      };

      await deleteCandidates(answerCandidates);
      await deleteCandidates(offerCandidates);

      await deleteDoc(roomRef);
    }

    window.close();
  };

  return (
    <div className="videos">
      <video ref={localRef} autoPlay playsInline className="local" muted />
      {mode === "join" && <video ref={remoteRef} autoPlay playsInline className="remote" />}

      <div className="buttonsContainer">
        <button onClick={hangUp} disabled={!webcamActive} className="hangup button">
          Hang up
        </button>
      </div>
    </div>
  );
}

export default Videos;
