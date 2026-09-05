export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-navy-700 shadow-sm focus:ring-navy-500 ' +
                className
            }
        />
    );
}
