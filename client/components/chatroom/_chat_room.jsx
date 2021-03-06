import { useEffect, useState, useContext } from 'react';
import { ApiContext } from '../../utils/api_context';
import { useChat } from '../../utils/use_chat';
import { Link, useParams } from 'react-router-dom';
import { generateGruvboxFromString } from '../../utils/generate_gruvbox';

/*
  A lot of this is stolen from my Docker presentation :).
  https://github.com/USUFSLC/sochat
*/
export const ChatRoom = () => {
  const { id } = useParams();
  const [chatRoom, setChatRoom] = useState('');
  const [active, connections, messages, sendMessage] = useChat(chatRoom);
  const [message, setMessage] = useState('');
  const [color, setColor] = useState(generateGruvboxFromString('placeholder'));
  const [user, setUser] = useState({});
  const api = useContext(ApiContext);

  const fetchUser = async () => {
    const res = await api.get('/users/me');
    if (res.user) {
      setUser(res.user);
      setColor(generateGruvboxFromString(`${res.user.firstName} ${res.user.lastName}`));
    }
  };

  const fetchChatRoom = async (id) => {
    const room = await api.get(`/chat_rooms/${id}`);
    if (room) {
      setChatRoom(room);
    }
  };

  const scrollToBottomOfChat = () => {
    const objDiv = document.getElementById('chat');
    objDiv.scrollTop = objDiv.scrollHeight;
  };

  const sendThisMessage = () => {
    sendMessage(message);
    setMessage('');
  };

  useEffect(() => {
    fetchUser();
    fetchChatRoom(id);
  }, [id]);

  useEffect(() => {
    scrollToBottomOfChat();
  }, [messages]);

  return (
    <div className="container" style={{ border: `1px solid ${color}` }}>
      <div style={{ textAlign: 'center' }}>
        <h2>{chatRoom?.name || `Chat Room ${chatRoom?.id}`}</h2>
      </div>
      <div className="chat-container">
        <div id="chat" className="chat-box">
          {messages.map((message) => (
            <div key={message.id} style={{ lineBreak: 'normal' }}>
              <span style={{ color: generateGruvboxFromString(message.userName) }}>{message.userName}: </span>
              <span>{message.content}</span>
            </div>
          ))}
        </div>
        <div className="chat-connections">
          <h1>Connected Users ({connections.length})</h1>
          <hr />
          <ul>
            {connections.map((user) => (
              <li key={user.id} style={{ color: generateGruvboxFromString(user.userName) }}>
                {user.userName}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        {active ? (
          <>
            <textarea
              placeholder={'Message'}
              className="input"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              rows={1}
              cols={30}
            ></textarea>
            <div className="button" onClick={sendThisMessage}>
              Send
            </div>
          </>
        ) : (
          <div>
            <p>This room has been marked inactive and has been deleted.</p>
          </div>
        )}
        <div className="button">
          <Link to="/">Back to map</Link>
        </div>
      </div>
    </div>
  );
};
