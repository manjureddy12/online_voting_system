/**
 * Admin Module
 * Handles admin operations for election management
 */

const API_URL = "http://localhost:5000/api";

let currentView = "dashboard";

// Check if user is admin
const checkAdminAccess = () => {
  const user = window.authModule.getUser();
  if (!user || !user.isAdmin) {
    alert("Access denied. Admin privileges required.");
    window.location.href = "login.html";
    return false;
  }
  return true;
};

// Fetch statistics
const fetchStatistics = async () => {
  try {
    const token = window.authModule.getToken();

    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch statistics");
    }

    displayStatistics(data.data);
  } catch (error) {
    showMessage("Failed to load statistics: " + error.message, "error");
  }
};

// Display statistics
const displayStatistics = (data) => {
  const container = document.getElementById("statsContent");

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.overview.totalUsers}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.totalVotes}</div>
        <div class="stat-label">Votes Cast</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.totalCandidates}</div>
        <div class="stat-label">Candidates</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.votingPercentage}%</div>
        <div class="stat-label">Turnout</div>
      </div>
    </div>

    <div class="card mt-3">
      <h3 class="mb-2">Candidates by Position</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Total Votes</th>
              <th>Candidates</th>
            </tr>
          </thead>
          <tbody>
            ${data.candidatesByPosition
              .map(
                (pos) => `
              <tr>
                <td>${pos._id}</td>
                <td>${pos.totalVotes}</td>
                <td>${pos.candidates.length}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card mt-3">
      <h3 class="mb-2">Department Statistics</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Students</th>
              <th>Voted</th>
              <th>Turnout</th>
            </tr>
          </thead>
          <tbody>
            ${data.departmentStats
              .map(
                (dept) => `
              <tr>
                <td>${dept._id}</td>
                <td>${dept.totalStudents}</td>
                <td>${dept.votedStudents}</td>
                <td>${dept.votingPercentage.toFixed(2)}%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

// Fetch candidates
const fetchCandidates = async () => {
  try {
    const token = window.authModule.getToken();

    const response = await fetch(`${API_URL}/admin/candidates`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch candidates");
    }

    displayCandidatesTable(data.data.candidates);
  } catch (error) {
    showMessage("Failed to load candidates: " + error.message, "error");
  }
};

// Display candidates table
const displayCandidatesTable = (candidates) => {
  const container = document.getElementById("candidatesContent");

  container.innerHTML = `
    <button class="btn btn-primary mb-2" onclick="window.adminModule.showAddCandidateForm()">
      + Add New Candidate
    </button>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Department</th>
            <th>Year</th>
            <th>Votes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${candidates
            .map(
              (candidate) => `
            <tr>
              <td>${candidate.name}</td>
              <td>${candidate.position}</td>
              <td>${candidate.department}</td>
              <td>${candidate.year}</td>
              <td>${candidate.voteCount}</td>
              <td>
                <span class="badge ${
                  candidate.isActive ? "badge-success" : "badge-danger"
                }">
                  ${candidate.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <button class="btn btn-danger" onclick="window.adminModule.deleteCandidate('${
                  candidate._id
                }', '${candidate.name}')">
                  Delete
                </button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

// Show add candidate form
const showAddCandidateForm = () => {
  const container = document.getElementById("candidatesContent");

  container.innerHTML = `
    <div class="card">
      <h3 class="mb-2">Add New Candidate</h3>
      <form id="addCandidateForm">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" id="candidateName" class="form-input" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Position</label>
          <select id="candidatePosition" class="form-select" required>
            <option value="">Select Position</option>
            <option value="President">President</option>
            <option value="Vice President">Vice President</option>
            <option value="Secretary">Secretary</option>
            <option value="Treasurer">Treasurer</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Department</label>
          <input type="text" id="candidateDepartment" class="form-input" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Year</label>
          <input type="number" id="candidateYear" class="form-input" min="1" max="4" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Manifesto</label>
          <textarea id="candidateManifesto" class="form-textarea" required maxlength="500"></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Photo URL (optional)</label>
          <input type="url" id="candidatePhoto" class="form-input">
        </div>
        
        <div id="addCandidateMessage" class="hidden"></div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="submit" class="btn btn-success" id="submitCandidateBtn">Add Candidate</button>
          <button type="button" class="btn btn-secondary" onclick="window.adminModule.showView('candidates')">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document
    .getElementById("addCandidateForm")
    .addEventListener("submit", addCandidate);
};

// Add candidate
const addCandidate = async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submitCandidateBtn");
  const originalText = submitBtn.textContent;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Adding...";

    const token = window.authModule.getToken();

    const candidateData = {
      name: document.getElementById("candidateName").value.trim(),
      position: document.getElementById("candidatePosition").value,
      department: document.getElementById("candidateDepartment").value.trim(),
      year: parseInt(document.getElementById("candidateYear").value),
      manifesto: document.getElementById("candidateManifesto").value.trim(),
      photoUrl:
        document.getElementById("candidatePhoto").value.trim() ||
        "https://via.placeholder.com/150",
    };

    const response = await fetch(`${API_URL}/admin/candidates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(candidateData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add candidate");
    }

    showMessage("Candidate added successfully!", "success");
    setTimeout(() => showView("candidates"), 1500);
  } catch (error) {
    const messageDiv = document.getElementById("addCandidateMessage");
    messageDiv.textContent = error.message;
    messageDiv.className = "alert alert-error";
    messageDiv.classList.remove("hidden");

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

// Delete candidate
const deleteCandidate = async (candidateId, candidateName) => {
  if (
    !confirm(
      `Are you sure you want to delete ${candidateName}? This will deactivate the candidate.`
    )
  ) {
    return;
  }

  try {
    const token = window.authModule.getToken();

    const response = await fetch(`${API_URL}/admin/candidates/${candidateId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete candidate");
    }

    showMessage("Candidate deleted successfully!", "success");
    fetchCandidates();
  } catch (error) {
    showMessage("Failed to delete candidate: " + error.message, "error");
  }
};

// Reset election
const resetElection = async () => {
  const confirmation = prompt(
    'This will delete ALL votes and reset the election. Type "RESET" to confirm:'
  );

  if (confirmation !== "RESET") {
    return;
  }

  try {
    const token = window.authModule.getToken();

    const response = await fetch(`${API_URL}/admin/reset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reset election");
    }

    alert("Election reset successfully!");
    showView("dashboard");
  } catch (error) {
    showMessage("Failed to reset election: " + error.message, "error");
  }
};

// Show view
const showView = (view) => {
  currentView = view;

  // Update navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  document.getElementById(`nav-${view}`).classList.add("active");

  // Hide all content
  document.querySelectorAll(".admin-content").forEach((content) => {
    content.classList.add("hidden");
  });

  // Show selected content
  document.getElementById(`${view}Content`).classList.remove("hidden");

  // Load data based on view
  switch (view) {
    case "dashboard":
      fetchStatistics();
      break;
    case "candidates":
      fetchCandidates();
      break;
  }
};

// Show message
const showMessage = (message, type = "info") => {
  const messageDiv = document.getElementById("adminMessage");
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 3000);
  }
};

// Initialize admin page
const initializeAdminPage = async () => {
  if (!window.authModule.protectRoute()) return;
  if (!checkAdminAccess()) return;

  window.authModule.initializeHeader();
  showView("dashboard");
};

// Export functions
window.adminModule = {
  initializeAdminPage,
  showView,
  showAddCandidateForm,
  deleteCandidate,
  resetElection,
};
