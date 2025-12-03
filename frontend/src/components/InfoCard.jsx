function InfoCard({ children, title, content }) {
  return (
    <div className="w-110 p-3 flex items-center">
      <div>{children}</div>
      <div className="ml-4">
        <p className="font-bold text-xl text-orange-400">{title}</p>
        <p>{content}</p>
      </div>
    </div>
  )
}

export default InfoCard
