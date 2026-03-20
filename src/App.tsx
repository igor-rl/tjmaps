import { Sidebar } from "./components/layout/Sidebar";
import { MapView } from "./components/map/MapView";

function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <Sidebar />
      <MapView />
    </main>
  );
}

export default App;
