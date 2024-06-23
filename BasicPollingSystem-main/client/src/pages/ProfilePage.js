import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";

export const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("");
  const { email } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      const queryParams = new URLSearchParams(location.search);
      const roleFromUrl = queryParams.get("role");
      if (roleFromUrl) {
        setRole(roleFromUrl);
      }
      try {
        const response = await axios.get(`/api/${role}/get/${email}`);
        setUsername(response.data.name);
        setPhone(response.data.phone);
        setCurrentUsername(response.data.name);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    getUser();

    const token = Cookies.get("token");
    if (!token) {
      navigate("/");
      alert("Please login!");
      return;
    }
  }, [email, role, location.search, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (oldPassword && !newPassword) {
      return alert("Please also enter newPassword!");
    } else if (!oldPassword && newPassword) {
      return alert("Please also enter oldPassword!");
    }

    try {
      await axios.put(`/api/${role}/${email}/update`, {
        name: username || currentUsername,
        phone: phone,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      alert("Profile updated successfully!");
      setCurrentUsername(username || currentUsername); // Update currentUsername if changed
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error occurred while updating profile!");
    }
  };

  const handleDeleteProfile = async () => {
    try {
      if (role === "institute") {
        await axios.delete(`/api/institute/${email}/delete`);
      } else {
        await axios.delete(`/api/${role}/${email}/delete`);
      }
      alert("User deleted successfully!");
      Cookies.remove("token");
      navigate("/");
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Error occurred while deleting profile!");
    }
  };

  const handleBackToDashboard = () => {
    if (role === "institute") {
      navigate(-1);
    } else {
      navigate(`/dashboard/${email}?role=${role}`);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Profile</h2>

        {/* Profile Information Display */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <p className="text-gray-800">{currentUsername}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <p className="text-gray-800">{email}</p>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Phone
            </label>
            <input
              id="phone"
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="oldPassword"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Old Password
            </label>
            <input
              id="oldPassword"
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="newPassword"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update Profile
            </button>
            <button
              type="button"
              onClick={handleDeleteProfile}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete Profile
            </button>
          </div>
        </form>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleBackToDashboard}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
