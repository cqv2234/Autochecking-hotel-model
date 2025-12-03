function UserInput({
  title,
  type,
  id,
  name,
  classNameLabel,
  classNameInput,
  ...props
}) {
  return (
    <>
      <label htmlFor={id} className={classNameLabel}>
        {title}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        className={classNameInput}
        {...props}
        required
      />
    </>
  )
}

export default UserInput
