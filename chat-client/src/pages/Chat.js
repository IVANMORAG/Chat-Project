import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/api';
import { initSocket, getSocket, disconnectSocket } from '../services/socket';

const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 300px;
  background-color: #333;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #444;
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
`;

const UserName = styled.span`
  margin-right: auto;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #ccc;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4a69bd;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
  width: 100%;

  &:hover {
    background-color: #3c55a5;
  }
`;

const RoomsList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const RoomItem = styled.div`
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 0.25rem;
  background-color: ${(props) => (props.$active ? '#4a69bd' : 'transparent')};
  
  &:hover {
    background-color: ${(props) => (props.$active ? '#4a69bd' : '#444')};
  }
`;

const ChatArea = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomTitle = styled.div`
  font-weight: bold;
`;

const RoomId = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  max-width: 70%;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 18px;
  background-color: ${(props) => (props.$own ? '#e3f2fd' : '#f1f1f1')};
  align-self: ${(props) => (props.$own ? 'flex-end' : 'flex-start')};
  word-break: break-word;
`;

const MessageSender = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.25rem;
`;

const MessageText = styled.div``;

const MessageInputContainer = styled.form`
  display: flex;
  padding: 1rem;
  border-top: 1px solid #eee;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 0.5rem;
  font-size: 1rem;
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #4a69bd;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #3c55a5;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 1rem;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ModalButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  margin-left: 0.5rem;
  cursor: pointer;
  
  &.cancel {
    background-color: #f1f1f1;
    
    &:hover {
      background-color: #e1e1e1;
    }
  }
  
  &.submit {
    background-color: #4a69bd;
    color: white;
    
    &:hover {
      background-color: #3c55a5;
    }
  }
`;

const NoRoomSelected = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #777;
`;

const Input = styled.input`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const Chat = () => {
  const { user, token, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomId, setRoomId] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

// Modifica el useEffect principal para manejar mejor el socket
useEffect(() => {
  const socket = initSocket(token);
  socketRef.current = socket;

  // Configurar listeners globales una sola vez
  const messageHandler = (data) => {
    console.log('Mensaje recibido:', data);
    setMessages(prev => {
      // Filtrar mensajes optimistas que coincidan con este mensaje real
      const filtered = prev.filter(msg => 
        !msg.isOptimistic || 
        (msg.content !== data.content || msg.sender._id !== data.sender._id)
      );
      
      // Si el mensaje ya existe, no lo agregamos
      const exists = filtered.some(msg => msg._id === data._id);
      
      return exists ? filtered : [...filtered, data].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    });
  };

  socket.on('message', messageHandler);

  // Cargar salas
  fetchRooms();

  return () => {
    socket.off('message', messageHandler);
    disconnectSocket();
  };
}, [token]);

// Simplifica el manejo de rooms
useEffect(() => {
  if (!activeRoom || !socketRef.current) return;

  const socket = socketRef.current;
  
  // Unirse a la sala
  socket.emit('joinRoom', { roomId: activeRoom._id }, (ack) => {
    if (ack?.error) {
      toast.error(ack.error);
    }
  });

  // Escuchar mensajes anteriores
  const previousMessagesHandler = (data) => {
    if (data?.messages) {
      setMessages(data.messages);
    }
  };

  socket.on('previousMessages', previousMessagesHandler);

  return () => {
    socket.off('previousMessages', previousMessagesHandler);
    socket.emit('leaveRoom', { roomId: activeRoom._id });
  };
}, [activeRoom]);

  // Desplazar al final de los mensajes cuando se reciben nuevos
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchRooms = async () => {
    try {
      console.log("Cargando salas...");
      const response = await roomService.getMyRooms();
      console.log("Respuesta completa:", response);
      
      if (response && response.rooms && Array.isArray(response.rooms)) {
        console.log("Salas cargadas correctamente:", response.rooms);
        setRooms(response.rooms);
      } else {
        console.warn("Formato inesperado de respuesta al cargar salas:", response);
        setRooms([]);
      }
    } catch (error) {
      console.error("Error al obtener salas:", error);
      toast.error("No se pudieron cargar las salas. Intenta nuevamente.");
      setRooms([]);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !roomDescription.trim()) {
      toast.error("El nombre y la descripción son obligatorios");
      return;
    }
  
    try {
      const response = await roomService.createRoom({ 
        name: roomName,
        description: roomDescription,
        isPrivate: false
      });
      
      // Normalizar la respuesta
      let newRoom;
      if (response.success && response.data) {
        newRoom = response.data;
      } else if (response.room) {
        newRoom = response.room;
      } else {
        newRoom = response;
      }
      
      console.log("Nueva sala creada:", newRoom);
      
      // Actualizar salas y cambiar a la nueva sala
      setRooms(prevRooms => [...prevRooms, newRoom]);
      setActiveRoom(newRoom);
      setShowCreateModal(false);
      setRoomName('');
      setRoomDescription('');
      toast.success(`Sala "${newRoom.name}" creada correctamente`);
      
      // Recargar salas para asegurar consistencia
      fetchRooms();
    } catch (error) {
      console.error("Error al crear sala:", error);
      toast.error('Error al crear la sala: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      toast.error("El ID de la sala es obligatorio");
      return;
    }

    try {
      const response = await roomService.joinRoom(roomId);
      
      // Normalizar la respuesta
      let joinedRoom;
      if (response.success && response.data) {
        joinedRoom = response.data;
      } else if (response.room) {
        joinedRoom = response.room;
      } else {
        joinedRoom = response;
      }
      
      // Verificar si ya tenemos esta sala en la lista
      if (!rooms.find((r) => r._id === joinedRoom._id)) {
        setRooms(prevRooms => [...prevRooms, joinedRoom]);
      }
      
      setActiveRoom(joinedRoom);
      setShowJoinModal(false);
      setRoomId('');
      toast.success(`Te has unido a la sala "${joinedRoom.name}"`);
      
      // Recargar salas para asegurar consistencia
      fetchRooms();
    } catch (error) {
      console.error("Error al unirse a la sala:", error);
      toast.error('Error al unirse a la sala: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom) return;
  
    const socket = getSocket();
    if (!socket) {
      toast.error("Error de conexión. Intenta recargar la página.");
      return;
    }
  
    // Crear ID temporal único para el mensaje optimista
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mensaje optimista
    const optimisticMessage = {
      _id: tempId,
      content: messageInput,
      roomId: activeRoom._id,
      sender: {
        _id: user.id,
        username: user.username
      },
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
  
    // Agregar mensaje optimista inmediatamente
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');
  
    // Enviar mensaje al servidor CON el username
    socket.emit('sendMessage', {
      roomId: activeRoom._id,
      content: messageInput,
      tempId: tempId,
      username: user.username // Añadimos el username al enviar el mensaje
    }, (ack) => {
      if (ack?.error) {
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
        toast.error(`Error al enviar mensaje: ${ack.error}`);
      }
    });
  };

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setMessages([]);
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await roomService.leaveRoom(roomId);
      if (activeRoom && activeRoom._id === roomId) {
        setActiveRoom(null);
        setMessages([]);
      }
      
      // Eliminar la sala de la lista
      setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
      toast.success("Has salido de la sala correctamente");
    } catch (error) {
      console.error("Error al salir de la sala:", error);
      toast.error("Error al salir de la sala");
    }
  };

  return (
    <ChatContainer>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Chat en Tiempo Real</SidebarTitle>
          <UserInfo>
            <UserName>{user?.username}</UserName>
            <LogoutButton onClick={logout}>Salir</LogoutButton>
          </UserInfo>
        </SidebarHeader>

        <SidebarSection>
          <SectionTitle>Acciones</SectionTitle>
          <Button onClick={() => setShowCreateModal(true)}>Crear Sala</Button>
          <Button onClick={() => setShowJoinModal(true)}>Unirse a Sala</Button>
          <Button onClick={fetchRooms}>Actualizar Salas</Button>
        </SidebarSection>

        <SidebarSection>
          <SectionTitle>Mis Salas</SectionTitle>
          <RoomsList>
            {rooms.map((room) => (
              <RoomItem
                key={room._id}
                $active={activeRoom?._id === room._id}
                onClick={() => handleSelectRoom(room)}
              >
                {room.name}
              </RoomItem>
            ))}
            {rooms.length === 0 && (
              <div style={{ color: '#999', fontSize: '0.9rem' }}>
                No tienes salas. Crea una o únete a una existente.
              </div>
            )}
          </RoomsList>
        </SidebarSection>
      </Sidebar>

      <ChatArea>
        {activeRoom ? (
          <>
            <ChatHeader>
              <RoomInfo>
                <RoomTitle>{activeRoom.name}</RoomTitle>
                <RoomId>ID: {activeRoom._id}</RoomId>
              </RoomInfo>
              <Button 
                onClick={() => handleLeaveRoom(activeRoom._id)}
                style={{ 
                  width: 'auto', 
                  backgroundColor: '#ff6b6b',
                  marginBottom: 0
                }}
              >
                Salir de la sala
              </Button>
            </ChatHeader>
            <MessagesContainer>
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <Message key={index} $own={msg.sender._id === user?.id || msg.sender._id === user?.id}>
                    <MessageSender>{msg.sender.username}</MessageSender>
                    <MessageText>{msg.content}</MessageText>
                  </Message>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>
                  No hay mensajes aún. ¡Sé el primero en escribir!
                </div>
              )}
              <div ref={messagesEndRef} />
            </MessagesContainer>
            <MessageInputContainer onSubmit={handleSendMessage}>
              <MessageInput
                type="text"
                placeholder="Escribe un mensaje..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <SendButton type="submit">Enviar</SendButton>
            </MessageInputContainer>
          </>
        ) : (
          <NoRoomSelected>
            <h2>Selecciona una sala para comenzar a chatear</h2>
            <p>O crea una nueva sala desde el panel izquierdo</p>
          </NoRoomSelected>
        )}
      </ChatArea>

      {/* Modal Crear Sala */}
      {showCreateModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Crear Nueva Sala</ModalTitle>
            <ModalForm onSubmit={handleCreateRoom}>
              <Input
                type="text"
                placeholder="Nombre de la sala"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
              <Textarea
                placeholder="Descripción de la sala"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                required
              />
              <ModalButtons>
                <ModalButton
                  type="button"
                  className="cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </ModalButton>
                <ModalButton type="submit" className="submit">
                  Crear
                </ModalButton>
              </ModalButtons>
            </ModalForm>
          </ModalContent>
        </Modal>
      )}

      {/* Modal Unirse a Sala */}
      {showJoinModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Unirse a una Sala</ModalTitle>
            <ModalForm onSubmit={handleJoinRoom}>
              <Input
                type="text"
                placeholder="ID de la sala"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
              <ModalButtons>
                <ModalButton
                  type="button"
                  className="cancel"
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancelar
                </ModalButton>
                <ModalButton type="submit" className="submit">
                  Unirse
                </ModalButton>
              </ModalButtons>
            </ModalForm>
          </ModalContent>
        </Modal>
      )}
    </ChatContainer>
  );
};

export default Chat;