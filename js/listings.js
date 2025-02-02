let allListings = []; // Global array to store listings for searching

// Fetch all listings
window.fetchListings = async function () {
  const authToken = localStorage.getItem("authToken");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (authToken) {
    headers.append("Authorization", `Bearer ${authToken}`);
  }
  try {
    const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "GET",
      headers: headers,
    });
    const data = await response.json();
    if (response.ok) {
      allListings = data.data; // Save fetched listings in the global array
      displayListings(allListings); // Display all listings
    } else {
      alert(
        `Failed to fetch listings: ${
          data.errors?.[0]?.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred while fetching listings.");
  }
};

// (Optional) Fetch only the listings created by the logged-in user
window.fetchMyListings = async function () {
  const token = localStorage.getItem("accessToken");
  const profileName = localStorage.getItem("userName");
  if (!token || !profileName) {
    alert("You must be logged in to view your listings.");
    return;
  }
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${token}`);
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${profileName}/listings`,
      { method: "GET", headers }
    );
    const data = await response.json();
    if (response.ok) {
      allListings = data.data;
      displayListings(allListings);
    } else {
      alert(
        `Failed to fetch your listings: ${
          data.errors?.[0]?.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred while fetching your listings.");
  }
};

// Display listings on the page
function displayListings(listings) {
  const container = document.getElementById("listingsContainer");
  container.innerHTML = "";
  if (!listings || listings.length === 0) {
    container.innerHTML = "<p>No listings found.</p>";
    return;
  }
  listings.forEach((listing) => {
    // Create the listing card container
    const listingElement = document.createElement("div");
    listingElement.classList.add("col-md-4", "listing-card");
    listingElement.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title listing-title">${listing.title}</h5>
          <p class="card-text listing-description">${listing.description}</p>
          <p class="card-text">
            <small class="text-muted">Deadline: ${new Date(
              listing.endsAt
            ).toLocaleDateString()}</small>
          </p>
          <button class="btn btn-primary view-details-btn" data-id="${
            listing.id
          }">View Details</button>
        </div>
      </div>
    `;
    // Create a hidden container for listing details
    const detailsContainer = document.createElement("div");
    detailsContainer.id = "details-" + listing.id;
    detailsContainer.classList.add("listing-details");
    detailsContainer.style.display = "none";
    listingElement.appendChild(detailsContainer);
    container.appendChild(listingElement);
    // Attach event listener to toggle details when clicking the button
    const viewDetailsBtn = listingElement.querySelector(".view-details-btn");
    viewDetailsBtn.addEventListener("click", async function () {
      if (detailsContainer.style.display === "none") {
        await fetchListingDetailsForElement(listing.id, detailsContainer);
        detailsContainer.style.display = "block";
        viewDetailsBtn.textContent = "Hide Details";
      } else {
        detailsContainer.style.display = "none";
        viewDetailsBtn.textContent = "View Details";
      }
    });
  });
}

// Search listings based on the search query
window.searchListings = function () {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredListings = allListings.filter((listing) => {
    const title = listing.title ? listing.title.toLowerCase() : "";
    const description = listing.description
      ? listing.description.toLowerCase()
      : "";
    return title.includes(searchTerm) || description.includes(searchTerm);
  });
  displayListings(filteredListings);
};

// Fetch listing details (including seller and bids) for a given element
async function fetchListingDetailsForElement(listingId, containerElement) {
  const authToken = localStorage.getItem("authToken");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (authToken) {
    headers.append("Authorization", `Bearer ${authToken}`);
  }
  try {
    // Include _seller and _bids query parameters for extra details
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/listings/${listingId}?_seller=true&_bids=true`,
      { headers }
    );
    const data = await response.json();
    if (response.ok) {
      containerElement.innerHTML = generateListingDetailsHTML(data.data);
    } else {
      containerElement.innerHTML = `<p>Failed to fetch details: ${
        data.errors?.[0]?.message || "Unknown error"
      }</p>`;
    }
  } catch (error) {
    console.error("Network error:", error);
    containerElement.innerHTML = `<p>An error occurred while fetching listing details.</p>`;
  }
}

// Generate HTML for listing details, including seller info, bids, and a bid input/button.
// The "Place Bid" button includes data attributes for listing id and seller's name.
function generateListingDetailsHTML(listing) {
  let sellerInfo = "";
  let sellerName = "";
  if (listing.seller) {
    sellerInfo = `<p>Seller: ${listing.seller.name}</p>`;
    sellerName = listing.seller.name;
  }
  let bidsHtml = "";
  if (listing.bids && listing.bids.length > 0) {
    bidsHtml += "<h3>Bids:</h3>";
    listing.bids.forEach((bid) => {
      bidsHtml += `<div>${bid.amount} by ${bid.bidder.name}</div>`;
    });
  } else {
    bidsHtml = "<p>No bids yet.</p>";
  }
  return ` 
    <h2>${listing.title}</h2>
    <p>${listing.description}</p>
    <p>Deadline: ${new Date(listing.endsAt).toLocaleDateString()}</p>
    ${sellerInfo}
    <div id="bidsContainer">${bidsHtml}</div>
    ${
      localStorage.getItem("authToken")
        ? `<input type="number" id="bidAmount-${listing.id}" placeholder="Enter bid amount" />
           <button class="btn btn-primary place-bid-btn" data-listingid="${listing.id}" data-seller="${sellerName}" onclick="placeBid('${listing.id}')">Place Bid</button>`
        : ""
    }
  `;
}

// Place a bid on a specific listing.
// Before placing a bid, check if the current user is bidding on their own listing.
window.placeBid = async function (listingId) {
  const token = localStorage.getItem("accessToken");
  const apiKey = localStorage.getItem("apiKey");
  if (!token || !apiKey) {
    alert("You must be logged in with a valid API key to place a bid.");
    return;
  }
  // Check if current user is the seller
  const currentUser = localStorage.getItem("userName");
  const bidButton = document.querySelector(
    `button.place-bid-btn[data-listingid="${listingId}"]`
  );
  const sellerName = bidButton ? bidButton.getAttribute("data-seller") : "";
  if (currentUser && sellerName && currentUser === sellerName) {
    alert("You cannot bid on your own listing.");
    return;
  }
  const bidInput = document.getElementById("bidAmount-" + listingId);
  if (!bidInput || !bidInput.value) {
    alert("Please enter a bid amount.");
    return;
  }
  const bidAmount = parseFloat(bidInput.value);
  if (isNaN(bidAmount) || bidAmount <= 0) {
    alert("Please enter a valid bid amount greater than 0.");
    return;
  }
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/listings/${listingId}/bids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
        body: JSON.stringify({ amount: bidAmount }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      alert("Bid placed successfully!");
      // Refresh the details view for the listing to show updated bids.
      const detailsContainer = document.getElementById("details-" + listingId);
      if (detailsContainer) {
        await fetchListingDetailsForElement(listingId, detailsContainer);
      }
    } else {
      alert(
        `Bid placement failed: ${data.errors?.[0]?.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Network error while placing bid:", error);
    alert("An error occurred while placing your bid.");
  }
};

// Only allow logged-in users to create listings
window.createListing = async function () {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to create a listing.");
    return;
  }
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    alert("API key not found. Please create one.");
    return;
  }
  const title = document.getElementById("listingTitle").value.trim();
  const deadline = document.getElementById("listingDeadline").value;
  const description = document
    .getElementById("listingDescription")
    .value.trim();
  const mediaFiles = document.getElementById("mediaFiles").files;
  if (!title || !deadline || !description) {
    alert("All fields are required.");
    return;
  }
  const deadlineDate = new Date(deadline);
  const now = new Date();
  if (deadlineDate <= now) {
    alert("The deadline must be a future date.");
    return;
  }
  let mediaUrls = [];
  if (mediaFiles.length > 0) {
    const formData = new FormData();
    for (let i = 0; i < mediaFiles.length; i++) {
      formData.append("media", mediaFiles[i]);
    }
    try {
      const uploadResponse = await fetch(
        "https://v2.api.noroff.dev/media/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
          body: formData,
        }
      );
      const uploadData = await uploadResponse.json();
      if (uploadResponse.ok) {
        mediaUrls.push(...uploadData.data.map((file) => file.url));
      } else {
        alert(
          `Failed to upload media: ${
            uploadData.errors?.[0]?.message || "Unknown error"
          }`
        );
        return;
      }
    } catch (error) {
      console.error("Media upload error:", error);
      alert("An error occurred while uploading media.");
      return;
    }
  }
  const requestBody = {
    title,
    description,
    endsAt: deadlineDate.toISOString(),
    media: mediaUrls,
    tags: [],
  };
  const reqHeaders = new Headers();
  reqHeaders.append("Content-Type", "application/json");
  reqHeaders.append("Authorization", `Bearer ${token}`);
  reqHeaders.append("X-Noroff-API-Key", apiKey);
  try {
    const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Listing created successfully!");
      document.getElementById("createListingForm").reset();
      // Add the newly created listing to the global array and update the display.
      allListings.push(data.data);
      displayListings(allListings);
    } else {
      alert(
        `Listing creation failed: ${
          data.errors?.[0]?.message || "Unknown error"
        }`
      );
      console.error("Listing creation failed:", data);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred while creating the listing.");
  }
};

document.addEventListener("DOMContentLoaded", fetchListings);
