
document.addEventListener('DOMContentLoaded', function() {

  const signoutButton = document.getElementById('signoutButton');
  signoutButton.addEventListener('click', function() {
    signout();
  });

  function signout() {

    // Here, you can clear the authentication token or session
    // For example, if you're using local storage for storing the token
    //localStorage.removeItem('token');
    // Redirect the user to the login page
    window.location.href = '/Login.html';
  }
});


document.getElementById("inputSerialNo").addEventListener("keydown", function(event) {
  if (event.key === "Tab") {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(document.getElementById("myForm")); // Get form data
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
       // Disable the textbox
    document.getElementById("inputGender").disabled = true;
    document.getElementById("inputGothiram").disabled = true;
    document.getElementById("dropdown").disabled = true;
    document.getElementById("inputage").disabled = true;
    fetch('/filldata', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(formDataObject)
  })
  .then(response => response.json())
  .then(dataRes => {
    let inputGender, inputGothiram, Natchathiram;
    dataRes.forEach(obj => {
      inputGender = obj.gender;
      inputGothiram = obj.gothram;
      Natchathiram = obj.nakshatram;
    });
    // Log the extracted values for debugging
    console.log("Extracted values:", inputGender, inputGothiram, Natchathiram);

    // Assign values to the client-side variables
    document.getElementById("inputGothiram").value = inputGothiram;
    document.getElementById("inputGender").value = inputGender;
    document.getElementById("dropdown").value = Natchathiram;

  })
  .catch(error => console.error('Error:', error));
  }
});


document.getElementById("submitButton").addEventListener("click", function(event) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(document.getElementById("myForm")); // Get form data
 // Validation

  // Convert form data to object
  const formDataObject = {};
  formData.forEach((value, key) => {
      formDataObject[key] = value;
  });
    // Validate form data
    if (!validateFormData(formDataObject)) {
      return; // Stop execution if validation fails
    }
  // Send input values to Node.js server
  fetch('/searchProfiles', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(formDataObject)
  })
  .then(response => response.json())
  .then(data => {
    window.location.href = '/shortlistedprofiles';
      // Handle API response as needed
  })
  .catch(error => console.error('Error:', error));
});
// Function to validate form data
function validateFormData(formData) {
  if (!formData.inputGender && !document.getElementById("inputGender").disabled) {
    alert('Gender fields are required'); // Display error message
    return false; // Return false if validation fails
  }
  else if(!formData.inputGothiram && !document.getElementById("inputGothiram").disabled){
    alert('Gothram fields are required'); // Display error message
    return false; // Return false if validation fails
  }
  else if(!formData.Natchathiram && !document.getElementById("dropdown").disabled){
    alert('Natchathiram fields are required'); // Display error message
    return false; // Return false if validation fails
  }
  return true; // Return true if validation passes
}


