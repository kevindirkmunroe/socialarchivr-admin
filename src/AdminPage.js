import axios from 'axios';
import {useState, useEffect} from "react";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import BUILD_ENV from './Environment';

import 'react-tabs/style/react-tabs.css';
import SocialMediaLoginModal from "./SocialMediaLoginModal";
import ProfileImageModal from "./ProfileImageModal";

function AdminPage() {

    const formatDate = (date) => {
        return format(date, "EEEE MMMM do h:mmaaa", { locale: enUS });
    }

    const [fbProfile, setFbProfile] = useState(null);
    useEffect(() => {
        setFbProfile(fbProfile);
    }, [fbProfile]);

    const [fbPosts, setFbPosts] = useState(null);
    useEffect(() => {
        setFbPosts(fbPosts);
    }, [fbPosts]);

    const [igProfile, setIgProfile] = useState(null);
    useEffect(() => {
        setIgProfile(igProfile);
    }, [igProfile]);

    const [selectedArchivePosts, setSelectedArchivePosts] = useState(null);
    useEffect(() => {
        setSelectedArchivePosts(selectedArchivePosts);
    }, [selectedArchivePosts]);

    // archiveId
    const [selectedArchive, setSelectedArchive] = useState(null);
    useEffect(() => {
        setSelectedArchive(selectedArchive);
    }, [selectedArchive]);

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    }

    const [socialAccounts, setSocialAccounts] = useState(null);
    useEffect(() => {
        setSocialAccounts(socialAccounts);
    }, [socialAccounts]);

    const getArchiveInfo = (archiveId, archiveName) => {
        axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/${archiveId}/posts`)
            .then(res => {
                setSelectedArchive({archiveId, archiveName});
                setSelectedArchivePosts({id: archiveId, data: res.data});
            })
            .catch((error) => {
                console.log(`ARCHIVE INFO ERROR: ${JSON.stringify(error)}`);
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

    const [archiveHistory, setArchiveHistory] = useState(null);
    useEffect(() => {
        if (!archives || archives.length === 0) return;

        const uniqueArchives = Array.from(new Set(archives.map(a => a.id)))
            .map(id => archives.find(a => a.id === id));

        const promises = uniqueArchives.map((archive) =>
            axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/${archive.id}/history`));

            Promise.all(promises)
                .then((res) => {
                    const allData = res.flatMap(r => r.data);

                    // Deduplicate by 'id'
                    const uniqueData = allData.filter(
                        (item, index, self) => self.findIndex(t => t.id === item.id) === index
                    );

                    setArchiveHistory(uniqueData);                })
                .catch((error) => {
                    console.log(`GET ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [archives]);


    const [archiveHistoryMap, setArchiveHistoryMap] = useState({});
    useEffect(() => {
        if(archiveHistory) {

            let flatHistory = [];
            if (Array.isArray(archiveHistory)) {
                // Flatten if needed
                flatHistory = archiveHistory.flatMap(item => Array.isArray(item) ? item : [item]);

                // Deduplicate by id
                const uniqueHistory = flatHistory.filter(
                    (item, index, self) =>
                        item && self.findIndex(t => t.id === item.id) === index
                );

                // Group by archive ID
                setArchiveHistoryMap(uniqueHistory.reduce((acc, record) => {
                    const archiveId = record?.archive?.id;
                    if (archiveId != null) {
                        if (!acc[archiveId]) acc[archiveId] = [];
                        acc[archiveId].push(record);
                    }
                    return acc;
                }, {}));
            } else {
                console.warn("archiveHistory is not an array:", archiveHistory);
            }
        }
    }, [archiveHistory]);

    const handleUpdateAccount = (archiveName, mediaAccountUsername) => {
        alert(`Update archive ${archiveName} account ${mediaAccountUsername}!`);
    }

    const accountImageFinder = (accountType) => {
        switch (accountType){
            case 'FACEBOOK':
                return "./facebook-black.png";
                break;
            case 'INSTAGRAM':
                return "./black-instagram-logo-3497.png";
                break;
            default:
                break;
        }
    }

    const [showLogin, setShowLogin] = useState(false);
    const [userData, setUserData] = useState(null);
    const savedToken = localStorage.getItem('fb_token');

    return (
        <>
            <SocialMediaLoginModal
                show={showLogin}
                onClose={() => setShowLogin(false)}
                accessToken={savedToken}
                onLoginSuccess={(data) => {
                    setUserData(data);
                    localStorage.setItem('fb_token', data.accessToken);
                }}
            />
            <div>
                <div className="parent">
                    <header>
                        <div className="child">
                            <table>
                                <tbody>
                                <tr>
                                    <td><ProfileImageModal />
                                    </td>
                                    <td>
                                        <div style={{
                                            fontSize: 24,
                                            fontStyle: 'bold',
                                            marginLeft: 10
                                        }}>{JSON.parse(localStorage.getItem('authToken')).userFullName}</div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </header>

                    <section className="left-sidebar" style={{backgroundColor: '#F8FAF9'}}>
                        <div style={{marginLeft: 20, marginBottom: 12, fontSize: 18, fontWeight: 900}}>Archives</div>
                        {archives ? archives.map((item) => (
                            <div style={{marginLeft: 20}} key={item.id} onClick={() => {
                                getArchiveInfo(item.id, item.name);
                                }
                            }>
                                <div style={{marginTop: 5, marginLeft: 6, flexDirection: 'column', backgroundColor: selectedArchive?.archiveName === item.name? '#E9FCE9':  'white'}}>
                                    <div style={{display: 'inline-block'}}><img alt='repository' src={'./Database--Streamline-Solar.svg'} style={{ width:24, height: 24}}/>
                                    </div>
                                    <div style={{display: 'inline-block', verticalAlign: 'top', textAlign: 'center', marginTop: 2, marginLeft: 4}}>{item.name}</div>
                                </div>
                            </div>
                        )) : 'Loading...'}
                        <div style={{marginLeft: 20, borderWidth: 3, borderColor: 'black'}}><h4><img src={'./black-cat.png'} width={'20px'} height={'20px'}/>+ Add Archive</h4></div>

                    </section>
                    <main>
                        <div style={{marginLeft: 10, flexDirection: 'column'}}>
                            {selectedArchive ?
                                <>
                                    <div style={{marginTop: 5, marginLeft: 6, flexDirection: 'column'}}>
                                        <div style={{display: 'inline-block'}}><img alt='repository' src={'./vecteezy_database-icon-simple-design_53489038.jpg'} style={{ width:38, height: 38}}/>
                                        </div>
                                        <div style={{display: 'inline-block', verticalAlign: 'top', textAlign: 'center', marginTop: 4, marginLeft: 4, fontSize: 24, fontWeight: 'bold'}}>{BUILD_ENV.SERVICE_DOMAIN} / {selectedArchive.archiveName}</div>
                                    </div>
                                    <div style={{marginLeft: 12, marginTop: 6}}>
                                        <hr/>
                                        <div style={{display: 'flex', flexDirection: 'row', marginTop: 20, marginBottom: 10, fontSize: 18, fontWeight: 'bold'}}>
                                            <img alt="Notes" src="./icons8-globe-64.png" width="24" height="24" />&nbsp;Accounts
                                        </div>
                                        <table>
                                            <thead><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>User Name</b></td><td><b>Last Archived</b></td></tr></thead>
                                            <tbody>
                                            { selectedArchive && archiveHistoryMap?.[selectedArchive.archiveId] ? archiveHistoryMap[selectedArchive.archiveId].map((rec) => {
                                                return <tr key={rec.id}>
                                                        <td><div style={{marginLeft: 30}}><img alt={rec.socialMediaPlatform} src={accountImageFinder(rec.socialMediaPlatform)} width="24" height="24" />&nbsp;{rec.socialMediaUsername}</div></td>
                                                        <td>{formatDate(rec.archiveDateCompleted)}</td>
                                                        <td onClick={() => handleUpdateAccount(selectedArchivePosts.id, rec.socialMediaUsername)}><img alt='refresh' src={'./archive-now.png' } style={{marginLeft: 18, width: 26, height: 26}}/></td>
                                                        </tr>
                                                }) :
                                                <div style={{marginTop: 15, marginLeft: 10}}>No Archived Accounts.</div>
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
                                        {selectedArchivePosts && selectedArchivePosts.data.length > 0 ? JSON.stringify(selectedArchivePosts) : 'No Archived Posts.'
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
        </>
    );
}

export default AdminPage;
