/*Defining express, filesystem, path, port */
const express = require('express');
const fs = require('fs');
const path = require('path');
const port = 3000;
const app = express();

app.use(express.json());
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname,'public')));
const notesFile = path.join(__dirname,'notes.json');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

/*GET method to display saved notes on application loading*/
app.get('/notes',(request,response) => {
    fs.readFile(notesFile,'utf8', (error,data) => {
        if(error) return response.status(500).send('Error reading notes');
        response.json(JSON.parse(data || '[]'));
    });
});

/*POST method to write new note in notes.json*/
app.post('/notes', (request, response) => {
  const newNote = request.body;

  fs.readFile(notesFile, 'utf8', (error, data) => {
    let notes = JSON.parse(data || '[]');

  const isDuplicate = notes.some(note => note.text.trim().toLowerCase() === newNote.text.trim().toLowerCase());
    if (isDuplicate) {
      return response.status(409).send('Duplicate note');
    }

    notes.push(newNote);

    fs.writeFile(notesFile, JSON.stringify(notes, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Write error:', writeErr);
        return response.status(500).send('Error saving note');
      }
      response.status(201).json({ id: notes.length - 1 });
    });
  });
});

/*Update method to update existing notes by id */
app.put('/notes/:id', (request, response) => {
  const id = parseInt(request.params.id);
  const updatedNote = request.body.text;

  fs.readFile(notesFile, 'utf8', (error, data) => {
    let notes = JSON.parse(data || '[]');

    const normalizedText = updatedNote.trim().toLowerCase();
    const isDuplicate = notes.some((note, idx) => note.text.trim().toLowerCase() === normalizedText && idx !== id);

    if (isDuplicate) {
      return response.status(409).send('Duplicate note');
    }
    
    if (notes[id]) {
      notes[id].text = updatedNote;
      fs.writeFile(notesFile, JSON.stringify(notes, null, 2), () => {
        response.status(200).send('Note updated');
      });
    } else {
      response.status(404).send('Note not found');
    }
  });
});

/*Delete method to splice a note*/
app.delete('/notes/:id', (request, response) => {
  const id = parseInt(request.params.id);

  fs.readFile(notesFile, 'utf8', (error, data) => {
    let notes = JSON.parse(data || '[]');
    if (notes[id]) {
      notes.splice(id, 1);
      fs.writeFile(notesFile, JSON.stringify(notes, null, 2), () => {
        response.status(200).send('Note deleted');
      });
    } else {
      response.status(404).send('Note not found');
    }
  });
});

/*application should keep on listening to port 3000 for any CRUD operations*/
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
