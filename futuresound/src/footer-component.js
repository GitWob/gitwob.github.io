const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<footer class="footer has-background-grey-dark">
    <p class="subtitle has-text-light has-text-weight-bold">Pretend you are here</p>
    <img class="image mt-2" src="images/record-store.png" alt="You are in a record store with yellow crates low to the ground, full of vinyl yet to be heard.">
    <div class="content has-text-centered has-text-light mt-6">
        <p>
            The website uses <b>Bulma</b> by <a class="has-text-primary" href="https://jgthms.com">Jeremy Thomas</a>. The source code is licensed
            <a class="has-text-primary" href="http://opensource.org/licenses/mit-license.php">MIT</a>. The website content
            is licensed <a class="has-text-primary" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY NC SA 4.0</a>.
        </p>
        <p>
            <slot></slot><br><a id="email" class="has-text-primary">No address</a>
        </p>
    </div>
</footer>`

class footerComponent extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        let email = this.shadowRoot.querySelector("#email");
        let address = this.getAttribute("data-email");
        email.setAttribute("href", `mailto:${address}`);
        email.innerHTML = address;
    }
}

customElements.define('footer-component', footerComponent);