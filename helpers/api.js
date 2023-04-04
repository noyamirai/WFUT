import fetch from 'node-fetch';
import { getResultKey } from './utils.js';

class ApiClass {

    constructor(api_key) {
        this.apiKey = api_key;
    }

    getJsonData = async (params) => {

        const jsonData = await this.apiCall(params);

        // todo: error handling
        if (jsonData.failed) {
            return jsonData.data;
        }

        const resultKey = getResultKey(jsonData);
        return jsonData[resultKey];
    }

    getMultipleJsonDatas = async (fetchUrls) => {

        const promises = fetchUrls.map(async (url) => {
            return await this.getJsonData(url);
        });

        return Promise.all(promises);
    }

    apiCall = async (uri) => {

        try {

            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${this.apiKey}/${uri}`);

            if (response.ok) {
                const data = await response.json();
                const dataResultKey = getResultKey(data);

                if (!data[dataResultKey] || data[dataResultKey].length == 0) {
                    return { failed: true, error:`No data found`, data: []};
                }

                return data;
            }

            return { failed: true, error:`HTTP error! Status: ${response.status}`, data: []};
            
        } catch (error) {
            return { failed: true, error:`${error}`, data: []};
        }
    }

}

export default ApiClass;