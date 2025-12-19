/**
 * Voting Module
 * Handles candidate display and vote casting
 */

const API_URL = "http://localhost:5000/api";

// Store selected votes
let selectedVotes = {};
let candidates = {};

// Fetch candidates
const fetchCandidates = async () => {
  try {
    const token = window.authModule.getToken();

    const response = await fetch(`${API_URL}/votes/candidates`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch candidates");
    }

    candidates = data.data.candidates;
    displayCandidates(candidates);
  } catch (error) {
    showMessage("Failed to load candidates: " + error.message, "error");
  }
};

// Display candidates grouped by position
const displayCandidates = (candidatesByPosition) => {
  const container = document.getElementById("candidatesContainer");
  container.innerHTML = "";

  const positions = ["President", "Vice President", "Secretary", "Treasurer"];

  positions.forEach((position) => {
    if (
      candidatesByPosition[position] &&
      candidatesByPosition[position].length > 0
    ) {
      const section = document.createElement("div");
      section.className = "position-section";
      section.innerHTML = `
        <h2 class="position-title">${position}</h2>
        <div class="candidates-grid" id="${position.replace(
          " ",
          "-"
        )}-grid"></div>
      `;
      container.appendChild(section);

      const grid = document.getElementById(
        `${position.replace(" ", "-")}-grid`
      );
      candidatesByPosition[position].forEach((candidate) => {
        const card = createCandidateCard(candidate, position);
        grid.appendChild(card);
      });
    }
  });
};

// Create candidate card
const createCandidateCard = (candidate, position) => {
  const card = document.createElement("div");
  card.className = "candidate-card";
  card.dataset.candidateId = candidate._id;
  card.dataset.position = position;

  card.innerHTML = `
    <img src="${candidate.photoUrl}" alt="${candidate.name}" class="candidate-photo">
    <h3 class="candidate-name">${candidate.name}</h3>
    <div class="candidate-info">
      ${candidate.department} • Year ${candidate.year}
    </div>
    <p class="candidate-manifesto">${candidate.manifesto}</p>
  `;

  card.addEventListener("click", () =>
    selectCandidate(card, candidate._id, position)
  );

  return card;
};

// Select candidate
const selectCandidate = (cardElement, candidateId, position) => {
  // Remove selection from other candidates in same position
  const positionCards = document.querySelectorAll(
    `[data-position="${position}"]`
  );
  positionCards.forEach((card) => card.classList.remove("selected"));

  // Add selection to clicked card
  cardElement.classList.add("selected");

  // Store selection
  selectedVotes[position] = candidateId;

  // Update submit button state
  updateSubmitButton();
};

// Update submit button state
const updateSubmitButton = () => {
  const submitBtn = document.getElementById("submitVoteBtn");
  const selectedCount = Object.keys(selectedVotes).length;

  if (selectedCount > 0) {
    submitBtn.disabled = false;
    submitBtn.textContent = `Submit Vote (${selectedCount} selected)`;
  } else {
    submitBtn.disabled = true;
    submitBtn.textContent = "Select candidates to vote";
  }
};

// Submit vote
const submitVote = async () => {
  const submitBtn = document.getElementById("submitVoteBtn");
  const originalBtnText = submitBtn.textContent;

  if (Object.keys(selectedVotes).length === 0) {
    showMessage("Please select at least one candidate", "error");
    return;
  }

  // Confirm vote
  const confirmMessage = `You have selected ${
    Object.keys(selectedVotes).length
  } candidate(s). Once submitted, you cannot change your vote. Are you sure you want to continue?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const token = window.authModule.getToken();

    // Format votes for API
    const votes = Object.entries(selectedVotes).map(
      ([position, candidateId]) => ({
        position,
        candidateId,
      })
    );

    const response = await fetch(`${API_URL}/votes/cast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ votes }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit vote");
    }

    // Update user data in localStorage
    const user = window.authModule.getUser();
    user.hasVoted = true;
    localStorage.setItem("user", JSON.stringify(user));

    // Show success and redirect
    alert(
      "Vote submitted successfully! You will now be redirected to the results page."
    );
    window.location.href = "results.html";
  } catch (error) {
    showMessage("Failed to submit vote: " + error.message, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
};

// Check vote status
const checkVoteStatus = async () => {
  try {
    const token = window.authModule.getToken();

    const response = await fetch(`${API_URL}/votes/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.data.hasVoted) {
      // User has already voted, redirect to results
      window.location.href = "results.html";
    }
  } catch (error) {
    console.error("Error checking vote status:", error);
  }
};

// Show message
const showMessage = (message, type = "info") => {
  const messageDiv = document.getElementById("voteMessage");
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }
};

// Initialize voting page
const initializeVotingPage = async () => {
  if (!window.authModule.protectRoute()) return;

  window.authModule.initializeHeader();
  await checkVoteStatus();
  await fetchCandidates();

  const submitBtn = document.getElementById("submitVoteBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", submitVote);
  }
};

// Export functions
window.votingModule = {
  initializeVotingPage,
  submitVote,
};
