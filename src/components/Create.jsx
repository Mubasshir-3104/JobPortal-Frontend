import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JobForm from "./JobForm";

const initial = {
  postId: "",
  postProfile: "",
  reqExperience: 0,
  postTechStack: [],
  postDesc: "",
};

const Create = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // `data` is the form state plus any skill that was typed but not yet added.
  const handleSubmit = (data) => {
    setSubmitting(true);
    setError("");
    axios
      .post("http://localhost:8080/addJob", data)
      .then((resp) => {
        console.log(resp.data);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        setError("We couldn't publish this job. Please check the details and try again.");
        setSubmitting(false);
      });
  };

  return (
    <JobForm
      mode="create"
      values={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/")}
      submitting={submitting}
      error={error}
    />
  );
};

export default Create;