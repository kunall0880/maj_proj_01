import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

type Job = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: "open" | "assigned" | "submitted" | "completed";
};

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");

  const jobsQuery = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs/all");
      // Filter for client jobs only
      return res.data.filter((j: any) => j.clientId === user?.id);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return api.post("/jobs/create", {
        title,
        description,
        budget: Number(budget),
        category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setTitle("");
      setDescription("");
      setBudget("");
      setCategory("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Client dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Post new work, monitor your jobs, and review freelancer submissions.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Post new job</h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="input min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="budget">
                  Budget
                </label>
                <input
                  id="budget"
                  type="number"
                  className="input"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Posting..." : "Post job"}
            </button>
          </form>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Your jobs</h2>
          </div>
          {jobsQuery.isLoading && (
            <p className="text-sm text-slate-500">Loading jobs...</p>
          )}
          {jobsQuery.isError && (
            <p className="text-sm text-red-600">Unable to load jobs.</p>
          )}
          {!jobsQuery.isLoading && jobsQuery.data && jobsQuery.data.length === 0 && (
            <p className="text-sm text-slate-500">
              No jobs posted yet. Use the form to create your first job.
            </p>
          )}
          <ul className="divide-y divide-slate-200">
            {jobsQuery.data?.map((job) => (
              <li key={job._id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {job.title}
                      </Link>
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Budget</div>
                    <div className="font-medium text-slate-900">₹{job.budget}</div>
                    <div className="mt-1">{job.category}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};


