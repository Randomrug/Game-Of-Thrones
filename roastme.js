const backFromAbout = document.getElementById("back-from-about");
const reviewsContainer = document.getElementById("reviews-container");
const reviewInput = document.getElementById("review-input");
const submitReview = document.getElementById("submit-review");
const reviewSort = document.getElementById("review-sort");
const reviewDate = document.getElementById("review-date");
const reviewNotice = document.getElementById("review-notice");

const VISITOR_STORAGE_KEY = "visitorId";
const MAX_DAILY_COMMENTS = 3;

let reviewSortMode = "newest";
let reviewFilterDate = "";
let reviews = [];

// ===================================
// ABOUT PAGE
// ===================================

if (backFromAbout) {
  backFromAbout.addEventListener("click", () => {
    window.location.replace("index.html");
  });
}

// ===================================
// BACK
// ===================================

// Back button is handled above if present.

// ===================================
// LOCAL REVIEWS
// ===================================

function getVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  }
  return visitorId;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
}

function sortReviews(reviewsList, mode) {
  const copy = [...reviewsList];
  switch (mode) {
    case "oldest":
      copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "liked":
      copy.sort((a, b) => b.likes - a.likes);
      break;
    default:
      copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }
  return copy;
}

function filterByDate(reviewsList, date) {
  if (!date) return reviewsList;
  return reviewsList.filter(review => review.createdAt.startsWith(date));
}

function canCommentToday() {
  const visitorId = getVisitorId();
  const today = new Date().toISOString().slice(0, 10);
  const count = reviews.filter(
    review =>
      review.visitorId === visitorId &&
      review.createdAt.startsWith(today)
  ).length;
  return count < MAX_DAILY_COMMENTS;
}

function getLikedReviewsLocal() {
  let liked = localStorage.getItem("likedReviews");
  try {
    liked = JSON.parse(liked);
  } catch (err) {
    liked = null;
  }
  if (!Array.isArray(liked)) return [];
  return liked.map(id => String(id));
}

function saveLikedReviewLocal(reviewId) {
  const idString = String(reviewId);
  const liked = getLikedReviewsLocal();
  if (!liked.includes(idString)) {
    liked.push(idString);
    localStorage.setItem("likedReviews", JSON.stringify(liked));
  }
}

function getSupabaseClient() {
  if (window.supabaseClient) return window.supabaseClient;
  console.error("Supabase client is not initialized. Ensure supabase.js loaded after the CDN.");
  return null;
}

async function loadReviews() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("comments")
    .select("*");

  if (reviewSortMode === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (reviewSortMode === "liked") {
    query = query.order("likes", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(30);

  if (error) {
    console.error("Error loading reviews:", error);
    return [];
  }

  const mapped = (data || []).map(review => ({
    id: review.id,
    visitorId: review.visitor_id,
    text: review.comment,
    likes: Number(review.likes) || 0,
    createdAt: review.created_at
  }));
  
  console.log("Loaded reviews from Supabase:", mapped);
  return mapped;
}

function getDisplayReviews() {
  const filtered = filterByDate(reviews, reviewFilterDate);
  return sortReviews(filtered, reviewSortMode);
}

function renderReviews() {
  if (!reviewsContainer) return;

  const displayReviews = getDisplayReviews();
  reviewsContainer.innerHTML = "";

  if (displayReviews.length === 0) {
    reviewsContainer.innerHTML = "<div class='review-empty'>No reviews found.</div>";
    return;
  }

  displayReviews.forEach(review => {
    console.log("Rendering review:", {id: review.id, text: review.text.substring(0, 20), likes: review.likes});
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-text">${escapeHtml(review.text)}</div>
      <div class="review-meta">
        <span class="review-date">🕒 ${formatDate(review.createdAt)}</span>
        <button class="review-like" data-review-id="${review.id}">❤️ ${review.likes}</button>
      </div>
    `;
    reviewsContainer.appendChild(card);
  });

  document.querySelectorAll(".review-like").forEach(btn => {
    btn.onclick = async () => {
      console.log("LIKE CLICKED");

      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error("Supabase unavailable");
        return;
      }

      const reviewId = Number(btn.dataset.reviewId);
      console.log("reviewId:", reviewId);

      const likedLocal = getLikedReviewsLocal();
      console.log("likedReviews:", likedLocal);

      const alreadyLiked = likedLocal.includes(String(reviewId));
      console.log("alreadyLiked:", alreadyLiked);

      // Prevent duplicate likes from same browser
      if (alreadyLiked) {
        console.log("Already liked this review");
        return;
      }

      const review = reviews.find(r => Number(r.id) === reviewId);
      console.log("Review object:", review);
      if (!review) {
        console.error("Review not found:", reviewId);
        return;
      }

      console.log("Attempting Supabase update for reviewId:", reviewId, "new likes:", review.likes + 1);
      const { error } = await supabase
        .from("comments")
        .update({
          likes: review.likes + 1
        })
        .eq("id", reviewId);

      console.log("Supabase update result - error:", error);

      if (error) {
        console.error("Like update failed:", error);
        return;
      }

      console.log("Update successful, saving to local storage");
      saveLikedReviewLocal(reviewId);

      console.log("Reloading reviews from Supabase");
      reviews = await loadReviews();
      console.log("Reloaded reviews:", reviews);

      console.log("Rendering reviews");
      renderReviews();
    };
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>\"'`]/g, char => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#96;"
    }[char];
  });
}

function updateReviewNotice() {
  if (!reviewNotice) return;
  const visitorId = getVisitorId();
  const today = new Date().toISOString().slice(0, 10);
  const count = reviews.filter(
    review =>
      review.visitorId === visitorId &&
      review.createdAt.startsWith(today)
  ).length;
  if (count >= MAX_DAILY_COMMENTS) {
    reviewNotice.textContent = `You have posted ${count}/${MAX_DAILY_COMMENTS} reviews today. Come back tomorrow!`;
  } else {
    reviewNotice.textContent = `${MAX_DAILY_COMMENTS - count} raven${MAX_DAILY_COMMENTS - count !== 1 ? 's' : ''} remaining today.`;
  }
}

(async () => {
  reviews = await loadReviews();
  renderReviews();
  updateReviewNotice();
})();

if (reviewSort) {
  reviewSort.addEventListener("change", async e => {
    reviewSortMode = e.target.value;
    reviews = await loadReviews();
    renderReviews();
  });
}

if (reviewDate) {
  reviewDate.addEventListener("change", e => {
    reviewFilterDate = e.target.value;
    renderReviews();
  });
}

if (submitReview && reviewInput) {
  submitReview.addEventListener("click", async () => {
    const text = reviewInput.value.trim();
    if (!text) return;
    if (!canCommentToday()) {
      alert(`You can post ${MAX_DAILY_COMMENTS} reviews per day. Come back tomorrow!`);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Commenting is unavailable right now. Please try again later.");
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert([{
        visitor_id: getVisitorId(),
        comment: text,
        likes: 0
      }]);
    
    if (error) {
      console.error("Comment insert error:", error);
      alert("Unable to post comment. See console for details.");
      return;
    }

    reviewInput.value = "";
    reviews = await loadReviews();
    renderReviews();
    updateReviewNotice();
  });
}

// Realtime updates: listen for changes to comments table
const supabase = getSupabaseClient();
if (supabase) {
  supabase
    .channel("realm-reviews")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments"
      },
      async () => {
        reviews = await loadReviews();
        renderReviews();
      }
    )
    .subscribe();
}
