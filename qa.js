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

function refreshPage() {
    window.location.reload();
}


