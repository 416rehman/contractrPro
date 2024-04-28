// On server there is no local storage so we use this function to get the local storage value if it exists, otherwise we return the default value

export const getLocalStorageItem = (key: string, defaultValue: any = null) => {
    if (typeof localStorage === "undefined") {
        return defaultValue;
    }

    const value = localStorage.getItem(key);
    if (!value) {
        return defaultValue;
    }
};

export const setLocalStorageItem = (key: string, value: any) => {
    if (typeof localStorage === "undefined") {
        return;
    }

    localStorage.setItem(key, value);
};

export const removeLocalStorageItem = (key: string) => {
    if (typeof localStorage === "undefined") {
        return;
    }

    localStorage.removeItem(key);
};

export const addNewCookie = (key: string, value: string, expires: number) => {
    if (typeof document === "undefined") {
        return;
    }

    document.cookie = `${key}=${value}; expires=${expires}; path=/`;
}

export const removeCookie = (key: string) => {
    if (typeof document === "undefined") {
        return;
    }
    
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}