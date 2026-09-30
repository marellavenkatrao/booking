import React from 'react';
import necHeaderBanner from './nec_header_banner.png';

export default function NecLogo({ className = '', style = {}, height = 46, ...props }) {
  return (
    <div 
      className={`nec-logo-container ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        maxWidth: '100%',
        ...style 
      }}
    >
      <img
        src={necHeaderBanner}
        alt="Narasaropeta Engineering College (Autonomous)"
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          maxWidth: '100%',
          width: 'auto',
          objectFit: 'contain',
          display: 'block'
        }}
        {...props}
      />
    </div>
  );
}
