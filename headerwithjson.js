import React, { useState } from 'react';
import './style.css';
import menuData from './menuData.json';

export function App(props) {
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  return (
    <header className='header'>
      <div className='logo'>
        {' '}
        {/* Replace with your logo image */}
        <img src='/logo.png' alt='Logo' height={40} />
      </div>
      {/* ... logo and nav links ... */}
      <nav className='nav'>
        {/* ... other nav items ... */}
        <div
          className='nav-item'
          onMouseEnter={() => setShowMegaMenu(true)}
          onMouseLeave={() => setShowMegaMenu(false)}
        >
          <a href='#'>Solutions</a>
          {showMegaMenu && (
            <div className='mega-menu'>
              {menuData.menu.map((col, idx) => (
                <div className='mega-menu-column' key={idx}>
                  <h4>{col.title}</h4>
                  {col.items.map((item, i) => (
                    <a href={item.url} key={i}>
                      {item.label}
                    </a>
                  ))}
                </div>
              ))}
              <div className='mega-menu-image'>
                <img src={menuData.image.src} alt={menuData.image.alt} />
                <a href={menuData.image.buttonUrl}>
                  <button>{menuData.image.buttonText}</button>
                </a>
              </div>
            </div>
          )}
        </div>
        {/* ... other nav items ... */}
      </nav>
    </header>
  );
}

// Log to console
console.log('Hello console');
