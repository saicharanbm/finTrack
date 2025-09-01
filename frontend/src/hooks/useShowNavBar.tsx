import { useState, useEffect } from "react";

const useShowNavBar = () => {
  const [showNavBar, setShowNavBar] = useState(window.innerWidth >= 640);

  useEffect(() => {
    const handleResize = () => {
      setShowNavBar(window.innerWidth <= 1240);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return showNavBar;
};

export default useShowNavBar;
