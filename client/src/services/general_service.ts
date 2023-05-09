import {Service} from "./service";

export const pingAPI = async (): Promise<boolean> => {
    return Service.get<boolean>('/').then(response => response).catch(() => false);
}
