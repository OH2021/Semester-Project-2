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
 * When login is successful, this function automatically creates an API key.
 */
window.loginUser = async function (event) {
  // Prevent form submission that causes page refresh
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

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

    console.log("Response Status Code:", response.status);
    const data = await response.json();
    console.log("Login successful, data:", data);

    if (response.ok) {
      // Prefer any provided accessToken over token
      const accessToken =
        data.data.accessToken !== undefined
          ? data.data.accessToken
          : data.data.token;
      if (!accessToken) {
        alert("Login failed: No token returned");
        return;
      }
      // Store the token under "accessToken" (and also as "token" for compatibility)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", accessToken);

      // Store profile details:
      if (data.data.profile && data.data.profile.name) {
        localStorage.setItem("userName", data.data.profile.name);
        localStorage.setItem("profile", JSON.stringify(data.data.profile));
      } else if (data.data.name) {
        localStorage.setItem("userName", data.data.name);
      } else {
        localStorage.setItem("userName", "Guest");
      }

      alert("Login successful!");

      // Automatically create an API key after login
      await window.createApiKey();

      location.reload(); // Reload to reflect the logged-in state
    } else {
      alert(`Login failed: ${data.errors?.[0]?.message || "Unknown error"}`);
      console.error("Login failed. Full response:", data);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred. Please try again later.");
  }
};

/**
 * Fetch and display user's credit.
 */
window.fetchCredit = async function () {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view your credit.");
    return;
  }

  // Use the auction profile name from localStorage
  const profileName = localStorage.getItem("userName");
  if (!profileName) {
    alert("Profile name not found. Please log in again.");
    return;
  }

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${profileName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      const creditContainer = document.getElementById("creditContainer");
      creditContainer.textContent = `Your total credit: ${
        data.data?.credit || "0"
      }`;
    } else {
      console.error(
        "Error fetching profile data:",
        data.errors || "Unknown error"
      );
      alert(
        `Failed to fetch profile data: ${
          data.errors?.[0]?.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred while fetching your credit.");
  }
};

/**
 * Log out a user.
 */
window.logoutUser = function () {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  alert("You have been logged out.");
  location.reload();
};

/**
 * Create an API key using the /auth/create-api-key endpoint.
 * This function is called automatically after a successful login.
 *
 * Documentation:
 * POST /auth/create-api-key
 * Optional Request Body: { "name": "My API Key name" }
 * Successful Response (201 Created):
 * {
 *   "data": {
 *     "name": "My API Key name",
 *     "status": "ACTIVE",
 *     "key": "be4ab55c-d5b0-44c3-8a11-67a7dafddd10"
 *   },
 *   "meta": {}
 * }
 *
 * When using the API key, include it in requests as:
 * {
 *   headers: {
 *     Authorization: `Bearer ${accessToken}`,
 *     "X-Noroff-API-Key": <the_api_key>
 *   }
 * }
 */
window.createApiKey = async function () {
  // Retrieve the token stored under "accessToken"
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to create an API key.");
    return;
  }

  try {
    const response = await fetch(
      "https://v2.api.noroff.dev/auth/create-api-key",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Send an empty JSON object if no additional parameters are required
        body: JSON.stringify({}), // or JSON.stringify({ name: "My API Key name" })
      }
    );

    const data = await response.json();
    console.log("Full API key creation response:", data);
    console.log("Response keys:", Object.keys(data));
    if (data.data && typeof data.data === "object") {
      console.log("data.data keys:", Object.keys(data.data));
    }

    if (response.ok && response.status === 201) {
      // According to documentation, the API key should be in data.data.key
      const apiKey = data.data && data.data.key;
      if (apiKey) {
        // Store the API key without showing an alert
        localStorage.setItem("apiKey", apiKey);
        console.log("API Key created and stored.");
      } else {
        alert(
          "API Key creation succeeded but the API key was not found in the response."
        );
      }
    } else {
      alert(
        `Failed to create API key: ${
          data.errors?.[0]?.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Network error while creating API key:", error);
    alert("An error occurred while creating the API key.");
  }
};
