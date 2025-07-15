import 'react-tabs/style/react-tabs.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from "./LoginPage";
import MainPage from "./MainPage";
import AdminPage from "./AdminPage";
import ProtectedRoute from "./ProtectedRoute";
import './App.css';

function App() {
    return (
        <div>
            <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
                <table>
                    <tbody>
                        <tr><td><img src={'./black-cat.png'} width={'20px'} height={'20px'}/></td><td><h4>&nbsp;Social Archivr</h4></td></tr>
                    </tbody>
                </table>
            </div>
            <hr width="98%" color="green" size="1px" />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                    {/* Add more protected routes here */}
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
