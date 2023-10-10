// Import utils
import { fetchJson, genArtistName, genLyrics, genSongName, loadStorage, saveNewFavorite, saveState } from "./utils.js";
import { makeMarkovFrom } from "./utils.js";

// Import Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from  "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyBa25aA-3eHTGus2frhDEtPrHFaAa-LPDk",
authDomain: "futuresound-40fdf.firebaseapp.com",
projectId: "futuresound-40fdf",
storageBucket: "futuresound-40fdf.appspot.com",
messagingSenderId: "73217493307",
appId: "1:73217493307:web:ce8deff0bf9bb629628f1e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Loads web components
import "./init.js"

// HTML elements
const btnGenre = document.querySelector("#btn-get-genre")
const btnArtist = document.querySelector("#btn-gen-artist");
const btnSong = document.querySelector("#btn-gen-song");
const btnLyrics = document.querySelector("#btn-gen-lyrics");
const btnPublish = document.querySelector("#btn-publish");
const btnStartOver = document.querySelector("#btn-start-over");
const lyricsArea = document.querySelector("#lyrics-area");
const genreName = document.querySelector("#genre-name");
const artistName = document.querySelector("#artist-name");
const songName = document.querySelector("#song-name");
const resultCardHolder = document.querySelector("#result-card-holder");
const header = document.querySelector("header-component");

// State variables
const nameKey = "wno9619-p1-settings";
const songObj = {
    id: "",
    genre: "",
    artist: "",
    song: "",
    lyrics: "",
    artistWordSet: "",
    songWordSet: ""
}
let sessionSong;

// App data
let dictionary;
const wordTypes = [":adjective", ":noun", ":adverb", ":satellite", ":verb"];

window.onload = initVariables;
window.onbeforeunload = exitApp;

async function initVariables(){
    console.log("Brought to you by RiTa Version " + RiTa.VERSION + " by Rednoise. See: https://rednoise.org/rita/");
    const dataSuccessCallback = json => {
        dictionary = json;
    }
    await fetchJson("data/synonyms.json", dataSuccessCallback);

    // Load the app state if one exists
    let saveState = loadStorage(nameKey, "appState");

    if(!saveState.id){
        newSession();
    }
    else{
        loadSession(saveState);
    }
    
    displayCard();
}

function exitApp(){
    saveState(nameKey, sessionSong);
}

btnGenre.addEventListener("click", async function() {
    try{
        btnGenre.classList.add("is-loading");
        await fetchJson("https://binaryjazz.us/wp-json/genrenator/v1/genre/", genreCallback);
    }catch(e){
        console.log(`In "app.js" btnGenre event listener catch with error ${e}`);
    }
});

btnArtist.addEventListener("click", async function() {
    try{
        btnArtist.classList.add("is-loading");
        await genArtistName(sessionSong.genre, dictionary, wordTypes, artistCallback, artistDataCollectCallback);
    }catch(e){
        console.log(`In "app.js" btnArtist event listener catch with error ${e}`);
    }
});

btnSong.addEventListener("click", async function() {
    try{
        btnSong.classList.add("is-loading");
        await genSongName(sessionSong.artistWordSet, dictionary, wordTypes, songCallback, songDataCollectCallback);
    }catch(e){
        console.log(`In "app.js" btnLyrics event listener catch with error ${e}`);
    }
});

btnLyrics.addEventListener("click", function() {
    try{
        genLyrics(sessionSong.songWordSet, dictionary, wordTypes, lyricsCallback);
    }catch(e){
        console.log(`In "app.js" btnSong event listener catch with error ${e}`);
    }
});

btnPublish.addEventListener("click", function() {
    const db = getDatabase();
    set(ref(db, "fsom-music/" + sessionSong.id), {
        genre: sessionSong.genre,
        artist: sessionSong.artist,
        song: sessionSong.song,
        lyrics: sessionSong.lyrics
    });
    displayCard();
});

btnStartOver.addEventListener("click", function() {
    newSession();
})

const genreCallback = (result) => {
    genreName.innerHTML = result;
    sessionSong.genre = result;
    genreName.classList.add("is-underlined");
    btnGenre.classList.remove("is-loading");
    btnArtist.removeAttribute("disabled");
    header.innerHTML = `some ${result}`;
};

const artistCallback = (result) => {
    artistName.innerHTML = result;
    sessionSong.artist = result;
    artistName.classList.add("is-underlined");
    btnArtist.classList.remove("is-loading");
    btnSong.removeAttribute("disabled");
};

const songCallback = (result) => {
    songName.innerHTML = result;
    sessionSong.song = result;
    songName.classList.add("is-underlined");
    btnSong.classList.remove("is-loading");
    btnLyrics.removeAttribute("disabled");
    if(lyricsArea.innerHTML == "[awaiting data]"){
        lyricsArea.innerHTML = "[ready!]";
    }
};

const lyricsCallback = (result) => {
    lyricsArea.innerHTML = result;
    sessionSong.lyrics = result;
    btnLyrics.classList.remove("is-loading");
    btnPublish.removeAttribute("disabled");
};

const artistDataCollectCallback = (result) => {
    sessionSong.artistWordSet = result;
}

const songDataCollectCallback = (result) => {
    sessionSong.songWordSet = result;
}

const newSession = () => {
    sessionSong = Object.create(songObj);
    sessionSong.id = crypto.randomUUID();
    btnArtist.setAttribute("disabled", "");
    btnSong.setAttribute("disabled", "");
    btnLyrics.setAttribute("disabled", "");
    btnPublish.setAttribute("disabled", "");
    genreName.classList.remove("is-underlined");
    artistName.classList.remove("is-underlined");
    songName.classList.remove("is-underlined");
    genreName.innerHTML = "...";
    artistName.innerHTML = "...";
    songName.innerHTML = "...";
    lyricsArea.innerHTML = "[awaiting data]";
    displayCard();
};

const loadSession = (saveObj) => {
    sessionSong = Object.create(songObj);
    Object.assign(sessionSong, saveObj);
    
    // If genre exists, load it
    // If not, disable what requires it
    // And so on for all other parts of the process
    // This is the code most deserving of a refactor in the entire project
    if(sessionSong.genre){
        genreCallback(sessionSong.genre);
    }
    else{
        btnArtist.setAttribute("disabled", "");
    }

    // Same for artist
    if(sessionSong.artist){
        artistCallback(sessionSong.artist);
    }
    else{
        btnSong.setAttribute("disabled", "");
    }

    // Same for song
    if(sessionSong.song){
        songCallback(sessionSong.song);
    }
    else{
        btnLyrics.setAttribute("disabled", "");
    }

    // Same for lyrics
    if(sessionSong.lyrics){
        lyricsCallback(sessionSong.lyrics);
    }
    else{
        btnPublish.setAttribute("disabled", "");
    }
}

const displayCard = () => {
    resultCardHolder.innerHTML = "";
    // Get connected to the server
    const db = getDatabase();
    let songRef = ref(db, "fsom-music");
    
    get(child(songRef, sessionSong.id))
        .then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                const json = snapshot.val();
                const html = `
                    <span slot="title">${json.song}</span>
                    <span slot="artist">${json.artist}</span>
                    <span slot="genre">${json.genre}</span>
                    <span slot="lyrics">${json.lyrics}</span>`;
                const newCard = document.createElement("card-component");
                newCard.dataset.id = sessionSong.id;
                newCard.innerHTML = html;
                newCard.callback = () => {
                    saveNewFavorite(nameKey, sessionSong.id);
                };
                resultCardHolder.appendChild(newCard);
            } else {
                const html = `
                <card-component>
                    <span slot="title">future song</span>
                    <span slot="artist">...</span>
                    <span slot="genre">...</span>
                    <span slot="lyrics">your song is not in the database yet</span>
                </card-component>`;
                resultCardHolder.innerHTML = html;
            }
        })
        .catch((e) => console.log(e));
}