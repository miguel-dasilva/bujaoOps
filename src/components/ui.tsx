import Link from "next/link";

// Primitivos mínimos. Quando instalares o shadcn/ui (semana 2),
// os formulários passam a usar os componentes dele.

const buttonBase =
  "inline-flex min-h-12 items-center justify-center rounded-md px-5 text-base font-bold transition-colors disabled:opacity-60";
const variants = {
  primary: "bg-atlantico text-white hover:bg-atlantico/90",
  quiet: "border border-linha bg-white text-basalto hover:bg-nevoa",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button className={`${buttonBase} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: React.ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return <Link className={`${buttonBase} ${variants[variant]} ${className}`} {...props} />;
}

export function Field({
  label,
  name,
  hint,
  errors,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
}) {
  const describedBy = errors?.length ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="font-bold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        className="min-h-12 rounded-md border border-linha bg-white px-3 text-lg aria-invalid:border-perda"
        {...input}
      />
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm text-perda">
          {errors[0]}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-sm text-rocha">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
