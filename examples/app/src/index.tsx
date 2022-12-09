import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import KeepAliveLayout, { useKeepOutlets, KeepAliveContext } from '@young-design/keepalive';

const Layout = () => {
  const { pathname } = useLocation();
  const element = useKeepOutlets();
  return (
    <div>
      <div>当前路由: {pathname}</div>
      <div>{element}</div>
    </div>
  );
};

const Hello = () => {
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
      <p>{count}</p>
      <p>
        <button onClick={() => setCount(count => count + 1)}> Click Me! Add!</button>
      </p>
      <Link to="/users">go to Users</Link>
      <br />
      <Link to="/me">go to Me</Link>
    </>
  );
};

const Users = () => {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();
  const { dropByCacheKey } = useContext<any>(KeepAliveContext);
  return (
    <>
      <p> Users </p>
      <p>{count}</p>
      <p>
        <button onClick={() => setCount(count => count + 1)}> Click Me! Add++!</button>
      </p>
      <p>
        <button onClick={() => dropByCacheKey(pathname)}> Click Me! Clear Cache!</button>
      </p>
      <Link to="/">go Home</Link>
    </>
  );
};

const Me = () => {
  return (
    <>
      <p> Me </p> <Link to="/">go Home</Link>
    </>
  );
};

const App = () => {
  return (
    <KeepAliveLayout keepalive={['/users', '/me']}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Hello />} />
            <Route path="/users" element={<Users />} />
            <Route path="/me" element={<Me />} />
          </Route>
        </Routes>
      </HashRouter>
    </KeepAliveLayout>
  );
};

const root = ReactDOM.createRoot(document.getElementById('malita'));
root.render(React.createElement(App));
