import logo from "./logo.svg";
import "./App.css";
import CameraKit from "./components/CameraKit/CameraKit";
import Navbar from "./components/Navbar/Navbar";
function App() {
  return (
    <div className="App">
      <Navbar />
      <CameraKit />
    </div>
  );
}

export default App;
