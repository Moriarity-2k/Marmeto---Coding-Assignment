/**
 * Fetches product details asynchronously from the given URL
 * @returns Product details
 */

async function getProducts() {
	const response = await fetch(
		"https://cdn.shopify.com/s/files/1/0564/3685/0790/files/singleProduct.json"
	);
	if (!response.ok) {
		throw new Error("Failed to fetch product details");
	}
	const result = await response.json();
	return result.product;
}

class Product {
	currentColor = [0, ""];
	currentSize = [0, ""];
	currentQuantity = 1;
	currentImage = 1;

	constructor() {
		this.init();
	}

	/**
	 * Initializes the product details by fetching from the server
	 */
	async init() {
		const productDetails = await getProducts();
		this.updatePrices(
			parseFloat(productDetails.price.slice(1)),
			parseFloat(productDetails.compare_at_price.slice(1))
		);

		this.updateColors(productDetails.options[0].values);
		this.updateSizes(productDetails.options[1].values);
		this.setupQuantityControls();
		this.print();
		this.changeImages(productDetails.images);
		this.renderDescription(productDetails.description);
	}

	/**
	 *
	 * Renders the initial Images and adds a event listener to change the main potrait picture
	 */
	changeImages(images) {
		/**
		 * CDN Image links are not working .. problem with Api image url
         
         * const imageElements = images
                .map((element) => {
                    return `<img src=${element.src} alt="variant-one" class="variant-image" />`;
                })
                .join(" ");
		 */

		document
			.querySelector(".container-image-var")
			.addEventListener("click", (e) => {
				const index = e.target.getAttribute("data-index");
				if (!index) return;

				this.currentImage = index;
				this._renderImages();
			});

		this._renderImages();
	}

	/**
	 * function to render the images
	 */
	_renderImages() {
		/**
		 * Displaying the main image
		 */

		const potraitImage = `<img
						src="./images/variant-${this.currentImage}.jpg"
						class="main-image"
						alt="hello"
					/>`;

		const potraitContainer = document.querySelector(".container-image");
		potraitContainer.innerHTML = "";
		potraitContainer.insertAdjacentHTML("afterbegin", potraitImage);

		/**
		 * Displaying the other potrait variants
		 */

		const images = [1, 2, 3, 1];

		const potraitVariants = images
			.map((x) => {
				return `<img
						src="./images/variant-${x}.jpg"
						alt="variant-${x}"
						class="variant-image"
						data-index=${x}
					/>`;
			})
			.join(" ");

		const potraitVariantsContainer = document.querySelector(
			".container-image-var"
		);
		potraitVariantsContainer.innerHTML = "";
		potraitVariantsContainer.insertAdjacentHTML(
			"afterbegin",
			potraitVariants
		);
	}

	/**
	 * displays the prices fetched from the server
	 * @param finalPrice - Final price after discount
	 * @param initialPrice - Initial price before discount
	 */
	updatePrices(finalPrice, initialPrice) {
		const discount = Math.round(
			((initialPrice - finalPrice) / initialPrice) * 100
		);
		document.querySelector(".price").textContent = `$${initialPrice.toFixed(
			2
		)}`;
		document.querySelector(
			".discount-percentage"
		).textContent = `${discount}% off`;
		document.querySelector(
			".discount-price"
		).textContent = `$${finalPrice.toFixed(2)}`;
	}

	/**
	 * Changes and displays color options
	 * @param colorValues - List of all colors
	 */
	updateColors(colorValues) {
		const colorNames = colorValues.map((x) => Object.keys(x)[0]);
		const colorCodes = colorValues.map((x) => Object.values(x)[0]);

		this.currentColor = [0, colorNames[0]];
		const colorVariants = document.querySelector(".color-variants");

		colorVariants.addEventListener("click", (e) => {
			const index = e.target.getAttribute("data-index");
			if (!index) return;
			this.currentColor = [+index, colorNames[+index]];
			this._renderColors(colorCodes);
		});

		this._renderColors(colorCodes);
	}

	/**
	 * Renders color options
	 * @param colorCoes - List of colors
	 */
	_renderColors(colorCodes) {
		const colorVariants = document.querySelector(".color-variants");
		const colorElements = colorCodes.map(
			(color, i) => `
            <div class="color-index cursor-pointer" style="border: ${
				i === this.currentColor[0] ? `1px solid ${color}` : "none"
			}">
                <div class="product-color" data-index=${i} style="background-color: ${color}"></div>
            </div>
        `
		);
		colorVariants.innerHTML = colorElements.join(" ");
	}

	/**
	 * Changes and displays size options
	 * @param sizeValues - List of size values
	 */
	updateSizes(sizeValues) {
		this.currentSize = [0, sizeValues[0]];
		const sizeVariants = document.querySelector(".size-variants");

		sizeVariants.addEventListener("click", (e) => {
			const index = e.target
				.closest(".size-index")
				.getAttribute("data-index");
			if (!index) return;
			this.currentSize = [+index, sizeValues[+index]];
			this._renderSizes(sizeValues);
		});

		this._renderSizes(sizeValues);
	}

	/**
	 * Renders size options
	 * @param sizeValues - List of size values
	 */
	_renderSizes(sizeValues) {
		const sizeVariants = document.querySelector(".size-variants");
		const sizeElements = sizeValues.map(
			(size, i) => `
            <div class="size-index cursor-pointer" data-index=${i} style="background-color: ${
				i === this.currentSize[0] ? "#edf0f8" : "#f3f3f3"
			}">
                <input type="radio" ${
					i === this.currentSize[0] ? "checked" : ""
				} />
                <div class="product-size">${size}</div>
            </div>
        `
		);
		sizeVariants.innerHTML = sizeElements.join(" ");
	}

	/**
	 * Adds quantity controls and displays the current quantity
	 */
	setupQuantityControls() {
		document
			.querySelector(".quantity-container")
			.addEventListener("click", (e) => {
				const index = parseInt(e.target.getAttribute("data-index"));
				if (isNaN(index)) return;
				this.currentQuantity = Math.max(
					1,
					this.currentQuantity + index
				);
				this._renderQuantity();
			});
		this._renderQuantity();
	}

	/**
	 * Renders the current quantity
	 */
	_renderQuantity() {
		document.querySelector(".selected-quantity").textContent =
			this.currentQuantity;
	}

	/**
	 * CTA for the add to cart button ( displays the notification )
	 */
	print() {
		document
			.querySelector(".add-to-cart")
			.addEventListener("click", (e) => {
				const notification = `Embrace side board with Color ${this.currentColor[1]} and size ${this.currentSize[1]} added to cart`;
				const notifyElement = document.querySelector(".notification");
				notifyElement.textContent = notification;
				notifyElement.style.backgroundColor = "#e7f8b7";
			});
	}

	/**
	 * Renders the product Description
	 */
	renderDescription(desc) {
		document.querySelector(".product-desc").innerHTML = desc;
	}
}

const product = new Product();
