const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<style>
.box {
    height: 300px;
    overflow: auto;
}
</style>
<div class="box has-background-info-dark">
<div class="is-large p-1">
  <div class="container has-text-centered is-max-desktop">
    <div class="title has-text-light"><slot name="title">Your Song</slot></div>
    <div class="subtitle has-text-weight-bold has-text-light">
    by <slot name="artist">???</slot><br>
    (<slot name="genre">no genre</slot>)</div>
    <div class="subtitle has-text-weight-bold has-text-light"><slot name="lyrics">no lyrics</slot></div>
    <button
    id="btn-favorite"
    class="button is-primary is-inverted is-outlined is-large mt-2"
    title="Save your song to the faves!">Save to favorites!</button>
  </div>
</div>
</div>
`

class cardComponent extends HTMLElement{
  constructor(){
      super();
      this.attachShadow({mode: "open"});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
  
  connectedCallback(){
    this.btnFavorite = this.shadowRoot.querySelector("#btn-favorite");
    this.callback = this.callback || console.warn("Card with ID " + this.getAttribute("data-id") + " not connected to favorite saver callback!");
    if(!this.getAttribute("data-id")){
      this.btnFavorite.setAttribute("disabled", "");
    }else{
      this.btnFavorite.onclick = () => {
        this.callback();
        this.setAsFavorite();
      };
    }
  }

  disconnectedCallback(){
    this.btnFavorite.onclick = null;
  }

  setAsFavorite(){
    this.btnFavorite = this.shadowRoot.querySelector("#btn-favorite");
    this.btnFavorite.classList.remove("is-outlined");
    this.btnFavorite.innerHTML = "Favorited";
    this.btnFavorite.setAttribute("disabled", "");
  }
}
    
customElements.define('card-component', cardComponent);