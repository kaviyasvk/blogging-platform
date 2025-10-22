// Simple Blogging App using localStorage

const titleEl = document.getElementById('title');
const contentEl = document.getElementById('content');
const publishedEl = document.getElementById('published');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const postsContainer = document.getElementById('posts');
const searchEl = document.getElementById('search');
const countEl = document.getElementById('count');

let posts = JSON.parse(localStorage.getItem('posts') || '[]');
let editingId = null;

// Save posts to localStorage
function persist() {
  localStorage.setItem('posts', JSON.stringify(posts));
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br>');
}

// Render posts list
function renderPosts(filter = '') {
  const f = filter.trim().toLowerCase();
  const filtered = posts.filter(p => {
    if (!f) return true;
    return (
      p.title.toLowerCase().includes(f) ||
      p.content.toLowerCase().includes(f)
    );
  });

  countEl.textContent = `${filtered.length} post(s)`;

  postsContainer.innerHTML = filtered
    .map(
      p => `
      <article class="post" data-id="${p.id}">
        <h3>${escapeHtml(p.title)}</h3>
        <small>${new Date(p.createdAt).toLocaleString()} • ${
        p.published ? 'Published' : 'Draft'
      }</small>
        <p>${escapeHtml(p.content)}</p>
        <div class="actions">
          <button class="editBtn">✏️ Edit</button>
          <button class="deleteBtn">🗑️ Delete</button>
          <button class="togglePubBtn">${
            p.published ? 'Unpublish' : 'Publish'
          }</button>
        </div>
      </article>`
    )
    .join('');

  attachPostListeners();
}

// Attach listeners to post buttons
function attachPostListeners() {
  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.onclick = e => startEdit(getIdFromEl(e.target));
  });
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.onclick = e => deletePost(getIdFromEl(e.target));
  });
  document.querySelectorAll('.togglePubBtn').forEach(btn => {
    btn.onclick = e => togglePublish(getIdFromEl(e.target));
  });
}

function getIdFromEl(el) {
  const article = el.closest('.post');
  return article && Number(article.dataset.id);
}

// Start editing a post
function startEdit(id) {
  const p = posts.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  titleEl.value = p.title;
  contentEl.value = p.content;
  publishedEl.checked = !!p.published;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Clear the form
function clearForm() {
  editingId = null;
  titleEl.value = '';
  contentEl.value = '';
  publishedEl.checked = false;
}

// Save or update post
function savePost() {
  const title = titleEl.value.trim();
  const content = contentEl.value.trim();

  if (!title) {
    alert('Enter a title');
    return;
  }

  if (editingId) {
    const idx = posts.findIndex(p => p.id === editingId);
    if (idx > -1) {
      posts[idx].title = title;
      posts[idx].content = content;
      posts[idx].published = publishedEl.checked;
      posts[idx].updatedAt = new Date().toISOString();
    }
  } else {
    const post = {
      id: Date.now(),
      title,
      content,
      published: publishedEl.checked || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    posts.unshift(post);
  }

  persist();
  renderPosts(searchEl.value);
  clearForm();
  alert('Post saved successfully!');
}

// Delete post
function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  posts = posts.filter(p => p.id !== id);
  persist();
  renderPosts(searchEl.value);
}

// Toggle publish/unpublish
function togglePublish(id) {
  const p = posts.find(x => x.id === id);
  if (!p) return;
  p.published = !p.published;
  p.updatedAt = new Date().toISOString();
  persist();
  renderPosts(searchEl.value);
}

// Event listeners
saveBtn.addEventListener('click', savePost);
clearBtn.addEventListener('click', clearForm);
searchEl.addEventListener('input', () => renderPosts(searchEl.value));

// Initial render
posts = posts.sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);
renderPosts();
