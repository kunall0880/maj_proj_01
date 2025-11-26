import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";

type Job = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: "open" | "assigned" | "submitted" | "completed";
};

export const FreelancerDashboard: React.FC = () => {
  const jobsQuery = useQuery<Job[]>({
    queryKey: ["open-jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs/all");
      return res.data.filter((j: any) => j.status === "open");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Freelancer dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse open jobs, submit proposals, and track your assignments.
        </p>
      </div>
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Open jobs</h2>
        </div>
        {jobsQuery.isLoading && (
          <p className="text-sm text-slate-500">Loading jobs...</p>
        )}
        {jobsQuery.isError && (
          <p className="text-sm text-red-600">Unable to load jobs.</p>
        )}
        {!jobsQuery.isLoading && jobsQuery.data && jobsQuery.data.length === 0 && (
          <p className="text-sm text-slate-500">No open jobs at the moment.</p>
        )}
        <ul className="divide-y divide-slate-200">
          {jobsQuery.data?.map((job) => (
            <li key={job._id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    {job.title}
                  </Link>
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
  );
};


