/**
 * Results Module
 * Displays real-time election results
 */

const API_URL = "http://localhost:5000/api";

let refreshInterval = null;

// Fetch results
const fetchResults = async () => {
  try {
    const token = window.authModule.getToken();

    const response = await fetch(`${API_URL}/votes/results`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch results");
    }

    displayResults(data.data.results, data.data.statistics);
    updateLastUpdated();
  } catch (error) {
    showMessage("Failed to load results: " + error.message, "error");
  }
};

// Display results
const displayResults = (resultsByPosition, statistics) => {
  // Display statistics
  displayStatistics(statistics);

  // Display results by position
  const container = document.getElementById("resultsContainer");
  container.innerHTML = "";

  const positions = ["President", "Vice President", "Secretary", "Treasurer"];

  positions.forEach((position) => {
    if (resultsByPosition[position] && resultsByPosition[position].length > 0) {
      const section = document.createElement("div");
      section.className = "position-section";
      section.innerHTML = `
        <h2 class="position-title">${position}</h2>
        <div class="candidates-grid" id="${position.replace(
          " ",
          "-"
        )}-results"></div>
      `;
      container.appendChild(section);

      const grid = document.getElementById(
        `${position.replace(" ", "-")}-results`
      );

      // Sort candidates by vote count
      const sortedCandidates = resultsByPosition[position].sort(
        (a, b) => b.voteCount - a.voteCount
      );

      sortedCandidates.forEach((candidate, index) => {
        const card = createResultCard(candidate, index);
        grid.appendChild(card);
      });
    }
  });
};

// Create result card
const createResultCard = (candidate, rank) => {
  const card = document.createElement("div");
  card.className = "candidate-card";

  const rankBadge =
    rank === 0 ? '<span style="color: gold; font-size: 1.5rem;">👑</span>' : "";

  card.innerHTML = `
    ${rankBadge}
    <img src="${candidate.photoUrl}" alt="${
    candidate.name
  }" class="candidate-photo">
    <h3 class="candidate-name">${candidate.name}</h3>
    <div class="candidate-info">
      ${candidate.department} • Year ${candidate.year}
    </div>
    <p class="candidate-manifesto">${candidate.manifesto}</p>
    <div class="vote-count">
      ${candidate.voteCount} ${candidate.voteCount === 1 ? "Vote" : "Votes"}
    </div>
  `;

  return card;
};

// Display statistics
const displayStatistics = (statistics) => {
  const statsContainer = document.getElementById("statisticsContainer");

  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${statistics.totalVotes}</div>
          <div class="stat-label">Total Votes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${statistics.totalUsers}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${statistics.votingPercentage}%</div>
          <div class="stat-label">Turnout</div>
        </div>
      </div>
    `;
  }
};

// Update last updated timestamp
const updateLastUpdated = () => {
  const lastUpdatedElement = document.getElementById("lastUpdated");
  if (lastUpdatedElement) {
    const now = new Date();
    lastUpdatedElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  }
};

// Enable auto-refresh
const enableAutoRefresh = () => {
  const refreshToggle = document.getElementById("autoRefresh");

  if (refreshToggle) {
    refreshToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        // Refresh every 10 seconds
        refreshInterval = setInterval(fetchResults, 10000);
        showMessage("Auto-refresh enabled (every 10 seconds)", "success");
      } else {
        if (refreshInterval) {
          clearInterval(refreshInterval);
          refreshInterval = null;
        }
        showMessage("Auto-refresh disabled", "info");
      }
    });
  }
};

// Manual refresh
const manualRefresh = async () => {
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "Refreshing...";
  }

  await fetchResults();

  if (refreshBtn) {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "Refresh Now";
  }
};

// Show message
const showMessage = (message, type = "info") => {
  const messageDiv = document.getElementById("resultsMessage");
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove("hidden");

    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 3000);
  }
};

// Initialize results page
const initializeResultsPage = async () => {
  if (!window.authModule.protectRoute()) return;

  window.authModule.initializeHeader();

  // Show voting confirmation if user just voted
  const user = window.authModule.getUser();
  if (user && user.hasVoted) {
    showMessage(
      "Thank you for voting! Here are the current results.",
      "success"
    );
  }

  await fetchResults();
  enableAutoRefresh();

  // Add refresh button listener
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", manualRefresh);
  }

  // Add navigation to vote page if user hasn't voted
  const voteBtn = document.getElementById("goToVoteBtn");
  if (voteBtn && !user.hasVoted) {
    voteBtn.classList.remove("hidden");
    voteBtn.addEventListener("click", () => {
      window.location.href = "vote.html";
    });
  }
};

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Export functions
window.resultsModule = {
  initializeResultsPage,
  manualRefresh,
};
