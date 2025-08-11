import React, { useEffect, useState } from "react";
import { getUserSubmissions } from "../api";

export default function Submissions({ userId, submissionsUpdated }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    getUserSubmissions(userId)
      .then((res) => {
        console.log("Submissions fetched:", res.data);
        setSubmissions(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch submissions:", err);
        setError("Failed to load submissions");
      })
      .finally(() => setLoading(false));
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
            <strong>{sub.problemTitle}</strong> - {sub.status} - {sub.language}
          </li>
        ))}
      </ul>
      <p>
        Total submitted: {submissions.length} | Accepted:{" "}
        {submissions.filter((s) => s.status === "Accepted").length}
      </p>
    </div>
  );
}
