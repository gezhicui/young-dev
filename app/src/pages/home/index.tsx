import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Home = () => {
  const [text, setText] = React.useState('Hello young!');
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
      <p className="young-home">{count}</p>
      <p>
        <button onClick={() => setCount(count => count + 1)}> Click Me to Add Num !</button>
      </p>
      <Link to="/users">go to Users</Link>
      <br />
    </>
  );
};

export default Home;
