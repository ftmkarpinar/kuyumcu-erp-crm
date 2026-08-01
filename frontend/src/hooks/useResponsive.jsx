import { useState, useEffect } from 'react';

export default function useResponsive() {
  const [isMobile, setIsMobile] = useState(window.outerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.outerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, screenSize: { md: !isMobile } };
}
