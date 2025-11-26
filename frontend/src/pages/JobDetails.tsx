import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

type Job = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: "open" | "assigned" | "submitted" | "completed";
  clientId: string;
  selectedFreelancer?: string;
};

type Proposal = {
  _id: string;
  bidAmount: number;
  coverLetter: string;
  status: "pending" | "accepted";
  freelancerId: { _id: string; name: string; email: string } | string;
};

type Work = {
  _id: string;
  submissionMessage: string;
  submittedFiles: string[];
  approved: boolean;
  freelancerId: string;
};

type Review = {
  _id: string;
  rating: number;
  comment: string;
  reviewerId: { name: string; email: string };
};

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [bidAmount, setBidAmount] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submittedFiles, setSubmittedFiles] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const jobQuery = useQuery<Job>({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/jobs/${id}`);
      return res.data;
    },
  });

  const proposalsQuery = useQuery<Proposal[]>({
    queryKey: ["proposals", id],
    enabled: !!id && !!user && user.role === "client" && !!jobQuery.data,
    queryFn: async () => {
      const res = await api.get(`/proposals/job/${id}`);
      return res.data;
    },
  });

  const workQuery = useQuery<Work[]>({
    queryKey: ["work", id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const res = await api.get(`/work/job/${id}`);
      return res.data;
    },
  });

  const reviewsQuery = useQuery<Review[]>({
    queryKey: ["reviews", id],
    enabled: false, // loaded on demand after add; for brevity we keep it optional
    queryFn: async () => {
      if (!jobQuery.data) return [];
      const res = await api.get(`/reviews/user/${jobQuery.data.selectedFreelancer}`);
      return res.data;
    },
  });

  const proposalMutation = useMutation({
    mutationFn: async () => {
      return api.post("/proposals/submit", {
        jobId: id,
        bidAmount: Number(bidAmount),
        coverLetter,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals", id] });
      setBidAmount("");
      setCoverLetter("");
    },
  });

  const selectProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      return api.put(`/proposals/select/${proposalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["proposals", id] });
    },
  });

  const submitWorkMutation = useMutation({
    mutationFn: async () => {
      return api.post("/work/submit", {
        jobId: id,
        submissionMessage,
        submittedFiles: submittedFiles
          ? submittedFiles.split(",").map((s) => s.trim())
          : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work", id] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      setSubmissionMessage("");
      setSubmittedFiles("");
    },
  });

  const approveWorkMutation = useMutation({
    mutationFn: async (workId: string) => {
      return api.put(`/work/approve/${workId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work", id] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!jobQuery.data) return;
      return api.post("/reviews/add", {
        jobId: jobQuery.data._id,
        reviewedUser: user?.role === "client" ? jobQuery.data.selectedFreelancer : jobQuery.data.clientId,
        rating: Number(rating),
        comment,
      });
    },
    onSuccess: () => {
      setComment("");
    },
  });

  const job = jobQuery.data;
  const isClient = user?.role === "client" && job && job.clientId === user.id;
  const isFreelancer =
    user?.role === "freelancer" && job && job.selectedFreelancer === user.id;

  return (
    <div className="space-y-6">
      {jobQuery.isLoading && <p className="text-sm text-slate-500">Loading job...</p>}
      {jobQuery.isError && (
        <p className="text-sm text-red-600">Unable to load job details.</p>
      )}
      {job && (
        <>
          <section className="card p-5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{job.title}</h1>
                <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">
                  {job.description}
                </p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div>Status</div>
                <div className="mt-1 inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                  {job.status}
                </div>
                <div className="mt-3">
                  <div>Budget</div>
                  <div className="font-medium text-slate-900">₹{job.budget}</div>
                  <div className="mt-1 text-xs">{job.category}</div>
                </div>
              </div>
            </div>
          </section>

          {user?.role === "freelancer" && job.status === "open" && (
            <section className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Submit a proposal
              </h2>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  proposalMutation.mutate();
                }}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <div>
                    <label className="label" htmlFor="bidAmount">
                      Bid amount
                    </label>
                    <input
                      id="bidAmount"
                      type="number"
                      className="input"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="coverLetter">
                    Cover letter
                  </label>
                  <textarea
                    id="coverLetter"
                    className="input min-h-[80px]"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={proposalMutation.isPending}
                >
                  {proposalMutation.isPending ? "Submitting..." : "Submit proposal"}
                </button>
              </form>
            </section>
          )}

          {isClient && proposalsQuery.data && proposalsQuery.data.length > 0 && (
            <section className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Proposals</h2>
              <ul className="divide-y divide-slate-200">
                {proposalsQuery.data.map((p) => (
                  <li key={p._id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {typeof p.freelancerId === "string"
                            ? p.freelancerId
                            : p.freelancerId.name}
                        </div>
                        <p className="mt-1 text-xs text-slate-600 whitespace-pre-line">
                          {p.coverLetter}
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-500 space-y-1">
                        <div>Bid</div>
                        <div className="font-medium text-slate-900">₹{p.bidAmount}</div>
                        <div>
                          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                            {p.status}
                          </span>
                        </div>
                        {job.status === "open" && (
                          <button
                            className="btn-secondary px-3 py-1 text-xs"
                            onClick={() => selectProposalMutation.mutate(p._id)}
                            disabled={selectProposalMutation.isPending}
                          >
                            Select
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isFreelancer && (job.status === "assigned" || job.status === "submitted") && (
            <section className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Submit work for this job
              </h2>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitWorkMutation.mutate();
                }}
              >
                <div>
                  <label className="label" htmlFor="submissionMessage">
                    Submission notes
                  </label>
                  <textarea
                    id="submissionMessage"
                    className="input min-h-[80px]"
                    value={submissionMessage}
                    onChange={(e) => setSubmissionMessage(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="submittedFiles">
                    Links or file references (comma separated)
                  </label>
                  <input
                    id="submittedFiles"
                    className="input"
                    value={submittedFiles}
                    onChange={(e) => setSubmittedFiles(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitWorkMutation.isPending}
                >
                  {submitWorkMutation.isPending ? "Submitting..." : "Submit work"}
                </button>
              </form>
            </section>
          )}

          {workQuery.data && workQuery.data.length > 0 && (
            <section className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Work submissions
              </h2>
              <ul className="divide-y divide-slate-200">
                {workQuery.data.map((w) => (
                  <li key={w._id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-800 whitespace-pre-line">
                          {w.submissionMessage}
                        </p>
                        {w.submittedFiles && w.submittedFiles.length > 0 && (
                          <ul className="mt-1 text-xs text-slate-500 list-disc pl-4">
                            {w.submittedFiles.map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="text-right text-xs text-slate-500 space-y-1">
                        <div>Status</div>
                        <div>
                          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                            {w.approved ? "Approved" : "Pending"}
                          </span>
                        </div>
                        {isClient && !w.approved && (
                          <button
                            className="btn-secondary px-3 py-1 text-xs"
                            onClick={() => approveWorkMutation.mutate(w._id)}
                            disabled={approveWorkMutation.isPending}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.status === "completed" && (
            <section className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Provide a review
              </h2>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  reviewMutation.mutate();
                }}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-3">
                  <div>
                    <label className="label" htmlFor="rating">
                      Rating
                    </label>
                    <select
                      id="rating"
                      className="input"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="comment">
                      Comment
                    </label>
                    <textarea
                      id="comment"
                      className="input min-h-[60px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? "Saving..." : "Submit review"}
                </button>
              </form>
            </section>
          )}
        </>
      )}
    </div>
  );
};


