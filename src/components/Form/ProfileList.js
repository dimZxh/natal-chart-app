import React from 'react';
import { useChartContext } from '../../context/ChartContext';
import { format } from 'date-fns';

const ProfileList = () => {
  const { savedProfiles, loadProfile, deleteProfile, birthData } = useChartContext();

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Handle profile selection
  const handleSelectProfile = (profile) => {
    loadProfile(profile);
  };

  // Handle profile deletion
  const handleDeleteProfile = (e, profileId) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    if (window.confirm('Are you sure you want to delete this profile?')) {
      deleteProfile(profileId);
    }
  };

  if (savedProfiles.length === 0) {
    return <p>No saved profiles yet.</p>;
  }

  return (
    <div className="profile-list-container">
      <ul className="profile-list">
        {savedProfiles.map((profile) => (
          <li
            key={profile.id}
            className={`profile-item ${birthData?.id === profile.id ? 'active' : ''}`}
            onClick={() => handleSelectProfile(profile)}
          >
            <div className="profile-item-content">
              <div className="profile-name">{profile.name}</div>
              <div className="profile-details">
                {formatDate(profile.date)} at {profile.time}
              </div>
              <div className="profile-location">{profile.place}</div>
            </div>
            <button
              className="btn-delete"
              onClick={(e) => handleDeleteProfile(e, profile.id)}
              title="Delete profile"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileList; 