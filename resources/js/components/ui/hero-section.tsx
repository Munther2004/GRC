import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Activity, Lock } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(180,120,80,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(180,120,80,0.05),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-accent">Real-time Risk Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-balance">
              Risk clarity.
              <br />
              <span className="text-muted-foreground">Compliance confidence.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              The modern GRC platform that transforms how enterprises identify, assess, and mitigate risk. Built for teams who move fast.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group" asChild>
                <Link href="/admin">
                  Start free trial
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Request demo
              </Button>
            </div>
            
            <div className="pt-8 flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
          
          {/* Right column - Visual */}
          <div className="relative lg:h-150">
            <div className="absolute inset-0 bg-foreground rounded-2xl overflow-hidden">
              {/* Mock dashboard preview */}
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-background/40 text-xs">sentinel.app/dashboard</div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {/* Risk Score Card */}
                  <div className="bg-background/10 rounded-xl p-4 space-y-3">
                    <div className="text-background/60 text-xs uppercase tracking-wider">Risk Score</div>
                    <div className="text-4xl font-bold text-background">72</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-amber-400">+4.2%</span>
                      <span className="text-background/40">vs last month</span>
                    </div>
                    <div className="h-2 bg-background/10 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-amber-500 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Compliance Status */}
                  <div className="bg-background/10 rounded-xl p-4 space-y-3">
                    <div className="text-background/60 text-xs uppercase tracking-wider">Compliance</div>
                    <div className="text-4xl font-bold text-background">94%</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-background/60">GDPR</span>
                        <span className="text-green-400">98%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-background/60">HIPAA</span>
                        <span className="text-green-400">92%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Heat Map */}
                  <div className="col-span-2 bg-background/10 rounded-xl p-4">
                    <div className="text-background/60 text-xs uppercase tracking-wider mb-4">Risk Heat Map</div>
                    <div className="grid grid-cols-6 gap-1">
                      {[0.3, 0.8, 0.5, 0.2, 0.6, 0.9, 0.4, 0.7, 0.3, 0.5, 0.8, 0.2, 0.6, 0.4, 0.9, 0.3, 0.7, 0.5, 0.8, 0.2, 0.6, 0.4, 0.7, 0.3].map((intensity, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-sm"
                          style={{
                            backgroundColor: intensity > 0.7 
                              ? 'rgb(239, 68, 68)' 
                              : intensity > 0.4 
                              ? 'rgb(251, 191, 36)' 
                              : 'rgb(34, 197, 94)',
                            opacity: 0.3 + intensity * 0.7
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Activity Indicator */}
                  <div className="col-span-2 bg-background/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-background/60" />
                        <div>
                          <div className="text-background text-sm font-medium">Live Monitoring</div>
                          <div className="text-background/40 text-xs">23 active alerts</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[18, 24, 14, 28, 20].map((height, i) => (
                          <div
                            key={i}
                            className="w-1 bg-green-400 rounded-full animate-pulse"
                            style={{ 
                              height: `${height}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
