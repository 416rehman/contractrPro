import {API} from "./api";

export const pingAPI = async (): Promise<boolean> => {
    return API.get<boolean>('/').then(response => response).catch(() => false);
}
