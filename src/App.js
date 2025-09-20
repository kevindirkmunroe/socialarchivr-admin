import 'react-tabs/style/react-tabs.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from "./LoginPage";
import AdminPage from "./AdminPage";
import ProtectedRoute from "./ProtectedRoute";
import './App.css';
import SignupForm from "./SignupForm";

function App() {
    return (
        <div>
            <div style={{marginLeft : 10, fontStyle: 'bold', color: 'green', float: 'left', flexDirection: 'column'}}>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <img alt="logo" src={'./black-cat.png'} width={'20px'} height={'20px'}/>
                            </td>
                            <td><h4>&nbsp;Bunsho 文書館</h4></td>
                            <td style={{display: 'block', marginLeft: 60}}><img alt="banner" src="./social-archivr-banner-alt.png" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <hr width="98%" color="green" size="1px" />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                    {/* Add more protected routes here */}
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
