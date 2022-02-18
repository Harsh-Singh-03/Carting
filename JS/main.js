let cartBtn = document.querySelector('.cart-btn');
let closeCartBtn = document.querySelector('.close-cart');
let clearCartBtn = document.querySelector('.clear-cart');
let cartDOM = document.querySelector('.cart');
let cartOverlay = document.querySelector('.cart-overlay');
let cartItems = document.querySelector('.cart-items');
let cartTotal = document.querySelector('.cart-total');
let cartContent = document.querySelector('.cart-content');
let productsDOM = document.querySelector('.products-center');
// cart
let cart = [];
let btnsDOM = [];
//getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch('product.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, camera, price, display} = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, camera, price, display, id, image }
            })
            return products;
        } catch (error) {
            console.log(error)
        }
    }
}
//display product
class UI {
    displayProducts(products) {
        //  console.log(products)
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
            <img src=${product.image} alt="product" class="product-img">
            <p class="trying">${product.camera}<br>=> Qualcom snapdragon 720G :<br>${product.display}<br>=> 4/64 GB :</p>
            <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart">
            Add to cart
            </i>
            </button>
            </div>
            <h3>${product.title}</h3>
            <h4>${product.price}.00 Rs/-</h4>
            </article> `;
        });
        productsDOM.innerHTML = result;
    }
    
    getBagButtons() {
 
        let btns = [...document.querySelectorAll('.bag-btn')];
        btnsDOM = btns;
        // console.log(btns)
        btns.forEach(btns => {
            let id = btns.dataset.id;
            // console.log(id)
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                btns.innerText = "in Cart"
                btns.disabled = true;
            }
            btns.addEventListener('click', event => {
                // console.log(event)
                event.target.innerText = "in Cart";
                event.target.disabled = true;
                //get product from products 
                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                // console.log(cartItem)
                // add product to the cart
                cart = [...cart, cartItem]
                //    console.log(cart)
                // save cart in local storage
                Storage.saveCart(cart)
                // set cart value
                this.setCartValues(cart);
                //  add cart item 
                //  display cart item
                this.addCartItem(cartItem)
                //show the cart
                this.showCart();
            });

        });
    }
    setCartValues(cart) {
        let tmpTotal = 0;
        let itemTotal = 0
        cart.map(item => {
            tmpTotal += item.price * item.amount;
            itemTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tmpTotal.toFixed(2))
        cartItems.innerText = itemTotal;
        // console.log(cartTotal,cartItems);
    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="Products">
        <div>
            <h4>${item.title}</h4>
            <h5>${item.price} Rs/-</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
        // console.log(cartContent)
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    setUpApp() {
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart) {
        cart.forEach(items => {
            this.addCartItem(items)
        })
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    cartLogic() {
        // clar cart button 
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })
        // cart functionality
        cartContent.addEventListener('click', event => {
            // console.log(event.target)
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                // console.log(removeItem);
                let id = removeItem.dataset.id;
                // console.log(removeItem.parentElement.parentElement);
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id);
            }
            else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                // console.log(addAmount)
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
            }
        })

    }
    clearCart() {
        let cartItems = cart.map(item => item.id)
        // console.log(cartItems)
        cartItems.forEach(id => this.removeItem(id));
        // console.log(cartContent.children)
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let btns = this.getSingleButton(id)
        btns.disabled = false;
        btns.innerHTML = `<i class="fas fa-shopping-cart">add to cart</i>`
    }
    getSingleButton(id) {
        return btnsDOM.find(btns => btns.dataset.id === id);
    }
}
//local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id == id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // set up app
    ui.setUpApp();
    // get all products

    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});