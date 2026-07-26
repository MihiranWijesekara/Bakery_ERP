import React from 'react';

export const Input = ({ label, id, name, type = 'text', required, error, register, ...props }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id || name}>
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id || name}
        name={name}
        className={`form-control ${error ? 'error' : ''}`}
        {...(register ? register(name, { required }) : {})}
        {...props}
      />
      {error && <div className="form-error-msg">{error}</div>}
    </div>
  );
};

export const Select = ({ label, id, name, required, error, options = [], register, ...props }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id || name}>
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        className={`form-control ${error ? 'error' : ''}`}
        {...(register ? register(name, { required }) : {})}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="form-error-msg">{error}</div>}
    </div>
  );
};

export const TextArea = ({ label, id, name, required, error, register, ...props }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id || name}>
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <textarea
        id={id || name}
        name={name}
        className={`form-control ${error ? 'error' : ''}`}
        rows="3"
        {...(register ? register(name, { required }) : {})}
        {...props}
      />
      {error && <div className="form-error-msg">{error}</div>}
    </div>
  );
};

export const Checkbox = ({ label, id, name, register, ...props }) => {
  return (
    <div className="form-group">
      <label className="checkbox-group" htmlFor={id || name}>
        <input
          type="checkbox"
          id={id || name}
          name={name}
          className="checkbox-input"
          {...(register ? register(name) : {})}
          {...props}
        />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
      </label>
    </div>
  );
};
