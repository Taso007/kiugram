import React, { useState } from 'react';

function Message({ text, time, pfp, username, currentUser, fileURL }) {
  const isSentByCurrentUser = username === currentUser.displayName;
  const formattedTime = time ? new Date(time.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState('');
  const [modalAlt, setModalAlt] = useState('');
  const [isVideo, setIsVideo] = useState(false);

  const checkIsImage = (url) => {
    const extension = url.split('.').pop().split('?')[0];
    return ['jpeg', 'jpg', 'gif', 'png'].includes(extension.toLowerCase());
  };

  const checkIsVideo = (url) => {
    const extension = url.split('.').pop().split('?')[0];
    return ['mp4', 'webm', 'ogg'].includes(extension.toLowerCase());
  };

  const handleFileZoom = (src, alt, isVideo) => {
    setModalSrc(src);
    setModalAlt(alt);
    setIsVideo(isVideo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSrc('');
    setModalAlt('');
  };

  return (
    <div className={`d-flex flex-column align-items-${isSentByCurrentUser ? 'end' : 'start'} mb-4`}>
      {!isSentByCurrentUser && (
        <div className="username">{username}</div>
      )}
      <div className={`d-flex justify-content-${isSentByCurrentUser ? 'end' : 'start'} mb-2`}>
        {!isSentByCurrentUser && (
          <div className="img_cont_msg">
            <img src={pfp} className="rounded-circle user_img_msg" alt="user" />
          </div>
        )}
        <div className={`msg_cotainer${isSentByCurrentUser ? '_send' : ''}`}>
          {text}
          {fileURL && (
            <div className="message-attachment">
              {checkIsImage(fileURL) ? (
                <img 
                  src={fileURL} 
                  alt="attachment" 
                  onClick={() => handleFileZoom(fileURL, 'attachment', false)}
                  className='message-file'
                  style={{ cursor: 'pointer'}}
                />
              ) : checkIsVideo(fileURL) ? (
                <video 
                  controls 
                  alt="attachment" 
                  onClick={() => handleFileZoom(fileURL, 'attachment', true)}
                  className='message-file'
                  style={{ cursor: 'pointer'}}
                >
                  <source src={fileURL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                  <a 
                    href={fileURL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: 'white' }}
                  >
                    {fileURL}
                  </a>
              )}
            </div>
          )}
          <span className={`msg_time${isSentByCurrentUser ? '_send' : ''}`}>{formattedTime}</span>
        </div>
        {isSentByCurrentUser && (
          <div className="img_cont_msg">
            <img src={pfp} className="rounded-circle user_img_msg" alt="user" />
          </div>
        )}
      </div>
      {modalOpen && (
        <div id="myModal" className="modal" style={{ display: 'block' }}>
          <span className="close" onClick={closeModal}>&times;</span>
          {isVideo ? (
            <video className="modal-content" controls>
              <source src={modalSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : ( 
            <img className="modal-content" id="img01" src={modalSrc} alt={modalAlt} />
          )}
          <div id="caption">{modalAlt}</div>
        </div>
      )}
    </div>
  );
}

export default Message;
