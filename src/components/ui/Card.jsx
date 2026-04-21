export default function Card({ children, className = '', as: Tag = 'section', ...rest }) {
  return (
    <Tag
      className={`bg-card border border-line rounded-2xl shadow-card ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
