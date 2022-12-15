import React from 'react';
import { useLocation } from 'react-router-dom';
import { useKeepOutlets } from '@young-design/keepalive';
import './index.css';

const Layout = () => {
  const { pathname } = useLocation();
  const element = useKeepOutlets();
  return (
    <div className="young-layout">
      <div>当前路由: {pathname} ~</div>
      <div>{element}</div>
    </div>
  );
};

export default Layout;
