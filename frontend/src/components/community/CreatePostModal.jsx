import React, { useState } from "react";

const CreatePostModal = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("story");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;

    setLoading(true);
    try {
      await onPost({ content, location, type, imageUrl });
      onClose();
      // Reset form
      setContent("");
      setLocation("");
      setType("story");
      setImageUrl("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Share Your Experience
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <i className="ri-close-line" style={{ fontSize: "1.5rem" }}></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your travel story, tip, or question..."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                resize: "vertical",
                minHeight: "120px",
                fontFamily: "inherit",
              }}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                }}
              >
                <option value="story">Story 📖</option>
                <option value="tip">Tip 💡</option>
                <option value="question">Question ❓</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Paris, France"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "30px",
                border: "1px solid #cbd5e1",
                background: "white",
                color: "#475569",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "30px",
                border: "none",
                background: "#006C35",
                color: "white",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line ri-spin"></i> Posting...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-fill"></i> Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CreatePostModal;
