"use client";

import { useState } from "react";
import { requestMagicLink } from "@/app/lib/magiclink";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <div className="mx-auto space-y-6 max-w-2xl">
      <h1 className="mb-4 text-xl">6.S913 Login</h1>

      <div className="p-4 max-w-sm border">
        {sent ? (
          <div className="text-sm">
            <p>
              A sign-in link has been sent to{" "}
              <span className="font-mono">{email}</span>.
            </p>

            <p className="mt-3 text-xs text-gray-600">
              Delivery to <code>@mit.edu</code> addresses may take a few
              minutes. Please check your <strong>Spam / Junk</strong> folder if
              you don&rsquo;t see the email.
            </p>

            <p className="mt-2 text-xs text-gray-600">
              The email is sent from{" "}
              <span className="font-mono">no-reply@mit.junic.kim</span>.
            </p>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(undefined);

              const res = await requestMagicLink(email);
              if (res.ok) {
                setSent(true);
              } else {
                setError(res.reason);
              }
            }}
          >
            <label className="block mb-1 text-sm">MIT email</label>

            <input
              type="email"
              className="py-1 px-2 w-full text-sm border"
              placeholder="kerberos@mit.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="mt-3">
              <button type="submit" className="text-sm text-blue-600 underline">
                Send sign-in link
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Automated emails to MIT addresses may be filtered or delayed.
            </p>

            {error && (
              <p className="mt-2 text-sm text-red-700">
                Unable to send sign-in link. {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
