// avatar.js

window.updateAvatar = async function () {
  // Retrieve the new avatar URL from the input field.
  const avatarUrl = document.getElementById("avatarUrl").value.trim();

  // Get the token from localStorage (using accessToken or token)
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to update your avatar.");
    return;
  }

  if (!avatarUrl) {
    alert("Please enter a valid avatar URL.");
    return;
  }

  // Retrieve the API key from localStorage.
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    alert("No API key found. Please create one.");
    return;
  }

  // **Important:** Use the userName (which is set during login) for the endpoint.
  const profileName = localStorage.getItem("userName");
  if (!profileName) {
    alert("Profile name not found. Please log in again.");
    return;
  }

  try {
    // Send the PUT request with both the authorization token and the API key header.
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${profileName}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey, // Required header per documentation
        },
        body: JSON.stringify({
          avatar: {
            url: avatarUrl,
            alt: "User Avatar",
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Avatar update response:", data);

    if (response.ok) {
      alert("Avatar updated successfully!");
      const userAvatar = document.getElementById("userAvatar");
      if (userAvatar) {
        userAvatar.src = avatarUrl;
      }
    } else {
      console.error("Avatar update error:", data.errors || "Unknown error");
      alert(
        `Avatar update failed: ${data.errors?.[0]?.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred. Please try again later.");
  }
};
