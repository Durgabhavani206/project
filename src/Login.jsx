import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import "./Login.css";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginData: { email: "", password: "" },
      signupData: { name: "", email: "", password: "", role: "" },
      action: "Login",
      redirectTo: null,
    };
  }

  handleChange = (e, type) => {
    const { name, value } = e.target;
    this.setState({
      [type]: { ...this.state[type], [name]: value },
    });
  };

  login = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) =>
        u.email === this.state.loginData.email &&
        u.password === this.state.loginData.password
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      this.setState({
        redirectTo: user.role === "Teacher" ? "/teacher" : "/student",
      });
    } else {
      alert("Invalid credentials");
    }
  };

  signup = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(this.state.signupData);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup Successful!");
    this.setState({ action: "Login" });
  };

  render() {
    if (this.state.redirectTo) {
      return <Navigate to={this.state.redirectTo} />;
    }

    return (
      <div className="container">
        <div className="login-box">
          <h2>{this.state.action}</h2>

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
              <p onClick={() => this.setState({ action: "Signup" })}>
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
              <select
                name="role"
                onChange={(e) => this.handleChange(e, "signupData")}
              >
                <option value="">Select Role</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
              <button onClick={this.signup}>Signup</button>
              <p onClick={() => this.setState({ action: "Login" })}>
                Already have account? Login
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
}
