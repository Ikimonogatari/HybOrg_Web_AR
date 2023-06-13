import { useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "../Navbar/Navbar.css";
import logo from "../Navbar/LogoBack.png";

function Navbar() {
  const navRef = useRef();

  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  return (
    <header>
      <img src={logo} />
      <div className="select">
        <nav ref={navRef}>
          <a href="/#">Drops</a>
          <a href="/#">Collection</a>
          <a href="/#">More</a>
          <a href="/#">Sign in</a>
          <button className="nav-btn nav-close-btn" onClick={showNavbar}>
            <FaTimes />
          </button>
        </nav>
        <button className="nav-btn" onClick={showNavbar}>
          <FaBars />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
