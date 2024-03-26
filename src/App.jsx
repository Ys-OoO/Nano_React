import Counter from './components/Counter.jsx';
import React from './nano-react-core/React.js';

function App() {
  return (
    <div>
      <p>Hello 🫡</p>
      <p style="color:red">Nano React</p>
      <Counter baseCount={1} />
      <Counter baseCount={2} />
    </div>
  );
}
export default App;
