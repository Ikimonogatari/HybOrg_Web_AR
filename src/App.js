import logo from "./logo.svg";
import "./App.css";
import CameraKit from "./components/CameraKit/CameraKit";
export default function App() {
  return (
    <div className="App h-screen overflow-hidden">
      <CameraKit />
    </div>
  );
}
