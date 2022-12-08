import React from 'react';
import ReactDOM from 'react-dom/client';

const Hello = () => {
  const [text, setText] = React.useState('Hello 萨达发顺丰三!');
  return (
    <span
      onClick={() => {
        setText(`现在的时间是${String(new Date())}`);
      }}
    >
      {text}
    </span>
  );
};

const root = ReactDOM.createRoot(document.getElementById('malita'));
root.render(React.createElement(Hello));
