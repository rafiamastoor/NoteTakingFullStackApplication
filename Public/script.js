/*When browser window is loaded, this function will fetch notes from notes.json and display 
them on browser*/
window.onload = () => {
    fetch('/notes')
    .then(res => res.json())
    .then(notes => {
        notes.forEach((note,index) => rendernote (note.text,index));
    });
}

/*This function will make a new div with notes and icons */
function rendernote(text,index){
    if(!text.trim()) return;
    const note = document.createElement('div');
    note.className = 'note';
    const content = document.createElement('p');
    content.textContent = text;
    const actions = document.createElement('div');
    actions.className = 'actions';
    const update = document.createElement('span');
    update.className = 'update';
    update.textContent = '🖍';
    const delButton = document.createElement('span');
    delButton.className = 'delete';
    delButton.textContent = '🗑';

    /*If update icon is clicked, user will be prompted to add new note.
    PUT method of server.js will be called */
    update.onclick = () => {
        let newText = '';
        
        do {
            newText = prompt('Edit your note(Upto 200 characters)', content.textContent);
            if (newText === null) return;

        } while (newText.length > 200);

        fetch(`/notes/${index}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newText })
        })
        .then(res => {
        if (res.status === 409) {
            alert('Another note already has this content!');
            return;
            }
            if (res.ok) {
            content.textContent = newText;
            }
        });
    };

    /*If delete button is clicked, delete method of server'js is called */
    delButton.onclick = () =>{
        note.remove();
        fetch(`/notes/${index}` ,{
            method: 'DELETE'
        });
    }
    //appending new note to noteGrid
    actions.append(update,delButton);
    note.append(content,actions);
    document.getElementById('noteGrid').appendChild(note);
}

/*When button is pressed, render new note by called POST method of server.js*/
function createNote() {
  const text = document.getElementById('noteText').value;
  if (!text.trim()) return;

  fetch('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  .then(res => {
    if (res.status === 409) {
      alert('This note already exists!');
      return;
    }
    return res.json();
  })
  .then(data => {
    rendernote(text, data.id);
  });
  document.getElementById('noteText').value = '';
}
