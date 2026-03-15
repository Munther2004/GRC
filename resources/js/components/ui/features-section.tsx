import { Shield, BarChart3, FileCheck, Bell, Network, Lock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Automated risk identification and scoring with AI-powered threat detection across your entire organization."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Dynamic dashboards and heat maps that visualize your risk posture at a glance. Make decisions faster."
    },
    {
      icon: FileCheck,
      title: "Compliance Automation",
      description: "Stay compliant with SOC 2, GDPR, HIPAA, and ISO frameworks. Automated evidence collection and reporting."
    },
    {
      icon: Bell,
      title: "Alert Management",
      description: "Intelligent alerting that prioritizes what matters. Reduce noise, focus on critical issues."
    },
    {
      icon: Network,
      title: "Vendor Risk",
      description: "Continuous monitoring of third-party vendors. Assess, track, and manage supply chain risk."
    },
    {
      icon: Lock,
      title: "Policy Management",
      description: "Centralized policy library with version control, approvals, and automated distribution."
    }
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-balance">
            Everything you need to manage risk
          </h2>
          <p className="text-lg text-muted-foreground">
            A unified platform that brings together governance, risk, and compliance into a single source of truth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                <feature.icon className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
