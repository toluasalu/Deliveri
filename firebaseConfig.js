import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore/lite';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyBhqqGbCwlHV1IMSAspk9G5Z85_i9CAJtk',
    authDomain: 'aiitis-d0a88.firebaseapp.com',
    databaseURL: 'https://aiitis-d0a88.firebaseio.com',
    projectId: 'aiitis-d0a88',
    storageBucket: 'aiitis-d0a88.firebasestorage.app',
    messagingSenderId: '615540829538',
  appId: '1:615540829538:web:49182f95b1b5188875903b',
  measurementId: 'G-YX2HL6Q62K',
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

export const createNewDoc = async (collectionName, latitude, longitude) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            latitude,
            longitude,
          });
          console.log("Document written with ID: ", docRef.id);
            try {
              await AsyncStorage.setItem('documentID', docRef.id);
            } catch (e) {
              // saving error
              console.error('Error saving docID:', e);
            }
          return docRef;
    } catch (error) {
        console.error("Error adding document: ", error);
    }
  }
