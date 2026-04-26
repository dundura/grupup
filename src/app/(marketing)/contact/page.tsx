"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <div className="bg-white border-b py-10 px-4">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-1">Contact Us</h1>
          <p className="text-muted-foreground">Have a question or want to learn more? Drop us a message and we'll get back to you.</p>
        </div>
      </div>

      <div className="container max-w-3xl py-10 px-4">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Form */}
          <div className="md:col-span-2">
            {status === "sent" ? (
              <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "#0F3154" }} />
                <h2 className="text-xl font-bold mb-2">Message sent!</h2>
                <p className="text-muted-foreground">Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong> as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">First Name <span className="text-[#DC373E]">*</span></label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Jane"
                      className="w-full px-4 py-2.5 rounded-xl border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Last Name <span className="text-[#DC373E]">*</span></label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Smith"
                      className="w-full px-4 py-2.5 rounded-xl border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email <span className="text-[#DC373E]">*</span></label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="w-full px-4 py-2.5 rounded-xl border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Message <span className="text-[#DC373E]">*</span></label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 rounded-xl border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-[#DC373E]">Something went wrong. Please try again or email us directly.</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#0F3154" }}
                >
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#0F3154" }}>
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <p className="font-semibold text-sm">Email us directly</p>
              </div>
              <a href="mailto:info@anytime-soccer.com" className="text-sm font-medium underline" style={{ color: "#0F3154" }}>
                info@anytime-soccer.com
              </a>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <p className="font-semibold text-sm mb-1">Response time</p>
              <p className="text-sm text-muted-foreground">We typically respond within 1–2 business days.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
