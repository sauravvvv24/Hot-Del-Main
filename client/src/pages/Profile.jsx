import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useAuth();
  console.log('User object:', user);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userInfo?.name || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user.email) return; // Ensure email is available
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${user.email}`);
        if (response.data) {
          setUserInfo(response.data);
          setError(null); // Clear error if data is fetched successfully
        } else {
          setError('User data not found');
        }
      } catch (error) {
        console.error('Error fetching user information:', error);
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user.email]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/api/users/${user.email}`, { name });
      setUserInfo({ ...userInfo, name });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  };

  if (loading) {
    return <div>Loading user information...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          {isEditing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 border w-full rounded"
            />
          ) : (
            <p className="mt-1 p-2 border w-full rounded">{userInfo.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <p className="mt-1 p-2 border w-full rounded">{userInfo.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <p className="mt-1 p-2 border w-full rounded">{userInfo.role}</p>
        </div>
        {isEditing ? (
          <button
            onClick={handleSave}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save
          </button>
        ) : (
          <button
            onClick={handleEditToggle}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
