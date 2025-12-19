/**
 * Authentication Module
 * Handles user login and registration
 */

const API_URL = "http://localhost:5000/api";

// Utility function to get token from localStorage
const getToken = () => localStorage.getItem("token");

// Utility function to get user from localStorage
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Utility function to save auth data
const saveAuthData = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// Utility function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

// Redirect if already authenticated
const redirectIfAuthenticated = () => {
  if (isAuthenticated()) {
    const user = getUser();
    if (user.isAdmin) {
      window.location.href = "admin.html";
    } else if (user.hasVoted) {
      window.location.href = "results.html";
    } else {
      window.location.href = "vote.html";
    }
  }
};

// Show message
const showMessage = (elementId, message, type = "error") => {
  const messageDiv = document.getElementById(elementId);
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove("hidden");
  }
};

// Hide message
const hideMessage = (elementId) => {
  const messageDiv = document.getElementById(elementId);
  if (messageDiv) {
    messageDiv.classList.add("hidden");
  }
};

// Handle registration
const handleRegister = async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("registerBtn");
  const originalBtnText = submitBtn.textContent;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";
    hideMessage("registerMessage");

    const formData = {
      studentId: document.getElementById("studentId").value.trim(),
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      department: document.getElementById("department").value.trim(),
      year: parseInt(document.getElementById("year").value),
    };

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Save auth data
    saveAuthData(data.data.token, data.data.user);

    // Show success message
    showMessage(
      "registerMessage",
      "Registration successful! Redirecting...",
      "success"
    );

    // Redirect to voting page
    setTimeout(() => {
      window.location.href = "vote.html";
    }, 1500);
  } catch (error) {
    showMessage("registerMessage", error.message, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
};

// Handle login
const handleLogin = async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("loginBtn");
  const originalBtnText = submitBtn.textContent;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    hideMessage("loginMessage");

    const formData = {
      studentId: document.getElementById("studentId").value.trim(),
      password: document.getElementById("password").value,
    };

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save auth data
    saveAuthData(data.data.token, data.data.user);

    // Show success message
    showMessage("loginMessage", "Login successful! Redirecting...", "success");

    // Redirect based on user role and vote status
    setTimeout(() => {
      if (data.data.user.isAdmin) {
        window.location.href = "admin.html";
      } else if (data.data.user.hasVoted) {
        window.location.href = "results.html";
      } else {
        window.location.href = "vote.html";
      }
    }, 1500);
  } catch (error) {
    showMessage("loginMessage", error.message, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
};

// Handle logout
const handleLogout = async () => {
  try {
    const token = getToken();

    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearAuthData();
    window.location.href = "login.html";
  }
};

// Protect route (require authentication)
const protectRoute = () => {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
};

// Initialize header with user info
const initializeHeader = () => {
  const user = getUser();
  if (user) {
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
};

// Export functions for use in HTML
window.authModule = {
  handleRegister,
  handleLogin,
  handleLogout,
  redirectIfAuthenticated,
  protectRoute,
  initializeHeader,
  getToken,
  getUser,
  isAuthenticated,
};
