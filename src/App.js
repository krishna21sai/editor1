import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Babel from '@babel/standalone';
import './App.css';

const DEFAULT_CODE = `
function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <h2>Hello, Krishna!</h2>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click Me</button>
    </div>
  );
}
`.trim();

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [error, setError] = useState('');
  const [Component, setComponent] = useState(() => () => null);

  const runCode = () => {
    setError('');
    try {
      const compiled = Babel.transform(code, { presets: ['react'] }).code;
      // Wrap the compiled code in a function that takes React as an argument
      // eslint-disable-next-line no-eval
      const Comp = eval(`
        (function(React) {
          ${compiled};
          return App;
        })
      `)(React);
      setComponent(() => Comp);
    } catch (err) {
      setError(err.message);
      setComponent(() => () => null);
    }
  };

  return (
    <div className="split-root">
      <div className="editor-pane">
        <div className="editor-header">JSX Editor</div>
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={value => setCode(value)}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            fontFamily: 'Fira Mono, Consolas, Menlo, monospace',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
        <button
          className="run-btn"
          onClick={runCode}
        >Run ▶</button>
      </div>
      <div className="output-pane">
        <div className="output-header">Live Output</div>
        <div className="output-content">
          {error ? (
            <pre className="error-msg">{error}</pre>
          ) : (
            <Component />
          )}
        </div>
      </div>
    </div>
  );
}