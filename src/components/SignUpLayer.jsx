"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import apiService from "@/lib/ApiService";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await apiService.signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
        }
      );

      if (error) throw error;

      if (data.user && data.session) {
        router.push("/");
      } else {
        setSuccess("Registration successful! Please check your email to confirm your account.");
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          fullName: "",
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred during sign-up");
      console.error("Sign-up error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          <img src="/assets/images/auth/auth.png" alt="auth" />
        </div>
      </div>
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <div>
            <Link href="/" className="mb-40 max-w-290-px">
              <img src="/assets/images/bursopuri.png" alt="bursopuri" />
            </Link>
            <h4 className="mb-12">Sign Up to your Account</h4>
            <p className="mb-32 text-secondary-light text-lg">
              Welcome! Please enter your details
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mb-3 text-sm">{error}</div>
          )}
          {success && (
            <div className="alert alert-success mb-3 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="f7:person" />
              </span>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Full Name"
              />
            </div>

            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email"
              />
            </div>

            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:lock-password-outline" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Password"
              />
            </div>

            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:lock-password-outline" />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Confirm Password"
              />
            </div>

            <div className="form-check style-check d-flex align-items-start mb-16">
              <input
                className="form-check-input border border-neutral-300 mt-4"
                type="checkbox"
                required
                id="condition"
              />
              <label className="form-check-label text-sm" htmlFor="condition">
                By creating an account, you agree to our{" "}
                <Link href="#" className="text-primary-600 fw-semibold">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary-600 fw-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <Icon icon="lucide:loader" className="animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="mt-32 text-center text-sm">
              <p className="mb-0">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-primary-600 fw-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
