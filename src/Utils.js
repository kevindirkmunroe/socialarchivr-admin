import {format} from "date-fns";
import {enUS} from "date-fns/locale";

export const accountImageFinder = (accountType) => {
    switch (accountType){
        case 'FACEBOOK':
            return "./facebook-black.png";
        case 'INSTAGRAM':
            return "./black-instagram-logo-3497.png";
        default:
            break;
    }
}

export const formatDate = (date) => {
    return format(date, "EEEE MMMM do h:mmaaa", { locale: enUS });
}
