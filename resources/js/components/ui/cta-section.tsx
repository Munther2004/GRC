import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-foreground rounded-2xl p-12 md:p-16 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-background mb-4 text-balance">
              Ready to transform your risk management?
            </h2>
            <p className="text-background/70 text-lg mb-8">
              Join thousands of enterprises who trust Sentinel to protect their business. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 group" asChild>
                <Link href="/admin">
                  Start free trial
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-background/30 text-background hover:bg-background/10">
                Talk to sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
