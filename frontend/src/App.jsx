import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
function Router() { const { token } = useAuth(); return token ? <Dashboard key={token} /> : <AuthPage />; }
export default function App() { return <AuthProvider><Router/></AuthProvider>; }