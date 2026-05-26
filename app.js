// ============================================================
// app.js — Authentication, routing, and UI logic
// Depends on supabase.js being loaded first (see HTML files).
// ============================================================

// ── Helpers ──────────────────────────────────────────────────

/** Show an alert banner inside a form. */
function showAlert(containerId, message, type = "error") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.style.display = "block";
  // Auto-hide success alerts after 4 s
  if (type === "success") setTimeout(() => (el.style.display = "none"), 4000);
}

/** Hide an alert banner. */
function hideAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.style.display = "none";
}

/** Simple email validator. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Set a button to loading state and return a restore function. */
function setLoading(btn, loadingText = "Please wait…") {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>${loadingText}`;
  return () => {
    btn.disabled = false;
    btn.innerHTML = original;
  };
}

// ── Route guard: pages that require login ─────────────────────
// Call this at the top of dashboard.html and subjects.html.
async function requireAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    window.location.href = "./index.html";
  }
  return session;
}

// ── Route guard: pages that should redirect if already logged in ─
// Call this at the top of index.html / signup.html.
async function redirectIfLoggedIn() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    window.location.href = "./dashboard.html";
  }
}

// ── Logout ────────────────────────────────────────────────────
async function logout() {
  await _supabase.auth.signOut();
  window.location.href = "./index.html";
}

// ── Fetch the current user's profile from the profiles table ──
async function fetchProfile(userId) {
  const { data, error } = await _supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("fetchProfile error:", error.message);
    return null;
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// LOGIN FORM LOGIC (index.html)
// ─────────────────────────────────────────────────────────────
function initLoginPage() {
  redirectIfLoggedIn(); // kick logged-in users straight to dashboard

  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert("loginAlert");

    const email    = form.email.value.trim();
    const password = form.password.value;
    const btn      = form.querySelector("button[type='submit']");

    // Basic validation
    if (!email || !password) {
      showAlert("loginAlert", "Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("loginAlert", "Please enter a valid email address.");
      return;
    }

    const restore = setLoading(btn, "Signing in…");

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    restore();

    if (error) {
      // Provide friendly messages for common Supabase error codes
      const msg =
        error.message.includes("Invalid login")
          ? "Incorrect email or password. Please try again."
          : error.message.includes("Email not confirmed")
          ? "Please confirm your email address first. Check your inbox."
          : error.message;
      showAlert("loginAlert", msg);
      return;
    }

    // Success — redirect to dashboard
    window.location.href = "./dashboard.html";
  });
}

// ─────────────────────────────────────────────────────────────
// SIGN-UP FORM LOGIC (signup.html)
// ─────────────────────────────────────────────────────────────
function initSignupPage() {
  redirectIfLoggedIn();

  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert("signupAlert");

    // Gather field values
    const fullName   = form.full_name.value.trim();
    const studentId  = form.student_id.value.trim();
    const university = form.university.value.trim();
    const faculty    = form.faculty.value.trim();
    const email      = form.email.value.trim();
    const password   = form.password.value;
    const confirm    = form.confirm_password.value;
    const btn        = form.querySelector("button[type='submit']");

    // Validation
    if (!fullName || !studentId || !university || !faculty || !email || !password || !confirm) {
      showAlert("signupAlert", "Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("signupAlert", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      showAlert("signupAlert", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      showAlert("signupAlert", "Passwords do not match.");
      return;
    }

    const restore = setLoading(btn, "Creating account…");

    // 1. Create auth user via Supabase Auth
    const { data: authData, error: authError } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass profile data as metadata so it's accessible in the session
        data: { full_name: fullName }
      }
    });

    if (authError) {
      restore();
      showAlert("signupAlert", authError.message);
      return;
    }

    const userId = authData.user?.id;

    if (userId) {
      // 2. Insert profile record linked to the auth user
      const { error: profileError } = await _supabase.from("profiles").insert([
        {
          id:            userId,
          full_name:     fullName,
          student_id:    studentId,
          university:    university,
          faculty:       faculty,
          academic_year: "Third Year",
          email:         email,
          created_at:    new Date().toISOString()
        }
      ]);

      if (profileError) {
        console.error("Profile insert error:", profileError.message);
        // Auth user was created; profile failed — still show partial success
        restore();
        showAlert(
          "signupAlert",
          "Account created but profile could not be saved. Please contact support.",
          "error"
        );
        return;
      }
    }

    restore();

    // Show success message; Supabase may require email confirmation
    showAlert(
      "signupAlert",
      "✅ Account created! Please check your email to confirm your address, then log in.",
      "success"
    );

    // Clear the form
    form.reset();
  });
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD LOGIC (dashboard.html)
// ─────────────────────────────────────────────────────────────
async function initDashboardPage() {
  const session = await requireAuth();
  if (!session) return;

  const user    = session.user;
  const profile = await fetchProfile(user.id);

  // Welcome message
  const nameEl = document.getElementById("studentName");
  if (nameEl) {
    nameEl.textContent = profile?.full_name ?? user.email;
  }

  // Populate profile card details
  const fields = {
    profileEmail:    profile?.email      ?? "—",
    profileUniv:     profile?.university ?? "—",
    profileFaculty:  profile?.faculty    ?? "—",
    profileYear:     profile?.academic_year ?? "Third Year",
    profileStudentId:profile?.student_id ?? "—"
  };
  for (const [id, value] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Animate subject cards on load
  const cards = document.querySelectorAll(".subject-card");
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 60}ms`;
    card.classList.add("card-animate");
  });

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

// ─────────────────────────────────────────────────────────────
// SUBJECTS PAGE LOGIC (subjects.html)
// ─────────────────────────────────────────────────────────────
async function initSubjectsPage() {
  const session = await requireAuth();
  if (!session) return;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Animate subject rows
  const rows = document.querySelectorAll(".subject-row");
  rows.forEach((row, i) => {
    row.style.animationDelay = `${i * 70}ms`;
    row.classList.add("card-animate");
  });
}
