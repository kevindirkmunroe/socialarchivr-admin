import { LoginSocialFacebook} from "reactjs-social-login";
import { FacebookLoginButton} from "react-social-login-buttons";
import axios from 'axios';
import {useState, useEffect} from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {Audio} from 'react-loader-spinner';

import './App.css';
import {PostTableComponent} from "./PostTableComponent";


const APP_ID = '387900606919443';
function MainPage() {

    const localProcessEnv = { WEB_DOMAIN : 'localhost', SERVICE_DOMAIN: 'localhost', VIEWER_DOMAIN: 'localhost'};
    const BUILD_ENV = process.env.REACT_APP_BUILD_ENV || localProcessEnv;

    function getUserPicture(profileId) {
        return `https://graph.facebook.com/${profileId}/picture?type=large&redirect=true&width=100&height=100`;
    }

    const [pictureUrl, setPictureUrl] = useState('');
    useEffect(() => {
        setPictureUrl(pictureUrl);
    }, [pictureUrl]);

    const [profile, setProfile] = useState(null);
    useEffect(() => {
        setProfile(profile);
        if(profile) {
            setPictureUrl(getUserPicture(profile.id));
        }
    }, [profile]);

    // For UI form change
    const [hashtag, setHashtag] = useState('');
    useEffect(() => {
        setHashtag(hashtag);
    }, [hashtag]);

    // All archived hashtags upon UI loadup
    const [hashtags, setHashtags] = useState([]);
    useEffect(() => {
        setHashtags(hashtags);
    }, [hashtags]);

    // Posts for one hashtag
    const [postsData, setPostsData] = useState([]);
    useEffect(() => {
        setPostsData(postsData);
    }, [postsData]);

    const [deletedHashtag, setDeletedHashtag] = useState([]);
    useEffect(() => {
        setDeletedHashtag(deletedHashtag);
    }, [deletedHashtag]);

    const [tabIndex, setTabIndex] = useState(0);
    useEffect(() => {
        setTabIndex(tabIndex);
    }, [tabIndex]);

    let isLoading = false;
    const setIsLoading = (flag) => {
        isLoading = flag;
    };

    const sortHashtags = (hashtags) => {
        const compareFn = ((a, b) => {
            if(a.hashtag.sharedHashtag.hashtag > b.hashtag.sharedHashtag.hashtag){
                return 1;
            }else{
                return -1;
            }
        });
        hashtags.sort(compareFn);
        return hashtags;
    }

    if(hashtags.length === 0) {
        try {
            axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:3001/social-archive/facebook/hashtags?userId=${profile.id}`
            ).then(res => {
                console.log(`[SocialArchivrAdmin] set hashtags: ${JSON.stringify(res.data)}`);
                setHashtags(sortHashtags(res.data));
            });
        } catch (err) {
            console.log(`[SocialArchivrAdmin] error retrieving hashtags: ${err}`);
        }
    }

    const singularOrPlural = (resultSize) => {
        return resultSize === 1? 'Hashtag' : 'Hashtags'
    }

    const trimHashtagLengthForDisplay = (hashtag) => {
        return hashtag.length > 18 ? hashtag.substring(0, 12) + '...' : hashtag;
    }

    const encodeSpacesForMail = (string) => {
        return string.replaceAll(' ', '%25%32%30');
    }

    function shareHashtag(hashtag){
        const profileName = encodeSpacesForMail(profile.name);
        console.log(`profileName=${profileName}`);
        window.open(`mailto:?subject=Check out these awesome pics from ${profile.name}'s My Social Archive Gallery!&body=Enjoy!%0A%0A%2D%2DThe My Social Archive Team%0A%0AFollow this link: http://${BUILD_ENV.WEB_DOMAIN}:3002?id=${hashtag.shareableId}`);
    }

    const dateSort = (rowA, rowB) => {
        const a = new Date(rowA.datePosted);
        const b = new Date(rowB.datePosted);
        if( a > b) {
            return 1;
        }

        if(b > a ){
            return -1;
        }

        return 0;
    }

    const COLUMNS = [{name: 'Link', selector: row => row.originalPost, marginLeft: '50px', width: '60px', cell: (data) => <a href={'https://www.facebook.com/' + data.id} target="_blank" rel="noreferrer"><div style={{display: 'flex'}}><img alt="Facebook" src="./facebook-16x16-icon.png" style={{width: '20px', height: '20px', borderRadius: '3px'}} /><img alt="Facebook" src="./icons8-link-50.png" style={{width: '20px', height: '20px', borderRadius: '3px'}} /></div></a>},
        {name: 'Post Date', selector: row => row.datePosted, sortable: true, sortFunction: dateSort, width: '150px'},
        {name: 'Top Image', selector: row => row.image, width: '200px', cell: (data) => <img alt="" src={'https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/' + data.id + '.jpg'} width="100" height="100" style={{marginTop: '3px', borderRadius: '10px'}}/> },
        {name: 'Content', selector: row => row.content, width: '600px'}];

    async function handleChange(event) {
        setHashtag(event.target.value);
    }

    async function handleGetHashtagButtonClicked(event) {
        setTabIndex(0);
        await getFacebookData(event.target.id);
        setHashtag(event.target.id);
    }

    const deleteHashtag = (deletedHashtag) => {
        alert(`here for ${JSON.stringify(deletedHashtag)}`);
        const { id: userId } = profile;
        try {
            axios.post(`http://${BUILD_ENV.SERVICE_DOMAIN}:3001/social-archive/facebook/delete`,
                { id: userId, hashtag: deletedHashtag})
                .then(res => {
                    console.log(`ARCHIVE DELETE OK: ${JSON.stringify(res)}`);
                })
                .catch((error) => {
                    console.log(`ARCHIVE DELETE ERROR: ${JSON.stringify(error)}`);
                });
            const hashtagSet = hashtags;
            const idx = hashtagSet.indexOf(deletedHashtag);
            hashtagSet.splice(idx, 1);
            const newSet = [...hashtagSet];
            setHashtags(newSet);
        }catch(error){
            console.log(`delete ERROR: ${JSON.stringify(error)}`);
        }
    }

    const cropText = (text) => {
        if( text.length > 400){
            return `${text.slice(0, 400)}<b>...</b>`;
        }
        return text;
    }

    const [isFetching, setIsFetching] = useState(false);

    const archiveFacebookData = async () => {

        setIsFetching(true);
        const { id: userId, accessToken: userAccessToken, name } = profile;
        const oldestYear =  document.getElementById("years").value;

        try {
            axios.post(`http://${BUILD_ENV.SERVICE_DOMAIN}:3001/social-archive/save`,
                { id: userId, userName: name, accessToken: userAccessToken, hashtag, oldestYear})
                .then(res => {
                    console.log(`ARCHIVE OK: ${JSON.stringify(res)}`);

                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }

        try {
            axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:3001/social-archive/facebook/hashtags?userId=${profile.id}`
            ).then(res => {
                console.log(`[SocialArchivrAdmin] set hashtags: ${JSON.stringify(res.data)}`);
                const newhashtags = res.data;
                setHashtags(sortHashtags(newhashtags));
            });
        } catch (err) {
            console.log(`[SocialArchivrAdmin] error retrieving hashtags: ${err}`);
        }
        setIsFetching(false);
    }

    const getFacebookData = async (newHashtag) => {
        setIsLoading(true);
        const newPostsData = [];
        try {
            axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:3001/social-archive/facebook/posts?userId=${profile.id}&hashtag=${newHashtag || hashtag}`
            )
                .then(res => {
                    res.data.forEach((doc) => {

                        const url = `https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${doc._id}.jpg`;
                        newPostsData.push({id: doc._id, originalPost: `<a href="https://www.facebook.com/${doc._id}" target="_blank"><img alt="Facebook" src="facebook-16x16-icon.png" width="20" height="20" /></a>`, datePosted: new Date(doc.created_time).toLocaleDateString(), image: url, content: cropText(doc.message)  });
                    });

                    setIsLoading(false);
                    setPostsData(newPostsData);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                    setIsLoading(false);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    const getShareableHashtagId = async (userId, hashtag) => {
        try {
            axios.get(`http://${BUILD_ENV.SERVICE_DOMAIN}:3001/social-archive/facebook/shareable-hashtag?userId=${profile.id}&hashtag=${hashtag}`
            )
                .then(res => {
                    return res.data;
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                    setIsLoading(false);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    const clearFacebookData = () => {
        setPostsData([]);
    }

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    }


    return (
        <div>
            <div className="parent">
                <header>
                    <div className="child">
                        <table>
                            <tbody>
                            <tr>
                                <td><img alt='' src={'./generic-profile.png'} style={{marginLeft: 4, marginRight: 10, width: 48, height: 48}}/></td>
                                <td><div style={{fontSize: 24, fontStyle: 'bold'}}>{ JSON.parse(localStorage.getItem('authToken')).userFullName}</div></td>
                            </tr>
                            </tbody>
                        </table>

                        { profile ?
                            <div>
                                <table style={{margin : 10}}>
                                    <tbody>
                                    <tr>
                                        <td><img alt='' src={pictureUrl} /></td>
                                        <td>
                                            <table style={{margin : 10}}>
                                                <tbody>
                                                <tr><td><h3>{profile.name}</h3></td></tr>
                                                <tr><td style={{marginTop: '0px'}}><div style={{float: 'top'}}><img alt="Facebook" src="./facebook-black.png" width="16" height="16" />&nbsp;User {profile.id}</div></td></tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            :''
                        }
                    </div>
                </header>

                <section className="left-sidebar">
                    { profile ?
                        <div>
                            <table style={{verticalAlign: 'top'}}>
                                <tbody style={{overflow: 'scroll'}}>
                                <tr>
                                    <td>
                                        <table className="table table-hover" style={{width: '100%', textAlign: 'left', height: '20px', borderRight: 'none', borderLeft: 'none', borderCollapse: 'collapse', marginBottom: '20px', overflow: 'hidden', marginLeft: '10px' }}>
                                            <tbody>
                                            <tr>
                                                <td colSpan={5}>
                                                    <div style={{textAlign: 'left'}}><b>{hashtags.length}</b> Archived {singularOrPlural(hashtags.length)}</div>
                                                </td>
                                            </tr>
                                            <tr><td colSpan={7}><hr/></td></tr>
                                            {hashtags ? hashtags.length > 0 && hashtags.map((item) => <tr><td colSpan={5} id={item.hashtag.sharedHashtag.hashtag} className="hashtag" onClick={handleGetHashtagButtonClicked} style={{textAlign: 'left', width: '40px', height: '25px'}} key={item}><img alt="Facebook" src="./facebook-black.png" width="16" height="16" />&nbsp;#{trimHashtagLengthForDisplay(item.hashtag.sharedHashtag.hashtag)}</td><td><div style={{float: 'right'}}>&nbsp;&nbsp;&nbsp;<a href={`http://${BUILD_ENV.VIEWER_DOMAIN}:3002?id=` + item.shareableId} target="_blank" style={{verticalAlign: 'top'}} rel="noreferrer"><img src={'./icons8-gallery-24.png'} width={'16px'} height={'16px'}/></a><img onClick={() => shareHashtag(item)} alt="Share" src="./export-share-icon.png" width="14" height-="14" style={{marginLeft: '5px'}} /><img onClick={() => deleteHashtag(item.hashtag)} alt="Share" src="./icons8-trash-24.png" width="16" height-="16" style={{marginLeft: '5px'}} /></div></td></tr>) : <tr><td>No Data</td></tr>}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>: <div style={{verticalAlign: 'top', minWidth: '300px'}}></div> }
                </section>
                <main>
                    { profile ?
                        <table>
                            <tbody>
                            <tr>
                                <td style={{verticalAlign: 'top'}}>
                                    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)} style={{marginLeft: '12px', borderLeft: '1px', width: '100%'}}>
                                        <TabList>
                                            <Tab><img src={'./icons8-search-50.png'} style={{verticalAlign: 'bottom', width: '16px', height: '16px'}}/>&nbsp;Search</Tab>
                                            <Tab><img src={'./storage_black_24dp.svg'} style={{verticalAlign: 'bottom', width: '16px', height: '16px'}}/>&nbsp;Archive</Tab>
                                        </TabList>
                                        <TabPanel>
                                            <div style={{overflow: 'scroll', height: '400px'}}>
                                                <label style={{margin : 10, color: 'darkgreen'}} htmlFor="hashtag-filter">Hashtag</label>
                                                <input type='text' id='hashtag-filter' value={hashtag} onChange={handleChange} />
                                                <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={getFacebookData} disabled={isLoading}>
                                                    Search
                                                </button>
                                                <button style={{marginLeft : 30, marginTop: 30, marginRight: '20px', color: 'darkgreen'}} onClick={clearFacebookData}>
                                                    Clear
                                                </button>
                                                <PostTableComponent
                                                    columns={COLUMNS}
                                                    hashtag={hashtag}
                                                    data={postsData}
                                                    selectableRows
                                                />
                                            </div>
                                        </TabPanel>
                                        <TabPanel>
                                            <label style={{margin : 10, color: 'darkgreen'}} htmlFor="hashtag-filter">Hashtag</label>
                                            <input type='text' id='hashtag-filter' onChange={handleChange} />
                                            <label style={{margin : 10, color: 'darkgreen'}} htmlFor="years">Oldest Year</label>
                                            <select name="years" id="years" style={{width: 55}} defaultValue={2024}>
                                                <option value="2013">2013</option>
                                                <option value="2014">2014</option>
                                                <option value="2015">2015</option>
                                                <option value="2016">2016</option>
                                                <option value="2017">2017</option>
                                                <option value="2018">2018</option>
                                                <option value="2019">2019</option>
                                                <option value="2020">2020</option>
                                                <option value="2021">2021</option>
                                                <option value="2022">2022</option>
                                                <option value="2023">2023</option>
                                                <option value="2024">2024</option>
                                            </select>
                                            <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={archiveFacebookData}>
                                                Archive
                                            </button>
                                            { isFetching ?
                                                <div style={{marginTop: 20}}>
                                                    <Audio
                                                        height="20"
                                                        width="20"
                                                        radius="9"
                                                        color="green"
                                                        ariaLabel="three-dots-loading"
                                                        wrapperStyle
                                                        wrapperClass
                                                    />

                                                </div> : ""}
                                        </TabPanel>
                                    </Tabs>
                                </td>
                            </tr>
                            </tbody>
                        </table> : <div></div> }
                        <table>
                            <thead>
                                <tr style={{fontSize: 30, fontStyle: 'bold'}}><td>Account</td><td>Last Archive Date</td><td>Count</td></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <LoginSocialFacebook
                                        appId={APP_ID}
                                        version="v18.0"
                                        scope='user_posts'
                                        onReject={(error) => {
                                            console.log('ERROR:' + error);
                                        }}
                                        onResolve={(response) => {
                                            setProfile(response.data);
                                        }}>
                                        <FacebookLoginButton/>
                                    </LoginSocialFacebook>
                                    </td><td>{new Date().toISOString()}</td><td>1000</td>
                                </tr>
                                <tr>
                                    <td>
                                        <div style={{marginLeft : 6, marginTop: 10, marginBottom: 4, borderRadius: 3, fontSize: 20, backgroundColor: '#d62976', color: 'white', borderWidth: 0, height: 60, width: 280, display: 'flex', flexDirection: 'row'}} onClick={logout}>
                                            <div><img src={'./instagram-white.png'} style={{width: 50, height: 50}} /></div>
                                            <div style={{marginTop: 14, fontSize: 18}}>Log in with Instagram</div>
                                        </div>
                                    </td><td>{new Date().toISOString()}</td><td>50</td>
                                </tr>
                            </tbody>
                        </table>
                </main>
                <footer style={{textAlign: 'right'}}>
                    <button style={{marginLeft : 10, marginTop: 10, marginBottom: 4, marginRight: 30, borderRadius: 3, fontSize: 20, backgroundColor: 'green', color: 'white', borderWidth: 0}} onClick={logout} disabled={isLoading}>
                    Log Out
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default MainPage;
