// Import Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getDatabase, ref, get, child } from  "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";
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
import { clearFavorites, loadStorage, saveNewFavorite } from "./utils.js";

// HTML elements
const elementCardHolder = document.querySelector("#element-card-holder");
const btnClear = document.querySelector("#btn-clear");

// State variables
const nameKey = "wno9619-p1-settings";

window.onload = placeFavorites;

btnClear.addEventListener("click", function(){
    clearFavorites(nameKey);
    elementCardHolder.innerHTML = "";
});

function placeFavorites(){
    // Get connected to the server
    const db = getDatabase();
    let songRef = ref(db, "fsom-music");

    // Identify which song in fsom-music to download from the saved favorites
    let storage = loadStorage(nameKey, "favorites");
    console.log(storage);
    
    for (let fave of storage)
    {
        get(child(songRef, fave))
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
                newCard.dataset.id = fave;
                newCard.innerHTML = html;
                newCard.setAsFavorite();
                elementCardHolder.appendChild(newCard);
            } else {
                console.log("No data available");
            }
        })
        .catch((e) => console.log(e));
    }
}