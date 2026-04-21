import React from 'react';

const InputType = ({labelText, labelFor, inputType, value, onChange, name, placeholder, maxLength}) => {
  return (
    <>
        <div className="mb-1">
            <label form-label>{labelText}</label>
            <input type={inputType} className="form-control" name={name} value={value} maxLength={maxLength} onChange={onChange} placeholder={placeholder}/>
        </div>
    </>
  );
};

export default InputType;
 