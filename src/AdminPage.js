import { LoginSocialFacebook} from "reactjs-social-login";
import { FacebookLoginButton} from "react-social-login-buttons";
import axios from 'axios';
import {useState, useEffect} from "react";
import 'react-tabs/style/react-tabs.css';

const localProcessEnv = { APP_ID: '387900606919443', WEB_DOMAIN : 'localhost', SERVICE_DOMAIN: 'localhost', VIEWER_DOMAIN: 'localhost', SERVICE_PORT: 8080};
const BUILD_ENV = process.env.REACT_APP_BUILD_ENV || localProcessEnv;

function AdminPage() {
    const [fbProfile, setFbProfile] = useState(null);
    useEffect(() => {
        console.log(`Setting FB profile: ${JSON.stringify(fbProfile)}`);
        setFbProfile(fbProfile);
    }, [fbProfile]);

    const [fbPosts, setFbPosts] = useState(null);
    useEffect(() => {
        console.log(`Setting FB pages: ${JSON.stringify(fbPosts)}`);
        setFbPosts(fbPosts);
    }, [fbPosts]);

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

    //
    // Page Load:
    //   get the user's archives
    //   for each archive, get that archive's history- Last updated per account
    //

    // Get archives by user...
    const [archives, setArchives] = useState(null);
    useEffect(() => {
        const socialArchivrUserId = JSON.parse(localStorage.getItem('authToken')).userId;
        axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/user/${socialArchivrUserId}`)
            .then(res => {
                setArchives(res.data);
            })
            .catch((error) => {
                console.log(`GET ARCHIVE ERROR: ${JSON.stringify(error)}`);
            });

    }, []);

    // Get history by archive
    const [archiveHistory, setArchiveHistory] = useState(null);

    useEffect(() => {
        if (!archives || archives.length === 0) return;

        const promises = archives.map((archive) =>
            axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/${archive.id}/history`));

            Promise.all(promises)
                .then((res) => {
                    console.log(`ARCHIVE HISTORY OK.`);
                    setArchiveHistory(res.map(r => r.data)); // ✅ just the data
                })
                .catch((error) => {
                    console.log(`GET ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [archives]);

    console.log(`ARCHIVE HISTORY FINAL: ${JSON.stringify(archiveHistory)}`);
    let flatHistory = null;
    let archiveMap = null;
    if(archiveHistory) {
        flatHistory = archiveHistory.flat().filter(Boolean);
        // Group by archive name
         archiveMap = flatHistory.reduce((acc, record) => {
            const name = record.archive.name;
            if (!acc[name]) {
                acc[name] = [];
            }
            acc[name].push(record);
            return acc;
        }, {});
    }
    console.log(`ARCHIVE HISTORY FLAT: ${JSON.stringify(archiveMap)}`);

    const accountImageFinder = (accountType) => {
        switch (accountType){
            case 'FACEBOOK':
                return "./facebook-16x16-icon.png";
                break;
            case 'INSTAGRAM':
                return "./256px-instagram_icon.png";
                break;
            default:
                break;
        }
    }

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
                                <div style={{marginLeft: 12, marginTop: 6}}>
                                    <hr/>
                                    <div style={{display: 'flex', flexDirection: 'row', marginTop: 20, marginBottom: 10, fontSize: 18, fontWeight: 'bold'}}>
                                        <img alt="Notes" src="./icons8-globe-64.png" width="24" height="24" />&nbsp;Social Media
                                    </div>
                                    <table>
                                        <thead><tr><td><b>&nbsp;&nbsp;Account</b></td><td><b>Last Archived</b></td></tr></thead>
                                        <tbody>
                                        { archiveMap[selectedArchiveLogs.name] ? archiveMap[selectedArchiveLogs.name].map((rec) => {
                                                return <tr>
                                                    <td><div style={{marginLeft: 10}}><img alt={rec.socialMediaAccount} src={accountImageFinder(rec.socialMediaAccount)} width="24" height="24" />&nbsp;{rec.socialMediaUsername}</div></td>
                                                    <td>{rec.archiveDateCompleted}</td>
                                                    <td><img alt='refresh' src={'./refresh.png' } style={{width: 20, height: 20}}/>&nbsp;<b>Update</b></td>
                                                </tr>
                                        }) : <div style={{marginTop: 15, marginLeft: 10}}>No Archived Accounts.</div>
                                        }
                                        </tbody>
                                    </table>
                                    <div style={{marginLeft: 20, borderWidth: 3, borderColor: 'black'}}><h4>+ Add Account</h4></div>
                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                        <div style={{marginLeft: 20, borderRadius: 4, width: 50, height: 48}}><img alt='instagram' src={'./facebook-16x16-icon.png'} style={{width: 40, height: 40}} /></div>
                                        <div style={{marginLeft: 20, borderRadius: 4, backgroundColor: '#d62976', width: 40, height: 40}}><img alt='instagram' src={'./instagram-white.png'} style={{width: 40, height: 40}} /></div>
                                    </div>
                                    <hr/>
                                    <div style={{display: 'flex', flexDirection: 'row', marginTop: 20, marginBottom: 10, fontSize: 18, fontWeight: 'bold'}}>
                                        <img alt="Notes" src="./icons8-notes-32.png" width="24" height="24" />&nbsp;Archived Posts ({selectedArchivePosts ? selectedArchivePosts.data.length: '0'})
                                    </div>
                                    {selectedArchivePosts && selectedArchivePosts.data.length > 0 ? JSON.stringify(selectedArchivePosts) : 'No Posts.'
                                    }
                                </div>
                            </> :
                            <div>No Archive Selected.</div>}
                    </div>
                </main>
                <footer style={{textAlign: 'right'}}>
                    <button style={{marginLeft : 10, marginTop: 10, marginBottom: 14, marginRight: 30, borderRadius: 3, fontSize: 20, backgroundColor: 'green', color: 'white', borderWidth: 0}} onClick={logout}>
                        Log Out
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default AdminPage;
