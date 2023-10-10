export async function genArtistName(genreName, dictionary, wordTypes, callback, dataCallback){
    try{
        let text = [];
        const genreWords = RiTa.tokenize(genreName);
        const genArtistWords = async () => {
            for (let word of genreWords){
                text = text.concat(genSynonyms(word, dictionary, wordTypes));
            }
            dataCallback(text);
        }
        await genArtistWords();
        let selectIndex = Math.floor((Math.random() * text.length));
        text = text[selectIndex];
        setTimeout(() => {
            callback(text);
        }, "150");
    }catch(e){
        console.log(`In "utils.js/genArtistName" catch with e = ${e}`);
    }
};

export async function genSongName(artistWordSet, dictionary, wordTypes, callback, dataCallback){
    try{
        let text = [];
        const genSongWords = async () => {
            text = synonymsFromArray(artistWordSet, dictionary, wordTypes);
            dataCallback(text);
        }
        await genSongWords();
        let selectIndex = Math.floor((Math.random() * text.length));
        let selectIndex2 = Math.floor((Math.random() * text.length));
        text = `${text[selectIndex]} ${text[selectIndex2]}`;
        setTimeout(() => {
            callback(text);
        }, "250");
    }catch(e){
        console.log(`In "utils.js/genSongName" catch with e = ${e}`);
    }
};

export async function genLyrics(songWordSet, dictionary, wordTypes, callback){
    try{
        let text = [];
        for(let i = 0; i < 9; i++){
            let selectIndex = Math.floor((Math.random() * songWordSet.length));
            let themeWord = songWordSet[selectIndex];
            let rhymes = RiTa.rhymes(themeWord, {limit:10});
            let selectIndex2 = Math.floor((Math.random() * rhymes.length));
            let rhyme = rhymes[selectIndex2] || songWordSet[0];
            text.push(`${themeWord} ${rhyme}`);
        }
        setTimeout(() => {
            callback(text.join("<br>"));
        }, "500");
    }catch(e){
        console.log(`In "utils.js/genLyrics" catch with e = ${e}`);
    }
}

export async function fetchJson(url, callback){
    try{
        const fetchPromise = async () => {
            const response = await fetch(url);
            callback(await response.json());
        }
        fetchPromise();
    }catch(e){
        console.log(`In "utils.js/fetchJson" catch with e = ${e}`);
    }
};

export const synonymsFromArray = (array, dictionary, wordTypes) => {
    let synonymGroup = [];
    for(let word of array){
        let newWords = genSynonyms(word, dictionary, wordTypes);
        synonymGroup = synonymGroup.concat(newWords);
    }
    return synonymGroup;
}

export const genSynonyms = (word, dictionary, wordTypes) => {
    let synonyms = [];
    
    // Search through the dictionary using every word type
    for(let type of wordTypes){
        let newWords = "";
        const searchWord = `${word}${type}`;
        if(newWords = dictionary[searchWord])
        {
            newWords = newWords.split(";");
            synonyms = synonyms.concat(newWords);
        }
    }

    // If synsArray is still empty, than the search found nothing- return the original word
    if(synonyms == undefined){
        return word;
    }
    else{
        return synonyms;
    }
};

export const genRhymingLine = () => {};
export const breakCompoundWord = () => {};

export const makeMarkovFrom = (data, data2, data3, data4, num) => {
    const rm = RiTa.markov(num);
    rm.addText(data);
    rm.addText(data2);
    rm.addText(data3);
    rm.addText(data4);
    return rm.generate();
};

export const cleanJson = (obj) => {    
    const newObject = {};
    const keys = Object.keys(obj);
    let cleanArray = [];
    
    function isDuplicate(val){
        if(cleanArray.includes(val)){
            return true;
        }
        else{
            cleanArray.push(val);
            return false;
        }
    };
    
    cleanArray = keys.filter(isDuplicate);

    for (let key of cleanArray)
    {
        Object.defineProperty(newObject, key, {
            value: "test",
            writable: false
        });
    }

    return newObject;
};

// LocalStorage helper methods

const stateObj = {
    id: "",
    genre: "",
    artist: "",
    song: "",
    lyrics: ""
};

const verifyLocalStorage = (nameKey) => {
    // Load the local storage
    let storageObject = JSON.parse(localStorage.getItem(nameKey));

    // If local storage hasn't been initialized, do it now
    if (storageObject == null){
        storageObject = {
            appState: {
                id: "",
                genre: "",
                artist: "",
                song: "",
                lyrics: "",
                artistWords: "",
                songWords: ""
            },
            favorites: []
        }
    }

    localStorage.setItem(nameKey, JSON.stringify(storageObject));

    return storageObject;
};

export const saveNewFavorite = (nameKey, newFave) => {
    let storageObject = verifyLocalStorage(nameKey);

    if(!storageObject.favorites.includes(newFave)){
        storageObject.favorites.push(newFave);
    }
    localStorage.setItem(nameKey, JSON.stringify(storageObject));

    // let storageObject = localStorage.getItem(nameKey);

    // // Be sure the storage object exists
    // if(storageObject == null){
    //     jsonObject = {
    //         appState: {},
    //         favorites: []
    //     };
    // }

    // let jsonObject = JSON.parse(storageObject);
    // let favoriteList = jsonObject.favorites;

    // // Be sure there is something to push to if there are no favorites yet
    // if(favoriteList == null){
    //     favoriteList = [];
    // }

    // favoriteList.push(newFave);
    // Object.defineProperty(jsonObject, "favorites", favoriteList);
    // localStorage.setItem(nameKey, JSON.stringify(jsonObject));
};

export const clearFavorites = (nameKey) => {
    let storageObject = verifyLocalStorage(nameKey);

    storageObject.favorites = [];

    localStorage.setItem(nameKey, JSON.stringify(storageObject));
};

export const saveState = (nameKey, songObject) => {
    let storageObject = verifyLocalStorage(nameKey);

    let state = Object.create(stateObj);
    Object.assign(state, songObject);
    storageObject.appState = state;

    localStorage.setItem(nameKey, JSON.stringify(storageObject));

    // let storageObject = localStorage.getItem(nameKey);

    // // Be sure the storage object exists
    // if(storageObject == null){
    //     jsonObject = {
    //         appState: {},
    //         favorites: []
    //     };
    // }

    // let jsonObject = JSON.parse(storageObject);
    // let state = jsonObject.appState;

    // // Be sure there is something to push to if there is no appState left
    // if (state == null){
    //     state = Object.create(stateObj);
    // }

    // Object.assign(state, songObject);
    // Object.defineProperty(jsonObject, "appState", state);
    // localStorage.setItem(nameKey, JSON.stringify(jsonObject));
};

// This is a wrapper for getting localStorage that can be accessed from other js scripts
export const loadStorage = (nameKey, dataType) => {
    let storageObject = verifyLocalStorage(nameKey);
    return storageObject[dataType];
};