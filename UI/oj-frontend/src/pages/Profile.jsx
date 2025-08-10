import React, { useEffect, useState } from "react";
import { getProfile } from "../api";

export default function Profile({ userId }) {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    getProfile(userId)
      .then(res => setProfileData(res.data))
      .catch(err => console.error(err));
  }, [userId]);

  if (!profileData) return <p>Loading profile...</p>;

  return (
    <div>
      <p>Username: {profileData.user.username}</p>
      <p>Email: {profileData.user.email}</p>
    </div>
  );
}
