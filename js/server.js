var fs = require('fs'),
    http = require('http'),
    sys = require('sys');

var server = http.createServer(function(req, response) {
  fs.readFile('../onesheet.html', function(err, data) {
    response.writeHead(200, {'Content-Type' : 'text/html'});
    response.write(data);
    response.end();
  });
});
server.listen(8125);

var everyone = require('now').initialize(server);

var CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var STRING_LEN = 4;
function uniqueString() {
  var str = "";
  for (var i = 0; i < STRING_LEN; i++) {
    str += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return str;
}

// Associative array of all the notes, keyed by note id.
notes = {};

everyone.now.createNewNote = function() {
  sys.puts("newNote got called!");
  var id;
  do {
    id = uniqueString();
  } while (typeof notes[id] !== "undefined");
  this.now.redirectToNewNote(id);
  sys.puts("returning " + id);
};

everyone.now.initializeNote = function(clientId, noteId, numPosts) {
  if (typeof notes[noteId] === "undefined") {
    sys.puts("new note created for " + noteId);
    notes[noteId] = [];
  }
  else {
    sys.puts("loading posts: " + JSON.stringify(notes[noteId]));
    sys.puts(clientId);
    for (var i = numPosts; i < notes[noteId].length; i++) {
      var post = notes[noteId][i];
      this.now.receivePost(post.name, post.text, post.time, (post.clientId == clientId));
    }
  }
}

everyone.now.sendPost = function(clientId, name, text, time) {
  sys.puts("received post " + text + " from " + name);
  notes[this.now.noteId].push({ clientId: clientId, name: name, text: text, time: time});
  everyone.now.filterSendPost(name, text, time, this.now.clientId, this.now.noteId);
}

everyone.now.filterSendPost = function(name, text, time, clientId, noteId) {
  sys.puts("params: " + clientId + " " + noteId);
  sys.puts("for: " + this.now.clientId + " " + this.now.noteId);
  if (this.now.noteId == noteId && this.now.clientId != clientId) {
    this.now.receivePost(name, text, time);
  }
}
