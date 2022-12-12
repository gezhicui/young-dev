import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import KeepAliveLayout, { useKeepOutlets, KeepAliveContext } from '@young-design/keepalive';

import Layout from './layout';
import Home from './pages/home';
import Users from './pages/users';

const App = () => {
  return (
    <KeepAliveLayout keepalive={['/', '/users']}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </HashRouter>
    </KeepAliveLayout>
  );
};

const root = ReactDOM.createRoot(document.getElementById('malita') as Element);
root.render(React.createElement(App));
