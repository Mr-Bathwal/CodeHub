import React, { useEffect, useState } from "react";
import { getUserSubmissions } from "../api";

export default function Submissions({ userId, submissionsUpdated }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return; // Don't fetch if no userId

    setLoading(true);
    setError(null);

    getUserSubmissions(userId)
      .then((res) => {
        // Defensive: check if res.data is array
        if (Array.isArray(res.data)) {
          setSubmissions(res.data);
        } else {
          setSubmissions([]);
          setError("Invalid data format from server");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load submissions");
        setSubmissions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, submissionsUpdated]);

  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!submissions.length) return <p>No submissions yet</p>;

  return (
    <div>
      <h2>Your Last Submissions</h2>
      <ul>
        {submissions.map((sub) => (
          <li key={sub._id}>
            <strong>{sub.problemTitle || "Untitled Problem"}</strong> -{" "}
            <em>{sub.status || "Unknown Status"}</em> -{" "}
            <span>{sub.language || "N/A"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
