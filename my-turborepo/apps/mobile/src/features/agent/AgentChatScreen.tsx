import React, { useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Card, Text } from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

interface ChatMessage {
  id: string;
  text: string;
  author: 'user' | 'agent';
  timestamp: Date;
}

const AgentChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Default map region (example coordinates - can be customized)
  const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      author: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.author === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.agentMessageContainer,
        ]}
      >
        <Card
          style={[
            styles.messageCard,
            isUser ? styles.userMessageCard : styles.agentMessageCard,
          ]}
        >
          <Card.Content>
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.agentMessageText,
              ]}
            >
              {item.text}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={defaultRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        />
      </View>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Ask me anything about traffic, civic information, or local services!
              </Text>
            </View>
          }
        />
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Type your question..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
          multiline={false}
        />
        <IconButton
          icon="send"
          mode="contained"
          size={24}
          onPress={handleSendMessage}
          disabled={inputText.trim() === ''}
          style={styles.sendButton}
          iconColor="#fff"
          containerColor={inputText.trim() === '' ? '#ccc' : '#6200ee'}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    minHeight: 250,
  },
  map: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  agentMessageContainer: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    elevation: 1,
  },
  userMessageCard: {
    backgroundColor: '#6200ee',
  },
  agentMessageCard: {
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  agentMessageText: {
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  sendButton: {
    margin: 0,
  },
});

export default AgentChatScreen;