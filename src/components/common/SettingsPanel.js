import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

function SettingsPanel() {
  const { preference, setPreference, reduceMotion, setReduceMotion } =
    useTheme();

  return (
    <section className="ds-page-stack" aria-labelledby="settings-title">
      <header className="ds-section-head">
        <h2 id="settings-title">Display & Accessibility</h2>
        <p>Control theme behavior and animation preferences.</p>
      </header>

      <div className="ds-card">
        <h3 className="ds-card-title">Theme Mode</h3>
        <p className="ds-card-subtitle">
          Use system defaults or override manually.
        </p>

        <fieldset
          className="ds-radio-group"
          role="radiogroup"
          aria-label="Theme mode"
        >
          {[
            { value: "system", label: "Match system" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ].map((option) => (
            <label key={option.value} className="ds-radio-card">
              <input
                type="radio"
                name="theme-mode"
                value={option.value}
                checked={preference === option.value}
                onChange={(event) => setPreference(event.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className="ds-card">
        <h3 className="ds-card-title">Motion</h3>
        <p className="ds-card-subtitle">
          Reduce animations if you prefer a calmer UI.
        </p>

        <label className="ds-switch" htmlFor="reduce-motion-toggle">
          <input
            id="reduce-motion-toggle"
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => setReduceMotion(event.target.checked)}
          />
          <span>Reduce motion</span>
        </label>
      </div>
    </section>
  );
}

export default SettingsPanel;
