import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Home = () => {
  const [text, setText] = React.useState('Hello Malita!');
  const [count, setCount] = useState(0);
  return (
    <>
      <p
        onClick={() => {
          setText('Hi!');
        }}
      >
        {text}
      </p>
      <p className="malita-home">{count}</p>
      <p>
        <button onClick={() => setCount(count => count + 1)}> Click Me! Add!</button>
      </p>
      <Link to="/users">go to Users</Link>
      <br />
    </>
  );
};

export default Home;
