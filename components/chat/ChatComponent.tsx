import { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TypingIndicator from '../common/TypingIndicator';
import ConnectionStatusDialog from '../common/ConnectionStatusDialog';
import { useWebSocket, MessageType } from '@/contexts/WebSocketContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  loading?: boolean;
}

const MessageItem = memo(({ item }: { item: Message }) => (
  <View
    style={[
      styles.messageBubble,
      item.sender === 'user'
        ? styles.userMessage
        : item.sender === 'bot'
        ? styles.botMessage
        : styles.systemMessage,
    ]}
  >
    <Text
      style={[
        styles.messageText,
        item.sender === 'bot'
          ? styles.botMessageText
          : item.sender === 'system'
          ? styles.systemMessageText
          : null,
      ]}
    >
      {item.content}
    </Text>
  </View>
));

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<MessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const { sendChatMessage, sendAuthMessage, connectionStatus, lastMessage, wsChat, wsAuth } = useWebSocket();
  const prevLastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastMessage && lastMessage !== prevLastMessageRef.current) {
      prevLastMessageRef.current = lastMessage;
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        content: lastMessage,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, newMessage]);
      setConversationHistory((prev) => [...prev, { role: 'assistant', content: lastMessage }]);
      setIsTyping(false);
    }
  }, [lastMessage]);

  const sendMessage = useCallback(() => {
    if (inputMessage.trim() === '' || connectionStatus !== 'connected') return;

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      content: inputMessage,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newMessage]);
    const newAuthMessage: MessageType = { role: 'user', content: inputMessage };
    const updatedConversationHistory = [...conversationHistory, newAuthMessage];
    setConversationHistory(updatedConversationHistory);
    
    setIsTyping(true);
    console.log(wsChat)
    console.log("---------------------------")
    console.log(wsAuth)
    if (wsChat && wsChat.readyState === WebSocket.OPEN) {
      sendChatMessage(updatedConversationHistory);
    } else if (wsAuth && wsAuth.readyState === WebSocket.OPEN) {
      sendAuthMessage(updatedConversationHistory);
    } else {
      console.error('No active WebSocket connection available');
    }

    setInputMessage('');
  }, [inputMessage, connectionStatus, sendChatMessage, sendAuthMessage, conversationHistory, wsChat, wsAuth]);

  const handleUpload = useCallback(() => {
    router.push('/repositoryManagement');
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    return <MessageItem item={item} />;
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ConnectionStatusDialog />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
      />

      {isTyping && connectionStatus === 'connected' && <TypingIndicator isVisible={true} />}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Ionicons name="cloud-upload-sharp" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            connectionStatus !== 'connected' && styles.disabledInput,
          ]}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          editable={connectionStatus === 'connected'}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            connectionStatus !== 'connected' && styles.disabledButton,
          ]}
          onPress={sendMessage}
          disabled={connectionStatus !== 'connected'}
        >
          <Ionicons
            name="send-sharp"
            size={24}
            color={connectionStatus === 'connected' ? 'black' : '#999'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default memo(ChatComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060606',
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#FFD700',
  },
  messageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#000000',
  },
  systemMessageText: {
    color: '#000000',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  disabledInput: {
    backgroundColor: '#E5E5EA',
  },
  sendButton: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  uploadButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});