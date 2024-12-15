import "./App.css";
import { PrimeReactProvider } from "primereact/api";
import TablePage from "./components/TablePage";

import 'primeicons/primeicons.css';        
import "primereact/resources/themes/lara-light-cyan/theme.css";

function App() {
  return (
    <PrimeReactProvider >
      <TablePage />
    </PrimeReactProvider>
  );
}

export default App;
