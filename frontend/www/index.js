var wallet = null;

// Function to add an item
async function addItem(event) {
    event.preventDefault();
    
    auth = await checkAuth();

    if (!auth) {
        alert('You need to be logged in to add an item.');
        return;
    }

    const token = localStorage.getItem('token');
    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const itemImage = document.getElementById('itemImage').value;

    fetch('/api/item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: itemName,
            price: itemPrice,
            seller_address: wallet.address,
            photo_url: itemImage
        })
    })
    .then(response => {
        if (response.ok) {
            fetchItems();
            alert('Item added successfully!');
            document.getElementById('addItemForm').reset();
        } else {
            throw new Error('Error adding item');
        }
    })
    .catch(error => {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
    });
}

// Add event listener to the form
document.getElementById('addItemForm').addEventListener('submit', addItem);


// Check if user is authenticated
async function checkAuth() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('authButtons');
    if (token) {
        const username = JSON.parse(atob(token.split('.')[1])).username; // Decode payload
        const id = JSON.parse(atob(token.split('.')[1])).id; // Decode payload
        const password = localStorage.getItem('password');
        wallet = await generateWallet(password, id);
        authButtons.innerHTML = `
            <span class="mr-4">Hello, ${username}</span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</button>
        `;

        (async function() {
            try {
                const response = await fetch(`/payment-api/user/${wallet.address}/balance`);
                const data = await response.json();
                const balance = data.balance;

                profileInfo = document.getElementById('profileInfo');
                profileInfo.innerHTML = `
                    <h2 class="text-lg">Your balance: </h2>
                    ${balance}
                    <h2 class="text-lg">Your address: </h2>
                    ${wallet.address}
                `;
            } catch (error) {
                console.error('Error fetching balance:', error);
                // Handle the error
            }

        })();
    } else {
        authButtons.innerHTML = `
            <a href="/login" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Login</a>
            <a href="/register" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Register</a>
        `;
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Function to fetch items and fill itemsList
function fetchItems() {
    fetch('/api/items')
        .then(response => response.json())
        .then(items => {
            const itemsList = document.getElementById('itemsList');
            // Clear the list
            itemsList.innerHTML = '';
            items.forEach(item => {
                console.log(item);
                const itemElement = document.createElement('div');
                itemElement.innerHTML = `
                <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h3>${item.name}</h3>
                    <p class="pb-4">Seller: ${item.seller_address}</p>
                    <p class="pb-4">Price: €${item.price}</p>
                    <img src="${item.photo_url}" alt="${item.name}" width="200" height="200">
                    ${item.bought ? '<p class="text-green-500">Already bought</p>' : `<button onclick="buyItem(${item.id}, '${item.price}', '${item.seller_address}')" class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Buy</button>`}
                </div>
                `;
                itemsList.appendChild(itemElement);
            });
        })
        .catch(error => {
            console.error('Error fetching items:', error);
            alert('Failed to fetch items. Please try again.');
        });
}

async function buyItem(id, price, seller_address) {
    if (!await checkAuth()) {
        alert('You need to be logged in to buy an item.');
        return;
    }
    fetch(`/payment-api/transaction`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: seller_address,
            privateKey: wallet.privateKey,
            amount: price
        })
    })
    .then(response => response.json())
    .then(response => {
        if (response.success) {
            // fetch /api/buy and send transaction hash 
            fetch('/api/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    item_id: id,
                    price: price,
                    seller_address: seller_address,
                    transaction_hash: response.transactionHash
                })
            }).then(response => response.json())
            .then(response => {
                if (response.success) {
                    fetchItems();
                    alert(`Item ${id} bought!`);
                } else {
                    throw new Error('Error buying item');
                }
            });
        } else {
            throw new Error('Error buying item');
        }
    })
    .catch(error => {
        console.error('Error buying item:', error);
        alert('Failed to buy item. Please try again.');
    });
}

// Run checkAuth and fetchItems on page load
window.onload = function() {
    checkAuth();
    fetchItems();
};

