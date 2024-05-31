// this file contains custom Javascript 
var webstore = new Vue({
    el: '#app',
    data: {
        showProduct: true,
        sitename: 'Extra Curricular',
        cartButton: '<i class="fas fa-shopping-cart"></i> Checkout',
        // Using two way binding it changes these empty fields depending on what the user inputs
        searchTerm: '',
        sortStyle: '',
        // Array for cart for items to get added
        cart: [],
        order: {
            firstName: '',
            lastName: '',
            phoneNo: ''
        },
        lessonButton: "<i class='fas fa-plus'></i> Add to cart",
        // Uses products from external file
        products: [],
        inCartButton: "Remove",
        baseURL: "https://cw-2-theta.vercel.app/"
    },
    created() {
        this.getCourses()
    },

    methods: {
        async getCourses() {
            var url = "https://cw-2-theta.vercel.app/collection/products"
            var products = await fetch(url)
            products = await products.json()
            this.products = products
            // console.log("fetched")
        },
        // Adds the product id to cart and decreases a space by 1
        addToCart: function (product) {
            this.cart.push(product._id);
            product.spaces--;
        },
        // Checks if there is still available product left
        canAdd: function (product) {
            return product.spaces > 0;
        },
        // Depending on the boolean value shows the product or checkout page
        showCheckout() {
            this.showProduct = this.showProduct ? false : true;
        },
        // Counts how many times an item is in the cart
        counter(id) {
            let counter = 0;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i] === id) {
                    counter++;
                }
            }
            if (counter > 0) {
                return counter;
            }
        },
        // If the product is in the cart at least once it will display it on the checkout page
        showInCart(product, _id) {
            let counter = this.counter(_id);
            if (counter > 0) {
                return product.name;
            }
        },

        // When the button is clicked sends out an alert and refreshes the page
        async placeOrder() {
            console.log('test')
            var order = {
                cart: [...this.cart],
                firstname: this.order.firstName,
                lastname: this.order.lastName,
                phone: this.phoneNo,
            };

            // Update lessons
            this.cart.forEach((item) => {
                var lesson = this.products.filter(p => p._id == item)[0]
                fetch(`${this.baseURL}collection/products/${item}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ spaces: lesson.spaces - this.counter(item) }),
                });
            });

            // Save Order
            await fetch(`${this.baseURL}collection/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order),
            });
            alert("Order Submitted");
            this.cart = [];
            this.showProduct = true;
        },

        // Removes the product id from the array and increases the space of the product if it exists in the array in the first place
        removeFromCart(product) {
            const index = this.cart.indexOf(product._id);
            if (index > -1) {
                this.cart.splice(index, 1);
            }
            product.spaces++;
        }
    },
    // COMPUTED IS USE TO DETECT ANY CHANGES IN THE APP VARIABLES (DATA)
    computed: {
        // Checks how many items in cart
        cartCount: function () {
            return this.cart.length || '';
        },
        cartLenth: function () {
            return cartCount > 0;
        },
        // Checks if any fields are empty or fail the RegEx
        emptyFields() {
            return (/^[a-zA-Z]+$/.test(this.order.firstName) && /^[a-zA-Z]+$/.test(this.order.firstName) && /^\d+$/.test(this.order.phoneNo))
        },
        // Sorts products by price low to high
        sortedProducts() {
            function compare(a, b) {
                if (a.price > b.price) return 1;
                if (a.price < b.price) return -1;
                return 0;
            }
            return this.products.sort(compare);
        },
        // Sorts products by price high to low
        sortedProductsHigh() {
            function compare(a, b) {
                if (a.price < b.price) return 1;
                if (a.price > b.price) return -1;
                return 0;
            }
            return this.products.sort(compare);
        },
        // Sorts products alphabetically from A to Z
        alphabetProducts() {
            function compare(a, b) {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
            }
            return this.products.sort(compare);
        },
        // Sorts products from Z to A
        alphabetProductsZ() {
            function compare(a, b) {
                if (a.name < b.name) return 1;
                if (a.name > b.name) return -1;
                return 0;
            }
            return this.products.sort(compare);
        },
        // Uses a special function to check whether the search term inputted is included in
        // The product name, location, price or spaces.  It is case sensitive
        searchField() {
            return this.products.filter(product => {
                return (product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    product.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    // For the data saved as integers, they get cast to String which lets it match any typed numbers 
                    product.price.toString().includes(this.searchTerm.toLowerCase()) ||
                    product.spaces.toString().includes(this.searchTerm.toLowerCase()))
            })
        },

        cartItems() {
            var items = []
            this.cart.forEach(cid => {
                var product = this.products.find(p => p._id === cid)
                items.push(product)
            })
            return items
        }
    }
});
