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

export function FormControl({ className, children, ...props }: MuiMockProps) {
  return <div className={`flex flex-col gap-1 ${className || ''}`} {...props}>{children}</div>;
}

export function FormControlLabel({ control, label, className }: MuiMockProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className || ''}`}>
      {control}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

export function FormHelperText({ error, children }: MuiMockProps) {
  if (!children) return null;
  return <span className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>{children}</span>;
}

export function InputLabel({ id, children, className }: MuiMockProps) {
  return <label id={id} className={`text-sm font-medium text-gray-700 ${className || ''}`}>{children}</label>;
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
          // @ts-ignore
          checked: child.props.value === value,
        });
      })}
    </div>
  );
}

export function Select({ labelId, id, value, onChange, children, className, fullWidth, renderValue, displayEmpty, multiple, ...props }: MuiMockProps) {
  return (
    <select 
      id={id} 
      value={value} 
      onChange={onChange} 
      multiple={multiple}
      className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${fullWidth ? 'w-full' : ''} ${className || ''}`}
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

export function TextField({ value, onChange, className, type="text", id, placeholder, defaultValue, fullWidth, multiline, rows, required, label, error, helperText, ...props }: MuiMockProps) {
  const inputClass = `border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${fullWidth ? 'w-full' : ''} ${error ? 'border-red-500' : 'border-gray-300'} ${className || ''}`;
  
  const InputEl = multiline ? (
    <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} defaultValue={defaultValue} rows={rows || 3} required={required} className={inputClass} {...props} />
  ) : (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} defaultValue={defaultValue} required={required} className={inputClass} {...props} />
  );

  if (!label && !helperText) return InputEl;

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {InputEl}
      {helperText && <span className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>{helperText}</span>}
    </div>
  );
}

export function Typography({ component: Component = "p", id, className, children, ...props }: MuiMockProps) {
  return <Component id={id} className={className} {...props}>{children}</Component>;
}
