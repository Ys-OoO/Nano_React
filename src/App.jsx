import Counter from './components/Counter.jsx';
import React from './nano-react-core/React.js';

let baseCount = 10;
function App() {
  const handleClick = function () {
    ++baseCount;
    React.update();
  };
  return (
    <div>
      <p>Hello 🫡</p>
      <p style="color:red">Nano React</p>
      <button onClick={handleClick}>Click</button>
      <Counter baseCount={baseCount} />
    </div>
  );
}
export default App;
