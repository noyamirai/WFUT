import fetch from 'node-fetch';

class ApiClass {

    constructor(api_key) {
        this.apiKey = api_key;
        this.leagueId = 4849;
    }

    getResultKey = (data) => {
        let objectKey;

        for (const key in data) {
            objectKey = Object.keys(data)[0];
        }

        return objectKey;
    }

    sortByDate = (a, b) => {
        return new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime();
    } 

    getLeagueTeams = async () => {

        const jsonData = await this.getJsonData(`search_all_teams.php?l=English_Womens_Super_League`);
        const resultKey = this.getResultKey(jsonData);

        return jsonData[resultKey];

    }

    getUpcomingEvents = async () => {

        const jsonData = await this.getJsonData(`eventsnextleague.php?id=${this.leagueId}`);
        const resultKey = this.getResultKey(jsonData);

        let result = jsonData[resultKey].sort(this.sortByDate);
        result = result.slice(0, 1);

        return result[0];
    }

    getJsonData = async (params) => {

        const jsonData = await this.apiCall(params);

        if (jsonData.failed) {
            return jsonData;
        }

        return jsonData;
    }

    apiCall = async (uri) => {

        try {

            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${this.apiKey}/${uri}`);

            if (response.ok) {
                const data = await response.json();
                return data;
            }

            return { failed: true, error:`HTTP error! Status: ${response.status}`};
            
        } catch (error) {
            return { failed: true, error:`${error}`};
        }
    }

}

export default ApiClass;