import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>CORTEXIA Test</h1>
      <p>Si vous voyez ce message, React fonctionne !</p>
      <button onClick={() => alert('Click fonctionne !')}>
        Tester
      </button>
    </div>
  );
}

export default TestApp;
