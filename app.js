const container = document.querySelector("#contenedor");
const modalBody = document.querySelector(".modal .modal-body");

const containerShoppingCart = document.querySelector("#carritoContenedor");
const removeAllProductsCart = document.querySelector("#vaciarCarrito");

const keepBuy = document.querySelector("#procesarCompra");
const totalPrice = document.querySelector("#precioTotal");

const activeFunction = document.querySelector('#activarFuncion')

const fakeStoreApi = "https://fakestoreapi.com/products";

// Definir arreglos para guardar los productos y el carrito
let shoppingCart = [];
let productList = [];

// Agregar un manejador de eventos para el botón de filtrar
document.getElementById("filterButton").addEventListener("click", () => {
  const selectedCategory = document.getElementById("categorySelect").value;
  showProductsByCategory(selectedCategory);
});


// Selección del botón de ordenar
const sortButton = document.querySelector('#sortButton');
sortButton.addEventListener('click', sortProducts);

// Función para ordenar los productos
function sortProducts() {

  // Ordenar los productos por título en orden alfabético ascendente
  productList.sort((a, b) => a.title.localeCompare(b.title));

  // Mostrar los productos ordenados en el contenedor
  container.innerHTML = '';
  productList.forEach(addProductsContainer);
}


// Función para mostrar productos por categoría
const showProductsByCategory = (category) => {
  const filteredProducts = productList.filter((product) => {
    if (category === "") {
      return true; // Mostrar todos los productos si no se selecciona ninguna categoría
    }

    if (category === "ropaHombre") {
      return product.category === "men's clothing";
    }

    if (category === "ropaMujer") {
      return product.category === "women's clothing";
    }

    return product.category === category;
  });

  container.innerHTML = ""; // Limpiar el contenido actual
  filteredProducts.forEach(addProductsContainer);
};

// Solicitar y agregar productos al contenedor
const fetchProducts = async () => {
  try {
    const response = await fetch(fakeStoreApi);
    if (!response.ok) {
      throw new Error("No se pudo conectar");
    }

    return await response.json();
  } catch (error) {
    console.log(error.message);
  }
};

const addProductsContainer = (product) => {
  const { id, title, image, price, description } = product;
  container.innerHTML += `
    <div class="card mt-3" style="width: 18rem;">
      <img class="card-img-top mt-2" src="${image}" alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text" style="font-weight: bold">$ ${price}</p>
        <p class="card-text">• ${description}</p>
        <button class="btn btn-primary" onclick="addProduct(${id})">Comprar producto</button>
      </div>
    </div>
  `;
};

const getProducts = async () => {
  const products = await fetchProducts();
  console.table(products);
  products.forEach(addProductsContainer);

  productList = products;
};

// Agregar productos al carrito
const addProduct = (id) => {
  const testProductId = shoppingCart.some((item) => item.id === id);

  if (testProductId) {
    Swal.fire({
      title: "Este producto ya fue seleccionado",
      text: "Por favor seleccione otro",
      icon: "success",
    });
    return;
  }

  shoppingCart.push({
    ...productList.find((item) => item.id === id),
    quantity: 1,
  });

  showShoppingCart();
};

// Mostrar carrito de compras
const showShoppingCart = () => {
  modalBody.innerHTML = "";

  shoppingCart.forEach((product) => {
    const { title, image, price, id } = product;

    modalBody.innerHTML += `
      <div class="modal-contenedor">
        <div>
          <img class="img-fluid img-carrito" src="${image}"/>
        </div>
        <div>
          <p style="font-weight: bold">${title}</p>
          <p style="font-weight: bold">Precio: R$ ${price}</p>
          <div>
            <button onclick="removeProducts(${id})" class="btn btn-danger">Eliminar producto</button>
          </div>
        </div>
      </div>
    `;
  });

  totalPriceInCart(totalPrice);
  messageEmptyShoppingCart();
  containerShoppingCart.textContent = shoppingCart.length;
  setItemInLocalStorage();
};

// Quitar productos del carrito
const removeProducts = (id) => {
  const index = shoppingCart.findIndex((item) => item.id === id);

  if (index !== -1) {
    shoppingCart.splice(index, 1);
    showShoppingCart();
  }
};

// Vaciar carrito de compras
removeAllProductsCart.addEventListener("click", () => {
  shoppingCart.length = [];
  showShoppingCart();
});

// Mensaje de carrito vacío
const messageEmptyShoppingCart = () => {
  if (shoppingCart.length === 0) {
    modalBody.innerHTML = `
      <p class="text-center text-primary parrafo">No hay nada en el carrito!</p>
    `;
  }
};

// Continuar comprando
keepBuy.addEventListener("click", () => {
  if (shoppingCart.length === 0) {
    Swal.fire({
      title: "Su carrito está vacío",
      text: "Compre algo para continuar",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } else {
    location.href = "index.html";
    finalOrder();
  }
});

// Precio total en el carrito
const totalPriceInCart = (totalPriceCart) => {
  totalPriceCart.innerText = shoppingCart.reduce((acc, prod) => {
    return acc + prod.price;
  }, 0);
};

// Almacenamiento local
const setItemInLocalStorage = () => {
  localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
};

const addItemInLocalStorage = () => {
  shoppingCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
  setItemInLocalStorage();
  showShoppingCart();
};

document.addEventListener("DOMContentLoaded", addItemInLocalStorage);
getProducts();


const agregarProductoButton = document.querySelector("#agregarProductoButton");
agregarProductoButton.addEventListener("click", mostrarVentanaAgregarProducto);


function mostrarVentanaAgregarProducto() {
  Swal.fire({
    title: 'Agregar Nuevo Producto',
    html:
      '<input id="tituloProducto" class="swal2-input" placeholder="Título del producto">' +
      '<input id="imagenProducto" class="swal2-input" placeholder="URL de la imagen">' +
      '<input id="precioProducto" class="swal2-input" placeholder="Precio">' +
      '<textarea id="descripcionProducto" class="swal2-input" placeholder="Descripción"></textarea>',
    showCancelButton: true,
    confirmButtonText: 'Agregar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const titulo = document.getElementById('tituloProducto').value;
      const imagen = document.getElementById('imagenProducto').value;
      const precio = document.getElementById('precioProducto').value;
      const descripcion = document.getElementById('descripcionProducto').value;

      const nuevoProducto = {
        id: generarNuevoId(),
        title: titulo,
        image: imagen,
        price: precio,
        description: descripcion
      };

      // Agregar el nuevo producto a la lista de productos
      productList.push(nuevoProducto);

      // Mostrar los productos actualizados en el contenedor
      container.innerHTML = '';
      productList.forEach(addProductsContainer);

      // Mostrar mensaje de éxito
      Swal.fire('Producto agregado', 'El producto se ha agregado correctamente', 'success');
    }
  });
}

//eliminar un producto

const productId = 6; // ID del producto a eliminar
const deleteUrl = `https://fakestoreapi.com/products/${productId}`;

fetch(deleteUrl, {
  method: 'DELETE',
})
  .then((res) => res.json())
  .then((json) => {
    console.log(json);
    // Realizar acciones adicionales después de eliminar el producto, si es necesario
  });