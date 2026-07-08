import React from "react";

type MuiMockProps = {
  [key: string]: any;
  onChange?: React.ChangeEventHandler<any>;
  onClick?: React.MouseEventHandler<any>;
};

export function Box({ component: Component = "div", children, className, id, onSubmit, ...props }: MuiMockProps) {
  return <Component className={className} id={id} onSubmit={onSubmit} {...props}>{children}</Component>;
}

export function Button({ type = "button", onClick, disabled, className, children, ...props }: MuiMockProps) {
  return <button type={type} onClick={onClick} disabled={disabled} className={className} {...props}>{children}</button>;
}

export function Divider({ className }: MuiMockProps) {
  return <hr className={`border-t border-gray-300 ${className || ''}`} />;
}

export function FormControl({ className, children, fullWidth, error, variant, ...props }: MuiMockProps) {
  return <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''} ${className || ''}`} {...props}>{children}</div>;
}

export function FormControlLabel({ control, label, className }: MuiMockProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className || ''}`}>
      {control}
      <span className="text-sm font-medium text-[#F5F0E8]">{label}</span>
    </label>
  );
}

export function FormHelperText({ error, children }: MuiMockProps) {
  if (!children) return null;
  return <span className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>{children}</span>;
}

export function InputLabel({ id, children, className }: MuiMockProps) {
  return <label id={id} className={`text-xs font-semibold uppercase tracking-wider text-[#E5C07B] ${className || ''}`}>{children}</label>;
}

export function MenuItem({ value, children, className, ...props }: MuiMockProps) {
  return <option value={value} className={className} {...props}>{children}</option>;
}

export function Modal({ open, onClose, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, children }: MuiMockProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose as any}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        aria-labelledby={ariaLabelledBy} 
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </div>
    </div>
  );
}

export function Radio({ value, ...props }: MuiMockProps) {
  return <input type="radio" value={value} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" {...props} />;
}

export function RadioGroup({ value, onChange, children, className }: MuiMockProps) {
  return (
    <div className={`flex flex-col gap-2 ${className || ''}`} onChange={onChange}>
      {React.Children.map(children, (child: any) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          // @ts-expect-error TS: mock component may not expose strongly typed props.value at this point.
          checked: child.props.value === value,
        });
      })}
    </div>
  );
}

export function Select({ labelId, id, value, onChange, children, className, fullWidth, renderValue, displayEmpty, multiple, error, variant, label, ...props }: MuiMockProps) {
  return (
    <select 
      id={id} 
      value={value} 
      onChange={onChange} 
      multiple={multiple}
      className={`appearance-none bg-[image:url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23E5C07B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em] pr-10 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5C07B]/15 focus:border-[#E5C07B] bg-white/5 text-[#F5F0E8] transition-all duration-200 ${fullWidth ? 'w-full' : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Switch({ checked, onChange, disabled, ...props }: MuiMockProps) {
  return (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      disabled={disabled}
      className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 appearance-none relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
      {...props} 
    />
  );
}

export function TextField({ 
  value, 
  onChange, 
  className, 
  type="text", 
  id, 
  placeholder, 
  defaultValue, 
  fullWidth, 
  multiline, 
  rows, 
  minRows,
  maxRows,
  minrows,
  maxrows,
  required, 
  label, 
  error, 
  helperText, 
  slotProps,
  inputProps,
  InputProps,
  ...props 
}: MuiMockProps) {
  const inputClass = `border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5C07B]/15 focus:border-[#E5C07B] bg-white/5 text-[#F5F0E8] placeholder-white/30 transition-all duration-200 ${fullWidth ? 'w-full' : ''} ${error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/15' : ''} ${className || ''}`;
  
  const htmlInputProps = {
    ...inputProps,
    ...slotProps?.htmlInput,
  };
  
  const InputEl = multiline ? (
    <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} defaultValue={defaultValue} rows={rows || minRows || minrows || 3} required={required} className={inputClass} {...htmlInputProps} {...props} />
  ) : (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} defaultValue={defaultValue} required={required} className={inputClass} {...htmlInputProps} {...props} />
  );

  if (!label && !helperText) return InputEl;

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-[#E5C07B]">{label}</label>}
      {InputEl}
      {helperText && <span className={`text-xs ${error ? 'text-red-500' : 'text-[#6b4c35]/60'}`}>{helperText}</span>}
    </div>
  );
}

export function Typography({ component: Component = "p", id, className, children, ...props }: MuiMockProps) {
  return <Component id={id} className={className} {...props}>{children}</Component>;
}
