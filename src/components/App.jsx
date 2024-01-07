import React, {useState, useEffect} from 'react'
import '../style.css'
import Sidebar from './Sidebar'
import Editor from './Editor'
import Split from "react-split"
import {nanoid} from "nanoid"


export default function App() {
    const [notes, setNotes] = React.useState(
        () => JSON.parse(localStorage.getItem("notes")) || []
    )    
    const [currentNoteId, setCurrentNoteId] = useState(
        (notes[0] && notes[0].id) || ""
    )

    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]

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

    function deleteNote(event, noteId) {
        event.stopPropagation()
        setNotes(oldNotes => oldNotes.filter(oldNote => oldNote.id !== noteId))
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
                {
                    currentNoteId && 
                    notes.length > 0 &&
                    <Editor 
                        currentNote={currentNote} 
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
