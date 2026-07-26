import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { FiMoon, FiSun, FiSave, FiBell } from "react-icons/fi";

export const Settings = () => {
  const {
    user,
    theme,
    setTheme,
    currentBranch,
    setCurrentBranch,
    currentShift,
    setCurrentShift,
    notifications,
    clearNotifications,
    showToast,
  } = useContext(AppContext);
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [branch, setBranch] = useState(currentBranch);
  const [shift, setShift] = useState(currentShift);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    setDisplayName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const saveProfile = (event) => {
    event.preventDefault();

    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
      }
    }

    setCurrentBranch(branch);
    setCurrentShift(shift);
    showToast(
      "Settings Saved",
      "Profile preferences updated in demo storage.",
      "success",
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <section className="card">
        <div className="card-title">Appearance</div>
        <div className="settings-row">
          <div>
            <div className="setting-label">Theme</div>
            <div className="setting-hint">
              Switch instantly between light and dark mode.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <FiMoon /> : <FiSun />}{" "}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-title">Profile & Shift</div>
          <form onSubmit={saveProfile} className="settings-form">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  className="form-control"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select
                  className="form-control"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                >
                  <option>Main Bakery - Colombo</option>
                  <option>Branch Bakery - Kandy</option>
                  <option>Branch Bakery - Galle</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Shift</label>
                <select
                  className="form-control"
                  value={shift}
                  onChange={(event) => setShift(event.target.value)}
                >
                  <option>Day Shift</option>
                  <option>Night Shift</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit">
              <FiSave /> Save Profile
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-title">Notifications</div>
          <div className="settings-row">
            <div>
              <div className="setting-label">Enable alerts</div>
              <div className="setting-hint">
                Keep live stock and QC warnings visible.
              </div>
            </div>
            <button
              type="button"
              className={`btn ${notificationsEnabled ? "btn-success" : "btn-secondary"}`}
              onClick={() => setNotificationsEnabled((value) => !value)}
            >
              <FiBell /> {notificationsEnabled ? "Enabled" : "Muted"}
            </button>
          </div>

          <div className="settings-row" style={{ marginTop: "16px" }}>
            <div>
              <div className="setting-label">Current system notifications</div>
              <div className="setting-hint">
                Unread items:{" "}
                {notifications.filter((item) => item.unread).length}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearNotifications}
            >
              Mark All Read
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
