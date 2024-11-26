// Replace these with your own Google Sheets API credentials
const SCRIPT_ID = 'YOUR_SCRIPT_ID';
const API_KEY = 'YOUR_API_KEY';

// Get the form element
const form = document.querySelector('#contact-form');

// Add an event listener to the form submit event
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission

  // Get the form data
  const name = form.querySelector('#name').value;
  const email = form.querySelector('#email').value;
  const message = form.querySelector('#message').value;

  try {
    // Send the form data to the Google Apps Script
    await sendToGoogleSheets(name, email, message);

    // Reset the form
    form.reset();
    showSuccessMessage('Message sent successfully!');
  } catch (error) {
    console.error('Error sending message:', error);
    showErrorMessage('There was an error sending your message. Please try again later.');
  }
});

async function sendToGoogleSheets(name, email, message) {
  const payload = {
    name,
    email,
    message
  };

  const response = await fetch(`https://script.google.com/macros/s/${SCRIPT_ID}/exec?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const result = await response.json();
  return result;
}

function showSuccessMessage(message) {
  const msgElement = document.getElementById('msg');
  msgElement.textContent = message;
  msgElement.style.color = '#28a745';
  msgElement.style.display = 'block';

  setTimeout(() => {
    msgElement.style.display = 'none';
  }, 5000); // Hide the message after 5 seconds
}

function showErrorMessage(message) {
  const msgElement = document.getElementById('msg');
  msgElement.textContent = message;
  msgElement.style.color = '#dc3545';
  msgElement.style.display = 'block';

  setTimeout(() => {
    msgElement.style.display = 'none';
  }, 5000); // Hide the message after 5 seconds
}