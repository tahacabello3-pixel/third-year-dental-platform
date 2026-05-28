// ============================================================
// app.js — Auth, routing, admin, content, quiz logic
// ============================================================

const ADMIN_EMAIL = 'tahacabello3@gmail.com';

// ── Helpers ──────────────────────────────────────────────────
function showAlert(id, msg, type) {
  type = type || 'error';
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert alert-' + type;
  el.style.display = 'block';
  if (type === 'success') setTimeout(function(){ el.style.display = 'none'; }, 4000);
}
function hideAlert(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function setLoading(btn, text) {
  var orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>' + text;
  return function(){ btn.disabled = false; btn.innerHTML = orig; };
}
function isAdmin(user) {
  return user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// ── Route guards ──────────────────────────────────────────────
async function requireAuth() {
  var r = await _supabase.auth.getSession();
  if (!r.data.session) { window.location.href = './index.html'; return null; }
  return r.data.session;
}
async function redirectIfLoggedIn() {
  var r = await _supabase.auth.getSession();
  if (r.data.session) window.location.href = './dashboard.html';
}

// ── Logout ────────────────────────────────────────────────────
async function logout() {
  await _supabase.auth.signOut();
  window.location.href = './index.html';
}

// ── Fetch profile ─────────────────────────────────────────────
async function fetchProfile(userId) {
  var r = await _supabase.from('profiles').select('*').eq('id', userId).single();
  return r.error ? null : r.data;
}

// ── Resolve identifier to email ───────────────────────────────
// Accepts email / student_id / phone → returns email string or null
async function resolveToEmail(identifier) {
  identifier = identifier.trim();
  if (!identifier) return null;

  // Already an email
  if (isValidEmail(identifier)) return identifier;

  // Search profiles by student_id or phone
  var r = await _supabase
    .from('profiles')
    .select('email')
    .or('student_id.eq.' + identifier + ',phone.eq.' + identifier)
    .limit(1);

  if (r.error || !r.data || r.data.length === 0) return null;
  return r.data[0].email;
}

// ── LOGIN ─────────────────────────────────────────────────────
function initLoginPage() {
  redirectIfLoggedIn();
  var form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideAlert('loginAlert');

    var identifier = (form.identifier || form.email).value.trim();
    var password   = form.password.value;
    var btn        = form.querySelector('button[type="submit"]');

    if (!identifier || !password) { showAlert('loginAlert', 'Please fill in all fields.'); return; }

    var restore = setLoading(btn, 'Signing in…');

    // Resolve to email
    var email = await resolveToEmail(identifier);
    if (!email) {
      restore();
      showAlert('loginAlert', 'No account found with that email, student ID, or phone number.');
      return;
    }

    var r = await _supabase.auth.signInWithPassword({ email: email, password: password });
    restore();

    if (r.error) {
      var msg = r.error.message.includes('Invalid login')
        ? 'Incorrect password. Please try again.'
        : r.error.message;
      showAlert('loginAlert', msg);
      return;
    }
    window.location.href = './dashboard.html';
  });
}

// ── SIGN UP ───────────────────────────────────────────────────
function initSignupPage() {
  redirectIfLoggedIn();
  var form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideAlert('signupAlert');

    var fullName   = form.full_name.value.trim();
    var studentId  = form.student_id.value.trim();
    var phone      = form.phone ? form.phone.value.trim() : '';
    var university = form.university.value.trim();
    var faculty    = form.faculty.value.trim();
    var email      = form.email.value.trim();
    var password   = form.password.value;
    var confirm    = form.confirm_password.value;
    var btn        = form.querySelector('button[type="submit"]');

    if (!fullName || !studentId || !university || !faculty || !email || !password || !confirm) {
      showAlert('signupAlert', 'Please fill in all required fields.'); return;
    }
    if (!isValidEmail(email)) { showAlert('signupAlert', 'Please enter a valid email address.'); return; }
    if (password.length < 6)  { showAlert('signupAlert', 'Password must be at least 6 characters.'); return; }
    if (password !== confirm)  { showAlert('signupAlert', 'Passwords do not match.'); return; }

    var restore = setLoading(btn, 'Creating account…');

    var r = await _supabase.auth.signUp({
      email: email, password: password,
      options: { data: { full_name: fullName } }
    });

    if (r.error) { restore(); showAlert('signupAlert', r.error.message); return; }

    var userId = r.data.user && r.data.user.id;
    if (userId) {
      await _supabase.from('profiles').insert([{
        id: userId, full_name: fullName,
        student_id: studentId,
        phone: phone || null,
        university: university, faculty: faculty,
        academic_year: 'Third Year', email: email,
        created_at: new Date().toISOString()
      }]);
    }

    restore();
    showAlert('signupAlert', '✅ Account created! You can now sign in.', 'success');
    form.reset();
  });
}

// ── SUBJECT PAGE ──────────────────────────────────────────────
async function initSubjectPage() {
  var session = await requireAuth();
  if (!session) return;

  var user    = session.user;
  var profile = await fetchProfile(user.id);
  var name    = (profile && profile.full_name) ? profile.full_name : user.email;

  var navAvatar = document.getElementById('navAvatar');
  var navName   = document.getElementById('navName');
  if (navAvatar) navAvatar.textContent = name.charAt(0).toUpperCase();
  if (navName)   navName.textContent   = name.split(' ')[0];

  var adminPanel = document.getElementById('adminPanel');
  if (adminPanel) adminPanel.style.display = isAdmin(user) ? 'block' : 'none';

  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  var params    = new URLSearchParams(window.location.search);
  var subjectId = params.get('id') || 'unknown';

  await loadContent(subjectId, 'previous_exams');
  await loadContent(subjectId, 'midterm_quizzes');

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      var target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  var addForm = document.getElementById('addContentForm');
  if (addForm && isAdmin(user)) {
    addForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await handleAddContent(subjectId, user);
    });
  }

  var overlay = document.getElementById('loadingOverlay');
  if (overlay) { overlay.classList.add('hidden'); setTimeout(function(){ overlay.remove(); }, 400); }
}

// ── Load content ──────────────────────────────────────────────
async function loadContent(subjectId, section) {
  var containerId = section === 'previous_exams' ? 'prevExamsContent' : 'midtermContent';
  var container   = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<div class="content-loading">Loading…</div>';

  var r = await _supabase
    .from('subject_content')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('section', section)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (r.error || !r.data || r.data.length === 0) {
    container.innerHTML = '<div class="content-empty">📭 No content yet. Check back soon.</div>';
    return;
  }

  container.innerHTML = '';
  r.data.forEach(function(item) { container.appendChild(renderContentItem(item)); });
}

function renderContentItem(item) {
  var div = document.createElement('div');
  div.className = 'content-item';

  var header = '<div class="content-item-header">' +
    '<div class="content-item-title">' +
    '<span class="content-type-badge type-' + item.type + '">' + item.type.toUpperCase() + '</span>' +
    '<span>' + escHtml(item.title) + '</span>' +
    '</div>' +
    '<div class="content-item-date">' + new Date(item.created_at).toLocaleDateString('en-GB') + '</div>' +
    '</div>';

  var body = '';
  if (item.type === 'text') {
    body = '<div class="content-text">' + escHtml(item.content || '').replace(/\n/g,'<br>') + '</div>';
  } else if (item.type === 'image') {
    body = '<div class="content-image-wrap"><img src="' + item.file_url + '" alt="' + escHtml(item.title) + '" class="content-image" loading="lazy"/></div>';
  } else if (item.type === 'pdf') {
    body = '<a href="' + item.file_url + '" target="_blank" class="content-pdf-link">' +
      '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
      escHtml(item.file_name || item.title) + ' — Open PDF</a>';
  }

  div.innerHTML = header + body;

  var adminPanel = document.getElementById('adminPanel');
  if (adminPanel && adminPanel.style.display !== 'none') {
    var delBtn = document.createElement('button');
    delBtn.className = 'btn-delete-item';
    delBtn.title = 'Delete';
    delBtn.innerHTML = '✕';
    delBtn.onclick = function(){ deleteContent(item.id, item.subject_id, item.section); };
    div.querySelector('.content-item-header').appendChild(delBtn);
  }
  return div;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function deleteContent(id, subjectId, section) {
  if (!confirm('Delete this item?')) return;
  var r = await _supabase.from('subject_content').select('file_url,type').eq('id', id).single();
  if (!r.error && r.data && (r.data.type === 'image' || r.data.type === 'pdf') && r.data.file_url) {
    var parts = r.data.file_url.split('/content-files/');
    if (parts[1]) await _supabase.storage.from('content-files').remove([parts[1]]);
  }
  await _supabase.from('subject_content').delete().eq('id', id);
  await loadContent(subjectId, section);
}

async function handleAddContent(subjectId, user) {
  var section   = document.getElementById('addSection').value;
  var title     = document.getElementById('addTitle').value.trim();
  var type      = document.getElementById('addType').value;
  var textArea  = document.getElementById('addText');
  var fileInput = document.getElementById('addFile');
  var btn       = document.querySelector('#addContentForm .btn-admin-submit');
  var alertId   = 'adminAlert';

  if (!title) { showAlert(alertId, 'Please enter a title.'); return; }
  if (type === 'text' && (!textArea || !textArea.value.trim())) { showAlert(alertId, 'Please enter text content.'); return; }
  if ((type === 'image' || type === 'pdf') && (!fileInput || !fileInput.files[0])) { showAlert(alertId, 'Please select a file.'); return; }

  var restore = setLoading(btn, 'Uploading…');
  hideAlert(alertId);

  var insertData = { subject_id: subjectId, section: section, title: title, type: type, created_by: user.id };

  if (type === 'text') {
    insertData.content = textArea.value.trim();
  } else {
    var file     = fileInput.files[0];
    var ext      = file.name.split('.').pop();
    var filePath = subjectId + '/' + section + '/' + Date.now() + '.' + ext;
    var up = await _supabase.storage.from('content-files').upload(filePath, file, { upsert: false });
    if (up.error) { restore(); showAlert(alertId, 'Upload failed: ' + up.error.message); return; }
    insertData.file_url  = _supabase.storage.from('content-files').getPublicUrl(filePath).data.publicUrl;
    insertData.file_name = file.name;
  }

  var r = await _supabase.from('subject_content').insert([insertData]);
  restore();
  if (r.error) { showAlert(alertId, 'Error: ' + r.error.message); return; }
  showAlert(alertId, '✅ Added successfully!', 'success');
  document.getElementById('addContentForm').reset();
  toggleTypeFields('text');
  await loadContent(subjectId, section);
}

function toggleTypeFields(type) {
  var textWrap  = document.getElementById('textWrap');
  var fileWrap  = document.getElementById('fileWrap');
  if (textWrap) textWrap.style.display = type === 'text' ? 'block' : 'none';
  if (fileWrap) fileWrap.style.display = (type === 'image' || type === 'pdf') ? 'block' : 'none';
  var fileInput = document.getElementById('addFile');
  if (fileInput) fileInput.accept = type === 'image' ? 'image/*' : '.pdf';
}
