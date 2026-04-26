"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

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

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow bg-white";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8fa" }}>

      {/* Hero */}
      <div className="text-white py-16 md:py-20 text-center px-4" style={{ backgroundColor: "#0F3154" }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
        <p className="text-white/70 text-lg max-w-lg mx-auto">
          Have a question or want to learn more? Drop us a message and we'll get back to you.
        </p>
      </div>

      {/* Form card */}
      <div className="container max-w-xl py-12 px-4">

        {status === "sent" ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <CheckCircle className="h-14 w-14 mx-auto mb-5" style={{ color: "#0F3154" }} />
            <h2 className="text-2xl font-bold mb-2">Message sent!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Thanks for reaching out. We'll get back to you at{" "}
              <strong className="text-foreground">{form.email}</strong> as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-8 space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  First Name <span style={{ color: "#DC373E" }}>*</span>
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Jane"
                  className={inputClass}
                  style={{ "--tw-ring-color": "#0F3154" } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Last Name <span style={{ color: "#DC373E" }}>*</span>
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Smith"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span style={{ color: "#DC373E" }}>*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="jane@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Message <span style={{ color: "#DC373E" }}>*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Tell us how we can help..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {status === "error" && (
              <p className="text-sm" style={{ color: "#DC373E" }}>
                Something went wrong. Please try again or email us directly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#0F3154" }}
            >
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              Or email us directly at{" "}
              <a href="mailto:info@anytime-soccer.com" className="font-semibold underline" style={{ color: "#0F3154" }}>
                info@anytime-soccer.com
              </a>
            </p>

          </form>
        )}
      </div>
    </div>
  );
}
