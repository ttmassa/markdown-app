import React, {useState, useEffect} from 'react'
import '../style.css'
import Sidebar from './Sidebar'
import Editor from './Editor'
import Split from "react-split"
import { onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { notesCollection, db } from '../firebaseConfig'


export default function App() {
    const [notes, setNotes] = React.useState([])    
    const [currentNoteId, setCurrentNoteId] = useState("")

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
            //Sync up our local notes with the snapshot data   
            const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) 
            setNotes(notesArr);
        })

        return unsubscribe
    }, [])

    // Set the default noteId to avoid it being an empty string 
    useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id)
        }
    }, [notes, currentNoteId])
    
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here"
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }
    
    function updateNote(text) {
        setNotes((oldNotes) => {
          // Find the index of the note with the matching id
          const index = oldNotes.findIndex(
            (oldNote) => oldNote.id === currentNoteId
          );

          // moving the note to the top of the array
          const movedNote = oldNotes[index];
          const updatedNotes = [
            { ...movedNote, body: text },
            ...oldNotes.slice(0, index),
            ...oldNotes.slice(index + 1),
          ];

          return updatedNotes;
        });
    }

    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId)
        await deleteDoc(docRef)
    }
    
    return (
        <main>
        {
            notes.length > 0 
            ?
            <Split 
                sizes={[30, 70]} 
                direction="horizontal" 
                className="split"
            >
                <Sidebar
                    notes={notes}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                <Editor 
                    currentNote={currentNote} 
                    updateNote={updateNote} 
                />
            </Split>
            :
            <div className="no-notes">
                <h1>You have no notes</h1>
                <button 
                    className="first-note" 
                    onClick={createNewNote}
                >
                    Create one now
                </button>
            </div>
            
        }
        </main>
    )
}
