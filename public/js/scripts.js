// const { logger } = require("sequelize/lib/utils/logger");
console.log("scripts.js loaded");
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");
  bindSignout();
  bindSerialNoTabEvent();
  bindSubmitButton();
  bindLoginForm();
});

// Handle signout
function bindSignout() {
  const signoutButton = document.getElementById("signoutButton");
  if (signoutButton) {
    signoutButton.addEventListener("click", () => {
      window.location.href = "/Login.html";
    });
  }
}

// Handle Tab key on Serial No
function bindSerialNoTabEvent() {
  const serialInput = document.getElementById("inputSerialNo");
  if (!serialInput) return;

  // serialInput.addEventListener("keydown", function (event) {
  //   if (event.key !== "Tab") return;

  //   event.preventDefault();
  //   const form = document.getElementById("myForm");
  //   if (!form) return;

  //   const formDataObject = getFormDataAsObject(form);
  //   // Collect all form fields you want to send
  //   const params = new URLSearchParams({
  //     serial_no: formDataObject.inputSerialNo,
  //     // Add more fields if needed, e.g.:
  //     // name: formDataObject.inputName,
  //     // gothram: formDataObject.inputGothiram,
  //     // etc.
  //   }).toString();

  //   disableFields(["inputGender", "inputGothiram", "dropdown", "inputage"]);

  //   fetch(`api/getSearchDetails?${params}`)
  //     .then((response) => response.json())
  //     .then((dataRes) => {
  //       if (!Array.isArray(dataRes) || !dataRes.length) {
  //         console.warn("Empty or invalid response:", dataRes);
  //         return;
  //       }
  //       console.log("Fetched data:", JSON.stringify(dataRes[0]));
  //       const { gender, gothram, nakshatraid } = dataRes[0];

  //       console.log("Auto-filled:", gender, gothram, nakshatraid);

  //       assignValues({
  //         inputGender: gender,
  //         inputGothiram: gothram,
  //         nakshatraid: nakshatraid,
  //       });
  //     })
  //     .catch((error) => console.error("Error fetching data:", error));
  // });

  serialInput.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const form = document.getElementById("myForm");
    if (!form) return;

    const formDataObject = getFormDataAsObject(form);
    const params = new URLSearchParams({
      serial_no: formDataObject.inputSerialNo,
    }).toString();

    disableFields(["inputGender", "inputGothiram", "nakshatraid", "inputage"]);

    fetch(`api/getSearchDetails?${params}`)
      .then((response) => response.json())
      .then((dataRes) => {
        if (!dataRes.success) {
          console.warn("Server responded with failure:", dataRes.message);
          alert(dataRes.message || "Failed to fetch profile");
          return;
        }

        if (!Array.isArray(dataRes.data) || dataRes.data.length === 0) {
          alert("No profile found for the entered Serial Number.");
          return;
        }

        const { gender, gothram, nakshatraid } = dataRes.data[0];

        console.log("Auto-filled:", gender, gothram, nakshatraid);

        assignValues({
          inputGender: gender,
          inputGothiram: gothram,
          nakshatraid: nakshatraid,
        });
        document.getElementById("nakshatraidHidden").value = nakshatraid;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Error fetching data. Please try again later.");
      });
  });

  document.getElementById("nakshatraid").addEventListener("change", (e) => {
    document.getElementById("nakshatraidHidden").value = e.target.value;
  });
}

// Submit button handler

function bindSubmitButton() {
  const submitButton = document.getElementById("submitButton");

  const form = document.getElementById("myForm");

  console.log("Binding submit button click");

  if (!submitButton || !form) return;

  submitButton.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Submit button clicked");
    const formDataObject = getFormDataAsObject(form);
    console.log("Form Data Object:", JSON.stringify(formDataObject, null, 2));

    if (!validateFormData(formDataObject)) return;

    fetch("/api/searchMatchingProfiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formDataObject), // send form data as JSON
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
          const errorMsg = contentType.includes("application/json")
            ? (await response.json()).message
            : await response.text();

          throw new Error(errorMsg || "Unknown error occurred");
        }

        return response.json();
      })
      .then((responseData) => {
        console.log("Response from API:", responseData);
        console.log("✅ Parsed API response:", responseData);
        console.log("✅ Type of responseData.data:", typeof responseData.data);
        console.log("✅ Is Array:", Array.isArray(responseData.data));
        console.log("✅ Length:", responseData.data?.length);

        const profiles = responseData.data?.data;

        if (
          !responseData.success ||
          !Array.isArray(profiles) ||
          profiles.length === 0
        ) {
          alert("No matching profiles found. Please refine your search.");
          return; // stay on search screen
        }

        // if (!responseData.success || responseData.data.length === 0) {
        //   alert("Response:\n" + JSON.stringify(responseData, null, 2));
        //   // alert("No matching profiles found.");
        //   return;
        // }

        // Success
        window.location.href = "/api/shortlistedprofiles";
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        alert(`Error: ${error.message}`);
      });
  });

  // submitButton.addEventListener("click", function (event) {
  //   event.preventDefault();

  //   const formDataObject = getFormDataAsObject(form);
  //   console.log("Form Data Object:", JSON.stringify(formDataObject, null, 2));

  //   if (!validateFormData(formDataObject)) return;

  //   const params = new URLSearchParams(formDataObject).toString();

  //   fetch(`/api/searchMatchingProfiles?${params}`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //   })
  //     .then(async (response) => {
  //       const contentType = response.headers.get("content-type") || "";

  //       if (!response.ok) {
  //         const errorMsg = contentType.includes("application/json")
  //           ? (await response.json()).message
  //           : await response.text();

  //         throw new Error(errorMsg || "Unknown error occurred");
  //       }

  //       return response.json();
  //     })
  //     .then((responseData) => {
  //       console.log("Response from API:", responseData);

  //       if (!responseData.success || responseData.data.length === 0) {

  //         alert("Response:\n" + JSON.stringify(responseData, null, 2));
  //         alert("No matching profiles fnd.");
  //         return;
  //       }
  //       // Success
  //       window.location.href = "/api/shortlistedprofiles";
  //     })
  //     .catch((error) => {
  //       console.error("Error submitting form:", error);
  //       alert(`Error: ${error.message}`);
  //     });
  // });
}

// function bindSubmitButton() {
//   const submitButton = document.getElementById("submitButton");
//   const form = document.getElementById("myForm");

//   if (!submitButton || !form) return;

//   submitButton.addEventListener("click", function (event) {
//     event.preventDefault();

//     const formDataObject = getFormDataAsObject(form);
//     console.log("Form Data Object:", JSON.stringify(formDataObject, null, 2));

//     if (!validateFormData(formDataObject)) return;

//     const params = new URLSearchParams(formDataObject).toString();

//     fetch(`/api/searchMatchingProfiles?${params}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     })
//       .then((response) => response.json())
//       .then((dataRes) => {
//         if (dataRes.success && Array.isArray(dataRes.data)) {
//           if (dataRes.data.length === 0) {
//             alert("No matching profiles found. Please refine your search.");
//           } else {
//             window.location.href = "/api/shortlistedprofiles";
//           }
//         } else {
//           alert("Something went wrong. Please try again later.");
//         }
//       })
//       .catch((error) => {
//         console.error("Error submitting form:", error);
//         alert("Server error occurred. Please try again.");
//       });
//   });
// }

// function bindSubmitButton() {
//   const submitButton = document.getElementById("submitButton");
//   const form = document.getElementById("myForm");

//   if (!submitButton || !form) return;

//   submitButton.addEventListener("click", function (event) {
//     event.preventDefault();

//     const formDataObject = getFormDataAsObject(form);
//     console.log("Form Data Object:", JSON.stringify(formDataObject, null, 2));

//     if (!validateFormData(formDataObject)) return;
//     // Convert formDataObject to query string
//     const params = new URLSearchParams(formDataObject).toString();

//     fetch(`/api/searchMatchingProfiles?${params}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     })
//       .then((response) => response.json())
//       .then(() => {
//         window.location.href = "/api/shortlistedprofiles";
//       })
//       .catch((error) => console.error("Error submitting form:", error));
//   });
// }

// Utility: Convert FormData to JS object
function getFormDataAsObject(form) {
  const formData = new FormData(form);
  const obj = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

// Utility: Disable multiple fields
function disableFields(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });
}

// Utility: Assign values to form inputs
function assignValues(fieldMap) {
  for (const id in fieldMap) {
    const el = document.getElementById(id);
    if (el) {
      el.value = fieldMap[id];
      console.log(`Assigned ${id} = ${fieldMap[id]}`);
    } else {
      console.warn(`Element with id ${id} not found`);
    }
  }
}

// Utility: Validate mandatory fields
function validateFormData(data) {
  if (!data.inputGender && !document.getElementById("inputGender").disabled) {
    alert("Gender field is required");
    return false;
  }
  if (
    !data.inputGothiram &&
    !document.getElementById("inputGothiram").disabled
  ) {
    alert("Gothram field is required");
    return false;
  }
  if (!data.nakshatraid && !document.getElementById("nakshatraid").disabled) {
    alert("Natchathiram field is required");
    return false;
  }
  return true;
}

// Login form binding
function bindLoginForm() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();

    if (!username || !password) {
      displayLoginError("Please enter your username and password.");
      return;
    }

    console.log("Attempting login with:", username, password);

    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (response) => {
        if (response.status === 503) {
          const data = await response.json();
          throw new Error(data.error || "Database is unavailable");
        }
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Invalid login credentials");
        }
      })
      .then(() => {
        window.location.href = "/Matrimony"; // Redirect on success
      })
      .catch((error) => {
        displayLoginError(error.message);
      });
  });
}

function displayLoginError(message) {
  const messageParagraph = document.getElementById("lblErrMsg");
  if (messageParagraph) {
    messageParagraph.textContent = message + " Please try again!";
  }
}
