import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import "./Login.css";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginData: { email: "", password: "" },
      signupData: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: ""
      },
      action: "Login",
      redirectTo: null,
      error: ""
    };
  }

  handleChange = (e, type) => {
    const { name, value } = e.target;
    this.setState({
      [type]: { ...this.state[type], [name]: value }
    });
  };

  /* ================= LOGIN ================= */

  login = () => {
    const { email, password } = this.state.loginData;

    if (!email.trim() || !password.trim()) {
      this.setState({ error: "Please fill all fields" });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      this.setState({ error: "Invalid credentials" });
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));

    this.setState({
      redirectTo: user.role === "Teacher" ? "/teacher" : "/student",
      error: ""
    });
  };

  /* ================= SIGNUP ================= */

  signup = () => {
    const { name, email, password, confirmPassword, role } =
      this.state.signupData;

    // 1️⃣ Required fields
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !role
    ) {
      this.setState({ error: "Please fill all required fields" });
      return;
    }

    // 2️⃣ Password strength
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

    if (!strongPassword.test(password)) {
      this.setState({
        error:
          "Password must include uppercase, lowercase, number & special character"
      });
      return;
    }

    // 3️⃣ Password match
    if (password !== confirmPassword) {
      this.setState({ error: "Passwords do not match" });
      return;
    }

    // 4️⃣ Duplicate email
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      this.setState({ error: "Email already registered" });
      return;
    }

    // 5️⃣ Save user
    users.push({ name, email, password, role });

    localStorage.setItem("users", JSON.stringify(users));

    this.setState({
      action: "Login",
      error: ""
    });

    alert("Signup Successful!");
  };

  /* ================= RENDER ================= */

  render() {
    if (this.state.redirectTo) {
      return <Navigate to={this.state.redirectTo} />;
    }

    return (
      <div className="container">
        <div className="login-box">
          <h2>{this.state.action}</h2>

          {/* ERROR MESSAGE */}
          {this.state.error && (
            <div className="error-box">
              ⚠ {this.state.error}
            </div>
          )}

          {this.state.action === "Login" ? (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={(e) => this.handleChange(e, "loginData")}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={(e) => this.handleChange(e, "loginData")}
              />
              <button onClick={this.login}>Login</button>
              <p onClick={() => this.setState({ action: "Signup", error: "" })}>
                Don't have account? Signup
              </p>
            </>
          ) : (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={(e) => this.handleChange(e, "signupData")}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={(e) => this.handleChange(e, "signupData")}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={(e) => this.handleChange(e, "signupData")}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={(e) => this.handleChange(e, "signupData")}
              />
              <select
                name="role"
                onChange={(e) => this.handleChange(e, "signupData")}
              >
                <option value="">Select Role</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
              <button onClick={this.signup}>Signup</button>
              <p onClick={() => this.setState({ action: "Login", error: "" })}>
                Already have account? Login
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
}