import React, {useState, useEffect} from 'react'
import '../style.css'
import Sidebar from './Sidebar'
import Editor from './Editor'
// import { data } from "../data"
import Split from "react-split"
import {nanoid} from "nanoid"


export default function App() {
    const [notes, setNotes] = React.useState(
        () => JSON.parse(localStorage.getItem("notes")) || []
    )    
    const [currentNoteId, setCurrentNoteId] = useState(
        (notes[0] && notes[0].id) || ""
    )

    useEffect(() => {
        localStorage.setItem("notes", JSON.stringify(notes))
    }, [notes])
    
    function createNewNote() {
        const newNote = {
            id: nanoid(),
            body: "# Type your markdown note's title here"
        }
        setNotes(prevNotes => [newNote, ...prevNotes])
        setCurrentNoteId(newNote.id)
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
    
    function findCurrentNote() {
        return notes.find(note => {
            return note.id === currentNoteId
        }) || notes[0]
    }

    function deleteNote(event, noteId) {
        event.stopPropagation()
        console.log(noteId)
        setNotes(oldNotes => oldNotes.filter(oldNote => oldNote.id !== noteId))
        console.log(notes)
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
                    currentNote={findCurrentNote()}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                {
                    currentNoteId && 
                    notes.length > 0 &&
                    <Editor 
                        currentNote={findCurrentNote()} 
                        updateNote={updateNote} 
                    />
                }
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
