import React, { createContext, useContext, useState } from 'react';

const defaultFiles = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React Test</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
  'index.jsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import './style.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <MemoryRouter>
    <App />
  </MemoryRouter>
);
`,
  'App.jsx': `import React, { useState, useEffect } from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import axios from 'axios';

function Home() {
  return <h2>🏠 Welcome to Home Page</h2>;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      alert('Loading users...');
      const res = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(res.data);
      console.log("Users:", res.data);
    } catch (err) {
      alert('Failed to load users');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>👥 Users</h2>
      <button onClick={loadUsers}>Fetch Users</button>
      {loading ? <p>Loading...</p> : null}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

function Contact() {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !msg) {
      alert('Please fill all fields');
      return;
    }
    console.log("Message:", { name, msg });
    history.push('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>📬 Contact Us</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><br />
      <textarea placeholder="Message" value={msg} onChange={(e) => setMsg(e.target.value)} /><br />
      <button type="submit">Send</button>
    </form>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.className = dark ? 'dark' : '';
  }, [dark]);

  return (
    <div className="container">
      <h1>🧪 React Big Example</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
        <Link to="/contact">Contact</Link>
        <button onClick={() => setDark(!dark)}>
          Toggle {dark ? 'Light' : 'Dark'} Mode
        </button>
      </nav>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/users" component={Users} />
        <Route path="/contact" component={Contact} />
      </Switch>
    </div>
  );
}
`,
  'style.css': `body {
  margin: 0;
  font-family: sans-serif;
  background: #f4f4f4;
  padding: 20px;
  transition: background 0.3s, color 0.3s;
}

body.dark {
  background: #121212;
  color: #f0f0f0;
}

.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

body.dark .container {
  background: #1e1e1e;
}

nav {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

nav a {
  text-decoration: none;
  color: #007bff;
}

nav button {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
}
`,
  'package.json': `{
  "name": "react-editor-big",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "axios": "^1.6.0"
  }
}
`};

const FileSystemContext = createContext();

export function FileSystemProvider({ children }) {
  const [files, setFiles] = useState(defaultFiles);
  const [selectedFile, setSelectedFile] = useState('index.jsx');

  const addFile = (filename, content = '') => {
    setFiles(f => ({ ...f, [filename]: content }));
    setSelectedFile(filename);
  };
  const renameFile = (oldName, newName) => {
    setFiles(f => {
      const { [oldName]: oldContent, ...rest } = f;
      return { ...rest, [newName]: oldContent };
    });
    setSelectedFile(newName);
  };
  const deleteFile = (filename) => {
    setFiles(f => {
      const { [filename]: _, ...rest } = f;
      return rest;
    });
    setSelectedFile(Object.keys(files).filter(f => f !== filename)[0] || '');
  };
  const updateFile = (filename, content) => {
    setFiles(f => ({ ...f, [filename]: content }));
  };

  return (
    <FileSystemContext.Provider value={{ files, selectedFile, setSelectedFile, addFile, renameFile, deleteFile, updateFile }}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  return useContext(FileSystemContext);
} 
