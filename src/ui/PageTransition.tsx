import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState(false);

  useEffect(() => {
    setTransitionStage(false);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    setDisplayChildren(children);
    setTransitionStage(true);
  }, [children]);

  return (
    <div className={transitionStage ? 'page-transition' : ''} style={{ opacity: transitionStage ? 1 : 0 }}>
      {displayChildren}
    </div>
  );
}
