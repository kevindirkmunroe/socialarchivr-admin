import axios from "axios";
import BUILD_ENV from "./Environment";

export function isFacebookTokenValid (authToken){
    axios.get(`https://graph.facebook.com/debug_token?input_token=${authToken}&access_token={app-access-token-or-developer-token}`)
        .then(res => {
            console.log(`getArchiveAccount ${username}: ${JSON.stringify(res.data)}`);
            // setSelectedArchiveAccounts(res.data);
        })
        .catch((error) => {
            console.log(`ARCHIVE ACCOUNTS ERROR: ${JSON.stringify(error)}`);
        });
}
