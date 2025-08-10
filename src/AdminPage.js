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
        axios.get(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/${archiveId}/posts`)
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
        axios.get(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/user/${socialArchivrUserId}`)
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
            axios.get(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/${archive.id}/history`));

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

    const [archiving, setArchiving] = useState(false)

    async function startArchive(username, archiveId) {
        setArchiving(true);

        const res = await fetch(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/job`, {
            method: "POST",
            body: JSON.stringify({ username, archiveId }),
            headers: { "Content-Type": "application/json" }
        });
        const { jobId } = await res.json();
        console.log(`JOB ID= ${JSON.stringify(jobId)}`);

        let tries = 0;
        const maxTries = 5;
        const poll = setInterval(async () => {
            tries++;
            if (tries >= maxTries) {
                clearInterval(poll);
                alert(`Archive update of Username '${username}' failed after ${maxTries} tries!`);
            }

            const statusRes = await fetch(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/archives/job/${jobId}`);
            const { status } = await statusRes.json();
            if (status === "COMPLETE") {
                clearInterval(poll);
                alert("Archive done!");
            } else if (status === "FAILED") {
                clearInterval(poll);
                alert("Archive failed.");
            }
        }, 3000);

        setArchiving(false);
    }

    const handleUpdateAccount = (archiveName, mediaAccountUsername) => {
        axios.get(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/social-accounts/${archiveName}`)
            .then(async res => {
                    const match = res.data.find(
                        acc => acc.username === mediaAccountUsername && acc.archiveId === archiveName
                    );
                    console.log(`MATCH=${JSON.stringify(match)}`);

                    await startArchive(mediaAccountUsername, archiveName);
                })
                .catch((error) => {
                    console.log(`UPDATE ACCOUNT BY username ERROR: ${JSON.stringify(error)}`);
                });
    }

    const handleDeleteArchive = (archiveId) => {
        alert(`TODO: delete archive ${archiveId}`);
    }

    const handleAddArchive = () => {
        alert(`TODO: add new archive`);
    }

    const handleDeleteSocialMediaAccount = (account) => {
        alert(`TODO: delete SM Account ${account}`);
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
                                    <td>
                                        <div style={{marginLeft: 200, width: '90%'}}>
                                            <img alt="Notes" src="./social-archivr-banner-2.png" />
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </header>

                    <section className="left-sidebar" style={{backgroundColor: '#F8FAF9'}}>
                        <div style={{marginLeft: 20, marginBottom: 12, fontSize: 14, fontWeight: 900}}>Social Media Archives</div>
                        {archives ? archives.map((item) => (
                            <div style={{marginLeft: 20}} key={item.id} onClick={() => {
                                getArchiveInfo(item.id, item.name);
                                }
                            }>
                                <div
                                    style={{
                                        marginTop: 5,
                                        marginLeft: 6,
                                        display: 'flex',
                                        flexDirection: 'row', // default, but make explicit
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: selectedArchive?.archiveName === item.name ? '#E9FCE9' : 'white',
                                        width: '100%', // optional, ensures full width for justify-content to work
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            alt="repository"
                                            src={'./Database--Streamline-Solar.svg'}
                                            style={{ width: 24, height: 24 }}
                                        />
                                        <div style={{ marginLeft: 6 }}>{item.name}</div>
                                    </div>

                                    <img
                                        alt="delete"
                                        src={'./icons8-trash-24.png'}
                                        onClick={() => handleDeleteArchive(item.name)}
                                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        )) : 'Loading...'}
                        <div onClick={() => handleAddArchive()}  style={{marginLeft: 20, borderWidth: 3, borderColor: 'black'}}><h4><img src={'./black-cat.png'} width={'20px'} height={'20px'}/>+ Add Archive</h4></div>
                    </section>
                    <main>
                        <div style={{marginLeft: 10, flexDirection: 'column'}}>
                            {selectedArchive ?
                                <>
                                    <div style={{marginTop: 5, marginLeft: 6, flexDirection: 'column', backgroundColor: '#E9FCE9', height: 40}}>
                                        <div style={{display: 'inline-block', verticalAlign: 'top', textAlign: 'center', marginTop: 4, marginLeft: 8, fontSize: 24, fontWeight: 'bold'}}>{selectedArchive.archiveName} @ {BUILD_ENV.SERVICE_DOMAIN}</div>
                                    </div>
                                    <div style={{marginLeft: 12, marginTop: 6}}>
                                        <div style={{display: 'flex', flexDirection: 'row', marginTop: 20, marginBottom: 10, fontSize: 14, fontWeight: 'bold'}}>
                                            &nbsp;Archived Accounts
                                        </div>
                                        <table>
                                            <thead><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>User</b></td><td><b>Last Archived</b></td></tr></thead>
                                            <tbody>
                                            { selectedArchive && archiveHistoryMap?.[selectedArchive.archiveId] ? archiveHistoryMap[selectedArchive.archiveId].map((rec) => {
                                                return <tr key={rec.id}>
                                                        <td><div style={{marginLeft: 30}}><img alt={rec.socialMediaPlatform} src={accountImageFinder(rec.socialMediaPlatform)} width="24" height="24" />&nbsp;{rec.socialMediaUsername}</div></td>
                                                        <td>{formatDate(rec.archiveDateCompleted)}</td>
                                                        <td onClick={() => handleUpdateAccount(selectedArchivePosts.id, rec.socialMediaUsername)}><img alt='refresh' src={'./archive-now.png' } style={{marginLeft: 18, width: 26, height: 26}}/></td>
                                                        <td>
                                                            <img
                                                                alt="delete"
                                                                onClick={() => handleDeleteSocialMediaAccount(rec.socialMediaUsername)}
                                                                src={'./icons8-trash-24.png'}
                                                                style={{ marginLeft: 6, width: 16, height: 16, cursor: 'pointer' }}
                                                            />
                                                        </td>
                                                        </tr>
                                                }) :
                                                <div style={{marginTop: 15, marginLeft: 10}}>No Archived Accounts.</div>
                                            }
                                            </tbody>
                                        </table>
                                        <div style={{marginLeft: 20, borderWidth: 3, borderColor: 'black'}}><h5>+ Add Account</h5></div>
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <div style={{marginLeft: 20, borderRadius: 4, width: 50, height: 48}}><img alt='instagram' src={'./facebook-16x16-icon.png'} style={{width: 40, height: 40}} /></div>
                                            <div style={{marginLeft: 20, borderRadius: 4, backgroundColor: '#d62976', width: 40, height: 40}}><img alt='instagram' src={'./instagram-white.png'} style={{width: 40, height: 40}} /></div>
                                        </div>
                                        <hr/>
                                        <div style={{display: 'flex', flexDirection: 'row', marginTop: 20, marginBottom: 10, fontSize: 14, fontWeight: 'bold'}}>
                                            &nbsp;Archived Posts ({selectedArchivePosts ? selectedArchivePosts.data.length: '0'})
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
