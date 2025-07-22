import { LoginSocialFacebook} from "reactjs-social-login";
import { FacebookLoginButton} from "react-social-login-buttons";
import axios from 'axios';
import {useState, useEffect} from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const APP_ID = '387900606919443';
const localProcessEnv = { WEB_DOMAIN : 'localhost', SERVICE_DOMAIN: 'localhost', VIEWER_DOMAIN: 'localhost', SERVICE_PORT: 8080};
const BUILD_ENV = process.env.REACT_APP_BUILD_ENV || localProcessEnv;

function AdminPage() {
    const [fbProfile, setFbProfile] = useState(null);
    useEffect(() => {
        setFbProfile(fbProfile);
    }, [fbProfile]);

    const [igProfile, setIgProfile] = useState(null);
    useEffect(() => {
        setIgProfile(igProfile);
    }, [igProfile]);

    const [selectedArchiveLogs, setSelectedArchiveLogs] = useState(null);
    useEffect(() => {
        setSelectedArchiveLogs(selectedArchiveLogs);
    }, [selectedArchiveLogs]);

    const [selectedArchivePosts, setSelectedArchivePosts] = useState(null);
    useEffect(() => {
        setSelectedArchivePosts(selectedArchivePosts);
    }, [selectedArchivePosts]);

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    }

    let isLoading = false;
    const setIsLoading = (flag) => {
        isLoading = flag;
    };

    const getArchiveLogs = (archiveName, archiveId) => {
        axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/${archiveId}/logs`)
            .then(res => {
                // console.log(`ARCHIVE LOGS OK: ${JSON.stringify(res)}`);
                setSelectedArchiveLogs({name: archiveName, data: res.data});
            })
            .catch((error) => {
                console.log(`ARCHIVE LOGS ERROR: ${JSON.stringify(error)}`);
            });
    }

    const getArchivePosts = (archiveId) => {
        axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/${archiveId}/posts`)
            .then(res => {
                setSelectedArchivePosts({id: archiveId, data: res.data});
            })
            .catch((error) => {
                console.log(`ARCHIVE POSTS ERROR: ${JSON.stringify(error)}`);
            });
    }

    const [archives, setArchives] = useState(null);
    useEffect(() => {
        const socialArchivrUserId = JSON.parse(localStorage.getItem('authToken')).userId;
        axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/user/${socialArchivrUserId}`)
            .then(res => {
                setArchives(res.data);
            })
            .catch((error) => {
                console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
            });

    }, []);

    return (
        <div>
            <div className="parent">
                <header>
                    <div className="child">
                        <table>
                            <tbody>
                            <tr>
                                <td><img alt='' src={'./generic-profile.png'}
                                         style={{marginLeft: 4, marginRight: 10, width: 48, height: 48}}/></td>
                                <td>
                                    <div style={{
                                        fontSize: 24,
                                        fontStyle: 'bold'
                                    }}>{JSON.parse(localStorage.getItem('authToken')).userFullName}</div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </header>

                <section className="left-sidebar" style={{backgroundColor: '#F8FAF9'}}>
                    <div style={{marginLeft: 20, fontSize: 16, fontWeight: 900}}><img src={'./storage_black_24dp.svg'} style={{marginRight: 10, width: 32, height: 32, verticalAlign: 'middle', textAlign: 'center'}}/>{BUILD_ENV.SERVICE_DOMAIN} ({archives ? archives.length : 0})</div>
                    {archives ? archives.map((item) => (
                        <div style={{marginLeft: 20}} key={item.id} onClick={() => {
                            getArchiveLogs(item.name, item.id);
                            getArchivePosts(item.id);
                            }
                        }>
                            <div style={{marginTop: 5, marginLeft: 6, flexDirection: 'column'}}>
                                <div style={{display: 'inline-block'}}><img alt='repository' src={'./Database--Streamline-Solar.svg'} style={{ width:24, height: 24}}/>
                                </div>
                                <div style={{display: 'inline-block', verticalAlign: 'top', textAlign: 'center', marginTop: 2, marginLeft: 4}}>{item.name}</div>
                            </div>
                        </div>
                    )) : 'Loading...'}
                </section>
                <main>
                    <div style={{marginLeft: 10, flexDirection: 'column'}}>
                        {selectedArchiveLogs ?
                            <>
                                <div style={{marginTop: 5, marginLeft: 6, flexDirection: 'column'}}>
                                    <div style={{display: 'inline-block'}}><img alt='repository' src={'./vecteezy_database-icon-simple-design_53489038.jpg'} style={{ width:30, height: 30}}/>
                                    </div>
                                    <div style={{display: 'inline-block', verticalAlign: 'top', textAlign: 'center', marginTop: 4, marginLeft: 4, fontSize: 18, fontWeight: 'bold'}}>{BUILD_ENV.SERVICE_DOMAIN} / {selectedArchiveLogs.name}</div>
                                </div>
                                <div style={{marginTop: 6, marginLeft: 16}}>{selectedArchiveLogs.data.length > 0 ?JSON.stringify(selectedArchiveLogs) : 'No Logs.'}</div>
                                <div style={{marginLeft: 12, marginTop: 6}}>
                                    <hr/>
                                    <br/>
                                    <table>
                                        <thead><tr><td><b>&nbsp;&nbsp;Account Name</b></td><td><b>Last Archived</b></td></tr></thead>
                                        <tbody>
                                        <tr>
                                            <td>{ fbProfile ?
                                                <div style={{marginLeft: 10}}><img alt="Facebook" src="./facebook-16x16-icon.png" width="24" height="24" />&nbsp;{fbProfile.name}</div> :
                                                <LoginSocialFacebook
                                                    appId={APP_ID}
                                                    version="v18.0"
                                                    scope='user_posts'
                                                    onReject={(error) => {
                                                        console.log('ERROR:' + error);
                                                    }}
                                                    onResolve={(response) => {
                                                        setFbProfile(response.data);
                                                    }}>
                                                    <FacebookLoginButton/>
                                                </LoginSocialFacebook>
                                            }
                                            </td><td>&nbsp;{ fbProfile ? new Date().toISOString() : '--'}</td>
                                            { fbProfile ? <td onClick={() => alert('Update!')}>&nbsp;&nbsp;
                                                    <img alt='refresh' src={'./refresh.png' } style={{width: 20, height: 20}}/>&nbsp;<b>Update</b>
                                                </td>:
                                                <td style={{backgroundColor: '#F8FAF9', color: 'gray'}}>&nbsp;&nbsp;<img alt='refresh' src={'./refresh.png' } style={{width: 20, height: 20}}/>&nbsp;Update&nbsp;&nbsp;</td>
                                            }
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{marginLeft : 6, marginTop: 10, marginBottom: 4, borderRadius: 3, fontSize: 20, backgroundColor: '#d62976', color: 'white', borderWidth: 0, height: 50, width: 280, display: 'flex', flexDirection: 'row'}}>
                                                    <div><img alt='instagram' src={'./instagram-white.png'} style={{width: 50, height: 50}} /></div>
                                                    <div style={{marginTop: 14, fontSize: 18}}>Log in with Instagram</div>
                                                </div>
                                            </td><td>&nbsp;--</td>
                                            <td  style={{backgroundColor: '#F8FAF9', color: 'gray'}}>&nbsp;&nbsp;<img alt='refresh' src={'./refresh.png' } style={{width: 20, height: 20}}/>&nbsp;Update&nbsp;&nbsp;</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div style={{marginLeft: 20, borderWidth: 3, borderColor: 'black'}}><h4>+ Add Account</h4></div>
                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                        <div style={{marginLeft: 20, borderRadius: 4, backgroundColor: '#d62976', width: 50, height: 48}}><img alt='instagram' src={'./facebook-16x16-icon.png'} style={{width: 50, height: 50}} /></div>
                                        <div style={{marginLeft: 20, borderRadius: 4, backgroundColor: '#d62976', width: 50, height: 48}}><img alt='instagram' src={'./instagram-white.png'} style={{width: 50, height: 50}} /></div>
                                    </div>
                                    <hr/>
                                    <div style={{display: 'flex', flexDirection: 'row', marginTop: 10, marginBottom: 10, fontSize: 18, fontWeight: 'bold'}}>
                                        &nbsp;&nbsp;<img alt="Facebook" src="./icons8-notes-32.png" width="24" height="24" />&nbsp;Posts ({selectedArchivePosts ? selectedArchivePosts.data.length: '0'})
                                    </div>
                                    {selectedArchivePosts && selectedArchivePosts.data.length > 0 ? JSON.stringify(selectedArchivePosts) : 'No Posts.'
                                    }
                                </div>
                            </> :
                            <div>No Archive Selected.</div>}
                    </div>
                </main>
                <footer style={{textAlign: 'right'}}>
                    <button style={{marginLeft : 10, marginTop: 10, marginBottom: 14, marginRight: 30, borderRadius: 3, fontSize: 20, backgroundColor: 'green', color: 'white', borderWidth: 0}} onClick={logout} disabled={isLoading}>
                        Log Out
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default AdminPage;
