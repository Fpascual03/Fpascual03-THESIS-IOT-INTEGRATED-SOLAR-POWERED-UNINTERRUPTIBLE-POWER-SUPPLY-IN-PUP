// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJnBJDnb4F6yfRUAZecsX-GPiXmrO6K3o",
  authDomain: "working-ba4f3.firebaseapp.com",
  databaseURL:
    "https://working-ba4f3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "working-ba4f3",
  storageBucket: "working-ba4f3.appspot.com",
  messagingSenderId: "170127063382",
  appId: "1:170127063382:web:d90e7415f30a11bb00bef7",
  measurementId: "G-TTHR04NDRL",
};

firebase.initializeApp(firebaseConfig);

const messagesRef = firebase.database().ref("messages");
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value;
  messageInput.value = ""; // Clear the input after sending

  const userEmail = localStorage.getItem("userEmail"); // Retrieve user email from localStorage

  const messageObject = {
    email: userEmail, // Include email in the message object
    text: message,
    timestamp: new Date().toISOString(),
  };

  messagesRef.push(messageObject);
}
// Listen for new messages
messagesRef.on("child_added", function (snapshot) {
  const messageData = snapshot.val();
  const messageElement = document.createElement("div");
  messageElement.textContent = messageData.email + ": " + messageData.text;
  document.getElementById("messages").appendChild(messageElement);
});
