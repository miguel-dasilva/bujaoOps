import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

type FieldMeta = {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
};

function controlProps({ name, hint, errors }: FieldMeta) {
  return {
    id: name,
    name,
    "aria-invalid": errors?.length ? true : undefined,
    "aria-describedby": errors?.length ? `${name}-error` : hint ? `${name}-hint` : undefined,
  };
}

function FieldFrame({
  label,
  name,
  hint,
  errors,
  children,
}: FieldMeta & { children: React.ReactNode }) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {errors?.length ? (
        <FieldError id={`${name}-error`}>{errors[0]}</FieldError>
      ) : hint ? (
        <FieldDescription id={`${name}-hint`}>{hint}</FieldDescription>
      ) : null}
    </Field>
  );
}

export function TextField({
  label,
  name,
  hint,
  errors,
  ...input
}: React.ComponentProps<"input"> & FieldMeta) {
  const meta = { label, name, hint, errors };
  return (
    <FieldFrame {...meta}>
      <Input {...controlProps(meta)} {...input} />
    </FieldFrame>
  );
}

export function SelectField({
  label,
  name,
  hint,
  errors,
  options,
  ...select
}: Omit<React.ComponentProps<"select">, "size"> &
  FieldMeta & { options: { value: string; label: string }[] }) {
  const meta = { label, name, hint, errors };
  return (
    <FieldFrame {...meta}>
      <NativeSelect {...controlProps(meta)} {...select}>
        {options.map((o) => (
          <NativeSelectOption key={o.value} value={o.value}>
            {o.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </FieldFrame>
  );
}
