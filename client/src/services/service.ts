import axios from 'axios';

export class Service {
    static API_URL: string = process.env.REACT_APP_API_BASE_URL || '';

    // Returns a promise that resolves to the response data if the response is successful.
    static get<T>(url: string): Promise<T> {
        return axios.get(`${this.API_URL}${url}`)
            .then(response => response.data);
    }

    static post<T>(url: string, data: any): Promise<T> {
        return axios.post(`${this.API_URL}${url}`, data)
            .then(response => response.data);
    }

    static put<T>(url: string, data: any): Promise<T> {
        return axios.put(`${this.API_URL}${url}`, data)
            .then(response => response.data);
    }

    static delete<T>(url: string): Promise<T> {
        return axios.delete(`${this.API_URL}${url}`)
            .then(response => response.data);
    }
}
