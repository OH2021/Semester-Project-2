window.createListing = async function () {
  const title = document.getElementById("listingTitle").value.trim();
  const deadline = document.getElementById("listingDeadline").value;
  const description = document
    .getElementById("listingDescription")
    .value.trim();
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    alert("You must be logged in to create a listing.");
    return;
  }

  if (!title || !deadline || !description) {
    alert("All fields are required.");
    return;
  }

  try {
    const response = await fetch("https://v2.api.noroff.dev/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title, deadline, description }),
    });

    const data = await response.json();
    console.log("Listing creation response:", data);

    if (response.ok) {
      alert("Listing created successfully!");
      // Optionally refresh listing display
    } else {
      console.error("Listing creation error:", data.errors);
      alert(
        `Listing creation failed: ${
          data.errors?.[0]?.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred. Please try again later.");
  }
};

window.searchListings = async function () {
  const query = document.getElementById("searchQuery").value.trim();

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/listings?search=${query}`
    );
    const data = await response.json();
    console.log("Search response:", data);

    if (response.ok) {
      displayListings(data.data);
    } else {
      alert("Error fetching listings.");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred. Please try again later.");
  }
};

function displayListings(listings) {
  const container = document.getElementById("listingsContainer");
  container.innerHTML = "";

  listings.forEach((listing) => {
    const listingElement = document.createElement("div");
    listingElement.classList.add("col-md-4");
    listingElement.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${listing.title}</h5>
            <p class="card-text">${listing.description}</p>
            <p class="card-text"><small class="text-muted">Deadline: ${listing.deadline}</small></p>
          </div>
        </div>
      `;
    container.appendChild(listingElement);
  });
}
