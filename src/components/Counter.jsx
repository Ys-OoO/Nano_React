import React from '../nano-react-core/React';

let count = 1;
export default function Counter({ baseCount }) {
  const handleClick = function () {
    console.log('click');
    ++count;
    React.update();
  };
  return (
    <div>
      <div>Count Props:{baseCount}</div>
      <div>Count State:{count}</div>
      <button onClick={handleClick}>Click</button>
    </div>
  );
}
