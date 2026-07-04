import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 24 }}>
        <h1>Job Scheduler Dashboard</h1>
        <p>Core dashboard shell is ready.</p>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
