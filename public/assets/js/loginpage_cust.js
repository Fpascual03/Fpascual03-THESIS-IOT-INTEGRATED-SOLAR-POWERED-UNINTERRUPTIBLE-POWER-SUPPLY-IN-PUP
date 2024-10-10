document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase
  // NOTE: Replace the following config object with your Firebase project's configuration.
  const firebaseConfig = {
    apiKey: "AIzaSyAJnBJDnb4F6yfRUAZecsX-GPiXmrO6K3o",
    authDomain: "working-ba4f3.firebaseapp.com",
    projectId: "working-ba4f3",
    storageBucket: "working-ba4f3.appspot.com",
    databaseURL:
      "https://working-ba4f3-default-rtdb.asia-southeast1.firebasedatabase.app/",
    messagingSenderId: "170127063382",
    appId: "1:170127063382:web:d90e7415f30a11bb00bef7",
    measurementId: "G-TTHR04NDRL",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Reference to the form element
  const database = firebase.database();
  // Login Form Submission
  document.getElementById("loginform").addEventListener("submit", (e) => {
    e.preventDefault();

    const loginEmail = document.getElementById("textInput").value;
    const loginPassword = document.getElementById("passwordInput").value;

    firebase
      .database()
      .ref("users")
      .orderByChild("email")
      .equalTo(loginEmail)
      .once("value", (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            if (userData.password === loginPassword) {
              alert("Login successful!");
              console.log("Login successful!");

              // Store user email in localStorage
              localStorage.setItem("userEmail", userData.email);

              // Optionally, redirect the user to another page after successful login.
              window.location.href = "./../home/home-cust.html";
            } else {
              alert("Invalid password!");
              console.error("Invalid password!");
            }
          });
        } else {
          alert("User does not exist!");
          console.error("User does not exist!");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
});
document.getElementById("textInput").addEventListener("focus", function () {
  document.getElementById("envelopeIcon").style.color = "lightblue";
});

document.getElementById("textInput").addEventListener("blur", function () {
  document.getElementById("envelopeIcon").style.color = "#000"; // Change back to initial color when focus is lost
});

const passwordInput = document.getElementById("passwordInput");
const eyeIcon = document.getElementById("eyeIcon");

eyeIcon.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("bx-show");
    eyeIcon.classList.add("bx-hide");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("bx-hide");
    eyeIcon.classList.add("bx-show");
  }
});

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      // Signed in successfully, access user information
      const user = result.user;
      console.log("User signed in:", user);
      // Redirect user to home page or desired location
      window.location.href = "home.html"; // Change URL to your home page
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Sign in error:", errorMessage);
    });
}
