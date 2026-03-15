export function StatsSection() {
  const stats = [
    { value: "2,400+", label: "Enterprise clients" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "50M+", label: "Risks assessed" },
    { value: "<30s", label: "Avg. response time" },
  ]

  return (
    <section className="py-20 px-6 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-semibold tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
