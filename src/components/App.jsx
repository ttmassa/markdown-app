import React, {useState, useEffect, useCallback} from 'react'
import '../style.css'
import Sidebar from './Sidebar'
import Editor from './Editor'
import Split from "react-split"
import { onSnapshot, doc, addDoc, deleteDoc, setDoc} from 'firebase/firestore'
import { notesCollection, db } from '../firebaseConfig'


export default function App() {
    const [notes, setNotes] = useState([])    
    const [currentNoteId, setCurrentNoteId] = useState("")
    const [tempNoteText, setTempNoteText] = useState("")

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
            // Sync up our local notes with the snapshot data   
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

    // Set tempNoteText to the note's text
    useEffect(() => {
        if (currentNote) {
            setTempNoteText(currentNote.body)
        }
    }, [currentNote])

    // Debouncing to save number of request
    useEffect(() => {
        const timeoutID = setTimeout(() => {
            // Everytime a change is made (except selecting a note), we update tempNoteText
            if (tempNoteText !== currentNote.body) {
                updateNote(tempNoteText)
            }
        }, 500)

        return () => clearTimeout(timeoutID)
    }, [tempNoteText])

    // Sort the notes array by time of update
    const sortedArray = notes.sort((a, b) => b.updatedAt - a.updatedAt)
    
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }
    
    // Set every changes to the correct note in db
    async function updateNote(text) { 
        const refDoc = doc(db, "notes", currentNoteId) 
        await setDoc(refDoc, {body: text, updatedAt: Date.now()}, {merge: true})
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
                    notes={sortedArray}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                <Editor
                    tempNoteText={tempNoteText}
                    setTempNoteText={setTempNoteText}
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
