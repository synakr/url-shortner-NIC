import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login({
        identifier,
        password,
      });

      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="border p-6 rounded w-80"
      >
        <h1 className="text-2xl mb-4">Login</h1>

        <input
          type="text"
          placeholder="Email or Username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="border w-full p-2 mb-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="border w-full p-2 mb-3"
          required
        />

        {error && (
          <p className="text-red-500 mb-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white w-full p-2"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
