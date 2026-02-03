import React, { useEffect, useState } from "react";
import CreatePostModal from "../../components/community/CreatePostModal";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // Get user from local storage (mock for now if missing)
  const user = JSON.parse(localStorage.getItem("user")) || {
    id: 1,
    firstName: "Traveler",
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/community/posts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPosts(data.posts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCreatePost = async (postData) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/community/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id || user.PassengerId,
            ...postData,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        // Optimistic add (or re-fetch)
        const newPost = {
          id: data.id,
          user_id: user.id || user.PassengerId,
          FirstName: user.firstName || user.FirstName || "You",
          LastName: user.lastName || user.LastName || "",
          likes: 0,
          created_at: new Date().toISOString(),
          ...postData,
        };
        setPosts([newPost, ...posts]);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetch(
        `http://localhost:5000/api/v1/community/posts/${postId}/like`,
        { method: "POST" },
      );
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "3rem 1rem",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              Travel Stories & Tips 🌍
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: "1.1rem",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Join the AirGo community! Share your adventures, discover hidden
              gems, and get inspired for your next trip.
            </p>
            <div style={{ marginTop: "2rem" }}>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: "#006C35",
                  color: "white",
                  padding: "12px 30px",
                  borderRadius: "30px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(0,108,53,0.3)",
                }}
              >
                <i
                  className="ri-quill-pen-line"
                  style={{ marginRight: "8px" }}
                ></i>
                Share Your Story
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Loading wonderful stories...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {post.image_url && (
                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <img
                        src={post.image_url}
                        alt="Story"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ padding: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.2rem",
                        }}
                      >
                        {post.FirstName ? post.FirstName[0] : "U"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {post.FirstName || "Traveler"} {post.LastName}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          {post.location || "Somewhere nice"}
                        </div>
                      </div>
                      {post.type && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            background:
                              post.type === "tip" ? "#fef3c7" : "#e0f2fe",
                            color: post.type === "tip" ? "#d97706" : "#0284c7",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          {post.type}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        color: "#334155",
                        lineHeight: "1.6",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {post.content}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "#64748b",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleLike(post.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                          fontWeight: 600,
                        }}
                      >
                        <i className="ri-heart-3-fill"></i> {post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPost={handleCreatePost}
      />
    </>
  );
};

export default CommunityPage;
