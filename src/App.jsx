import React from './nano-react-core/React.js';

let countFoo = 1;
function Foo() {
  console.log('foo');
  const update = React.update();

  const handleClick = () => {
    countFoo++;
    update();
  };
  return (
    <div>
      FOO:{countFoo}
      <button onClick={handleClick}>Click</button>
    </div>
  );
}
let countBar = 1;
function Bar() {
  console.log('bar');
  const update = React.update();
  const handleClick = () => {
    countBar++;
    update();
  };
  return (
    <div>
      FOO:{countBar}
      <button onClick={handleClick}>Click</button>
    </div>
  );
}
function App() {
  return (
    <div>
      <Foo></Foo>
      <Bar></Bar>
    </div>
  );
}
export default App;
