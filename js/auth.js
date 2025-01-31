// auth.js

/**
 * Register a new user.
 */
window.registerUser = async function () {
  const name = document.getElementById("registerName")?.value.trim();
  const email = document.getElementById("registerEmail")?.value.trim();
  const password = document.getElementById("registerPassword")?.value.trim();

  if (!name || !email || !password) {
    alert("All fields are required.");
    return;
  }

  if (!email.endsWith("@noroff.no") && !email.endsWith("@stud.noroff.no")) {
    alert("Please use a @noroff.no or @stud.noroff.no email.");
    return;
  }

  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    console.log("Registration response:", data);

    if (response.ok) {
      alert("Registration successful! You can now log in.");
      window.location.href = "/login.html"; // Redirect to login page
    } else {
      alert(
        `Registration failed: ${data.errors?.[0]?.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred. Please try again later.");
  }
};

/**
 * Log in a user.
 */
window.loginUser = async function () {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!email || !password) {
    alert("Both email and password are required.");
    return;
  }

  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (response.ok) {
      localStorage.setItem("authToken", data.data.accessToken);
      alert("Login successful!");
      window.location.href = "/dashboard.html"; // Redirect to dashboard
    } else {
      alert(
        `Login failed: ${
          data.errors?.[0]?.message || "Invalid email or password"
        }`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred. Please try again later.");
  }
};

/**
 * Log out a user.
 */
window.logoutUser = function () {
  localStorage.removeItem("authToken");
  alert("You have been logged out.");
  window.location.href = "/index.html"; // Redirect to homepage
};
