import logo from "./logo.svg";
import "./App.css";
import CameraKit from "./components/CameraKit/CameraKit";
import Navbar from "./components/Navbar/Navbar";
export default function App() {
  return (
    <div className='App h-screen sm:h-auto overflow-hidden'>
      <div className='hidden sm:block'>
        <Navbar />
      </div>
      <CameraKit />
    </div>
  );
}
