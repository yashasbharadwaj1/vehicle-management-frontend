
$(document).ready(function() {
    $('#registerBtn').click(function() {
        $('#loginForm').hide();
        $('#registerForm').show();
    });

    $('#loginBtn').click(function() {
        $('#registerForm').hide();
        $('#loginForm').show();
    });

    $('#registerForm').submit(function(event) {
        event.preventDefault();
        var formData = {
            username: $('#username').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            password2: $('#password2').val(),
            type_of_user: $('#typeOfUser').val()
        };
    
        // Check if the password meets the minimum length requirement
        if (formData.password.length < 8) {
            alert('Password must contain at least 8 characters');
            return;
        }
    
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8000/api/user/register/',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                console.log('Registration successful', response);
                $('#registerForm').hide();
                $('#loginForm').show();
            },
            error: function(xhr, status, error) {
                console.error('Error registering user', error);
                alert('Error registering user: ' + error);
    
                // Display the error message returned by the backend
                var errorMessage = xhr.responseJSON;
                alert('Error registering user: ' + errorMessage);
            }
        });
    });

    $('#loginForm').submit(function(event) {
        event.preventDefault();
        var formData = {
            email: $('#loginEmail').val(),
            password: $('#loginPassword').val()
        };
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8000/api/user/login/',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                console.log('Login successful', response);
    
                // Store the tokens in local storage
                localStorage.setItem('accessToken', response.access);
                localStorage.setItem('refreshToken', response.refresh);
    
                // Decode the access token to get the user type
                var decodedAccessToken = atob(response.access.split('.')[1]);
                var userType = JSON.parse(decodedAccessToken).type_of_user;
    
                // Redirect based on the user type
                switch(userType) {
                    case 'customer':
                        window.location.href = 'customer.html';
                        break;
                    case 'vendor':
                        window.location.href = 'vendor.html';
                        break;
                    case 'qa_agent':
                        window.location.href = 'qa_agent.html';
                        break;
                    case 'checkout_agent':
                        window.location.href = 'checkout_agent.html';
                        break;
                    default:
                        alert('Invalid user type');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error logging in', error);
                alert('Error logging in: ' + error);

            }
        });
    });
    
});
