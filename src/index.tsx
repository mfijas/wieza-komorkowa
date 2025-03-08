import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App/App';
import addResizeListener from './components/App/resizeListener';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App width={7} height={12}/>
    </React.StrictMode>
);

document.addEventListener('DOMContentLoaded', () => addResizeListener());
