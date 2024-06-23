import axios from "axios";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const STDashBoard = () => {
  const navigate = useNavigate();
  const [pollDetails, setPollDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState({});
  const [role, setRole] = useState("");
  const location = useLocation();
  const { email } = useParams();

  useEffect(() => {
    const token = Cookies.get("token");

    const fetchRemainingPolls = async () => {
      try {
        const remainingPollIds = await getRemainingPollIds();

        const detailedPolls = await Promise.all(
          remainingPollIds.map((pollId) => fetchPollDetails(pollId))
        );

        const filteredPolls = detailedPolls.filter((poll) => poll !== null);

        setPollDetails(filteredPolls);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching remaining polls:", error);
      }
    };

    fetchRemainingPolls();

    const queryParams = new URLSearchParams(location.search);
    const roleFromUrl = queryParams.get("role");
    if (roleFromUrl) {
      setRole(roleFromUrl);
    }

    if (!token) {
      navigate("/");
      alert("Please login!");
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, email, location.search]);

  const getRemainingPollIds = async () => {
    try {
      const response = await axios.get(`/api/${role}/${email}/remainingpolls`);
      return response.data.remainingPolls;
    } catch (error) {
      console.error("Error fetching remaining poll IDs:", error);
      return [];
    }
  };

  const handleOptionChange = (pollId, optionId) => {
    setSelectedOption({ ...selectedOption, [pollId]: optionId });
  };

  const handleVote = async (pollId) => {
    const optionId = selectedOption[pollId];
    if (!optionId) {
      console.error("Please select an option before voting.");
      return;
    }

    try {
      await axios.post(`/api/poll/vote/${pollId}`, {
        selectedOption: optionId,
      });

      setPollDetails((prevPollDetails) =>
        prevPollDetails.filter((poll) => poll.id !== pollId)
      );
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  const fetchPollDetails = async (pollId) => {
    try {
      const response = await fetch(`/api/poll/get/${pollId}`);

      if (!response.ok) {
        console.log("No Poll Found!");
        return null;
      }

      const pollData = await response.json();
      const { id, date, options, institutename, name } = pollData;
      return { id, date, options, institutename, name };
    } catch (error) {
      console.error(
        `Error fetching poll details for poll ID ${pollId}:`,
        error
      );
      return null;
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };

  const handleProfileNavigation = () => {
    navigate(`/profile/${email}?role=${role}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polls Dashboard</h1>
        <div>
          <button
            onClick={handleProfileNavigation}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      <div>
        {pollDetails.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {pollDetails.map((poll) => (
              <li
                key={poll.id}
                className="bg-white shadow-md rounded-lg p-4 mb-6"
              >
                <div className="mb-4">
                  <p className="text-lg font-semibold mb-1">
                    Poll ID: {poll.id}
                  </p>
                  <p className="text-lg font-semibold mb-1">
                    Name: {poll.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Date: {new Date(poll.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Institute Name: {poll.institutename}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2">Options:</p>
                  <ul>
                    {Object.entries(poll.options).map(
                      ([optionId, optionText]) => (
                        <li key={optionId} className="mb-2">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name={`poll_${poll.id}_options`}
                              value={optionId}
                              className="form-radio text-blue-500 h-4 w-4"
                              onChange={() =>
                                handleOptionChange(poll.id, optionId)
                              }
                            />
                            <span className="ml-2 text-sm">{optionId}</span>
                          </label>
                        </li>
                      )
                    )}
                  </ul>
                  <button
                    onClick={() => handleVote(poll.id)}
                    className="btn btn-primary"
                  >
                    Vote
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-lg">No polls available.</p>
        )}
      </div>
    </div>
  );
};
