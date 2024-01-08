import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);

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
      console.log(response.data);
      alert('✅ File submitted successfully');
    } catch (error) {
      console.error('Error submitting file:', error);
      alert('❌ Error submitting file');
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {file ? (
            <p>File ready to upload: {file.name}</p>
          ) : (
            <p>Drag 'n' drop an .exe file here, or click to select file</p>
          )}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
