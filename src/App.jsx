import React, { useEffect, useState } from './nano-react-core/React.js';
function Foo() {
  const [count, setCount] = useState(10);
  const [str, setStr] = useState('x');

  useEffect(() => {
    console.log('Foo str updating', str);

    return () => {
      console.log('cleanup effects');
    };
  }, [str]);

  useEffect(() => {
    console.log('Foo first Rendering');
    return () => {
      console.log('无依赖不会被执行');
    };
  }, []);

  const handleClick = () => {
    setCount(11);
    setStr((prev) => prev + 'x');
  };
  return (
    <div>
      FOO:{count}
      <br />
      Str:{str}
      <br />
      <button onClick={handleClick}>Click</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Foo></Foo>
    </div>
  );
}
export default App;
