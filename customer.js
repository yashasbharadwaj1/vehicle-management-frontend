// Retrieve access token and refresh token from local storage
var accessToken = localStorage.getItem("accessToken");
var refreshToken = localStorage.getItem("refreshToken");

// Decode the access token to get user details
var decodedAccessToken = atob(accessToken.split(".")[1]);
var userDetails = JSON.parse(decodedAccessToken);

var user_id = userDetails.user_id;
var email = userDetails.email;

// Display username
document.getElementById("username").innerText = userDetails.username;

// Logout function
function logout() {
  fetch("http://127.0.0.1:8000/api/user/logout/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then((response) => {
      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "index.html";
      }
    })
    .catch((error) => console.error("Error logging out:", error));
}

// Fetch vendors function
function fetchVendors() {
  fetch("http://127.0.0.1:8000/api/customer/list/vendors/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      var vendorSelect = document.getElementById("vendorSelect");
      data.data.forEach((vendor) => {
        var option = document.createElement("option");
        option.value = vendor.id;
        option.textContent = vendor.name;
        vendorSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching vendors:", error));
}

function chooseVendor() {
  document.getElementById("buyVehicleDiv").style.display = "none";
  document.getElementById("vendorDiv").style.display = "block";
  fetchVendors();
}

function submitVendorSelection(vendorId) {
  // Disable the dropdown and submit button
  var vendorSelect = document.getElementById("vendorSelect");
  var submitButton = document.getElementById("submitButton");

  // Send a GET request to the API endpoint
  fetch(`http://127.0.0.1:8000/api/customer/list/vehicles/${vendorId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.msg) {
        alert("Message: " + data.msg);
      } else {
        // Create a table to display the vehicle information
        var table = document.createElement("table");
        var thead = document.createElement("thead");
        var tbody = document.createElement("tbody");
        table.appendChild(thead);
        table.appendChild(tbody);

        // Create table headers for the specified vehicle fields
        var headers = [
          "Name",
          "Number",
          "Type",
          "Price",
          "Vendor Name",
          "Vendor Details",
          "Product Image",
          "Book",
        ];
        var tr = document.createElement("tr");
        headers.forEach((header) => {
          var th = document.createElement("th");
          th.textContent = header;
          tr.appendChild(th);
        });
        thead.appendChild(tr);

        // Create table rows for each vehicle
        data.forEach((vehicle) => {
          var tr = document.createElement("tr");
          tbody.appendChild(tr);

          // Create table cells for the specified vehicle fields
          var fields = [
            "name",
            "number",
            "type",
            "price",
            "vendor_name",
            "vendor_details",
            "product_image",
          ];
          fields.forEach((field) => {
            var td = document.createElement("td");
            if (field === "product_image") {
              var img = document.createElement("img");
              img.src = vehicle[field];
              img.alt = "Product Image";
              img.style.width = "100px"; // Set the width of the image
              img.style.height = "auto"; // Maintain aspect ratio
              td.appendChild(img);
            } else {
              td.textContent = vehicle[field];
            }
            tr.appendChild(td);
          });

          // Create a "Book" button for each vehicle
          var td = document.createElement("td");
          var button = document.createElement("button");
          button.textContent = "Book";
          button.onclick = function () {
            //console.log(vehicle.vendor, vehicle.id, user_id)
            bookVehicle(vehicle.vendor, vehicle.id, user_id, vehicle.type);
          };
          td.appendChild(button);
          tr.appendChild(td);
        });

        // Append the table to the document body
        document.body.appendChild(table);
        vendorSelect.style.display = "none";
        submitButton.style.display = "none";
      }
    })
    .catch((error) => console.error("Error fetching vehicles:", error));
}

function bookVehicle(vendorId, productId, userId, vehicle_type) {
  // Get the delivery date from the user
  var deliveryDate = prompt("Enter delivery date (YYYY-MM-DD):");
  if (!deliveryDate) {
    alert("Delivery date is required.");
    return;
  }

  // Validate the delivery date
  var currentDate = new Date();
  var maxDeliveryDate = new Date(
    currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
  ); // Maximum range is 30 days from the current date
  if (
    new Date(deliveryDate) < currentDate ||
    new Date(deliveryDate) > maxDeliveryDate
  ) {
    alert(
      "Please choose a date within the next 30 days. Note that you cannot expect delivery on the same day."
    );
    return;
  }

  // Format the dates
  var formattedDateOfBooking = currentDate.toISOString().split("T")[0]; // Get the 'YYYY-MM-DD' part
  var formattedDeliveryDate = new Date(deliveryDate)
    .toISOString()
    .split("T")[0]; // Get the 'YYYY-MM-DD' part

  // Send a POST request to the API endpoint
  fetch("http://127.0.0.1:8000/api/customer/create/order/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({
      vendor_id: vendorId,
      product_id: productId,
      user_id: userId,
      date_of_booking: formattedDateOfBooking, // Use the formatted date
      delivery_date: formattedDeliveryDate, // Use the formatted date
      type: vehicle_type,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Order sent:", data);
      if (data.msg) {
        alert("Message: " + data.msg);
      }
    })
    .catch((error) => {
      console.error("Error creating order:", error);
      alert("Error creating order:", error);
    });
}

function listBookings() {
  getMyBookings(user_id);
  document.getElementById("myBookingsButton").style.display = "none";
}

function getMyBookings(userId) {
  fetch(`http://127.0.0.1:8000/api/customer/list/orders/${userId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("My Bookings:", data);

      var ordersTable = document.createElement("table");
      var thead = document.createElement("thead");
      var tbody = document.createElement("tbody");

      var headers = [
        "Name",
        "Number",
        "Price",
        "Type",
        "Date of Booking",
        "Delivery Date",
        "Purchase Order",
        "Delivery Challan",
        "Vendor Name",
      ];
      var headerRow = document.createElement("tr");

      headers.forEach((headerText) => {
        var th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);

      data.forEach((order) => {
        var row = document.createElement("tr");
        row.innerHTML = `<td>${order.vehicle_data.name}</td>
                            <td>${order.vehicle_data.number}</td>
                            <td>${order.vehicle_data.price}</td>
                            <td>${order.vehicle_data.type}</td>
                             <td>${order.order_data.date_of_booking}</td>
                             <td>${order.order_data.delivery_date}</td>
                             <td>${order.order_data.purchase_order_number}</td>
                             <td>${order.order_data.delivery_challan_number}</td>
                             <td>${order.vendor_data.name}</td>
                             `;

        tbody.appendChild(row);
      });

      ordersTable.appendChild(thead);
      ordersTable.appendChild(tbody);

      var myBookingsDiv = document.getElementById("myBookingsDiv");
      myBookingsDiv.appendChild(ordersTable);
    })

    .catch((error) => {
      console.error("Error fetching bookings:", error);
      alert("Error fetching bookings:", error);
    });
}

function refreshPage() {
  window.location.reload();
}

function showCheckInForm() {
  
  var form = document.createElement("form");
  form.id = "checkInForm";

  var vehicleNumberLabel = document.createElement("label");
  vehicleNumberLabel.textContent = "Vehicle Number:";
  var vehicleNumberInput = document.createElement("input");
  vehicleNumberInput.type = "text";
  vehicleNumberInput.name = "vehicleNumber";
  vehicleNumberInput.required = true;

  var vehicleTypeLabel = document.createElement("label");
  vehicleTypeLabel.textContent = "Vehicle Type:";
  var vehicleTypeInput = document.createElement("input");
  vehicleTypeInput.type = "text";
  vehicleTypeInput.name = "vehicleType";
  vehicleTypeInput.required = true;

  var deliveryChallanLabel = document.createElement("label");
  deliveryChallanLabel.textContent = "Delivery Challan (D.C.) Number:";
  var deliveryChallanInput = document.createElement("input");
  deliveryChallanInput.type = "text";
  deliveryChallanInput.name = "deliveryChallan";
  deliveryChallanInput.required = true;

  var purchaseOrderLabel = document.createElement("label");
  purchaseOrderLabel.textContent = "Purchase Order (P.O.) Number:";
  var purchaseOrderInput = document.createElement("input");
  purchaseOrderInput.type = "text";
  purchaseOrderInput.name = "purchaseOrder";
  purchaseOrderInput.required = true;

  var submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.type = "submit";

  form.appendChild(vehicleNumberLabel);
  form.appendChild(vehicleNumberInput);
  form.appendChild(vehicleTypeLabel);
  form.appendChild(vehicleTypeInput);
  form.appendChild(deliveryChallanLabel);
  form.appendChild(deliveryChallanInput);
  form.appendChild(purchaseOrderLabel);
  form.appendChild(purchaseOrderInput);
  form.appendChild(submitButton);

  var checkInButtonDiv = document.getElementById("checkInButtonDiv");
  checkInButtonDiv.appendChild(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var formData = new FormData(form);
    var checkInData = {};
    for (var pair of formData.entries()) {
      checkInData[pair[0]] = pair[1];
    }
    sendCheckInData(checkInData); 
    document.getElementById("checkInButtonDiv").style.display = "none";
    
  });
}

function sendCheckInData(data) {
  fetch("http://127.0.0.1:8000/api/customer/checkin/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      
      if (data.msg){
        alert(data.msg)
      }
      else{
        console.log("Check-in data sent:", data);
        alert("Check-in data sent") 
        alert("Checkin Intiated. Next steps:- 1. Qa agent will be approve or diapprove the checkout  , 2.if Qa agent has approved then security agent will approve or disapprove the checkout , 3.if either Qa agent or security diapproves the checkout then the appropriate reasons will be conveyed to you and then things will be sorted for speedy checkout with mutual consent ")
      }
      
    })
    .catch((error) => {
      console.error("Error sending check-in data:", error);
      alert("Error sending check-in data:", error);
    });
}

// Fetch data when the page loads
//fetchVendors();
