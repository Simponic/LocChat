import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from './auth_context';
import { io } from 'socket.io-client';

export const useChat = (chatRoom) => {
  const [messages, setMessages] = useState([]);
  const [connections, setConnections] = useState([]);
  const messageRef = useRef([]);
  const connectionsRef = useRef([]);
  const [socket, setSocket] = useState({});
  const [authToken] = useContext(AuthContext);

  useEffect(() => {
    if (chatRoom?.id) {
      const socket = io({
        query: {
          chatRoomId: chatRoom.id,
        },
        auth: {
          token: authToken,
        },
      });
      socket.on('connect', () => {
        setSocket(socket);
      });
      socket.on('new-message', (message) => {
        messageRef.current.push(message);
        setMessages([...messageRef.current]);
      });
      socket.on('userlist', ({ users }) => {
        connectionsRef.current = users;
        setConnections([...connectionsRef.current]);
      });
      return () => {
        socket.off('new-message');
        socket.close();
      };
    }
  }, [chatRoom]);

  const sendMessage = (message) => {
    if (socket?.emit) {
      socket.emit('message', message);
    }
  };

  return [connections, messages, sendMessage];
};
