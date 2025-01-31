window.updateAvatar = async function () {
  const avatarUrl = document.getElementById("avatarUrl").value.trim();
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    alert("You must be logged in to update your avatar.");
    return;
  }

  if (!avatarUrl) {
    alert("Please enter a valid avatar URL.");
    return;
  }

  try {
    const response = await fetch("https://v2.api.noroff.dev/user/avatar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ avatar: avatarUrl }),
    });

    const data = await response.json();
    console.log("Avatar update response:", data);

    if (response.ok) {
      alert("Avatar updated successfully!");
      // Optionally update UI with new avatar
    } else {
      console.error("Avatar update error:", data.errors);
      alert(
        `Avatar update failed: ${data.errors?.[0]?.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred. Please try again later.");
  }
};
