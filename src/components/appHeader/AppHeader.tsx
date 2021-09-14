import React from 'react';
import logo from '../../assets/icon/logo.svg';
import menuIcon1 from '../../assets/icon/icon1.svg';
import menuIcon2 from '../../assets/icon/icon2.svg';
import './style.scss';

function AppHeader() {
  return (
    <div id="AppHeader">
      <div className="logo">
        <svg width={400} height={64}>
          <image xlinkHref={logo} height="64" width="400" />
        </svg>
      </div>
      <div className="menu">
          <div></div>
        <div className="menu-item">
          <svg width={20} height={20}>
            <image xlinkHref={menuIcon1} height="20" width="20" />
          </svg>
        </div>
        <div className="menu-item">
          <svg width={20} height={20}>
            <image xlinkHref={menuIcon2} height="20" width="20" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default AppHeader;
