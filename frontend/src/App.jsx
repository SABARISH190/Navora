import Dashboard from './pages/Dashboard';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  )
}

export default App;
