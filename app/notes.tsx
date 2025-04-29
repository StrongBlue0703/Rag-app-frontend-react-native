import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Header from '@/components/ui/Header';
import ChatComponent from '@/components/chat/ChatComponent';
import { useAuth } from '@/contexts/AuthContext';
import { useNote } from '@/contexts/NoteContext';
import { BACKEND_URL } from '@/config/api';
interface Note {
  date: string;
  time: string;
  text: string;
}

export default function Notes() {
  const { getToken, isAuthenticated, authenticate } = useAuth();
  const { Notes, setNotes, currentNote, setCurrentNote } = useNote();
  const [search, setSearch] = useState('');
  const [userLoading, setUserLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | undefined>();

  const toggleNote = (index: number) => {
    setSelectedNoteIndex(index);
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleRemoveNote = async (index: number) => {
    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/notes/${Notes[index].date}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(prevNotes => prevNotes.filter((_, i) => i !== index));
      setExpandedNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      setSelectedNoteIndex(undefined);
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note. Please try again.');
    }
  };

  useEffect(() => {
    // Fetch notes from the server
    const fetchNotes = async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (!isAuthenticated) {
            try {
              await authenticate();
            } catch (error) {
              console.error('Authentication failed:', error);
              Alert.alert('Error', 'Failed to authenticate. Please try again.');
              setUserLoading(false);
              return;
            }
          } else {
            Alert.alert('Error', 'User token is missing. Please log in again.');
            setUserLoading(false);
            return;
          }
        }
        console.log('Fetching notes from:', `${BACKEND_URL}/notes`);

        const response = await fetch(`${BACKEND_URL}/notes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch notes: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
        setNotes([]);
      }
    };

    fetchNotes();
  }, []);

  // Filter notes by search
  const filteredNotes = Notes.filter(note =>
    note.date.includes(search) ||
    note.time.includes(search) ||
    (note.text?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <View style={styles.outerContainer}>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={(text: string) => setSearch(text)}
          />
        </View>
        {/* Notes List */}
        {filteredNotes.map((note, idx) => (
          <View key={idx} style={[styles.noteContainer, note.text && { backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#4D2EC5" }]}>
            <TouchableOpacity 
              style={styles.noteHeaderRow}
              onPress={() => toggleNote(idx)}
            >
              <Text style={styles.noteTitle}>{note.date}</Text>
              <Text style={styles.noteDate}>{note.time}</Text>
            </TouchableOpacity>
            {expandedNotes.has(idx) && note.text && (
              <Text style={[styles.noteContent, { color: idx % 2 === 1 ? "#FFFFFF" : "#000000" }]}>{note.text}</Text>
            )}
          </View>
        ))}
      </ScrollView>
      <ChatComponent 
        onRemoveNote={handleRemoveNote}
        selectedNoteIndex={selectedNoteIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ececec',
  },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 18,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    color: '#fff',
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  noteContainer: {
    backgroundColor: '#000',
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 10,
    padding: 0,
    overflow: 'hidden',
  },
  noteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#000000',
  },
  noteTitle: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  noteDate: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 15,
  },
  noteContent: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
