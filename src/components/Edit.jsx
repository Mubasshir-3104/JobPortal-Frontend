import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import JobForm from "./JobForm";

const initial = {
  postId: "",
  postProfile: "",
  reqExperience: 0,
  postTechStack: [],
  postDesc: "",
};

const Edit = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState(initial);
  // Opening /edit directly (no router state) used to crash; fall back to the feed instead.
  const [currId] = useState(location.state?.id);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currId === undefined || currId === null) {
      navigate("/", { replace: true });
      return;
    }

    const fetchInitialPosts = async (id) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/getjobPost/${id}`
        );
        setForm({
          ...initial,
          ...response.data,
          postTechStack: response.data?.postTechStack || [],
        });
      } catch (err) {
        console.log(err);
        setLoadFailed(true);
        setError("We couldn't load this job. Please go back and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts(currId);
  }, [currId, navigate]);

  const handleSubmit = (data) => {
    if (loadFailed) return; // never PUT a blank record after a failed load
    setSubmitting(true);
    setError("");

    axios
      .put("http://localhost:8080/updateJob", data)
      .then((resp) => {
        console.log(resp.data);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        setError("We couldn't save your changes. Please try again.");
        setSubmitting(false);
      });
  };

  return (
    <JobForm
      mode="edit"
      values={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/")}
      loading={loading}
      submitting={submitting}
      error={error}
    />
  );
};

export default Edit;