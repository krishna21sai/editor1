import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import './App.css';
import { FileSystemProvider, useFileSystem } from './FileSystemContext';
import FileTree from './FileTree';
import { useEsbuild, ensureEsbuildInitialized } from './useEsbuild';
import { bundleCode } from './bundle';

function EditorPane() {
  const { files, selectedFile, updateFile } = useFileSystem();
  const getLanguage = (filename) => {
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    return 'javascript';
  };

  return (
    <div className="editor-pane">
      <div className="editor-header">Code Editor</div>
      <MonacoEditor
        height="100%"
        language={getLanguage(selectedFile)}
        theme="vs-dark"
        value={files[selectedFile] || ''}
        onChange={(value) => updateFile(selectedFile, value)}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          fontFamily: 'Fira Mono, Consolas, Menlo, monospace',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}

function getImportedPackages(files) {
  const importRegex = /import\s+[^'";]+from\s+['"]([^\.\/][^'";]*)['"]/g;
  const pkgs = new Set();
  for (const [filename, content] of Object.entries(files)) {
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
      let match;
      while ((match = importRegex.exec(content))) {
        pkgs.add(match[1].split('/')[0]); // Handles scoped packages
      }
    }
  }
  return Array.from(pkgs);
}

function getPackageJsonDeps(files) {
  try {
    const pkg = JSON.parse(files['package.json'] || '{}');
    return pkg.dependencies ? Object.keys(pkg.dependencies) : [];
  } catch {
    return [];
  }
}

function OutputPane({ files }) {
  const [error, setError] = React.useState('');
  const [bundledOutput, setBundledOutput] = React.useState('');
  const iframeRef = React.useRef(null);

  const runCode = async () => {
    setError('');
    // Dependency enforcement
    const importedPkgs = getImportedPackages(files);
    const allowedPkgs = getPackageJsonDeps(files);
    const missing = importedPkgs.filter(pkg => !allowedPkgs.includes(pkg) && pkg !== 'react' && pkg !== 'react-dom');
    if (missing.length > 0) {
      setError(`Missing dependencies in package.json: ${missing.join(', ')}`);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = `<html><body><pre style='color: red;'>Missing dependencies in package.json: ${missing.join(', ')}</pre></body></html>`;
      }
      return;
    }
    try {
      await ensureEsbuildInitialized();
      const output = await bundleCode(files);
      setBundledOutput(output);
      
      // Use the actual index.html file from the virtual file system
      let htmlContent = files['index.html'] || '';      
      // If no index.html exists, create a basic one
      if (!htmlContent) {
        htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React Playground</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
      }
      
      // Insert React scripts and bundled code into the HTML
      const scriptTags = `
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script>
          window.addEventListener('error', function(event) {
            window.parent.postMessage({ type: 'iframe-error', message: event.error ? event.error.stack : event.message }, '*');
          });
          try {
            ${output}
          } catch (err) {
            document.body.innerHTML = '<pre style="color: red;">' + err + '</pre>';
            window.parent.postMessage({ type: 'iframe-error', message: err.stack }, '*');
          }
        </script>
      `;
      
      // Insert scripts before closing body tag
      const finalHtml = htmlContent.replace('</body>', `${scriptTags}\n</body>`);
      
      if (iframeRef.current) {
        iframeRef.current.srcdoc = finalHtml;
      }
    } catch (err) {
      setError(err.message);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = `<html><body><pre style='color: red;'>${err.message}</pre></body></html>`;
      }
    }
  };

  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'iframe-error') {
        setError(event.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="output-pane">
      <div className="output-header">Live Output</div>
      <div className="output-content" style={{ height: '100%' }}>
        <iframe
          ref={iframeRef}
          title="output"
          sandbox="allow-scripts"
          style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
        />
        {error && <pre className="error-msg">{error}</pre>}
      </div>
      <button className="run-btn" onClick={runCode}>Run ▶</button>
    </div>
  );
}

function OutputPaneWrapper() {
  const { files } = useFileSystem();
  return <OutputPane files={files} />;
}

export default function Playground() {
  useEsbuild();
  return (
    <FileSystemProvider>
      <div className="split-root">
        <FileTree />
        <EditorPane />
        <OutputPaneWrapper />
      </div>
    </FileSystemProvider>
  );
}
