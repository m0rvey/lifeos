import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathRef = useRef(location.pathname);
  const [transitionStage, setTransitionStage] = useState(true);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setTransitionStage(false);
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage(true);
      }, 50);
      return () => clearTimeout(timer);
    }
    setDisplayChildren(children);
    setTransitionStage(true);
    return undefined;
  }, [location.pathname, children]);

  return (
    <div className={transitionStage ? 'page-transition' : ''} style={{ opacity: transitionStage ? 1 : 0 }}>
      {displayChildren}
    </div>
  );
}
