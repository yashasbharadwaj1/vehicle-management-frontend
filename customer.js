// Retrieve access token and refresh token from local storage
var accessToken = localStorage.getItem('accessToken');
var refreshToken = localStorage.getItem('refreshToken');

// Decode the access token to get user details
var decodedAccessToken = atob(accessToken.split('.')[1]);
var userDetails = JSON.parse(decodedAccessToken);

var user_id = userDetails.user_id 
var email = userDetails.email 

// Display username
document.getElementById('username').innerText = userDetails.username;

// Logout function
function logout() {
    fetch('http://127.0.0.1:8000/api/user/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({ refresh_token: refreshToken })
    })
    .then(response => {
        if (response.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'index.html';
        }
    })
    .catch(error => console.error('Error logging out:', error));
}

// Fetch vendors function
function fetchVendors() {
    fetch('http://127.0.0.1:8000/api/list/vendors/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    })
    .then(response => response.json())
    .then(data => {
        var vendorSelect = document.getElementById('vendorSelect');
        data.data.forEach(vendor => {
            var option = document.createElement('option');
            option.value = vendor.id;
            option.textContent = vendor.name;
            vendorSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching vendors:', error));
}


function chooseVendor() {
    document.getElementById('buyVehicleDiv').style.display = 'none';
    document.getElementById('vendorDiv').style.display = 'block';
    fetchVendors();
}


function submitVendorSelection(vendorId) {
    // Disable the dropdown and submit button
    var vendorSelect = document.getElementById('vendorSelect');
    var submitButton = document.getElementById('submitButton');

    
    // Send a GET request to the API endpoint
    fetch(`http://127.0.0.1:8000/api/list/vehicles/${vendorId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    })
    .then(response => response.json())
    .then(data => {
        // Create a table to display the vehicle information
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');
        table.appendChild(thead);
        table.appendChild(tbody);

        // Create table headers for the specified vehicle fields
        var headers = ['Vehicle ID', 'Name', 'Number', 'Price', 'Vendor Name', 'Vendor Details', 'Product Image', 'Book'];
        var tr = document.createElement('tr');
        headers.forEach(header => {
            var th = document.createElement('th');
            th.textContent = header;
            tr.appendChild(th);
        });
        thead.appendChild(tr);

        // Create table rows for each vehicle
        data.forEach(vehicle => {
            var tr = document.createElement('tr');
            tbody.appendChild(tr);

            // Create table cells for the specified vehicle fields
            var fields = ['id', 'name', 'number', 'price', 'vendor_name', 'vendor_details', 'product_image'];
            fields.forEach(field => {
                var td = document.createElement('td');
                if (field === 'product_image') {
                    var img = document.createElement('img');
                    img.src = vehicle[field];
                    img.alt = 'Product Image';
                    img.style.width = '100px'; // Set the width of the image
                    img.style.height = 'auto'; // Maintain aspect ratio
                    td.appendChild(img);
                } else {
                    td.textContent = vehicle[field];
                }
                tr.appendChild(td);
            });

            // Create a "Book" button for each vehicle
            var td = document.createElement('td');
            var button = document.createElement('button');
            button.textContent = 'Book';
            button.onclick = function() {
                // Implement your book logic here
                console.log('Book vehicle:', vehicle.id);
            };
            td.appendChild(button);
            tr.appendChild(td);
        });

        // Append the table to the document body
        document.body.appendChild(table);
        vendorSelect.style.display = 'none';
        submitButton.style.display = 'none';
    })
    .catch(error => console.error('Error fetching vehicles:', error));
}




// Fetch data when the page loads
//fetchVendors();
