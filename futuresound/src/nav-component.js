const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<nav class="navbar has-shadow is-white">
    <!-- logo/brand -->
    <div class="navbar-brand">
    <a class="navbar-item" href="home.html">
        <i class="fas fa-music"></i>
    </a>
    <a class="navbar-burger" id="burger">
        <span></span>
        <span></span>
        <span></span>
    </a>
    </div>

    <div class="navbar-menu" id="nav-links">
    <div class="navbar-start">
        <span id="home" class="mt-2">
            <a class="navbar-item is-hoverable" href="home.html">
            Home
            </a>
        </span>

        <span id="app" class="mt-2">
            <a class="navbar-item is-hoverable" href="app.html">
            App
            </a>
        </span>
        
        <span id="favorites" class="mt-2">
            <a class="navbar-item is-hoverable" href="favorites.html">
            Favorites
            </a>
        </span>

        <span id="community" class="mt-2">
            <a class="navbar-item is-hoverable" href="community.html">
            Community
            </a>
        </span>
        
        <span id="documentation" class="mt-2">
            <a class="navbar-item is-hoverable" href="documentation.html">
            Documentation
            </a>
        </span>
    </div>
    </div>
</nav>`;

class navbarComponent extends HTMLElement{
constructor(){
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
}

connectedCallback(){
    // Mobile menu
    const burgerIcon = this.shadowRoot.querySelector("#burger");
    const navbarMenu = this.shadowRoot.querySelector("#nav-links");
    
    // Identify and highlight the tab we're in
    const data = this.getAttribute("data-page");
    const tab = this.shadowRoot.querySelector(`#${data}`)
    const pageName = data.charAt(0).toUpperCase() + data.slice(1);
    tab.innerHTML = `<span class="navbar-item"><b>${pageName}</b></span>`

    burgerIcon.addEventListener('click', () => {
        navbarMenu.classList.toggle('is-active');
    });
}

disconnectedCallback(){
    this.shadowRoot.querySelector("#burger").removeEventListener('click');
}

attributeChangedCallback(){

}


}

customElements.define('nav-component', navbarComponent);