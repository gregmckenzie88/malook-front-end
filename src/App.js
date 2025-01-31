import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    // Accept only the first .exe file
    const exeFile = acceptedFiles.find((f) => f.path.endsWith('.exe'));
    if (exeFile) {
      setFile(exeFile);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.exe',
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    if (!file) {
      alert('Please upload an .exe file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://127.0.0.1:4000/classify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setResponse(response.data);
    } catch (error) {
      setError(error.response.data.error || 'Error submitting file');
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const renderResponse = () => {
    if (response) {
      const isMalicious = response.classification === 'malicious';
      return (
        <div>
          <p>{response.file_name}</p>
          <p
            style={{
              color: isMalicious ? 'red' : 'green',
              textTransform: 'uppercase',
              fontWeight: 'bolder',
            }}
          >
            {response.classification.charAt(0).toUpperCase() +
              response.classification.slice(1)}
          </p>
          <p>
            Confidence: {(parseFloat(response.confidence) * 100).toFixed(0)}%
          </p>
        </div>
      );
    }

    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }

    return null;
  };

  return (
    <div className="App">
      <h1>Malware Detection 👀</h1>
      <form onSubmit={handleSubmit}>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {file ? (
            <p>File ready to upload: {file.name}</p>
          ) : (
            <p>Drag 'n' drop an .exe file here, or click to select file</p>
          )}
        </div>
        <button type="submit" disabled={loading || !file}>
          Submit
        </button>
      </form>
      {loading && <p className="loading">Loading...</p>}
      {renderResponse()}
    </div>
  );
}

export default App;
